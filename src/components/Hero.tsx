import React from 'react';
import { ShieldAlert, Search, Award } from 'lucide-react';

interface HeroProps {
  progressPercentage?: number;
  completedCount?: number;
}

export const Hero: React.FC<HeroProps> = () => {
  return (
    <section className="pt-8 pb-6 text-center max-w-2xl mx-auto space-y-3.5">
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

      {/* Badges Intuitivos dos 3 Pilares */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#d2d2d7]">
          <ShieldAlert className="w-3.5 h-3.5 text-[#ff3b30]" />
          <span>9 Casos Reais</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#2997ff]" >
          <Search className="w-3.5 h-3.5 text-[#2997ff]" />
          <span>Auditoria Forense</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#d2d2d7]">
          <Award className="w-3.5 h-3.5 text-[#30d158]" />
          <span>Certificado Oficial</span>
        </div>
      </div>
    </section>
  );
};
