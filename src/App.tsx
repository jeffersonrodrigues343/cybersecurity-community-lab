import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ScamSimulatorGame } from './components/ScamSimulatorGame';
import { CertificateModal } from './components/CertificateModal';
import { ReportModal } from './components/ReportModal';
import { Footer } from './components/Footer';
import { Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function App() {
  const [score, setScore] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [allCompleted, setAllCompleted] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const totalScore = 900;

  const handleScoreUpdate = (newXp: number, count: number, isFinished: boolean) => {
    setScore(newXp);
    setCompletedCount(count);
    if (isFinished) {
      setAllCompleted(true);
    }
  };

  // GSAP: Ambient Glow Cursor Follower
  useEffect(() => {
    const ctx = gsap.context(() => {
      const cursor = cursorRef.current;
      if (cursor && window.matchMedia('(pointer: fine)').matches) {
        const moveCursor = (e: MouseEvent) => {
          gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.4,
            ease: 'power2.out',
          });
        };
        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
      }
    }, mainContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainContainerRef} className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 cyber-grid relative overflow-x-hidden">
      
      {/* GSAP Ambient Glow Follower */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.035] blur-3xl pointer-events-none z-0"
      />

      {/* Barra de Navegação */}
      <Header
        score={score}
        totalScore={totalScore}
        completedCount={completedCount}
        onOpenReportModal={() => setIsReportOpen(true)}
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Hero Section Direto e Limpo */}
        <Hero />

        {/* Seção Principal: Simulador Gamificado de Golpes */}
        <section className="mb-12">
          <ScamSimulatorGame onScoreUpdate={handleScoreUpdate} />
        </section>

        {/* Notificação de Certificado Desbloqueado */}
        {allCompleted && (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/60 text-emerald-300 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-emerald-400 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-white text-sm">Treinamento 100% Concluído!</h4>
                <p className="text-xs text-slate-300">Seu Certificado de Cidadão Blindado está liberado logo abaixo.</p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-900/50 px-3 py-1 rounded-lg border border-emerald-700/50">
              {score} XP
            </span>
          </div>
        )}

        {/* Certificado e Envio de Depoimento */}
        <CertificateModal
          isOpen={allCompleted || completedCount >= 6}
          score={score}
        />

      </main>

      {/* Modal Sobre o Projeto */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Rodapé */}
      <Footer />

    </div>
  );
}

export default App;
