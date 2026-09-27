import React from 'react';

interface HeroProps {
  progressPercentage?: number;
  completedCount?: number;
}

export const Hero: React.FC<HeroProps> = () => {
  return (
    <section className="pt-6 pb-2 text-center max-w-lg mx-auto space-y-1">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
        Simulador Anti-Golpes
      </h1>
      <p className="text-[#86868b] text-xs sm:text-sm font-normal">
        Investigue as evidências reais da mensagem e emita seu veredito.
      </p>
    </section>
  );
};
