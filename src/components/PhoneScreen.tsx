import React, { useEffect, useState, useRef } from 'react';
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
  AlertTriangle,
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
  CheckCircle2,
  Lightbulb,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { ScamCase, InteractiveAction, InvestigativeClue } from '../data/scamsData';
import { sound } from '../utils/audio';

type Verdict = 'scam' | 'safe' | null;

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

const StatusBar = ({ time, dark }: { time: string; dark?: boolean }) => (
  <div
    className={`flex items-center justify-between px-5 pt-2 pb-1 text-[11px] font-semibold select-none z-20 ${
      dark ? 'text-white' : 'text-black'
    }`}
  >
    <span>{time}</span>
    <div className="flex items-center gap-1.5">
      <Signal className="w-3 h-3" />
      <Wifi className="w-3 h-3" />
      <BatteryFull className="w-3.5 h-3.5" />
    </div>
  </div>
);

// ============================================================================
// TELA DE BLOQUEIO (LOCKSCREEN ESTILO IOS COM DRAG TO UNLOCK)
// ============================================================================
const LockScreen = ({
  c,
  notificationArrived,
  onUnlock,
  onOpenAppDirectly,
}: {
  c: ScamCase;
  notificationArrived: boolean;
  onUnlock: () => void;
  onOpenAppDirectly: () => void;
}) => {
  const name = cleanName(c.sender);

  const previewText =
    c.messageContent.length > 70
      ? c.messageContent.slice(0, 70) + '...'
      : c.messageContent;

  return (
    <div className="relative flex flex-col h-full bg-gradient-to-b from-[#0b0f19] via-[#111827] to-[#030712] text-white select-none overflow-hidden justify-between p-4">
      {/* Luz ambiente de fundo estilo wallpaper moderno */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/35 via-slate-900/40 to-black pointer-events-none" />

      <StatusBar time={c.time} dark />

      {/* Topo da LockScreen: Ícone de Cadeado & Relógio iOS */}
      <div className="flex flex-col items-center pt-2 z-10">
        <Lock className="w-4 h-4 text-white/70 mb-1" />
        <div className="text-[12px] font-medium text-white/80">Sábado, 10 de outubro</div>
        <div className="text-[52px] font-light leading-none tracking-tight font-display mt-0.5 text-white/95 drop-shadow-md">
          {c.time}
        </div>
      </div>

      {/* Centro: Notificação que Chega com Som de Sino iOS */}
      <div className="flex-1 flex flex-col justify-center my-auto z-10 max-h-[300px]">
        <AnimatePresence>
          {notificationArrived && (
            <motion.div
              initial={{ y: -30, opacity: 0, scale: 0.92 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={onOpenAppDirectly}
              className="bg-slate-900/90 hover:bg-slate-850/95 border border-white/25 rounded-2xl p-3 backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.85)] cursor-pointer active:scale-98 transition group ring-1 ring-white/10"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold shadow ${
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
                    <MessageSquare className="w-3 h-3" />
                  ) : c.channel === 'call' ? (
                    <Phone className="w-3 h-3" />
                  ) : (
                    <Bell className="w-3 h-3" />
                  )}
                </div>
                <span className="font-semibold text-xs text-white truncate">{name}</span>
                <span className="text-[9px] text-white/50 ml-auto font-mono">agora</span>
              </div>

              <p className="text-[12px] text-white/90 leading-tight line-clamp-2">
                {previewText}
              </p>

              <div className="mt-2.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-emerald-300 font-semibold">
                <span className="animate-pulse">
                  {c.channel === 'call'
                    ? '📞 Chamada Recebida • Toque para atender'
                    : '👉 Toque para abrir ou arraste para cima'}
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
// BLOCO DE NOTAS DO CELULAR (APP NATIVO COM AS DÚVIDAS E QUESTIONAMENTOS)
// ============================================================================
const NotesScreen = ({
  c,
  inspectedClueIds = [],
  onInspectClue,
  onBack,
  onVerdict,
  stamped,
}: {
  c: ScamCase;
  inspectedClueIds: string[];
  onInspectClue?: (clue: InvestigativeClue) => void;
  onBack: () => void;
  onVerdict?: (v: 'scam' | 'safe') => void;
  stamped: Verdict;
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleClue = (clue: InvestigativeClue) => {
    sound.playBlip();
    setExpandedId((prev) => (prev === clue.id ? null : clue.id));
    onInspectClue?.(clue);
  };

  return (
    <div className="flex flex-col h-full bg-[#18181b] text-white select-none">
      <StatusBar time={c.time} dark />

      {/* Header do Bloco de Notas */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[#27272a]/90 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
        <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-200">
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>Bloco de Notas</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
          {inspectedClueIds.length}/{c.clues.length} tiradas a limpo
        </span>
      </div>

      {/* Conteúdo com anotações e dúvidas lógicas */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2.5">
        <div className="bg-amber-400/10 border border-amber-400/25 rounded-2xl p-2.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5" /> Questionamentos que Fazem Sentido
          </div>
          <p className="text-[11.5px] text-neutral-300 mt-1 leading-snug font-medium">
            Dúvidas que surgem naturalmente. Toque para checar a prova real no aparelho:
          </p>
        </div>

        {c.clues.map((clue, idx) => {
          const isInspected = inspectedClueIds.includes(clue.id);
          const isExpanded = expandedId === clue.id;

          return (
            <div
              key={clue.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-black/60 border-amber-400/50 shadow-md'
                  : isInspected
                  ? 'bg-white/5 border-emerald-500/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleClue(clue)}
                className="w-full text-left p-2.5 flex items-start gap-2.5 cursor-pointer active:scale-98 transition"
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                    isInspected
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'border border-white/30 text-neutral-400'
                  }`}
                >
                  {isInspected ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9.5px] font-mono text-amber-400 font-bold uppercase">
                      Dúvida #{idx + 1}
                    </span>
                    {isInspected && (
                      <span className="text-[8.5px] font-mono text-emerald-400 bg-emerald-400/15 px-1.5 py-0.2 rounded font-bold">
                        Checado +10 XP
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-white leading-snug mt-0.5">
                    {clue.question}
                  </p>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-3 pb-3 pt-1 border-t border-white/10 space-y-2 bg-black/40 text-[11px]"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[9.5px] font-mono uppercase text-emerald-400 font-bold block">
                        🔎 Prova Real no Aparelho:
                      </span>
                      <p className="text-neutral-200 leading-relaxed font-medium">
                        {clue.inspection.observation}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 text-[10.5px]">
                      <span className="text-amber-400 font-bold">💡 Fato: </span>
                      {clue.evidenceResult.fato}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Decisão direta no Bloco de Notas */}
      {!stamped && onVerdict && (
        <div className="p-2.5 bg-[#27272a] border-t border-white/10 space-y-1.5">
          <div className="text-[9px] font-mono text-center text-neutral-400 uppercase font-bold tracking-wider">
            Com base nessas notas, qual o seu veredito?
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onVerdict('scam')}
              className="py-2.5 px-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>É Golpe!</span>
            </button>
            <button
              type="button"
              onClick={() => onVerdict('safe')}
              className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>É Seguro</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// APP MEU BANCO DIGITAL (INTERAÇÃO REALISTA COM CONTA E SEGURANÇA)
// ============================================================================
const BankScreen = ({
  c,
  onBack,
}: {
  c: ScamCase;
  onBack: () => void;
}) => {
  return (
    <div className="flex flex-col h-full bg-[#1e1035] text-white select-none">
      <StatusBar time={c.time} dark />

      <div className="flex items-center justify-between px-3 py-2 border-b border-purple-800/40 bg-[#2b1055]">
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

      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-2xl p-3 shadow-lg border border-purple-500/30">
          <div className="text-[10px] text-purple-200 font-medium">Conta Digital • Jefferson</div>
          <div className="text-xl font-bold font-mono mt-1">R$ 1.250,00</div>
          <div className="text-[9.5px] text-purple-200/80 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Chave Pix: CPF cadastrado</span>
          </div>
        </div>

        <div className="bg-black/40 border border-purple-500/20 rounded-xl p-2.5 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Alerta Oficial de Proteção
          </div>
          <p className="text-[11px] text-purple-100 leading-relaxed">
            O banco <strong>NUNCA</strong> solicita transferências Pix para &quot;estornar fraudes&quot; e <strong>NUNCA</strong> liga de 0800 pedindo para você confirmar senhas ou clicar em links!
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="text-[10px] font-mono text-purple-300 uppercase font-bold">
            Últimas Movimentações Reais:
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-[11px]">Padaria Central</div>
              <div className="text-[9.5px] text-white/50">Hoje • Cartão de Débito</div>
            </div>
            <span className="font-mono text-[11px] text-neutral-300">- R$ 14,50</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-[11px]">Supermercado</div>
              <div className="text-[9.5px] text-white/50">Ontem • Pix</div>
            </div>
            <span className="font-mono text-[11px] text-neutral-300">- R$ 88,90</span>
          </div>
        </div>
      </div>

      <div className="p-2.5 bg-[#2b1055] border-t border-purple-800/40">
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
// APP NAVEGADOR FORENSE (AUDITORIA DE LINKS POINT & CLICK)
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
  const displayUrl = url || 'https://pesquisa-segura.com.br';
  const isSuspicious = c.isScam;

  return (
    <div className="flex flex-col h-full bg-[#18181b] text-white select-none">
      <StatusBar time={c.time} dark />

      <div className="px-2.5 py-2 border-b border-white/10 bg-[#27272a] space-y-1.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-1 hover:bg-white/10 rounded-full cursor-pointer text-neutral-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 bg-black/60 rounded-full px-3 py-1 flex items-center gap-1.5 text-[11px] border border-white/10 truncate">
            {isSuspicious ? (
              <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
            ) : (
              <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
            )}
            <span className="truncate font-mono text-[10px]">{displayUrl}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3 flex flex-col justify-center items-center text-center">
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
              ? 'O link verificado não pertence ao portal oficial e tenta capturar credenciais ou Pix!'
              : 'O site possui certificado digital válido e pertence aos canais autênticos.'}
          </p>
        </div>

        <div className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-left text-[10.5px] space-y-1">
          <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold block">
            Auditoria de Domínio:
          </span>
          <div className="font-mono text-white text-[11px] break-all">{displayUrl}</div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 bg-white text-black font-bold text-xs rounded-xl shadow-md cursor-pointer active:scale-95 transition"
        >
          ← Fechar Navegador e Voltar
        </button>
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
  onOpenNotes,
  inspectedClueCount,
  onVerdict,
  onBackToHome,
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
  onOpenNotes: () => void;
  inspectedClueCount: number;
  onVerdict?: (v: 'scam' | 'safe') => void;
  onBackToHome: () => void;
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
    sound.playKeypress();
    setIsTypingPlayer(true);
    setTimeout(() => {
      setIsTypingPlayer(false);
      sound.playMessagePing();
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
            {/* Botão de Dúvidas Suspeitas no Topo (só surge após ler a mensagem) */}
            {hasFinishedTyping && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenNotes();
                }}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/25 cursor-pointer active:scale-95 transition shadow-sm"
                title="Abrir Bloco de Notas do celular com dúvidas lógicas"
              >
                <FileText className="w-3 h-3 text-amber-300" />
                <span>Dúvidas ({inspectedClueCount}/{c.clues.length})</span>
              </motion.button>
            )}

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

      {/* Respostas Interativas Clicáveis do Jogador + Veredito (Somente após ler a mensagem!) */}
      {!stamped && hasFinishedTyping ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#f0f2f5] p-2 border-t border-black/10 space-y-1.5"
        >
          {availableActions.length > 0 && !isBlocked && (
            <>
              <div className="text-[10px] font-mono text-[#54656f] uppercase tracking-wider font-bold px-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#008069]" /> Responder no WhatsApp:
              </div>
              <div className="space-y-1 max-h-28 overflow-y-auto pr-0.5">
                {availableActions.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(act);
                    }}
                    className="w-full text-left bg-white hover:bg-emerald-50 border border-emerald-300 text-[#008069] rounded-lg px-2 py-1.5 text-xs font-semibold shadow-sm transition active:scale-98 cursor-pointer flex items-center justify-between gap-1.5"
                  >
                    <span className="text-[11px] leading-[1.25] font-medium line-clamp-2">{act.label}</span>
                    <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded shrink-0 font-bold">
                      Enviar ➔
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Botões de Veredito Imediato no WhatsApp */}
          {onVerdict && (
            <div className="pt-1 border-t border-black/5 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onVerdict('scam');
                }}
                className="flex-1 py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-lg shadow cursor-pointer active:scale-95 transition flex items-center justify-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>🚨 É Golpe!</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onVerdict('safe');
                }}
                className="flex-1 py-1.5 px-2 bg-[#008069] hover:bg-[#006a57] text-white font-bold text-[11px] rounded-lg shadow cursor-pointer active:scale-95 transition flex items-center justify-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>✅ É Seguro</span>
              </button>
            </div>
          )}
        </motion.div>
      ) : !hasFinishedTyping ? (
        <div className="bg-[#f0f2f5] px-3 py-2 border-t border-black/5 text-center">
          <span className="text-[10px] text-neutral-500 font-medium italic animate-pulse">
            Lendo conversa... (Toque no chat para acelerar)
          </span>
        </div>
      ) : (
        <div className="bg-[#f0f2f5] px-2 py-2 flex items-center gap-2 border-t border-black/5">
          <div className="flex-1 bg-white rounded-full px-4 py-2 text-[13px] text-[#8696a0] shadow-sm flex items-center justify-between">
            <span>{isBlocked ? 'Contato bloqueado' : 'Mensagem'}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-sm cursor-pointer active:scale-90 transition">
            <Mic className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
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
  onOpenNotes,
  inspectedClueCount,
  onVerdict,
  onBackToHome,
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
  onOpenNotes: () => void;
  inspectedClueCount: number;
  onVerdict?: (v: 'scam' | 'safe') => void;
  onBackToHome: () => void;
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

        {hasFinishedTyping && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenNotes();
            }}
            className="flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 text-[#007aff] text-[10px] font-bold px-2 py-1 rounded-full border border-neutral-300 cursor-pointer active:scale-95 transition shadow-sm"
            title="Abrir Bloco de Notas com dúvidas lógicas"
          >
            <FileText className="w-3 h-3 text-amber-500" />
            <span>Dúvidas ({inspectedClueCount}/{c.clues.length})</span>
          </motion.button>
        )}
      </div>

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

      {!stamped && hasFinishedTyping ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2 bg-neutral-50 border-t border-black/10 space-y-1.5"
        >
          {availableActions.length > 0 && (
            <div className="space-y-1 max-h-28 overflow-y-auto pr-0.5">
              {availableActions.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playBlip();
                    onPerformAction(act);
                  }}
                  className="w-full text-left bg-white hover:bg-blue-50 border border-blue-200 text-[#007aff] rounded-lg px-2 py-1.5 text-xs font-semibold shadow-sm transition cursor-pointer flex items-center justify-between gap-1.5"
                >
                  <span className="text-[11px] leading-[1.25] font-medium line-clamp-2">{act.label}</span>
                  <span className="text-[9px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded shrink-0 font-bold">
                    Auditar ➔
                  </span>
                </button>
              ))}
            </div>
          )}

          {onVerdict && (
            <div className="pt-1 border-t border-black/5 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onVerdict('scam');
                }}
                className="flex-1 py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-lg shadow cursor-pointer active:scale-95 transition flex items-center justify-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>🚨 É Golpe!</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onVerdict('safe');
                }}
                className="flex-1 py-1.5 px-2 bg-[#007aff] hover:bg-blue-600 text-white font-bold text-[11px] rounded-lg shadow cursor-pointer active:scale-95 transition flex items-center justify-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>✅ É Seguro</span>
              </button>
            </div>
          )}
        </motion.div>
      ) : !hasFinishedTyping ? (
        <div className="p-2 bg-neutral-50 border-t border-black/10 text-center">
          <span className="text-[10px] text-neutral-500 font-medium italic animate-pulse">
            Recebendo SMS... (Toque para acelerar)
          </span>
        </div>
      ) : null}
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
  stamped,
  onHangup,
  onVerdict,
  onOpenNotes,
  inspectedClueCount = 0,
  onBackToHome,
  onStoryDeliveredChange,
}: {
  c: ScamCase;
  onPerformAction: (action: InteractiveAction) => void;
  executedActionIds: string[];
  actionHistory: { player: string; reply: string }[];
  stamped: Verdict;
  onHangup: () => void;
  onVerdict?: (v: 'scam' | 'safe') => void;
  onOpenNotes?: () => void;
  inspectedClueCount?: number;
  onBackToHome?: () => void;
  onStoryDeliveredChange?: (delivered: boolean) => void;
}) => {
  const number = findContactNumber(c);
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [callSeconds, setCallSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [transcriptLines, setTranscriptLines] = useState<{ sender: 'caller' | 'player'; text: string }[]>([]);
  const [hasDeliveredTrap, setHasDeliveredTrap] = useState(false);

  const onStoryDeliveredChangeRef = useRef(onStoryDeliveredChange);
  onStoryDeliveredChangeRef.current = onStoryDeliveredChange;

  // Extrai a fala inicial do atendente
  const rawCallerSpeech = (() => {
    const lines = c.messageContent.split(/\n+/).filter(Boolean);
    const speech = lines.find((l) => /atendente|central|olá|identificamos|falo com/i.test(l)) || lines[0] || c.messageContent;
    return speech.replace(/^[A-Za-z\s()]+:\s*"?/, '').replace(/"?$/, '').trim();
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

  // Limpeza de síntese de voz ao desmontar
  useEffect(() => {
    return () => {
      sound.stopSpeaking();
    };
  }, []);

  // Atender chamada
  const handleAnswerCall = () => {
    sound.playCallPickup();
    setCallState('connected');
    setCallSeconds(1);

    const firstSpeech = rawCallerSpeech;
    setTranscriptLines([{ sender: 'caller', text: firstSpeech }]);
    setIsSpeaking(true);

    if (!voiceMuted) {
      sound.speakScammer(firstSpeech, () => {
        setIsSpeaking(false);
      });
    } else {
      setTimeout(() => setIsSpeaking(false), 2000);
    }
  };

  // Desligar chamada
  const handleEndCall = () => {
    sound.stopSpeaking();
    sound.playCallHangup();
    setCallState('ended');
    setIsSpeaking(false);
    onHangup();
  };

  // Alternar voz mudo
  const handleToggleVoiceMute = () => {
    if (!voiceMuted) {
      sound.stopSpeaking();
      setIsSpeaking(false);
      setVoiceMuted(true);
    } else {
      setVoiceMuted(false);
    }
  };

  // Ações de diálogo do jogador
  const availableActions = (c.interactiveActions || []).filter(
    (act) => !executedActionIds.includes(act.id),
  );

  const handlePlayerReply = (act: InteractiveAction) => {
    sound.playKeypress();
    setTranscriptLines((prev) => [...prev, { sender: 'player', text: act.label }]);
    onPerformAction(act);

    setIsSpeaking(true);
    setTimeout(() => {
      const reply = act.replyMessage.replace(/^[A-Za-z\s()]+:\s*"?/, '').replace(/"?$/, '').trim();
      setTranscriptLines((prev) => [...prev, { sender: 'caller', text: reply }]);

      // Armadilha entregue!
      setHasDeliveredTrap(true);
      onStoryDeliveredChangeRef.current?.(true);

      if (!voiceMuted) {
        sound.speakScammer(reply, () => {
          setIsSpeaking(false);
        });
      } else {
        setTimeout(() => setIsSpeaking(false), 2200);
      }
    }, 450);
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
          <AudioWaveform active={isSpeaking} />
          <button
            type="button"
            onClick={handleToggleVoiceMute}
            className={`p-1.5 rounded-full border cursor-pointer active:scale-90 transition ${
              voiceMuted
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-white/10 border-white/20 text-emerald-400'
            }`}
            title={voiceMuted ? 'Voz desativada (Clique para ligar voz)' : 'Voz ativa (Clique para mutar)'}
          >
            {voiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
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
          {isSpeaking && (
            <span className="text-emerald-400 font-bold animate-pulse font-mono">
              Falando agora... 🎙️
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

        {/* CARD DA VIRADA NARRATIVA (SURGE QUANDO O GOLPISTA SOLTA A ARMADILHA DO PIX) */}
        {hasDeliveredTrap && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900/80 to-amber-950/60 border-2 border-amber-500/50 shadow-xl space-y-2"
          >
            <div className="flex items-center gap-1.5 text-amber-300 font-display font-bold text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>O Momento da Virada: Repare no Golpe!</span>
            </div>
            <p className="text-[11px] text-neutral-200 leading-relaxed font-medium">
              O atendente acabou de exigir que você faça um Pix para uma suposta &quot;Conta de Segurança&quot;. <strong>O banco NUNCA pede transferências Pix de clientes para cancelar ou estornar transações!</strong>
            </p>
            {onOpenNotes && (
              <button
                type="button"
                onClick={onOpenNotes}
                className="w-full py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl text-amber-300 text-[10.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Consultar Dúvidas Forenses no Bloco de Notas ({inspectedClueCount}/{c.clues.length})</span>
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Rodapé: Respostas Interativas do Jogador + Botão de Desligar + Veredito */}
      <div className="p-2.5 bg-slate-900/80 border-t border-white/10 space-y-2">
        {/* Escolhas de Diálogo do Jogador (se a armadilha ainda não foi concluída) */}
        {callState === 'connected' && availableActions.length > 0 && !hasDeliveredTrap && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-white/60 uppercase font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Escolha sua fala na chamada:
            </span>
            <div className="space-y-1 max-h-28 overflow-y-auto pr-0.5">
              {availableActions.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => handlePlayerReply(act)}
                  className="w-full text-left bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center justify-between gap-1.5 active:scale-98"
                >
                  <span className="text-[11px] leading-snug line-clamp-2">{act.label}</span>
                  <span className="text-[9px] font-mono bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded shrink-0 font-bold">
                    Falar ➔
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Controles de Chamada e Veredito (Disponíveis após ouvir a abordagem) */}
        {!stamped ? (
          <div className="flex items-center justify-between gap-2 pt-0.5">
            {onVerdict && (
              <button
                type="button"
                onClick={() => onVerdict('safe')}
                className="flex-1 py-2 px-2 bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl shadow cursor-pointer active:scale-95 transition flex items-center justify-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>É Seguro</span>
              </button>
            )}

            {/* Botão de Desligar */}
            {callState === 'connected' ? (
              <button
                type="button"
                onClick={handleEndCall}
                className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg shadow-red-500/30 cursor-pointer active:scale-90 transition shrink-0"
                title="Desligar na cara do golpista"
              >
                <PhoneOff className="w-5 h-5 text-white" />
              </button>
            ) : (
              <div className="text-[10px] font-mono text-red-400 font-bold bg-red-500/15 px-2.5 py-1 rounded-lg border border-red-500/25">
                Desligado
              </div>
            )}

            {onVerdict && (
              <button
                type="button"
                onClick={() => onVerdict('scam')}
                className="flex-1 py-2 px-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-xl shadow cursor-pointer active:scale-95 transition flex items-center justify-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>🚨 É Golpe!</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-1.5 text-xs font-bold text-white/90 bg-white/10 rounded-xl">
            {stamped === 'scam' ? '🚨 Veredito emitido: É GOLPE!' : '✅ Veredito emitido: É SEGURO'}
          </div>
        )}
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
  onVerdict,
}: {
  c: ScamCase;
  onPerformAction: (action: InteractiveAction) => void;
  executedActionIds: string[];
  actionHistory: { player: string; reply: string }[];
  stamped: Verdict;
  onLinkClick: (url: string) => void;
  onVerdict?: (v: 'scam' | 'safe') => void;
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
        <div className="p-2 bg-black/40 border-t border-white/15 space-y-1.5">
          {availableActions.length > 0 && (
            <div className="space-y-1 max-h-24 overflow-y-auto pr-0.5">
              {availableActions.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => {
                    sound.playBlip();
                    onPerformAction(act);
                  }}
                  className="w-full text-left bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-lg px-2 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center justify-between gap-1.5"
                >
                  <span className="text-[11px] leading-[1.25] font-medium line-clamp-2">{act.label}</span>
                  <span className="text-[9px] font-mono bg-purple-500 text-white px-1.5 py-0.5 rounded shrink-0 font-bold">
                    Checar ➔
                  </span>
                </button>
              ))}
            </div>
          )}

          {onVerdict && (
            <div className="pt-1 border-t border-white/10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onVerdict('scam')}
                className="flex-1 py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-lg shadow cursor-pointer active:scale-95 transition flex items-center justify-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>🚨 É Golpe!</span>
              </button>
              <button
                type="button"
                onClick={() => onVerdict('safe')}
                className="flex-1 py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] rounded-lg shadow cursor-pointer active:scale-95 transition flex items-center justify-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>✅ É Seguro</span>
              </button>
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
const HomeScreen = ({
  c,
  onOpenMessaging,
  onOpenNotes,
  onOpenBank,
  onOpenBrowser,
  onToast,
  inspectedClueCount,
}: {
  c: ScamCase;
  onOpenMessaging: () => void;
  onOpenNotes: () => void;
  onOpenBank: () => void;
  onOpenBrowser: () => void;
  onToast: (msg: string) => void;
  inspectedClueCount: number;
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

      <StatusBar time={c.time} dark />

      {/* Banner de Notificação no Topo da HomeScreen */}
      <div
        onClick={onOpenMessaging}
        className="mx-3 mt-1.5 bg-slate-900/95 border border-emerald-400/50 rounded-2xl p-2.5 backdrop-blur-xl shadow-lg cursor-pointer active:scale-98 transition flex items-center gap-2 group ring-1 ring-emerald-400/30"
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
          <div className="text-[11.5px] font-bold text-white truncate flex items-center gap-1.5">
            <span>{cleanName(c.sender)}</span>
            <span className="text-[9px] text-emerald-400 font-normal animate-pulse">
              {c.channel === 'call' ? '• Chamada tocando' : '• Nova mensagem'}
            </span>
          </div>
          <div className="text-[10.5px] text-white/70 truncate">
            {c.channel === 'call' ? 'Toque para atender a ligação telefônica' : c.messageContent}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-white/60 group-hover:translate-x-0.5 transition" />
      </div>

      {/* CONTEÚDO DA TELA INICIAL */}
      <div className="flex-1 flex flex-col justify-between p-3.5 z-10 pt-2">
        {/* Widget de Relógio & Clima */}
        <div className="flex flex-col items-center text-center pt-1">
          <div className="text-[44px] font-bold leading-none tracking-tight font-display text-white/95">
            {c.time}
          </div>
          <div className="text-[11px] text-white/70 font-medium flex items-center gap-1.5 mt-1">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Sábado, 10 de out • 26°C Ensolarado</span>
          </div>
        </div>

        {/* Barra de Pesquisa Estilo Google */}
        <div
          onClick={onOpenBrowser}
          className="w-full bg-white/10 hover:bg-white/15 border border-white/15 rounded-full py-1.5 px-3 flex items-center justify-between text-white/60 text-xs backdrop-blur-md transition mt-1 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-sky-400">G</span>
            <span className="text-[10.5px] text-white/50">Pesquisar ou digitar link...</span>
          </div>
          <Search className="w-3.5 h-3.5 text-white/50" />
        </div>

        {/* Grid de Apps com o Aplicativo Alvo em Destaque Especial */}
        <div className="grid grid-cols-4 gap-y-3.5 gap-x-2 my-auto px-0.5">
          {/* 1. WhatsApp */}
          <div
            onClick={onOpenMessaging}
            className="flex flex-col items-center gap-1 group cursor-pointer relative"
          >
            <div
              className={`relative w-11 h-11 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all ${
                isTargetChannel('whatsapp')
                  ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 animate-pulse shadow-[0_0_16px_rgba(52,211,153,0.7)]'
                  : ''
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              {isTargetChannel('whatsapp') && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-500 text-white font-mono text-[9.5px] font-bold flex items-center justify-center animate-bounce shadow">
                  1
                </span>
              )}
            </div>
            <span className="text-[9.5px] text-white/80 font-medium">WhatsApp</span>
          </div>

          {/* 2. Mensagens SMS */}
          <div
            onClick={onOpenMessaging}
            className="flex flex-col items-center gap-1 group cursor-pointer relative"
          >
            <div
              className={`relative w-11 h-11 rounded-2xl bg-[#007aff] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all ${
                isTargetChannel('sms')
                  ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 animate-pulse shadow-[0_0_16px_rgba(96,165,250,0.7)]'
                  : ''
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              {isTargetChannel('sms') && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-500 text-white font-mono text-[9.5px] font-bold flex items-center justify-center animate-bounce shadow">
                  1
                </span>
              )}
            </div>
            <span className="text-[9.5px] text-white/80 font-medium">Mensagens</span>
          </div>

          {/* 3. Meu Banco */}
          <div
            onClick={onOpenBank}
            className="flex flex-col items-center gap-1 group cursor-pointer relative"
          >
            <div
              className={`relative w-11 h-11 rounded-2xl bg-[#820ad1] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all ${
                isTargetChannel('bank')
                  ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900 animate-pulse shadow-[0_0_16px_rgba(192,132,252,0.7)]'
                  : ''
              }`}
            >
              <CreditCard className="w-5 h-5" />
              {isTargetChannel('bank') && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-500 text-white font-mono text-[9.5px] font-bold flex items-center justify-center animate-bounce shadow">
                  1
                </span>
              )}
            </div>
            <span className="text-[9.5px] text-white/80 font-medium">Meu Banco</span>
          </div>

          {/* 4. BLOCO DE NOTAS (Dúvidas & Pistas) */}
          <div
            onClick={onOpenNotes}
            className="flex flex-col items-center gap-1 group cursor-pointer relative"
          >
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 px-1 min-w-[18px] h-4.5 rounded-full bg-amber-400 text-black font-mono text-[9.5px] font-extrabold flex items-center justify-center shadow">
                {inspectedClueCount}/{c.clues.length}
              </span>
            </div>
            <span className="text-[9.5px] text-white/80 font-medium">Notas</span>
          </div>

          {/* 5. Música */}
          <div
            onClick={() => onToast('🎵 Tocando música favorita em segundo plano.')}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#1db954] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Music className="w-5 h-5" />
            </div>
            <span className="text-[9.5px] text-white/80 font-medium">Música</span>
          </div>

          {/* 6. Internet */}
          <div
            onClick={onOpenBrowser}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5 text-sky-600" />
            </div>
            <span className="text-[9.5px] text-white/80 font-medium">Internet</span>
          </div>

          {/* 7. Galeria */}
          <div
            onClick={() => onToast('📸 Fotos salvas protegidas no aparelho.')}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[9.5px] text-white/80 font-medium">Galeria</span>
          </div>

          {/* 8. Telefone */}
          <div
            onClick={onOpenMessaging}
            className="flex flex-col items-center gap-1 group cursor-pointer relative"
          >
            <div
              className={`relative w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all ${
                isTargetChannel('call')
                  ? 'ring-2 ring-emerald-300 ring-offset-2 ring-offset-slate-900 animate-pulse shadow-[0_0_16px_rgba(52,211,153,0.7)]'
                  : ''
              }`}
            >
              <Phone className="w-5 h-5" />
              {isTargetChannel('call') && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-500 text-white font-mono text-[9.5px] font-bold flex items-center justify-center animate-bounce shadow">
                  !
                </span>
              )}
            </div>
            <span className="text-[9.5px] text-white/80 font-medium">Telefone</span>
          </div>
        </div>

        {/* Rodapé da Tela Inicial */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenMessaging}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-center text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition"
          >
            <span className="flex items-center gap-1.5 text-emerald-300 animate-pulse font-bold">
              👉 Toque no app com notificação para abrir
            </span>
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
}) => {
  const [activeApp, setActiveApp] = useState<'home' | 'messaging' | 'notes' | 'bank' | 'browser'>('home');
  const [isLocked, setIsLocked] = useState(true);
  const [isScreenOff, setIsScreenOff] = useState(true);
  const [notificationArrived, setNotificationArrived] = useState(false);
  const [vibrateKey, setVibrateKey] = useState(0);
  const [activeModal, setActiveModal] = useState<'contact' | 'toast' | null>(null);
  const [browserUrl, setBrowserUrl] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState(false);

  const onAppOpenChangeRef = useRef(onAppOpenChange);
  onAppOpenChangeRef.current = onAppOpenChange;

  const onStoryDeliveredChangeRef = useRef(onStoryDeliveredChange);
  onStoryDeliveredChangeRef.current = onStoryDeliveredChange;

  // Ciclo de Vida: toda vez que muda de caso, tela escurece e acende
  useEffect(() => {
    setIsBlocked(false);
    setActiveModal(null);
    setIsLocked(true);
    setActiveApp('home');
    setNotificationArrived(false);
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

    // 3. Notificação chega na LockScreen com som de sino iOS e vibração
    const notifTimer = setTimeout(() => {
      setNotificationArrived(true);
      sound.playPhoneVibrate();
      if (scamCase.channel === 'call') {
        sound.playPhoneRingtone();
      } else {
        sound.playIOSBellChime();
      }
    }, 1100);

    return () => {
      clearTimeout(wakeTimer);
      clearTimeout(notifTimer);
    };
  }, [scamCase.id, scamCase.channel]);

  useEffect(() => {
    if (stamped) {
      sound.playStampThud();
      setIsLocked(false);
      setActiveApp('messaging');
      onAppOpenChangeRef.current?.(true);
    }
  }, [stamped]);

  const handleUnlockToHome = () => {
    sound.playBlip();
    setIsLocked(false);
    setActiveApp('home');
  };

  const handleOpenAppDirectly = () => {
    sound.playKeypress();
    setIsLocked(false);
    setActiveApp('messaging');
    onAppOpenChange?.(true);
  };

  const handleOpenNotes = () => {
    sound.playBlip();
    setActiveApp('notes');
  };

  const handleOpenBank = () => {
    sound.playBlip();
    setActiveApp('bank');
  };

  const handleOpenBrowser = (url?: string) => {
    sound.playBlip();
    setBrowserUrl(url || 'https://pesquisa-segura.com.br');
    setActiveApp('browser');
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
            onOpenNotes={handleOpenNotes}
            inspectedClueCount={inspectedClueIds.length}
            onVerdict={onVerdict}
            onBackToHome={() => setActiveApp('home')}
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
            stamped={stamped}
            onHangup={handleHangup}
            onVerdict={onVerdict}
            onOpenNotes={handleOpenNotes}
            inspectedClueCount={inspectedClueIds.length}
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
            onVerdict={onVerdict}
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
            onOpenNotes={handleOpenNotes}
            inspectedClueCount={inspectedClueIds.length}
            onVerdict={onVerdict}
            onBackToHome={() => setActiveApp('home')}
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
      className="relative mx-auto w-full max-w-[340px] sm:max-w-[370px]"
    >
      {/* Moldura Realista do Celular */}
      <div className="relative rounded-[44px] sm:rounded-[50px] bg-[#0c0e14] p-[9px] sm:p-[12px] shadow-[0_0_0_3px_#272b38,0_24px_50px_-10px_rgba(0,0,0,0.9)] border border-white/20">
        <div className="relative h-[580px] sm:h-[650px] rounded-[34px] sm:rounded-[40px] overflow-hidden font-phone select-none bg-black">
          {/* EFEITO DE TELA APAGADA / TRANSIÇÃO OLED */}
          <AnimatePresence>
            {isScreenOff && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 z-50 bg-black flex items-center justify-center pointer-events-none"
              >
                <div className="w-16 h-1 rounded-full bg-neutral-800/60" />
              </motion.div>
            )}
          </AnimatePresence>

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
                  notificationArrived={notificationArrived}
                  onUnlock={handleUnlockToHome}
                  onOpenAppDirectly={handleOpenAppDirectly}
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
                  onOpenMessaging={handleOpenAppDirectly}
                  onOpenNotes={handleOpenNotes}
                  onOpenBank={handleOpenBank}
                  onOpenBrowser={() => handleOpenBrowser()}
                  onToast={showToast}
                  inspectedClueCount={inspectedClueIds.length}
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
                  onInspectClue={onInspectClue}
                  onBack={() => setActiveApp('messaging')}
                  onVerdict={onVerdict}
                  stamped={stamped}
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
                  onBack={() => setActiveApp('home')}
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
                  onBack={() => setActiveApp('messaging')}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notch Dinâmico no Topo do Celular */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[82px] h-[19px] rounded-full bg-black flex items-center justify-between px-3 z-30 shadow-md border border-white/10 pointer-events-none">
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

          {/* CARD DE VEREDITO E FEEDBACK EMBUTIDO NO CELULAR */}
          <AnimatePresence>
            {stamped && (
              <motion.div
                initial={{ y: 90, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 90, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 320 }}
                className="absolute bottom-6 left-2.5 right-2.5 z-40 bg-slate-900/95 border-2 border-white/30 rounded-2xl p-3 shadow-2xl backdrop-blur-xl text-white space-y-2"
              >
                <div className="flex items-center gap-2">
                  {wasCorrect ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <div className="font-bold text-xs">
                    {wasCorrect
                      ? 'Parabéns! Você acertou o veredito!'
                      : scamCase.isScam
                      ? 'Atenção! Você caiu no golpe.'
                      : 'Alarme falso! A mensagem era segura.'}
                  </div>
                </div>

                <p className="text-[11px] text-neutral-200 leading-snug line-clamp-3">
                  {scamCase.keyEvidenceReason || scamCase.explanation}
                </p>

                {onNextCase && (
                  <button
                    type="button"
                    onClick={onNextCase}
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
                  >
                    <span>👉 Bora pro Próximo Caso ➔</span>
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
