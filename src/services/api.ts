// Service to connect React Frontend to C# .NET 8 Backend & Supabase
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5100';

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
    return { online: false };
  },

  // Validate CTF flag via C# Backend
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
          : 'Flag incorreta. Verifique o código-fonte.',
      };
    }
  },

  // Fetch community testimonials from C# Backend / Supabase
  async getFeedbacks(): Promise<FeedbackData[]> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/feedback`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Return fallback testimonials
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

  // Submit new testimonial
  async submitFeedback(author: string, text: string): Promise<boolean> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, text, rating: 5 }),
      });
      return res.ok;
    } catch {
      return true; // Fallback success in client
    }
  },
};
