import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Flame,
  X,
  Trophy,
  BookOpen,
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
import { PhoneScreen, type Skill } from './PhoneScreen';

// Ordem Curada da Campanha Principal dos 9 Níveis (GDD Indie Triple-A)
export const CAMPAIGN_CASES: ScamCase[] = [
  SCAM_CASES.find((c) => c.id === 'case-1-whatsapp') || SCAM_CASES[0],
  SCAM_CASES.find((c) => c.id === 'case-2-correios') || SCAM_CASES[1],
  SCAM_CASES.find((c) => c.id === 'case-3-compra-aprovada') || SCAM_CASES[2],
  SCAM_CASES.find((c) => c.id === 'case-4-falsa-central') || SCAM_CASES[3],
  SCAM_CASES.find((c) => c.id === 'case-6-sms-seguranca-real') || SCAM_CASES[5], // Caso controle 2FA
  SCAM_CASES.find((c) => c.id === 'case-5-loja-falsa-promocao') || SCAM_CASES[4],
  SCAM_CASES.find((c) => c.id === 'case-7-vaga-tarefas') || SCAM_CASES[6],
  SCAM_CASES.find((c) => c.id === 'case-8-receita-ecac') || SCAM_CASES[7],
  SCAM_CASES.find((c) => c.id === 'case-9-mao-fantasma-suporte') || SCAM_CASES[8], // Boss case
];

export const getCaseForLevel = (levelIndex: number): ScamCase => {
  if (levelIndex < CAMPAIGN_CASES.length) {
    return CAMPAIGN_CASES[levelIndex];
  }
  return generateDynamicScamCase(levelIndex);
};

interface CaseDeskProps {
  onScoreUpdate: (totalXp: number, completedCount: number, allCompleted: boolean) => void;
}

type Verdict = 'scam' | 'safe';

const CLUE_XP = 10;
const comboBonusFor = (streak: number) => (streak >= 3 ? 30 : streak === 2 ? 10 : 0);

export const CaseDesk: React.FC<CaseDeskProps> = ({ onScoreUpdate }) => {
  const [caseNumber, setCaseNumber] = useState(1);
  const [current, setCurrent] = useState<ScamCase>(() => getCaseForLevel(0));
  const [inspected, setInspected] = useState<string[]>([]);

  // Condução Interativa no Celular & Coleta de Provas
  const [executedActionIds, setExecutedActionIds] = useState<string[]>([]);
  const [actionHistory, setActionHistory] = useState<{ player: string; reply: string }[]>([]);

  // Veredito Direto e Intuitivo
  const [finalVerdict, setFinalVerdict] = useState<Verdict | null>(null);

  const [streak, setStreak] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [solved, setSolved] = useState(0);
  
  const [lastEarned, setLastEarned] = useState(0);

  // Habilidades aprendidas com o Lucas (persistidas no navegador)
  const [unlockedSkills, setUnlockedSkills] = useState<Skill[]>(() => {
    try {
      const saved = localStorage.getItem('hacklearn_unlocked_skills');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleUnlockSkill = useCallback((skill: Skill) => {
    setUnlockedSkills((prev) => {
      if (prev.includes(skill)) return prev;
      const updated = [...prev, skill];
      try {
        localStorage.setItem('hacklearn_unlocked_skills', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

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

  const [hasCompletedInitialBoot, setHasCompletedInitialBoot] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem('hacklearn_initial_boot') === 'true';
    } catch {
      return false;
    }
  });

  const handleCompleteInitialBoot = useCallback(() => {
    setHasCompletedInitialBoot(true);
    try {
      sessionStorage.setItem('hacklearn_initial_boot', 'true');
    } catch {
      // ignore
    }
  }, []);

  const topRef = useRef<HTMLDivElement>(null);

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

    onScoreUpdate(newTotal, newSolved, newSolved >= CAMPAIGN_CASES.length);
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
    const nextIdx = solved;
    setCurrent(getCaseForLevel(nextIdx));
    setCaseNumber((n) => n + 1);
    setExecutedActionIds([]);
    setActionHistory([]);
    setFinalVerdict(null);
    setLastEarned(0);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [solved]);

  // Teclado no Desktop (Enter ou Espaço para avançar após veredito)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (answered && (k === 'enter' || k === ' ')) {
        nextCase();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, nextCase]);

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
    <div ref={topRef} className="h-full w-full flex flex-col overflow-hidden">
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

      {/* CONTAINER PRINCIPAL DO JOGO (STATUS + SMARTPHONE CENTRALIZADO) */}
      <div className="h-full max-w-5xl mx-auto flex flex-col gap-1.5 sm:gap-2.5 w-full overflow-hidden">
        {/* Barra Superior de Status do Jogo (Visível no desktop; no mobile o status fica diegético no próprio aparelho) */}
        <div className="shrink-0 hidden sm:flex items-center justify-between gap-1.5 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-desk-2/90 border border-desk-line backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] sm:text-xs uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-desk border border-desk-line text-white font-bold">
              {caseNumber <= CAMPAIGN_CASES.length
                ? `Nível ${caseNumber} / ${CAMPAIGN_CASES.length}`
                : `Caso #${String(caseNumber).padStart(2, '0')} (Modo Infinito)`}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 capitalize hidden sm:inline">
              {current.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {streak > 1 && (
              <span className="flex items-center gap-1 font-mono text-[10.5px] sm:text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 font-bold animate-pulse">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {streak}x Combo
              </span>
            )}

            <button
              onClick={() => {
                sound.playBlip();
                setIsBadgesModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-desk hover:bg-desk-line text-amber-400 border border-desk-line transition cursor-pointer active:scale-95"
              title="Ver Conquistas"
            >
              <Trophy className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playBlip();
                setIsFamilyGuideOpen(true);
              }}
              className="p-1.5 rounded-lg bg-desk hover:bg-desk-line text-sky-400 border border-desk-line transition cursor-pointer active:scale-95"
              title="Cartilha de Proteção"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CELULAR CENTRALIZADO (FOCO TOTAL NA EXPERIÊNCIA DO APARELHO) */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full max-w-full sm:max-w-[430px] mx-auto overflow-hidden">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="w-full h-full flex flex-col items-center justify-center"
              >
                <PhoneScreen
                  scamCase={current}
                  levelIndex={caseNumber}
                  totalLevels={CAMPAIGN_CASES.length}
                  stamped={finalVerdict}
                  wasCorrect={wasVerdictCorrect}
                  onPerformAction={handlePerformPhoneAction}
                  executedActionIds={executedActionIds}
                  actionHistory={actionHistory}
                  onVerdict={handleDirectVerdict}
                  onNextCase={nextCase}
                  inspectedClueIds={inspected}
                  onInspectClue={inspect}
                  unlockedSkills={unlockedSkills}
                  onUnlockSkill={handleUnlockSkill}
                  earnedXp={lastEarned}
                  initialBootDone={hasCompletedInitialBoot}
                  onCompleteInitialBoot={handleCompleteInitialBoot}
                />
              </motion.div>
            </AnimatePresence>
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
