import { Terminal, BookOpen } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060910] py-10 mt-16 text-slate-500 font-mono text-xs">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div className="flex items-center space-x-2 text-slate-300 font-bold">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>HackLearn Community Edition</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>CST em Análise e Desenvolvimento de Sistemas</span>
            </span>
            <span>•</span>
            <span>Projeto de Extensão I</span>
            <span>•</span>
            <span>Programa Contexto à Comunidade</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 text-center sm:text-left">
          <p>
            Desenvolvido como projeto de transferência do saber acadêmico para capacitação e letramento digital da comunidade.
          </p>

          <p className="flex items-center justify-center space-x-1">
            <span>Construído com React, TypeScript, GSAP, Motion & Three.js</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
