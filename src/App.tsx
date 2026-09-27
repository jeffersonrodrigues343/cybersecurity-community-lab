import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TaskPhishing } from './components/TaskPhishing';
import { TaskPassword } from './components/TaskPassword';
import { TaskWebCTF } from './components/TaskWebCTF';
import { CertificateModal } from './components/CertificateModal';
import { ReportModal } from './components/ReportModal';
import { TerminalSandbox } from './components/TerminalSandbox';
import { Footer } from './components/Footer';
import { sound } from './utils/audio';
import { FileText, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function App() {
  const [completed, setCompleted] = useState({
    phishing: false,
    password: false,
    ctf: false,
  });

  const [isReportOpen, setIsReportOpen] = useState(false);

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const tasksSectionRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const completedCount = Object.values(completed).filter(Boolean).length;
  const score = completedCount * 100;
  const progressPercentage = Math.round((completedCount / 3) * 100);
  const allCompleted = completedCount === 3;

  const handleComplete = (task: 'phishing' | 'password' | 'ctf') => {
    if (!completed[task]) {
      sound.playSuccess();
      setCompleted((prev) => ({ ...prev, [task]: true }));
    }
  };

  // GSAP: ScrollTrigger & Cyber Glow Cursor Follower
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered scroll animation for task cards
      gsap.from('.task-card-trigger', {
        scrollTrigger: {
          trigger: tasksSectionRef.current,
          start: 'top 85%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
      });

      // Smooth mouse glow follower with GSAP lerp
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
      
      {/* GSAP Ambient Glow Follower (Subtle background flashlight) */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.035] blur-3xl pointer-events-none z-0"
      />

      {/* Top Navbar */}
      <Header
        score={score}
        totalScore={300}
        completedCount={completedCount}
        onOpenReportModal={() => setIsReportOpen(true)}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Banner do Projeto */}
        <div className="mt-4 p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>HackLearn: Laboratório Prático de Segurança da Informação</span>
          </div>

          <button
            onClick={() => {
              sound.playBlip();
              setIsReportOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sobre o Projeto</span>
          </button>
        </div>

        {/* Hero Section with Three.js 3D Visualizer & GSAP */}
        <Hero
          progressPercentage={progressPercentage}
          completedCount={completedCount}
        />

        {/* Tasks Section with Motion Dev & GSAP ScrollTrigger */}
        <div ref={tasksSectionRef} className="space-y-8 mt-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
                <span className="text-emerald-400">&gt;</span> MISSÕES PRÁTICAS DA SALA
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Complete as 3 etapas abaixo para desbloquear seu certificado e testar seus conhecimentos.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center space-x-1 font-mono text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-md border border-emerald-800/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AttackBox Habilitado</span>
            </span>
          </div>

          {/* Task 1: Phishing */}
          <div className="task-card-trigger">
            <TaskPhishing
              isCompleted={completed.phishing}
              onComplete={() => handleComplete('phishing')}
            />
          </div>

          {/* Task 2: Password & Brute Force */}
          <div className="task-card-trigger">
            <TaskPassword
              isCompleted={completed.password}
              onComplete={() => handleComplete('password')}
            />
          </div>

          {/* Task 3: Web CTF & DevTools */}
          <div className="task-card-trigger">
            <TaskWebCTF
              isCompleted={completed.ctf}
              onComplete={() => handleComplete('ctf')}
            />
          </div>
        </div>

        {/* Certificate Section Triggered on Completion */}
        <CertificateModal
          isOpen={allCompleted}
          score={score}
        />
      </main>

      {/* Floating Interactive Linux Terminal Sandbox */}
      <TerminalSandbox
        onDiscoverSecretFlag={() => handleComplete('ctf')}
      />

      {/* Academic Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default App;
