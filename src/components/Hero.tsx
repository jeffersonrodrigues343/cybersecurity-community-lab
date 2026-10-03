import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="pt-6 pb-6 text-center max-w-xl mx-auto -skew-x-3">
      <div className="inline-block bg-[#00ffff] px-4 py-1 border-4 border-black shadow-[4px_4px_0_0_#ff007f] mb-2 transform -rotate-2">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-black uppercase">
          Simulador de Golpes
        </h1>
      </div>
      <p className="text-xs sm:text-sm font-bold text-white bg-black inline-block px-3 py-1 border-2 border-[#00ffff] transform rotate-1">
        Analise a mensagem. Ache a farsa. Dê o Veredito.
      </p>
    </section>
  );
};
