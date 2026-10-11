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

const SKILL_ORDER: Skill[] = ['question', 'bank', 'browser', 'verdict'];

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
}

// Convite único e calmo: aparece quando a mensagem termina e o jogador ainda não consultou o Lucas
const LucasNudge = ({
  onOpenNotes,
  tone = 'light',
}: {
  onOpenNotes?: () => void;
  tone?: 'light' | 'dark';
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className={`p-2.5 border-t ${
      tone === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-[#f0f2f5] border-black/10'
    }`}
  >
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpenNotes?.();
      }}
      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-500/40 cursor-pointer active:scale-98 transition text-left"
    >
      <span className="text-lg shrink-0">📌</span>
      <span className="flex-1 min-w-0">
        <span className={`block text-[11px] leading-snug ${tone === 'dark' ? 'text-amber-100' : 'text-amber-900'}`}>
          O Lucas deixou uma dica pra situações assim.
        </span>
        <span className={`block text-xs font-bold ${tone === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>
          Abrir Notas do Lucas
        </span>
      </span>
      <ChevronRight className={`w-4 h-4 shrink-0 ${tone === 'dark' ? 'text-amber-300' : 'text-amber-700'}`} />
    </button>
  </motion.div>
);

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
    className={`hidden sm:flex items-center justify-between px-5 pt-2 pb-1 text-[11px] font-semibold select-none z-20 ${
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
// ============================================================================
// BLOCO DE NOTAS DO CELULAR: ORIENTAÇÕES DO LUCAS (FILHO) & INVESTIGAÇÃO
// ============================================================================
const isBankClue = (clue: InvestigativeClue) => {
  const text = `${clue.question} ${clue.inspection.observation} ${clue.evidenceResult.fato} ${clue.evidenceResult.details}`.toLowerCase();
  return (
    clue.category === 'pix' ||
    clue.inspection.type === 'pix' ||
    text.includes('banco') ||
    text.includes('saldo') ||
    text.includes('pix') ||
    text.includes('extrato') ||
    text.includes('transferência') ||
    text.includes('transferir')
  );
};

const isBrowserClue = (clue: InvestigativeClue) => {
  const text = `${clue.question} ${clue.inspection.observation} ${clue.evidenceResult.fato} ${clue.evidenceResult.details}`.toLowerCase();
  return (
    clue.category === 'whois' ||
    clue.inspection.type === 'link' ||
    text.includes('link') ||
    text.includes('site') ||
    text.includes('domínio') ||
    text.includes('url') ||
    text.includes('http')
  );
};

const NotesScreen = ({
  c,
  inspectedClueIds = [],
  onInspectClue,
  onBack,
  onVerdict,
  stamped,
  onOpenBank,
  onOpenBrowser,
  unlockedSkills = [],
}: {
  c: ScamCase;
  inspectedClueIds: string[];
  onInspectClue?: (clue: InvestigativeClue) => void;
  onBack: () => void;
  onVerdict?: (v: 'scam' | 'safe') => void;
  stamped: Verdict;
  onOpenBank?: () => void;
  onOpenBrowser?: (url?: string) => void;
  unlockedSkills?: Skill[];
}) => {
  // Revelação gradual: uma dica por vez. A próxima só destranca depois de conferir a anterior.
  const isUnlockedAt = (idx: number) => idx === 0 || inspectedClueIds.includes(c.clues[idx - 1]?.id);
  const firstPending = c.clues.find((cl, idx) => isUnlockedAt(idx) && !inspectedClueIds.includes(cl.id));
  const [expandedId, setExpandedId] = useState<string | null>(() => firstPending?.id ?? c.clues[0]?.id ?? null);
  const hasConsulted = inspectedClueIds.length > 0;

  const toggleClue = (clue: InvestigativeClue) => {
    sound.playBlip();
    setExpandedId((prev) => (prev === clue.id ? null : clue.id));
  };

  const checkInPlace = (clue: InvestigativeClue, idx: number) => {
    sound.playBlip();
    onInspectClue?.(clue);
    // Abre automaticamente a próxima dica, mantendo o ritmo calmo
    const next = c.clues[idx + 1];
    if (next) setTimeout(() => setExpandedId(next.id), 900);
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
        <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-100">
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>Notas do Lucas 📌</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
          {inspectedClueIds.length}/{c.clues.length}
        </span>
      </div>

      {/* Habilidades aprendidas (acesas) e por aprender (apagadas) */}
      <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 border-b border-white/5 bg-black/30">
        <span className="text-[9px] font-mono uppercase text-white/40 font-bold mr-0.5">Aprendido:</span>
        {SKILL_ORDER.map((s) => {
          const on = unlockedSkills.includes(s);
          return (
            <span
              key={s}
              title={on ? SKILL_INFO[s].title : 'Ainda não aprendido'}
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-[12px] border transition ${
                on ? 'bg-amber-400/20 border-amber-400/40' : 'bg-white/5 border-white/10 grayscale opacity-40'
              }`}
            >
              {on ? SKILL_INFO[s].icon : '🔒'}
            </span>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar overscroll-contain p-3 space-y-2.5">
        {/* Recado curto do filho */}
        <div className="bg-amber-500/10 border border-amber-400/25 rounded-2xl p-3">
          <p className="text-[11.5px] text-amber-100/90 leading-relaxed">
            <em>&quot;Mãe/pai, se alguém pedir dinheiro ou código, para tudo e confere uma dica de cada vez. Sem pressa. — Lucas&quot;</em>
          </p>
        </div>

        {c.clues.map((clue, idx) => {
          const unlocked = isUnlockedAt(idx);
          const isInspected = inspectedClueIds.includes(clue.id);
          const isExpanded = unlocked && expandedId === clue.id;
          const hasBank = isBankClue(clue);
          const hasBrowser = isBrowserClue(clue);

          if (!unlocked) {
            return (
              <div
                key={clue.id}
                className="rounded-2xl border border-dashed border-white/10 p-2.5 flex items-center gap-2.5 text-white/35"
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] font-medium">Dica #{idx + 1} — confira a anterior para liberar</span>
              </div>
            );
          }

          return (
            <motion.div
              key={clue.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border transition-colors overflow-hidden ${
                isExpanded
                  ? 'bg-black/60 border-amber-400/50 shadow-lg'
                  : isInspected
                  ? 'bg-white/5 border-emerald-500/30'
                  : 'bg-white/5 border-amber-400/30'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleClue(clue)}
                className="w-full text-left p-2.5 flex items-start gap-2.5 cursor-pointer active:scale-98 transition"
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                    isInspected ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-black'
                  }`}
                >
                  {isInspected ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-[9.5px] font-mono text-amber-400 font-bold uppercase">
                    Dica #{idx + 1} {isInspected && <span className="text-emerald-400">• conferida</span>}
                  </span>
                  <p className="text-xs font-semibold text-white leading-snug mt-0.5">{clue.question}</p>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-3 pb-3 pt-1 border-t border-white/10 space-y-2 text-[11px]"
                  >
                    <p className="text-neutral-200 leading-relaxed">
                      <Lightbulb className="w-3 h-3 text-amber-400 inline mr-1 -mt-0.5" />
                      {clue.evidenceResult.headline}
                    </p>

                    {!isInspected ? (
                      // Antes de conferir: só a ferramenta. A resposta não aparece de graça.
                      <div className="space-y-1.5 pt-0.5">
                        {hasBank && onOpenBank && (
                          <button
                            type="button"
                            onClick={() => {
                              onInspectClue?.(clue);
                              onOpenBank();
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-purple-600/40 hover:bg-purple-600/60 border border-purple-500/40 text-purple-100 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Conferir no app do Banco</span>
                          </button>
                        )}
                        {hasBrowser && onOpenBrowser && (
                          <button
                            type="button"
                            onClick={() => {
                              onInspectClue?.(clue);
                              onOpenBrowser();
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-sky-600/40 hover:bg-sky-600/60 border border-sky-500/40 text-sky-100 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>Conferir o link no Navegador</span>
                          </button>
                        )}
                        {!hasBank && !hasBrowser && (
                          <button
                            type="button"
                            onClick={() => checkInPlace(clue, idx)}
                            className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Conferir na conversa</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      // Depois de conferir: o que você encontrou + o fato
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
                        <div className="bg-black/50 p-2 rounded-xl border border-white/10">
                          <span className="text-[9.5px] font-mono uppercase text-emerald-400 font-bold block">
                            🔎 O que você encontrou:
                          </span>
                          <p className="text-white leading-relaxed font-medium">{clue.inspection.observation}</p>
                        </div>
                        <p className="text-amber-200/90 text-[10.5px] leading-relaxed">
                          <span className="font-bold">💡 </span>
                          {clue.evidenceResult.fato}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Veredito: só depois de consultar ao menos uma dica */}
      {!stamped && onVerdict && hasConsulted && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2.5 bg-[#27272a] border-t border-white/10 space-y-1.5"
        >
          <div className="text-[10px] text-center text-neutral-300 font-semibold">Já tem certeza?</div>
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
        </motion.div>
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
  canInvestigate = false,
  canVerdict = false,
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
  canInvestigate?: boolean;
  canVerdict?: boolean;
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
                title="Abrir Notas do Lucas no celular"
              >
                <FileText className="w-3 h-3 text-amber-300" />
                <span>Notas do Lucas ({inspectedClueCount}/{c.clues.length})</span>
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

      {/* Rodapé progressivo: primeiro só o convite do Lucas; perguntas e veredito surgem após consultar as notas */}
      {!stamped && hasFinishedTyping && !canVerdict ? (
        <LucasNudge onOpenNotes={onOpenNotes} />
      ) : !stamped && hasFinishedTyping ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#f0f2f5] p-2 border-t border-black/10 space-y-1.5"
        >
          {canInvestigate && availableActions.length > 0 && !isBlocked && (
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
  canInvestigate = false,
  canVerdict = false,
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
  canInvestigate?: boolean;
  canVerdict?: boolean;
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
            title="Abrir Notas do Lucas no celular"
          >
            <FileText className="w-3 h-3 text-amber-500" />
            <span>Notas do Lucas ({inspectedClueCount}/{c.clues.length})</span>
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

      {!stamped && hasFinishedTyping && !canVerdict ? (
        <LucasNudge onOpenNotes={onOpenNotes} />
      ) : !stamped && hasFinishedTyping ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2 bg-neutral-50 border-t border-black/10 space-y-1.5"
        >
          {canInvestigate && availableActions.length > 0 && (
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
                    Perguntar ➔
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
  canVerdict = false,
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
  canVerdict?: boolean;
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
    sound.playKeypress();
    setTranscriptLines((prev) => [...prev, { sender: 'player', text: act.label }]);
    onPerformAction(act);

    // O atendente processa a resposta e replica com o golpe
    setIsCallerTalking(true);
    setTimeout(() => {
      const reply = act.replyMessage.replace(/^[A-Za-z\s()]+:\s*"?/, '').replace(/"?$/, '').trim();
      setTranscriptLines((prev) => [...prev, { sender: 'caller', text: reply }]);
      sound.playDialogueBlip();
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

        {/* Depois de consultar o Lucas, um atalho discreto para voltar às notas (sem entregar a resposta) */}
        {hasDeliveredTrap && canVerdict && onOpenNotes && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onOpenNotes}
            className="mx-auto flex items-center gap-1.5 py-1.5 px-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-full text-amber-300 text-[10.5px] font-bold cursor-pointer active:scale-95 transition"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Notas do Lucas ({inspectedClueCount}/{c.clues.length})</span>
          </motion.button>
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

        {/* Convite do Lucas: depois que o golpista solta a armadilha e antes de consultar as notas */}
        {!stamped && !canVerdict && (hasDeliveredTrap || callState === 'ended') && onOpenNotes && (
          <button
            type="button"
            onClick={onOpenNotes}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-500/40 cursor-pointer active:scale-98 transition text-left"
          >
            <span className="text-lg shrink-0">📌</span>
            <span className="flex-1 min-w-0">
              <span className="block text-[11px] leading-snug text-amber-100">Pediram algo estranho? O Lucas deixou uma dica.</span>
              <span className="block text-xs font-bold text-amber-300">Abrir Notas do Lucas</span>
            </span>
            <ChevronRight className="w-4 h-4 shrink-0 text-amber-300" />
          </button>
        )}

        {/* Controles de Chamada e Veredito (veredito só após consultar o Lucas) */}
        {!stamped ? (
          <div className={`flex items-center gap-2 pt-0.5 ${canVerdict ? 'justify-between' : 'justify-center'}`}>
            {onVerdict && canVerdict && (
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

            {onVerdict && canVerdict && (
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
  onOpenNotes,
  canInvestigate = false,
  canVerdict = false,
}: {
  c: ScamCase;
  onPerformAction: (action: InteractiveAction) => void;
  executedActionIds: string[];
  actionHistory: { player: string; reply: string }[];
  stamped: Verdict;
  onLinkClick: (url: string) => void;
  onVerdict?: (v: 'scam' | 'safe') => void;
  onOpenNotes?: () => void;
  canInvestigate?: boolean;
  canVerdict?: boolean;
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

      {!stamped && !canVerdict ? (
        <LucasNudge onOpenNotes={onOpenNotes} tone="dark" />
      ) : !stamped && (
        <div className="p-2 bg-black/40 border-t border-white/15 space-y-1.5">
          {canInvestigate && availableActions.length > 0 && (
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
// Selo de cadeado para apps ainda não aprendidos
const LockBadge = () => (
  <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-slate-900 border border-white/30 flex items-center justify-center shadow">
    <Lock className="w-2.5 h-2.5 text-white/80" />
  </span>
);

const HomeScreen = ({
  c,
  onOpenMessaging,
  onOpenNotes,
  onOpenBank,
  onOpenBrowser,
  onToast,
  inspectedClueCount,
  bankLocked = false,
  browserLocked = false,
}: {
  c: ScamCase;
  onOpenMessaging: () => void;
  onOpenNotes: () => void;
  onOpenBank: () => void;
  onOpenBrowser: () => void;
  onToast: (msg: string) => void;
  inspectedClueCount: number;
  bankLocked?: boolean;
  browserLocked?: boolean;
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
          {browserLocked ? <Lock className="w-3.5 h-3.5 text-white/40" /> : <Search className="w-3.5 h-3.5 text-white/50" />}
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
                bankLocked ? 'grayscale opacity-50' : ''
              } ${
                isTargetChannel('bank')
                  ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900 animate-pulse shadow-[0_0_16px_rgba(192,132,252,0.7)]'
                  : ''
              }`}
            >
              <CreditCard className="w-5 h-5" />
              {bankLocked && <LockBadge />}
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
            <div
              className={`relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform ${
                inspectedClueCount === 0 ? 'ring-2 ring-amber-300/70 ring-offset-2 ring-offset-slate-900' : ''
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 px-1 min-w-[18px] h-4.5 rounded-full bg-amber-400 text-black font-mono text-[9.5px] font-extrabold flex items-center justify-center shadow">
                {inspectedClueCount}/{c.clues.length}
              </span>
            </div>
            <span className="text-[9.5px] text-white/80 font-medium">Notas do Lucas</span>
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
            <div
              className={`relative w-11 h-11 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform ${
                browserLocked ? 'grayscale opacity-50' : ''
              }`}
            >
              <Globe className="w-5 h-5 text-sky-600" />
              {browserLocked && <LockBadge />}
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
  unlockedSkills = [],
  onUnlockSkill,
  earnedXp = 0,
}) => {
  const [activeApp, setActiveApp] = useState<'home' | 'messaging' | 'notes' | 'bank' | 'browser'>('home');
  const [previousApp, setPreviousApp] = useState<'home' | 'messaging' | 'notes'>('home');
  const [isLocked, setIsLocked] = useState(true);
  const [isScreenOff, setIsScreenOff] = useState(true);
  const [notificationArrived, setNotificationArrived] = useState(false);
  const [vibrateKey, setVibrateKey] = useState(0);
  const [activeModal, setActiveModal] = useState<'contact' | 'toast' | null>(null);
  const [browserUrl, setBrowserUrl] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [skillToast, setSkillToast] = useState<Skill[] | null>(null);

  // Progressão: o jogador só investiga/decide depois de consultar o Lucas neste caso
  const hasConsultedNotes = inspectedClueIds.length > 0;
  const canInvestigate = hasConsultedNotes && unlockedSkills.includes('question');
  const canVerdict = hasConsultedNotes && unlockedSkills.includes('verdict');
  const bankLocked = !unlockedSkills.includes('bank');
  const browserLocked = !unlockedSkills.includes('browser');

  // Ler/conferir uma dica ensina habilidades novas (persistem entre casos)
  const handleInspectClue = (clue: InvestigativeClue) => {
    onInspectClue?.(clue);
    const gained: Skill[] = ['question', 'verdict'];
    if (isBankClue(clue)) gained.push('bank');
    if (isBrowserClue(clue)) gained.push('browser');
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

  // Ciclo de Vida: toda vez que muda de caso, tela escurece e acende
  useEffect(() => {
    setIsBlocked(false);
    setActiveModal(null);
    setIsLocked(true);
    setActiveApp('home');
    setPreviousApp('home');
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
    setPreviousApp('home');
    onAppOpenChange?.(true);
  };

  const handleOpenNotes = () => {
    sound.playBlip();
    if (activeApp === 'home' || activeApp === 'messaging') {
      setPreviousApp(activeApp);
    }
    setActiveApp('notes');
  };

  // force = aberto a partir de uma dica do Lucas (é assim que se aprende a usar)
  const handleOpenBank = (force = false) => {
    if (bankLocked && !force) {
      showToast('🔒 O Lucas ensina a conferir o banco nas Notas.');
      return;
    }
    sound.playBlip();
    if (activeApp === 'home' || activeApp === 'messaging' || activeApp === 'notes') {
      setPreviousApp(activeApp);
    }
    setActiveApp('bank');
  };

  const handleOpenBrowser = (url?: string, force = false) => {
    if (browserLocked && !force) {
      showToast('🔒 Cuidado com links! Veja nas Notas do Lucas como conferir.');
      return;
    }
    sound.playBlip();
    if (activeApp === 'home' || activeApp === 'messaging' || activeApp === 'notes') {
      setPreviousApp(activeApp);
    }
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
            canInvestigate={canInvestigate}
            canVerdict={canVerdict}
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
            canVerdict={canVerdict}
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
            onOpenNotes={handleOpenNotes}
            canInvestigate={canInvestigate}
            canVerdict={canVerdict}
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
            canInvestigate={canInvestigate}
            canVerdict={canVerdict}
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
      className="relative mx-auto h-full w-full max-w-full sm:w-auto sm:max-h-[720px] sm:aspect-[19/36] flex flex-col"
    >
      {/* Moldura: Apenas no desktop (sm:). No celular real, a tela é nativa sem bordas artificiais */}
      <div className="relative w-full h-full sm:rounded-[50px] sm:bg-[#0c0e14] sm:p-[12px] sm:shadow-[0_0_0_3px_#272b38,0_24px_50px_-10px_rgba(0,0,0,0.9)] sm:border sm:border-white/20 flex flex-col">
        <div className="relative flex-1 h-full w-full rounded-2xl sm:rounded-[40px] overflow-hidden font-phone select-none bg-black flex flex-col shadow-md sm:shadow-none">
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
                  onOpenBank={() => handleOpenBank()}
                  onOpenBrowser={() => handleOpenBrowser()}
                  onToast={showToast}
                  inspectedClueCount={inspectedClueIds.length}
                  bankLocked={bankLocked}
                  browserLocked={browserLocked}
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
                  onVerdict={canVerdict ? onVerdict : undefined}
                  stamped={stamped}
                  onOpenBank={() => handleOpenBank(true)}
                  onOpenBrowser={(url) => handleOpenBrowser(url, true)}
                  unlockedSkills={unlockedSkills}
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

          {/* CARD DE RESULTADO: TUDO DENTRO DO CELULAR (sem cards externos) */}
          <AnimatePresence>
            {stamped && (
              <motion.div
                initial={{ y: 90, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 90, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 320, delay: 0.6 }}
                className="absolute bottom-6 left-2.5 right-2.5 z-40 max-h-[75%] overflow-y-auto overscroll-contain no-scrollbar bg-slate-900/95 border-2 border-white/25 rounded-2xl p-3 shadow-2xl backdrop-blur-xl text-white space-y-2"
              >
                <div className="flex items-center gap-2">
                  {wasCorrect ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <div className="font-bold text-xs flex-1">
                    {wasCorrect
                      ? 'Mandou bem! Você acertou.'
                      : scamCase.isScam
                      ? 'Cuidado! Você caiu no golpe.'
                      : 'Alarme falso! Era seguro.'}
                  </div>
                  {wasCorrect && earnedXp > 0 && (
                    <span className="font-mono font-bold text-[10px] bg-emerald-500/25 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/40 shrink-0">
                      +{earnedXp} XP
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-neutral-200 leading-snug">
                  {scamCase.keyEvidenceReason || scamCase.explanation}
                </p>

                <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/25">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                    📌 Regra de ouro do Lucas
                  </div>
                  <p className="text-[11px] font-semibold text-white leading-snug mt-0.5">
                    {scamCase.pedagogy.goldenRule}
                  </p>
                </div>

                {onNextCase && (
                  <button
                    type="button"
                    onClick={onNextCase}
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
                  >
                    <span>Próximo caso ➔</span>
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
