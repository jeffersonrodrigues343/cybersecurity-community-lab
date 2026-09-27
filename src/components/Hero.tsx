import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CyberCanvas3D } from './CyberCanvas3D';
import { ShieldCheck, Code, Globe, Sparkles } from 'lucide-react';

interface HeroProps {
  progressPercentage: number;
  completedCount: number;
}

export const Hero: React.FC<HeroProps> = ({ progressPercentage, completedCount }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const progressBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(badgesRef.current, {
        opacity: 0,
        y: -15,
        duration: 0.6,
      })
      .from(titleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
      }, '-=0.3')
      .from(descRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.6,
      }, '-=0.4')
      .from(progressBoxRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
      }, '-=0.3');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative pt-6 pb-10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Badges superiores */}
        <div ref={badgesRef} className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Simulador Pedagógico Ativo</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-xs font-medium">
            <Globe className="w-3.5 h-3.5" />
            <span>Top 10 Golpes no Brasil (FEBRABAN)</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Para Crianças, Jovens & Adultos</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-xs font-medium">
            <Code className="w-3.5 h-3.5" />
            <span>Extensão Universitária ADS</span>
          </span>
        </div>

        {/* Grade principal: texto e visualizador */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Apresentacao */}
          <div className="lg:col-span-7 space-y-4">
            <h1 ref={titleRef} className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Aprenda a Identificar os <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
                Golpes Virtuais no Brasil
              </span>
            </h1>

            <p ref={descRef} className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Ambiente pedagógico e gamificado desenvolvido para crianças, jovens, adultos e famílias. Aprenda com analogias lúdicas ou diretrizes bancárias reais (Mecanismo Especial de Devolução do Banco Central), investigue pistas forenses no Kit do Investigador e conquiste medalhas protegendo sua família.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-slate-400">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>3 Níveis (Básico, Médio, Avançado)</span>
              </div>
              <span>•</span>
              <div>9 Casos Reais</div>
              <span>•</span>
              <div>8 Conquistas Colecionáveis</div>
              <span>•</span>
              <div>Cartilha & Glossário</div>
            </div>
          </div>

          {/* Canvas 3D */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-2 overflow-hidden shadow-2xl">
              <div className="absolute top-3 left-4 flex items-center space-x-2 z-10 font-mono text-[11px] text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                <span className="ml-2 text-slate-500">canvas3d</span>
              </div>
              <CyberCanvas3D completedCount={completedCount} />
              <div className="text-center font-mono text-[11px] text-emerald-400/80 pb-2 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Visualizador 3D Interativo</span>
              </div>
            </div>
          </div>

        </div>

        {/* Global Progress Card with GSAP */}
        <div ref={progressBoxRef} className="mt-8 bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-mono text-xs">
            <span className="text-slate-300 font-semibold flex items-center space-x-2">
              <span>Progresso dos Casos:</span>
              <span className="text-emerald-400">
                {completedCount >= 9 ? '✓ TODOS OS 9 CASOS CONCLUÍDOS' : `${completedCount} de 9 situações analisadas`}
              </span>
            </span>
            <span className="text-emerald-400 font-bold">{progressPercentage}% CONCLUÍDO</span>
          </div>

          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Nível 1: Básico (Cotidiano)</span>
            <span>Nível 2: Médio (Eng. Social)</span>
            <span>Nível 3: Avançado (Golpes Financeiros)</span>
          </div>
        </div>

      </div>
    </section>
  );
};
