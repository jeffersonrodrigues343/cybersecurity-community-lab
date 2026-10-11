import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Phone,
  MoreVertical,
  Lock,
  PhoneOff,
  Signal,
  Wifi,
  BatteryFull,
  ChevronLeft,
  Info,
  Mic,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Globe,
  UserX,
  X,
  MessageSquare,
  Bell,
  ChevronRight,
  Camera,
  Music,
  Search,
  Sun,
  MessageCircle,
  CreditCard,
  FileText,
  Check,
} from 'lucide-react';
import type { ScamCase, InteractiveAction, InvestigativeClue } from '../data/scamsData';
import { sound } from '../utils/audio';

type Verdict = 'scam' | 'safe' | null;

// Habilidades aprendidas com as Notas do Lucas (progressão estilo Papers, Please)
export type Skill = 'question' | 'bank' | 'browser' | 'verdict';

export const SKILL_INFO: Record<Skill, { icon: string; title: string; lucas: string }> = {
  question: {
    icon: '💬',
    title: 'Fazer Perguntas',
    lucas: 'Pergunta algo que só a pessoa de verdade saberia responder.',
  },
  bank: {
    icon: '🏦',
    title: 'Conferir no Banco',
    lucas: 'Abre o app do banco e olha o extrato. Se não tem nada lá, é mentira.',
  },
  browser: {
    icon: '🌐',
    title: 'Inspecionar Links',
    lucas: 'Antes de tocar num link, confere o endereço. Site oficial tem nome certinho.',
  },
  verdict: {
    icon: '⚖️',
    title: 'Dar o Veredito',
    lucas: 'Conferiu? Agora decide com calma: é golpe ou é seguro.',
  },
};

interface PhoneScreenProps {
  scamCase: ScamCase;
  stamped: Verdict;
  wasCorrect: boolean | null;
  onPerformAction: (action: InteractiveAction) => void;
  executedActionIds: string[];
  actionHistory: { player: string; reply: string }[];
  onAppOpenChange?: (open: boolean) => void;
  onVerdict?: (v: 'scam' | 'safe') => void;
  onNextCase?: () => void;
  inspectedClueIds?: string[];
  onInspectClue?: (clue: InvestigativeClue) => void;
  onStoryDeliveredChange?: (delivered: boolean) => void;
  unlockedSkills?: Skill[];
  onUnlockSkill?: (skill: Skill) => void;
  earnedXp?: number;
  levelIndex?: number;
  totalLevels?: number;
  initialBootDone?: boolean;
  onCompleteInitialBoot?: () => void;
}

const findContactNumber = (c: ScamCase): string | null => {
  const allValues = c.clues
    .flatMap((cl) => [cl.inspection.field1Value, cl.inspection.field2Value, cl.inspection.field3Value])
    .filter((v): v is string => Boolean(v));
  for (const v of allValues) {
    const match = v.match(/(\+55\s*\(?\d{2}\)?\s*9?\d{4}-?\d{4}|0800\s*\d{3}\s*\d{4}|\+\d{1,3}\s*\d{4,12})/);
    if (match) return match[0];
  }
  return null;
};

const cleanName = (sender: string) => sender.replace(/\s*\(.*?\)\s*/g, '').trim();

const StatusBar = ({
  time,
  dark,
  levelText,
}: {
  time: string;
  dark?: boolean;
  levelText?: string;
}) => (
  <div
    className={`flex items-center justify-between px-4 sm:px-5 pt-2.5 pb-1 text-[11px] sm:text-xs font-semibold select-none z-20 ${
      dark ? 'text-white' : 'text-black'
    }`}
  >
    <span>{time}</span>
    {levelText && (
      <span className="sm:hidden font-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20">
        {levelText}
      </span>
    )}
    <div className="flex items-center gap-1.5">
      <Signal className="w-3.5 h-3.5" />
      <Wifi className="w-3.5 h-3.5" />
      <BatteryFull className="w-4 h-4" />
    </div>
  </div>
);

