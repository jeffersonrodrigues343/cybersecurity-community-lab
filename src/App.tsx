import { useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from './components/Header';
import { CaseDesk } from './components/CaseDesk';
import { CertificateModal } from './components/CertificateModal';
import { ReportModal } from './components/ReportModal';
import { OnboardingModal } from './components/OnboardingModal';
import { Footer } from './components/Footer';
import { Award } from 'lucide-react';

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
    <div ref={mainContainerRef} className="min-h-screen flex flex-col desk-surface text-[#e8eaf2] relative overflow-x-hidden">
      
      

      {/* Barra de Navegação */}
      <Header
        score={score}
        
        
        
        onOpenInstructions={() => setIsOnboardingOpen(true)}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        
        

        {/* Seção Principal: Simulador Gamificado de Golpes */}
        <section>
          <CaseDesk onScoreUpdate={handleScoreUpdate} />
        </section>

        {/* Notificação de Certificado Desbloqueado */}
        {allCompleted && (
          <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-[#1c1c1e] border border-[#30d158]/30 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#30d158]/15 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-[#30d158]" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Treinamento Concluído</h4>
                <p className="text-xs text-[#86868b]">Seu Certificado de Cidadão Blindado está liberado abaixo.</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#30d158] bg-[#30d158]/10 px-3 py-1 rounded-full border border-[#30d158]/20">
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

      {/* Bloco de Carregamento & Instruções Rápidas (Apple Style) */}
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
