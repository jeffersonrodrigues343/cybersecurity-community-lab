import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Search,
  ChevronDown,
  Flame,
  Target,
  ArrowRight,
  X,
  Paperclip,
  Trophy,
  BookOpen,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import {
  SCAM_CASES,
  BADGES,
  FAMILY_GOLDEN_RULES,
  GLOSSARY_ITEMS,
  type ScamCase,
  type InvestigativeClue,
  type Badge,
  type InteractiveAction,
} from '../data/scamsData';
import { generateDynamicScamCase } from '../data/dynamicScamsGenerator';
import { sound } from '../utils/audio';
import { PhoneScreen } from './PhoneScreen';

interface CaseDeskProps {
  onScoreUpdate: (totalXp: number, completedCount: number, allCompleted: boolean) => void;
}

type Verdict = 'scam' | 'safe';

const CLUE_XP = 10;
const comboBonusFor = (streak: number) => (streak >= 3 ? 30 : streak === 2 ? 10 : 0);

interface CollectedEvidence {
  id: string;
  title: string;
  description: string;
  status: 'suspicious' | 'clean' | 'neutral' | 'risk_taken';
}

export const CaseDesk: React.FC<CaseDeskProps> = ({ onScoreUpdate }) => {
  const [caseNumber, setCaseNumber] = useState(1);
  const [current, setCurrent] = useState<ScamCase>(() => generateDynamicScamCase(0));
  const [openClue, setOpenClue] = useState<string | null>(null);
  const [inspected, setInspected] = useState<string[]>([]);

  // Condução Interativa no Celular & Coleta de Provas
  const [executedActionIds, setExecutedActionIds] = useState<string[]>([]);
  const [actionHistory, setActionHistory] = useState<{ player: string; reply: string }[]>([]);
  const [collectedEvidences, setCollectedEvidences] = useState<CollectedEvidence[]>([]);
  const [mobileTab, setMobileTab] = useState<'phone' | 'dossier'>('phone');

  // Veredito & Questionamento do Motivo (Desafio Intelectual)
  const [stagedVerdict, setStagedVerdict] = useState<Verdict | null>(null);
  const [selectedHypothesis, setSelectedHypothesis] = useState<number | null>(null);
  const [finalVerdict, setFinalVerdict] = useState<Verdict | null>(null);
  const [wasHypothesisCorrect, setWasHypothesisCorrect] = useState<boolean | null>(null);

  const [streak, setStreak] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [solved, setSolved] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastEarned, setLastEarned] = useState(0);

  // Badges e Modais
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hacklearn_unlocked_badges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [recentBadgeUnlocked, setRecentBadgeUnlocked] = useState<Badge | null>(null);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isFamilyGuideOpen, setIsFamilyGuideOpen] = useState(false);
  const [familyGuideTab, setFamilyGuideTab] = useState<'rules' | 'glossary'>('rules');

  const topRef = useRef<HTMLDivElement>(null);
  const hypothesisRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const answered = finalVerdict !== null;
  const wasVerdictCorrect = answered ? (finalVerdict === 'scam') === current.isScam : null;
  const isPerfectScore = answered ? wasVerdictCorrect && wasHypothesisCorrect : null;

  const unlockBadge = useCallback((badgeId: string) => {
    setUnlockedBadgeIds((prev) => {
      if (prev.includes(badgeId)) return prev;
      const badge = BADGES.find((b) => b.id === badgeId);
      if (badge) {
        sound.playBadgeUnlock();
        setRecentBadgeUnlocked(badge);
        try {
          const updated = [...prev, badgeId];
          localStorage.setItem('hacklearn_unlocked_badges', JSON.stringify(updated));
          return updated;
        } catch {
          // ignore
        }
      }
      return prev;
    });
  }, []);

  // O jogador interage diretamente no celular e gera evidência no Dossiê
  const handlePerformPhoneAction = (action: InteractiveAction) => {
    setExecutedActionIds((prev) => [...prev, action.id]);
    setActionHistory((prev) => [
      ...prev,
      { player: action.playerMessage, reply: action.replyMessage },
    ]);

    if (action.evidenceDiscovered) {
      const ev = action.evidenceDiscovered;
      setCollectedEvidences((prev) => {
        if (prev.some((e) => e.id === ev.id)) return prev;
        return [
          ...prev,
          {
            id: ev.id,
            title: ev.title,
            description: ev.description,
            status: ev.status,
          },
        ];
      });
      unlockBadge('badge-first-clue');
    }
  };

  // Inspecionar pistas práticas (sem jargão técnico)
  const inspect = (clue: InvestigativeClue) => {
    sound.playBlip();
    setOpenClue((prev) => (prev === clue.id ? null : clue.id));
    if (!inspected.includes(clue.id)) {
      setInspected((prev) => [...prev, clue.id]);
      unlockBadge('badge-first-clue');
      if (clue.category === 'whois' && clue.evidenceResult.status === 'suspicious') {
        unlockBadge('badge-whois-master');
      }
    }
  };

  // Jogador escolhe Golpe ou Seguro (Dispara o questionamento do motivo)
  const handleStageVerdict = (v: Verdict) => {
    sound.playBlip();
    setStagedVerdict(v);
    setSelectedHypothesis(null);
    setMobileTab('dossier');
    setTimeout(() => {
      hypothesisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
  };

  // Confirmação final após escolher o motivo
  const handleConfirmVerdict = useCallback(() => {
    if (answered || stagedVerdict === null || selectedHypothesis === null) return;

    const verdictCorrect = (stagedVerdict === 'scam') === current.isScam;
    const hypoCorrect = selectedHypothesis === current.correctEvidenceIndex;

    setFinalVerdict(stagedVerdict);
    setWasHypothesisCorrect(hypoCorrect);
    setOpenClue(null);

    let earned = 0;
    let newStreak = streak;

    if (verdictCorrect && hypoCorrect) {
      // Acertou Veredito e o Motivo Real (Pontuação Máxima)
      newStreak = streak + 1;
      earned = current.xpReward + inspected.length * CLUE_XP + comboBonusFor(newStreak);
      sound.playSuccess();
      confetti({
        particleCount: 70,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#ffd84a', '#1fa463', '#f4ede0', '#e23d3d'],
      });

      if (newStreak >= 3) unlockBadge('badge-streak-fire');
      if (current.category.includes('Família') || current.category.includes('WhatsApp')) {
        unlockBadge('badge-family-shield');
      }
      if (current.category.includes('Central') || current.category.includes('Banco')) {
        unlockBadge('badge-pix-guard');
      }
    } else if (verdictCorrect && !hypoCorrect) {
      // Acertou o Veredito mas errou o Motivo (Pontuação Parcial)
      earned = Math.round(current.xpReward * 0.5) + inspected.length * CLUE_XP;
      sound.playSuccess();
    } else {
      // Errou o Veredito
      sound.playError();
      newStreak = 0;
    }

    const newTotal = totalXp + earned;
    const newSolved = solved + 1;
    setStreak(newStreak);
    setLastEarned(earned);
    setTotalXp(newTotal);
    setSolved(newSolved);
    if (verdictCorrect) setCorrectCount((n) => n + 1);

    if (newSolved >= 6) {
      unlockBadge('badge-grand-master');
    }

    onScoreUpdate(newTotal, newSolved, newSolved >= SCAM_CASES.length);

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 250);
  }, [
    answered,
    current,
    inspected.length,
    onScoreUpdate,
    selectedHypothesis,
    solved,
    stagedVerdict,
    streak,
    totalXp,
    unlockBadge,
  ]);

  const nextCase = useCallback(() => {
    sound.playBlip();
    setCurrent(generateDynamicScamCase(streak));
    setCaseNumber((n) => n + 1);
    setExecutedActionIds([]);
    setActionHistory([]);
    setCollectedEvidences([]);
    setStagedVerdict(null);
    setSelectedHypothesis(null);
    setFinalVerdict(null);
    setWasHypothesisCorrect(null);
    setOpenClue(null);
    setInspected([]);
    setLastEarned(0);
    setMobileTab('phone');
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [streak]);

  // Teclado no Desktop
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (!answered) {
        if (stagedVerdict === null) {
          if (k === 'g') handleStageVerdict('scam');
          else if (k === 's') handleStageVerdict('safe');
        } else {
          if (k === '1' || k === 'a') setSelectedHypothesis(0);
          else if (k === '2' || k === 'b') setSelectedHypothesis(1);
          else if (k === '3' || k === 'c') setSelectedHypothesis(2);
          else if (k === '4' || k === 'd') setSelectedHypothesis(3);
          else if (k === 'enter' && selectedHypothesis !== null) handleConfirmVerdict();
          else if (k === 'escape') {
            setStagedVerdict(null);
            setSelectedHypothesis(null);
          }
        }
      } else if (answered && (k === 'enter' || k === ' ')) {
        nextCase();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, handleConfirmVerdict, nextCase, selectedHypothesis, stagedVerdict]);

  // Auto-fechar toast de conquista
  useEffect(() => {
    if (recentBadgeUnlocked) {
      const timer = setTimeout(() => {
        setRecentBadgeUnlocked(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [recentBadgeUnlocked]);

  const accuracy = solved ? Math.round((correctCount / solved) * 100) : null;

  return (
    <div ref={topRef} className="scroll-mt-16 pb-24 lg:pb-10">
      {/* Toast de Conquista */}
      <AnimatePresence>
        {recentBadgeUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-3 sm:top-18 right-3 left-3 sm:left-auto sm:right-8 z-50 p-3.5 sm:p-4 rounded-xl bg-desk-2 border-2 border-marker text-white shadow-2xl flex items-center gap-3 sm:max-w-sm"
          >
            <span className="text-2xl sm:text-3xl p-2 rounded-lg bg-desk border border-desk-line shrink-0">
              {recentBadgeUnlocked.icon}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-marker block font-semibold">
                Nova Conquista Desbloqueada!
              </span>
              <h4 className="font-display font-bold text-sm truncate">{recentBadgeUnlocked.title}</h4>
              <p className="text-xs text-clip line-clamp-2 mt-0.5">{recentBadgeUnlocked.description}</p>
            </div>
            <button
              onClick={() => setRecentBadgeUnlocked(null)}
              className="p-1 hover:bg-desk rounded text-clip hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD Superior Compacto (1 Linha Fluida no Mobile e Desktop) */}
      <div className="flex items-center justify-between gap-2 py-2 sm:py-3 border-b border-desk-line/70 mb-3">
        <div className="flex items-center gap-2">
          <div className="font-mono text-xs sm:text-[13px] tracking-wider text-clip uppercase font-bold">
            Caso <span className="text-white">#{String(caseNumber).padStart(2, '0')}</span>
          </div>

          <motion.div
            key={streak}
            initial={{ scale: streak ? 1.2 : 1 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${
              streak >= 2
                ? 'bg-[#ff8a3d]/15 border-[#ff8a3d]/40 text-[#ffb27a]'
                : 'bg-desk-2 border-desk-line text-clip'
            }`}
            title="Sequência de acertos"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>{streak}</span>
          </motion.div>

          <button
            onClick={() => {
              sound.playBlip();
              setIsBadgesModalOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-desk-2 border border-desk-line hover:border-marker/50 text-white text-[11px] font-mono transition cursor-pointer"
            title="Ver Conquistas"
          >
            <Trophy className="w-3 h-3 text-marker" />
            <span className="hidden sm:inline">Conquistas</span>
            <span className="text-[10px] text-clip">({unlockedBadgeIds.length}/{BADGES.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playBlip();
              setIsFamilyGuideOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-desk-2 border border-desk-line hover:border-safe/50 text-white text-[11px] font-mono transition cursor-pointer"
            title="Cartilha de Proteção Familiar"
          >
            <BookOpen className="w-3 h-3 text-safe" />
            <span className="hidden sm:inline">Cartilha</span>
          </button>

          {accuracy !== null && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-desk-2 border border-desk-line text-xs text-clip">
              <Target className="w-3.5 h-3.5" />
              <span className="text-white font-semibold">{accuracy}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Seletor Mobile de Abas (Celular vs Checagens & Veredito) */}
      <div className="flex lg:hidden items-center p-1 rounded-xl bg-desk-2 border border-desk-line mb-3 shadow-sm">
        <button
          onClick={() => {
            sound.playBlip();
            setMobileTab('phone');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            mobileTab === 'phone' ? 'bg-[#008069] text-white shadow' : 'text-clip hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>1. Mensagem</span>
        </button>
        <button
          onClick={() => {
            sound.playBlip();
            setMobileTab('dossier');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer relative ${
            mobileTab === 'dossier' ? 'bg-[#ffeecd] text-ink font-bold shadow' : 'text-clip hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>2. Checagens & Decisão</span>
          {inspected.length > 0 && (
            <span className="bg-ink text-paper text-[9.5px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {inspected.length}
            </span>
          )}
        </button>
      </div>

      {/* Grid Principal: Celular à esquerda, Checagens & Veredito à direita */}
      <div className="grid gap-5 lg:gap-7 lg:grid-cols-[285px_minmax(0,1fr)] xl:grid-cols-[295px_minmax(0,1fr)] lg:items-start">
        {/* Celular Funcional */}
        <div className={`${mobileTab === 'phone' ? 'block' : 'hidden'} lg:block lg:sticky lg:top-18`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            >
              <PhoneScreen
                scamCase={current}
                stamped={finalVerdict}
                wasCorrect={wasVerdictCorrect}
                onPerformAction={handlePerformPhoneAction}
                executedActionIds={executedActionIds}
                actionHistory={actionHistory}
              />
            </motion.div>
          </AnimatePresence>

          {/* Atalho Rápido no Mobile abaixo do Celular */}
          <div className="mt-3 lg:hidden max-w-[280px] mx-auto space-y-2">
            {!answered ? (
              <>
                <button
                  onClick={() => {
                    sound.playBlip();
                    setMobileTab('dossier');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-semibold flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-marker" />
                    Pistas da vida real ({current.clues.length})
                  </span>
                  <span className="text-[11px] text-marker font-mono font-bold">Ver pistas →</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleStageVerdict('scam')}
                    className="py-2.5 px-2 rounded-xl bg-scam hover:bg-scam/90 text-white font-display font-extrabold text-xs sm:text-sm uppercase tracking-wide shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>É Golpe!</span>
                  </button>
                  <button
                    onClick={() => handleStageVerdict('safe')}
                    className="py-2.5 px-2 rounded-xl bg-safe hover:bg-safe/90 text-white font-display font-extrabold text-xs sm:text-sm uppercase tracking-wide shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>É Seguro</span>
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  sound.playBlip();
                  setMobileTab('dossier');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-marker text-ink font-display font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
              >
                <span>Ver Explicação & Regra de Ouro →</span>
              </button>
            )}
          </div>
        </div>

        {/* Ficha Investigativa & Veredito */}
        <div className={`${mobileTab === 'dossier' ? 'block' : 'hidden'} lg:block min-w-0`}>
          {/* Botão Mobile para retornar ao Celular */}
          <div className="mb-2.5 lg:hidden flex items-center justify-between">
            <button
              onClick={() => {
                sound.playBlip();
                setMobileTab('phone');
              }}
              className="py-1 px-2.5 rounded-lg bg-desk-2 border border-desk-line text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>← Ver a Mensagem</span>
            </button>
            <span className="font-mono text-[11px] text-clip">
              Caso #{String(caseNumber).padStart(2, '0')}
            </span>
          </div>

          <motion.section
            key={`ficha-${current.id}`}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.08 }}
            className="paper relative rounded-xl px-4 sm:px-7 pt-5 sm:pt-6 pb-6 shadow-2xl"
          >
            <Paperclip className="absolute -top-3 left-6 w-6 h-6 text-clip rotate-[-20deg]" aria-hidden />

            {/* Cabeçalho Limpo */}
            <header className="border-b-2 border-dashed border-ink/20 pb-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-soft font-bold">
                  Investigação do Caso #{String(caseNumber).padStart(2, '0')}
                </span>
                <span className="font-mono text-[10.5px] text-ink-soft">
                  Canal: {current.channel === 'push' ? 'Notificação' : current.channel === 'call' ? 'Ligação' : current.channel.toUpperCase()}
                </span>
              </div>
              <h2 className="font-display font-extrabold text-[22px] sm:text-[26px] leading-tight text-ink mt-0.5">
                {current.category}
              </h2>
            </header>

            {/* Respostas Obtidas pelo Diálogo no celular (se houver) */}
            {collectedEvidences.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-800 font-bold block mb-1">
                  💬 Resposta obtida no celular:
                </span>
                <ul className="space-y-1">
                  {collectedEvidences.map((ev) => (
                    <li key={ev.id} className="text-xs text-ink leading-relaxed">
                      • <strong>{ev.title}:</strong> {ev.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Checagens Práticas da Vida Real */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-soft font-bold">
                  O que você pode conferir na vida real:
                </span>
                <span className="font-mono text-[10px] text-ink-soft">+{CLUE_XP} XP cada</span>
              </div>

              <ul className="space-y-2">
                {current.clues.map((clue, idx) => {
                  const isOpen = openClue === clue.id;
                  const seen = inspected.includes(clue.id);
                  return (
                    <li key={clue.id} className="rounded-lg border-2 border-ink/15 bg-white/70 overflow-hidden shadow-sm">
                      <button
                        onClick={() => inspect(clue)}
                        aria-expanded={isOpen}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-white transition cursor-pointer"
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shrink-0 ${
                            seen ? 'bg-ink text-paper' : 'border border-ink/30 text-ink-soft'
                          }`}
                        >
                          {seen ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : idx + 1}
                        </span>
                        <span className="flex-1 font-semibold text-[14px] text-ink leading-tight">
                          {clue.buttonLabel}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-ink-soft transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3.5 pb-3 pt-1 border-t border-dashed border-ink/15 bg-amber-50/40">
                              <p className="text-[13px] leading-relaxed text-ink font-medium">
                                👉 {clue.inspection.observation}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* SEÇÃO DE DECISÃO E QUESTIONAMENTO DO MOTIVO */}
            {!answered && (
              <div className="mt-5 pt-4 border-t-2 border-dashed border-ink/20">
                {stagedVerdict === null ? (
                  /* ETAPA 1: O Jogador dá a opinião inicial */
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-ink-soft font-bold block mb-2 text-center sm:text-left">
                      Qual é a sua decisão?
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => handleStageVerdict('scam')}
                        className="py-3.5 px-3 rounded-xl bg-scam hover:bg-scam/90 text-white font-display font-extrabold text-base sm:text-lg uppercase tracking-wide shadow-md active:scale-98 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ShieldAlert className="w-5 h-5 shrink-0" />
                        <span>É Golpe!</span>
                        <kbd className="hidden lg:inline font-mono text-[10px] opacity-75 border border-white/30 rounded px-1 ml-1">G</kbd>
                      </button>

                      <button
                        onClick={() => handleStageVerdict('safe')}
                        className="py-3.5 px-3 rounded-xl bg-safe hover:bg-safe/90 text-white font-display font-extrabold text-base sm:text-lg uppercase tracking-wide shadow-md active:scale-98 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-5 h-5 shrink-0" />
                        <span>É Seguro</span>
                        <kbd className="hidden lg:inline font-mono text-[10px] opacity-75 border border-white/30 rounded px-1 ml-1">S</kbd>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ETAPA 2: O Jogador é QUESTIONADO sobre POR QUE acredita nisso */
                  <motion.div
                    ref={hypothesisRef}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-ink/10">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-soft font-bold">
                          Sua Decisão:
                        </span>
                        <span className={`font-display font-extrabold text-xs px-2.5 py-0.5 rounded-full ${
                          stagedVerdict === 'scam' ? 'bg-scam text-white' : 'bg-safe text-white'
                        }`}>
                          {stagedVerdict === 'scam' ? '🚨 É Golpe!' : '✅ É Seguro'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          sound.playBlip();
                          setStagedVerdict(null);
                          setSelectedHypothesis(null);
                        }}
                        className="text-[11px] font-mono text-ink-soft hover:text-ink underline cursor-pointer"
                      >
                        Mudar veredito
                      </button>
                    </div>

                    <div className="flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-marker shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm font-display font-bold text-ink leading-snug">
                        {stagedVerdict === 'scam'
                          ? 'O que te fez ter certeza de que isso é um golpe? Qual foi a armadilha que você pegou?'
                          : 'Por que você acredita que essa mensagem é 100% segura e legítima?'}
                      </p>
                    </div>

                    {/* Alternativas de Motivo */}
                    <div className="space-y-2">
                      {current.evidenceHypotheses.map((hypo, idx) => {
                        const isSelected = selectedHypothesis === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              sound.playBlip();
                              setSelectedHypothesis(idx);
                            }}
                            className={`w-full text-left p-3 rounded-xl border-2 text-xs sm:text-[13px] leading-relaxed transition cursor-pointer flex items-start gap-2.5 ${
                              isSelected
                                ? 'bg-ink text-paper border-ink shadow-md font-medium'
                                : 'bg-white/80 border-ink/15 hover:border-ink/40 text-ink'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5 ${
                                isSelected ? 'bg-marker text-ink' : 'border border-ink/30 text-ink-soft'
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="flex-1">{hypo}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Botão de Confirmação da Decisão com o Motivo */}
                    <button
                      onClick={handleConfirmVerdict}
                      disabled={selectedHypothesis === null}
                      className={`w-full py-3.5 px-4 rounded-xl font-display font-extrabold text-sm sm:text-base tracking-wide uppercase flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer mt-2 ${
                        selectedHypothesis !== null
                          ? stagedVerdict === 'scam'
                            ? 'bg-scam hover:bg-scam/90 text-white'
                            : 'bg-safe hover:bg-safe/90 text-white'
                          : 'bg-ink/10 text-ink/30 border-2 border-dashed border-ink/20 cursor-not-allowed'
                      }`}
                    >
                      <span>
                        {selectedHypothesis !== null
                          ? `Confirmar Decisão: ${stagedVerdict === 'scam' ? 'É Golpe!' : 'É Seguro'}`
                          : 'Selecione o motivo acima'}
                      </span>
                      {selectedHypothesis !== null && <ArrowRight className="w-4 h-4" />}
                      {selectedHypothesis !== null && (
                        <kbd className="hidden lg:inline font-mono text-[10px] opacity-75 border border-white/30 rounded px-1 ml-1">Enter</kbd>
                      )}
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            {/* Card de Resultado Pós-Veredito */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  ref={resultRef}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 space-y-3"
                >
                  <div
                    className={`rounded-xl p-4 border-2 shadow-sm ${
                      isPerfectScore
                        ? 'border-safe/60 bg-safe/10'
                        : wasVerdictCorrect
                        ? 'border-amber-500/60 bg-amber-50/70'
                        : 'border-scam/60 bg-scam/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isPerfectScore ? (
                          <ShieldCheck className="w-6 h-6 text-safe shrink-0" />
                        ) : wasVerdictCorrect ? (
                          <span className="text-xl shrink-0">👀</span>
                        ) : (
                          <ShieldAlert className="w-6 h-6 text-scam shrink-0" />
                        )}
                        <h3
                          className={`font-display font-extrabold text-base sm:text-lg leading-tight ${
                            isPerfectScore
                              ? 'text-safe'
                              : wasVerdictCorrect
                              ? 'text-amber-950'
                              : 'text-scam'
                          }`}
                        >
                          {isPerfectScore
                            ? 'Dedução Perfeita! Veredito e motivo corretos.'
                            : wasVerdictCorrect
                            ? 'Acertou o Veredito, mas errou o motivo real!'
                            : current.isScam
                            ? 'Cuidado! Você caiu no golpe.'
                            : 'Alarme falso! A mensagem era segura.'}
                        </h3>
                      </div>
                      {wasVerdictCorrect && (
                        <span className="font-mono font-extrabold text-sm text-safe shrink-0 bg-safe/15 px-2 py-0.5 rounded">
                          +{lastEarned} XP
                        </span>
                      )}
                    </div>

                    {/* Feedback Pedagógico do Motivo */}
                    <div className="mt-2.5 pt-2 border-t border-ink/10 space-y-1.5">
                      {wasVerdictCorrect && !wasHypothesisCorrect && (
                        <div className="p-2.5 rounded-lg bg-amber-100/70 border border-amber-300 text-xs text-amber-950 leading-relaxed">
                          ⚠️ <strong>Atenção ao raciocínio:</strong> Você acertou que era golpe, mas o motivo que você escolheu era uma pegadinha! O motivo real inquestionável deste caso é: <em>{current.keyEvidenceReason}</em>
                        </div>
                      )}

                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft font-bold block mb-0.5">
                          {current.isScam ? 'Onde estava a armadilha:' : 'Como saber que é seguro:'}
                        </span>
                        <p className="text-[13px] leading-relaxed text-ink font-medium">
                          {current.keyEvidenceReason || current.explanation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Regra de Ouro */}
                  <div className="rounded-xl bg-ink text-paper p-3.5 sm:p-4 shadow-md">
                    <div className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-marker font-bold flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-marker" /> Regra de Ouro para a Vida Real
                    </div>
                    <p className="font-display font-bold text-[14px] sm:text-[15px] leading-snug mt-1 text-white">
                      {current.pedagogy.goldenRule}
                    </p>
                  </div>

                  {/* Botão Próximo Caso */}
                  <button
                    onClick={nextCase}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-marker hover:bg-[#ffc91f] text-ink font-display font-extrabold text-base py-3.5 shadow-lg active:scale-98 transition cursor-pointer"
                  >
                    <span>Próximo Caso</span>
                    <ArrowRight className="w-4 h-4" />
                    <kbd className="hidden lg:inline font-mono text-[10px] opacity-60 ml-1">Enter</kbd>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        </div>
      </div>

      {/* MODAL 1: Sala de Conquistas */}
      <AnimatePresence>
        {isBadgesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="paper rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b-2 border-dashed border-ink/20 pb-3">
                <div>
                  <h3 className="font-display font-extrabold text-xl text-ink">Sala de Conquistas</h3>
                  <p className="text-xs font-mono text-ink-soft">
                    {unlockedBadgeIds.length} de {BADGES.length} conquistas desbloqueadas
                  </p>
                </div>
                <button
                  onClick={() => setIsBadgesModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-ink/10 hover:bg-ink/20 flex items-center justify-center text-ink font-bold transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {BADGES.map((b) => {
                  const isUnlocked = unlockedBadgeIds.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 transition ${
                        isUnlocked
                          ? 'bg-white border-marker/80 shadow-sm'
                          : 'bg-ink/5 border-ink/10 opacity-50'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{b.icon}</span>
                      <div className="min-w-0">
                        <div className="font-display font-bold text-xs text-ink truncate">{b.title}</div>
                        <div className="text-[10px] text-ink-soft line-clamp-2 mt-0.5">{b.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Cartilha de Proteção Familiar */}
      <AnimatePresence>
        {isFamilyGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="paper rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b-2 border-dashed border-ink/20 pb-3">
                <div>
                  <h3 className="font-display font-extrabold text-xl text-ink">Cartilha de Proteção</h3>
                  <p className="text-xs font-mono text-ink-soft">Dicas práticas para compartilhar com a família</p>
                </div>
                <button
                  onClick={() => setIsFamilyGuideOpen(false)}
                  className="w-8 h-8 rounded-full bg-ink/10 hover:bg-ink/20 flex items-center justify-center text-ink font-bold transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2 border-b border-ink/15 pb-2 text-xs font-mono">
                <button
                  onClick={() => setFamilyGuideTab('rules')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    familyGuideTab === 'rules' ? 'bg-ink text-paper font-bold' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Regras de Ouro
                </button>
                <button
                  onClick={() => setFamilyGuideTab('glossary')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    familyGuideTab === 'glossary' ? 'bg-ink text-paper font-bold' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Dicionário Anti-Golpe
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
                {familyGuideTab === 'rules' ? (
                  FAMILY_GOLDEN_RULES.map((rule, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-ink/10 shadow-sm space-y-0.5">
                      <div className="font-display font-bold text-xs text-ink flex items-center gap-1.5">
                        <span>{rule.icon}</span>
                        <span>{idx + 1}. {rule.title}</span>
                      </div>
                      <p className="text-[12px] text-ink font-medium leading-relaxed">{rule.rule}</p>
                      <p className="text-[11px] text-ink-soft leading-relaxed">💡 {rule.practicalAction}</p>
                    </div>
                  ))
                ) : (
                  GLOSSARY_ITEMS.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-ink/10 shadow-sm space-y-0.5">
                      <div className="font-mono font-bold text-xs text-[#008069] flex items-center justify-between">
                        <span>{item.term}</span>
                        <span className="text-[10px] text-ink-soft font-normal">({item.pronunciation})</span>
                      </div>
                      <p className="text-[11.5px] text-ink leading-relaxed">{item.simpleMeaning}</p>
                      <p className="text-[10.5px] text-ink-soft italic leading-relaxed">Exemplo: {item.realWorldExample}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
