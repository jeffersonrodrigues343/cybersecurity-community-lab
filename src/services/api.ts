// comunicacao do front com a api c# e supabase
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5100';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bofewtowdsjfcjqhmbxl.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface FeedbackData {
  id?: string;
  author: string;
  text: string;
  rating?: number;
  created_at?: string;
}

// hash sha-256 da flag pra nao deixar a resposta em texto claro no bundle do js
const FLAG_SHA256 = '6861d1fc0c348cf615df8822c737299c5b72d6844b5d2dadcc11d0fb2fbfb37f';

async function computeSha256(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface GameResult {
  age_group: 'young' | 'adult' | 'senior';
  gender: 'female' | 'male';
  case_id: string;
  is_scam: boolean;
  correct: boolean;
  clues_inspected: number;
}

export interface AgeSummary {
  age_group: GameResult['age_group'];
  attempts: number;
  correct: number;
  avgClues: number;
}

const LOCAL_RESULTS_KEY = 'hacklearn_results';

const readLocalResults = (): GameResult[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_RESULTS_KEY) || '[]');
  } catch {
    return [];
  }
};

export const summarizeByAge = (rows: GameResult[]): AgeSummary[] =>
  (['young', 'adult', 'senior'] as const).map((age) => {
    const g = rows.filter((r) => r.age_group === age);
    return {
      age_group: age,
      attempts: g.length,
      correct: g.filter((r) => r.correct).length,
      avgClues: g.length ? g.reduce((s, r) => s + r.clues_inspected, 0) / g.length : 0,
    };
  });

export const apiService = {
  // registra cada tentativa de veredito: local sempre, Supabase quando houver chave
  recordResult(result: GameResult) {
    try {
      const all = readLocalResults();
      all.push(result);
      localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(all.slice(-500)));
    } catch {}
    if (!SUPABASE_ANON_KEY) return;
    fetch(`${SUPABASE_URL}/rest/v1/game_results`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(result),
    }).catch(() => {});
  },

  // resultados de todos os jogadores (Supabase); sem chave, só os deste navegador
  async getResults(): Promise<{ rows: GameResult[]; source: 'online' | 'local' }> {
    if (SUPABASE_ANON_KEY) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/game_results?select=age_group,gender,case_id,is_scam,correct,clues_inspected&limit=10000`, {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        });
        if (res.ok) return { rows: await res.json(), source: 'online' };
      } catch {}
    }
    return { rows: readLocalResults(), source: 'local' };
  },


  // testa se a api local ta respondendo
  async checkHealth(): Promise<{ online: boolean; supabaseActive?: boolean }> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`);
      if (res.ok) {
        const data = await res.json();
        return { online: true, supabaseActive: data.supabaseConfigured };
      }
    } catch {
      // api c# nao ta rodando no momento
    }
    return { online: false, supabaseActive: false };
  },

  // valida a flag no backend
  async validateFlag(flag: string): Promise<{ success: boolean; message: string }> {
    const cleanFlag = flag.trim();

    try {
      const res = await fetch(`${BACKEND_URL}/api/flags/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag: cleanFlag, taskId: 'task3-webctf' }),
      });

      if (res.status === 429) {
        return {
          success: false,
          message: 'Muitas tentativas em pouco tempo. Aguarde um instante para tentar novamente.',
        };
      }

      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch {
      // fallback offline usando hash seguro pra nao expor o segredo no front
      const inputHash = await computeSha256(cleanFlag);
      const isValid = inputHash === FLAG_SHA256;

      return {
        success: isValid,
        message: isValid
          ? 'Parabéns! Flag correta, desafio concluído!'
          : 'Flag incorreta. Verifique o código inspecionado no DevTools.',
      };
    }
  },

  // busca os depoimentos da comunidade
  async getFeedbacks(): Promise<FeedbackData[]> {
    // tenta primeiro a api c#
    try {
      const res = await fetch(`${BACKEND_URL}/api/feedback`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // api offline
    }

    // se tiver anon key publica no env, tenta direto o supabase
    if (SUPABASE_ANON_KEY) {
      try {
        const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/feedbacks?select=*&order=created_at.desc`, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });
        if (supaRes.ok) {
          const data = await supaRes.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch {
        // falhou
      }
    }

    return [
      {
        id: '1',
        author: 'Lucas M. Silva (Comunidade de TI)',
        text: 'Achei a dinâmica dos desafios incrível para quem está começando. Consegui entender na prática como os criminosos montam links falsos.',
        created_at: new Date().toISOString(),
      },
    ];
  },

  // envia novo depoimento; retorna false se nenhum destino gravou (nunca finge sucesso)
  async submitFeedback(author: string, text: string): Promise<boolean> {
    const payload = JSON.stringify({
      author: author.trim() || 'Participante da Comunidade',
      text: text.trim(),
      rating: 5,
    });

    // backend em localhost só existe na máquina do dev; em produção pula direto pro Supabase
    const backendIsLocal = /localhost|127\.0\.0\.1/.test(BACKEND_URL);
    const runningLocally = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (!backendIsLocal || runningLocally) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });
        if (res.ok) return true;
      } catch {}
    }

    if (!SUPABASE_ANON_KEY) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/feedbacks`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: payload,
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
