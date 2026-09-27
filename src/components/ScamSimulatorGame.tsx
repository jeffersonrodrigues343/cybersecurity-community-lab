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
  HeartHandshake,
  Wifi,
  Battery,
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
  const [activeClueModal, setActiveClueModal] = useState<InvestigativeClue | null>(null);

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
    setActiveClueModal(clue);

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
    setActiveClueModal(null);

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
    setActiveClueModal(null);
  };

  const currentAnswerData = answers[currentCase.id];

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      
      {/* Toast Apple de Conquista */}
      <AnimatePresence>
        {recentBadgeUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="p-3.5 rounded-2xl bg-[#1c1c1e] border border-white/[0.15] shadow-2xl flex items-center justify-between text-white"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl p-1.5 bg-white/[0.08] rounded-xl">
                {recentBadgeUnlocked.icon}
              </span>
              <div>
                <span className="text-[11px] text-[#ff9f0a] font-medium block">
                  Conquista Desbloqueada
                </span>
                <h4 className="font-semibold text-xs text-white">
                  {recentBadgeUnlocked.title}
                </h4>
              </div>
            </div>
            <button
              onClick={() => setRecentBadgeUnlocked(null)}
              className="px-3 py-1 rounded-full bg-white/[0.1] hover:bg-white/[0.15] text-white text-xs font-medium transition"
            >
              OK
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra de Navegação Superior Apple (Segmented Pill) */}
      <div className="flex items-center justify-between gap-2 px-1">
        
        {/* Apple Segmented Control */}
        <div className="flex p-0.5 rounded-full bg-white/[0.06] border border-white/[0.08]">
          <button
            onClick={() => handleSelectLevel('basico')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition ${
              currentLevel === 'basico'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-[#86868b] hover:text-white'
            }`}
          >
            Básico
          </button>
          <button
            onClick={() => handleSelectLevel('medio')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition ${
              currentLevel === 'medio'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-[#86868b] hover:text-white'
            }`}
          >
            Médio
          </button>
          <button
            onClick={() => handleSelectLevel('avancado')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition ${
              currentLevel === 'avancado'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-[#86868b] hover:text-white'
            }`}
          >
            Avançado
          </button>
        </div>

        {/* Atalhos Rápidos */}
        <div className="flex items-center space-x-1.5">
          {streak > 1 && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#ff9f0a]/15 text-[#ff9f0a] text-xs font-medium">
              <Flame className="w-3 h-3 fill-[#ff9f0a]" />
              <span>{streak}x</span>
            </div>
          )}
          <button
            onClick={() => {
              sound.playBlip();
              setIsBadgesModalOpen(true);
            }}
            className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white transition"
            title="Conquistas"
          >
            <Trophy className="w-3.5 h-3.5 text-[#ff9f0a]" />
          </button>
          <button
            onClick={() => {
              sound.playBlip();
              setIsFamilyGuideOpen(true);
            }}
            className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#2997ff] transition"
            title="Cartilha da Família"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Frame de iPhone 16 Pro com Dynamic Island */}
      <motion.div
        key={currentCase.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="apple-iphone-frame"
      >
        {/* Dynamic Island com sensor */}
        <div className="apple-dynamic-island">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c1e] border border-white/10" />
          <div className="w-2 h-2 rounded-full bg-[#0071e3]/40" />
        </div>

        {/* Status Bar Oficial do iOS */}
        <div className="px-6 py-1 flex items-center justify-between text-[11px] font-semibold text-white/90">
          <span>9:41</span>
          <div className="flex items-center space-x-1.5">
            <Wifi className="w-3 h-3 text-white" />
            <Battery className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Header do Contato (WhatsApp / SMS / Ligação) */}
        <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between bg-[#161617]/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-white/10 to-white/20 flex items-center justify-center font-semibold text-white text-xs border border-white/10">
              {currentCase.sender.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-white text-xs tracking-tight">{currentCase.sender}</div>
              <div className="text-[10px] text-[#86868b]">{currentCase.category}</div>
            </div>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.08] text-[#86868b]">
            Caso {currentCaseIndex + 1}/{levelCases.length}
          </span>
        </div>

        {/* Tela Interna da Conversa (Apple iOS Message View) */}
        <div className="p-4 sm:p-5 bg-black space-y-3 min-h-[170px] flex flex-col justify-end">
          <div className="text-center text-[10px] text-[#86868b] my-1">
            Hoje • {currentCase.time}
          </div>

          {/* Bolha de Mensagem do iOS */}
          <div className="apple-ios-bubble self-start max-w-[90%]">
            <p className="whitespace-pre-wrap">{currentCase.messageContent}</p>
          </div>
        </div>

        {/* Deck de Ferramentas Forenses (Kit do Investigador) */}
        <div className="p-4 bg-[#161617] border-t border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-white flex items-center gap-1.5">
              <Search className="w-3 h-3 text-[#2997ff]" />
              <span>Inspecionar Pistas ({currentCaseDiscovered.length}/{currentCase.clues.length}):</span>
            </span>
            <span className="text-[10px] text-[#30d158] font-medium">+{currentCase.xpReward} XP Base</span>
          </div>

          {/* 3 Chips de Pistas Apple */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {currentCase.clues.map((clue) => {
              const isDiscovered = currentCaseDiscovered.includes(clue.id);
              return (
                <button
                  key={clue.id}
                  onClick={() => handleInspectClue(clue)}
                  className={`apple-tool-chip text-left cursor-pointer ${
                    isDiscovered
                      ? 'border-[#2997ff]/50 bg-[#0071e3]/15 text-white'
                      : 'text-[#d2d2d7]'
                  }`}
                >
                  <div className="font-medium text-xs mb-0.5 leading-snug">
                    {clue.buttonLabel}
                  </div>
                  <div className="text-[10px] text-[#86868b]">
                    {isDiscovered ? '✓ Analisado' : 'Toque para auditar'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gaveta do Laudo Pericial Apple */}
        <AnimatePresence>
          {activeClueModal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-[#1c1c1e] border-t border-white/[0.08] text-xs space-y-2"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
                <span className="font-semibold text-white text-xs">
                  {activeClueModal.name}
                </span>
                <button
                  onClick={() => setActiveClueModal(null)}
                  className="text-[#86868b] hover:text-white px-2 py-0.5 rounded-full bg-white/[0.08] text-[10px]"
                >
                  Fechar ✕
                </button>
              </div>

              <div
                className={`p-3 rounded-2xl border ${
                  activeClueModal.evidenceResult.status === 'suspicious'
                    ? 'bg-[#ff3b30]/10 border-[#ff3b30]/30 text-white'
                    : 'bg-[#30d158]/10 border-[#30d158]/30 text-white'
                }`}
              >
                <div className="font-semibold text-xs flex items-center gap-1.5 mb-1">
                  {activeClueModal.evidenceResult.status === 'suspicious' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-[#ff3b30] flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158] flex-shrink-0" />
                  )}
                  <span>{activeClueModal.evidenceResult.headline}</span>
                </div>
                <p className="text-[#d2d2d7] text-xs leading-relaxed">
                  {activeClueModal.evidenceResult.details}
                </p>
              </div>

              <div className="text-[11px] text-[#86868b]">
                <strong className="text-[#ff9f0a]">💡 Fato: </strong>
                <span>{activeClueModal.evidenceResult.forensicFact}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rodapé da Decisão: Os 2 Botões Apple de Ação */}
        {!currentAnswerData?.answered ? (
          <div className="p-4 bg-[#161617] border-t border-white/[0.08]">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleVerdict(true)}
                className="apple-btn-red flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-white" />
                <span>É GOLPE</span>
              </button>

              <button
                onClick={() => handleVerdict(false)}
                className="apple-btn-blue flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>É SEGURO</span>
              </button>
            </div>
          </div>
        ) : (
          /* Resultado e Explicação Pedagógica */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-[#161617] border-t border-white/[0.08] space-y-3"
          >
            {/* Banner de Resultado */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center space-x-3 ${
                currentAnswerData.isCorrect
                  ? 'bg-[#30d158]/10 border-[#30d158]/30 text-white'
                  : 'bg-[#ff3b30]/10 border-[#ff3b30]/30 text-white'
              }`}
            >
              {currentAnswerData.isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-[#30d158] flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-[#ff3b30] flex-shrink-0" />
              )}
              <div>
                <h4 className="font-semibold text-xs">
                  {currentAnswerData.isCorrect
                    ? `Veredito Correto! +${currentCase.xpReward} XP ${currentAnswerData.bonusXp > 0 ? `(+${currentAnswerData.bonusXp} XP pistas)` : ''}`
                    : 'Veredito Incorreto! Você caiu na armadilha.'}
                </h4>
                <p className="text-[11px] text-[#86868b]">
                  {currentCase.isScam ? 'Esta mensagem era um golpe financeiro.' : 'Esta mensagem era legítima e segura.'}
                </p>
              </div>
            </div>

            {/* Acolhimento em caso de erro */}
            {!currentAnswerData.isCorrect && (
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs flex items-start space-x-2">
                <HeartHandshake className="w-4 h-4 text-[#bf5af2] flex-shrink-0 mt-0.5" />
                <p className="text-[#86868b] text-[11px] leading-relaxed">
                  <strong className="text-white">Dica Pedagógica: </strong>
                  Golpistas usam urgência para travar o raciocínio. O aprendizado aqui protege sua família no mundo real!
                </p>
              </div>
            )}

            {/* Lente Pedagógica */}
            <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <span className="text-xs font-semibold text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#2997ff]" />
                  <span>Lição do Caso</span>
                </span>
                <div className="flex p-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px]">
                  <button
                    onClick={() => setPedagogicalMode('kids')}
                    className={`px-2 py-0.5 rounded-full font-medium transition ${
                      pedagogicalMode === 'kids' ? 'bg-white/20 text-white' : 'text-[#86868b]'
                    }`}
                  >
                    Jovens
                  </button>
                  <button
                    onClick={() => setPedagogicalMode('adult')}
                    className={`px-2 py-0.5 rounded-full font-medium transition ${
                      pedagogicalMode === 'adult' ? 'bg-white/20 text-white' : 'text-[#86868b]'
                    }`}
                  >
                    Adultos
                  </button>
                </div>
              </div>

              {pedagogicalMode === 'kids' ? (
                <p className="text-[#d2d2d7] text-xs leading-relaxed">
                  <strong>🧒 Analogia: </strong>{currentCase.pedagogy.kidsAnalogy}
                </p>
              ) : (
                <p className="text-[#d2d2d7] text-xs leading-relaxed">
                  <strong>⚖️ Como Agir: </strong>{currentCase.pedagogy.adultRemedy}
                </p>
              )}

              <div className="pt-1 text-[#30d158] font-medium text-[11px]">
                "{currentCase.pedagogy.goldenRule}"
              </div>
            </div>

            {/* Próximo Caso */}
            <button
              onClick={handleNextCase}
              className="w-full py-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <span>Próximo Caso</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

      </motion.div>

      {/* MODAL 1: Sala de Conquistas (Apple Sheet) */}
      <AnimatePresence>
        {isBadgesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1c1c1e] border border-white/[0.1] rounded-[32px] max-w-md w-full p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <h3 className="font-semibold text-sm text-white">Sala de Conquistas</h3>
                  <p className="text-xs text-[#86868b]">{unlockedBadgeIds.length} de {BADGES.length} desbloqueadas</p>
                </div>
                <button
                  onClick={() => setIsBadgesModalOpen(false)}
                  className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-medium"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {BADGES.map((badge) => {
                  const isUnlocked = unlockedBadgeIds.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-2xl border transition flex items-center space-x-3 ${
                        isUnlocked ? 'bg-white/[0.06] border-white/[0.15]' : 'bg-white/[0.02] border-white/[0.04] opacity-40'
                      }`}
                    >
                      <span className="text-2xl p-1.5 bg-white/[0.08] rounded-xl">{badge.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-xs text-white">{badge.title}</h4>
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

      {/* MODAL 2: Cartilha da Família (Apple Sheet) */}
      <AnimatePresence>
        {isFamilyGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1c1c1e] border border-white/[0.1] rounded-[32px] max-w-md w-full p-5 space-y-3.5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <h3 className="font-semibold text-sm text-white">Cartilha da Família</h3>
                  <p className="text-xs text-[#86868b]">Regras de ouro e termos essenciais</p>
                </div>
                <button
                  onClick={() => setIsFamilyGuideOpen(false)}
                  className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-medium"
                >
                  ✕
                </button>
              </div>

              <div className="flex p-0.5 rounded-full bg-white/[0.06] border border-white/[0.08]">
                <button
                  onClick={() => setFamilyGuideTab('rules')}
                  className={`flex-1 py-1 rounded-full text-xs font-medium transition ${
                    familyGuideTab === 'rules' ? 'bg-white/20 text-white' : 'text-[#86868b]'
                  }`}
                >
                  Regras de Ouro
                </button>
                <button
                  onClick={() => setFamilyGuideTab('glossary')}
                  className={`flex-1 py-1 rounded-full text-xs font-medium transition ${
                    familyGuideTab === 'glossary' ? 'bg-white/20 text-white' : 'text-[#86868b]'
                  }`}
                >
                  Glossário
                </button>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {familyGuideTab === 'rules' ? (
                  FAMILY_GOLDEN_RULES.map((item) => (
                    <div key={item.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-white">{item.icon} {item.title}</span>
                        <span className="text-[10px] text-[#86868b]">{item.targetLabel}</span>
                      </div>
                      <p className="text-[11px] text-[#d2d2d7]">{item.practicalAction}</p>
                    </div>
                  ))
                ) : (
                  GLOSSARY_ITEMS.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-0.5 text-xs">
                      <h4 className="font-medium text-[#2997ff]">{item.term}</h4>
                      <p className="text-[11px] text-[#d2d2d7]">{item.simpleMeaning}</p>
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
