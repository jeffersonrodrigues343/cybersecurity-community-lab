import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Smartphone,
  PhoneCall,
  ShoppingBag,
  FileText,
  Flame,
  ChevronRight,
  Sparkles,
  Search,
  BookOpen,
  Trophy,
  HeartHandshake,
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
  const currentCaseCluesCount = currentCase.clues.length;
  const allCluesFoundInCurrentCase = currentCaseDiscovered.length === currentCaseCluesCount;

  // Métricas gerais
  const totalCases = SCAM_CASES.length;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;

  const totalXp = Object.entries(answers).reduce((acc, [caseId, data]) => {
    if (!data.isCorrect) return acc;
    const found = SCAM_CASES.find((c) => c.id === caseId);
    return acc + (found?.xpReward || 0) + (data.bonusXp || 0) + (data.comboBonus || 0);
  }, 0);

  const playerRank = calculatePlayerRank(totalXp);

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

  const getChannelIcon = (channel: ScamCase['channel']) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-[#30d158]" />;
      case 'sms':
        return <Smartphone className="w-3.5 h-3.5 text-[#2997ff]" />;
      case 'call':
        return <PhoneCall className="w-3.5 h-3.5 text-[#ff9f0a]" />;
      case 'social':
        return <ShoppingBag className="w-3.5 h-3.5 text-[#bf5af2]" />;
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-[#ff453a]" />;
    }
  };

  const currentAnswerData = answers[currentCase.id];

  return (
    <div className="space-y-5">
      
      {/* Toast Apple de Conquista Desbloqueada */}
      <AnimatePresence>
        {recentBadgeUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 rounded-[24px] bg-[#1d1d1f]/90 border border-white/[0.15] shadow-2xl backdrop-blur-2xl flex items-center justify-between text-white"
          >
            <div className="flex items-center space-x-3.5">
              <span className="text-3xl p-2 bg-white/[0.08] rounded-2xl border border-white/[0.1]">
                {recentBadgeUnlocked.icon}
              </span>
              <div>
                <span className="text-[11px] font-medium text-[#ff9f0a] uppercase tracking-wider block">
                  Conquista Desbloqueada
                </span>
                <h4 className="font-semibold text-sm text-white">
                  {recentBadgeUnlocked.title}
                </h4>
                <p className="text-xs text-[#86868b]">
                  {recentBadgeUnlocked.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setRecentBadgeUnlocked(null)}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.1] hover:bg-white/[0.18] text-white text-xs font-medium transition ml-4"
            >
              OK
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra de Status Estilo Apple */}
      <div className="apple-card p-4 sm:p-5 backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Patente do Cidadão */}
          <div className="flex items-center space-x-3">
            <span className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-xl">
              {playerRank.icon}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-xs text-white">
                  {playerRank.name}
                </span>
                <span className="text-white/20 text-xs">•</span>
                <span className="text-xs text-[#86868b] font-normal">
                  {playerRank.pedagogicalTitle}
                </span>
              </div>
              <p className="text-[11px] text-[#86868b] mt-0.5 line-clamp-1">
                {playerRank.summary}
              </p>
            </div>
          </div>

          {/* Atalhos Rápidos da Gamificação em Cápsula */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Combo Streak */}
            {streak > 1 && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ff9f0a]/15 border border-[#ff9f0a]/30 text-[#ff9f0a] text-xs font-medium"
              >
                <Flame className="w-3.5 h-3.5 fill-[#ff9f0a]" />
                <span>Combo {streak}x {streak >= 3 ? '(+30 XP!)' : '(+10 XP)'}</span>
              </motion.div>
            )}

            {/* Conquistas */}
            <button
              onClick={() => {
                sound.playBlip();
                setIsBadgesModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-normal transition"
            >
              <Trophy className="w-3.5 h-3.5 text-[#ff9f0a]" />
              <span>Conquistas ({unlockedBadgeIds.length}/{BADGES.length})</span>
            </button>

            {/* Cartilha da Família */}
            <button
              onClick={() => {
                sound.playBlip();
                setIsFamilyGuideOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#0071e3]/15 hover:bg-[#0071e3]/25 border border-[#2997ff]/30 text-[#2997ff] text-xs font-normal transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#2997ff]" />
              <span>Cartilha da Família</span>
            </button>

            {/* XP Total */}
            <div className="px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.1] text-xs font-medium text-white">
              <span className="text-[#30d158] font-semibold">{totalXp}</span>
              <span className="text-[#86868b] ml-1">XP</span>
            </div>

          </div>

        </div>

        {/* Apple Segmented Control para Seleção de Níveis */}
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <div className="flex p-1 rounded-full bg-white/[0.04] border border-white/[0.08] max-w-lg mx-auto">
            
            <button
              onClick={() => handleSelectLevel('basico')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-all ${
                currentLevel === 'basico'
                  ? 'bg-white/[0.15] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-white'
              }`}
            >
              1. Básico (WhatsApp & SMS)
            </button>

            <button
              onClick={() => handleSelectLevel('medio')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-all ${
                currentLevel === 'medio'
                  ? 'bg-white/[0.15] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-white'
              }`}
            >
              2. Médio (0800 & Lojas)
            </button>

            <button
              onClick={() => handleSelectLevel('avancado')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-all ${
                currentLevel === 'avancado'
                  ? 'bg-white/[0.15] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-white'
              }`}
            >
              3. Avançado (AnyDesk & Boletos)
            </button>

          </div>
        </div>

      </div>

      {/* Card Principal de Investigação (Estilo Apple / iOS) */}
      <motion.div
        key={currentCase.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="apple-card overflow-hidden shadow-2xl"
      >
        {/* Cabeçalho do Caso */}
        <div className="p-4 sm:p-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1d1d1f]/40">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[11px] text-[#86868b] flex items-center space-x-1.5">
                {getChannelIcon(currentCase.channel)}
                <span>{currentCase.category}</span>
              </span>
              <span className="text-xs text-[#86868b]">
                Caso {currentCaseIndex + 1} de {levelCases.length}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              {currentCase.title}
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[#86868b]">Recompensa:</span>
            <span className="px-2.5 py-1 rounded-full bg-[#30d158]/10 text-[#30d158] font-medium">
              +{currentCase.xpReward} XP Base
            </span>
          </div>
        </div>

        {/* Simulador de Tela iOS da Mensagem Recebida */}
        <div className="p-4 sm:p-6 bg-black">
          <div className="max-w-xl mx-auto rounded-[24px] border border-white/[0.08] bg-[#161617] shadow-inner overflow-hidden">
            
            {/* Barra Superior do Mensageiro */}
            <div className="px-4 py-2.5 bg-[#1c1c1e] border-b border-white/[0.06] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-medium text-white text-xs">
                  {currentCase.sender.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-white text-xs">{currentCase.sender}</div>
                  <div className="text-[10px] text-[#86868b]">{currentCase.channel.toUpperCase()}</div>
                </div>
              </div>
              <span className="text-[11px] text-[#86868b]">{currentCase.time}</span>
            </div>

            {/* Conteúdo da Mensagem com Tipografia iOS */}
            <div className="p-4 sm:p-6 text-sm text-[#f5f5f7] leading-relaxed whitespace-pre-wrap">
              {currentCase.messageContent}
            </div>

          </div>
        </div>

        {/* Kit do Investigador com Estilo Apple Cards */}
        <div className="p-4 sm:p-5 bg-[#161617] border-t border-white/[0.06]">
          <div className="max-w-xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5 text-[#2997ff]" />
                <span className="text-xs font-medium text-white uppercase tracking-wider">
                  Kit do Investigador: Inspecione as Pistas (+10 XP)
                </span>
              </div>
              <span className="text-[11px] text-[#86868b]">
                {currentCaseDiscovered.length}/{currentCaseCluesCount} analisadas
              </span>
            </div>

            <p className="text-xs text-[#86868b] leading-relaxed">
              Use as ferramentas periciais antes de votar para checar o remetente, dados e inconsistências:
            </p>

            {/* Grade de Ferramentas de Auditoria */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {currentCase.clues.map((clue) => {
                const isDiscovered = currentCaseDiscovered.includes(clue.id);
                return (
                  <button
                    key={clue.id}
                    onClick={() => handleInspectClue(clue)}
                    className={`p-3 rounded-[18px] border text-left transition-all flex flex-col justify-between ${
                      isDiscovered
                        ? 'bg-[#0071e3]/15 border-[#2997ff]/40 text-white'
                        : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.06] text-[#d2d2d7]'
                    }`}
                  >
                    <span className="text-xs font-medium block mb-1 leading-snug">
                      {clue.buttonLabel}
                    </span>
                    <span className="text-[10px] flex items-center gap-1 mt-1">
                      {isDiscovered ? (
                        <span className="text-[#30d158] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Evidência Coletada</span>
                        </span>
                      ) : (
                        <span className="text-[#86868b]">Toque para periciar</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal / Gaveta de Laudo Pericial Apple */}
        <AnimatePresence>
          {activeClueModal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 sm:p-5 bg-[#1c1c1e] border-t border-b border-white/[0.08] text-xs"
            >
              <div className="max-w-xl mx-auto space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <div className="flex items-center space-x-2">
                    <Search className="w-3.5 h-3.5 text-[#2997ff]" />
                    <span className="font-semibold text-white text-xs">
                      Laudo Pericial: {activeClueModal.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveClueModal(null)}
                    className="text-[#86868b] hover:text-white px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[11px]"
                  >
                    Fechar ✕
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-[#86868b] text-xs">
                    <strong>Pergunta do Perito:</strong> {activeClueModal.question}
                  </div>

                  <div
                    className={`p-3 rounded-[16px] border ${
                      activeClueModal.evidenceResult.status === 'suspicious'
                        ? 'bg-[#ff453a]/10 border-[#ff453a]/30 text-white'
                        : 'bg-[#30d158]/10 border-[#30d158]/30 text-white'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center gap-1.5 mb-1">
                      {activeClueModal.evidenceResult.status === 'suspicious' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#ff453a] flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158] flex-shrink-0" />
                      )}
                      <span>{activeClueModal.evidenceResult.headline}</span>
                    </div>
                    <p className="text-[#d2d2d7] text-xs leading-relaxed font-sans">
                      {activeClueModal.evidenceResult.details}
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/[0.06] rounded-[16px] p-3 text-[11px] text-[#86868b] space-y-1">
                    <span className="text-[#ff9f0a] font-medium block">💡 Fato Forense / Como funciona o golpe:</span>
                    <p className="leading-relaxed font-sans">{activeClueModal.evidenceResult.forensicFact}</p>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-[#86868b]">
                  <span>✓ Evidência adicionada ao seu relatório (+10 XP ao acertar).</span>
                  <button
                    onClick={() => setActiveClueModal(null)}
                    className="text-[#2997ff] hover:underline font-medium"
                  >
                    Continuar Investigação →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botões de Veredito Apple Capsule */}
        {!currentAnswerData?.answered ? (
          <div className="p-4 sm:p-6 border-t border-white/[0.06] bg-[#161617]">
            <div className="max-w-xl mx-auto space-y-3">
              <div className="flex items-center justify-between text-xs text-[#86868b]">
                <span className="font-medium uppercase tracking-wider">
                  Emita seu veredito:
                </span>
                {allCluesFoundInCurrentCase && (
                  <span className="text-[#30d158] font-medium flex items-center gap-1">
                    <span>+30 XP Bônus Pericial Ativo</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Botão: É Golpe (Apple Red Capsule) */}
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => handleVerdict(true)}
                  className="py-3.5 px-6 rounded-full bg-[#ff453a] hover:bg-[#ff3b30] text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#ff453a]/25 transition cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-white" />
                  <span>É GOLPE</span>
                </motion.button>

                {/* Botão: É Seguro (Apple Blue Capsule) */}
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => handleVerdict(false)}
                  className="py-3.5 px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#0071e3]/25 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>É SEGURO / LEGÍTIMO</span>
                </motion.button>

              </div>
            </div>
          </div>
        ) : (
          /* Painel de Resultado e Explicação Pedagógica Estilo Apple */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-6 border-t border-white/[0.06] bg-[#161617]"
          >
            <div className="max-w-xl mx-auto space-y-4">
              
              {/* Banner de Acerto ou Erro */}
              <div
                className={`p-4 rounded-[20px] border flex items-center space-x-3 ${
                  currentAnswerData.isCorrect
                    ? 'bg-[#30d158]/10 border-[#30d158]/30 text-white'
                    : 'bg-[#ff453a]/10 border-[#ff453a]/30 text-white'
                }`}
              >
                {currentAnswerData.isCorrect ? (
                  <CheckCircle2 className="w-7 h-7 text-[#30d158] flex-shrink-0" />
                ) : (
                  <XCircle className="w-7 h-7 text-[#ff453a] flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-semibold text-base">
                    {currentAnswerData.isCorrect
                      ? `Veredito Perfeito! +${currentCase.xpReward} XP Base ${
                          currentAnswerData.bonusXp > 0 ? `+ ${currentAnswerData.bonusXp} XP Pistas` : ''
                        } ${currentAnswerData.comboBonus > 0 ? `+ ${currentAnswerData.comboBonus} XP Combo 🔥` : ''}`
                      : 'Veredito Incorreto! Você caiu na armadilha.'}
                  </h4>
                  <p className="text-xs text-[#86868b]">
                    {currentCase.isScam
                      ? 'Esta mensagem era de fato um GOLPE financeiro.'
                      : 'Esta mensagem era LEGÍTIMA e segura.'}
                  </p>
                </div>
              </div>

              {/* Mensagem Acolhedora do Pedagogo em caso de erro */}
              {!currentAnswerData.isCorrect && (
                <div className="p-3.5 rounded-[18px] bg-white/[0.04] border border-white/[0.08] text-xs flex items-start space-x-3">
                  <HeartHandshake className="w-4 h-4 text-[#bf5af2] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-medium mb-0.5">
                      Palavra do Pedagogo: Não se culpe por errar!
                    </strong>
                    <p className="text-[#86868b] leading-relaxed">
                      Criminosos profissionais usam gatilhos emocionais para induzir o cérebro ao erro. O objetivo deste laboratório é justamente errar no treino para nunca errar na vida real!
                    </p>
                  </div>
                </div>
              )}

              {/* Seletor do Perfil Pedagógico (Apple Segmented Control) */}
              <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-[22px] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-xs font-medium text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" />
                    Lente Pedagógica
                  </span>
                  
                  {/* Apple Segmented Switch */}
                  <div className="flex p-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs">
                    <button
                      onClick={() => setPedagogicalMode('kids')}
                      className={`px-3 py-1 rounded-full font-medium transition ${
                        pedagogicalMode === 'kids'
                          ? 'bg-white/[0.18] text-white shadow-sm'
                          : 'text-[#86868b] hover:text-white'
                      }`}
                    >
                      Jovem & Crianças
                    </button>
                    <button
                      onClick={() => setPedagogicalMode('adult')}
                      className={`px-3 py-1 rounded-full font-medium transition ${
                        pedagogicalMode === 'adult'
                          ? 'bg-white/[0.18] text-white shadow-sm'
                          : 'text-[#86868b] hover:text-white'
                      }`}
                    >
                      Adultos & Família
                    </button>
                  </div>
                </div>

                {/* Conteúdo Adaptado */}
                {pedagogicalMode === 'kids' ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/[0.06]">
                      <strong className="block text-[#2997ff] font-medium mb-1">
                        🧒 Analogia do Lobo Mau Digital:
                      </strong>
                      <p className="text-[#d2d2d7] leading-relaxed">
                        {currentCase.pedagogy.kidsAnalogy}
                      </p>
                    </div>

                    <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/[0.06]">
                      <strong className="block text-[#ff9f0a] font-medium mb-1">
                        👨‍👩‍👧‍👦 Como Conversar com a Família:
                      </strong>
                      <p className="text-[#86868b] leading-relaxed">
                        {currentCase.pedagogy.parentsGuide}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/[0.06]">
                      <strong className="block text-[#ff9f0a] font-medium mb-1">
                        🎯 Gatilho Psicológico Explorador:
                      </strong>
                      <p className="text-[#d2d2d7] leading-relaxed">
                        {currentCase.pedagogy.emotionalTrigger}
                      </p>
                    </div>

                    <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/[0.06]">
                      <strong className="block text-[#ff453a] font-medium mb-1">
                        ⚖️ Proteção Patrimonial (Banco Central MED / B.O.):
                      </strong>
                      <p className="text-[#86868b] leading-relaxed">
                        {currentCase.pedagogy.adultRemedy}
                      </p>
                    </div>
                  </div>
                )}

                {/* Regra de Ouro Inesquecível */}
                <div className="p-3 rounded-[16px] bg-[#30d158]/10 border border-[#30d158]/25 text-white">
                  <div className="flex items-center space-x-1.5 font-medium mb-1 text-[#30d158]">
                    <Sparkles className="w-3.5 h-3.5 text-[#30d158] flex-shrink-0" />
                    <span>Regra de Ouro:</span>
                  </div>
                  <p className="text-white text-xs leading-relaxed">
                    "{currentCase.pedagogy.goldenRule}"
                  </p>
                </div>

              </div>

              {/* Sinais de Perigo Apontados */}
              {currentCase.redFlags.length > 0 && (
                <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-[20px] p-4 space-y-2">
                  <span className="text-xs font-medium text-[#ff9f0a] flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#ff9f0a]" />
                    Pistas que entregavam o crime:
                  </span>
                  <ul className="space-y-1 text-xs text-[#d2d2d7]">
                    {currentCase.redFlags.map((flag, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-[#ff453a] font-bold">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botão de Próximo Caso Apple Capsule */}
              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={handleNextCase}
                  className="w-full py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#0071e3]/20 transition cursor-pointer"
                >
                  <span>Próximo Caso</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>

            </div>
          </motion.div>
        )}

      </motion.div>

      {/* Mini Resumo das Fases */}
      <div className="p-4 rounded-[20px] bg-white/[0.03] border border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-[#86868b]">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-[#30d158]" />
          <span>Analise todas as evidências com as ferramentas periciais antes de votar.</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-white font-medium">{correctCount} de {answeredCount} acertados</span>
        </div>
      </div>

      {/* MODAL 1: Sala de Conquistas e Troféus (Apple Sheet) */}
      <AnimatePresence>
        {isBadgesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1c1c1e] border border-white/[0.1] rounded-[32px] max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/[0.08] rounded-2xl border border-white/[0.08]">
                    <Trophy className="w-5 h-5 text-[#ff9f0a]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-white">Sala de Conquistas</h3>
                    <p className="text-xs text-[#86868b]">
                      {unlockedBadgeIds.length} de {BADGES.length} medalhas conquistadas
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBadgesModalOpen(false)}
                  className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-medium"
                >
                  Fechar ✕
                </button>
              </div>

              {/* Grade de Medalhas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {BADGES.map((badge) => {
                  const isUnlocked = unlockedBadgeIds.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-3.5 rounded-[22px] border transition-all ${
                        isUnlocked
                          ? 'bg-white/[0.06] border-white/[0.15] shadow-sm'
                          : 'bg-white/[0.02] border-white/[0.05] opacity-40'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className={`text-2xl p-2 rounded-2xl border ${
                          isUnlocked
                            ? 'bg-white/[0.1] border-white/[0.15]'
                            : 'bg-white/[0.04] border-white/[0.06] grayscale'
                        }`}>
                          {badge.icon}
                        </span>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-xs text-white">
                              {badge.title}
                            </h4>
                            <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-white/[0.08] text-[#86868b]">
                              {badge.rarity}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#d2d2d7] leading-snug">
                            {badge.description}
                          </p>
                          <p className="text-[10px] text-[#86868b]">
                            {isUnlocked ? '✓ Conquistada!' : badge.unlockedHint}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Cartilha Pedagógica da Família Segura (Apple Sheet) */}
      <AnimatePresence>
        {isFamilyGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1c1c1e] border border-white/[0.1] rounded-[32px] max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/[0.08] rounded-2xl border border-white/[0.08]">
                    <BookOpen className="w-5 h-5 text-[#2997ff]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-white">Cartilha da Família</h3>
                    <p className="text-xs text-[#86868b]">
                      Guia educativo para crianças, jovens e adultos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFamilyGuideOpen(false)}
                  className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-medium"
                >
                  Fechar ✕
                </button>
              </div>

              {/* Seletor de Aba da Cartilha em Cápsula */}
              <div className="flex p-0.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
                <button
                  onClick={() => setFamilyGuideTab('rules')}
                  className={`flex-1 py-1.5 rounded-full text-xs font-medium transition ${
                    familyGuideTab === 'rules'
                      ? 'bg-white/[0.15] text-white shadow-sm'
                      : 'text-[#86868b] hover:text-white'
                  }`}
                >
                  Regras de Ouro
                </button>
                <button
                  onClick={() => setFamilyGuideTab('glossary')}
                  className={`flex-1 py-1.5 rounded-full text-xs font-medium transition ${
                    familyGuideTab === 'glossary'
                      ? 'bg-white/[0.15] text-white shadow-sm'
                      : 'text-[#86868b] hover:text-white'
                  }`}
                >
                  Glossário Ilustrado
                </button>
              </div>

              {/* Aba 1: Regras de Ouro */}
              {familyGuideTab === 'rules' && (
                <div className="space-y-2.5 pt-1">
                  {FAMILY_GOLDEN_RULES.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-[20px] bg-white/[0.03] border border-white/[0.06] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{item.icon}</span>
                          <h4 className="font-semibold text-xs text-white">{item.title}</h4>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-[#86868b]">
                          {item.targetLabel}
                        </span>
                      </div>
                      <p className="text-xs text-[#ff9f0a] font-medium">
                        💡 {item.rule}
                      </p>
                      <p className="text-xs text-[#d2d2d7] leading-relaxed">
                        {item.practicalAction}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Aba 2: Glossário Pedagógico */}
              {familyGuideTab === 'glossary' && (
                <div className="space-y-2.5 pt-1">
                  {GLOSSARY_ITEMS.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-[20px] bg-white/[0.03] border border-white/[0.06] space-y-1.5"
                    >
                      <div className="flex items-baseline justify-between">
                        <h4 className="font-semibold text-xs text-[#2997ff]">{item.term}</h4>
                        {item.pronunciation && (
                          <span className="text-[10px] text-[#86868b]">
                            {item.pronunciation}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#d2d2d7] leading-relaxed">
                        <strong>Significado:</strong> {item.simpleMeaning}
                      </p>
                      <div className="p-2.5 rounded-[14px] bg-black/40 border border-white/[0.04] text-[11px] text-[#86868b] space-y-0.5">
                        <span className="text-white block font-medium">Exemplo:</span>
                        <p>{item.realWorldExample}</p>
                      </div>
                      <p className="text-[11px] text-[#ff9f0a]">
                        ⭐ Dica: {item.pedagogicalTip}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
