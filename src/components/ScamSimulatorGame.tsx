import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Info,
  Lightbulb,
} from 'lucide-react';
import { SCAM_CASES, type ScamCase, type ScamLevel } from '../data/scamsData';
import { sound } from '../utils/audio';

interface ScamSimulatorGameProps {
  onScoreUpdate: (totalXp: number, completedCount: number, allCompleted: boolean) => void;
}

export const ScamSimulatorGame: React.FC<ScamSimulatorGameProps> = ({ onScoreUpdate }) => {
  const [currentLevel, setCurrentLevel] = useState<ScamLevel>('basico');
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [answers, setAnswers] = useState<{
    [caseId: string]: { answered: boolean; isCorrect: boolean; userChoice: boolean };
  }>({});
  const [streak, setStreak] = useState(0);

  // Casos do nível atual
  const levelCases = SCAM_CASES.filter((c) => c.level === currentLevel);
  const currentCase: ScamCase = levelCases[currentCaseIndex] || levelCases[0];

  // Métricas gerais
  const totalCases = SCAM_CASES.length;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
  const totalXp = Object.entries(answers).reduce((acc, [caseId, data]) => {
    if (!data.isCorrect) return acc;
    const found = SCAM_CASES.find((c) => c.id === caseId);
    return acc + (found?.xpReward || 0);
  }, 0);

  const isLevelCompleted = (level: ScamLevel) => {
    const cases = SCAM_CASES.filter((c) => c.level === level);
    return cases.every((c) => answers[c.id]?.answered);
  };

  const handleAnswer = (choiceIsScam: boolean) => {
    if (answers[currentCase.id]?.answered) return;

    const isCorrect = choiceIsScam === currentCase.isScam;
    if (isCorrect) {
      sound.playSuccess();
      setStreak((prev) => prev + 1);
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
      },
    };

    setAnswers(newAnswers);

    const newTotalXp = Object.entries(newAnswers).reduce((acc, [caseId, data]) => {
      if (!data.isCorrect) return acc;
      const found = SCAM_CASES.find((c) => c.id === caseId);
      return acc + (found?.xpReward || 0);
    }, 0);

    const newCompletedCount = Object.keys(newAnswers).length;
    const allCompleted = newCompletedCount === totalCases;

    onScoreUpdate(newTotalXp, newCompletedCount, allCompleted);
  };

  const handleNextCase = () => {
    sound.playBlip();

    if (currentCaseIndex < levelCases.length - 1) {
      setCurrentCaseIndex((prev) => prev + 1);
    } else {
      // Se acabou o nível, avança pro próximo se houver
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
      
      {/* Barra de Seleção de Níveis e Progresso */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Simulador Anti-Golpes do Brasil
            </span>
            <h2 className="text-xl font-extrabold text-white">
              Treinamento de Defesa Digital para Cidadãos
            </h2>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-3">
            {streak > 1 && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold"
              >
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                <span>{streak}x Combo!</span>
              </motion.div>
            )}

            <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 font-mono text-xs font-bold">
              <span>XP Ganho:</span>
              <span className="text-emerald-400 text-sm">{totalXp} XP</span>
            </div>

            <div className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs">
              <span>{answeredCount}/{totalCases} Casos</span>
            </div>
          </div>
        </div>

        {/* Nivel Tabs (Basico, Medio, Avancado) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          
          {/* Nivel Basico */}
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

          {/* Nivel Medio */}
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
              <p className="text-[11px] text-slate-400 mt-0.5">Falsa Central e Promoções</p>
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

          {/* Nivel Avancado */}
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

      {/* Card Principal: Simulação do Caso Real */}
      <motion.div
        key={currentCase.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Barra superior do caso */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              {getChannelIcon(currentCase.channel)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-base">{currentCase.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {currentCase.category}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Caso {currentCaseIndex + 1} de {levelCases.length} no {currentCase.levelTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-lg">
              +{currentCase.xpReward} XP
            </span>
          </div>
        </div>

        {/* Corpo da Simulação: Interface Realista de Celular/Aplicativo */}
        <div className="p-4 sm:p-6">
          <div className="max-w-xl mx-auto rounded-2xl border border-slate-800 bg-[#070b12] shadow-inner overflow-hidden">
            
            {/* Topo do Celular / App Bar */}
            <div className="bg-[#111827] px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                <span className="font-bold text-white truncate max-w-[200px] sm:max-w-none">
                  {currentCase.sender}
                </span>
              </div>
              <span className="text-slate-500 text-[11px]">{currentCase.time}</span>
            </div>

            {/* Conteudo da Mensagem Simulada */}
            <div className="p-5 sm:p-6 space-y-4 font-sans text-sm">
              <div
                className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  currentCase.channel === 'whatsapp'
                    ? 'bg-[#1e293b] border border-emerald-900/40 text-slate-100 rounded-tl-sm'
                    : currentCase.channel === 'sms'
                    ? 'bg-slate-900 border border-blue-900/40 text-slate-200'
                    : currentCase.channel === 'call'
                    ? 'bg-amber-950/30 border border-amber-700/50 text-amber-100'
                    : currentCase.channel === 'social'
                    ? 'bg-purple-950/20 border border-purple-800/40 text-slate-100'
                    : 'bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs'
                }`}
              >
                {currentCase.messageContent}
              </div>

              {/* Detalhes extras contextuais do caso */}
              {currentCase.extraDetails && currentCase.extraDetails.length > 0 && (
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-1.5 text-xs font-mono">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span>Detalhes Observados na Situação:</span>
                  </div>
                  {currentCase.extraDetails.map((detail, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-300 gap-1 border-b border-slate-900/60 pb-1 last:border-none">
                      <span className="text-slate-400">{detail.label}:</span>
                      <strong className="text-slate-200 font-medium">{detail.value}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Botoes de Decisao do Jogador */}
        {!currentAnswerData?.answered ? (
          <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/60">
            <div className="max-w-xl mx-auto space-y-3">
              <p className="text-xs text-center font-mono text-slate-300 font-bold uppercase tracking-wider">
                Analise os detalhes acima. Qual é a sua decisão?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Botao: E Golpe */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(true)}
                  className="p-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-950/50 transition"
                >
                  <ShieldAlert className="w-5 h-5 text-white" />
                  <span>🚨 É GOLPE / FRAUDE!</span>
                </motion.button>

                {/* Botao: E Seguro */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(false)}
                  className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50 transition"
                >
                  <ShieldCheck className="w-5 h-5 text-slate-950" />
                  <span>✅ É SEGURO / LEGÍTIMO</span>
                </motion.button>

              </div>
            </div>
          </div>
        ) : (
          /* Painel de Resultado e Explicacao Pedagogica */
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
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-7 h-7 text-red-400 flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-extrabold text-base">
                    {currentAnswerData.isCorrect
                      ? `Correto! Você ganhou +${currentCase.xpReward} XP!`
                      : 'Atenção! Você se enganou nesta situação.'}
                  </h4>
                  <p className="text-xs opacity-90">
                    {currentCase.isScam
                      ? 'Esta mensagem era de fato um GOLPE financeiro.'
                      : 'Esta mensagem era LEGÍTIMA e segura.'}
                  </p>
                </div>
              </div>

              {/* Sinais de Alerta (Red Flags) */}
              {currentCase.redFlags.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Sinais de Perigo que entregam a farsa:
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

              {/* Explicacao Detalhada */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
                <span className="font-bold text-white block">Como funciona este golpe na vida real:</span>
                <p className="leading-relaxed text-slate-400">{currentCase.explanation}</p>
              </div>

              {/* Dica Pratica da Febraban / CERT.br */}
              <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4 text-xs text-blue-200 flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-blue-300 mb-1">Dica Prática para se Proteger:</strong>
                  <p className="text-slate-300 leading-relaxed">{currentCase.realWorldTip}</p>
                </div>
              </div>

              {/* Botao de Proximo Caso */}
              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextCase}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950 transition"
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
      <div className="bg-slate-900/50 border border-slate-800/70 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>Complete os 3 níveis para desbloquear seu Certificado e registrar seu depoimento.</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-emerald-400">Acertos: {correctCount} de {answeredCount} respondidos</span>
        </div>
      </div>

    </div>
  );
};
