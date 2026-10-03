import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="pt-4 pb-3 text-center max-w-xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
        Simulador de Golpes Digitais
      </h1>
      <p className="text-xs sm:text-sm text-[#86868b] mt-1">
        Analise a mensagem, use as ferramentas de investigação e emita seu veredito.
      </p>
    </section>
  );
};
