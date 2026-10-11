import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  ChevronDown,
  Flame,
  ArrowRight,
  X,
  Trophy,
  BookOpen,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
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

export const CaseDesk: React.FC<CaseDeskProps> = ({ onScoreUpdate }) => {
  const [caseNumber, setCaseNumber] = useState(1);
  const [current, setCurrent] = useState<ScamCase>(() => generateDynamicScamCase(0));
  const [isAppOpened, setIsAppOpened] = useState(false);
  const [openClue, setOpenClue] = useState<string | null>(null);
  const [inspected, setInspected] = useState<string[]>([]);

  // Condução Interativa no Celular & Coleta de Provas
  const [executedActionIds, setExecutedActionIds] = useState<string[]>([]);
  const [actionHistory, setActionHistory] = useState<{ player: string; reply: string }[]>([]);
  

  // Veredito Direto e Intuitivo
  const [finalVerdict, setFinalVerdict] = useState<Verdict | null>(null);
  const [isStoryDelivered, setIsStoryDelivered] = useState(false);

  const [streak, setStreak] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [solved, setSolved] = useState(0);
  
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
  const resultRef = useRef<HTMLDivElement>(null);

  const answered = finalVerdict !== null;
  const wasVerdictCorrect = answered ? (finalVerdict === 'scam') === current.isScam : null;

  const unlockBadge = useCallback((badgeId: string) => {
    setUnlockedBadgeIds((prev) => {
      if (prev.includes(badgeId)) return prev;
      const badge = BADGES.find((b) => b.id === badgeId);
      if (badge) {
        setRecentBadgeUnlocked(badge);
        sound.playSuccess();
      }
      const updated = [...prev, badgeId];
      try {
        localStorage.setItem('hacklearn_unlocked_badges', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Executar ação de diálogo no celular
  const handlePerformPhoneAction = (action: InteractiveAction) => {
    setIsAppOpened(true);
    if (executedActionIds.includes(action.id)) return;

    setExecutedActionIds((prev) => [...prev, action.id]);
    setActionHistory((prev) => [...prev, { player: action.label, reply: action.replyMessage }]);

    if (action.evidenceDiscovered) {
      unlockBadge('badge-first-clue');
    }
  };

  // Inspecionar pistas práticas
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

  // Veredito Direto Point & Click
  const handleDirectVerdict = useCallback((v: Verdict) => {
    if (answered) return;

    const verdictCorrect = (v === 'scam') === current.isScam;
    setFinalVerdict(v);
    setOpenClue(null);

    let earned = 0;
    let newStreak = streak;

    if (verdictCorrect) {
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
    

    if (newSolved >= 6) {
      unlockBadge('badge-grand-master');
    }

    onScoreUpdate(newTotal, newSolved, newSolved >= SCAM_CASES.length);

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 200);
  }, [
    answered,
    current,
    inspected.length,
    onScoreUpdate,
    solved,
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
    
    setFinalVerdict(null);
    setIsAppOpened(false);
    setIsStoryDelivered(false);
    setOpenClue(null);
    setLastEarned(0);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [streak]);

  // Teclado no Desktop (G para Golpe, S para Seguro, Enter para Próximo)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (!answered) {
        if (k === 'g') handleDirectVerdict('scam');
        else if (k === 's') handleDirectVerdict('safe');
      } else if (answered && (k === 'enter' || k === ' ')) {
        nextCase();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, handleDirectVerdict, nextCase]);

  // Auto-fechar toast de conquista
  useEffect(() => {
    if (recentBadgeUnlocked) {
      const timer = setTimeout(() => {
        setRecentBadgeUnlocked(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [recentBadgeUnlocked]);

  

  return (
    <div ref={topRef} className="scroll-mt-16 pb-16 w-full">
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

      {/* CONTAINER RESPONSIVO (2 COLUNAS NO DESKTOP, 1 NO MOBILE) */}
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Barra Superior de Status do Jogo */}
        <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-2xl bg-desk-2/90 border border-desk-line backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase px-2.5 py-1 rounded-lg bg-desk border border-desk-line text-white font-bold">
              Caso #{String(caseNumber).padStart(2, '0')}
            </span>
            <span className="text-xs font-semibold text-emerald-400 capitalize hidden sm:inline">
              {current.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {streak > 1 && (
              <span className="flex items-center gap-1 font-mono text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 font-bold animate-pulse">
                <Flame className="w-3.5 h-3.5" />
                {streak}x Combo
              </span>
            )}

            <button
              onClick={() => {
                sound.playBlip();
                setIsBadgesModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-desk hover:bg-desk-line text-amber-400 border border-desk-line transition cursor-pointer"
              title="Ver Conquistas"
            >
              <Trophy className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playBlip();
                setIsFamilyGuideOpen(true);
              }}
              className="p-1.5 rounded-lg bg-desk hover:bg-desk-line text-sky-400 border border-desk-line transition cursor-pointer"
              title="Cartilha de Proteção"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* GRID PRINCIPAL: CELULAR À ESQUERDA + HISTÓRIA E QUESTIONAMENTOS À DIREITA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* COLUNA ESQUERDA: O CELULAR REALISTA (lg:col-span-6) */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full max-w-[370px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                >
                  <PhoneScreen
                    scamCase={current}
                    stamped={finalVerdict}
                    wasCorrect={wasVerdictCorrect}
                    onPerformAction={handlePerformPhoneAction}
                    executedActionIds={executedActionIds}
                    actionHistory={actionHistory}
                    onAppOpenChange={(opened) => setIsAppOpened(opened)}
                    onVerdict={handleDirectVerdict}
                    onNextCase={nextCase}
                    inspectedClueIds={inspected}
                    onInspectClue={inspect}
                    onStoryDeliveredChange={(delivered) => setIsStoryDelivered(delivered)}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="text-[11px] text-white/50 text-center mt-2.5 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-marker" />
              <span>Mexa no celular: abra apps, consulte o Bloco de Notas ou decida direto no aparelho</span>
            </p>
          </div>

          {/* COLUNA DIREITA: HISTÓRIA & QUESTIONAMENTOS QUE FAZEM SENTIDO (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-4">
            {/* CARD 1: O Cenário & A História do Momento */}
            <div className="rounded-2xl bg-desk-2 border border-desk-line p-4 sm:p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-marker font-bold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>História em Andamento</span>
                </span>
                <span className="text-[11px] font-mono text-white/50">
                  {current.time}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-display font-extrabold text-white">
                {current.title}
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mt-2 font-medium">
                {!isAppOpened
                  ? "Você estava mexendo no celular tranquilamente em seu dia a dia quando, de repente, o aparelho vibra com uma mensagem inesperada... Olhe para a tela do celular e toque na notificação para conferir quem mandou."
                  : current.dilemma}
              </p>
            </div>

            {/* CARD 2: 🤔 Pensando Bem... Questionamentos que Fazem Sentido */}
            <div className="rounded-2xl bg-desk-2 border border-desk-line p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-desk-line/70 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤔</span>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-white">
                      Questionamentos que Fazem Sentido
                    </h3>
                    <p className="text-[11px] text-clip">
                      Dúvidas lógicas que surgem ao ler essa mensagem:
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 shrink-0">
                  {inspected.length}/{current.clues.length} tirados a limpo
                </span>
              </div>

              {/* Lista de questionamentos lógicos - revelada após o remetente concluir o envio no celular */}
              {!isStoryDelivered ? (
                <div className="rounded-xl border border-desk-line bg-desk/70 p-4 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-xs text-marker font-mono uppercase font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Acompanhe o celular: remetente digitando...</span>
                  </div>
                  <p className="text-xs text-neutral-300 font-medium">
                    Foque na tela do aparelho e acompanhe a mensagem conforme ela chega. As dúvidas investigativas serão liberadas logo a seguir.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {current.clues.map((clue, idx) => {
                    const isOpen = openClue === clue.id;
                    const seen = inspected.includes(clue.id);
                    return (
                      <div
                        key={clue.id}
                        className={`rounded-xl border transition-all overflow-hidden ${
                          isOpen
                            ? 'border-marker/50 bg-black/40'
                            : seen
                            ? 'border-emerald-500/30 bg-desk'
                            : 'border-desk-line bg-desk hover:border-desk-line/80'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => inspect(clue)}
                          className="w-full flex items-start gap-3 p-3 text-left hover:bg-white/5 transition cursor-pointer"
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5 ${
                              seen
                                ? 'bg-emerald-500 text-white'
                                : 'border border-desk-line text-clip'
                            }`}
                          >
                            {seen ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                          </span>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-marker font-semibold">
                                Dúvida #{idx + 1}
                              </span>
                              {seen && (
                                <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-400/15 px-1.5 rounded">
                                  Checado +{CLUE_XP} XP
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-xs sm:text-[13px] text-white mt-0.5 leading-snug">
                              {clue.question}
                            </p>
                          </div>

                          <ChevronDown
                            className={`w-4 h-4 text-clip transition-transform shrink-0 mt-1 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-3 pb-3 pt-1 border-t border-desk-line/50 space-y-2 bg-black/30"
                            >
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                                  🔎 Prova Real no Aparelho:
                                </span>
                                <p className="text-xs text-neutral-200 leading-relaxed font-medium">
                                  {clue.inspection.observation}
                                </p>
                              </div>

                              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[11px] text-neutral-300">
                                <span className="text-marker font-bold">💡 Fato: </span>
                                {clue.evidenceResult.fato}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CARD 3: Veredito Limpo e Direto */}
            {!answered ? (
              isStoryDelivered ? (
                <div className="pt-1 space-y-2">
                  <div className="text-center font-mono text-[10px] uppercase text-clip font-bold tracking-wider">
                    Com base no que você investigou, qual é o seu veredito?
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleDirectVerdict('scam')}
                      className="py-4 px-3 rounded-2xl bg-scam hover:bg-scam/90 text-white font-display font-extrabold text-base sm:text-lg uppercase tracking-wider shadow-[0_8px_20px_rgba(226,61,61,0.35)] active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 border border-white/20"
                    >
                      <ShieldAlert className="w-6 h-6" />
                      <span>É Golpe!</span>
                      <span className="text-[10px] opacity-75 font-mono font-normal">tecla G</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDirectVerdict('safe')}
                      className="py-4 px-3 rounded-2xl bg-safe hover:bg-safe/90 text-white font-display font-extrabold text-base sm:text-lg uppercase tracking-wider shadow-[0_8px_20px_rgba(31,164,99,0.35)] active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 border border-white/20"
                    >
                      <ShieldCheck className="w-6 h-6" />
                      <span>É Seguro</span>
                      <span className="text-[10px] opacity-75 font-mono font-normal">tecla S</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center font-mono text-[10px] uppercase text-clip/60 font-semibold tracking-wider py-2">
                  Leia a mensagem no celular para liberar as opções de veredito.
                </div>
              )
            ) : (
              /* CARD DE RESULTADO / FEEDBACK PÓS-VEREDITO */
              <AnimatePresence>
                <motion.div
                  ref={resultRef}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-1"
                >
                  <div
                    className={`rounded-2xl p-4 sm:p-5 border-2 shadow-2xl ${
                      wasVerdictCorrect
                        ? 'border-safe/60 bg-safe/15 text-white'
                        : 'border-scam/60 bg-scam/15 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {wasVerdictCorrect ? (
                          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                        ) : (
                          <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
                        )}
                        <h3 className="font-display font-extrabold text-base sm:text-lg">
                          {wasVerdictCorrect
                            ? 'Mandou Bem! Você Acertou!'
                            : current.isScam
                            ? 'Cuidado! Você Caiu no Golpe!'
                            : 'Alarme Falso! A Mensagem Era Segura.'}
                        </h3>
                      </div>
                      {wasVerdictCorrect && (
                        <span className="font-mono font-bold text-xs bg-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/40">
                          +{lastEarned} XP
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-medium mt-1">
                      {current.keyEvidenceReason || current.explanation}
                    </p>

                    {/* Regra de Ouro Educativa */}
                    <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <div className="font-mono text-[9px] uppercase tracking-wider text-marker font-bold flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-marker" /> Regra de Ouro de Segurança:
                      </div>
                      <p className="font-semibold text-xs sm:text-[13px] text-white leading-snug">
                        {current.pedagogy.goldenRule}
                      </p>
                    </div>
                  </div>

                  {/* Botão de Avançar com Destaque */}
                  <button
                    type="button"
                    onClick={nextCase}
                    className="w-full py-4 px-4 rounded-2xl bg-marker hover:bg-[#ffc91f] text-ink font-display font-extrabold text-base sm:text-lg uppercase tracking-wider shadow-[0_8px_25px_rgba(255,216,74,0.4)] active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Bora pro Próximo Caso</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Sala de Conquistas */}
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

      {/* MODAL: Cartilha de Proteção Familiar */}
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
