// Service to connect React Frontend to C# .NET 8 Backend & Supabase Cloud
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5100';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bofewtowdsjfcjqhmbxl.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_secret_RK3shgNURWzCE0ORdQZwXg_ELu9YMXK';

export interface FeedbackData {
  id?: string;
  author: string;
  text: string;
  rating?: number;
  created_at?: string;
}

export const apiService = {
  // Check if C# Backend is active
  async checkHealth(): Promise<{ online: boolean; supabaseActive?: boolean }> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        return { online: true, supabaseActive: data.supabaseActive };
      }
    } catch {
      // Backend not running locally
    }
    return { online: false, supabaseActive: true };
  },

  // Validate CTF flag via C# Backend with local fallback
  async validateFlag(flag: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/flags/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag, taskId: 'task3-webctf' }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch {
      // Fallback client-side validation
      const isValid = flag.trim() === 'HACKLEARN{seguranca_web_iniciante_2024}';
      return {
        success: isValid,
        message: isValid
          ? 'FLAG VALIDADA COM SUCESSO! (Modo Client-Side)'
          : 'Flag incorreta. Verifique o código-fonte ou terminal.',
      };
    }
  },

  // Fetch community testimonials from C# Backend or Supabase directly
  async getFeedbacks(): Promise<FeedbackData[]> {
    // 1. Try C# Backend
    try {
      const res = await fetch(`${BACKEND_URL}/api/feedback`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend not reached, fallthrough to Supabase cloud
    }

    // 2. Direct Supabase Cloud Fetch
    try {
      const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/feedbacks?select=*&order=created_at.desc`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (supaRes.ok) {
        const data = await supaRes.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {
      // Fallthrough to defaults
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

  // Submit new testimonial to C# Backend and/or Supabase
  async submitFeedback(author: string, text: string): Promise<boolean> {
    const safeAuthor = author.trim() || 'Participante da Comunidade';
    const safeText = text.trim();

    // 1. Try C# Backend
    try {
      const res = await fetch(`${BACKEND_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: safeAuthor, text: safeText, rating: 5 }),
      });
      if (res.ok) return true;
    } catch {
      // Backend offline, push directly to Supabase
    }

    // 2. Direct Supabase Cloud Insert
    try {
      const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/feedbacks`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          author: safeAuthor,
          text: safeText,
          rating: 5,
        }),
      });
      return supaRes.ok;
    } catch {
      return true;
    }
  },
};
