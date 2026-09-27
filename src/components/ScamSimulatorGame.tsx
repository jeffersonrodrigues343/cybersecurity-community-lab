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
  Mail,
  FileText,
} from 'lucide-react';
import {
  SCAM_CASES,
  BADGES,
  FAMILY_GOLDEN_RULES,
  GLOSSARY_ITEMS,
  type ScamCase,
  type ScamLevel,
  type InvestigativeClue,
  type Badge,
} from '../data/scamsData';
import { sound } from '../utils/audio';

interface ScamSimulatorGameProps {
  onScoreUpdate: (totalXp: number, completedCount: number, allCompleted: boolean) => void;
}

export const ScamSimulatorGame: React.FC<ScamSimulatorGameProps> = ({ onScoreUpdate }) => {
  const [currentLevel, setCurrentLevel] = useState<ScamLevel>('basico');
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);

  // Registro de respostas
  const [answers, setAnswers] = useState<{
    [caseId: string]: {
      answered: boolean;
      isCorrect: boolean;
      userChoice: boolean;
      cluesDiscovered: string[];
      bonusXp: number;
      comboBonus: number;
    };
  }>({});

  // Pistas investigadas no caso atual
  const [discoveredClues, setDiscoveredClues] = useState<{ [caseId: string]: string[] }>({});
  const [expandedClueId, setExpandedClueId] = useState<string | null>(null);

  // Gamificação pedagógica
  const [streak, setStreak] = useState(0);
  const [pedagogicalMode, setPedagogicalMode] = useState<'kids' | 'adult'>('kids');

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

  // Casos do nível atual
  const levelCases = SCAM_CASES.filter((c) => c.level === currentLevel);
  const currentCase: ScamCase = levelCases[currentCaseIndex] || levelCases[0];

  // Pistas coletadas no caso atual
  const currentCaseDiscovered = discoveredClues[currentCase.id] || [];

  // Métricas gerais
  const totalCases = SCAM_CASES.length;

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

  // Veredito final do jogador (É Golpe ou É Seguro)
  const handleVerdict = (choiceIsScam: boolean) => {
    if (answers[currentCase.id]?.answered) return;

    const isCorrect = choiceIsScam === currentCase.isScam;
    const cluesFoundCount = (discoveredClues[currentCase.id] || []).length;

    // Bônus de 10 XP por cada pista investigada antes do veredito
    const bonusXp = isCorrect ? cluesFoundCount * 10 : 0;

    // Bônus de combo consecutivo
    let newStreak = streak;
    let comboBonus = 0;

    if (isCorrect) {
      sound.playSuccess();
      newStreak = streak + 1;
      setStreak(newStreak);

      if (newStreak >= 3) {
        comboBonus = 30;
        unlockBadge('badge-streak-fire');
      } else if (newStreak === 2) {
        comboBonus = 10;
      }

      if (currentCase.id === 'case-1-whatsapp') unlockBadge('badge-family-shield');
      if (currentCase.id === 'case-7-mao-fantasma') unlockBadge('badge-anti-ghost');
      if (['case-1-whatsapp', 'case-8-boleto-falso', 'case-9-robo-pix'].includes(currentCase.id)) {
        unlockBadge('badge-pix-guard');
      }
      if (currentCase.id === 'case-4-falsa-central' || currentCase.id === 'case-9-robo-pix') {
        const otherCaseAnswer = answers[currentCase.id === 'case-4-falsa-central' ? 'case-9-robo-pix' : 'case-4-falsa-central'];
        if (otherCaseAnswer?.isCorrect) {
          unlockBadge('badge-central-bank-expert');
        }
      }
    } else {
      sound.playError();
      setStreak(0);
    }

    const newAnswers = {
      ...answers,
      [currentCase.id]: {
        answered: true,
        isCorrect,
        userChoice: choiceIsScam,
        cluesDiscovered: discoveredClues[currentCase.id] || [],
        bonusXp,
        comboBonus,
      },
    };

    setAnswers(newAnswers);

    const newTotalXp = Object.entries(newAnswers).reduce((acc, [caseId, data]) => {
      if (!data.isCorrect) return acc;
      const found = SCAM_CASES.find((c) => c.id === caseId);
      return acc + (found?.xpReward || 0) + (data.bonusXp || 0) + (data.comboBonus || 0);
    }, 0);

    const newCompletedCount = Object.keys(newAnswers).length;
    const allCompleted = newCompletedCount === totalCases;

    if (allCompleted) {
      unlockBadge('badge-grand-master');
    }

    onScoreUpdate(newTotalXp, newCompletedCount, allCompleted);
  };

  const handleNextCase = () => {
    sound.playBlip();
    setExpandedClueId(null);

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
    setCurrentLevel(level);
    setCurrentCaseIndex(0);
    setExpandedClueId(null);
  };

  const currentAnswerData = answers[currentCase.id];

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

      {/* Barra de Controles Desktop (Segmented Control Apple + Ferramentas) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#161617] border border-white/[0.08] rounded-2xl p-2.5 sm:px-4">
        {/* Apple Segmented Pill */}
        <div className="flex items-center space-x-1 p-1 rounded-full bg-black/40 border border-white/[0.06]">
          {(['basico', 'medio', 'avancado'] as ScamLevel[]).map((level) => {
            const levelCasesList = SCAM_CASES.filter((c) => c.level === level);
            const levelFinishedCount = levelCasesList.filter((c) => answers[c.id]?.answered).length;
            const isCurrent = currentLevel === level;

            return (
              <button
                key={level}
                onClick={() => handleSelectLevel(level)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition flex items-center space-x-2 cursor-pointer ${
                  isCurrent
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-[#86868b] hover:text-white'
                }`}
              >
                <span className="capitalize">{level}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isCurrent ? 'bg-white/20 text-white' : 'bg-white/5 text-[#86868b]'
                  }`}
                >
                  {levelFinishedCount}/{levelCasesList.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Indicador de Caso e Atalhos de Apoio */}
        <div className="flex items-center space-x-2">
          {streak > 1 && (
            <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-[#ff9f0a]/15 text-[#ff9f0a] text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-[#ff9f0a]" />
              <span>{streak}x Combo</span>
            </div>
          )}

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
            <span className="hidden sm:inline">Cartilha da Família</span>
          </button>
        </div>
      </div>

      {/* CONSOLE PRINCIPAL DESKTOP (Split View: Janela macOS de Inspeção + Deck de Auditoria) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA ESQUERDA: Janela macOS de Exibição do Incidente (7 colunas) */}
        <motion.div
          key={currentCase.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:col-span-7 apple-macos-window"
        >
          {/* macOS Window Header */}
          <div className="apple-window-header">
            <div className="apple-window-dots">
              <div className="apple-dot apple-dot-red" />
              <div className="apple-dot apple-dot-yellow" />
              <div className="apple-dot apple-dot-green" />
            </div>

            <div className="text-xs font-medium text-[#86868b] flex items-center space-x-2">
              <span>{currentCase.title}</span>
              <span>•</span>
              <span className="text-white/80">{currentCase.category}</span>
            </div>

            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/[0.08] text-[#d2d2d7]">
              Caso {currentCaseIndex + 1} de {levelCases.length}
            </span>
          </div>

          {/* Janela de Conteúdo do Incidente */}
          <div className="p-6 space-y-5">
            {/* Linha de Metadados da Mensagem (Remetente, Canal e Horário) */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-white/10 to-white/20 border border-white/10 flex items-center justify-center font-semibold text-white text-sm">
                  {currentCase.sender.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{currentCase.sender}</h3>
                  <div className="flex items-center space-x-2 text-xs text-[#86868b]">
                    <span className="flex items-center space-x-1">
                      {getChannelIcon(currentCase.channel)}
                      <span className="capitalize">{currentCase.channel}</span>
                    </span>
                    <span>•</span>
                    <span>Hoje às {currentCase.time}</span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-medium text-[#30d158] bg-[#30d158]/10 px-3 py-1 rounded-full border border-[#30d158]/20">
                +{currentCase.xpReward} XP Base
              </span>
            </div>

            {/* Caixa de Texto do Incidente (Autêntica e Confortável para Leitura Desktop) */}
            <div className="bg-[#0c0c0d] border border-white/[0.08] rounded-2xl p-6 shadow-inner">
              <div className="text-[11px] text-[#86868b] uppercase tracking-wider mb-2 font-mono">
                Conteúdo Original Recebido:
              </div>
              <p className="text-white text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap select-text font-normal font-sans">
                {currentCase.messageContent}
              </p>
            </div>

            {/* Painel Pedagógico Integrado (Alternador Jovens / Adultos) */}
            <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#2997ff]" />
                  <span className="text-xs font-semibold text-white">Análise Pedagógica do Caso</span>
                </div>

                <div className="flex p-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs">
                  <button
                    onClick={() => setPedagogicalMode('kids')}
                    className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                      pedagogicalMode === 'kids'
                        ? 'bg-white/20 text-white'
                        : 'text-[#86868b] hover:text-white'
                    }`}
                  >
                    Jovens & Família
                  </button>
                  <button
                    onClick={() => setPedagogicalMode('adult')}
                    className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                      pedagogicalMode === 'adult'
                        ? 'bg-white/20 text-white'
                        : 'text-[#86868b] hover:text-white'
                    }`}
                  >
                    Adultos & Jurídico
                  </button>
                </div>
              </div>

              <div className="text-xs text-[#d2d2d7] leading-relaxed">
                {pedagogicalMode === 'kids' ? (
                  <p>
                    <strong className="text-white">🧒 Analogia para Jovens: </strong>
                    {currentCase.pedagogy.kidsAnalogy}
                  </p>
                ) : (
                  <p>
                    <strong className="text-white">⚖️ Protocolo para Adultos: </strong>
                    {currentCase.pedagogy.adultRemedy}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="text-[#86868b]">
                  <strong className="text-[#ff9f0a]">Gatilho mental: </strong>
                  {currentCase.pedagogy.emotionalTrigger}
                </span>
                <span className="text-[#30d158] font-medium">
                  "{currentCase.pedagogy.goldenRule}"
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* COLUNA DIREITA: Deck Pericial & Ação de Veredito (5 colunas) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Deck de Ferramentas Forenses */}
          <div className="bg-[#161617] border border-white/[0.08] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm text-white flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-[#2997ff]" />
                  <span>Auditoria Pericial</span>
                </h4>
                <p className="text-xs text-[#86868b]">
                  Inspecione as pistas antes de decidir (+10 XP cada)
                </p>
              </div>

              <span className="text-xs font-semibold text-[#2997ff] bg-[#2997ff]/10 px-2.5 py-1 rounded-full">
                {currentCaseDiscovered.length}/{currentCase.clues.length}
              </span>
            </div>

            {/* Lista das 3 Pistas Periciais */}
            <div className="space-y-2.5">
              {currentCase.clues.map((clue) => {
                const isDiscovered = currentCaseDiscovered.includes(clue.id);
                const isExpanded = expandedClueId === clue.id;

                return (
                  <div
                    key={clue.id}
                    className={`rounded-xl border transition overflow-hidden ${
                      isExpanded
                        ? 'border-[#2997ff]/50 bg-[#1c1c1e]'
                        : isDiscovered
                        ? 'border-white/[0.12] bg-[#1a1a1c]'
                        : 'border-white/[0.06] bg-[#141415] hover:border-white/[0.12]'
                    }`}
                  >
                    <button
                      onClick={() => handleInspectClue(clue)}
                      className="w-full p-3.5 text-left flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xs font-medium text-white">{clue.buttonLabel}</span>
                        {isDiscovered && (
                          <span className="text-[10px] text-[#30d158] font-medium bg-[#30d158]/10 px-2 py-0.5 rounded-full">
                            ✓ Auditado (+10 XP)
                          </span>
                        )}
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-[#86868b] transition-transform ${
                          isExpanded ? 'rotate-90 text-[#2997ff]' : ''
                        }`}
                      />
                    </button>

                    {/* Laudo Pericial Aberto */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-3.5 pb-3.5 pt-1 space-y-2.5 text-xs border-t border-white/[0.06]"
                        >
                          <div
                            className={`p-3 rounded-xl border ${
                              clue.evidenceResult.status === 'suspicious'
                                ? 'bg-[#ff3b30]/10 border-[#ff3b30]/30 text-white'
                                : 'bg-[#30d158]/10 border-[#30d158]/30 text-white'
                            }`}
                          >
                            <div className="font-semibold flex items-center gap-1.5 mb-1 text-xs">
                              {clue.evidenceResult.status === 'suspicious' ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-[#ff3b30] flex-shrink-0" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158] flex-shrink-0" />
                              )}
                              <span>{clue.evidenceResult.headline}</span>
                            </div>
                            <p className="text-[#d2d2d7] leading-relaxed text-[11px]">
                              {clue.evidenceResult.details}
                            </p>
                          </div>

                          <div className="text-[11px] text-[#86868b] bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]">
                            <strong className="text-[#ff9f0a]">💡 Fato Forense: </strong>
                            <span>{clue.evidenceResult.forensicFact}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Painel de Veredito / Ação */}
          <div className="bg-[#161617] border border-white/[0.08] rounded-2xl p-5 space-y-4">
            {!currentAnswerData?.answered ? (
              <div className="space-y-3.5">
                <div>
                  <h4 className="font-semibold text-sm text-white">Veredito do Caso</h4>
                  <p className="text-xs text-[#86868b]">
                    Com base no conteúdo e nas pistas periciais, qual é a sua conclusão?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => handleVerdict(true)}
                    className="apple-btn-red flex items-center justify-center space-x-2 cursor-pointer text-sm"
                  >
                    <ShieldAlert className="w-4 h-4 text-white" />
                    <span>É GOLPE</span>
                  </button>

                  <button
                    onClick={() => handleVerdict(false)}
                    className="apple-btn-blue flex items-center justify-center space-x-2 cursor-pointer text-sm"
                  >
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>É SEGURO</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Resposta Emitida: Card de Resultado e Aprendizado */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Banner de Resultado */}
                <div
                  className={`p-4 rounded-xl border flex items-start space-x-3 ${
                    currentAnswerData.isCorrect
                      ? 'bg-[#30d158]/10 border-[#30d158]/30 text-white'
                      : 'bg-[#ff3b30]/10 border-[#ff3b30]/30 text-white'
                  }`}
                >
                  {currentAnswerData.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-[#30d158] flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#ff3b30] flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">
                      {currentAnswerData.isCorrect
                        ? `Veredito Correto! +${currentCase.xpReward} XP Base`
                        : 'Veredito Incorreto! Você caiu na armadilha.'}
                    </h4>
                    {currentAnswerData.bonusXp > 0 && (
                      <p className="text-xs text-[#30d158]">
                        +{currentAnswerData.bonusXp} XP bônus por pistas periciais investigadas!
                      </p>
                    )}
                    {currentAnswerData.comboBonus > 0 && (
                      <p className="text-xs text-[#ff9f0a]">
                        +{currentAnswerData.comboBonus} XP bônus de combo consecutivo!
                      </p>
                    )}
                  </div>
                </div>

                {/* Explicação Real do Golpe */}
                <div className="space-y-2 text-xs text-[#d2d2d7]">
                  <p className="leading-relaxed">{currentCase.explanation}</p>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[11px]">
                    <strong className="text-[#30d158]">🛡️ Dica Prática de Defesa: </strong>
                    <span>{currentCase.realWorldTip}</span>
                  </div>
                </div>

                {/* Botão de Avanço */}
                <button
                  onClick={handleNextCase}
                  className="w-full py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg"
                >
                  <span>
                    {currentCaseIndex < levelCases.length - 1
                      ? 'Próximo Caso'
                      : currentLevel !== 'avancado'
                      ? 'Avançar para o Próximo Nível'
                      : 'Ver Resultado Final'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>

        </div>

      </div>

      {/* MODAL 1: Sala de Conquistas (Desktop Modal) */}
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

      {/* MODAL 2: Cartilha da Família (Desktop Modal) */}
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
