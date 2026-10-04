import { useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CaseDesk } from './components/CaseDesk';
import { CertificateModal } from './components/CertificateModal';
import { ReportModal } from './components/ReportModal';
import { OnboardingModal } from './components/OnboardingModal';
import { Footer } from './components/Footer';
import { ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function App() {
  const [score, setScore] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [allCompleted, setAllCompleted] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    try {
      return localStorage.getItem('hacklearn_onboarding_seen') !== 'true';
    } catch {
      return true;
    }
  });

  const mainContainerRef = useRef<HTMLDivElement>(null);

  const handleScoreUpdate = (newXp: number, count: number, isFinished: boolean) => {
    setScore(newXp);
    setCompletedCount(count);
    if (isFinished) {
      setAllCompleted(true);
    }
  };

  return (
    <div
      ref={mainContainerRef}
      className="min-h-screen flex flex-col desk-surface text-[#e8eaf2] relative overflow-x-hidden"
    >
      {/* Barra de Navegação */}
      <Header
        score={score}
        onOpenInstructions={() => setIsOnboardingOpen(true)}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        {/* Hero Section Adaptada ao Novo Visual */}
        <Hero />

        {/* Seção Principal: Mesa Investigativa Gamificada */}
        <section>
          <CaseDesk onScoreUpdate={handleScoreUpdate} />
        </section>

        {/* Notificação de Certificado Desbloqueado */}
        {allCompleted && (
          <div className="mb-8 p-4 sm:p-5 rounded-lg bg-desk-2 border-2 border-safe flex items-center justify-between shadow-2xl">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-safe/15 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-safe" />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-base">
                  Treinamento Concluído com Sucesso!
                </h4>
                <p className="text-xs text-clip font-mono">
                  Seu Certificado de Cidadão Blindado foi emitido e está liberado abaixo.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-safe bg-safe/15 px-3 py-1.5 rounded border border-safe/30">
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

      {/* Instruções Rápidas de Como Jogar */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Rodapé */}
      <Footer />
    </div>
  );
}

export default App;
