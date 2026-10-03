import React, { useState, useRef, useEffect } from 'react';
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
  
  Globe,
  CreditCard,
  Brain,
  Server,
  Clock,
  Lightbulb,
  
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
  type ScamCase,
  type ScamLevel,
  type InvestigativeClue,
  type Badge,
  type ReinforcementOption,
} from '../data/scamsData';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { ScenarioAnimation2D } from './ScenarioAnimation2D';
import { generateDynamicScamCase } from '../data/dynamicScamsGenerator';

interface ScamSimulatorGameProps {
  onScoreUpdate: (totalXp: number, completedCount: number, allCompleted: boolean) => void;
}

export const ScamSimulatorGame: React.FC<ScamSimulatorGameProps> = ({ onScoreUpdate }) => {
  const gameMode = 'dynamic';
  const [dynamicCase, setDynamicCase] = useState<ScamCase>(() => generateDynamicScamCase());
  const [currentLevel, setCurrentLevel] = useState<ScamLevel>('basico');
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLButtonElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const cluesRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // gambiarra pro scroll ir pro topo
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  }, [dynamicCase.id]);
  
  // salva o que o usuario respondeu
  const [answers, setAnswers] = useState<{
    [caseId: string]: {
      answered: boolean;
      isCorrect: boolean;
      userChoice: boolean;
      cluesDiscovered: string[];
      bonusXp: number;
      comboBonus: number;
      pressureBonus?: number;
      penaltyXp?: number;
      selectedHypothesis?: number | null;
      hypothesisCorrect?: boolean;
    };
  }>({});

  // dicas clicadas
  const [discoveredClues, setDiscoveredClues] = useState<{ [caseId: string]: string[] }>({});
  const [expandedClueId, setExpandedClueId] = useState<string | null>(null);
  const [floatingXp, setFloatingXp] = useState<number | null>(null);

  // o que ta selecionado agora
  const [selectedVerdict, setSelectedVerdict] = useState<boolean | null>(null);
  const [selectedHypothesis, setSelectedHypothesis] = useState<number | null>(null);

  // se errar vai pra ca
  const [drillSelectedOptionId, setDrillSelectedOptionId] = useState<string | null>(null);
  const [drillSuccess, setDrillSuccess] = useState<boolean>(false);
  const [drillBonusAwarded, setDrillBonusAwarded] = useState<boolean>(false);

  // sisteminha de xp e level
  const [streak, setStreak] = useState(0);

  // badges
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

  // pega o caso atual
  const levelCases = SCAM_CASES.filter((c) => c.level === currentLevel);
  const currentCase: ScamCase = dynamicCase;

  // modo rapido
  
  
    
  // reseta o timer
  useEffect(() => {
    
    
  }, [dynamicCase.id]);

  // diminui o tempo
  
  const getScenarioType = (c: ScamCase): 'whatsapp' | 'correios' | 'banco' | 'loja' | 'tarefas' | 'remoto' | 'oficial' | 'geral' => {
    const cat = (c.category || '').toLowerCase();
    const id = (c.id || '').toLowerCase();
    const title = (c.title || '').toLowerCase();

    if (id.includes('whatsapp') || cat.includes('whatsapp') || cat.includes('família')) return 'whatsapp';
    if (id.includes('correios') || cat.includes('encomenda') || cat.includes('sms')) return 'correios';
    if (id.includes('central') || id.includes('0800') || c.channel === 'call' || cat.includes('central') || cat.includes('falsa') || cat.includes('urgência')) return 'banco';
    if (id.includes('loja') || cat.includes('comércio') || cat.includes('loja') || title.includes('desconto')) return 'loja';
    if (id.includes('tarefa') || cat.includes('vagas') || cat.includes('trabalho')) return 'tarefas';
    if (id.includes('fantasma') || cat.includes('remoto') || title.includes('anydesk')) return 'remoto';
    if (id.includes('ecac') || id.includes('receita') || cat.includes('cidadania') || cat.includes('legítimo') || cat.includes('oficial')) return 'oficial';
    return 'banco';
  };

  // dicas q ele achou
  const currentCaseDiscovered = discoveredClues[dynamicCase.id] || [];

  // pontos totais
  const totalCases = SCAM_CASES.length;
  const currentAnswerData = answers[dynamicCase.id];
  const totalFinishedCount = Object.keys(answers).length;
  const isBasicoFinished = totalFinishedCount >= 3;


  // click na dica
  const handleInspectClue = (clue: InvestigativeClue) => {
    sound.playBlip();
    setExpandedClueId((prev) => (prev === clue.id ? null : clue.id));
    if (expandedClueId !== clue.id) {
      setTimeout(() => cluesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    }

    const alreadyDiscovered = currentCaseDiscovered.includes(clue.id);
    if (!alreadyDiscovered) {
      const updatedClues = [...currentCaseDiscovered, clue.id];
      setDiscoveredClues((prev) => ({
        ...prev,
        [dynamicCase.id]: updatedClues,
      }));

      unlockBadge('badge-first-clue');

      if (clue.category === 'whois' && clue.evidenceResult.status === 'suspicious') {
        unlockBadge('badge-whois-master');
      }
    }
  };

  // funcao de submit do form
  const handleProtocolReport = () => {
    if (selectedVerdict === null) return;
    if (selectedHypothesis === null) return;
    if (answers[dynamicCase.id]?.answered) return;

    const isCorrect = selectedVerdict === currentCase.isScam;
    const hypothesisCorrect = selectedHypothesis === currentCase.correctEvidenceIndex;
    const cluesFoundCount = (discoveredClues[dynamicCase.id] || []).length;

    // da ponto pelas dicas
    const bonusXp = isCorrect ? cluesFoundCount * 10 : 0;
    
    // bonus tempo
    const pressureBonus = 0;

    let newStreak = streak;
    let comboBonus = 0;
    let earnedTotal = 0;
    let penaltyXp = 0;

    if (isCorrect && hypothesisCorrect) {
      sound.playSuccess();
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
      newStreak = streak + 1;
      setStreak(newStreak);

      if (newStreak >= 3) {
        comboBonus = 30;
        unlockBadge('badge-streak-fire');
      } else if (newStreak === 2) {
        comboBonus = 10;
      }

      earnedTotal = (currentCase.xpReward || 0) + bonusXp + comboBonus + pressureBonus;
      setFloatingXp(earnedTotal);

      // joga os confetes
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#0071e3', '#30d158', '#2997ff', '#ff9f0a', '#ffffff'],
      });

      if (dynamicCase.id === 'case-1-whatsapp') unlockBadge('badge-family-shield');
      if (dynamicCase.id === 'case-7-vaga-tarefas' || dynamicCase.id === 'case-9-mao-fantasma-suporte') unlockBadge('badge-anti-ghost');
      if (['case-1-whatsapp', 'case-4-falsa-central'].includes(dynamicCase.id)) {
        unlockBadge('badge-pix-guard');
      }
      if (dynamicCase.id === 'case-4-falsa-central' || dynamicCase.id === 'case-8-receita-ecac') {
        const otherCaseAnswer = answers[dynamicCase.id === 'case-4-falsa-central' ? 'case-8-receita-ecac' : 'case-4-falsa-central'];
        if (otherCaseAnswer?.isCorrect) {
          unlockBadge('badge-central-bank-expert');
        }
      }

      // libera os emblemas hardcore
      
      unlockBadge('badge-surgical-mind');
    } else if (isCorrect && !hypothesisCorrect) {
      // acertou mas errou a prova
      sound.playSuccess();
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
      earnedTotal = Math.round((currentCase.xpReward || 0) * 0.5) + bonusXp;
      setFloatingXp(earnedTotal);
    } else {
      sound.playError();
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
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
      [dynamicCase.id]: {
        answered: true,
        isCorrect,
        userChoice: selectedVerdict,
        cluesDiscovered: discoveredClues[dynamicCase.id] || [],
        bonusXp,
        comboBonus,
        pressureBonus,
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
        return acc + baseReward + (data.bonusXp || 0) + (data.comboBonus || 0) + (data.pressureBonus || 0);
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
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
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
        const currentAnswer = answers[dynamicCase.id];
        if (currentAnswer) {
          const updatedAnswers = {
            ...answers,
            [dynamicCase.id]: {
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
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
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
      setDynamicCase(generateDynamicScamCase(streak));
      return;
    }

    if (currentCaseIndex < levelCases.length - 1) {
      setCurrentCaseIndex((prev) => prev + 1);
    } else {
      if (currentLevel === 'basico') {
        setCurrentLevel('medio');
        setCurrentCaseIndex(0);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 200);
      } else if (currentLevel === 'medio') {
        setCurrentLevel('avancado');
        setCurrentCaseIndex(0);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 200);
      }
    }
  };

  
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-[#30d158]" />;
      case 'call':
        return <Phone className="w-3.5 h-3.5 text-[#0071e3]" />;
      case 'sms':
        return <MessageSquare className="w-3.5 h-3.5 text-[#ff2a2a]" />;
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-[#bf5af2]" />;
      default:
        return <Mail className="w-3.5 h-3.5 text-[#2997ff]" />;
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
        return <Brain className="w-4 h-4 text-[#ff2a2a]" />;
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
        return 'bg-[#ff9f0a]/10 border-2 border-[#ff2a2a] text-[#ff2a2a]';
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
      return <Mail className="w-4 h-4 text-[#ff2a2a]" />;
    }
    if (cat.includes('segurança')) {
      return <ShieldCheck className="w-4 h-4 text-[#30d158]" />;
    }
    if (cat.includes('0800') || cat.includes('central') || cat.includes('ligação')) {
      return <PhoneCall className="w-4 h-4 text-[#ff3b30]" />;
    }
    if (cat.includes('comércio') || cat.includes('social') || cat.includes('loja')) {
      return <ShoppingBag className="w-4 h-4 text-[#ff2a2a]" />;
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
            className="p-4 rounded-2xl bg-[#111] uk-panel border-4 border-[#ff2a2a] border border-white/[0.15] shadow-2xl flex items-center justify-between text-black max-w-lg mx-auto"
          >
            <div className="flex items-center space-x-3.5">
              <span className="text-2xl p-2 bg-white/[0.08] rounded-xl flex-shrink-0">
                {recentBadgeUnlocked.icon}
              </span>
              <div>
                <span className="text-[11px] text-[#ff2a2a] font-medium block">
                  Conquista Desbloqueada
                </span>
                <h4 className="font-semibold text-sm text-black">
                  {recentBadgeUnlocked.title}
                </h4>
                <p className="text-xs text-[#007AFF]">{recentBadgeUnlocked.description}</p>
              </div>
            </div>
            <button
              onClick={() => setRecentBadgeUnlocked(null)}
              className="px-3 py-1.5 rounded-full bg-white/[0.1] hover:bg-white/[0.15] text-black text-xs font-medium transition cursor-pointer"
            >
              OK
            </button>
          </motion.div>
        )}
      </AnimatePresence>

            {/* central de progressão & seleção de níveis (bento) */}
            <div className="bg-[#161617] border border-black/[0.05] rounded-2xl p-4 space-y-3.5 shadow-lg">
        {/* Linha Superior: Seletor de Modo e Níveis */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-center lg:justify-start">
            <span className="text-black font-bold text-sm flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[#bf5af2]" /> Simulador Aleatório</span>
          </div>

          {/* Patente Atual do Jogador, Combo Streak & Modo Sob Pressão */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2">
            

            {isBasicoFinished && streak > 1 && (
              <motion.div
                initial={{ scale: 0.85 }}
                animate={{ scale: [1, 1.15, 1], rotate: [0, -6, 6, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="flex items-center space-x-1 px-4 py-1.5 rounded-full dopamine-bg text-black text-sm font-black border-2 border-white shadow-[0_0_15px_rgba(255,0,255,0.8)] dopamine-heartbeat"
              >
                <Flame className="w-4 h-4 text-black fill-white" />
                <span>{streak}x Combo</span>
              </motion.div>
            )}

            {isBasicoFinished && (<button onClick={() => { sound.playBlip(); setIsBadgesModalOpen(true); }} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-black text-xs font-medium transition cursor-pointer"><Trophy className="w-3.5 h-3.5 text-[#ff2a2a]" /><span className="hidden sm:inline">Conquistas</span><span className="text-[10px] text-[#007AFF]">({unlockedBadgeIds.length}/{BADGES.length})</span></button>)}

            {isBasicoFinished && (<button onClick={() => { sound.playBlip(); setIsFamilyGuideOpen(true); }} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-[#2997ff] text-xs font-medium transition cursor-pointer"><BookOpen className="w-3.5 h-3.5" /><span className="hidden sm:inline">Cartilha</span></button>)}
          </div>
        </div>
      </div>

            {/* CONSOLE PRINCIPAL DESKTOP (Split View: Inspeção + Auditoria) */}
            <div ref={topRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA ESQUERDA: Cartão Bento do Incidente sob Investigação (7 colunas) */}
        <motion.div
          key={dynamicCase.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:col-span-12 uk-container max-w-2xl mx-auto space-y-0 relative"
        >
          {/* Header do Cartão Bento */}
          <div className="px-6 py-4 uk-panel border-b-4 border-[#ff2a2a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-black/[0.05] flex items-center justify-center">
                {getCategoryIcon(currentCase.category)}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-black tracking-tight">{currentCase.title}</h3>
                <span className="text-[11px] text-[#007AFF] font-medium">{currentCase.category}</span>
              </div>
            </div>

 
              
          </div>

          {/* Conteúdo do Incidente */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-[#111] uk-panel border-4 border-[#ff2a2a]">
            
            {/* Cronômetro Tático do Modo Sob Pressão */}
            

                        {/* BLOCO DE DÚVIDA / DILEMA INVESTIGATIVO (Gera Dúvida Real) */}
                        <div className="p-3.5 rounded-2xl bg-[#440000] border border-2 border-[#ff2a2a] flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-[#ff9f0a]/15 border border-[#ff9f0a]/30 flex items-center justify-center flex-shrink-0 text-[#ff2a2a] mt-0.5">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-[#ff2a2a] uppercase tracking-wider block">
                  Dilema do Investigador:
                </span>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  {currentCase.dilemma}
                </p>
              </div>
            </div>

            {/* Cenário Animado 2D Baseado no Enunciado */}
            <ScenarioAnimation2D
              caseId={dynamicCase.id}
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
                if (propName.includes('celular') || propName.includes('whatsapp') || propName.includes('2fa') || propName.includes('telefone') || propName.includes('bina')) {
                  const target = currentCase.clues.find((c) => c.category === 'phone' || c.category === 'behavior');
                  if (target) handleInspectClue(target);
                } else if (propName.includes('pacote') || propName.includes('correios') || propName.includes('taxa')) {
                  const target = currentCase.clues.find((c) => c.category === 'whois' || c.category === 'system');
                  if (target) handleInspectClue(target);
                } else if (propName.includes('banco') || propName.includes('terminal') || propName.includes('cofre') || propName.includes('padaria') || propName.includes('cartao')) {
                  const target = currentCase.clues.find((c) => c.category === 'pix' || c.category === 'official');
                  if (target) handleInspectClue(target);
                } else if (propName.includes('computador') || propName.includes('remoto') || propName.includes('anydesk') || propName.includes('fantasma')) {
                  const target = currentCase.clues.find((c) => c.category === 'system' || c.category === 'behavior');
                  if (target) handleInspectClue(target);
                } else if (propName.includes('promocao') || propName.includes('fryer')) {
                  const target = currentCase.clues.find((c) => c.category === 'whois' || c.category === 'pix');
                  if (target) handleInspectClue(target);
                } else if (propName.includes('govbr') || propName.includes('ecac')) {
                  const target = currentCase.clues.find((c) => c.category === 'official' || c.category === 'system');
                  if (target) handleInspectClue(target);
                } else if (currentCase.clues[0]) {
                  handleInspectClue(currentCase.clues[0]);
                }
              }}
            />

            {/* Linha de Metadados do Remetente */}
            <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.05]">
              <div className="flex items-center gap-3 w-full">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-white/10 to-white/20 border border-white/10 flex items-center justify-center font-semibold text-black text-sm">
                    {currentCase.sender.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#161617] border border-white/15 flex items-center justify-center shadow-sm">
                    {getChannelIcon(currentCase.channel)}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-black text-sm">{currentCase.sender}</h3>
                  <div className="flex items-center space-x-2 text-xs text-[#007AFF]">
                    <span className="capitalize">{currentCase.channel}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#007AFF]" />
                      <span>Hoje às {currentCase.time}</span>
                    </span>
                  </div>
                </div>
              </div>

              
            </div>

            {/* Caixa de Texto do Incidente (Autêntica, Ampla e Sem Poluição) */}
            <div className={`bg-[#000] border-2 border-dashed border-[#ff2a2a] text-[#ff2a2a] rounded-2xl p-6 shadow-inner space-y-2 transition-all duration-500 ${expandedClueId !== null || currentAnswerData?.answered ? 'opacity-50 blur-[2px]' : ''}`}>
              <div className="text-[10px] text-[#007AFF] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#2997ff]" />
                <span>Texto Original Recebido:</span>
              </div>
              <p className="text-black text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap select-text font-normal font-sans">
                {currentCase.messageContent}
              </p>
            </div>

            {/* ULTRAKILL BUTTONS */}
            {!currentAnswerData?.answered ? (
              <div className="p-6 pt-2 flex flex-col space-y-6">
                <button
                  onClick={() => handleInspectClue(currentCase.clues[0])}
                  className={`w-full py-4 text-2xl font-bold flex items-center justify-center space-x-2 ${
                    currentCaseDiscovered.includes(currentCase.clues[0].id)
                      ? 'uk-panel cursor-default opacity-50'
                      : 'uk-btn-blue'
                  }`}
                >
                  <Search className="w-6 h-6" />
                  <span>
                    {currentCaseDiscovered.includes(currentCase.clues[0].id)
                      ? currentCase.clues[0].inspection.observation 
                      : 'SCAN FOR WEAKNESS'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-6 pt-2 border-t-4 border-[#ff2a2a]">
                  <button
                    onClick={() => {
                        setSelectedVerdict(true);
                        setSelectedHypothesis(0); // auto select
                        setTimeout(() => document.getElementById("hidden-submit")?.click(), 50);
                    }}
                    className="uk-btn-red flex flex-col items-center justify-center space-y-2 py-6"
                  >
                    <ShieldAlert className="w-12 h-12" />
                    <span className="font-bold text-3xl tracking-widest">SCAM!</span>
                  </button>
                  
                  <button
                    onClick={() => {
                        setSelectedVerdict(false);
                        setSelectedHypothesis(0); // auto select
                        setTimeout(() => document.getElementById("hidden-submit")?.click(), 50);
                    }}
                    className="uk-btn-green flex flex-col items-center justify-center space-y-2 py-6"
                  >
                    <ShieldCheck className="w-12 h-12" />
                    <span className="font-bold text-3xl tracking-widest">SAFE!</span>
                  </button>
                  <button id="hidden-submit" onClick={handleProtocolReport} className="hidden">Submit</button>
                </div>
              </div>
            ) : (
              <div className="p-6 pt-2 space-y-6">
                 <div className={`p-6 border-4 ${
                      currentAnswerData.isCorrect ? 'uk-panel border-[#00ff00]' : 'uk-panel border-[#ff2a2a]'
                    }`}>
                      <h2 className={`font-bold text-4xl mb-2 flex items-center gap-2 ${currentAnswerData.isCorrect ? 'text-[#00ff00]' : 'text-[#ff2a2a]'}`}>
                        {currentAnswerData.isCorrect ? 'BLOOD GAINED!' : 'FATAL ERROR!'}
                      </h2>
                      <p className="font-medium text-xl mb-4 text-[#ccc]">
                        {currentCase.explanation}
                      </p>
                      
                      <div className="bg-[#111] p-4 border-2 border-dashed border-[#ff2a2a]">
                        <p className="font-bold text-sm mb-1 text-[#ff2a2a]">TERMINAL DATA:</p>
                        <p className="font-bold text-xl text-[#ccc]">{currentCase.pedagogy.goldenRule}</p>
                      </div>
                  </div>

                  <button
                    onClick={handleNextCase}
                    className="w-full py-4 uk-btn-red text-white flex items-center justify-center space-x-2 font-bold text-3xl"
                  >
                    <span>NEXT TARGET</span>
                    <ChevronRight className="w-8 h-8" />
                  </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* COLUNA DIREITA: Escondida */}
        <div className="hidden">
          
                    {/* ferramentas de investigação visual (3 pistas) */}
                    <div ref={cluesRef} className={`bg-[#161617] border-2 border-white rounded-none p-5 space-y-4 shadow-[4px_4px_0_0_#ff007f] transition-all duration-500 ${currentAnswerData?.answered ? 'opacity-40 blur-[2px] grayscale pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm text-black flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-[#2997ff]" />
                  <span>Dicas Rápidas</span>
                </h4>
                <p className="text-xs text-[#007AFF]">
                  Se bater a dúvida, clique nas pistas pra ver o que tá rolando!
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
                        ? 'border-2 border-[#00ffff] bg-[#002222]'
                        : 'border-2 border-[#ff007f] bg-black hover:bg-[#00ffff] hover:text-black hover:scale-[1.02] hover:-skew-x-2 transition-all duration-75 border-b-4 border-r-4 border-white active:translate-y-1 active:border-b-0 active:border-r-0'
                    }`}
                  >
                    <button
                      onClick={() => handleInspectClue(clue)}
                      className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform ${
                            isExpanded ? 'scale-105' : ''
                          } ${getClueCategoryBadgeStyle(clue.category)}`}
                        >
                          {getClueCategoryIcon(clue.category)}
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-black flex flex-wrap items-center gap-2">
                            <span>{clue.buttonLabel}</span>
                            {isDiscovered && (
                              <span className="text-[10px] text-[#30d158] font-medium bg-[#30d158]/10 px-2 py-0.2 rounded-full border border-[#30d158]/20 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Inspecionado (+10 XP)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#007AFF]">
                            {isDiscovered ? 'Dados do clique coletada • Toque para rever' : 'Toque para executar esta análise de análise'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-[#007AFF] transition-transform flex-shrink-0 ml-2 ${
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
                          <div className="bg-[#121214] border border-black/[0.05] rounded-xl p-3.5 space-y-2.5 shadow-inner">
                            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-[11px]">
                              <span className="text-xs font-bold text-black flex items-center gap-1.5">
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
                                  <span className="text-[#007AFF] text-[11px]">{clue.inspection.field1Label}:</span>
                                  <span className="text-black font-medium text-[11px] sm:text-xs">{clue.inspection.field1Value}</span>
                                </div>
                              )}
                              {clue.inspection?.field2Label && (
                                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                                  <span className="text-[#007AFF] text-[11px]">{clue.inspection.field2Label}:</span>
                                  <span className="text-black font-medium text-[11px] sm:text-xs">{clue.inspection.field2Value}</span>
                                </div>
                              )}
                              {clue.inspection?.field3Label && (
                                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                                  <span className="text-[#007AFF] text-[11px]">{clue.inspection.field3Label}:</span>
                                  <span className="text-black font-medium text-[11px] sm:text-xs">{clue.inspection.field3Value}</span>
                                </div>
                              )}
                            </div>

                            {/* Prompt de Análise Zero-Spoiler antes de responder */}
                            {!isCaseAnswered ? (
                              <div className="p-2.5 rounded-xl bg-gray-50 border border-white/[0.05] flex items-center gap-2 text-[11px] text-[#007AFF]">
                                <Search className="w-3.5 h-3.5 text-[#2997ff] flex-shrink-0" />
                                
                              </div>
                            ) : (
                              /* Relatório e Fato de Defesa Revelados Somente Após o Veredito */
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2 pt-1"
                              >
                                <div className="p-2.5 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-start gap-2 text-[11px]">
                                  <Sparkles className="w-3.5 h-3.5 text-[#2997ff] flex-shrink-0 mt-0.5" />
                                  <div className="leading-relaxed">
                                    <strong className="text-[#2997ff]">Conclusão de Análise: </strong>
                                    <span className="text-black font-bold">
                                      {clue.inspection?.observation || clue.evidenceResult.details}
                                    </span>
                                  </div>
                                </div>
                                {clue.evidenceResult.fato && (
                                  <div className="text-[11px] text-[#007AFF] bg-gray-50 p-2.5 rounded-xl border border-white/[0.04] flex items-start gap-2">
                                    <Lightbulb className="w-3.5 h-3.5 text-[#ff2a2a] flex-shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-[#ff2a2a]">Fato de Defesa: </strong>
                                      <span className="text-black font-bold">{clue.evidenceResult.fato}</span>
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

                    {/* o grande veredito do detetive (ágil e divertido) */}
                    <div className={`bg-[#161617] border border-black/[0.05] rounded-2xl p-5 space-y-4 shadow-lg transition-all duration-500 ${!currentAnswerData?.answered && currentCaseDiscovered.length === 0 ? 'opacity-50 blur-[2px] grayscale pointer-events-none' : ''}`}>
            <div className="border-b border-black/[0.05] pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0071e3]/15 border border-[#0071e3]/30 flex items-center justify-center text-[#2997ff]">
                  <Gavel className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-black">O que você acha?</h4>
                  <p className="text-xs text-[#007AFF]">
                    Aperte e bata o martelo: É Golpe ou Tá Seguro?
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
                      setSelectedHypothesis(null);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col items-center justify-center cursor-pointer shadow-md ${
                      selectedVerdict === true
                        ? 'bg-[#ff3b30] border-[#ff3b30] text-black shadow-red-500/25 ring-2 ring-red-400/40'
                        : 'bg-white/[0.03] border-black/[0.05] text-[#a1a1a6] hover:border-white/[0.2] hover:text-black'
                    }`}
                  >
                    <ShieldAlert className={`w-5 h-5 mb-1 ${selectedVerdict === true ? 'text-black' : 'text-[#ff3b30]'}`} />
                    <div className="text-xs font-bold tracking-wide">🚨 É GOLPE!</div>
                    <div className={`text-[10px] mt-0.5 ${selectedVerdict === true ? 'text-black/90' : 'text-[#007AFF]'}`}>
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
                        ? 'bg-[#30d158] border-[#30d158] text-black shadow-green-500/25 ring-2 ring-green-400/40'
                        : 'bg-white/[0.03] border-black/[0.05] text-[#a1a1a6] hover:border-white/[0.2] hover:text-black'
                    }`}
                  >
                    <ShieldCheck className={`w-5 h-5 mb-1 ${selectedVerdict === false ? 'text-black' : 'text-[#30d158]'}`} />
                    <div className="text-xs font-bold tracking-wide">🛡️ É SEGURO!</div>
                    <div className={`text-[10px] mt-0.5 ${selectedVerdict === false ? 'text-black/90' : 'text-[#007AFF]'}`}>
                      Comunicação Real
                    </div>
                  </motion.button>
                </div>

                {/* Etapa 2: Abre a gaveta de evidências para sustentar o relatório */}
                <AnimatePresence>
                  {selectedVerdict !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2.5 pt-2 border-t border-black/[0.05]"
                    >
                      <label className="text-xs font-semibold text-black flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#ff2a2a]" />
                        <span>
                          {selectedVerdict === true
                            ? 'Qual evidência comprova o golpe? (Fundamentação de Análise)'
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
                                setTimeout(() => verdictRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
                              }}
                              className={`w-full p-3 rounded-xl border text-left transition flex items-start space-x-2.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0071e3]/20 border-[#2997ff] text-black shadow-md shadow-blue-500/10'
                                  : 'bg-gray-50 border-black/[0.05] text-[#a1a1a6] hover:border-white/[0.2] hover:text-black'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold ${
                                isSelected ? 'border-[#2997ff] bg-[#0071e3] text-black' : 'border-white/[0.2] text-[#007AFF]'
                              }`}>
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <span className="text-xs leading-relaxed text-black font-bold">
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
                    ref={verdictRef}
                    onClick={handleProtocolReport}
                    className={`w-full py-3.5 px-4 rounded-full font-bold text-xs flex items-center justify-center space-x-2 transition ${
                      selectedHypothesis !== null
                        ? 'bg-gradient-to-r from-[#0071e3] to-[#2997ff] text-black cursor-pointer shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                        : 'bg-white/[0.06] border border-black/[0.05] text-[#71717a] cursor-not-allowed'
                    }`}
                  >
                    <Gavel className="w-4 h-4" />
                    <span>
                      {selectedHypothesis === null
                        ? 'Selecione a fundamentação de análise acima'
                        : selectedVerdict === true
                        ? '🔨 Bater o Martelo: É Golpe!'
                        : '🔨 Bater o Martelo: É Seguro!'}
                    </span>
                  </motion.button>
                )}

                {currentCaseDiscovered.length < currentCase.clues.length && (
                  <p className="text-[11px] text-[#007AFF] text-center">
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
                ref={resultRef}
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
                            ? 'bg-[#30d158]/10 border-[#30d158]/35 text-black'
                            : isPartial
                            ? 'bg-[#ff9f0a]/10 border-[#ff9f0a]/35 text-black'
                            : 'bg-[#ff3b30]/10 border-[#ff3b30]/35 text-black'
                        }`}
                      >
                        {isHonor ? (
                          <CheckCircle2 className="w-5 h-5 text-[#30d158] flex-shrink-0" />
                        ) : isPartial ? (
                          <AlertTriangle className="w-5 h-5 text-[#ff2a2a] flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-[#ff3b30] flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-xs sm:text-sm">
                            {isHonor && (currentCase.isScam ? '🏆 GOLPE DESMASCARADO!' : '🛡️ LIBERADO COM SUCESSO!')}
                            {isPartial && '⚠️ Veredito correto, mas a prova decisiva era outra!'}
                            {isFail && (currentAnswerData.penaltyXp ? `❌ VOCÊ CAIU NO GOLPE! (-${currentAnswerData.penaltyXp} XP)` : '❌ VOCÊ CAIU NO GOLPE!')}
                          </h4>
                          <p className="text-[11px] text-black font-bold">
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
                          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-black/[0.05] space-y-1 text-xs">
                            <span className="text-[#2997ff] font-semibold text-[11px] flex items-center gap-1.5">
                              <Search className="w-3.5 h-3.5" /> A Prova Decisiva:
                            </span>
                            <p className="text-gray-700 leading-relaxed">
                              {currentCase.keyEvidenceReason}
                            </p>
                          </div>

                          {/* Bônus de Reflexo Sob Pressão */}
                          {currentAnswerData.pressureBonus ? (
                            <div className="p-2.5 rounded-xl bg-[#2997ff]/10 border border-[#2997ff]/25 flex items-center justify-between text-xs text-black">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-[#2997ff]" />
                                <span>Reflexo Tático Sob Pressão</span>
                              </div>
                              <span className="font-bold text-[#2997ff]">+{currentAnswerData.pressureBonus} XP</span>
                            </div>
                          ) : null}

                          {/* Debriefing Pedagógico Silas & Clara */}
                          <details className="pt-1 group">
                            <summary className="text-[11px] text-[#007AFF] cursor-pointer hover:text-black transition flex items-center gap-1 list-none outline-none">
                              <span>🕵️‍♂️ Silas & 👩‍🏫 Clara: Análise Detalhada</span>
                              <span className="text-[9px] bg-white/[0.06] px-1.5 rounded-full">Ver mais</span>
                            </summary>
                            <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-black/[0.05] space-y-2">
                              <p className="text-[11px] text-black font-bold leading-relaxed">
                                <span className="font-bold text-[#2997ff]">Como eles te fisgam:</span> {currentCase.pedagogy.emotionalTrigger}
                              </p>
                              <p className="text-[11px] text-black font-bold leading-relaxed">
                                <span className="font-bold text-[#30d158]">Pra explicar pra criança:</span> {currentCase.pedagogy.kidsAnalogy}
                              </p>
                            </div>
                          </details>

                          {/* Regra de Ouro */}
                          <div className="p-3.5 rounded-2xl bg-[#30d158]/10 border border-[#30d158]/20 flex items-start gap-2.5 text-xs text-black">
                            <ShieldCheck className="w-4 h-4 text-[#30d158] flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-[#30d158]">Regra de Ouro para a Família: </strong>
                              <span className="text-black font-bold">"{currentCase.pedagogy.goldenRule}"</span>
                            </div>
                          </div>

                          {/* Botão de Avanço Imediato */}
                          <motion.button
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 400, damping: 22 }}
                            onClick={handleNextCase}
                            className="w-full py-5 bg-[#00ffff] text-black font-black text-xl uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer border-4 border-black shadow-[8px_8px_0_0_#ff007f] hover:-translate-y-1 active:translate-y-2 active:shadow-none -skew-x-3"
                          >
                            <span>
                              'Bora pro próximo caso'
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ) : (
                        /* FLUXO B: Se ERROU ou ACERTOU PARCIAL, aciona o TREINO DE REFORÇO FORENSE */
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 sm:p-5 rounded-2xl bg-[#111] uk-panel border-4 border-[#ff2a2a] border border-[#ff9f0a]/30 space-y-3.5 shadow-xl"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
                            <div className="flex items-center space-x-2 text-xs font-semibold text-[#ff2a2a]">
                              <RotateCcw className="w-4 h-4" />
                              <span>{currentCase.reinforcementDrill.title}</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ff9f0a]/15 text-[#ff2a2a] border border-[#ff9f0a]/30">
                              Reforço Prático (+15 XP)
                            </span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs font-medium text-black leading-relaxed">
                              {currentCase.reinforcementDrill.question}
                            </p>
                            {currentCase.reinforcementDrill.context && (
                              <p className="text-[11px] text-[#007AFF]">
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
                                        ? 'bg-[#30d158]/15 border-[#30d158] text-black shadow-md shadow-green-500/10'
                                        : 'bg-[#ff3b30]/15 border-[#ff3b30] text-black'
                                      : 'bg-black border-2 border-white text-black font-bold hover:bg-[#ff007f] hover:text-black hover:border-white hover:-skew-x-2 transition-all'
                                  }`}
                                >
                                  <div className="flex items-start space-x-2">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold ${
                                      isSelected
                                        ? opt.isCorrect
                                          ? 'border-[#30d158] bg-[#30d158] text-black'
                                          : 'border-[#ff3b30] bg-[#ff3b30] text-black'
                                        : 'border-white/[0.2] text-[#007AFF]'
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
                                <span>Entendi! Manda o próximo</span>
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

            {/* MODAL 1: Sala de Conquistas (Desktop Modal)              */}
            <AnimatePresence>
        {isBadgesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] uk-panel border-4 border-[#ff2a2a] border border-white/[0.1] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-3">
                <div>
                  <h3 className="font-semibold text-base text-black">Sala de Conquistas</h3>
                  <p className="text-xs text-[#007AFF]">
                    {unlockedBadgeIds.length} de {BADGES.length} conquistas desbloqueadas
                  </p>
                </div>
                <button
                  onClick={() => setIsBadgesModalOpen(false)}
                  className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-black text-xs font-medium cursor-pointer"
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
                          : 'bg-gray-50 border-white/[0.04] opacity-40'
                      }`}
                    >
                      <span className="text-2xl p-2 bg-white/[0.08] rounded-xl flex-shrink-0">
                        {badge.icon}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-xs text-black">{badge.title}</h4>
                        <p className="text-[11px] text-[#007AFF]">{badge.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

            {/* MODAL 2: Cartilha da Família (Desktop Modal)             */}
            <AnimatePresence>
        {isFamilyGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] uk-panel border-4 border-[#ff2a2a] border border-white/[0.1] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-3">
                <div>
                  <h3 className="font-semibold text-base text-black">Cartilha de Defesa Familiar</h3>
                  <p className="text-xs text-[#007AFF]">Regras de ouro e termos essenciais de cibersegurança</p>
                </div>
                <button
                  onClick={() => setIsFamilyGuideOpen(false)}
                  className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-black text-xs font-medium cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex p-1 rounded-full bg-white/[0.06] border border-black/[0.05] text-xs">
                <button
                  onClick={() => setFamilyGuideTab('rules')}
                  className={`flex-1 py-1 rounded-full font-medium transition cursor-pointer ${
                    familyGuideTab === 'rules'
                      ? 'bg-white/20 text-black'
                      : 'text-[#007AFF] hover:text-black'
                  }`}
                >
                  Regras de Ouro
                </button>
                <button
                  onClick={() => setFamilyGuideTab('glossary')}
                  className={`flex-1 py-1 rounded-full font-medium transition cursor-pointer ${
                    familyGuideTab === 'glossary'
                      ? 'bg-white/20 text-black'
                      : 'text-[#007AFF] hover:text-black'
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
                        <span className="font-semibold text-black">
                          {item.icon} {item.title}
                        </span>
                        <span className="text-[10px] text-[#007AFF]">{item.targetLabel}</span>
                      </div>
                      <p className="text-xs text-black font-bold leading-relaxed">{item.practicalAction}</p>
                    </div>
                  ))
                ) : (
                  GLOSSARY_ITEMS.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1 text-xs"
                    >
                      <h4 className="font-semibold text-[#2997ff]">{item.term}</h4>
                      <p className="text-xs text-black font-bold leading-relaxed">{item.simpleMeaning}</p>
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
