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
  Check,
  Paperclip,
  Trophy,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Scale,
  Pin,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import {
  SCAM_CASES,
  BADGES,
  FAMILY_GOLDEN_RULES,
  GLOSSARY_ITEMS,
  type ScamCase,
  type InvestigativeClue,
  type Badge,
  type ReinforcementOption,
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
const DRILL_XP = 20;

const comboBonusFor = (streak: number) => (streak >= 3 ? 30 : streak === 2 ? 10 : 0);
const threatLevel = (streak: number) => Math.min(5, 1 + Math.floor(streak / 2));

interface CollectedEvidence {
  id: string;
  title: string;
  description: string;
  status: 'suspicious' | 'clean' | 'neutral' | 'risk_taken';
  source: 'phone_dialogue' | 'clue_audit';
  forensicFact?: string;
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

  // Fluxo Pericial
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

  // Treino de Reforço e Abas Pedagógicas
  const [drillSelectedOptionId, setDrillSelectedOptionId] = useState<string | null>(null);
  const [drillCompleted, setDrillCompleted] = useState(false);
  const [activePedagogyTab, setActivePedagogyTab] = useState<'parents' | 'kids' | 'remedy'>('parents');

  const hypothesisSectionRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const answered = finalVerdict !== null;
  const wasVerdictCorrect = answered ? (finalVerdict === 'scam') === current.isScam : null;
  const isPerfectScore = wasVerdictCorrect && wasHypothesisCorrect;

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

  // O jogador interage diretamente no celular e gera evidência no Dossiê da Mesa
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
            source: 'phone_dialogue',
            forensicFact: ev.forensicFact,
          },
        ];
      });
      unlockBadge('badge-first-clue');
    }
  };

  // Inspecionar pistas técnicas (auditoria externa)
  const inspect = (clue: InvestigativeClue) => {
    sound.playBlip();
    setOpenClue((prev) => (prev === clue.id ? null : clue.id));
    if (!inspected.includes(clue.id)) {
      setInspected((prev) => [...prev, clue.id]);
      unlockBadge('badge-first-clue');
      if (clue.category === 'whois' && clue.evidenceResult.status === 'suspicious') {
        unlockBadge('badge-whois-master');
      }

      // Adiciona ao caderno de provas
      setCollectedEvidences((prev) => [
        ...prev,
        {
          id: `clue-${clue.id}`,
          title: `Auditoria: ${clue.buttonLabel}`,
          description: clue.inspection.observation,
          status: clue.evidenceResult.status === 'suspicious' ? 'suspicious' : 'clean',
          source: 'clue_audit',
          forensicFact: clue.evidenceResult.fato,
        },
      ]);
    }
  };

  const handleStageVerdict = (v: Verdict) => {
    sound.playBlip();
    setStagedVerdict(v);
    setSelectedHypothesis(null);
    setTimeout(() => {
      hypothesisSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
  };

  const handleSelectHypothesis = (idx: number) => {
    sound.playBlip();
    setSelectedHypothesis(idx);
  };

  const handleExecuteStamp = useCallback(() => {
    if (answered || stagedVerdict === null || selectedHypothesis === null) return;

    const verdictCorrect = (stagedVerdict === 'scam') === current.isScam;
    const hypoCorrect = selectedHypothesis === current.correctEvidenceIndex;

    setFinalVerdict(stagedVerdict);
    setWasHypothesisCorrect(hypoCorrect);
    setOpenClue(null);

    let earned = 0;
    let newStreak = streak;

    if (verdictCorrect && hypoCorrect) {
      newStreak = streak + 1;
      earned =
        current.xpReward +
        inspected.length * CLUE_XP +
        collectedEvidences.length * 5 +
        comboBonusFor(newStreak);
      sound.playSuccess();
      confetti({
        particleCount: 75,
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
      earned = Math.round(current.xpReward * 0.45) + inspected.length * CLUE_XP;
      sound.playSuccess();
    } else {
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
    }, 450);
  }, [
    answered,
    collectedEvidences.length,
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

  const handleDrillSelect = (option: ReinforcementOption) => {
    sound.playBlip();
    setDrillSelectedOptionId(option.id);
    if (option.isCorrect && !drillCompleted) {
      sound.playSuccess();
      setDrillCompleted(true);
      const bonus = totalXp + DRILL_XP;
      setTotalXp(bonus);
      onScoreUpdate(bonus, solved, solved >= SCAM_CASES.length);
    }
  };

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
    setDrillSelectedOptionId(null);
    setDrillCompleted(false);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [streak]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (!answered) {
        if (k === 'g') handleStageVerdict('scam');
        else if (k === 's') handleStageVerdict('safe');
        else if (k === 'enter' && stagedVerdict && selectedHypothesis !== null) {
          handleExecuteStamp();
        }
      } else if (answered && k === 'enter') {
        nextCase();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, handleExecuteStamp, nextCase, selectedHypothesis, stagedVerdict]);

  const accuracy = solved ? Math.round((correctCount / solved) * 100) : null;
  const threat = threatLevel(streak);
  const suspiciousCount = collectedEvidences.filter((e) => e.status === 'suspicious').length;
  const cleanCount = collectedEvidences.filter((e) => e.status === 'clean').length;
  const riskCount = collectedEvidences.filter((e) => e.status === 'risk_taken').length;

  return (
    <div ref={topRef} className="scroll-mt-16 pb-28 lg:pb-10">
      {/* Toast de Conquista */}
      <AnimatePresence>
        {recentBadgeUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-18 right-4 sm:right-8 z-50 p-4 rounded-lg bg-desk-2 border-2 border-marker text-white shadow-2xl flex items-center gap-3.5 max-w-sm"
          >
            <span className="text-3xl p-2 rounded bg-desk border border-desk-line shrink-0">
              {recentBadgeUnlocked.icon}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-[10.5px] font-mono uppercase tracking-wider text-marker block font-semibold">
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

      {/* HUD Superior */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-b border-desk-line/70 mb-4">
        <div className="flex items-center gap-3">
          <div className="font-mono text-[12px] tracking-[0.2em] text-clip uppercase">
            Caso <span className="text-white font-bold">#{String(caseNumber).padStart(3, '0')}</span>
          </div>

          <button
            onClick={() => {
              sound.playBlip();
              setIsBadgesModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-desk-2 border border-desk-line hover:border-marker/50 text-white text-xs font-mono transition cursor-pointer"
            title="Ver Conquistas"
          >
            <Trophy className="w-3.5 h-3.5 text-marker" />
            <span className="hidden sm:inline">Conquistas</span>
            <span className="text-[10px] text-clip">({unlockedBadgeIds.length}/{BADGES.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playBlip();
              setIsFamilyGuideOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-desk-2 border border-desk-line hover:border-safe/50 text-white text-xs font-mono transition cursor-pointer"
            title="Cartilha de Proteção Familiar"
          >
            <BookOpen className="w-3.5 h-3.5 text-safe" />
            <span className="hidden sm:inline">Cartilha</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[13px]">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-desk-2 border border-desk-line"
            title="Nível de ameaça: sobe conforme sua sequência de acertos"
          >
            <span className="text-clip text-[11px] uppercase tracking-wider font-mono">Ameaça</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`w-1.5 h-3.5 rounded-sm ${i <= threat ? 'bg-scam' : 'bg-desk-line'}`}
                />
              ))}
            </div>
          </div>

          <motion.div
            key={streak}
            initial={{ scale: streak ? 1.25 : 1 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border ${
              streak >= 2
                ? 'bg-[#ff8a3d]/15 border-[#ff8a3d]/40 text-[#ffb27a]'
                : 'bg-desk-2 border-desk-line text-clip'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span className="font-semibold">{streak}</span>
          </motion.div>

          {accuracy !== null && (
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-desk-2 border border-desk-line text-clip">
              <Target className="w-4 h-4" />
              <span className="font-semibold text-white">{accuracy}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Celular Funcional (Interativo) + Caderno de Coleta de Provas */}
      <div className="grid gap-8 lg:grid-cols-[370px_minmax(0,1fr)] xl:grid-cols-[385px_minmax(0,1fr)] lg:items-start">
        {/* Celular Funcional Conduzido pelo Jogador */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ y: 30, opacity: 0, rotate: -1.5 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: 1.5 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="lg:sticky lg:top-18"
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

        {/* Caderno de Coleta de Provas & Dossiê Pericial */}
        <motion.section
          key={`ficha-${current.id}`}
          initial={{ x: 25, opacity: 0, rotate: 1 }}
          animate={{ x: 0, opacity: 1, rotate: 0.3 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.08 }}
          className="paper relative rounded-md px-5 sm:px-8 pt-8 pb-7 shadow-2xl"
        >
          <Paperclip className="absolute -top-4 left-8 w-8 h-8 text-clip rotate-[-20deg]" aria-hidden />

          <header className="flex items-start justify-between gap-4 border-b-2 border-dashed border-ink/20 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-ink-soft">
                  Caderno de Coleta de Provas
                </span>
                <span className="font-mono text-[10px] bg-ink text-paper px-2 py-0.5 rounded-full font-bold">
                  {collectedEvidences.length} {collectedEvidences.length === 1 ? 'Prova Fixada' : 'Provas Fixadas'}
                </span>
              </div>
              <h2 className="font-display font-extrabold text-[26px] sm:text-[30px] leading-[1.05] tracking-tight mt-1">
                {current.category}
              </h2>
            </div>
            <div className="font-mono text-[11px] text-ink-soft text-right leading-5 shrink-0">
              Recebido às {current.time}
              <br />
              Canal:{' '}
              {current.channel === 'push'
                ? 'Notificação'
                : current.channel === 'call'
                ? 'Ligação'
                : current.channel.toUpperCase()}
            </div>
          </header>

          {/* Dilema do Alvo */}
          <div className="mt-4 p-3.5 rounded bg-white/50 border border-ink/10">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft block font-bold">
              Situação sob Investigação:
            </span>
            <p className="mt-0.5 text-[15px] sm:text-[16px] leading-[1.5] text-ink font-medium">
              {current.dilemma}
            </p>
          </div>

          {/* SEÇÃO 1: Provas Coletadas Conduzidas no Celular (Dossiê em Tempo Real) */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-[11px] tracking-[0.25em] uppercase text-ink-soft flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-marker" /> Dossiê de Provas Coletadas
              </h3>
              <div className="flex gap-2 text-[11px] font-mono font-bold">
                {!answered ? (
                  <span className="text-ink-soft bg-ink/5 px-2.5 py-0.5 rounded border border-ink/15 font-mono text-[11px]">
                    {collectedEvidences.length} {collectedEvidences.length === 1 ? 'dado registrado' : 'dados registrados'}
                  </span>
                ) : (
                  <>
                    {suspiciousCount > 0 && (
                      <span className="text-scam bg-scam/10 px-2 py-0.5 rounded border border-scam/20">
                        {suspiciousCount} {suspiciousCount === 1 ? 'Indício de Fraude' : 'Indícios de Fraude'}
                      </span>
                    )}
                    {cleanCount > 0 && (
                      <span className="text-safe bg-safe/10 px-2 py-0.5 rounded border border-safe/20">
                        {cleanCount} {cleanCount === 1 ? 'Fator Autêntico' : 'Fatores Autênticos'}
                      </span>
                    )}
                    {riskCount > 0 && (
                      <span className="text-amber-800 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-500/30">
                        {riskCount} {riskCount === 1 ? 'Conduta de Risco' : 'Condutas de Risco'}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {collectedEvidences.length === 0 ? (
              <div className="mt-3 p-4 rounded-md border-2 border-dashed border-ink/20 text-center bg-white/40">
                <p className="text-xs text-ink-soft font-mono">
                  👉 Nenhuma prova coletada ainda. Conduza o diálogo no celular ao lado ou audite os registros do sistema abaixo para registrar dados periciais no dossiê!
                </p>
              </div>
            ) : (
              <motion.ul layout className="mt-3 space-y-2">
                {collectedEvidences.map((ev, idx) => {
                  const isRisk = ev.status === 'risk_taken';
                  return (
                    <motion.li
                      key={ev.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3.5 rounded-md border-2 bg-white/90 shadow-sm flex items-start gap-3 transition-colors ${
                        answered
                          ? ev.status === 'suspicious'
                            ? 'border-scam/50 bg-scam/5'
                            : ev.status === 'clean'
                            ? 'border-safe/50 bg-safe/5'
                            : 'border-amber-400/60 bg-amber-50/50'
                          : isRisk
                          ? 'border-amber-400/80 bg-amber-50/40'
                          : 'border-ink/20'
                      }`}
                    >
                      <div className="mt-0.5">
                        {answered ? (
                          ev.status === 'suspicious' ? (
                            <ShieldAlert className="w-4 h-4 text-scam shrink-0" />
                          ) : ev.status === 'clean' ? (
                            <ShieldCheck className="w-4 h-4 text-safe shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          )
                        ) : isRisk ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <Search className="w-4 h-4 text-ink-soft shrink-0" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-display font-bold text-[14px] text-ink">{ev.title}</h4>
                          <span
                            className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                              answered
                                ? ev.status === 'suspicious'
                                  ? 'bg-scam/15 text-scam'
                                  : ev.status === 'clean'
                                  ? 'bg-safe/15 text-safe'
                                  : 'bg-amber-100 text-amber-800'
                                : isRisk
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-ink/10 text-ink'
                            }`}
                          >
                            {answered
                              ? ev.status === 'suspicious'
                                ? 'indício de fraude'
                                : ev.status === 'clean'
                                ? 'autêntico'
                                : 'conduta de risco'
                              : isRisk
                              ? 'ação de risco'
                              : `registro técnico #${idx + 1}`}
                          </span>
                        </div>
                        <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">{ev.description}</p>
                        {answered && ev.forensicFact && (
                          <p className="text-[11.5px] font-mono text-ink mt-1.5 pt-1.5 border-t border-dashed border-ink/15 italic">
                            💡 Parecer Pericial: {ev.forensicFact}
                          </p>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ul>
            )}
          </div>

          {/* SEÇÃO 2: Checagens Práticas da Vida Real */}
          <div className="mt-6">
            <div className="flex items-baseline justify-between">
              <div>
                <h3 className="font-mono text-[11px] tracking-[0.25em] uppercase text-ink-soft">
                  Checagens Práticas da Vida Real
                </h3>
                <span className="text-[11px] text-ink-soft block font-sans">
                  O que qualquer pessoa pode conferir com seu próprio celular na mão:
                </span>
              </div>
              <span className="font-mono text-[11px] text-ink-soft">+{CLUE_XP} XP cada</span>
            </div>

            <ul className="mt-3 space-y-2">
              {current.clues.map((clue, idx) => {
                const isOpen = openClue === clue.id;
                const seen = inspected.includes(clue.id);
                return (
                  <li key={clue.id} className="rounded-md border-2 border-ink/15 bg-white/60 overflow-hidden">
                    <button
                      onClick={() => inspect(clue)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-white/80 transition cursor-pointer"
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[12px] font-semibold shrink-0 ${
                          seen ? 'bg-ink text-paper' : 'border-2 border-ink/30 text-ink-soft'
                        }`}
                      >
                        {seen ? <Search className="w-3.5 h-3.5" /> : idx + 1}
                      </span>
                      <span className="flex-1 font-semibold text-[15px] text-ink">{clue.buttonLabel}</span>
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
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1 border-t border-dashed border-ink/15">
                            <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-soft mt-2">
                              {clue.inspection.badge}
                            </div>
                            <dl className="mt-2 grid gap-1.5 font-mono text-[12.5px]">
                              {[
                                [clue.inspection.field1Label, clue.inspection.field1Value],
                                [clue.inspection.field2Label, clue.inspection.field2Value],
                                [clue.inspection.field3Label, clue.inspection.field3Value],
                              ]
                                .filter(([l, v]) => l && v)
                                .map(([l, v]) => (
                                   <div key={l} className="grid sm:grid-cols-[160px_1fr] gap-x-3">
                                    <dt className="text-ink-soft">{l}:</dt>
                                    <dd className="text-ink font-semibold break-words">{v}</dd>
                                  </div>
                                ))}
                            </dl>
                            <p className="mt-3 text-[13.5px] leading-[1.6] text-ink italic bg-white/70 p-2.5 rounded border border-ink/10">
                              <span className="font-mono font-bold text-[11px] not-italic uppercase tracking-wider block text-ink-soft mb-0.5">
                                O que isso te ensina na prática:
                              </span>
                              {clue.inspection.observation}
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

          {/* ETAPA 1 & ETAPA 2: O Desafio Intelectual antes de Carimbar */}
          {!answered && (
            <div className="mt-8 pt-6 border-t-2 border-dashed border-ink/20 space-y-6">
              {/* Etapa 1: Veredito Preliminar */}
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-soft font-bold block mb-2">
                  Passo 1: Qual é o seu Veredito Preliminar?
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStageVerdict('scam')}
                    className={`py-3.5 px-4 rounded-md font-display font-extrabold text-lg uppercase tracking-wide border-2 transition cursor-pointer flex items-center justify-center gap-2 ${
                      stagedVerdict === 'scam'
                        ? 'bg-scam text-white border-scam shadow-md'
                        : 'bg-white/70 text-scam border-scam/30 hover:border-scam'
                    }`}
                  >
                    <span>É Golpe!</span>
                    <span className="font-mono text-[11px] opacity-70">G</span>
                  </button>

                  <button
                    onClick={() => handleStageVerdict('safe')}
                    className={`py-3.5 px-4 rounded-md font-display font-extrabold text-lg uppercase tracking-wide border-2 transition cursor-pointer flex items-center justify-center gap-2 ${
                      stagedVerdict === 'safe'
                        ? 'bg-safe text-white border-safe shadow-md'
                        : 'bg-white/70 text-safe border-safe/30 hover:border-safe'
                    }`}
                  >
                    <span>É Seguro</span>
                    <span className="font-mono text-[11px] opacity-70">S</span>
                  </button>
                </div>
              </div>

              {/* Etapa 2: A Prova Técnica / Hipótese Fundamentada */}
              <AnimatePresence>
                {stagedVerdict !== null && (
                  <motion.div
                    ref={hypothesisSectionRef}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-3 pt-2"
                  >
                    <div className="flex items-center gap-1.5 text-ink">
                      <Scale className="w-4 h-4 text-marker" />
                      <span className="font-mono text-[11px] uppercase tracking-wider font-bold">
                        Passo 2: Qual Prova do Dossiê Fundamenta o Veredito?
                      </span>
                    </div>

                    <p className="text-sm font-display font-bold text-ink">
                      {stagedVerdict === 'scam'
                        ? 'Identifique a evidência técnica determinante que comprova a tentativa de golpe:'
                        : 'Identifique o fator técnico que comprova que esta mensagem é 100% legítima:'}
                    </p>

                    <div className="space-y-2">
                      {current.evidenceHypotheses.map((hypo, idx) => {
                        const isSelected = selectedHypothesis === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectHypothesis(idx)}
                            className={`w-full text-left p-3.5 rounded-md border-2 text-[14px] leading-snug transition cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? 'bg-ink text-paper border-ink shadow-md font-medium'
                                : 'bg-white/80 border-ink/15 hover:border-ink/40 text-ink'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
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

                    {/* Etapa 3: Botão de Carimbo Final */}
                    <div className="pt-3">
                      <button
                        onClick={handleExecuteStamp}
                        disabled={selectedHypothesis === null}
                        className={`w-full py-4 rounded-md font-display font-extrabold text-xl tracking-wider uppercase flex items-center justify-center gap-2 stamp-btn transition ${
                          selectedHypothesis !== null
                            ? stagedVerdict === 'scam'
                              ? 'bg-scam text-white cursor-pointer shadow-xl'
                              : 'bg-safe text-white cursor-pointer shadow-xl'
                            : 'bg-ink/10 text-ink/40 border-2 border-dashed border-ink/20 cursor-not-allowed'
                        }`}
                      >
                        <span>
                          {selectedHypothesis !== null
                            ? `Bater Carimbo Oficial: ${stagedVerdict === 'scam' ? 'GOLPE!' : 'SEGURO'}`
                            : 'Selecione uma prova técnica acima'}
                        </span>
                        {selectedHypothesis !== null && (
                          <kbd className="font-mono text-xs font-normal border border-white/40 rounded px-1.5 py-0.5">
                            Enter
                          </kbd>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Resultado Pós-Veredito */}
          <AnimatePresence>
            {answered && (
              <motion.div
                ref={resultRef}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-7 scroll-mb-28"
              >
                <div
                  className={`rounded-md p-5 border-2 ${
                    isPerfectScore
                      ? 'border-safe bg-safe/10'
                      : wasVerdictCorrect
                      ? 'border-marker bg-marker/15'
                      : 'border-scam bg-scam/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3
                      className={`font-display font-extrabold text-[22px] sm:text-[24px] leading-tight ${
                        isPerfectScore
                          ? 'text-safe'
                          : wasVerdictCorrect
                          ? 'text-ink'
                          : 'text-scam'
                      }`}
                    >
                      {isPerfectScore
                        ? 'Dedução Perfeita! Veredito e Prova Corretos.'
                        : wasVerdictCorrect
                        ? 'Acertou o Veredito, mas Errou a Evidência Real!'
                        : current.isScam
                        ? 'Você caiu no golpe! O prejuízo foi consumado.'
                        : 'Alarme falso! A mensagem não oferecia risco.'}
                    </h3>

                    {wasVerdictCorrect && (
                      <span className="font-mono font-bold text-[16px] text-safe shrink-0">
                        +{lastEarned} XP
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-[15px] leading-[1.6] text-ink">{current.explanation}</p>

                  {wasVerdictCorrect && !wasHypothesisCorrect && (
                    <div className="mt-3 p-3.5 rounded bg-white/70 border border-marker/60 text-ink space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Atenção Pedagógica:</span>
                      </div>
                      <p className="text-xs text-ink leading-relaxed">
                        Você acertou o resultado final, mas selecionou uma justificativa falsa ou distratora.
                        A prova real inquestionável deste caso é: <strong>{current.keyEvidenceReason}</strong>
                      </p>
                    </div>
                  )}

                  {current.redFlags.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-ink/10">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-ink-soft font-bold block mb-1.5">
                        Sinais de Alerta Identificados (Red Flags):
                      </span>
                      <ul className="space-y-1.5">
                        {current.redFlags.map((f) => (
                          <li key={f} className="flex gap-2 text-[14px] text-ink">
                            <X className="w-4 h-4 text-scam mt-0.5 shrink-0" strokeWidth={3} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!current.isScam && (
                    <div className="mt-3 flex gap-2 text-[14.5px] text-safe font-medium">
                      <Check className="w-4 h-4 text-safe mt-0.5 shrink-0" strokeWidth={3} />
                      {current.keyEvidenceReason}
                    </div>
                  )}
                </div>

                {/* Drill de Reforço se errou */}
                {!wasVerdictCorrect && current.reinforcementDrill && (
                  <div className="mt-4 p-5 rounded-md bg-white/70 border-2 border-ink/20">
                    <div className="flex items-center gap-2 mb-2 text-ink">
                      <Lightbulb className="w-4 h-4 text-marker" />
                      <span className="font-mono text-[11px] uppercase tracking-wider font-bold">
                        Treino de Reforço • Fixe o Conhecimento (+{DRILL_XP} XP)
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-[17px] text-ink mb-3">
                      {current.reinforcementDrill.question}
                    </h4>

                    <div className="space-y-2">
                      {current.reinforcementDrill.options.map((opt) => {
                        const isChosen = drillSelectedOptionId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleDrillSelect(opt)}
                            className={`w-full text-left p-3 rounded border text-[13.5px] transition cursor-pointer ${
                              isChosen
                                ? opt.isCorrect
                                  ? 'bg-safe/15 border-safe font-bold text-safe'
                                  : 'bg-scam/15 border-scam text-scam'
                                : 'bg-white/80 border-ink/15 hover:bg-white text-ink'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-mono text-xs opacity-60 mt-0.5">›</span>
                              <div className="flex-1">
                                <div>{opt.text}</div>
                                {isChosen && (
                                  <div className="mt-1 text-xs opacity-90 font-medium">
                                    {opt.feedback}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Regra de Ouro */}
                <div className="mt-4 rounded-md bg-ink text-paper p-5">
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.25em] text-marker font-bold">
                    Regra de Ouro para a Vida Real
                  </div>
                  <p className="font-display font-bold text-[19px] leading-snug mt-1">
                    {current.pedagogy.goldenRule}
                  </p>
                  <p className="text-xs text-paper/80 mt-2 font-mono">
                    💡 Dica do Detetive: {current.realWorldTip}
                  </p>
                </div>

                {/* Abas Pedagógicas */}
                <div className="mt-4 p-4 rounded-md bg-white/60 border border-ink/15">
                  <div className="flex gap-2 border-b border-ink/10 pb-2 mb-3 text-xs font-mono">
                    <button
                      onClick={() => setActivePedagogyTab('parents')}
                      className={`px-2.5 py-1 rounded transition cursor-pointer ${
                        activePedagogyTab === 'parents' ? 'bg-ink text-paper font-bold' : 'text-ink-soft'
                      }`}
                    >
                      Para Conversar em Casa
                    </button>
                    <button
                      onClick={() => setActivePedagogyTab('kids')}
                      className={`px-2.5 py-1 rounded transition cursor-pointer ${
                        activePedagogyTab === 'kids' ? 'bg-ink text-paper font-bold' : 'text-ink-soft'
                      }`}
                    >
                      Analogia Simples
                    </button>
                    <button
                      onClick={() => setActivePedagogyTab('remedy')}
                      className={`px-2.5 py-1 rounded transition cursor-pointer ${
                        activePedagogyTab === 'remedy' ? 'bg-ink text-paper font-bold' : 'text-ink-soft'
                      }`}
                    >
                      E se eu já caí?
                    </button>
                  </div>

                  <p className="text-[14px] text-ink leading-relaxed">
                    {activePedagogyTab === 'parents' && current.pedagogy.parentsGuide}
                    {activePedagogyTab === 'kids' && current.pedagogy.kidsAnalogy}
                    {activePedagogyTab === 'remedy' && current.pedagogy.adultRemedy}
                  </p>
                </div>

                {/* Próximo Caso */}
                <button
                  onClick={nextCase}
                  className="mt-5 w-full flex items-center justify-center gap-2 rounded-md bg-marker text-ink font-display font-extrabold text-[18px] py-4 stamp-btn cursor-pointer shadow-lg"
                >
                  Próximo Caso Investigativo <ArrowRight className="w-5 h-5" />
                  <kbd className="hidden lg:inline font-mono text-[11px] font-normal opacity-60 ml-2">
                    Enter
                  </kbd>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>

      {/* MODAL 1: Sala de Conquistas */}
      <AnimatePresence>
        {isBadgesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="paper rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl relative"
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
                  ✕
                </button>
              </div>

              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {BADGES.map((badge) => {
                  const isUnlocked = unlockedBadgeIds.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-3.5 rounded border transition flex items-center gap-3.5 ${
                        isUnlocked
                          ? 'bg-white/70 border-safe/40 shadow-sm'
                          : 'bg-ink/5 border-ink/10 opacity-40'
                      }`}
                    >
                      <span className="text-2xl p-2 bg-ink/10 rounded shrink-0">{badge.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-sm text-ink">{badge.title}</h4>
                          {isUnlocked && (
                            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-safe/20 text-safe font-bold">
                              Liberado
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink-soft mt-0.5">{badge.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Cartilha da Família */}
      <AnimatePresence>
        {isFamilyGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="paper rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b-2 border-dashed border-ink/20 pb-3">
                <div>
                  <h3 className="font-display font-extrabold text-xl text-ink">
                    Cartilha de Defesa Familiar
                  </h3>
                  <p className="text-xs font-mono text-ink-soft">
                    Regras de ouro e termos essenciais de cibersegurança
                  </p>
                </div>
                <button
                  onClick={() => setIsFamilyGuideOpen(false)}
                  className="w-8 h-8 rounded-full bg-ink/10 hover:bg-ink/20 flex items-center justify-center text-ink font-bold transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex p-1 rounded bg-ink/10 text-xs font-mono">
                <button
                  onClick={() => setFamilyGuideTab('rules')}
                  className={`flex-1 py-1.5 rounded transition cursor-pointer font-bold ${
                    familyGuideTab === 'rules' ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Regras de Ouro
                </button>
                <button
                  onClick={() => setFamilyGuideTab('glossary')}
                  className={`flex-1 py-1.5 rounded transition cursor-pointer font-bold ${
                    familyGuideTab === 'glossary' ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Glossário Técnico
                </button>
              </div>

              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {familyGuideTab === 'rules'
                  ? FAMILY_GOLDEN_RULES.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded bg-white/70 border border-ink/15 space-y-1.5 shadow-sm"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-display font-bold text-sm text-ink flex items-center gap-1.5">
                            <span>{item.icon}</span> {item.title}
                          </span>
                          <span className="font-mono text-[10px] text-ink-soft bg-ink/5 px-2 py-0.5 rounded">
                            {item.targetLabel}
                          </span>
                        </div>
                        <p className="text-xs text-ink leading-relaxed font-medium">
                          {item.practicalAction}
                        </p>
                      </div>
                    ))
                  : GLOSSARY_ITEMS.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded bg-white/70 border border-ink/15 space-y-1 shadow-sm"
                      >
                        <h4 className="font-display font-bold text-sm text-ink">{item.term}</h4>
                        <p className="text-xs text-ink leading-relaxed">{item.simpleMeaning}</p>
                      </div>
                    ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
