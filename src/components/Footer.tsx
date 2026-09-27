import { Shield } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-black py-10 mt-16 text-[#86868b] text-[11px]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex items-center space-x-2 text-[#d2d2d7]">
            <Shield className="w-3.5 h-3.5 text-[#2997ff]" />
            <span className="font-semibold text-xs text-white">HackLearn</span>
            <span>• Simulador Educativo de Defesa Digital</span>
          </div>

          <div className="flex items-center space-x-3 text-[#86868b]">
            <span>CST em Análise e Desenvolvimento de Sistemas</span>
            <span>•</span>
            <span>Projeto de Extensão Universitária</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[#86868b]">
          <p>
            Plataforma pública e sem fins lucrativos desenvolvida para conscientização de famílias, jovens e adultos contra golpes virtuais.
          </p>

          <p className="text-[#86868b]">
            React • Tailwind CSS • C# .NET 8 • Supabase
          </p>
        </div>

      </div>
    </footer>
  );
};
