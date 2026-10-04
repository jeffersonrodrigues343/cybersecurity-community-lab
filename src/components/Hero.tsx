import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="hidden sm:block pt-3 pb-1 text-center max-w-2xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-desk-2 border border-desk-line text-clip text-xs font-mono tracking-wider uppercase mb-2">
        <span className="w-2 h-2 rounded-full bg-safe animate-pulse" />
        Treinamento Prático de Defesa Digital
      </div>
      <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
        Simulador de Golpes
      </h1>
      <p className="mt-1 sm:mt-2 text-xs sm:text-base text-clip max-w-lg mx-auto">
        Analise a mensagem real. Inspecione as pistas. <span className="marker text-ink font-semibold">Dê o seu veredito.</span>
      </p>
    </section>
  );
};
