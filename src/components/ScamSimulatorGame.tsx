import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flame,
  ChevronRight,
  Sparkles,
  Search,
  BookOpen,
  Trophy,
  MessageSquare,
  Phone,
  PhoneCall,
  Mail,
  FileText,
  HelpCircle,
  TrendingUp,
  Globe,
  CreditCard,
  Brain,
  Server,
  Clock,
  Lightbulb,
  Zap,
  ShoppingBag,
  Briefcase,
  Lock,
  Gavel,
  Eye,
  RotateCcw,
} from 'lucide-react';
import {
  SCAM_CASES,
  BADGES,
  FAMILY_GOLDEN_RULES,
  GLOSSARY_ITEMS,
  calculatePlayerRank,
  type ScamCase,
  type ScamLevel,
  type InvestigativeClue,
  type Badge,
  type ReinforcementOption,
} from '../data/scamsData';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { AnimatedCounter } from './AnimatedCounter';
import { DetectiveDiorama3D } from './DetectiveDiorama3D';
import { generateDynamicScamCase } from '../data/dynamicScamsGenerator';

interface ScamSimulatorGameProps {
  onScoreUpdate: (totalXp: number, completedCount: number, allCompleted: boolean) => void;
}

export const ScamSimulatorGame: React.FC<ScamSimulatorGameProps> = ({ onScoreUpdate }) => {
  const [gameMode, setGameMode] = useState<'campaign' | 'dynamic'>('campaign');
  const [dynamicCase, setDynamicCase] = useState<ScamCase>(() => generateDynamicScamCase());
  const [currentLevel, setCurrentLevel] = useState<ScamLevel>('basico');
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);

  // Registro de respostas e laudos periciais
  const [answers, setAnswers] = useState<{
    [caseId: string]: {
      answered: boolean;
      isCorrect: boolean;
      userChoice: boolean;
      cluesDiscovered: string[];
      bonusXp: number;
      comboBonus: number;
      penaltyXp?: number;
      selectedHypothesis?: number | null;
      hypothesisCorrect?: boolean;
    };
  }>({});

  // Pistas investigadas no caso atual
  const [discoveredClues, setDiscoveredClues] = useState<{ [caseId: string]: string[] }>({});
  const [expandedClueId, setExpandedClueId] = useState<string | null>(null);
  const [floatingXp, setFloatingXp] = useState<number | null>(null);

  // Seleções ativas da Bancada Pericial
  const [selectedVerdict, setSelectedVerdict] = useState<boolean | null>(null);
  const [selectedHypothesis, setSelectedHypothesis] = useState<number | null>(null);

  // Treino de Reforço em caso de erro
  const [drillSelectedOptionId, setDrillSelectedOptionId] = useState<string | null>(null);
  const [drillSuccess, setDrillSuccess] = useState<boolean>(false);
  const [drillBonusAwarded, setDrillBonusAwarded] = useState<boolean>(false);

  // Gamificação pedagógica
  const [streak, setStreak] = useState(0);

  // Sistema de Medalhas / Conquistas
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

  const saveBadges = (newIds: string[]) => {
    try {
      localStorage.setItem('hacklearn_unlocked_badges', JSON.stringify(newIds));
    } catch {
      // ignore
    }
  };

  const unlockBadge = (badgeId: string) => {
    if (unlockedBadgeIds.includes(badgeId)) return;
    const badge = BADGES.find((b) => b.id === badgeId);
    if (!badge) return;

    setUnlockedBadgeIds((prev) => {
      const updated = [...prev, badgeId];
      saveBadges(updated);
      return updated;
    });

    setRecentBadgeUnlocked(badge);
    sound.playBadgeUnlock();
  };

  // Casos do nível atual ou Caso Dinâmico
  const levelCases = SCAM_CASES.filter((c) => c.level === currentLevel);
  const currentCase: ScamCase =
    gameMode === 'dynamic' ? dynamicCase : (levelCases[currentCaseIndex] || levelCases[0]);

  const getScenarioType = (c: ScamCase): 'whatsapp' | 'correios' | 'banco' | 'loja' | 'tarefas' | 'remoto' | 'oficial' | 'geral' => {
    const cat = (c.category || '').toLowerCase();
    const id = (c.id || '').toLowerCase();
    const title = (c.title || '').toLowerCase();

    if (id.includes('whatsapp') || cat.includes('whatsapp') || cat.includes('família')) return 'whatsapp';
    if (id.includes('correios') || cat.includes('encomenda') || cat.includes('sms')) return 'correios';
    if (id.includes('central') || id.includes('0800') || c.channel === 'call' || cat.includes('central')) return 'banco';
    if (id.includes('loja') || cat.includes('comércio') || cat.includes('loja') || title.includes('desconto')) return 'loja';
    if (id.includes('tarefa') || cat.includes('vagas') || cat.includes('trabalho')) return 'tarefas';
    if (id.includes('fantasma') || cat.includes('remoto') || title.includes('anydesk')) return 'remoto';
    if (id.includes('ecac') || id.includes('receita') || cat.includes('cidadania')) return 'oficial';
    return 'banco';
  };

  // Pistas coletadas no caso atual
  const currentCaseDiscovered = discoveredClues[currentCase.id] || [];

  // Métricas gerais de pontuação e progresso
  const totalCases = SCAM_CASES.length;
  const currentAnswerData = answers[currentCase.id];

  const totalScore = Math.max(0, Object.entries(answers).reduce((acc, [caseId, data]) => {
    if (!data.isCorrect) {
      return acc - (data.penaltyXp || 0);
    }
    const found = SCAM_CASES.find((c) => c.id === caseId);
    const baseReward = data.hypothesisCorrect !== false ? (found?.xpReward || 0) : Math.round((found?.xpReward || 0) * 0.5);
    return acc + baseReward + (data.bonusXp || 0) + (data.comboBonus || 0);
  }, 0));

  const playerRank = calculatePlayerRank(totalScore);

  const levelFinishedCount = levelCases.filter((c) => answers[c.id]?.answered).length;
  const levelProgressPercentage = Math.round((levelFinishedCount / levelCases.length) * 100);

  const totalFinishedCount = Object.keys(answers).length;
  const totalProgressPercentage = Math.round((totalFinishedCount / totalCases) * 100);

  // Jogador clica para investigar uma pista específica
  const handleInspectClue = (clue: InvestigativeClue) => {
    sound.playBlip();
    setExpandedClueId((prev) => (prev === clue.id ? null : clue.id));

    const alreadyDiscovered = currentCaseDiscovered.includes(clue.id);
    if (!alreadyDiscovered) {
      const updatedClues = [...currentCaseDiscovered, clue.id];
      setDiscoveredClues((prev) => ({
        ...prev,
        [currentCase.id]: updatedClues,
      }));

      unlockBadge('badge-first-clue');

      if (clue.category === 'whois' && clue.evidenceResult.status === 'suspicious') {
        unlockBadge('badge-whois-master');
      }
    }
  };

  // Veredito e Julgamento do Caso pelo Detetive
  const handleProtocolReport = () => {
    if (selectedVerdict === null) return;
    if (selectedHypothesis === null) return;
    if (answers[currentCase.id]?.answered) return;

    const isCorrect = selectedVerdict === currentCase.isScam;
    const hypothesisCorrect = selectedHypothesis === currentCase.correctEvidenceIndex;
    const cluesFoundCount = (discoveredClues[currentCase.id] || []).length;

    // Bônus de 10 XP por cada pista investigada antes do laudo
    const bonusXp = isCorrect ? cluesFoundCount * 10 : 0;

    let newStreak = streak;
    let comboBonus = 0;
    let earnedTotal = 0;
    let penaltyXp = 0;

    if (isCorrect && hypothesisCorrect) {
      sound.playSuccess();
      newStreak = streak + 1;
      setStreak(newStreak);

      if (newStreak >= 3) {
        comboBonus = 30;
        unlockBadge('badge-streak-fire');
      } else if (newStreak === 2) {
        comboBonus = 10;
      }

      earnedTotal = (currentCase.xpReward || 0) + bonusXp + comboBonus;
      setFloatingXp(earnedTotal);

      // Efeito festivo de confetes Apple
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#0071e3', '#30d158', '#2997ff', '#ff9f0a', '#ffffff'],
      });

      if (currentCase.id === 'case-1-whatsapp') unlockBadge('badge-family-shield');
      if (currentCase.id === 'case-7-vaga-tarefas' || currentCase.id === 'case-9-mao-fantasma-suporte') unlockBadge('badge-anti-ghost');
      if (['case-1-whatsapp', 'case-4-falsa-central'].includes(currentCase.id)) {
        unlockBadge('badge-pix-guard');
      }
      if (currentCase.id === 'case-4-falsa-central' || currentCase.id === 'case-8-receita-ecac') {
        const otherCaseAnswer = answers[currentCase.id === 'case-4-falsa-central' ? 'case-8-receita-ecac' : 'case-4-falsa-central'];
        if (otherCaseAnswer?.isCorrect) {
          unlockBadge('badge-central-bank-expert');
        }
      }
    } else if (isCorrect && !hypothesisCorrect) {
      // Veredito correto, mas prova incorreta (acerto parcial)
      sound.playSuccess();
      earnedTotal = Math.round((currentCase.xpReward || 0) * 0.5) + bonusXp;
      setFloatingXp(earnedTotal);
    } else {
      sound.playError();
      setStreak(0);
      if (currentLevel === 'avancado') {
        penaltyXp = 25;
        setFloatingXp(-25);
      } else {
        setFloatingXp(null);
      }
    }

    const newAnswers = {
      ...answers,
      [currentCase.id]: {
        answered: true,
        isCorrect,
        userChoice: selectedVerdict,
        cluesDiscovered: discoveredClues[currentCase.id] || [],
        bonusXp,
        comboBonus,
        penaltyXp,
        selectedHypothesis,
        hypothesisCorrect,
      },
    };

    setAnswers(newAnswers);

    const newTotalXp = Math.max(0, Object.entries(newAnswers).reduce((acc, [caseId, data]) => {
      const found = SCAM_CASES.find((c) => c.id === caseId);
      if (data.isCorrect) {
        const baseReward = data.hypothesisCorrect !== false ? (found?.xpReward || 0) : Math.round((found?.xpReward || 0) * 0.5);
        return acc + baseReward + (data.bonusXp || 0) + (data.comboBonus || 0);
      } else {
        return acc - (data.penaltyXp || 0);
      }
    }, 0));

    const newCompletedCount = Object.keys(newAnswers).length;
    const allCompleted = newCompletedCount === totalCases;

    if (allCompleted) {
      unlockBadge('badge-grand-master');
    }

    onScoreUpdate(newTotalXp, newCompletedCount, allCompleted);
  };

  const handleDrillOptionSelect = (option: ReinforcementOption) => {
    sound.playBlip();
    setDrillSelectedOptionId(option.id);
    if (option.isCorrect) {
      sound.playSuccess();
      setDrillSuccess(true);
      if (!drillBonusAwarded) {
        setDrillBonusAwarded(true);
        setFloatingXp(15);
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.65 },
          colors: ['#30d158', '#2997ff', '#ffffff'],
        });
        const currentAnswer = answers[currentCase.id];
        if (currentAnswer) {
          const updatedAnswers = {
            ...answers,
            [currentCase.id]: {
              ...currentAnswer,
              bonusXp: (currentAnswer.bonusXp || 0) + 15,
            },
          };
          setAnswers(updatedAnswers);
          const newTotalXp = Math.max(0, Object.entries(updatedAnswers).reduce((acc, [caseId, data]) => {
            const found = SCAM_CASES.find((c) => c.id === caseId);
            if (data.isCorrect) {
              const baseReward = data.hypothesisCorrect !== false ? (found?.xpReward || 0) : Math.round((found?.xpReward || 0) * 0.5);
              return acc + baseReward + (data.bonusXp || 0) + (data.comboBonus || 0);
            } else {
              return acc - (data.penaltyXp || 0) + (data.bonusXp || 0);
            }
          }, 0));
          onScoreUpdate(newTotalXp, Object.keys(updatedAnswers).length, Object.keys(updatedAnswers).length === totalCases);
        }
      }
    } else {
      sound.playError();
      setDrillSuccess(false);
    }
  };

  const handleNextCase = () => {
    sound.playBlip();
    setExpandedClueId(null);
    setFloatingXp(null);
    setSelectedVerdict(null);
    setSelectedHypothesis(null);
    setDrillSelectedOptionId(null);
    setDrillSuccess(false);
    setDrillBonusAwarded(false);

    if (gameMode === 'dynamic') {
      setDynamicCase(generateDynamicScamCase());
      return;
    }

    if (currentCaseIndex < levelCases.length - 1) {
      setCurrentCaseIndex((prev) => prev + 1);
    } else {
      if (currentLevel === 'basico') {
        setCurrentLevel('medio');
        setCurrentCaseIndex(0);
      } else if (currentLevel === 'medio') {
        setCurrentLevel('avancado');
        setCurrentCaseIndex(0);
      }
    }
  };

  const handleSelectLevel = (level: ScamLevel) => {
    sound.playBlip();
    setGameMode('campaign');
    setCurrentLevel(level);
    setCurrentCaseIndex(0);
    setExpandedClueId(null);
    setFloatingXp(null);
    setSelectedVerdict(null);
    setSelectedHypothesis(null);
    setDrillSelectedOptionId(null);
    setDrillSuccess(false);
    setDrillBonusAwarded(false);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-[#30d158]" />;
      case 'call':
        return <Phone className="w-3.5 h-3.5 text-[#0071e3]" />;
      case 'sms':
        return <MessageSquare className="w-3.5 h-3.5 text-[#ff9f0a]" />;
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-[#bf5af2]" />;
      default:
        return <Mail className="w-3.5 h-3.5 text-[#2997ff]" />;
    }
  };

  const getLevelIcon = (level: ScamLevel) => {
    switch (level) {
      case 'basico':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#30d158]" />;
      case 'medio':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#ff9f0a]" />;
      case 'avancado':
        return <Zap className="w-3.5 h-3.5 text-[#ff3b30]" />;
    }
  };

  const getClueCategoryIcon = (category: string) => {
    switch (category) {
      case 'whois':
        return <Globe className="w-4 h-4 text-[#2997ff]" />;
      case 'pix':
        return <CreditCard className="w-4 h-4 text-[#30d158]" />;
      case 'phone':
        return <PhoneCall className="w-4 h-4 text-[#bf5af2]" />;
      case 'behavior':
        return <Brain className="w-4 h-4 text-[#ff9f0a]" />;
      case 'system':
      default:
        return <Server className="w-4 h-4 text-[#64d2ff]" />;
    }
  };

  const getClueCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'whois':
        return 'bg-[#2997ff]/10 border-[#2997ff]/25 text-[#2997ff]';
      case 'pix':
        return 'bg-[#30d158]/10 border-[#30d158]/25 text-[#30d158]';
      case 'phone':
        return 'bg-[#bf5af2]/10 border-[#bf5af2]/25 text-[#bf5af2]';
      case 'behavior':
        return 'bg-[#ff9f0a]/10 border-[#ff9f0a]/25 text-[#ff9f0a]';
      case 'system':
      default:
        return 'bg-[#64d2ff]/10 border-[#64d2ff]/25 text-[#64d2ff]';
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('família') || cat.includes('whatsapp')) {
      return <MessageSquare className="w-4 h-4 text-[#30d158]" />;
    }
    if (cat.includes('sms') || cat.includes('encomenda')) {
      return <Mail className="w-4 h-4 text-[#ff9f0a]" />;
    }
    if (cat.includes('segurança')) {
      return <ShieldCheck className="w-4 h-4 text-[#30d158]" />;
    }
    if (cat.includes('0800') || cat.includes('central') || cat.includes('ligação')) {
      return <PhoneCall className="w-4 h-4 text-[#ff3b30]" />;
    }
    if (cat.includes('comércio') || cat.includes('social') || cat.includes('loja')) {
      return <ShoppingBag className="w-4 h-4 text-[#ff9f0a]" />;
    }
    if (cat.includes('vagas') || cat.includes('emprego') || cat.includes('tarefas')) {
      return <Briefcase className="w-4 h-4 text-[#2997ff]" />;
    }
    if (cat.includes('fantasma') || cat.includes('malware') || cat.includes('aplicativo')) {
      return <Lock className="w-4 h-4 text-[#ff3b30]" />;
    }
    return <ShieldAlert className="w-4 h-4 text-[#2997ff]" />;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Toast Apple de Conquista */}
      <AnimatePresence>
        {recentBadgeUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 rounded-2xl bg-[#1c1c1e] border border-white/[0.15] shadow-2xl flex items-center justify-between text-white max-w-lg mx-auto"
          >
            <div className="flex items-center space-x-3.5">
              <span className="text-2xl p-2 bg-white/[0.08] rounded-xl flex-shrink-0">
                {recentBadgeUnlocked.icon}
              </span>
              <div>
                <span className="text-[11px] text-[#ff9f0a] font-medium block">
                  Conquista Desbloqueada
                </span>
                <h4 className="font-semibold text-sm text-white">
                  {recentBadgeUnlocked.title}
                </h4>
                <p className="text-xs text-[#86868b]">{recentBadgeUnlocked.description}</p>
              </div>
            </div>
            <button
              onClick={() => setRecentBadgeUnlocked(null)}
              className="px-3 py-1.5 rounded-full bg-white/[0.1] hover:bg-white/[0.15] text-white text-xs font-medium transition cursor-pointer"
            >
              OK
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* BLOCO 1: CENTRAL DE PROGRESSÃO & SELEÇÃO DE NÍVEIS (BENTO) */}
      {/* ======================================================== */}
      <div className="bg-[#161617] border border-white/[0.08] rounded-2xl p-4 space-y-3.5 shadow-lg">
        {/* Linha Superior: Seletor de Modo e Níveis */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-center lg:justify-start">
            {/* Alternador de Modo: Campanha vs Cenários Dinâmicos 3D */}
            <div className="flex items-center space-x-1 p-1 rounded-full bg-black/60 border border-white/[0.08]">
              <button
                onClick={() => {
                  sound.playBlip();
                  setGameMode('campaign');
                  setExpandedClueId(null);
                  setSelectedVerdict(null);
                  setSelectedHypothesis(null);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                  gameMode === 'campaign'
                    ? 'bg-[#0071e3] text-white shadow-sm'
                    : 'text-[#86868b] hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Casos Oficiais (9 Níveis)</span>
              </button>

              <button
                onClick={() => {
                  sound.playBlip();
                  setGameMode('dynamic');
                  setExpandedClueId(null);
                  setSelectedVerdict(null);
                  setSelectedHypothesis(null);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                  gameMode === 'dynamic'
                    ? 'bg-gradient-to-r from-[#bf5af2] to-[#2997ff] text-white shadow-md shadow-purple-500/20'
                    : 'text-[#86868b] hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ff9f0a]" />
                <span>⚡ Cenários Dinâmicos 3D</span>
              </button>
            </div>

            {/* Seletor de Níveis (em modo campanha) */}
            {gameMode === 'campaign' ? (
              <div className="flex items-center space-x-1 p-1 rounded-full bg-black/50 border border-white/[0.06]">
                {(['basico', 'medio', 'avancado'] as ScamLevel[]).map((level) => {
                  const lCases = SCAM_CASES.filter((c) => c.level === level);
                  const lFinished = lCases.filter((c) => answers[c.id]?.answered).length;
                  const isCurrent = currentLevel === level;

                  return (
                    <button
                      key={level}
                      onClick={() => handleSelectLevel(level)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center space-x-1.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'text-[#86868b] hover:text-white'
                      }`}
                    >
                      {getLevelIcon(level)}
                      <span className="capitalize">{level}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isCurrent ? 'bg-white/20 text-white' : 'bg-white/5 text-[#86868b]'
                        }`}
                      >
                        {lFinished}/{lCases.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <button
                onClick={() => {
                  sound.playBlip();
                  setDynamicCase(generateDynamicScamCase());
                  setExpandedClueId(null);
                  setFloatingXp(null);
                  setSelectedVerdict(null);
                  setSelectedHypothesis(null);
                  setDrillSelectedOptionId(null);
                  setDrillSuccess(false);
                  setDrillBonusAwarded(false);
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#bf5af2]/15 hover:bg-[#bf5af2]/25 text-[#bf5af2] border border-[#bf5af2]/35 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>🎲 Sortear Outro Cenário 3D</span>
              </button>
            )}
          </div>

          {/* Patente Atual do Jogador & Combo Streak */}
          <div className="flex items-center space-x-2">
            {streak > 1 && (
              <motion.div
                initial={{ scale: 0.85 }}
                animate={{ scale: [1, 1.15, 1], rotate: [0, -6, 6, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="flex items-center space-x-1 px-3 py-1 rounded-full bg-[#ff9f0a]/15 text-[#ff9f0a] text-xs font-semibold border border-[#ff9f0a]/30 shadow-sm"
              >
                <Flame className="w-3.5 h-3.5 fill-[#ff9f0a]" />
                <span>{streak}x Combo</span>
              </motion.div>
            )}

            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs text-white shadow-sm">
              <span>{playerRank.icon}</span>
              <span className="font-medium text-[#f5f5f7]">{playerRank.name}</span>
              <span className="text-[#86868b]">•</span>
              <AnimatedCounter value={totalScore} className="font-semibold text-[#2997ff]" suffix=" XP" />
            </div>

            <button
              onClick={() => {
                sound.playBlip();
                setIsBadgesModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-medium transition cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-[#ff9f0a]" />
              <span className="hidden sm:inline">Conquistas</span>
              <span className="text-[10px] text-[#86868b]">
                ({unlockedBadgeIds.length}/{BADGES.length})
              </span>
            </button>

            <button
              onClick={() => {
                sound.playBlip();
                setIsFamilyGuideOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-[#2997ff] text-xs font-medium transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cartilha</span>
            </button>
          </div>
        </div>

        {/* Linha Inferior: Barra Visual de Progresso do Nível */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-[#86868b]">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#2997ff]" />
              <span className="capitalize font-medium text-white">
                Nível {currentLevel}: Caso {currentCaseIndex + 1} de {levelCases.length}
              </span>
            </span>
            <span>
              {levelFinishedCount}/{levelCases.length} no nível ({levelProgressPercentage}%) • Trilha Geral: {totalFinishedCount}/{totalCases} ({totalProgressPercentage}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgressPercentage}%` }}
              transition={{ duration: 0.4 }}
              className="h-full bg-gradient-to-r from-[#0071e3] to-[#2997ff] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CONSOLE PRINCIPAL DESKTOP (Split View: Inspeção + Auditoria) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA ESQUERDA: Cartão Bento do Incidente sob Investigação (7 colunas) */}
        <motion.div
          key={currentCase.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:col-span-7 bg-[#161617] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl space-y-0"
        >
          {/* Header do Cartão Bento */}
          <div className="px-6 py-4 bg-white/[0.02] border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                {getCategoryIcon(currentCase.category)}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">{currentCase.title}</h3>
                <span className="text-[11px] text-[#86868b] font-medium">{currentCase.category}</span>
              </div>
            </div>

            {gameMode === 'campaign' ? (
              <div className="flex items-center space-x-1.5">
                {levelCases.map((c, idx) => {
                  const isAns = answers[c.id]?.answered;
                  const isAct = currentCaseIndex === idx;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        sound.playBlip();
                        setCurrentCaseIndex(idx);
                        setExpandedClueId(null);
                        setFloatingXp(null);
                        setSelectedVerdict(null);
                        setSelectedHypothesis(null);
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                        isAct
                          ? 'bg-[#0071e3] text-white shadow-sm'
                          : isAns
                          ? 'bg-white/[0.08] text-[#30d158] hover:bg-white/[0.12]'
                          : 'bg-white/[0.04] text-[#86868b] hover:text-white'
                      }`}
                    >
                      <span>Caso {idx + 1}</span>
                      {isAns && <CheckCircle2 className="w-3 h-3 text-[#30d158]" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <button
                onClick={() => {
                  sound.playBlip();
                  setDynamicCase(generateDynamicScamCase());
                  setExpandedClueId(null);
                  setFloatingXp(null);
                  setSelectedVerdict(null);
                  setSelectedHypothesis(null);
                  setDrillSelectedOptionId(null);
                  setDrillSuccess(false);
                  setDrillBonusAwarded(false);
                }}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#bf5af2] to-[#2997ff] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-purple-500/20 hover:opacity-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>🎲 Sortear Novo Cenário 3D</span>
              </button>
            )}
          </div>

          {/* Conteúdo do Incidente */}
          <div className="p-6 space-y-5">
            
            {/* ======================================================== */}
            {/* BLOCO DE DÚVIDA / DILEMA INVESTIGATIVO (Gera Dúvida Real) */}
            {/* ======================================================== */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#ff9f0a]/10 to-[#ff9f0a]/5 border border-[#ff9f0a]/25 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-[#ff9f0a]/15 border border-[#ff9f0a]/30 flex items-center justify-center flex-shrink-0 text-[#ff9f0a] mt-0.5">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-[#ff9f0a] uppercase tracking-wider block">
                  Dilema do Investigador:
                </span>
                <p className="text-xs text-[#f5f5f7] leading-relaxed font-medium">
                  {currentCase.dilemma}
                </p>
              </div>
            </div>

            {/* Diorama 3D Pericial com Bonecos em Cenário Hipotético (Three.js) */}
            <DetectiveDiorama3D
              scenarioType={getScenarioType(currentCase)}
              isScam={currentCase.isScam}
              verdictResult={
                currentAnswerData?.answered
                  ? currentAnswerData.isCorrect
                    ? 'correct'
                    : 'incorrect'
                  : null
              }
              onPropClick={(propName) => {
                sound.playBlip();
                if (propName.includes('celular') || propName.includes('whatsapp')) {
                  const target = currentCase.clues.find((c) => c.category === 'phone' || c.category === 'behavior');
                  if (target) handleInspectClue(target);
                } else if (propName.includes('pacote') || propName.includes('correios')) {
                  const target = currentCase.clues.find((c) => c.category === 'whois' || c.category === 'system');
                  if (target) handleInspectClue(target);
                } else if (propName.includes('banco') || propName.includes('terminal')) {
                  const target = currentCase.clues.find((c) => c.category === 'pix' || c.category === 'official');
                  if (target) handleInspectClue(target);
                } else if (propName.includes('computador') || propName.includes('remoto')) {
                  const target = currentCase.clues.find((c) => c.category === 'system' || c.category === 'behavior');
                  if (target) handleInspectClue(target);
                } else if (currentCase.clues[0]) {
                  handleInspectClue(currentCase.clues[0]);
                }
              }}
            />

            {/* Linha de Metadados do Remetente */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-white/10 to-white/20 border border-white/10 flex items-center justify-center font-semibold text-white text-sm">
                    {currentCase.sender.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#161617] border border-white/15 flex items-center justify-center shadow-sm">
                    {getChannelIcon(currentCase.channel)}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{currentCase.sender}</h3>
                  <div className="flex items-center space-x-2 text-xs text-[#86868b]">
                    <span className="capitalize">{currentCase.channel}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#86868b]" />
                      <span>Hoje às {currentCase.time}</span>
                    </span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-semibold text-[#30d158] bg-[#30d158]/10 px-3 py-1 rounded-full border border-[#30d158]/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#30d158]" />
                +{currentCase.xpReward} XP Base
              </span>
            </div>

            {/* Caixa de Texto do Incidente (Autêntica, Ampla e Sem Poluição) */}
            <div className="bg-[#0c0c0d] border border-white/[0.08] rounded-2xl p-6 shadow-inner space-y-2">
              <div className="text-[10px] text-[#86868b] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#2997ff]" />
                <span>Texto Original Recebido:</span>
              </div>
              <p className="text-white text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap select-text font-normal font-sans">
                {currentCase.messageContent}
              </p>
            </div>

            {/* Orientação ao Investigador (Sem Spoilers) */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs text-[#86868b]">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-[#2997ff] flex-shrink-0" />
                <span className="leading-relaxed">
                  Use as <strong className="text-white">Ferramentas de Investigação</strong> ao lado para auditar dados, titulares e canais antes de emitir seu veredito.
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* COLUNA DIREITA: Ferramentas de Investigação & Decisão do Detetive (5 colunas) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* ======================================================== */}
          {/* BLOCO 2: FERRAMENTAS DE INVESTIGAÇÃO VISUAL (3 PISTAS)   */}
          {/* ======================================================== */}
          <div className="bg-[#161617] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm text-white flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-[#2997ff]" />
                  <span>Ferramentas de Investigação</span>
                </h4>
                <p className="text-xs text-[#86868b]">
                  Inspecione a telemetria técnica para avaliar a autenticidade do caso (+10 XP)
                </p>
              </div>

              <span className="text-xs font-semibold text-[#2997ff] bg-[#2997ff]/10 px-2.5 py-1 rounded-full border border-[#2997ff]/20">
                {currentCaseDiscovered.length}/{currentCase.clues.length}
              </span>
            </div>

            {/* 3 Cartões Interativos de Pistas */}
            <div className="space-y-3">
              {currentCase.clues.map((clue) => {
                const isDiscovered = currentCaseDiscovered.includes(clue.id);
                const isExpanded = expandedClueId === clue.id;
                const isCaseAnswered = currentAnswerData?.answered;

                return (
                  <motion.div
                    key={clue.id}
                    whileHover={{ scale: 1.01, y: -1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`rounded-2xl border transition overflow-hidden ${
                      isExpanded
                        ? 'border-[#2997ff]/50 bg-[#1a1a1c] shadow-xl shadow-blue-500/5'
                        : isDiscovered
                        ? 'border-white/[0.12] bg-[#161617]'
                        : 'border-white/[0.06] bg-[#121213] hover:border-white/[0.16]'
                    }`}
                  >
                    <button
                      onClick={() => handleInspectClue(clue)}
                      className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform ${
                            isExpanded ? 'scale-105' : ''
                          } ${getClueCategoryBadgeStyle(clue.category)}`}
                        >
                          {getClueCategoryIcon(clue.category)}
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-white flex items-center gap-2">
                            <span>{clue.buttonLabel}</span>
                            {isDiscovered && (
                              <span className="text-[10px] text-[#30d158] font-medium bg-[#30d158]/10 px-2 py-0.2 rounded-full border border-[#30d158]/20 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Inspecionado (+10 XP)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#86868b]">
                            {isDiscovered ? 'Telemetria pericial coletada • Toque para rever' : 'Toque para executar esta análise pericial'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-[#86868b] transition-transform flex-shrink-0 ml-2 ${
                          isExpanded ? 'rotate-90 text-[#2997ff]' : ''
                        }`}
                      />
                    </button>

                    {/* Cartão de Inspeção Visual Aberto */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-4 pb-4 pt-1 space-y-3 text-xs border-t border-white/[0.06]"
                        >
                          {/* Painel Visual Simulando a Ferramenta */}
                          <div className="bg-[#121214] border border-white/[0.08] rounded-xl p-3.5 space-y-2.5 shadow-inner">
                            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-[11px]">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{clue.inspection?.badge || 'Inspeção Detalhada'}</span>
                              </span>
                              <span className="text-[10px] text-[#2997ff] bg-[#2997ff]/10 px-2 py-0.5 rounded-full font-medium border border-[#2997ff]/20">
                                Raio-X Ativo
                              </span>
                            </div>

                            {/* Campos Comparativos Claros */}
                            <div className="space-y-1.5 text-xs">
                              {clue.inspection?.field1Label && (
                                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                                  <span className="text-[#86868b] text-[11px]">{clue.inspection.field1Label}:</span>
                                  <span className="text-white font-medium text-[11px] sm:text-xs">{clue.inspection.field1Value}</span>
                                </div>
                              )}
                              {clue.inspection?.field2Label && (
                                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                                  <span className="text-[#86868b] text-[11px]">{clue.inspection.field2Label}:</span>
                                  <span className="text-white font-medium text-[11px] sm:text-xs">{clue.inspection.field2Value}</span>
                                </div>
                              )}
                              {clue.inspection?.field3Label && (
                                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                                  <span className="text-[#86868b] text-[11px]">{clue.inspection.field3Label}:</span>
                                  <span className="text-white font-medium text-[11px] sm:text-xs">{clue.inspection.field3Value}</span>
                                </div>
                              )}
                            </div>

                            {/* Prompt Pericial Zero-Spoiler antes de responder */}
                            {!isCaseAnswered ? (
                              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-2 text-[11px] text-[#86868b]">
                                <Search className="w-3.5 h-3.5 text-[#2997ff] flex-shrink-0" />
                                <span>Telemetria pericial extraída. Compare estes registros com o teor da mensagem para tirar suas conclusões.</span>
                              </div>
                            ) : (
                              /* Laudo e Fato de Defesa Revelados Somente Após o Veredito */
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2 pt-1"
                              >
                                <div className="p-2.5 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-start gap-2 text-[11px]">
                                  <Sparkles className="w-3.5 h-3.5 text-[#2997ff] flex-shrink-0 mt-0.5" />
                                  <div className="leading-relaxed">
                                    <strong className="text-[#2997ff]">Conclusão Pericial: </strong>
                                    <span className="text-[#d2d2d7]">
                                      {clue.inspection?.observation || clue.evidenceResult.details}
                                    </span>
                                  </div>
                                </div>
                                {clue.evidenceResult.forensicFact && (
                                  <div className="text-[11px] text-[#86868b] bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04] flex items-start gap-2">
                                    <Lightbulb className="w-3.5 h-3.5 text-[#ff9f0a] flex-shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-[#ff9f0a]">Fato de Defesa: </strong>
                                      <span className="text-[#d2d2d7]">{clue.evidenceResult.forensicFact}</span>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* BLOCO 3: O GRANDE VEREDITO DO DETETIVE (ÁGIL E DIVERTIDO) */}
          {/* ======================================================== */}
          <div className="bg-[#161617] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="border-b border-white/[0.08] pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0071e3]/15 border border-[#0071e3]/30 flex items-center justify-center text-[#2997ff]">
                  <Gavel className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">Veredito do Detetive</h4>
                  <p className="text-xs text-[#86868b]">
                    Qual é o seu julgamento sobre esta mensagem?
                  </p>
                </div>
              </div>
            </div>

            {!currentAnswerData?.answered ? (
              <div className="space-y-4">
                {/* Etapa 1: Veredito Principal em 2 Botões Grandes */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => {
                      sound.playBlip();
                      setSelectedVerdict(true);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col items-center justify-center cursor-pointer shadow-md ${
                      selectedVerdict === true
                        ? 'bg-[#ff3b30] border-[#ff3b30] text-white shadow-red-500/25 ring-2 ring-red-400/40'
                        : 'bg-white/[0.03] border-white/[0.08] text-[#a1a1a6] hover:border-white/[0.2] hover:text-white'
                    }`}
                  >
                    <ShieldAlert className={`w-5 h-5 mb-1 ${selectedVerdict === true ? 'text-white' : 'text-[#ff3b30]'}`} />
                    <div className="text-xs font-bold tracking-wide">🚨 É GOLPE!</div>
                    <div className={`text-[10px] mt-0.5 ${selectedVerdict === true ? 'text-white/90' : 'text-[#86868b]'}`}>
                      Desmascarar Fraude
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => {
                      sound.playBlip();
                      setSelectedVerdict(false);
                      setSelectedHypothesis(null);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col items-center justify-center cursor-pointer shadow-md ${
                      selectedVerdict === false
                        ? 'bg-[#30d158] border-[#30d158] text-white shadow-green-500/25 ring-2 ring-green-400/40'
                        : 'bg-white/[0.03] border-white/[0.08] text-[#a1a1a6] hover:border-white/[0.2] hover:text-white'
                    }`}
                  >
                    <ShieldCheck className={`w-5 h-5 mb-1 ${selectedVerdict === false ? 'text-white' : 'text-[#30d158]'}`} />
                    <div className="text-xs font-bold tracking-wide">🛡️ É SEGURO!</div>
                    <div className={`text-[10px] mt-0.5 ${selectedVerdict === false ? 'text-white/90' : 'text-[#86868b]'}`}>
                      Comunicação Real
                    </div>
                  </motion.button>
                </div>

                {/* Etapa 2: Abre a gaveta de evidências para sustentar o laudo */}
                <AnimatePresence>
                  {selectedVerdict !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2.5 pt-2 border-t border-white/[0.08]"
                    >
                      <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#ff9f0a]" />
                        <span>
                          {selectedVerdict === true
                            ? 'Qual evidência comprova o golpe? (Fundamentação Pericial)'
                            : 'Qual evidência atesta que é seguro? (Fator de Legitimidade)'}
                        </span>
                      </label>
                      <div className="space-y-2">
                        {currentCase.evidenceHypotheses.map((hypo, idx) => {
                          const isSelected = selectedHypothesis === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                sound.playBlip();
                                setSelectedHypothesis(idx);
                              }}
                              className={`w-full p-3 rounded-xl border text-left transition flex items-start space-x-2.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0071e3]/20 border-[#2997ff] text-white shadow-md shadow-blue-500/10'
                                  : 'bg-white/[0.02] border-white/[0.08] text-[#a1a1a6] hover:border-white/[0.2] hover:text-white'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold ${
                                isSelected ? 'border-[#2997ff] bg-[#0071e3] text-white' : 'border-white/[0.2] text-[#86868b]'
                              }`}>
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <span className="text-xs leading-relaxed text-[#d2d2d7]">
                                {hypo}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botão de Confirmação com Martelo */}
                {selectedVerdict !== null && (
                  <motion.button
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={selectedHypothesis !== null ? { scale: 1.02, y: -1 } : {}}
                    whileTap={selectedHypothesis !== null ? { scale: 0.98 } : {}}
                    disabled={selectedHypothesis === null}
                    onClick={handleProtocolReport}
                    className={`w-full py-3.5 px-4 rounded-full font-bold text-xs flex items-center justify-center space-x-2 transition ${
                      selectedHypothesis !== null
                        ? 'bg-gradient-to-r from-[#0071e3] to-[#2997ff] text-white cursor-pointer shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                        : 'bg-white/[0.06] border border-white/[0.08] text-[#71717a] cursor-not-allowed'
                    }`}
                  >
                    <Gavel className="w-4 h-4" />
                    <span>
                      {selectedHypothesis === null
                        ? 'Selecione a fundamentação pericial acima'
                        : selectedVerdict === true
                        ? '🔨 Bater o Martelo: É Golpe!'
                        : '🔨 Bater o Martelo: É Seguro!'}
                    </span>
                  </motion.button>
                )}

                {currentCaseDiscovered.length < currentCase.clues.length && (
                  <p className="text-[11px] text-[#86868b] text-center">
                    💡 Dica: Você olhou {currentCaseDiscovered.length} de {currentCase.clues.length} pistas. Quanto mais pistas abrir, mais fácil fica acertar!
                  </p>
                )}
              </div>
            ) : (
              /* Card de Resultado Empolgante e Rápido */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Toast Flutuante de XP */}
                <AnimatePresence>
                  {floatingXp !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border font-bold text-xs shadow-lg mb-1 ${
                        floatingXp > 0
                          ? 'bg-[#30d158]/20 border-[#30d158]/40 text-[#30d158]'
                          : 'bg-[#ff3b30]/20 border-[#ff3b30]/40 text-[#ff3b30]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {floatingXp > 0 ? `+${floatingXp} XP Conquistado!` : `${floatingXp} XP (Penalidade do Nível Avançado)`}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Banner de Julgamento */}
                {(() => {
                  const isHonor = currentAnswerData.isCorrect && currentAnswerData.hypothesisCorrect !== false;
                  const isPartial = currentAnswerData.isCorrect && currentAnswerData.hypothesisCorrect === false;
                  const isFail = !currentAnswerData.isCorrect;

                  return (
                    <div className="space-y-4">
                      {/* Cartão de Status do Veredito */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-3.5 rounded-2xl border flex items-center space-x-3 shadow-md ${
                          isHonor
                            ? 'bg-[#30d158]/10 border-[#30d158]/35 text-white'
                            : isPartial
                            ? 'bg-[#ff9f0a]/10 border-[#ff9f0a]/35 text-white'
                            : 'bg-[#ff3b30]/10 border-[#ff3b30]/35 text-white'
                        }`}
                      >
                        {isHonor ? (
                          <CheckCircle2 className="w-5 h-5 text-[#30d158] flex-shrink-0" />
                        ) : isPartial ? (
                          <AlertTriangle className="w-5 h-5 text-[#ff9f0a] flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-[#ff3b30] flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-xs sm:text-sm">
                            {isHonor && (currentCase.isScam ? '🏆 GOLPE DESMASCARADO!' : '🛡️ LIBERADO COM SUCESSO!')}
                            {isPartial && '⚠️ Veredito correto, mas a prova decisiva era outra!'}
                            {isFail && (currentAnswerData.penaltyXp ? `❌ VOCÊ CAIU NO GOLPE! (-${currentAnswerData.penaltyXp} XP)` : '❌ VOCÊ CAIU NO GOLPE!')}
                          </h4>
                          <p className="text-[11px] text-[#d2d2d7]">
                            {isHonor && 'Percepção forense impecável! Você protegeu a vítima com precisão.'}
                            {isPartial && 'Você acertou o resultado, mas precisa dominar a evidência técnica.'}
                            {isFail && 'Você foi enganado pelo truque do criminoso. Vamos treinar para não cair mais!'}
                          </p>
                        </div>
                      </motion.div>

                      {/* FLUXO A: Se ACERTOU com honra, exibe resumo conciso e botão de avanço */}
                      {isHonor ? (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          {/* Prova Decisiva */}
                          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1 text-xs">
                            <span className="text-[#2997ff] font-semibold text-[11px] flex items-center gap-1.5">
                              <Search className="w-3.5 h-3.5" /> A Prova Decisiva:
                            </span>
                            <p className="text-[#f5f5f7] leading-relaxed">
                              {currentCase.keyEvidenceReason}
                            </p>
                          </div>

                          {/* Regra de Ouro */}
                          <div className="p-3.5 rounded-2xl bg-[#30d158]/10 border border-[#30d158]/20 flex items-start gap-2.5 text-xs text-white">
                            <ShieldCheck className="w-4 h-4 text-[#30d158] flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-[#30d158]">Regra de Ouro para a Família: </strong>
                              <span className="text-[#d2d2d7]">"{currentCase.pedagogy.goldenRule}"</span>
                            </div>
                          </div>

                          {/* Botão de Avanço Imediato */}
                          <motion.button
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 400, damping: 22 }}
                            onClick={handleNextCase}
                            className="w-full py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg shadow-blue-500/25"
                          >
                            <span>
                              {currentCaseIndex < levelCases.length - 1
                                ? 'Próximo Caso da Investigação'
                                : currentLevel !== 'avancado'
                                ? 'Avançar para o Próximo Nível'
                                : 'Ver Conclusão da Investigação'}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ) : (
                        /* FLUXO B: Se ERROU ou ACERTOU PARCIAL, aciona o TREINO DE REFORÇO FORENSE */
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-2xl bg-[#1c1c1e] border border-[#ff9f0a]/30 space-y-3.5 shadow-xl"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                            <div className="flex items-center space-x-2 text-xs font-semibold text-[#ff9f0a]">
                              <RotateCcw className="w-4 h-4" />
                              <span>{currentCase.reinforcementDrill.title}</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ff9f0a]/15 text-[#ff9f0a] border border-[#ff9f0a]/30">
                              Reforço Prático (+15 XP)
                            </span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs font-medium text-white leading-relaxed">
                              {currentCase.reinforcementDrill.question}
                            </p>
                            {currentCase.reinforcementDrill.context && (
                              <p className="text-[11px] text-[#86868b]">
                                💡 {currentCase.reinforcementDrill.context}
                              </p>
                            )}
                          </div>

                          {/* 3 Opções de Reforço Interativo */}
                          <div className="space-y-2 pt-1">
                            {currentCase.reinforcementDrill.options.map((opt) => {
                              const isSelected = drillSelectedOptionId === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleDrillOptionSelect(opt)}
                                  className={`w-full p-3 rounded-xl border text-left transition flex flex-col space-y-1.5 cursor-pointer ${
                                    isSelected
                                      ? opt.isCorrect
                                        ? 'bg-[#30d158]/15 border-[#30d158] text-white shadow-md shadow-green-500/10'
                                        : 'bg-[#ff3b30]/15 border-[#ff3b30] text-white'
                                      : 'bg-white/[0.03] border-white/[0.08] text-[#d2d2d7] hover:border-white/[0.2] hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-start space-x-2">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold ${
                                      isSelected
                                        ? opt.isCorrect
                                          ? 'border-[#30d158] bg-[#30d158] text-black'
                                          : 'border-[#ff3b30] bg-[#ff3b30] text-white'
                                        : 'border-white/[0.2] text-[#86868b]'
                                    }`}>
                                      {isSelected ? (opt.isCorrect ? '✓' : '✕') : '•'}
                                    </div>
                                    <span className="text-xs leading-relaxed font-medium">
                                      {opt.text}
                                    </span>
                                  </div>

                                  {/* Feedback imediato */}
                                  {isSelected && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      className={`text-[11px] p-2 rounded-lg leading-relaxed ${
                                        opt.isCorrect
                                          ? 'bg-[#30d158]/20 text-[#30d158] font-medium'
                                          : 'bg-[#ff3b30]/20 text-[#ff453a]'
                                      }`}
                                    >
                                      {opt.feedback}
                                    </motion.div>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Botão de Avançar Liberado Somente ao Acertar o Reforço */}
                          {drillSuccess && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="pt-2"
                            >
                              <motion.button
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                                onClick={handleNextCase}
                                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#30d158] to-[#28cd41] text-black font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg shadow-green-500/25"
                              >
                                <span>Conceito Dominado! Avançar para o Próximo Caso</span>
                                <ChevronRight className="w-4 h-4 text-black" />
                              </motion.button>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: Sala de Conquistas (Desktop Modal)              */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isBadgesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1c1c1e] border border-white/[0.1] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <h3 className="font-semibold text-base text-white">Sala de Conquistas</h3>
                  <p className="text-xs text-[#86868b]">
                    {unlockedBadgeIds.length} de {BADGES.length} conquistas desbloqueadas
                  </p>
                </div>
                <button
                  onClick={() => setIsBadgesModalOpen(false)}
                  className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-medium cursor-pointer"
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
                      className={`p-3.5 rounded-2xl border transition flex items-center space-x-3.5 ${
                        isUnlocked
                          ? 'bg-white/[0.06] border-white/[0.15]'
                          : 'bg-white/[0.02] border-white/[0.04] opacity-40'
                      }`}
                    >
                      <span className="text-2xl p-2 bg-white/[0.08] rounded-xl flex-shrink-0">
                        {badge.icon}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-xs text-white">{badge.title}</h4>
                        <p className="text-[11px] text-[#86868b]">{badge.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 2: Cartilha da Família (Desktop Modal)             */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isFamilyGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1c1c1e] border border-white/[0.1] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <h3 className="font-semibold text-base text-white">Cartilha de Defesa Familiar</h3>
                  <p className="text-xs text-[#86868b]">Regras de ouro e termos essenciais de cibersegurança</p>
                </div>
                <button
                  onClick={() => setIsFamilyGuideOpen(false)}
                  className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-medium cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex p-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs">
                <button
                  onClick={() => setFamilyGuideTab('rules')}
                  className={`flex-1 py-1 rounded-full font-medium transition cursor-pointer ${
                    familyGuideTab === 'rules'
                      ? 'bg-white/20 text-white'
                      : 'text-[#86868b] hover:text-white'
                  }`}
                >
                  Regras de Ouro
                </button>
                <button
                  onClick={() => setFamilyGuideTab('glossary')}
                  className={`flex-1 py-1 rounded-full font-medium transition cursor-pointer ${
                    familyGuideTab === 'glossary'
                      ? 'bg-white/20 text-white'
                      : 'text-[#86868b] hover:text-white'
                  }`}
                >
                  Glossário
                </button>
              </div>

              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {familyGuideTab === 'rules' ? (
                  FAMILY_GOLDEN_RULES.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">
                          {item.icon} {item.title}
                        </span>
                        <span className="text-[10px] text-[#86868b]">{item.targetLabel}</span>
                      </div>
                      <p className="text-xs text-[#d2d2d7] leading-relaxed">{item.practicalAction}</p>
                    </div>
                  ))
                ) : (
                  GLOSSARY_ITEMS.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1 text-xs"
                    >
                      <h4 className="font-semibold text-[#2997ff]">{item.term}</h4>
                      <p className="text-xs text-[#d2d2d7] leading-relaxed">{item.simpleMeaning}</p>
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
