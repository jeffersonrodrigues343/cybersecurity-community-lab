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
  Award,
  BookOpen,
  Users,
  Trophy,
  HeartHandshake,
  Shield,
  HelpCircle,
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

  // Salvar medalhas no localStorage
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

  const isLevelCompleted = (level: ScamLevel) => {
    const cases = SCAM_CASES.filter((c) => c.level === level);
    return cases.every((c) => answers[c.id]?.answered);
  };

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

      // Conquista: primeira pista investigada
      unlockBadge('badge-first-clue');

      // Conquista: rastreador de domínios
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

      // Verificação de medalhas por mérito específico
      if (currentCase.id === 'case-1-whatsapp') {
        unlockBadge('badge-family-shield');
      }
      if (currentCase.id === 'case-7-mao-fantasma') {
        unlockBadge('badge-anti-ghost');
      }
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
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'sms':
        return <Smartphone className="w-4 h-4 text-blue-400" />;
      case 'call':
        return <PhoneCall className="w-4 h-4 text-amber-400" />;
      case 'social':
        return <ShoppingBag className="w-4 h-4 text-purple-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-rose-400" />;
    }
  };

  const currentAnswerData = answers[currentCase.id];

  return (
    <div className="space-y-6">
      
      {/* Toast Comemorativo de Conquista Desbloqueada */}
      <AnimatePresence>
        {recentBadgeUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border border-amber-500/60 shadow-2xl flex items-center justify-between text-white"
          >
            <div className="flex items-center space-x-3.5">
              <span className="text-3xl p-2 bg-amber-500/20 rounded-xl border border-amber-500/40">
                {recentBadgeUnlocked.icon}
              </span>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                  🏆 Nova Conquista Pedagógica Desbloqueada!
                </span>
                <h4 className="font-extrabold text-base text-white">
                  {recentBadgeUnlocked.title}
                </h4>
                <p className="text-xs text-slate-300">
                  {recentBadgeUnlocked.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setRecentBadgeUnlocked(null)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition ml-4"
            >
              Comemorar! ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra de Status Pedagógico do Jogador */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Patente do Cidadão */}
          <div className="flex items-center space-x-3">
            <span className="text-3xl p-2.5 bg-slate-800 rounded-2xl border border-slate-700 shadow-inner">
              {playerRank.icon}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-mono text-xs font-bold uppercase tracking-wider ${playerRank.color}`}>
                  {playerRank.name}
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-xs text-slate-300 font-sans font-medium">
                  {playerRank.pedagogicalTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {playerRank.summary}
              </p>
            </div>
          </div>

          {/* Atalhos Rápidos da Gamificação */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Indicador de Combo de Acertos */}
            {streak > 1 && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold shadow-lg shadow-amber-950/30"
              >
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                <span>Combo {streak}x {streak >= 3 ? '(+30 XP Bônus!)' : '(+10 XP)'}</span>
              </motion.div>
            )}

            {/* Botão Sala de Conquistas */}
            <button
              onClick={() => {
                sound.playBlip();
                setIsBadgesModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Conquistas ({unlockedBadgeIds.length}/{BADGES.length})</span>
            </button>

            {/* Botão Cartilha da Família & Glossário */}
            <button
              onClick={() => {
                sound.playBlip();
                setIsFamilyGuideOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 text-blue-200 text-xs font-bold transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Cartilha da Família</span>
            </button>

            {/* XP Total */}
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 font-mono text-xs font-bold">
              <span>{totalXp} XP</span>
            </div>

          </div>

        </div>

        {/* Nível Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 mt-4 border-t border-slate-800/80">
          
          {/* Nível Básico */}
          <button
            onClick={() => handleSelectLevel('basico')}
            className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between ${
              currentLevel === 'basico'
                ? 'border-emerald-500 bg-emerald-950/30 text-white shadow-lg shadow-emerald-950/30'
                : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="font-bold text-sm text-slate-100">1. Nível Básico</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">WhatsApp e SMS Falsos</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/40">
                +50 XP/caso
              </span>
              {isLevelCompleted('basico') && (
                <div className="text-emerald-400 text-[10px] font-bold mt-1">✓ Concluído</div>
              )}
            </div>
          </button>

          {/* Nível Médio */}
          <button
            onClick={() => handleSelectLevel('medio')}
            className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between ${
              currentLevel === 'medio'
                ? 'border-amber-500 bg-amber-950/30 text-white shadow-lg shadow-amber-950/30'
                : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="font-bold text-sm text-slate-100">2. Nível Médio</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Falsa Central e Lojas Falsas</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-700/40">
                +100 XP/caso
              </span>
              {isLevelCompleted('medio') && (
                <div className="text-emerald-400 text-[10px] font-bold mt-1">✓ Concluído</div>
              )}
            </div>
          </button>

          {/* Nível Avançado */}
          <button
            onClick={() => handleSelectLevel('avancado')}
            className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between ${
              currentLevel === 'avancado'
                ? 'border-rose-500 bg-rose-950/30 text-white shadow-lg shadow-rose-950/30'
                : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                <span className="font-bold text-sm text-slate-100">3. Nível Avançado</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">App Espião e Falso Boleto</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/40 text-rose-300 border border-rose-700/40">
                +150 XP/caso
              </span>
              {isLevelCompleted('avancado') && (
                <div className="text-emerald-400 text-[10px] font-bold mt-1">✓ Concluído</div>
              )}
            </div>
          </button>

        </div>
      </div>

      {/* Card Principal de Investigação */}
      <motion.div
        key={currentCase.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Cabeçalho do Caso */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 flex items-center space-x-1.5">
                {getChannelIcon(currentCase.channel)}
                <span>{currentCase.category}</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Caso {currentCaseIndex + 1} de {levelCases.length}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>{currentCase.title}</span>
            </h3>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-slate-400">Recompensa:</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-bold">
              +{currentCase.xpReward} XP Base
            </span>
          </div>
        </div>

        {/* Simulador Visual do Mensageiro / Dispositivo */}
        <div className="p-4 sm:p-6 bg-[#070b13]">
          <div className="max-w-xl mx-auto rounded-2xl border border-slate-800 bg-[#0d131f] shadow-inner overflow-hidden">
            
            {/* Barra do App Simulado */}
            <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-200">
                  {currentCase.sender.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-xs">{currentCase.sender}</div>
                  <div className="text-[10px] text-slate-400">Canal: {currentCase.channel.toUpperCase()}</div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{currentCase.time}</span>
            </div>

            {/* Conteúdo da Mensagem */}
            <div className="p-4 sm:p-6 text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
              {currentCase.messageContent}
            </div>

          </div>
        </div>

        {/* Kit do Investigador Forense */}
        <div className="p-4 sm:p-6 bg-slate-900/60 border-t border-slate-800">
          <div className="max-w-xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-300">
                  Kit do Investigador: Inspecione as Pistas (+10 XP cada)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {currentCaseDiscovered.length}/{currentCaseCluesCount} analisadas
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Não adivinhe. Use as ferramentas periciais abaixo para auditar o remetente, dados técnicos e inconsistências antes de bater o martelo:
            </p>

            {/* Grade de Ferramentas de Auditoria */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {currentCase.clues.map((clue) => {
                const isDiscovered = currentCaseDiscovered.includes(clue.id);
                return (
                  <button
                    key={clue.id}
                    onClick={() => handleInspectClue(clue)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isDiscovered
                        ? 'bg-blue-950/40 border-blue-500/60 text-blue-200 shadow-sm'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold block mb-1">
                      {clue.buttonLabel}
                    </span>
                    <span className="text-[10px] font-mono flex items-center gap-1">
                      {isDiscovered ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Evidência Coletada</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">Toque para periciar</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal / Gaveta de Laudo Pericial da Pista Inspecionada */}
        <AnimatePresence>
          {activeClueModal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 sm:p-6 bg-[#0b1220] border-t border-b border-blue-900/60 font-mono text-xs"
            >
              <div className="max-w-xl mx-auto space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-white text-sm">
                      Laudo Pericial: {activeClueModal.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveClueModal(null)}
                    className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 text-[11px]"
                  >
                    Fechar Análise ✕
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-slate-400 text-xs">
                    <strong>Pergunta do Perito:</strong> {activeClueModal.question}
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      activeClueModal.evidenceResult.status === 'suspicious'
                        ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                        : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
                      {activeClueModal.evidenceResult.status === 'suspicious' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      )}
                      <span>{activeClueModal.evidenceResult.headline}</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed font-sans">
                      {activeClueModal.evidenceResult.details}
                    </p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
                    <span className="text-amber-400 font-bold block">💡 Fato Forense / Como funciona o golpe:</span>
                    <p className="leading-relaxed font-sans">{activeClueModal.evidenceResult.forensicFact}</p>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>✓ Evidência adicionada ao seu relatório pericial (+10 XP Bônus ao acertar).</span>
                  <button
                    onClick={() => setActiveClueModal(null)}
                    className="text-blue-400 hover:underline font-bold"
                  >
                    Continuar Investigação →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botoes de Veredito do Jogador */}
        {!currentAnswerData?.answered ? (
          <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/60">
            <div className="max-w-xl mx-auto space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="font-bold uppercase tracking-wider">
                  Com base nas evidências, emita seu veredito:
                </span>
                {allCluesFoundInCurrentCase && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>+30 XP Bônus de Perito Ativo!</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Botao: E Golpe */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleVerdict(true)}
                  className="p-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-950/50 transition cursor-pointer"
                >
                  <ShieldAlert className="w-5 h-5 text-white" />
                  <span>🚨 VEREDITO: É GOLPE!</span>
                </motion.button>

                {/* Botao: E Seguro */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleVerdict(false)}
                  className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5 text-slate-950" />
                  <span>✅ VEREDITO: É SEGURO / LEGÍTIMO</span>
                </motion.button>

              </div>
            </div>
          </div>
        ) : (
          /* Painel de Resultado e Explicacao Pedagogica Completa */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/80"
          >
            <div className="max-w-xl mx-auto space-y-4">
              
              {/* Banner de Acerto ou Erro */}
              <div
                className={`p-4 rounded-xl border flex items-center space-x-3 ${
                  currentAnswerData.isCorrect
                    ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200'
                    : 'bg-red-950/50 border-red-500/60 text-red-200'
                }`}
              >
                {currentAnswerData.isCorrect ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-extrabold text-base">
                    {currentAnswerData.isCorrect
                      ? `Veredito Perfeito! +${currentCase.xpReward} XP Base ${
                          currentAnswerData.bonusXp > 0 ? `+ ${currentAnswerData.bonusXp} XP Pistas` : ''
                        } ${currentAnswerData.comboBonus > 0 ? `+ ${currentAnswerData.comboBonus} XP Combo 🔥` : ''}`
                      : 'Veredito Incorreto! Você caiu na armadilha.'}
                  </h4>
                  <p className="text-xs opacity-90">
                    {currentCase.isScam
                      ? 'Esta mensagem era de fato um GOLPE financeiro.'
                      : 'Esta mensagem era LEGÍTIMA e segura.'}
                  </p>
                </div>
              </div>

              {/* Mensagem Acolhedora do Pedagogo em caso de erro */}
              {!currentAnswerData.isCorrect && (
                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 text-purple-200 text-xs flex items-start space-x-3">
                  <HeartHandshake className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-purple-300 font-bold mb-0.5">
                      Palavra do Pedagogo: Não se culpe por errar!
                    </strong>
                    <p className="text-slate-300 leading-relaxed font-sans">
                      Criminosos profissionais gastam milhares de reais e usam gatilhos emocionais para induzir o cérebro ao erro. O objetivo deste laboratório é justamente errar aqui no treino para nunca errar na vida real!
                    </p>
                  </div>
                </div>
              )}

              {/* Seletor do Perfil Pedagógico (Crianças vs Adultos) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 uppercase">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Lente Pedagógica: Escolha como aprender
                  </span>
                  
                  {/* Toggle Crianças vs Adultos */}
                  <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                    <button
                      onClick={() => setPedagogicalMode('kids')}
                      className={`px-2.5 py-1 rounded-md font-bold transition flex items-center space-x-1 ${
                        pedagogicalMode === 'kids'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-3 h-3" />
                      <span>Jovem & Crianças</span>
                    </button>
                    <button
                      onClick={() => setPedagogicalMode('adult')}
                      className={`px-2.5 py-1 rounded-md font-bold transition flex items-center space-x-1 ${
                        pedagogicalMode === 'adult'
                          ? 'bg-amber-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      <span>Adultos & Família</span>
                    </button>
                  </div>
                </div>

                {/* Conteúdo Pedagógico Adaptado */}
                {pedagogicalMode === 'kids' ? (
                  <div className="space-y-3 text-xs">
                    {/* Analogia Lúdica para Crianças */}
                    <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-blue-200">
                      <strong className="block text-blue-300 font-bold mb-1">
                        🧒 Analogia do Lobo Mau Digital:
                      </strong>
                      <p className="text-slate-300 leading-relaxed font-sans">
                        {currentCase.pedagogy.kidsAnalogy}
                      </p>
                    </div>

                    {/* Dica para os Pais conversar em casa */}
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
                      <strong className="block text-amber-300 font-bold mb-1">
                        👨‍👩‍👧‍👦 Como Conversar com a Família:
                      </strong>
                      <p className="text-slate-400 leading-relaxed font-sans">
                        {currentCase.pedagogy.parentsGuide}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    {/* Gatilho Psicológico Usado pelo Criminoso */}
                    <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200">
                      <strong className="block text-amber-300 font-bold mb-1">
                        🎯 Gatilho Psicológico Explorador:
                      </strong>
                      <p className="text-slate-300 leading-relaxed font-sans">
                        {currentCase.pedagogy.emotionalTrigger}
                      </p>
                    </div>

                    {/* Procedimento Legal e Financeiro Imediato */}
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
                      <strong className="block text-rose-300 font-bold mb-1">
                        ⚖️ Proteção Patrimonial (Banco Central MED / B.O.):
                      </strong>
                      <p className="text-slate-400 leading-relaxed font-sans">
                        {currentCase.pedagogy.adultRemedy}
                      </p>
                    </div>
                  </div>
                )}

                {/* Regra de Ouro Inesquecível */}
                <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/50 text-emerald-200">
                  <div className="flex items-center space-x-2 font-bold mb-1 text-emerald-300">
                    <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Regra de Ouro para Lembrar Sempre:</span>
                  </div>
                  <p className="text-white font-medium text-xs leading-relaxed font-sans">
                    "{currentCase.pedagogy.goldenRule}"
                  </p>
                </div>

              </div>

              {/* Sinais de Perigo Apontados */}
              {currentCase.redFlags.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Principais Pistas que entregavam o crime:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {currentCase.redFlags.map((flag, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botao de Proximo Caso */}
              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextCase}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950 transition cursor-pointer"
                >
                  <span>Próximo Caso da Investigação</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>

            </div>
          </motion.div>
        )}

      </motion.div>

      {/* Mini Resumo das Fases */}
      <div className="bg-slate-900/50 border border-slate-800/70 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Analise todas as evidências com as ferramentas antes de decidir. Aprender a investigar é o melhor escudo.</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-emerald-400">Acertos: {correctCount} de {answeredCount} julgados</span>
        </div>
      </div>

      {/* MODAL 1: Sala de Conquistas e Troféus */}
      <AnimatePresence>
        {isBadgesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/40">
                    <Trophy className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white">Sala de Conquistas do Perito</h3>
                    <p className="text-xs text-slate-400">
                      {unlockedBadgeIds.length} de {BADGES.length} medalhas conquistadas
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBadgesModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  ✕ Fechar
                </button>
              </div>

              {/* Grade de Medalhas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {BADGES.map((badge) => {
                  const isUnlocked = unlockedBadgeIds.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border-amber-500/50 shadow-md'
                          : 'bg-slate-950/40 border-slate-800/80 opacity-55'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className={`text-2xl p-2 rounded-xl border ${
                          isUnlocked
                            ? 'bg-amber-500/20 border-amber-500/40'
                            : 'bg-slate-800 border-slate-700 grayscale'
                        }`}>
                          {badge.icon}
                        </span>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-white">
                              {badge.title}
                            </h4>
                            <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                              badge.rarity === 'platina'
                                ? 'bg-purple-900/40 text-purple-300 border-purple-700/50'
                                : badge.rarity === 'ouro'
                                ? 'bg-amber-900/40 text-amber-300 border-amber-700/50'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {badge.rarity}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">
                            {badge.description}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {isUnlocked ? '✓ Conquistada!' : `Como desbloquear: ${badge.unlockedHint}`}
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

      {/* MODAL 2: Cartilha Pedagógica da Família Segura */}
      <AnimatePresence>
        {isFamilyGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-4 max-h-[88vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/40">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white">Cartilha da Família & Glossário</h3>
                    <p className="text-xs text-slate-400">
                      Material pedagógico aberto para ensinar crianças, jovens e adultos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFamilyGuideOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  ✕ Fechar
                </button>
              </div>

              {/* Seletor de Aba da Cartilha */}
              <div className="flex space-x-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setFamilyGuideTab('rules')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                    familyGuideTab === 'rules'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Regras de Ouro da Família</span>
                </button>
                <button
                  onClick={() => setFamilyGuideTab('glossary')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                    familyGuideTab === 'glossary'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Glossário Pedagógico Ilustrado</span>
                </button>
              </div>

              {/* Aba 1: Regras de Ouro */}
              {familyGuideTab === 'rules' && (
                <div className="space-y-3 pt-2">
                  {FAMILY_GOLDEN_RULES.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{item.icon}</span>
                          <h4 className="font-bold text-sm text-white">{item.title}</h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                          {item.targetLabel}
                        </span>
                      </div>
                      <p className="text-xs text-amber-300 font-semibold">
                        💡 {item.rule}
                      </p>
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {item.practicalAction}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Aba 2: Glossário Pedagógico */}
              {familyGuideTab === 'glossary' && (
                <div className="space-y-3 pt-2">
                  {GLOSSARY_ITEMS.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition space-y-2"
                    >
                      <div className="flex items-baseline justify-between">
                        <h4 className="font-bold text-sm text-emerald-400">{item.term}</h4>
                        {item.pronunciation && (
                          <span className="text-[11px] font-mono text-slate-500">
                            Pronúncia: {item.pronunciation}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-200 font-sans leading-relaxed">
                        <strong>O que significa:</strong> {item.simpleMeaning}
                      </p>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <span className="text-blue-300 font-semibold block">Exemplo Real:</span>
                        <p className="font-sans">{item.realWorldExample}</p>
                      </div>
                      <p className="text-[11px] text-amber-300 font-medium">
                        ⭐ Dica do Professor: {item.pedagogicalTip}
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
