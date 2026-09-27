import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CyberCanvas3D } from './CyberCanvas3D';
import { ShieldCheck, Code, Globe } from 'lucide-react';

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
    <section ref={heroRef} className="relative pt-6 pb-12 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Top Badges */}
        <div ref={badgesRef} className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SALA ATIVA: #01</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-xs font-medium">
            <Globe className="w-3.5 h-3.5" />
            <span>Inclusão & Letramento Digital</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-xs font-medium">
            <Code className="w-3.5 h-3.5" />
            <span>ODS 4 & 9 (ONU)</span>
          </span>
        </div>

        {/* 2-Column Hero: Text & 3D Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-4">
            <h1 ref={titleRef} className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Aprenda Segurança Web <br className="hidden sm:inline" />
              com Desafios <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">Interativos & CTF</span>
            </h1>

            <p ref={descRef} className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Uma réplica comunitária inspirada no <strong className="text-white">TryHackMe</strong> feita para democratizar o saber computacional. Enfrente simulações reais de engenharia social, teste a entropia de senhas e explore o código do navegador para capturar flags.
            </p>

            {/* Quick Action Hints */}
            <div className="flex items-center space-x-4 pt-2 text-xs font-mono text-slate-400">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>3 Tarefas Práticas</span>
              </div>
              <span>•</span>
              <div>100% Gratuito & Aberto</div>
              <span>•</span>
              <div>Sem Burocracia</div>
            </div>
          </div>

          {/* Right 3D Visualizer */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-2 overflow-hidden shadow-2xl">
              <div className="absolute top-3 left-4 flex items-center space-x-2 z-10 font-mono text-[11px] text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                <span className="ml-2 text-slate-500">core_security_3d.obj</span>
              </div>
              <CyberCanvas3D completedCount={completedCount} />
              <div className="text-center font-mono text-[11px] text-emerald-400/80 pb-2">
                // Núcleo Criptográfico Interativo (Three.js WebGL)
              </div>
            </div>
          </div>

        </div>

        {/* Global Progress Card with GSAP */}
        <div ref={progressBoxRef} className="mt-8 bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-mono text-xs">
            <span className="text-slate-300 font-semibold flex items-center space-x-2">
              <span>Status da Sala:</span>
              <span className="text-emerald-400">{completedCount === 3 ? '✓ TODAS AS MISSÕES COMPLETADAS' : `${completedCount} de 3 tarefas finalizadas`}</span>
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
            <span>Missão 1: Phishing</span>
            <span>Missão 2: Força Bruta & Entropia</span>
            <span>Missão 3: Web Inspector (CTF)</span>
          </div>
        </div>

      </div>
    </section>
  );
};
