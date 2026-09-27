import React from 'react';
import { ShieldCheck, Search, Award, Users } from 'lucide-react';

interface HeroProps {
  progressPercentage?: number;
  completedCount?: number;
}

export const Hero: React.FC<HeroProps> = () => {
  return (
    <section className="pt-10 pb-8 text-center max-w-2xl mx-auto space-y-4">
      {/* Apple Pill Tag */}
      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[#86868b] hover:text-[#d2d2d7] text-xs font-normal transition">
        <Users className="w-3.5 h-3.5 text-[#2997ff]" />
        <span>Para Famílias, Jovens e Adultos</span>
      </div>

      {/* Apple Headline with Elegant Gradient */}
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
        Descubra se a mensagem é{' '}
        <span className="apple-headline block sm:inline">
          golpe ou segura.
        </span>
      </h1>

      {/* Subtitle in Apple Typography */}
      <p className="text-[#86868b] text-base sm:text-lg leading-relaxed max-w-xl mx-auto font-normal">
        Casos reais de WhatsApp, SMS e ligações cotidianas. Investigue as pistas com laudos forenses e aprenda a blindar quem você ama.
      </p>

      {/* Apple Capsule Highlights */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2 text-xs text-[#86868b] font-normal">
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#30d158]" />
          <span>9 Casos Cotidianos</span>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
          <Search className="w-3.5 h-3.5 text-[#2997ff]" />
          <span>Kit de Investigação</span>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
          <Award className="w-3.5 h-3.5 text-[#ff9f0a]" />
          <span>Conquistas & Certificado</span>
        </div>
      </div>
    </section>
  );
};