// ============================================================================
// TELA DE BLOQUEIO (LOCKSCREEN ESTILO IOS COM DRAG TO UNLOCK)
// ============================================================================
// TELA DE BLOQUEIO (LOCKSCREEN ESTILO IOS: APENAS AVISO DO LUCAS ANTES DO DESBLOQUEIO)
// ============================================================================
const LockScreen = ({
  c,
  lucasNotificationArrived,
  onUnlock,
  onOpenLucasChat,
  levelText,
}: {
  c: ScamCase;
  lucasNotificationArrived?: boolean;
  onUnlock: () => void;
  onOpenLucasChat: () => void;
  levelText?: string;
}) => {
  return (
    <div className="relative flex flex-col h-full bg-gradient-to-b from-[#0b0f19] via-[#111827] to-[#030712] text-white select-none overflow-hidden justify-between p-4">
      {/* Luz ambiente de fundo estilo wallpaper moderno */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/35 via-slate-900/40 to-black pointer-events-none" />

      <StatusBar time={c.time} dark levelText={levelText} />

      {/* Topo da LockScreen: Ícone de Cadeado & Relógio iOS */}
      <div className="flex flex-col items-center pt-2 z-10">
        <Lock className="w-4 h-4 text-white/70 mb-1" />
        <div className="text-[12px] font-medium text-white/80">Sábado, 10 de outubro</div>
        <div className="text-[52px] font-light leading-none tracking-tight font-display mt-0.5 text-white/95 drop-shadow-md">
          {c.time}
        </div>
      </div>

      {/* Centro: Notificação Exclusiva do Lucas na LockScreen */}
      <div className="flex-1 flex flex-col justify-center my-auto z-10 max-h-[340px] space-y-2.5 overflow-y-auto no-scrollbar py-2">
        <AnimatePresence>
          {lucasNotificationArrived && (
            <motion.div
              key="lucas-lock-notif"
              initial={{ y: -25, opacity: 0, scale: 0.94 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={onOpenLucasChat}
              className="bg-slate-900/90 hover:bg-slate-850/95 border border-amber-400/40 rounded-2xl p-3 backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.85)] cursor-pointer active:scale-98 transition group ring-1 ring-amber-400/20"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center bg-[#25D366] text-white text-[10px] font-bold shadow">
                  <MessageSquare className="w-3 h-3" />
                </div>
                <span className="font-semibold text-xs text-white truncate">Lucas (Filho) 🛡️</span>
                <span className="text-[9px] text-amber-300 font-mono ml-auto">agora</span>
              </div>

              <p className="text-[12px] text-white/90 leading-tight">
                Bênção, pai/mãe! Salvei orientações importantes no seu Bloco de Notas para quando você for vítima desses vagabundos da internet. Dá uma olhada lá!
              </p>

              <div className="mt-2.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-amber-300 font-semibold">
                <span className="animate-pulse">
                  💬 Toque para ler a mensagem do Lucas
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-white/60 group-hover:translate-x-0.5 transition" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Base: Deslize para Cima para Desbloquear (Drag to Unlock) */}
      <motion.div
        drag="y"
        dragConstraints={{ top: -140, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(_e, info) => {
          if (info.offset.y < -40 || info.velocity.y < -250) {
            onUnlock();
          }
        }}
        onClick={onUnlock}
        className="flex flex-col items-center gap-1.5 pb-2 z-10 cursor-pointer active:opacity-75 transition-opacity"
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="flex flex-col items-center text-white/60 text-[11px] font-medium"
        >
          <span className="text-xs">▲</span>
          <span className="text-[10px] tracking-wide font-medium mt-0.5">
            Deslize para cima para desbloquear
          </span>
        </motion.div>
        {/* Barra de desbloqueio */}
        <div className="w-28 h-1 rounded-full bg-white/50 shadow-sm" />
      </motion.div>
    </div>
  );
};

// ============================================================================
// CONVERSA COM O LUCAS (FILHO) - TRANSIÇÃO DIEGÉTICA E STREAMING DE MENSAGENS
// ============================================================================
const LucasChatScreen = ({
  currentTime,
  onBackToHome,
  onOpenNotes,
}: {
  currentTime: string;
  onBackToHome: () => void;
  onOpenNotes: () => void;
}) => {
  const [revealedCount, setRevealedCount] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const lucasMessages = [
    'Bênção pai/mãe! Tudo em paz por aí?',
    'Tô te mandando essa mensagem porque tá tendo muito golpe na praça. Salvei no seu Bloco de Notas orientações direto ao ponto pra quando você for vítima desses vagabundos da internet tentando te passar a perna.',
    'Antes de sair respondendo qualquer mensagem com pressa ou transferir dinheiro, dá uma olhada lá nas Notas e confere o checklist que anotei!',
  ];

  useEffect(() => {
    setRevealedCount(0);
    setIsTyping(true);

    const t1 = setTimeout(() => {
      setRevealedCount(1);
      sound.playMessagePop();
    }, 1200);

    const t2 = setTimeout(() => {
      setRevealedCount(2);
      sound.playMessagePop();
    }, 3200);

    const t3 = setTimeout(() => {
      setRevealedCount(3);
      setIsTyping(false);
      sound.playMessagePop();
    }, 5400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleFastForward = () => {
    if (revealedCount < lucasMessages.length) {
      setRevealedCount(lucasMessages.length);
      setIsTyping(false);
      sound.playMessagePop();
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-[#efeae2] select-none text-slate-800"
      onClick={handleFastForward}
    >
      {/* Topo do WhatsApp com Lucas */}
      <div className="bg-[#008069] text-white">
        <StatusBar time={currentTime} dark />
        <div className="flex items-center gap-1.5 px-2 pb-2 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBackToHome();
            }}
            className="p-1 hover:bg-white/10 rounded-full cursor-pointer active:scale-90 transition"
            title="Voltar à Tela Inicial"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-700 border border-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow shrink-0">
              L
            </div>
            <div className="leading-tight min-w-0">
              <div className="font-semibold text-xs truncate flex items-center gap-1">
                <span>Lucas (Filho)</span>
                <span className="text-[10px]">🛡️</span>
              </div>
              <div className="text-[10px] text-emerald-100 truncate">
                {isTyping ? (
                  <span className="animate-pulse font-medium italic">digitando...</span>
                ) : (
                  'online'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Área de Mensagens com Papel de Parede Sutil do WhatsApp */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2.5">
        <div className="text-center">
          <span className="text-[10px] bg-white/70 text-neutral-600 px-2 py-0.5 rounded-full font-mono shadow-xs">
            Hoje • Conversa Segura
          </span>
        </div>

        {lucasMessages.slice(0, revealedCount).map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex flex-col items-start"
          >
            <div className="bg-white rounded-2xl rounded-tl-xs px-3.5 py-2 text-[12.5px] leading-relaxed text-slate-800 shadow-sm max-w-[88%] border border-slate-200/60">
              <p>{msg}</p>
              <div className="text-[9px] text-slate-400 text-right mt-1 font-mono">
                {currentTime}
              </div>
            </div>
          </motion.div>
        ))}

        {isTyping && revealedCount < lucasMessages.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 bg-white/90 rounded-2xl rounded-tl-xs px-3 py-2 w-16 shadow-xs border border-slate-200"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
          </motion.div>
        )}

        {/* Botão de Ação Direta para o Bloco de Notas após ler */}
        {revealedCount === lucasMessages.length && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sound.playKeypress();
                onOpenNotes();
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold text-xs py-3 px-3.5 rounded-2xl shadow-md transition flex items-center justify-between cursor-pointer border border-amber-300"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-950" />
                <span>Abrir o Bloco de Notas com o Checklist</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="text-center text-[10px] text-slate-500 mt-1.5">
              Toque acima ou use a barra inferior para ir às Notas
            </div>
          </motion.div>
        )}
      </div>

      {/* Rodapé informativo */}
      <div className="p-2 bg-white/80 border-t border-slate-200 text-center">
        <span className="text-[10px] text-slate-500 font-medium">
          {revealedCount < lucasMessages.length
            ? 'Toque na tela para acelerar a leitura'
            : '✓ Orientações do Lucas recebidas'}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// BLOCO DE NOTAS LIMPO: APENAS CHECKLIST DE PROCEDIMENTOS DO CASO
// ============================================================================
const NotesScreen = ({
  c,
  inspectedClueIds = [],
  onInspectClue,
  onBack,
}: {
  c: ScamCase;
  inspectedClueIds: string[];
  onInspectClue?: (clue: InvestigativeClue) => void;
  onBack: () => void;
}) => {
  const [checkedSteps, setCheckedSteps] = useState<{ [key: number]: boolean }>(() => ({
    0: inspectedClueIds.includes(c.clues[0]?.id),
    1: inspectedClueIds.includes(c.clues[1]?.id),
    2: inspectedClueIds.includes(c.clues[2]?.id),
  }));

  useEffect(() => {
    setCheckedSteps({
      0: inspectedClueIds.includes(c.clues[0]?.id),
      1: inspectedClueIds.includes(c.clues[1]?.id),
      2: inspectedClueIds.includes(c.clues[2]?.id),
    });
  }, [inspectedClueIds, c.clues]);

  const toggleStep = (index: number) => {
    sound.playKeyboardClick();
    const nextVal = !checkedSteps[index];
    setCheckedSteps((prev) => ({ ...prev, [index]: nextVal }));
    if (nextVal && c.clues[index]) {
      onInspectClue?.(c.clues[index]);
    }
  };

  const completedCount = Object.values(checkedSteps).filter(Boolean).length;
  const totalClues = c.clues.length;

  return (
    <div className="flex flex-col h-full bg-[#18181b] text-white select-none">
      <StatusBar time={c.time} dark />

      {/* Header do Bloco de Notas */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/10 bg-[#27272a]/95 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Início</span>
        </button>
        <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-100">
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Checklist de Verificação 📌</span>
        </div>
        <span className="text-[11px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full font-bold">
          {completedCount}/{totalClues} checados
        </span>
      </div>

      {/* Conteúdo limpo e objetivo: Apenas os 3 procedimentos operacionais do caso */}
      <div className="flex-1 overflow-y-auto no-scrollbar overscroll-contain p-3.5 space-y-3">
        <div className="border-b border-white/10 pb-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
            Procedimento Operacional
          </div>
          <h2 className="text-sm font-bold text-white mt-0.5">
            {c.title}
          </h2>
        </div>

        {/* Os 3 Passos de Auditoria Específicos do Caso Atual */}
        <div className="space-y-2.5">
          {c.clues.slice(0, 3).map((clue, idx) => {
            const isChecked = Boolean(checkedSteps[idx]);
            return (
              <div
                key={clue.id || idx}
                onClick={() => toggleStep(idx)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer active:scale-98 ${
                  isChecked
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-white/5 border-white/10 hover:border-amber-400/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition ${
                      isChecked
                        ? 'bg-emerald-500 text-white'
                        : 'border-2 border-white/30 hover:border-amber-400'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block">
                      Passo {idx + 1} • {clue.name}
                    </span>
                    <p className="text-xs font-semibold text-white leading-snug mt-0.5">
                      {clue.question}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                      {clue.inspection.observation}
                    </p>
                    {isChecked && (
                      <div className="mt-2 pt-1.5 border-t border-emerald-500/20 text-[10.5px] text-emerald-300 font-medium">
                        ✓ Fato apurado: {clue.evidenceResult.fato}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 text-center">
          <span className="text-[10px] font-mono text-neutral-500">
            Anotações salvas localmente • Atualizado automaticamente
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// APP MEU BANCO DIGITAL (INTERAÇÃO REALISTA COM DETALHES DE HORÁRIO E EXTRATO)
// ============================================================================
const BankScreen = ({
  c,
  onBack,
}: {
  c: ScamCase;
  onBack: () => void;
}) => {
  const isCase3Legitimate = c.id === 'case-3-compra-aprovada';

  return (
    <div className="flex flex-col h-full bg-[#130b24] text-white select-none">
      <StatusBar time={c.time} dark />

      {/* Topo do App do Banco */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-purple-800/40 bg-[#241142]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-purple-200 hover:text-white font-semibold cursor-pointer active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Início</span>
        </button>
        <div className="flex items-center gap-1.5 font-bold text-xs text-white">
          <CreditCard className="w-3.5 h-3.5 text-purple-300" />
          <span>Meu Banco Digital</span>
        </div>
        <span className="w-4" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-3">
        {/* Card de Conta e Saldo */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-800 rounded-2xl p-3.5 shadow-lg border border-purple-500/30">
          <div className="flex justify-between items-center text-[10px] text-purple-200">
            <span>Conta Corrente Digital • Jefferson</span>
            <span className="font-mono">Agência 0001 • C/C 84920-1</span>
          </div>
          <div className="text-2xl font-bold font-mono mt-1.5">R$ 1.250,00</div>
          <div className="text-[10px] text-purple-200/80 mt-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Chave Pix: CPF cadastrado</span>
            </span>
            <span className="text-emerald-300 font-semibold font-mono">Cartão Ativo</span>
          </div>
        </div>

        {/* Alerta Institucional de Segurança do Banco */}
        <div className="bg-black/40 border border-purple-500/20 rounded-xl p-2.5 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Norma Oficial de Segurança Bancária
          </div>
          <p className="text-[11px] text-purple-100/90 leading-relaxed">
            O banco <strong>NUNCA</strong> faz ligações de 0800 pedindo para você realizar Pix de estorno, cancelar transferências por link ou transferir para &quot;contas de segurança&quot;.
          </p>
        </div>

        {/* EXTRATO BANCÁRIO DETALHADO (AUDITORIA TEMPORAL REALISTA) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-purple-300 uppercase font-bold px-0.5">
            <span>Extrato Oficial de Movimentações</span>
            <span className="text-purple-400">Tempo Real</span>
          </div>

          {isCase3Legitimate ? (
            /* Caso 3: A compra na Padaria Estrela de R$ 34,90 às 08:44 realmente aconteceu */
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-white">Padaria Estrela</div>
                  <span className="font-mono text-xs text-emerald-300 font-bold">- R$ 34,90</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/60">
                  <span>Hoje, 10 de outubro às 08:44</span>
                  <span>Débito por Aproximação</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-medium pt-0.5">
                  ✓ Transação legítima confirmada pelo chip do seu cartão físico.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white/90">Supermercado Central</div>
                  <span className="font-mono text-xs text-neutral-300">- R$ 112,40</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/50">
                  <span>07 de outubro às 19:12 (há 3 dias)</span>
                  <span>Cartão de Débito</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white/90">Farmácia Bem Estar</div>
                  <span className="font-mono text-xs text-neutral-300">- R$ 45,00</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/50">
                  <span>05 de outubro às 14:00 (há 5 dias)</span>
                  <span>Transferência Pix</span>
                </div>
              </div>
            </div>
          ) : (
            /* Casos de Golpe: Mostra que a última transação foi há 3 dias (07/10) e NADA hoje */
            <div className="space-y-2">
              {/* Destaque Forense: Nenhuma transação hoje */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono font-bold text-amber-300 flex items-center gap-1">
                    <span>🗓️</span> Hoje, 10 de outubro • Horário: {c.time}
                  </span>
                  <span className="text-[9px] bg-amber-400/20 text-amber-300 font-mono px-1.5 py-0.5 rounded">
                    Sem Lançamentos
                  </span>
                </div>
                <p className="text-[11px] text-amber-100/90 leading-snug">
                  <strong>Nenhuma movimentação registrada hoje.</strong> Não há compras aprovadas, bloqueios de segurança ou transferências Pix pendentes no sistema do seu banco.
                </p>
              </div>

              {/* Histórico Anterior Real */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white/90">Supermercado Bom Preço</div>
                  <span className="font-mono text-xs text-neutral-300">- R$ 88,90</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/50">
                  <span className="text-amber-200/80 font-medium">07 de outubro às 18:24 (última compra, há 3 dias)</span>
                  <span>Cartão de Débito</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white/90">Posto Shell</div>
                  <span className="font-mono text-xs text-neutral-300">- R$ 120,00</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/50">
                  <span>06 de outubro às 12:15 (há 4 dias)</span>
                  <span>Cartão de Crédito</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white/90">Padaria Central</div>
                  <span className="font-mono text-xs text-neutral-300">- R$ 14,50</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/50">
                  <span>04 de outubro às 10:30 (há 6 dias)</span>
                  <span>Cartão de Débito</span>
                </div>
              </div>

              {/* Prova forense explícita */}
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[10.5px] text-purple-200 leading-relaxed">
                💡 <strong>Análise Investigativa:</strong> Se a mensagem que você recebeu alegou que uma compra suspeita ocorreu agora ou pediu Pix urgente, compare com este extrato. Como a última transação foi há 3 dias, a alegação é totalmente falsa!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botão de Retorno */}
      <div className="p-2.5 bg-[#241142] border-t border-purple-800/40">
        <button
          type="button"
          onClick={onBack}
          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl cursor-pointer active:scale-95 transition text-center"
        >
          ← Voltar à Tela Inicial
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL DO TRIBUNAL PERICIAL COM REVALIDAÇÃO FORENSE (O PORQUÊ)
// ============================================================================
const VerdictModal = ({
  c,
  isOpen,
  onClose,
  onConfirm,
}: {
  c: ScamCase;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (verdict: 'scam' | 'safe', hypothesisIndex: number) => void;
}) => {
  const [chosenVerdict, setChosenVerdict] = useState<'scam' | 'safe' | null>(null);
  const [selectedHypothesisIndex, setSelectedHypothesisIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setChosenVerdict(null);
      setSelectedHypothesisIndex(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFinalSubmit = () => {
    if (!chosenVerdict || selectedHypothesisIndex === null) return;
    onConfirm(chosenVerdict, selectedHypothesisIndex);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-sm max-h-[92vh] overflow-y-auto no-scrollbar bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-4 shadow-2xl text-white space-y-3.5 ring-1 ring-amber-400/20"
      >
        {/* Cabeçalho do Tribunal */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm font-bold">
              ⚖️
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Tribunal Pericial
              </div>
              <h3 className="text-xs font-bold text-white">Julgamento & Revalidação</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ETAPA 1: Decisão Principal (Golpe ou Seguro) */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-neutral-200 block">
            1. Qual é a sua conclusão pericial sobre este caso?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playBlip();
                setChosenVerdict('scam');
              }}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition active:scale-95 ${
                chosenVerdict === 'scam'
                  ? 'bg-red-600 border-red-400 text-white shadow-lg ring-2 ring-red-400/50'
                  : 'bg-white/5 border-white/10 hover:border-red-400/40 text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-300" />
                <span>É Golpe!</span>
              </div>
              <span className="text-[10px] opacity-80 leading-tight block">
                Tentativa de fraude cibernética ou engenharia social.
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playBlip();
                setChosenVerdict('safe');
              }}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition active:scale-95 ${
                chosenVerdict === 'safe'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-400/50'
                  : 'bg-white/5 border-white/10 hover:border-emerald-400/40 text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>É Seguro!</span>
              </div>
              <span className="text-[10px] opacity-80 leading-tight block">
                Comunicação autêntica e sem intenção criminosa.
              </span>
            </button>
          </div>
        </div>

        {/* ETAPA 2: A REVALIDAÇÃO FORENSE (POR QUE VOCÊ CHEGOU A ESSA CONCLUSÃO?) */}
        {chosenVerdict && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 pt-1 border-t border-white/10"
          >
            <label className="text-[11px] font-semibold text-amber-300 block">
              2. Por que você chegou a essa conclusão?
              <span className="text-[10px] text-white/60 font-normal block mt-0.5">
                Selecione o fato concreto comprovado que fundamenta seu laudo pericial:
              </span>
            </label>

            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
              {c.evidenceHypotheses.map((hypothesis, idx) => {
                const isSelected = selectedHypothesisIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sound.playKeypress();
                      setSelectedHypothesisIndex(idx);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition text-xs cursor-pointer active:scale-98 flex items-start gap-2 ${
                      isSelected
                        ? 'bg-amber-500/25 border-amber-400 text-white font-medium ring-1 ring-amber-400/40'
                        : 'bg-white/5 border-white/10 hover:border-white/25 text-neutral-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-mono font-bold mt-0.5 ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug text-[11px] flex-1">
                      {hypothesis}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Botão de Finalização do Veredito */}
        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            disabled={!chosenVerdict || selectedHypothesisIndex === null}
            onClick={handleFinalSubmit}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
              chosenVerdict && selectedHypothesisIndex !== null
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-95'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            <span>⚖️ Confirmar e Carimbar Veredito</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};


// ============================================================================
// APP NAVEGADOR FORENSE (AUDITORIA DE LINKS POINT & CLICK)
// ============================================================================
// ============================================================================
// APP NAVEGADOR FORENSE & GOOGLE BRASIL REALISTA (PESQUISA & AUDITORIA)
// ============================================================================
const BrowserScreen = ({
  c,
  url,
  onBack,
}: {
  c: ScamCase;
  url?: string;
  onBack: () => void;
}) => {
  const hasSpecificUrl = Boolean(url && url !== 'https://pesquisa-segura.com.br');
  const [activeTab, setActiveTab] = useState<'google' | 'site'>(hasSpecificUrl ? 'site' : 'google');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);

  const displayUrl = url || 'https://pesquisa-segura.com.br';
  const isSuspicious = c.isScam;

  // Sugestões contextuais realistas para o caso atual
  const getSuggestedQueries = () => {
    const text = `${c.title} ${c.messageContent} ${c.sender}`.toLowerCase();
    const suggestions: string[] = [];

    if (text.includes('pix') || text.includes('banco') || text.includes('transferência') || c.category === 'pix') {
      suggestions.push('banco liga pedindo confirmação de pix?');
      suggestions.push('falsa central de segurança número 0800 é golpe');
    }
    if (text.includes('mãe') || text.includes('pai') || text.includes('filho') || text.includes('número novo')) {
      suggestions.push('golpe do novo número filho pedindo dinheiro whatsapp');
      suggestions.push('como saber se parente realmente trocou de zap');
    }
    if (text.includes('correios') || text.includes('encomenda') || text.includes('alfândega') || text.includes('taxa')) {
      suggestions.push('sms correios taxa alfandegária retirada é golpe?');
      suggestions.push('como rastrear encomenda no portal oficial correios');
    }
    if (text.includes('investimento') || text.includes('lucro') || text.includes('cripto') || text.includes('rendimento')) {
      suggestions.push('promessa de 10% lucro ao dia é pirâmide?');
      suggestions.push('como checar se corretora tem registro na cvm');
    }

    if (suggestions.length < 2) {
      suggestions.push('como identificar mensagem golpista no celular');
      suggestions.push('número desconhecido pedindo dinheiro no whatsapp');
    }

    return suggestions;
  };

  const handleExecuteSearch = (query: string) => {
    if (!query.trim()) return;
    sound.playGoogleSearch();
    setSubmittedQuery(query.trim());
    setSearchQuery(query.trim());
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e24] text-white select-none">
      <StatusBar time={c.time} dark />

      {/* Barra de Navegação Superior com Abas e URL */}
      <div className="px-3 py-2 border-b border-white/10 bg-[#16161a] space-y-1.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-1 hover:bg-white/10 rounded-full cursor-pointer text-neutral-300 active:scale-95 transition"
            title="Voltar ao celular"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Seletor de Modo: Google Brasil vs Inspecionar Site */}
          <div className="flex-1 flex items-center bg-black/60 rounded-full p-0.5 border border-white/10 text-[11px]">
            <button
              type="button"
              onClick={() => {
                sound.playBlip();
                setActiveTab('google');
              }}
              className={`flex-1 py-1 px-2 rounded-full font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'google'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Search className="w-3 h-3" />
              <span>Google</span>
            </button>

            {hasSpecificUrl && (
              <button
                type="button"
                onClick={() => {
                  sound.playBlip();
                  setActiveTab('site');
                }}
                className={`flex-1 py-1 px-2 rounded-full font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'site'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>Link ({displayUrl.replace(/https?:\/\//, '').slice(0, 12)}...)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo: Google Brasil ou Inspecionar Link */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'google' ? (
          <div className="min-h-full bg-white text-slate-800 p-3.5 flex flex-col">
            {/* Logo do Google Brasil */}
            <div className="flex flex-col items-center pt-2 pb-3">
              <div className="flex items-center text-3xl font-bold tracking-tight select-none">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
                <span className="text-[10px] font-semibold text-slate-400 ml-1.5 align-top tracking-normal">
                  Brasil
                </span>
              </div>
            </div>

            {/* Caixa de Pesquisa do Google */}
            <div className="relative mb-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-full px-3 py-2 shadow-sm focus-within:shadow-md focus-within:border-blue-500 transition">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    sound.playKeyboardClick();
                    setSearchQuery(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleExecuteSearch(searchQuery);
                  }}
                  placeholder="Pesquisar no Google Brasil..."
                  className="flex-1 text-xs text-slate-800 placeholder-slate-400 bg-transparent outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <Mic className="w-3.5 h-3.5 text-blue-500 shrink-0 cursor-pointer" />
              </div>

              {searchQuery && !submittedQuery && (
                <button
                  type="button"
                  onClick={() => handleExecuteSearch(searchQuery)}
                  className="mt-2 w-full py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow cursor-pointer active:scale-98 transition flex items-center justify-center gap-1"
                >
                  <Search className="w-3.5 h-3.5" /> Pesquisar
                </button>
              )}
            </div>

            {/* Sugestões de Pesquisa Rápida (Chips Investigativos) */}
            <div className="mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                🔍 Dúvidas Frequentes da Investigação:
              </span>
              <div className="flex flex-col gap-1.5">
                {getSuggestedQueries().map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleExecuteSearch(q)}
                    className="w-full text-left bg-slate-100 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 hover:text-blue-700 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition cursor-pointer flex items-center justify-between group active:scale-98"
                  >
                    <span className="truncate">{q}</span>
                    <span className="text-[10px] text-blue-600 group-hover:translate-x-0.5 transition font-bold shrink-0 ml-1">
                      Pesquisar ➔
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resultados de Pesquisa (SERP) */}
            {submittedQuery && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 pt-1 border-t border-slate-200"
              >
                <div className="text-[10px] text-slate-500 font-medium">
                  Aproximadamente 482.000 resultados para &quot;{submittedQuery}&quot;
                </div>

                {/* Resultado 1: G1 Segurança Digital */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="font-bold text-red-600">G1</span>
                    <span>› tecnologia › seguranca-digital</span>
                  </div>
                  <h5 className="text-[12.5px] font-bold text-blue-700 leading-snug hover:underline cursor-pointer">
                    Alerta de Fraude: Como golpistas usam urgência e falsos contatos para enganar vítimas
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Especialistas da FEBRABAN e delegacias de crimes cibernéticos esclarecem: empresas sérias e bancos <b>nunca entram em contato solicitando transferências imediatas</b> para testes, estornos ou cancelamentos.
                  </p>
                  <div className="inline-flex items-center gap-1 text-[9.5px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full mt-1">
                    <ShieldAlert className="w-3 h-3" /> Fato Verificado: Alerta Oficial
                  </div>
                </div>

                {/* Resultado 2: FEBRABAN / Reclame Aqui */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="font-bold text-emerald-700">FEBRABAN</span>
                    <span>› orientacoes › golpe-da-falsa-central</span>
                  </div>
                  <h5 className="text-[12.5px] font-bold text-blue-700 leading-snug hover:underline cursor-pointer">
                    Cartilha Bancária: Bancos nunca pedem Pix para anular compras suspeitas
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Se você recebeu uma ligação ou mensagem dizendo que sua conta foi invadida e que deve transferir seu dinheiro para uma &quot;chave de segurança&quot;, <b>isso é 100% golpe</b>. Desligue e confira o extrato no app oficial.
                  </p>
                  <div className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                    <ShieldCheck className="w-3 h-3" /> Fonte Verificada • FEBRABAN
                  </div>
                </div>

                {/* Dica de Ação para o Jogador */}
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 text-center space-y-1">
                  <span className="text-[11px] font-bold text-amber-900 block">
                    💡 Informação confirmada na internet!
                  </span>
                  <span className="text-[10px] text-amber-800 block">
                    Você já sabe como funciona. Volte ao celular para analisar as evidências e emitir seu veredito.
                  </span>
                </div>
              </motion.div>
            )}

            {/* Botão de Fechar Navegador */}
            <div className="mt-auto pt-4">
              <button
                type="button"
                onClick={onBack}
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow cursor-pointer active:scale-95 transition"
              >
                ← Fechar Navegador e Voltar
              </button>
            </div>
          </div>
        ) : (
          /* Aba: Inspecionar Link / Domínio Direto */
          <div className="p-3.5 space-y-3 flex flex-col justify-center items-center text-center">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ${
                isSuspicious
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isSuspicious ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>

            <div>
              <h4 className="font-bold text-sm">
                {isSuspicious ? '⚠️ Domínio Falso / Redirecionamento' : '✅ Conexão Criptografada e Segura'}
              </h4>
              <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                {isSuspicious
                  ? 'O endereço verificado não pertence ao portal oficial e tenta capturar credenciais ou Pix!'
                  : 'O site possui certificado digital válido e pertence aos canais autênticos.'}
              </p>
            </div>

            <div className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-left text-[10.5px] space-y-1">
              <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold block">
                Auditoria de Domínio (Whois):
              </span>
              <div className="font-mono text-white text-[11px] break-all">{displayUrl}</div>
              <div className="text-[10px] text-neutral-400 pt-1">
                {isSuspicious
                  ? 'Domínio registrado recentemente em servidor anônimo no exterior.'
                  : 'Domínio registrado com CNPJ e autoridade certificadora válida.'}
              </div>
            </div>

            <div className="w-full space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  sound.playBlip();
                  setActiveTab('google');
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" /> Pesquisar sobre este golpe no Google
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl cursor-pointer active:scale-95 transition"
              >
                ← Fechar Navegador e Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// WHATSAPP INTERATIVO COM ENTREGA GRADUAL DE MENSAGENS EM TEMPO REAL
// ============================================================================
const WhatsAppScreen = ({
  c,
  flagged,
  onPerformAction,
  executedActionIds,
  actionHistory,
  stamped,
  onLinkClick,
  onContactClick,
  isBlocked,
  onBlockContact,
  onCallClick,
  onBackToHome,
  onOpenNotes,
  onStoryDeliveredChange,
}: {
  c: ScamCase;
  flagged: boolean;
  onPerformAction: (action: InteractiveAction) => void;
  executedActionIds: string[];
  actionHistory: { player: string; reply: string }[];
  stamped: Verdict;
  onLinkClick: (url: string) => void;
  onContactClick: () => void;
  isBlocked: boolean;
  onBlockContact: () => void;
  onCallClick: () => void;
  onBackToHome: () => void;
  onOpenNotes?: () => void;
  onStoryDeliveredChange?: (delivered: boolean) => void;
}) => {
  const [isTypingPlayer, setIsTypingPlayer] = useState(false);
  const number = findContactNumber(c);
  const name = cleanName(c.sender);
  const unknown = /desconhecid|n[uú]mero novo/i.test(c.sender);

  // Mensagens do caso divididas por parágrafos para simular digitação do suspeito
  const messageParagraphs = c.messageContent.split(/\n\n+/).filter(Boolean);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isSuspectTyping, setIsSuspectTyping] = useState(true);
  const [hasFinishedTyping, setHasFinishedTyping] = useState(false);

  const onStoryDeliveredChangeRef = useRef(onStoryDeliveredChange);
  onStoryDeliveredChangeRef.current = onStoryDeliveredChange;

  useEffect(() => {
    setRevealedCount(0);
    setIsSuspectTyping(true);
    setHasFinishedTyping(false);
    onStoryDeliveredChangeRef.current?.(false);

    let count = 0;
    let activeTimer: ReturnType<typeof setTimeout>;

    const deliverNext = () => {
      setIsSuspectTyping(true);
      activeTimer = setTimeout(() => {
        count += 1;
        setRevealedCount(count);
        setIsSuspectTyping(false);
        sound.playMessagePop();

        if (count < messageParagraphs.length) {
          activeTimer = setTimeout(deliverNext, 600);
        } else {
          setHasFinishedTyping(true);
          onStoryDeliveredChangeRef.current?.(true);
        }
      }, 1100);
    };

    const startTimer = setTimeout(deliverNext, 500);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(activeTimer);
    };
  }, [c.id, messageParagraphs.length]);

  // Toque para acelerar a leitura caso o jogador não queira esperar
  const handleFastForward = () => {
    if (!hasFinishedTyping) {
      setRevealedCount(messageParagraphs.length);
      setIsSuspectTyping(false);
      setHasFinishedTyping(true);
      onStoryDeliveredChangeRef.current?.(true);
    }
  };

  const availableActions = (c.interactiveActions || []).filter(
    (act) => !executedActionIds.includes(act.id),
  );

  const handleActionClick = (action: InteractiveAction) => {
    sound.playKeyboardClick();
    setIsTypingPlayer(true);
    setTimeout(() => {
      setIsTypingPlayer(false);
      sound.playMessagePing();
      sound.playTensionPulse();
      onPerformAction(action);
    }, 650);
  };

  const renderMessageContent = (text: string) => {
    const parts = text.split(/(https?:\/\/[^\s]+)/g);
    return parts.map((part, i) =>
      /^https?:\/\//.test(part) ? (
        <button
          key={i}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLinkClick(part);
          }}
          className={`underline break-all font-semibold cursor-pointer text-left inline hover:opacity-80 active:scale-95 transition-transform ${
            flagged ? 'text-[#d93025] decoration-wavy decoration-2' : 'text-[#1a73e8]'
          }`}
          title="Clique para inspecionar link no navegador"
        >
          {part}
        </button>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    );
  };

  return (
    <div className="flex flex-col h-full select-none" onClick={handleFastForward}>
      {/* Cabeçalho Clicável do WhatsApp */}
      <div className="bg-[#008069] text-white">
        <StatusBar time={c.time} dark />
        <div className="flex items-center gap-1.5 px-2 pb-2 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBackToHome();
            }}
            className="p-1 hover:bg-white/10 rounded-full cursor-pointer active:scale-90 transition"
            title="Voltar à Tela Inicial"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onContactClick();
            }}
            className="flex items-center gap-1.5 flex-1 min-w-0 text-left cursor-pointer hover:opacity-90 active:scale-98 transition-transform"
            title="Clique para ver o perfil do contato"
          >
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="w-7 h-7 rounded-full bg-[#dfe5e7] flex items-center justify-center text-[#54656f] font-semibold text-xs shadow-inner shrink-0"
            >
              {name.charAt(0)}
            </motion.div>
            <div className="flex-1 min-w-0 leading-tight">
              <div className="font-semibold text-[13px] truncate flex items-center gap-1">
                <span>{unknown && number ? number : name}</span>
                {isBlocked && (
                  <span className="bg-red-600 text-[9px] px-1 rounded uppercase font-bold">Bloqueado</span>
                )}
              </div>
              <div className="text-[10px] text-white/80 truncate">
                {isTypingPlayer || isSuspectTyping ? (
                  <span className="italic font-medium text-emerald-200 animate-pulse">digitando...</span>
                ) : isBlocked ? (
                  'bloqueado por você'
                ) : unknown ? (
                  `~${name}`
                ) : (
                  'online'
                )}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1.5 text-white/90 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCallClick();
              }}
              className="p-1 hover:bg-white/10 rounded-full cursor-pointer active:scale-90 transition-transform"
              title="Ligar"
            >
              <Phone className="w-3.5 h-3.5 opacity-90" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onContactClick();
              }}
              className="p-1 hover:bg-white/10 rounded-full cursor-pointer active:scale-90 transition-transform"
              title="Mais opções"
            >
              <MoreVertical className="w-3.5 h-3.5 opacity-90" />
            </button>
          </div>
        </div>
      </div>

      {/* Banner Diegético: Lucas (Filho) avisando sobre o Bloco de Notas */}
      {onOpenNotes && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenNotes();
          }}
          className="bg-amber-100/95 hover:bg-amber-200 border-b border-amber-300 px-3 py-1.5 flex items-center justify-between cursor-pointer transition text-amber-950 active:scale-99 shadow-xs"
          title="Toque para abrir o Bloco de Notas do Lucas"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold truncate">
            <span>🛡️</span>
            <span className="truncate">
              <strong>Lucas (Filho):</strong> &quot;Olha o Bloco de Notas antes de responder!&quot;
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-900 px-2 py-0.5 rounded-full shrink-0 ml-1">
            Ver Notas ➔
          </span>
        </div>
      )}

      {/* Área da Conversa com Balões Chegando em Tempo Real */}
      <div className="flex-1 wa-wallpaper overflow-y-auto no-scrollbar px-2.5 py-2.5 space-y-2">
        <div className="mx-auto w-fit bg-[#ffeecd] text-[#54656f] text-[10px] px-2.5 py-1 rounded-md text-center max-w-[94%] flex items-center gap-1 shadow-sm leading-tight">
          <Lock className="w-2.5 h-2.5 flex-shrink-0" />
          Mensagens protegidas com criptografia de ponta a ponta.
        </div>

        {unknown && !isBlocked && (
          <div className="mx-auto w-full bg-white rounded-lg text-center text-[10.5px] text-[#54656f] py-1.5 px-2 shadow-sm border border-emerald-100">
            Número fora da sua lista de contatos
            <div className="flex justify-center gap-5 mt-1 font-semibold text-[#008069]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBlockContact();
                }}
                className="hover:underline cursor-pointer text-red-600 font-bold active:scale-95 transition-transform"
              >
                Bloquear
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onContactClick();
                }}
                className="hover:underline cursor-pointer active:scale-95 transition-transform"
              >
                Inspecionar
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto w-fit bg-white/90 text-[#54656f] text-[10px] px-2 py-0.5 rounded shadow-sm font-mono">
          HOJE
        </div>

        {/* Mensagens do Contato entregues aos poucos para imersão total */}
        {messageParagraphs.slice(0, revealedCount).map((para, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="relative bg-white text-[#111b21] text-[13px] leading-[17px] rounded-lg rounded-tl-none px-2.5 pt-1.5 pb-3.5 max-w-[88%] shadow-[0_1px_1px_rgba(11,20,26,0.15)] whitespace-pre-wrap group hover:ring-1 hover:ring-emerald-400/40 transition"
          >
            {renderMessageContent(para)}
            <span className="absolute right-1.5 bottom-0.5 text-[9.5px] text-[#667781] font-mono">
              {c.time}
            </span>
          </motion.div>
        ))}

        {/* Efeito visual de digitação do suspeito enquanto a história é contada */}
        {isSuspectTyping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg rounded-tl-none px-3 py-2 w-fit shadow-sm flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.3s]" />
          </motion.div>
        )}

        {/* Histórico de Mensagens Enviadas pelo Jogador */}
        {actionHistory.map((item, idx) => (
          <React.Fragment key={idx}>
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="ml-auto bg-[#d9fdd3] text-[#111b21] text-[13px] leading-[17px] rounded-lg rounded-tr-none px-2.5 pt-1.5 pb-3.5 max-w-[88%] shadow-[0_1px_1px_rgba(11,20,26,0.15)] relative"
            >
              <div>{item.player}</div>
              <span className="absolute right-1.5 bottom-0.5 text-[9.5px] text-[#667781] font-mono">✓✓</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="mr-auto bg-white text-[#111b21] text-[13px] leading-[17px] rounded-lg rounded-tl-none px-2.5 pt-1.5 pb-3.5 max-w-[88%] shadow-[0_1px_1px_rgba(11,20,26,0.15)] relative"
            >
              <div>{renderMessageContent(item.reply)}</div>
              <span className="absolute right-1.5 bottom-0.5 text-[9.5px] text-[#667781] font-mono">
                {c.time}
              </span>
            </motion.div>
          </React.Fragment>
        ))}

        {isTypingPlayer && (
          <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 w-fit shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.3s]" />
          </div>
        )}
      </div>

      {/* Rodapé do WhatsApp (sem barra falsa de escrita; mensagens e opções reais) */}
      {!hasFinishedTyping ? (
        <div className="bg-[#f0f2f5] px-3 py-2 border-t border-black/5 text-center">
          <span className="text-[10px] text-neutral-500 font-medium italic animate-pulse">
            Recebendo mensagens... (Toque no chat para acelerar)
          </span>
        </div>
      ) : availableActions.length > 0 && !isBlocked && !stamped ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#f0f2f5] p-2.5 border-t border-black/10 space-y-2"
        >
          <div className="text-[11px] font-mono text-[#54656f] uppercase tracking-wider font-bold px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#008069]" /> Responder no WhatsApp:
          </div>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-0.5">
            {availableActions.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick(act);
                }}
                className="w-full text-left bg-white hover:bg-emerald-50 border border-emerald-300 text-[#008069] rounded-xl px-2.5 py-2 text-xs font-semibold shadow-sm transition active:scale-98 cursor-pointer flex items-center justify-between gap-2"
              >
                <span className="text-xs leading-snug font-medium line-clamp-2">{act.label}</span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md shrink-0 font-bold">
                  Enviar ➔
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      ) : isBlocked ? (
        <div className="bg-[#f0f2f5] px-3 py-2.5 border-t border-red-200 text-center">
          <span className="text-xs text-red-600 font-semibold flex items-center justify-center gap-1.5">
            <UserX className="w-3.5 h-3.5" /> Você bloqueou este contato
          </span>
        </div>
      ) : (
        <div className="bg-[#f0f2f5] px-3 py-2 border-t border-black/5 text-center">
          <span className="text-[10.5px] text-[#54656f] font-medium">
            Fim das mensagens • Confira o Bloco de Notas para auditar o caso
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SMS INTERATIVO COM ENTREGA GRADUAL DE MENSAGENS EM TEMPO REAL
// SMS INTERATIVO COM ENTREGA GRADUAL DE MENSAGENS EM TEMPO REAL
// ============================================================================
const SmsScreen = ({
  c,
  flagged,
  onPerformAction,
  executedActionIds,
  actionHistory,
  stamped,
  onLinkClick,
  onContactClick,
  onBackToHome,
  onOpenNotes,
  onStoryDeliveredChange,
}: {
  c: ScamCase;
  flagged: boolean;
  onPerformAction: (action: InteractiveAction) => void;
  executedActionIds: string[];
  actionHistory: { player: string; reply: string }[];
  stamped: Verdict;
  onLinkClick: (url: string) => void;
  onContactClick: () => void;
  onBackToHome: () => void;
  onOpenNotes?: () => void;
  onStoryDeliveredChange?: (delivered: boolean) => void;
}) => {
  const number = findContactNumber(c);
  const messageParagraphs = c.messageContent.split(/\n\n+/).filter(Boolean);
  const [revealedCount, setRevealedCount] = useState(0);
  const [hasFinishedTyping, setHasFinishedTyping] = useState(false);

  const onStoryDeliveredChangeRef = useRef(onStoryDeliveredChange);
  onStoryDeliveredChangeRef.current = onStoryDeliveredChange;

  useEffect(() => {
    setRevealedCount(0);
    setHasFinishedTyping(false);
    onStoryDeliveredChangeRef.current?.(false);

    let count = 0;
    let activeTimer: ReturnType<typeof setTimeout>;

    const deliverNext = () => {
      activeTimer = setTimeout(() => {
        count += 1;
        setRevealedCount(count);
        sound.playMessagePop();

        if (count < messageParagraphs.length) {
          activeTimer = setTimeout(deliverNext, 600);
        } else {
          setHasFinishedTyping(true);
          onStoryDeliveredChangeRef.current?.(true);
        }
      }, 1000);
    };

    const startTimer = setTimeout(deliverNext, 400);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(activeTimer);
    };
  }, [c.id, messageParagraphs.length]);

  const handleFastForward = () => {
    if (!hasFinishedTyping) {
      setRevealedCount(messageParagraphs.length);
      setHasFinishedTyping(true);
      onStoryDeliveredChangeRef.current?.(true);
    }
  };

  const availableActions = (c.interactiveActions || []).filter(
    (act) => !executedActionIds.includes(act.id),
  );

  const renderMessageContent = (text: string) => {
    const parts = text.split(/(https?:\/\/[^\s]+)/g);
    return parts.map((part, i) =>
      /^https?:\/\//.test(part) ? (
        <button
          key={i}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLinkClick(part);
          }}
          className={`underline break-all font-semibold cursor-pointer text-left inline hover:opacity-80 active:scale-95 transition-transform ${
            flagged ? 'text-[#d93025] decoration-wavy decoration-2' : 'text-[#007aff]'
          }`}
          title="Clique para inspecionar link no navegador"
        >
          {part}
        </button>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    );
  };

  return (
    <div className="flex flex-col h-full bg-white select-none" onClick={handleFastForward}>
      <StatusBar time={c.time} />
      <div className="flex items-center justify-between px-2 pb-2 pt-1 border-b border-black/10 relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBackToHome();
          }}
          className="p-1 text-[#007aff] hover:bg-neutral-100 rounded-full cursor-pointer"
          title="Voltar à Tela Inicial"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onContactClick();
          }}
          className="flex flex-col items-center cursor-pointer hover:opacity-90 active:scale-95 transition-transform flex-1 min-w-0"
          title="Clique para ver o contato"
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-8 h-8 rounded-full bg-gradient-to-b from-[#a5abb8] to-[#858994] flex items-center justify-center text-white font-semibold text-sm shadow-sm"
          >
            {c.sender.charAt(0)}
          </motion.div>
          <div className="text-[11px] text-black mt-0.5 flex items-center gap-0.5 font-medium truncate max-w-[160px]">
            {number ?? c.sender} <span className="text-[#8e8e93]">›</span>
          </div>
        </button>
      </div>

      {/* Banner Diegético: Lucas (Filho) avisando sobre o Bloco de Notas */}
      {onOpenNotes && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenNotes();
          }}
          className="bg-amber-100/95 hover:bg-amber-200 border-b border-amber-300 px-3 py-1.5 flex items-center justify-between cursor-pointer transition text-amber-950 active:scale-99 shadow-xs"
          title="Toque para abrir o Bloco de Notas do Lucas"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold truncate">
            <span>🛡️</span>
            <span className="truncate">
              <strong>Lucas (Filho):</strong> &quot;Olha o Bloco de Notas antes de responder!&quot;
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-900 px-2 py-0.5 rounded-full shrink-0 ml-1">
            Ver Notas ➔
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar px-2.5 py-2.5 space-y-2">
        <div className="text-center text-[10px] text-[#8e8e93] font-mono">
          Mensagem de Texto • SMS
          <br />
          Hoje {c.time}
        </div>

        {messageParagraphs.slice(0, revealedCount).map((para, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-[#e9e9eb] text-black text-[13.5px] leading-[18px] rounded-[16px] rounded-bl-[4px] px-3 py-2 max-w-[88%] whitespace-pre-wrap shadow-sm"
          >
            {renderMessageContent(para)}
          </motion.div>
        ))}

        {actionHistory.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 rounded-xl bg-neutral-100 border border-neutral-300 text-xs text-neutral-800 space-y-1 shadow-sm"
          >
            <div className="font-semibold flex items-center gap-1 text-[#007aff]">
              <ExternalLink className="w-3 h-3" /> {item.player}
            </div>
            <div className="text-[11px] leading-relaxed text-neutral-600">
              {renderMessageContent(item.reply)}
            </div>
          </motion.div>
        ))}

        <div className="text-[10px] text-[#8e8e93] pl-1 flex items-center gap-1">
          <Info className="w-3 h-3 text-[#ff9500]" /> Remetente não verificado.
        </div>
      </div>

      {/* Rodapé do SMS (sem barra de digitação falsa; foco na leitura) */}
      {!hasFinishedTyping ? (
        <div className="p-2 bg-neutral-50 border-t border-black/10 text-center">
          <span className="text-[10px] text-neutral-500 font-medium italic animate-pulse">
            Recebendo SMS... (Toque para acelerar)
          </span>
        </div>
      ) : availableActions.length > 0 && !stamped ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2.5 bg-neutral-100 border-t border-black/10 space-y-2"
        >
          <div className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider font-bold px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#007aff]" /> Responder por SMS:
          </div>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-0.5">
            {availableActions.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playBlip();
                  onPerformAction(act);
                }}
                className="w-full text-left bg-white hover:bg-blue-50 border border-blue-200 text-[#007aff] rounded-xl px-2.5 py-2 text-xs font-semibold shadow-sm transition cursor-pointer flex items-center justify-between gap-2"
              >
                <span className="text-xs leading-snug font-medium line-clamp-2">{act.label}</span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md shrink-0 font-bold">
                  Perguntar ➔
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="p-2 bg-neutral-50 border-t border-black/10 text-center">
          <span className="text-[10.5px] text-neutral-500 font-medium">
            Fim do SMS • Confira o Bloco de Notas para auditar o caso
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE DE ONDA DE ÁUDIO (VISUALIZADOR DA VOZ NA LIGAÇÃO)
// ============================================================================
const AudioWaveform = ({ active }: { active: boolean }) => (
  <div className="flex items-center gap-0.5 h-4 px-1.5 py-0.5 rounded-full bg-white/10">
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.span
        key={i}
        animate={
          active
            ? { height: ['4px', '14px', '6px', '16px', '4px'] }
            : { height: '3px' }
        }
        transition={
          active
            ? { repeat: Infinity, duration: 0.5 + i * 0.12, ease: 'easeInOut' }
            : { duration: 0.2 }
        }
        className={`w-0.5 rounded-full ${
          active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-neutral-500'
        }`}
      />
    ))}
  </div>
);

// Formatar segundos em cronômetro telefônico mm:ss
const formatCallTimer = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ============================================================================
// CHAMADA TELEFÔNICA INTERATIVA ESTILO JOGO INDIE (0800 FALSA CENTRAL)
// ============================================================================
const CallScreen = ({
  c,
  onPerformAction,
  executedActionIds,
  actionHistory,
  onHangup,
  onBackToHome,
  onStoryDeliveredChange,
}: {
  c: ScamCase;
  onPerformAction: (action: InteractiveAction) => void;
  executedActionIds: string[];
  actionHistory: { player: string; reply: string }[];
  onHangup: () => void;
  onBackToHome?: () => void;
  onStoryDeliveredChange?: (delivered: boolean) => void;
}) => {
  const number = findContactNumber(c);
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [callSeconds, setCallSeconds] = useState(0);
  const [isCallerTalking, setIsCallerTalking] = useState(false);
  const [transcriptLines, setTranscriptLines] = useState<{ sender: 'caller' | 'player'; text: string }[]>([]);
  const [hasDeliveredTrap, setHasDeliveredTrap] = useState(false);

  const onStoryDeliveredChangeRef = useRef(onStoryDeliveredChange);
  onStoryDeliveredChangeRef.current = onStoryDeliveredChange;

  // Extrai a fala inicial do atendente e divide em frases para fluxo de conversa humana
  const rawCallerSpeech = (() => {
    const lines = c.messageContent.split(/\n+/).filter(Boolean);
    const speech = lines.find((l) => /atendente|central|olá|identificamos|falo com/i.test(l)) || lines[0] || c.messageContent;
    return speech.replace(/^[A-Za-z\s()]+:\s*"?/, '').replace(/"?$/, '').trim();
  })();

  const speechPhrases = (() => {
    const parts = rawCallerSpeech.split(/(?<=[.?!])\s+/).filter(Boolean);
    return parts.length > 0 ? parts : [rawCallerSpeech];
  })();

  // Efeito de toque e vibração enquanto o telefone está tocando
  useEffect(() => {
    if (callState !== 'ringing') return;

    sound.playPhoneRingtone();
    sound.playPhoneVibrate();

    const ringInterval = setInterval(() => {
      sound.playPhoneRingtone();
      sound.playPhoneVibrate();
    }, 2800);

    return () => clearInterval(ringInterval);
  }, [callState]);

  // Cronômetro da chamada conectada
  useEffect(() => {
    if (callState !== 'connected') return;
    const timer = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [callState]);

  // Atender chamada com ritmo de conversa viva (sem voz TTS)
  const handleAnswerCall = () => {
    sound.playCallPickup();
    sound.playTensionPulse();
    setCallState('connected');
    setCallSeconds(1);
    setTranscriptLines([]);
    setIsCallerTalking(true);

    // Entrega progressiva da fala inicial com cadência humana
    let phraseIdx = 0;
    const deliverNext = () => {
      if (phraseIdx < speechPhrases.length) {
        const nextPhrase = speechPhrases[phraseIdx];
        setTranscriptLines((prev) => [...prev, { sender: 'caller', text: nextPhrase }]);
        sound.playDialogueBlip();
        phraseIdx += 1;

        if (phraseIdx < speechPhrases.length) {
          setTimeout(deliverNext, 1200);
        } else {
          setIsCallerTalking(false);
        }
      } else {
        setIsCallerTalking(false);
      }
    };

    setTimeout(deliverNext, 450);
  };

  // Desligar chamada
  const handleEndCall = () => {
    sound.playCallHangup();
    setCallState('ended');
    setIsCallerTalking(false);
    onHangup();
  };

  // Ações de diálogo do jogador
  const availableActions = (c.interactiveActions || []).filter(
    (act) => !executedActionIds.includes(act.id),
  );

  const handlePlayerReply = (act: InteractiveAction) => {
    sound.playKeyboardClick();
    setTranscriptLines((prev) => [...prev, { sender: 'player', text: act.label }]);
    sound.playTensionPulse();
    onPerformAction(act);

    // O atendente processa a resposta e replica com o golpe
    setIsCallerTalking(true);
    setTimeout(() => {
      const reply = act.replyMessage.replace(/^[A-Za-z\s()]+:\s*"?/, '').replace(/"?$/, '').trim();
      setTranscriptLines((prev) => [...prev, { sender: 'caller', text: reply }]);
      sound.playDialogueBlip();
      sound.playTensionPulse();
      setIsCallerTalking(false);

      // Armadilha entregue!
      setHasDeliveredTrap(true);
      onStoryDeliveredChangeRef.current?.(true);
    }, 700);
  };

  // Sincroniza entrega caso venha de histórico prévio
  useEffect(() => {
    if (actionHistory.length > 0 && !hasDeliveredTrap) {
      setHasDeliveredTrap(true);
      onStoryDeliveredChangeRef.current?.(true);
    }
  }, [actionHistory.length, hasDeliveredTrap]);

  // ==========================================================================
  // ESTADO 1: O CELULAR ESTÁ TOCANDO (TELA DE CHAMADA RECEBIDA)
  // ==========================================================================
  if (callState === 'ringing') {
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-[#0f172a] via-[#020617] to-black text-white select-none justify-between p-4 relative overflow-hidden">
        {/* Anéis pulsantes de chamada telefônica */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.8, 2.4], opacity: [0.35, 0.15, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }}
            className="w-48 h-48 rounded-full border border-emerald-500/40"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 2], opacity: [0.45, 0.2, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, delay: 0.5, ease: 'easeOut' }}
            className="w-48 h-48 rounded-full border border-emerald-400/30"
          />
        </div>

        <StatusBar time={c.time} dark />

        {/* Identificador da Chamada (BINA) */}
        <div className="flex flex-col items-center pt-8 z-10 text-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-700 via-teal-600 to-sky-600 p-1 shadow-[0_0_30px_rgba(16,185,129,0.35)]"
          >
            <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center text-3xl font-bold font-display">
              {c.sender.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-md animate-pulse">
              <Phone className="w-3.5 h-3.5 text-white" />
            </div>
          </motion.div>

          <h3 className="text-xl font-bold font-display mt-4 text-white drop-shadow">
            {c.sender}
          </h3>
          <div className="text-xs font-mono text-emerald-400 mt-1 bg-emerald-500/15 px-3 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
            {number ?? '0800 729 0001'}
          </div>
          <div className="text-[11px] text-white/60 mt-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Chamada de Voz Recebida • Tocando...</span>
          </div>
        </div>

        {/* Controles de Atender e Recusar */}
        <div className="z-10 pb-6 space-y-4">
          <div className="text-[11px] text-center text-white/70 font-medium animate-pulse">
            👉 Atenda para ouvir o que o atendente tem a dizer
          </div>

          <div className="flex items-center justify-around px-6">
            {/* Botão Recusar */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-750 flex items-center justify-center shadow-[0_8px_20px_rgba(220,38,38,0.4)] cursor-pointer active:scale-90 transition transform"
                title="Recusar Chamada"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>
              <span className="text-[11px] text-white/70 font-medium">Recusar</span>
            </div>

            {/* Botão Atender */}
            <div className="flex flex-col items-center gap-1.5">
              <motion.button
                type="button"
                onClick={handleAnswerCall}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="w-18 h-18 rounded-full bg-emerald-500 hover:bg-emerald-450 flex items-center justify-center shadow-[0_10px_25px_rgba(16,185,129,0.55)] cursor-pointer active:scale-95 transition transform border-2 border-white/30"
                title="Atender Chamada"
              >
                <Phone className="w-8 h-8 text-white animate-bounce" />
              </motion.button>
              <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                Atender
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // ESTADO 2: LIGAÇÃO CONECTADA (CONVERSA VIVA ESTILO JOGO INDIE)
  // ==========================================================================
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0b101b] via-[#050811] to-black text-white select-none">
      <StatusBar time={c.time} dark />

      {/* Cabeçalho da Ligação em Andamento */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-slate-900/60 backdrop-blur-md">
        <button
          type="button"
          onClick={onBackToHome}
          className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer active:scale-95 transition"
          title="Minimizar chamada e ver celular"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Início</span>
        </button>

        <div className="flex flex-col items-center leading-tight">
          <span className="font-bold text-xs text-white truncate max-w-[150px]">
            {c.sender}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-mono text-emerald-300 font-bold">
              {callState === 'connected' ? formatCallTimer(callSeconds) : 'Encerrada'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <AudioWaveform active={isCallerTalking} />
          <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Linha Aberta
          </span>
        </div>
      </div>

      {/* Área da Conversa: Balões Transcritos da Ligação */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2.5">
        {/* Banner de Aviso de Canal Telefônico */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex items-center justify-between text-[10px] text-white/70">
          <span className="flex items-center gap-1 font-mono">
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>Linha conectada com {number ?? '0800 729 0001'}</span>
          </span>
          {isCallerTalking && (
            <span className="text-emerald-400 font-bold animate-pulse font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Atendente falando...</span>
            </span>
          )}
        </div>

        {/* Linhas da Conversa */}
        {transcriptLines.map((line, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`p-2.5 rounded-2xl max-w-[92%] shadow-md text-xs leading-relaxed ${
              line.sender === 'caller'
                ? 'bg-slate-900/90 border border-slate-700/60 text-white rounded-tl-sm mr-auto'
                : 'bg-emerald-600/90 text-white rounded-tr-sm ml-auto border border-emerald-400/30'
            }`}
          >
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase font-bold mb-1 opacity-75">
              {line.sender === 'caller' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-emerald-300">Atendente na Linha:</span>
                </>
              ) : (
                <>
                  <span className="text-sky-200">Você respondeu:</span>
                </>
              )}
            </div>
            <p className="font-medium text-[12px]">{line.text}</p>
          </motion.div>
        ))}

        {/* Indicador de fala do Atendente enquanto a mensagem está sendo formulada na linha */}
        {isCallerTalking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-800/90 border border-slate-700/60 w-fit text-emerald-300 text-[11px] font-medium shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="italic">Atendente falando na linha...</span>
            <span className="flex gap-1 ml-0.5">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" />
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.15s]" />
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.3s]" />
            </span>
          </motion.div>
        )}

      </div>

      {/* Rodapé: Respostas Interativas do Jogador + Botão de Desligar + Veredito */}
      <div className="p-2.5 bg-slate-900/80 border-t border-white/10 space-y-2">
        {/* Escolhas de Diálogo do Jogador (se a armadilha ainda não foi concluída) */}
        {callState === 'connected' && availableActions.length > 0 && !hasDeliveredTrap && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-white/60 uppercase font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Escolha sua fala na chamada:
            </span>
            <div className="space-y-1 max-h-28 overflow-y-auto pr-0.5">
              {availableActions.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => handlePlayerReply(act)}
                  className="w-full text-left bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl px-2.5 py-2 text-xs font-semibold transition cursor-pointer flex items-center justify-between gap-1.5 active:scale-98"
                >
                  <span className="text-xs leading-snug line-clamp-2">{act.label}</span>
                  <span className="text-[10px] font-mono bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded shrink-0 font-bold">
                    Falar ➔
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Controles de Chamada */}
        <div className="flex items-center justify-center pt-1">
          {callState === 'connected' ? (
            <button
              type="button"
              onClick={handleEndCall}
              className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-red-500/30 cursor-pointer active:scale-95 transition"
              title="Desligar Chamada"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Desligar Chamada</span>
            </button>
          ) : (
            <div className="text-[11px] font-mono text-neutral-400 bg-neutral-800/80 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
              <PhoneOff className="w-3.5 h-3.5 text-red-400" />
              <span>Chamada Encerrada • Consulte as Notas para auditar</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// NOTIFICAÇÃO PUSH NA TELA DE BLOQUEIO
// ============================================================================
const PushScreen = ({
  c,
  onPerformAction,
  executedActionIds,
  actionHistory,
  stamped,
  onLinkClick,
}: {
  c: ScamCase;
  onPerformAction: (action: InteractiveAction) => void;
  executedActionIds: string[];
  actionHistory: { player: string; reply: string }[];
  stamped: Verdict;
  onLinkClick: (url: string) => void;
}) => {
  const [title, ...rest] = c.messageContent.split(':');
  const body = rest.join(':').trim();
  const app = c.sender.split('/')[0].trim();
  const availableActions = (c.interactiveActions || []).filter(
    (act) => !executedActionIds.includes(act.id),
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#2e1065] via-[#1e1b4b] to-[#0f172a] text-white select-none">
      <StatusBar time={c.time} dark />

      <div className="text-center pt-2">
        <Lock className="w-3.5 h-3.5 mx-auto text-white/80" />
        <div className="text-[11px] text-white/80 mt-0.5 font-medium">notificação na tela de bloqueio</div>
        <div className="text-[42px] font-semibold leading-none tracking-tight mt-0.5">{c.time}</div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-2.5 space-y-2 mt-3">
        <motion.button
          type="button"
          onClick={() => onLinkClick('app://' + app.toLowerCase())}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full text-left rounded-[18px] bg-white/15 backdrop-blur-2xl p-3 border border-white/20 shadow-xl cursor-pointer hover:bg-white/20 active:scale-98 transition-transform"
          title="Clique para inspecionar a notificação"
        >
          <div className="flex items-center gap-1.5 text-[11px] text-white/80">
            <div className="w-4 h-4 rounded bg-[#820ad1] flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
              {app.charAt(0)}
            </div>
            <span className="uppercase tracking-wider font-semibold text-[10px]">{app}</span>
            <span className="ml-auto text-[10px] opacity-70">agora • toque p/ abrir</span>
          </div>
          <div className="mt-1.5 font-bold text-[13.5px]">{title}</div>
          <div className="text-[12px] text-white/90 leading-[16px] whitespace-pre-wrap mt-0.5">
            {body}
          </div>
        </motion.button>

        {actionHistory.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-2.5 rounded-xl bg-white/15 border border-white/20 text-white text-xs space-y-1 shadow-md"
          >
            <div className="font-semibold flex items-center gap-1 text-purple-300 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" /> {item.player}
            </div>
            <div className="text-[11px] leading-relaxed text-white/90">{item.reply}</div>
          </motion.div>
        ))}
      </div>

      {!stamped && (
        <div className="p-2.5 bg-black/60 border-t border-white/15 space-y-2">
          {availableActions.length > 0 && (
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-0.5">
              {availableActions.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => {
                    sound.playBlip();
                    onPerformAction(act);
                  }}
                  className="w-full text-left bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl px-2.5 py-2 text-xs font-semibold transition cursor-pointer flex items-center justify-between gap-1.5"
                >
                  <span className="text-xs leading-snug font-medium line-clamp-2">{act.label}</span>
                  <span className="text-[10px] font-mono bg-purple-500 text-white px-2 py-0.5 rounded-md shrink-0 font-bold">
                    Checar ➔
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// TELA INICIAL REALISTA DO CELULAR (HOME SCREEN COM APP EM DESTAQUE)
// ============================================================================
// ============================================================================
// TELA INICIAL REALISTA DO CELULAR (HOME SCREEN COM APP EM DESTAQUE)
// ============================================================================
const HomeScreen = ({
  c,
  notificationArrived = false,
  lucasNotificationArrived = false,
  scamCountdown = 30,
  onFastForwardScam,
  onOpenMessaging,
  onOpenLucasChat,
  onOpenNotes,
  onOpenBank,
  onOpenBrowser,
  onOpenVerdictModal,
  onToast,
  inspectedClueCount,
  levelText,
}: {
  c: ScamCase;
  notificationArrived?: boolean;
  lucasNotificationArrived?: boolean;
  scamCountdown?: number;
  onFastForwardScam?: () => void;
  onOpenMessaging: () => void;
  onOpenLucasChat: () => void;
  onOpenNotes: () => void;
  onOpenBank: () => void;
  onOpenBrowser: () => void;
  onOpenVerdictModal: () => void;
  onToast: (msg: string) => void;
  inspectedClueCount: number;
  levelText?: string;
}) => {
  const isTargetChannel = (target: string) => {
    if (c.channel === 'whatsapp' && target === 'whatsapp') return true;
    if (c.channel === 'sms' && target === 'sms') return true;
    if (c.channel === 'push' && target === 'bank') return true;
    if (c.channel === 'call' && target === 'call') return true;
    return false;
  };

  return (
    <div className="relative flex flex-col h-full bg-gradient-to-b from-[#111827] via-[#0f172a] to-[#030712] text-white select-none overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900/50 to-black pointer-events-none" />

      <StatusBar time={c.time} dark levelText={levelText} />

      {/* Banner de Notificação no Topo da HomeScreen (Caso ou Lucas) */}
      <div className="min-h-[58px] flex items-center justify-center">
        <AnimatePresence>
          {notificationArrived ? (
            <motion.div
              key="case-home-banner"
              initial={{ y: -50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -40, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={onOpenMessaging}
              className="w-full mx-3 bg-slate-900/95 border border-emerald-400/50 rounded-2xl p-2.5 backdrop-blur-xl shadow-lg cursor-pointer active:scale-98 transition flex items-center gap-2 group ring-1 ring-emerald-400/30"
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shadow ${
                  c.channel === 'whatsapp'
                    ? 'bg-[#25D366]'
                    : c.channel === 'push'
                    ? 'bg-[#820ad1]'
                    : c.channel === 'call'
                    ? 'bg-emerald-500'
                    : 'bg-[#007aff]'
                }`}
              >
                {c.channel === 'whatsapp' ? (
                  <MessageSquare className="w-3.5 h-3.5" />
                ) : c.channel === 'call' ? (
                  <Phone className="w-3.5 h-3.5" />
                ) : (
                  <Bell className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  <span>{cleanName(c.sender)}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold animate-pulse">
                    {c.channel === 'call' ? '• Chamada tocando' : '• Nova mensagem'}
                  </span>
                </div>
                <div className="text-[11px] text-white/70 truncate">
                  {c.channel === 'call' ? 'Toque para atender a ligação telefônica' : c.messageContent}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/60 group-hover:translate-x-0.5 transition" />
            </motion.div>
          ) : lucasNotificationArrived ? (
            <motion.div
              key="lucas-home-banner"
              initial={{ y: -50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -40, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={onOpenLucasChat}
              className="w-full mx-3 bg-slate-900/95 border border-amber-400/50 rounded-2xl p-2.5 backdrop-blur-xl shadow-lg cursor-pointer active:scale-98 transition flex items-center gap-2 group ring-1 ring-amber-400/30"
            >
              <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#25D366] text-white text-[11px] font-bold shadow">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  <span>Lucas (Filho) 🛡️</span>
                  <span className="text-[10px] text-amber-400 font-semibold animate-pulse">
                    • Orientações no Bloco de Notas
                  </span>
                </div>
                <div className="text-[11px] text-white/70 truncate">
                  &quot;Deixei no Bloco de Notas orientações pra quando for vítima dos vagabundos...&quot;
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/60 group-hover:translate-x-0.5 transition" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* CONTEÚDO DA TELA INICIAL */}
      <div className="flex-1 flex flex-col justify-between p-3.5 z-10 pt-1">
        {/* Widget de Relógio & Clima */}
        <div className="flex flex-col items-center text-center pt-0.5">
          <div className="text-[44px] font-bold leading-none tracking-tight font-display text-white/95">
            {c.time}
          </div>
          <div className="text-xs text-white/70 font-medium flex items-center gap-1.5 mt-1">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Sábado, 10 de out • 26°C Ensolarado</span>
          </div>
        </div>

        {/* Barra de Pesquisa Estilo Google */}
        <div
          onClick={onOpenBrowser}
          className="w-full bg-white/10 hover:bg-white/15 border border-white/15 rounded-full py-2 px-3.5 flex items-center justify-between text-white/60 text-xs backdrop-blur-md transition mt-1 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-sky-400">G</span>
            <span className="text-xs text-white/60">Pesquisar ou checar no Google...</span>
          </div>
          <Search className="w-3.5 h-3.5 text-white/60" />
        </div>

        {/* Grid de Apps */}
        <div className="grid grid-cols-4 gap-y-4 gap-x-2.5 my-auto px-0.5">
          {/* 1. WhatsApp (Abre mensagem do golpista ou conversa com o Lucas) */}
          <div
            onClick={notificationArrived && c.channel === 'whatsapp' ? onOpenMessaging : onOpenLucasChat}
            className="flex flex-col items-center gap-1 group cursor-pointer relative"
          >
            <div
              className={`relative w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all ${
                isTargetChannel('whatsapp') && notificationArrived
                  ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 animate-pulse shadow-[0_0_16px_rgba(52,211,153,0.7)]'
                  : ''
              }`}
            >
              <MessageSquare className="w-6 h-6" />
              {notificationArrived && isTargetChannel('whatsapp') ? (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold flex items-center justify-center animate-bounce shadow">
                  1
                </span>
              ) : lucasNotificationArrived ? (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-bold flex items-center justify-center shadow">
                  1
                </span>
              ) : null}
            </div>
            <span className="text-[11px] text-white/90 font-medium">WhatsApp</span>
          </div>

          {/* 2. Mensagens SMS */}
          <div
            onClick={notificationArrived && c.channel === 'sms' ? onOpenMessaging : onOpenLucasChat}
            className="flex flex-col items-center gap-1 group cursor-pointer relative"
          >
            <div
              className={`relative w-12 h-12 rounded-2xl bg-[#007aff] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all ${
                isTargetChannel('sms') && notificationArrived
                  ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 animate-pulse shadow-[0_0_16px_rgba(96,165,250,0.7)]'
                  : ''
              }`}
            >
              <MessageCircle className="w-6 h-6" />
              {isTargetChannel('sms') && notificationArrived && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold flex items-center justify-center animate-bounce shadow">
                  1
                </span>
              )}
            </div>
            <span className="text-[11px] text-white/90 font-medium">Mensagens</span>
          </div>

          {/* 3. Meu Banco */}
          <div
            onClick={onOpenBank}
            className="flex flex-col items-center gap-1 group cursor-pointer relative"
          >
            <div
              className={`relative w-12 h-12 rounded-2xl bg-[#820ad1] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all ${
                isTargetChannel('push') && notificationArrived
                  ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900 animate-pulse shadow-[0_0_16px_rgba(192,132,252,0.7)]'
                  : ''
              }`}
            >
              <CreditCard className="w-6 h-6" />
              {isTargetChannel('push') && notificationArrived && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold flex items-center justify-center animate-bounce shadow">
                  1
                </span>
              )}
            </div>
            <span className="text-[11px] text-white/90 font-medium">Meu Banco</span>
          </div>

          {/* 4. BLOCO DE NOTAS (Checklist de Procedimentos) */}
          <div
            onClick={onOpenNotes}
            className="flex flex-col items-center gap-1 group cursor-pointer relative"
          >
            <div
              className={`relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform ${
                inspectedClueCount === 0 ? 'ring-2 ring-amber-300/70 ring-offset-2 ring-offset-slate-900' : ''
              }`}
            >
              <FileText className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 px-1.5 min-w-[20px] h-5 rounded-full bg-amber-400 text-black font-mono text-[10px] font-extrabold flex items-center justify-center shadow">
                {inspectedClueCount}/{c.clues.length}
              </span>
            </div>
            <span className="text-[11px] text-white/90 font-medium">Notas</span>
          </div>

          {/* 5. Música */}
          <div
            onClick={() => onToast('🎵 Tocando música favorita em segundo plano.')}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#1db954] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Music className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-white/90 font-medium">Música</span>
          </div>

          {/* 6. Internet */}
          <div
            onClick={onOpenBrowser}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Globe className="w-6 h-6 text-sky-600" />
            </div>
            <span className="text-[11px] text-white/90 font-medium">Internet</span>
          </div>

          {/* 7. Galeria */}
          <div
            onClick={() => onToast('📸 Fotos salvas protegidas no aparelho.')}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-white/90 font-medium">Galeria</span>
          </div>

          {/* 8. Telefone */}
          <div
            onClick={onOpenMessaging}
            className="flex flex-col items-center gap-1 group cursor-pointer relative"
          >
            <div
              className={`relative w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all ${
                isTargetChannel('call') && notificationArrived
                  ? 'ring-2 ring-emerald-300 ring-offset-2 ring-offset-slate-900 animate-pulse shadow-[0_0_16px_rgba(52,211,153,0.7)]'
                  : ''
              }`}
            >
              <Phone className="w-6 h-6" />
              {isTargetChannel('call') && notificationArrived && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold flex items-center justify-center animate-bounce shadow">
                  !
                </span>
              )}
            </div>
            <span className="text-[11px] text-white/90 font-medium">Telefone</span>
          </div>
        </div>

        {/* Rodapé da Tela Inicial com Contagem Regressiva e Botão de Veredito Pericial */}
        <div className="pt-2 space-y-2">
          {!notificationArrived ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                <span className="text-[11px] text-white/80 font-mono truncate">
                  Mensagem externa em {scamCountdown}s
                </span>
              </div>
              <button
                type="button"
                onClick={onFastForwardScam}
                className="text-[10px] bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold px-2 py-1 rounded-lg cursor-pointer transition active:scale-95 shrink-0"
              >
                ⏩ Receber agora
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenMessaging}
              className="w-full py-2 rounded-xl border text-center text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition bg-emerald-500/20 border-emerald-400/40 text-emerald-200 shadow-sm"
            >
              <span className="flex items-center gap-1.5 text-emerald-300 animate-pulse font-bold">
                🔔 Notificação recebida de {cleanName(c.sender)} • Toque p/ ver
              </span>
            </button>
          )}

          {/* Botão de Tribunal / Veredito Pericial */}
          <button
            type="button"
            onClick={onOpenVerdictModal}
            className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="text-sm">⚖️</span>
            <span>Emitir Veredito Pericial (Tribunal)</span>
            <ChevronRight className="w-4 h-4 ml-auto text-slate-950/70" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL DO CELULAR (PHONE SCREEN HUB COM APP SWITCHER)
// ============================================================================
export const PhoneScreen: React.FC<PhoneScreenProps> = ({
  scamCase,
  stamped,
  wasCorrect,
  onPerformAction,
  executedActionIds,
  actionHistory,
  onAppOpenChange,
  onVerdict,
  onNextCase,
  inspectedClueIds = [],
  onInspectClue,
  onStoryDeliveredChange,
  unlockedSkills = [],
  onUnlockSkill,
  earnedXp = 0,
  levelIndex,
  totalLevels,
  initialBootDone = false,
  onCompleteInitialBoot,
}) => {
  const [activeApp, setActiveApp] = useState<'home' | 'messaging' | 'lucasChat' | 'notes' | 'bank' | 'browser'>('home');
  const [previousApp, setPreviousApp] = useState<'home' | 'messaging' | 'lucasChat' | 'notes'>('home');
  const [isLocked, setIsLocked] = useState(true);
  const [isScreenOff, setIsScreenOff] = useState(true);
  const [bootStage, setBootStage] = useState<'hello' | 'welcome' | 'about' | 'ready'>(() => {
    return initialBootDone ? 'ready' : 'hello';
  });
  const [lucasNotificationArrived, setLucasNotificationArrived] = useState(false);
  const [notificationArrived, setNotificationArrived] = useState(false);
  const [scamCountdown, setScamCountdown] = useState(30);
  const [isVerdictModalOpen, setIsVerdictModalOpen] = useState(false);
  const [userHypothesisIndex, setUserHypothesisIndex] = useState<number | null>(null);
  const [vibrateKey, setVibrateKey] = useState(0);
  const [activeModal, setActiveModal] = useState<'contact' | 'toast' | null>(null);
  const [browserUrl, setBrowserUrl] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [skillToast, setSkillToast] = useState<Skill[] | null>(null);

  const levelText = levelIndex ? `Nível ${levelIndex} / ${totalLevels || 9}` : undefined;

  // Som harmônico no primeiro boot
  useEffect(() => {
    if (bootStage === 'hello') {
      sound.playBootHelloChord();
    }
  }, [bootStage]);

  const handleFinishSetup = () => {
    sound.playBootHelloChord();
    sound.playUnlockClick();
    onCompleteInitialBoot?.();
    setBootStage('ready');
    setIsLocked(true);
  };

  // Ler/conferir uma dica ensina habilidades novas (persistem entre casos)
  const handleInspectClue = (clue: InvestigativeClue) => {
    onInspectClue?.(clue);
    sound.playClueInspect();
    const gained: Skill[] = ['question', 'verdict', 'bank', 'browser'];
    const fresh = gained.filter((sk) => !unlockedSkills.includes(sk));
    if (fresh.length > 0) {
      fresh.forEach((sk) => onUnlockSkill?.(sk));
      sound.playSuccess();
      setSkillToast(fresh);
    }
  };

  useEffect(() => {
    if (!skillToast) return;
    const t = setTimeout(() => setSkillToast(null), 3800);
    return () => clearTimeout(t);
  }, [skillToast]);

  const onAppOpenChangeRef = useRef(onAppOpenChange);
  onAppOpenChangeRef.current = onAppOpenChange;

  const onStoryDeliveredChangeRef = useRef(onStoryDeliveredChange);
  onStoryDeliveredChangeRef.current = onStoryDeliveredChange;

  const triggerNotificationArrival = useCallback(() => {
    setNotificationArrived(true);
    sound.playPhoneVibrate();
    sound.playTensionPulse();
    if (scamCase.channel === 'call') {
      sound.playPhoneRingtone();
    } else if (scamCase.channel === 'whatsapp') {
      sound.playMessagePing();
    } else {
      sound.playIOSBellChime();
    }
  }, [scamCase.channel]);

  // Ciclo de Vida: toda vez que muda de caso, tela escurece e acende com calma
  useEffect(() => {
    setIsBlocked(false);
    setActiveModal(null);
    setIsLocked(true);
    setActiveApp('home');
    setPreviousApp('home');
    setLucasNotificationArrived(false);
    setNotificationArrived(false);
    setScamCountdown(30);
    setIsVerdictModalOpen(false);
    setUserHypothesisIndex(null);
    onAppOpenChangeRef.current?.(false);
    onStoryDeliveredChangeRef.current?.(false);
    setVibrateKey((k) => k + 1);

    // 1. Tela apaga em preto absoluto
    setIsScreenOff(true);
    sound.playScreenLock();

    // 2. Tela liga suavemente (OLED wake)
    const wakeTimer = setTimeout(() => {
      setIsScreenOff(false);
      sound.playScreenWake();
    }, 450);

    return () => {
      clearTimeout(wakeTimer);
    };
  }, [scamCase.id]);

  // Chegada da notificação inicial do Lucas (alertando sobre o Bloco de Notas)
  useEffect(() => {
    if (bootStage !== 'ready' || lucasNotificationArrived) return;
    const lucasTimer = setTimeout(() => {
      setLucasNotificationArrived(true);
      sound.playMessagePing();
      sound.playPhoneVibrate();
    }, 1200);

    return () => clearTimeout(lucasTimer);
  }, [bootStage, lucasNotificationArrived]);

  // Temporizador de 30 segundos para a mensagem do golpista (inicia APENAS após o desbloqueio)
  useEffect(() => {
    if (isLocked || notificationArrived || bootStage !== 'ready') return;

    const interval = setInterval(() => {
      setScamCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerNotificationArrival();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, notificationArrived, bootStage, triggerNotificationArrival]);

  const handleFastForwardScam = () => {
    if (!notificationArrived) {
      setScamCountdown(0);
      triggerNotificationArrival();
    }
  };

  useEffect(() => {
    if (stamped) {
      sound.playStampThud();
      setIsLocked(false);
      setActiveApp('messaging');
      onAppOpenChangeRef.current?.(true);
    }
  }, [stamped]);

  const handleUnlockToHome = () => {
    sound.playUnlockClick();
    setIsLocked(false);
    setActiveApp('home');
  };

  const handleOpenLucasChat = () => {
    sound.playKeypress();
    setIsLocked(false);
    setActiveApp('lucasChat');
    setPreviousApp('home');
    onAppOpenChange?.(true);
  };

  const handleOpenAppDirectly = () => {
    sound.playKeypress();
    if (!notificationArrived) {
      setNotificationArrived(true);
      setScamCountdown(0);
      sound.playPhoneVibrate();
    }
    setIsLocked(false);
    setActiveApp('messaging');
    setPreviousApp('home');
    onAppOpenChange?.(true);
  };

  const handleOpenNotes = () => {
    sound.playBlip();
    if (activeApp === 'home' || activeApp === 'messaging' || activeApp === 'lucasChat') {
      setPreviousApp(activeApp);
    }
    setActiveApp('notes');
  };

  const handleOpenBank = () => {
    sound.playBlip();
    if (activeApp === 'home' || activeApp === 'messaging' || activeApp === 'notes' || activeApp === 'lucasChat') {
      setPreviousApp(activeApp);
    }
    setActiveApp('bank');
  };

  const handleOpenBrowser = (url?: string) => {
    sound.playBlip();
    if (activeApp === 'home' || activeApp === 'messaging' || activeApp === 'notes' || activeApp === 'lucasChat') {
      setPreviousApp(activeApp);
    }
    setBrowserUrl(url || 'https://pesquisa-segura.com.br');
    setActiveApp('browser');
  };

  const handleConfirmVerdict = (verdict: 'scam' | 'safe', hypothesisIndex: number) => {
    setUserHypothesisIndex(hypothesisIndex);
    setIsVerdictModalOpen(false);
    onVerdict?.(verdict);
  };

  const showToast = (message: string) => {
    sound.playBlip();
    setToastMessage(message);
    setActiveModal('toast');
    setTimeout(() => setActiveModal(null), 2500);
  };

  const handleBlockContact = () => {
    sound.playStampThud();
    setIsBlocked(true);
    showToast('🚫 Contato bloqueado com sucesso!');
  };

  const handleCallClick = () => {
    sound.playBlip();
    showToast('📞 Chamada não atendida pelo remetente.');
  };

  const handleHangup = () => {
    sound.playBlip();
    showToast('📴 Chamada encerrada na cara do golpista!');
  };

  const flagged = stamped !== null && scamCase.isScam;

  // Render do app de mensagens conforme canal
  const renderMessagingApp = () => {
    switch (scamCase.channel) {
      case 'whatsapp':
        return (
          <WhatsAppScreen
            c={scamCase}
            flagged={flagged}
            onPerformAction={onPerformAction}
            executedActionIds={executedActionIds}
            actionHistory={actionHistory}
            stamped={stamped}
            onLinkClick={handleOpenBrowser}
            onContactClick={() => setActiveModal('contact')}
            isBlocked={isBlocked}
            onBlockContact={handleBlockContact}
            onCallClick={handleCallClick}
            onBackToHome={() => setActiveApp('home')}
            onOpenNotes={handleOpenNotes}
            onStoryDeliveredChange={onStoryDeliveredChange}
          />
        );
      case 'call':
        return (
          <CallScreen
            c={scamCase}
            onPerformAction={onPerformAction}
            executedActionIds={executedActionIds}
            actionHistory={actionHistory}
            onHangup={handleHangup}
            onBackToHome={() => setActiveApp('home')}
            onStoryDeliveredChange={onStoryDeliveredChange}
          />
        );
      case 'push':
        return (
          <PushScreen
            c={scamCase}
            onPerformAction={onPerformAction}
            executedActionIds={executedActionIds}
            actionHistory={actionHistory}
            stamped={stamped}
            onLinkClick={handleOpenBrowser}
          />
        );
      default:
        return (
          <SmsScreen
            c={scamCase}
            flagged={flagged}
            onPerformAction={onPerformAction}
            executedActionIds={executedActionIds}
            actionHistory={actionHistory}
            stamped={stamped}
            onLinkClick={handleOpenBrowser}
            onContactClick={() => setActiveModal('contact')}
            onBackToHome={() => setActiveApp('home')}
            onOpenNotes={handleOpenNotes}
            onStoryDeliveredChange={onStoryDeliveredChange}
          />
        );
    }
  };

  const number = findContactNumber(scamCase);

  return (
    <motion.div
      key={`phone-${scamCase.id}-${vibrateKey}`}
      initial={{ x: 0 }}
      animate={
        stamped
          ? { x: [0, -8, 8, -5, 5, -2, 0], rotate: [0, -1, 1, 0] }
          : { x: [0, -4, 4, -4, 4, -2, 2, 0] }
      }
      transition={{ duration: stamped ? 0.4 : 0.35, ease: 'easeInOut' }}
      className="relative mx-auto h-full w-full max-w-full sm:w-[410px] sm:max-w-[420px] sm:h-full sm:max-h-[820px] sm:min-h-[640px] flex flex-col"
    >
      {/* Moldura: Apenas no desktop (sm:). No celular real, a tela é nativa sem bordas artificiais */}
      <div className="relative w-full h-full sm:rounded-[50px] sm:bg-[#0c0e14] sm:p-[12px] sm:shadow-[0_0_0_3px_#272b38,0_24px_50px_-10px_rgba(0,0,0,0.9)] sm:border sm:border-white/20 flex flex-col">
        {/* Botão de Energia Físico Lateral (Lock/Power) */}
        <button
          type="button"
          onClick={() => {
            sound.playHardwareButtonClick();
            setIsLocked((prev) => !prev);
          }}
          className="hidden sm:block absolute -right-[6px] top-[110px] w-[5px] h-[46px] rounded-r-md bg-[#2d3345] hover:bg-[#3b4259] active:translate-x-[-1px] transition cursor-pointer border-r border-white/20"
          title="Botão físico de bloqueio / energia"
        />

        {/* Botões Físicos de Volume */}
        <div className="hidden sm:flex flex-col gap-2.5 absolute -left-[6px] top-[95px]">
          <button
            type="button"
            onClick={() => {
              sound.playHardwareButtonClick();
              showToast('🔊 Volume: 85%');
            }}
            className="w-[5px] h-[34px] rounded-l-md bg-[#2d3345] hover:bg-[#3b4259] active:translate-x-[1px] transition cursor-pointer border-l border-white/20"
            title="Aumentar Volume"
          />
          <button
            type="button"
            onClick={() => {
              sound.playHardwareButtonClick();
              showToast('🔉 Volume: 70%');
            }}
            className="w-[5px] h-[34px] rounded-l-md bg-[#2d3345] hover:bg-[#3b4259] active:translate-x-[1px] transition cursor-pointer border-l border-white/20"
            title="Diminuir Volume"
          />
        </div>

        <div className="relative flex-1 h-full w-full rounded-none sm:rounded-[40px] overflow-hidden font-phone select-none bg-black flex flex-col shadow-none">
          {/* EFEITO DE PRIMEIRO BOOT ESTILO IPHONE (OOBE SETUP) */}
          {/* EFEITO DE PRIMEIRO BOOT (3 TOQUES EM PORTUGUÊS: OLÁ -> SEJA BEM-VINDO -> COMO FUNCIONA) */}
          <AnimatePresence>
            {bootStage !== 'ready' && !initialBootDone && (
              <motion.div
                key="boot-screen-overlay"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-between p-6 text-center select-none"
              >
                {/* Botão Pular discreto no topo */}
                <div className="w-full flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleFinishSetup}
                    className="text-[11px] font-mono text-white/40 hover:text-white/80 transition px-2 py-1 cursor-pointer"
                  >
                    Pular ➔
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {/* TOQUE 1: OLÁ */}
                  {bootStage === 'hello' && (
                    <motion.div
                      key="boot-stage-hello"
                      initial={{ opacity: 0, scale: 0.94, y: 14 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.04, y: -14 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      onClick={() => {
                        sound.playKeypress();
                        setBootStage('welcome');
                      }}
                      className="flex flex-col items-center gap-4 cursor-pointer my-auto"
                    >
                      <span className="text-6xl sm:text-7xl font-extralight tracking-tight text-white/95 font-display drop-shadow-[0_0_35px_rgba(255,255,255,0.45)]">
                        Olá
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-white/50 font-mono tracking-widest uppercase">
                        <span>Toque para continuar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </motion.div>
                  )}

                  {/* TOQUE 2: SEJA BEM-VINDO */}
                  {bootStage === 'welcome' && (
                    <motion.div
                      key="boot-stage-welcome"
                      initial={{ opacity: 0, scale: 0.94, y: 14 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.04, y: -14 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      onClick={() => {
                        sound.playKeypress();
                        setBootStage('about');
                      }}
                      className="flex flex-col items-center gap-4 cursor-pointer my-auto"
                    >
                      <span className="text-5xl sm:text-6xl font-light tracking-tight text-white font-display drop-shadow-[0_0_30px_rgba(255,255,255,0.35)]">
                        Seja Bem-Vindo
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-white/50 font-mono tracking-widest uppercase">
                        <span>Toque para ver o aviso</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </motion.div>
                  )}

                  {/* TOQUE 3: AVISO SIMPLES QUE ATÉ UMA CRIANÇA ENTENDE (SEM CITAR IPHONE) */}
                  {bootStage === 'about' && (
                    <motion.div
                      key="boot-stage-about"
                      initial={{ opacity: 0, scale: 0.94, y: 14 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.04, y: -14 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="flex flex-col items-center gap-4 my-auto max-w-xs"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg shadow-white/5">
                        <ShieldCheck className="w-7 h-7 text-emerald-400" />
                      </div>

                      <div className="space-y-1">
                        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display block">
                          Como Funciona
                        </span>
                        <p className="text-[12px] text-white/60 leading-relaxed">
                          Aprenda a reconhecer golpes reais da internet.
                        </p>
                      </div>

                      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-left space-y-2.5 text-[11.5px] text-white/85">
                        <div className="flex items-start gap-2.5">
                          <span className="text-base leading-none">⚠️</span>
                          <span><strong>Mensagens com Pressa:</strong> Golpistas vão mandar mensagens fingindo urgência para pedir Pix.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="text-base leading-none">📝</span>
                          <span><strong>Orientações do Lucas:</strong> O Lucas (seu filho) anotou dicas de ouro no seu Bloco de Notas para te defender desses vagabundos.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="text-base leading-none">🔍</span>
                          <span><strong>Investigue com Calma:</strong> Abra os aplicativos e confira tudo com calma antes de tomar qualquer decisão.</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleFinishSetup}
                        className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-neutral-200 text-black font-bold text-xs shadow-lg transition active:scale-95 cursor-pointer mt-1 flex items-center justify-center gap-1.5"
                      >
                        <span>Entrar no Celular</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Indicador de 3 passos na base */}
                <div
                  onClick={() => {
                    if (bootStage === 'hello') {
                      sound.playKeypress();
                      setBootStage('welcome');
                    } else if (bootStage === 'welcome') {
                      sound.playKeypress();
                      setBootStage('about');
                    } else {
                      handleFinishSetup();
                    }
                  }}
                  className="w-full flex flex-col items-center gap-2 pb-2 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full transition-all ${bootStage === 'hello' ? 'w-6 bg-white' : 'bg-white/30'}`} />
                    <span className={`w-2 h-2 rounded-full transition-all ${bootStage === 'welcome' ? 'w-6 bg-white' : 'bg-white/30'}`} />
                    <span className={`w-2 h-2 rounded-full transition-all ${bootStage === 'about' ? 'w-6 bg-white' : 'bg-white/30'}`} />
                  </div>
                  <span className="text-[10px] text-white/40 font-mono">
                    {bootStage === 'hello'
                      ? 'Passo 1 de 3 • Toque para continuar'
                      : bootStage === 'welcome'
                      ? 'Passo 2 de 3 • Toque para avançar'
                      : 'Passo 3 de 3 • Toque para entrar no celular'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* EFEITO DE TELA APAGADA / TRANSIÇÃO OLED */}
          <AnimatePresence>
            {isScreenOff && bootStage === 'ready' && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 z-40 bg-black flex items-center justify-center pointer-events-none"
              >
                <div className="w-16 h-1 rounded-full bg-neutral-800/60" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* VINHETA DE SUSPENSE COTIDIANO (PULSAÇÃO CINEMATOGRÁFICA NAS BORDAS SOB AMEAÇA) */}
          {notificationArrived && !stamped && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.12, 0.32, 0.12] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(15,23,42,0.85)_100%)] mix-blend-multiply"
            />
          )}

          {/* Roteador de Apps Dentro do Sistema Operacional do Celular */}
          <AnimatePresence mode="wait">
            {isLocked ? (
              <motion.div
                key={`lock-${scamCase.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.22 }}
                className="h-full"
              >
                <LockScreen
                  c={scamCase}
                  lucasNotificationArrived={lucasNotificationArrived}
                  onUnlock={handleUnlockToHome}
                  onOpenLucasChat={handleOpenLucasChat}
                  levelText={levelText}
                />
              </motion.div>
            ) : activeApp === 'home' ? (
              <motion.div
                key={`home-${scamCase.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.22 }}
                className="h-full"
              >
                <HomeScreen
                  c={scamCase}
                  notificationArrived={notificationArrived}
                  lucasNotificationArrived={lucasNotificationArrived}
                  scamCountdown={scamCountdown}
                  onFastForwardScam={handleFastForwardScam}
                  onOpenMessaging={handleOpenAppDirectly}
                  onOpenLucasChat={handleOpenLucasChat}
                  onOpenNotes={handleOpenNotes}
                  onOpenBank={() => handleOpenBank()}
                  onOpenBrowser={() => handleOpenBrowser()}
                  onOpenVerdictModal={() => setIsVerdictModalOpen(true)}
                  onToast={showToast}
                  inspectedClueCount={inspectedClueIds.length}
                  levelText={levelText}
                />
              </motion.div>
            ) : activeApp === 'lucasChat' ? (
              <motion.div
                key={`lucas-${scamCase.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.22 }}
                className="h-full"
              >
                <LucasChatScreen
                  currentTime={scamCase.time}
                  onBackToHome={() => setActiveApp('home')}
                  onOpenNotes={handleOpenNotes}
                />
              </motion.div>
            ) : activeApp === 'messaging' ? (
              <motion.div
                key={`msg-${scamCase.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.22 }}
                className="h-full"
              >
                {renderMessagingApp()}
              </motion.div>
            ) : activeApp === 'notes' ? (
              <motion.div
                key={`notes-${scamCase.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.22 }}
                className="h-full"
              >
                <NotesScreen
                  c={scamCase}
                  inspectedClueIds={inspectedClueIds}
                  onInspectClue={handleInspectClue}
                  onBack={() => setActiveApp(previousApp === 'notes' ? 'home' : previousApp)}
                />
              </motion.div>
            ) : activeApp === 'bank' ? (
              <motion.div
                key={`bank-${scamCase.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.22 }}
                className="h-full"
              >
                <BankScreen
                  c={scamCase}
                  onBack={() => setActiveApp(previousApp)}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`browser-${scamCase.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.22 }}
                className="h-full"
              >
                <BrowserScreen
                  c={scamCase}
                  url={browserUrl}
                  onBack={() => setActiveApp(previousApp)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notch Dinâmico no Topo do Celular (Apenas no desktop) */}
          <div className="hidden sm:flex absolute top-1.5 left-1/2 -translate-x-1/2 w-[82px] h-[19px] rounded-full bg-black items-center justify-between px-3 z-30 shadow-md border border-white/10 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-[#1e293b]" />
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          </div>

          {/* BARRA DE INÍCIO PERSISTENTE (HOME BAR ESTILO IOS/ANDROID) */}
          {!isLocked && (
            <div
              className="absolute bottom-1 left-0 right-0 py-1 flex justify-center z-30 cursor-pointer group"
              onClick={() => {
                sound.playBlip();
                setActiveApp('home');
              }}
              title="Toque para voltar à Tela Inicial do Celular"
            >
              <div className="w-24 h-1 rounded-full bg-white/40 group-hover:bg-white/80 active:scale-95 transition-all shadow-sm" />
            </div>
          )}

          {/* Toast Interno de Feedback do Celular */}
          <AnimatePresence>
            {activeModal === 'toast' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-8 left-3 right-3 z-50 bg-black/90 text-white text-[11px] font-semibold py-2 px-3 rounded-xl border border-white/20 shadow-2xl text-center backdrop-blur-md"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Aviso de habilidade nova (estilo notificação do sistema) */}
          <AnimatePresence>
            {skillToast && (
              <motion.div
                initial={{ opacity: 0, y: -24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                onClick={() => setSkillToast(null)}
                className="absolute top-3 sm:top-8 left-2.5 right-2.5 z-50 bg-slate-950/95 border border-amber-400/50 rounded-2xl p-3 shadow-2xl backdrop-blur-xl text-white cursor-pointer space-y-1.5"
              >
                {skillToast.map((sk) => (
                  <div key={sk} className="flex items-start gap-2.5">
                    <span className="text-lg leading-none mt-0.5">{SKILL_INFO[sk].icon}</span>
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                        🔓 Nova habilidade: {SKILL_INFO[sk].title}
                      </div>
                      <p className="text-[11px] text-white/80 leading-snug italic">&quot;{SKILL_INFO[sk].lucas}&quot;</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* MODAL: Perfil do Contato (Point & Click no Remetente) */}
          <AnimatePresence>
            {activeModal === 'contact' && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="absolute inset-0 z-50 bg-[#111317] text-white flex flex-col p-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-neutral-400">Dados do Contato</span>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="p-1 hover:bg-white/10 rounded-full cursor-pointer text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 p-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#3a3a3c] to-[#636366] flex items-center justify-center text-2xl font-bold shadow-xl border-2 border-white/20">
                    {scamCase.sender.charAt(0)}
                  </div>

                  <div>
                    <h3 className="font-bold text-base">{cleanName(scamCase.sender)}</h3>
                    <div className="text-xs text-neutral-400 font-mono mt-0.5">
                      {number ?? 'Sem identificador de chamada'}
                    </div>
                  </div>

                  <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-left space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Canal:</span>
                      <span className="font-semibold capitalize text-emerald-400">{scamCase.channel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Verificação:</span>
                      <span
                        className={`font-semibold ${
                          scamCase.isScam ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {scamCase.isScam ? 'Não Verificado ✗' : 'Verificado ✓'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Status da Conta:</span>
                      <span className="font-semibold text-neutral-200">
                        {isBlocked ? 'Bloqueado' : 'Ativo'}
                      </span>
                    </div>
                  </div>

                  <div className="w-full space-y-2 pt-2">
                    {!isBlocked ? (
                      <button
                        type="button"
                        onClick={handleBlockContact}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition"
                      >
                        <UserX className="w-4 h-4" />
                        <span>Bloquear este Contato</span>
                      </button>
                    ) : (
                      <div className="py-2 bg-neutral-800 text-neutral-400 font-semibold text-xs rounded-xl">
                        ✓ Contato já está bloqueado
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="w-full py-2 bg-white/10 hover:bg-white/20 text-neutral-200 font-bold text-xs rounded-xl cursor-pointer active:scale-95 transition"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MODAL DO TRIBUNAL PERICIAL COM REVALIDAÇÃO FORENSE (O PORQUÊ) */}
          <VerdictModal
            c={scamCase}
            isOpen={isVerdictModalOpen}
            onClose={() => setIsVerdictModalOpen(false)}
            onConfirm={handleConfirmVerdict}
          />

          {/* CARD DE RESULTADO / DOSSIÊ FORENSE DIEGÉTICO */}
          <AnimatePresence>
            {stamped && (
              <motion.div
                initial={{ y: 90, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 90, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 320, delay: 0.6 }}
                className="absolute bottom-6 left-2.5 right-2.5 z-40 max-h-[78%] overflow-y-auto overscroll-contain no-scrollbar bg-slate-900/98 border-2 border-white/30 rounded-2xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl text-white space-y-2.5"
              >
                {/* Cabeçalho do Dossiê */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-1">
                    🔍 DOSSIÊ FORENSE • CASO RESOLVIDO
                  </span>
                  {wasCorrect && earnedXp > 0 && (
                    <span className="font-mono font-bold text-[10px] bg-emerald-500/25 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/40 shrink-0 animate-pulse">
                      +{earnedXp} XP
                    </span>
                  )}
                </div>

                {/* Banner de Resultado */}
                <div
                  className={`flex items-center gap-2 p-2 rounded-xl border ${
                    wasCorrect
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}
                >
                  {wasCorrect ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <div className="font-bold text-xs flex-1 leading-snug">
                    {wasCorrect
                      ? 'Defesa Bem-Sucedida! Veredito preciso.'
                      : scamCase.isScam
                      ? 'Falha de Atenção! Você caiu no golpe.'
                      : 'Alarme Falso! A mensagem era legítima.'}
                  </div>
                </div>

                {/* Avaliação da Hipótese Forense Selecionada pelo Jogador */}
                {userHypothesisIndex !== null && scamCase.evidenceHypotheses[userHypothesisIndex] && (
                  <div
                    className={`text-[10.5px] rounded-xl p-2.5 border ${
                      userHypothesisIndex === scamCase.correctEvidenceIndex
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    }`}
                  >
                    <span className="text-[9px] font-mono uppercase tracking-wide font-bold block mb-0.5">
                      {userHypothesisIndex === scamCase.correctEvidenceIndex
                        ? '✓ Fundamentação Pericial Precisa:'
                        : '⚠️ Reavaliação da Evidência Principal:'}
                    </span>
                    <p className="leading-snug">
                      {userHypothesisIndex === scamCase.correctEvidenceIndex
                        ? 'Você apontou com exatidão o fato técnico concreto que comprova o caso!'
                        : `Sua hipótese: "${scamCase.evidenceHypotheses[userHypothesisIndex]}". A prova técnica chave é: ${scamCase.keyEvidenceReason}`}
                    </p>
                  </div>
                )}

                {/* Engenharia Social Identificada */}
                {scamCase.pedagogy?.emotionalTrigger && (
                  <div className="text-[10.5px] bg-white/5 border border-white/10 rounded-xl p-2 space-y-0.5">
                    <span className="text-[9px] font-mono uppercase tracking-wide text-amber-300 font-bold block">
                      ⚠️ Tática de Engenharia Social:
                    </span>
                    <span className="text-neutral-300 leading-snug block">
                      {scamCase.pedagogy.emotionalTrigger}
                    </span>
                  </div>
                )}

                {/* Análise Pericial / Fato Concreto */}
                <div className="text-[11px] text-neutral-200 leading-relaxed bg-black/40 border border-white/10 rounded-xl p-2.5">
                  <span className="text-[9px] font-mono uppercase tracking-wide text-sky-400 font-bold block mb-0.5">
                    🔎 Fato Concreto Apurado:
                  </span>
                  {scamCase.keyEvidenceReason || scamCase.explanation}
                </div>

                {/* Regra de Ouro do Lucas */}
                <div className="p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/30">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                    📌 Regra de Ouro do Lucas
                  </div>
                  <p className="text-[11px] font-semibold text-white leading-snug mt-0.5">
                    {scamCase.pedagogy.goldenRule}
                  </p>
                </div>

                {/* Botão de Avançar para o Próximo Desafio */}
                {onNextCase && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBlip();
                      onNextCase();
                    }}
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
                  >
                    <span>Avançar para o Próximo Caso ➔</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Carimbo de Veredito com rotação realista */}
      <AnimatePresence>
        {stamped && (
          <motion.div
            key={stamped}
            initial={{ scale: 2.8, opacity: 0, rotate: -25 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
          >
            <div
              className={`stamp px-6 py-2.5 text-[38px] leading-none bg-white/95 backdrop-blur-[2px] shadow-2xl ${
                stamped === 'scam' ? 'text-scam' : 'text-safe'
              }`}
            >
              {stamped === 'scam' ? 'GOLPE!' : 'SEGURO'}
              <div className="text-[10px] tracking-[0.3em] text-center mt-1 font-mono font-bold uppercase">
                {wasCorrect ? 'veredito comprovado' : 'veredito incorreto'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
