import React from 'react';

interface HeroProps {
  progressPercentage?: number;
  completedCount?: number;
}

export const Hero: React.FC<HeroProps> = () => {
  return (
    <section className="pt-8 pb-6 text-center max-w-2xl mx-auto space-y-3">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-[#86868b]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#30d158]" />
        Simulador Educativo • Laboratório de Extensão Comunitária
      </div>
      <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-white leading-tight">
        Aprenda a identificar golpes antes de clicar.
      </h1>
      <p className="text-[#86868b] text-sm sm:text-base font-normal leading-relaxed max-w-xl mx-auto">
        Examine mensagens reais, consulte pistas periciais como WHOIS e chaves PIX, e descubra se a comunicação é segura ou uma armadilha.
      </p>
    </section>
  );
};
