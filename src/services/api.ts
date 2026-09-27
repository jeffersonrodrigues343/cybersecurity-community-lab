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

export const apiService = {
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

  // envia novo depoimento
  async submitFeedback(author: string, text: string): Promise<boolean> {
    const cleanAuthor = author.trim() || 'Participante da Comunidade';
    const cleanText = text.trim();

    try {
      const res = await fetch(`${BACKEND_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: cleanAuthor, text: cleanText, rating: 5 }),
      });
      return res.ok;
    } catch {
      // se a api estiver offline e tiver chave no env
      if (SUPABASE_ANON_KEY) {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/feedbacks`, {
            method: 'POST',
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ author: cleanAuthor, text: cleanText, rating: 5 }),
          });
          return res.ok;
        } catch {
          return true;
        }
      }
      return true;
    }
  },
};
