import React from 'react';
import { ShieldCheck, Search, Award, Users } from 'lucide-react';

interface HeroProps {
  progressPercentage?: number;
  completedCount?: number;
}

export const Hero: React.FC<HeroProps> = () => {
  return (
    <section className="pt-6 pb-6 text-center max-w-3xl mx-auto space-y-4">
      {/* Tag de identificação simples */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
        <Users className="w-3.5 h-3.5" />
        <span>Simulador para Famílias, Jovens e Adultos</span>
      </div>

      {/* Título direto e acolhedor */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
        Descubra se a Mensagem é{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-emerald-400">
          Golpe ou Segura
        </span>
      </h1>

      {/* Subtítulo claro sem jargões */}
      <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
        Coloque seus sentidos à prova com mensagens reais de WhatsApp, SMS e ligações do dia a dia. Inspecione as pistas com o Kit do Investigador e aprenda a se proteger sem complicação.
      </p>

      {/* 3 destaques objetivos */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-1 text-xs text-slate-400 font-medium">
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>9 Casos do Dia a Dia</span>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
          <Search className="w-3.5 h-3.5 text-blue-400" />
          <span>Kit de Investigação</span>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Certificado & Conquistas</span>
        </div>
      </div>
    </section>
  );
};
