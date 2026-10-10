import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Lock,
  PhoneOff,
  Signal,
  Wifi,
  BatteryFull,
  ChevronLeft,
  Info,
  Mic,
  Volume2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Globe,
  UserX,
  X,
} from 'lucide-react';
import type { ScamCase, InteractiveAction } from '../data/scamsData';
import { sound } from '../utils/audio';

type Verdict = 'scam' | 'safe' | null;

interface PhoneScreenProps {
  scamCase: ScamCase;
  stamped: Verdict;
  wasCorrect: boolean | null;
  onPerformAction: (action: InteractiveAction) => void;
  executedActionIds: string[];
  actionHistory: { player: string; reply: string }[];
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
    className={`flex items-center justify-between px-5 pt-2 pb-1 text-[11px] font-semibold ${
      dark ? 'text-white' : 'text-black'
    }`}
  >
    <span>{time}</span>
    <div className="flex items-center gap-1">
      <Signal className="w-3 h-3" />
      <Wifi className="w-3 h-3" />
      <BatteryFull className="w-3.5 h-3.5" />
    </div>
  </div>
);

// ---------- WhatsApp Interativo Point & Click ----------
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
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const number = findContactNumber(c);
  const name = cleanName(c.sender);
  const unknown = /desconhecid|n[uú]mero novo/i.test(c.sender);

  const availableActions = (c.interactiveActions || []).filter(
    (act) => !executedActionIds.includes(act.id),
  );

  const handleActionClick = (action: InteractiveAction) => {
    sound.playKeypress();
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
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
    <div className="flex flex-col h-full select-none">
      {/* Cabeçalho Clicável do WhatsApp */}
      <div className="bg-[#008069] text-white">
        <StatusBar time={c.time} dark />
        <div className="flex items-center gap-1.5 px-2 pb-2 pt-1">
          <button
            type="button"
            onClick={onContactClick}
            className="flex items-center gap-1.5 flex-1 min-w-0 text-left cursor-pointer hover:opacity-90 active:scale-98 transition-transform"
            title="Clique para ver o perfil do contato"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
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
                {isTyping ? (
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

          <div className="flex items-center gap-2 text-white/90 shrink-0">
            <button
              type="button"
              onClick={onCallClick}
              className="p-1 hover:bg-white/10 rounded-full cursor-pointer active:scale-90 transition-transform"
              title="Fazer chamada"
            >
              <Video className="w-3.5 h-3.5 opacity-90" />
            </button>
            <button
              type="button"
              onClick={onCallClick}
              className="p-1 hover:bg-white/10 rounded-full cursor-pointer active:scale-90 transition-transform"
              title="Ligar"
            >
              <Phone className="w-3.5 h-3.5 opacity-90" />
            </button>
            <button
              type="button"
              onClick={onContactClick}
              className="p-1 hover:bg-white/10 rounded-full cursor-pointer active:scale-90 transition-transform"
              title="Mais opções"
            >
              <MoreVertical className="w-3.5 h-3.5 opacity-90" />
            </button>
          </div>
        </div>
      </div>

      {/* Área da Conversa */}
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
                onClick={onBlockContact}
                className="hover:underline cursor-pointer text-red-600 font-bold active:scale-95 transition-transform"
              >
                Bloquear
              </button>
              <button
                type="button"
                onClick={onContactClick}
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

        {/* Mensagens do Contato */}
        {c.messageContent.split(/\n\n+/).map((para, i) => (
          <div
            key={i}
            className="relative bg-white text-[#111b21] text-[13px] leading-[17px] rounded-lg rounded-tl-none px-2.5 pt-1.5 pb-3.5 max-w-[88%] shadow-[0_1px_1px_rgba(11,20,26,0.15)] whitespace-pre-wrap group hover:ring-1 hover:ring-emerald-400/40 transition"
          >
            {renderMessageContent(para)}
            <span className="absolute right-1.5 bottom-0.5 text-[9.5px] text-[#667781] font-mono">
              {c.time}
            </span>
          </div>
        ))}

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

        {isTyping && (
          <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 w-fit shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.3s]" />
          </div>
        )}
      </div>

      {/* Respostas Interativas Clicáveis do Jogador */}
      {!stamped && availableActions.length > 0 && !isBlocked ? (
        <div className="bg-[#f0f2f5] p-2 border-t border-black/10 space-y-1">
          <div className="text-[10px] font-mono text-[#54656f] uppercase tracking-wider font-bold px-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#008069]" /> Responder no WhatsApp:
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
            {availableActions.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => handleActionClick(act)}
                className="w-full text-left bg-white hover:bg-emerald-50 border border-emerald-300 text-[#008069] rounded-lg px-2 py-1.5 text-xs font-semibold shadow-sm transition active:scale-98 cursor-pointer flex items-center justify-between gap-1.5"
              >
                <span className="text-[11px] leading-[1.25] font-medium line-clamp-2">{act.label}</span>
                <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded shrink-0 font-bold">
                  Enviar ➔
                </span>
              </button>
            ))}
          </div>
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

// ---------- SMS Interativo Point & Click ----------
const SmsScreen = ({
  c,
  flagged,
  onPerformAction,
  executedActionIds,
  actionHistory,
  stamped,
  onLinkClick,
  onContactClick,
}: {
  c: ScamCase;
  flagged: boolean;
  onPerformAction: (action: InteractiveAction) => void;
  executedActionIds: string[];
  actionHistory: { player: string; reply: string }[];
  stamped: Verdict;
  onLinkClick: (url: string) => void;
  onContactClick: () => void;
}) => {
  const number = findContactNumber(c);
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
    <div className="flex flex-col h-full bg-white select-none">
      <StatusBar time={c.time} />
      <div className="flex flex-col items-center pb-2 pt-1 border-b border-black/10 relative">
        <button
          type="button"
          onClick={onContactClick}
          className="absolute left-2.5 top-2.5 p-1 text-[#007aff] cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onContactClick}
          className="flex flex-col items-center cursor-pointer hover:opacity-90 active:scale-95 transition-transform"
          title="Clique para ver o contato"
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-10 h-10 rounded-full bg-gradient-to-b from-[#a5abb8] to-[#858994] flex items-center justify-center text-white font-semibold text-base shadow-sm"
          >
            {c.sender.charAt(0)}
          </motion.div>
          <div className="text-[11.5px] text-black mt-1 flex items-center gap-0.5 font-medium truncate max-w-[200px]">
            {number ?? c.sender} <span className="text-[#8e8e93]">›</span>
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-2.5 py-2.5 space-y-2">
        <div className="text-center text-[10px] text-[#8e8e93] font-mono">
          Mensagem de Texto • SMS
          <br />
          Hoje {c.time}
        </div>
        <div className="bg-[#e9e9eb] text-black text-[13.5px] leading-[18px] rounded-[16px] rounded-bl-[4px] px-3 py-2 max-w-[88%] whitespace-pre-wrap shadow-sm">
          {renderMessageContent(c.messageContent)}
        </div>

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

      {!stamped && availableActions.length > 0 && (
        <div className="p-2 bg-neutral-50 border-t border-black/10 space-y-1">
          <div className="text-[9.5px] font-mono uppercase text-neutral-500 font-bold">
            Auditar no Celular:
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
            {availableActions.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => {
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
        </div>
      )}
    </div>
  );
};

// ---------- Chamada Telefônica Interativa ----------
const CallScreen = ({
  c,
  onPerformAction,
  executedActionIds,
  actionHistory,
  stamped,
  onHangup,
}: {
  c: ScamCase;
  onPerformAction: (action: InteractiveAction) => void;
  executedActionIds: string[];
  actionHistory: { player: string; reply: string }[];
  stamped: Verdict;
  onHangup: () => void;
}) => {
  const number = findContactNumber(c);
  const availableActions = (c.interactiveActions || []).filter(
    (act) => !executedActionIds.includes(act.id),
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#1c1c1e] via-[#000000] to-[#1c1c1e] text-white select-none">
      <StatusBar time={c.time} dark />

      <div className="flex flex-col items-center pt-6 pb-4">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#3a3a3c] to-[#636366] flex items-center justify-center text-3xl font-bold shadow-2xl"
        >
          {c.sender.charAt(0)}
        </motion.div>
        <div className="text-xl font-bold mt-3 text-center px-4">{c.sender}</div>
        <div className="text-xs text-[#8e8e93] font-mono mt-0.5">{number ?? 'Chamada recebida'}</div>
        <div className="text-xs text-emerald-400 mt-1 font-semibold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Em ligação... 00:14</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-2">
        <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-xs text-neutral-300">
          <div className="text-[10px] uppercase font-mono text-amber-400 font-bold mb-1">
            Áudio da Ligação:
          </div>
          <p className="leading-relaxed text-white text-[13px]">{c.messageContent}</p>
        </div>

        {actionHistory.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <div className="p-1.5 rounded-xl bg-[#0a84ff] text-white text-xs ml-3 shadow-sm">
              <span className="font-mono text-[8.5px] opacity-75 block">Você perguntou:</span>
              {item.player}
            </div>
            <div className="p-1.5 rounded-xl bg-white/10 border border-white/15 text-white/90 text-xs mr-3 shadow-sm">
              <span className="font-mono text-[8.5px] opacity-75 block text-sky-300">Golpista respondeu:</span>
              {item.reply}
            </div>
          </motion.div>
        ))}
      </div>

      {!stamped && availableActions.length > 0 ? (
        <div className="p-2 bg-white/10 border-t border-white/15 space-y-1">
          <div className="text-[9.5px] font-mono uppercase text-sky-400 font-bold">
            Conduzir ligação:
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
            {availableActions.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => {
                  sound.playBlip();
                  onPerformAction(act);
                }}
                className="w-full text-left bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-lg px-2 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center justify-between gap-1.5"
              >
                <span className="text-[11px] leading-[1.25] font-medium line-clamp-2">{act.label}</span>
                <span className="text-[9px] font-mono bg-sky-500/30 text-sky-300 px-1.5 py-0.5 rounded shrink-0 font-bold">
                  Falar ➔
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-around items-center px-6 pb-4 pt-1">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80">
            <Mic className="w-4 h-4" />
          </div>
          <button
            type="button"
            onClick={onHangup}
            className="w-12 h-12 rounded-full bg-[#ff3b30] flex items-center justify-center shadow-lg shadow-red-500/30 cursor-pointer active:scale-90 transition-transform"
            title="Desligar na cara"
          >
            <PhoneOff className="w-5 h-5 text-white" />
          </button>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80">
            <Volume2 className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Notificação Push Interativa ----------
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

      {!stamped && availableActions.length > 0 && (
        <div className="p-2 bg-black/40 border-t border-white/15 space-y-1">
          <div className="text-[9.5px] font-mono uppercase text-purple-300 font-bold">
            Checagens no Aparelho:
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
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
        </div>
      )}
    </div>
  );
};

// ---------- Componente Principal do Celular Interativo ----------
export const PhoneScreen: React.FC<PhoneScreenProps> = ({
  scamCase,
  stamped,
  wasCorrect,
  onPerformAction,
  executedActionIds,
  actionHistory,
}) => {
  const [vibrateKey, setVibrateKey] = useState(0);
  const [activeModal, setActiveModal] = useState<'link' | 'contact' | 'toast' | null>(null);
  const [modalData, setModalData] = useState<{ url?: string; message?: string }>({});
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    sound.playPhoneVibrate();
    if (scamCase.channel === 'call') {
      sound.playPhoneRingtone();
    } else {
      sound.playMessagePing();
    }
    setVibrateKey((k) => k + 1);
    setIsBlocked(false);
    setActiveModal(null);
  }, [scamCase.id, scamCase.channel]);

  useEffect(() => {
    if (stamped) {
      sound.playStampThud();
    }
  }, [stamped]);

  const handleLinkClick = (url: string) => {
    sound.playBlip();
    setModalData({ url });
    setActiveModal('link');
  };

  const handleContactClick = () => {
    sound.playBlip();
    setActiveModal('contact');
  };

  const handleBlockContact = () => {
    sound.playStampThud();
    setIsBlocked(true);
    setActiveModal('toast');
    setModalData({ message: '🚫 Contato bloqueado com sucesso!' });
    setTimeout(() => setActiveModal(null), 2500);
  };

  const handleCallClick = () => {
    sound.playBlip();
    setActiveModal('toast');
    setModalData({ message: '📞 Chamada não atendida pelo remetente.' });
    setTimeout(() => setActiveModal(null), 2500);
  };

  const handleHangup = () => {
    sound.playBlip();
    setActiveModal('toast');
    setModalData({ message: '📴 Chamada encerrada na cara do golpista!' });
    setTimeout(() => setActiveModal(null), 2500);
  };

  const flagged = stamped !== null && scamCase.isScam;
  let screen: React.ReactNode;
  switch (scamCase.channel) {
    case 'whatsapp':
      screen = (
        <WhatsAppScreen
          c={scamCase}
          flagged={flagged}
          onPerformAction={onPerformAction}
          executedActionIds={executedActionIds}
          actionHistory={actionHistory}
          stamped={stamped}
          onLinkClick={handleLinkClick}
          onContactClick={handleContactClick}
          isBlocked={isBlocked}
          onBlockContact={handleBlockContact}
          onCallClick={handleCallClick}
        />
      );
      break;
    case 'call':
      screen = (
        <CallScreen
          c={scamCase}
          onPerformAction={onPerformAction}
          executedActionIds={executedActionIds}
          actionHistory={actionHistory}
          stamped={stamped}
          onHangup={handleHangup}
        />
      );
      break;
    case 'push':
      screen = (
        <PushScreen
          c={scamCase}
          onPerformAction={onPerformAction}
          executedActionIds={executedActionIds}
          actionHistory={actionHistory}
          stamped={stamped}
          onLinkClick={handleLinkClick}
        />
      );
      break;
    default:
      screen = (
        <SmsScreen
          c={scamCase}
          flagged={flagged}
          onPerformAction={onPerformAction}
          executedActionIds={executedActionIds}
          actionHistory={actionHistory}
          stamped={stamped}
          onLinkClick={handleLinkClick}
          onContactClick={handleContactClick}
        />
      );
  }

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
      className="relative mx-auto w-full max-w-[285px] sm:max-w-[300px]"
    >
      {/* Moldura Realista do Celular */}
      <div className="relative rounded-[40px] sm:rounded-[46px] bg-[#0c0e14] p-[8px] sm:p-[10px] shadow-[0_0_0_3px_#272b38,0_24px_50px_-10px_rgba(0,0,0,0.9)] border border-white/20">
        <div className="relative h-[510px] sm:h-[600px] max-h-[72vh] sm:max-h-[82vh] min-h-[440px] rounded-[32px] sm:rounded-[38px] overflow-hidden font-phone select-none bg-black">
          {screen}

          {/* Notch Dinâmico no Topo do Celular */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[76px] h-[18px] rounded-full bg-black flex items-center justify-between px-2.5 z-30 shadow-md border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#1e293b]" />
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          </div>

          {/* Toast Interno de Feedback do Celular */}
          <AnimatePresence>
            {activeModal === 'toast' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-8 left-3 right-3 z-50 bg-black/90 text-white text-[11px] font-semibold py-2 px-3 rounded-xl border border-white/20 shadow-2xl text-center backdrop-blur-md"
              >
                {modalData.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* MODAL 1: Navegador Seguro (Inspeção de Links Point & Click) */}
          <AnimatePresence>
            {activeModal === 'link' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-50 bg-[#1c1c1e] text-white flex flex-col p-3"
              >
                {/* Barra do Navegador */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5 flex-1 bg-black/50 py-1 px-2.5 rounded-full text-[10px] text-neutral-300 truncate mr-2">
                    {scamCase.isScam ? (
                      <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                    ) : (
                      <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
                    )}
                    <span className="truncate">{modalData.url}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="p-1 hover:bg-white/10 rounded-full cursor-pointer text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Conteúdo Forense da Página Inspecionada */}
                <div className="flex-1 flex flex-col justify-center items-center text-center p-3 space-y-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      scamCase.isScam
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {scamCase.isScam ? (
                      <ShieldAlert className="w-8 h-8" />
                    ) : (
                      <ShieldCheck className="w-8 h-8" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm">
                      {scamCase.isScam ? '⚠️ Link Perigoso Detectado' : '✅ Conexão Segura'}
                    </h4>
                    <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                      {scamCase.isScam
                        ? 'O link tenta simular uma página autêntica, mas possui redirecionamento para servidor desconhecido!'
                        : 'O domínio pertence ao servidor oficial autenticado com certificado SSL válido.'}
                    </p>
                  </div>

                  <div className="bg-black/60 p-2.5 rounded-xl border border-white/10 w-full text-left text-[10.5px] space-y-1">
                    <div className="text-neutral-400 font-mono text-[9px] uppercase">
                      Auditoria Forense do Link:
                    </div>
                    <div className="text-white font-medium break-all">{modalData.url}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="w-full py-2 bg-white text-black font-bold text-xs rounded-xl shadow-md cursor-pointer active:scale-95 transition"
                  >
                    ← Voltar ao Aplicativo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MODAL 2: Perfil do Contato (Point & Click no Remetente) */}
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
        </div>
      </div>

      {/* Carimbo de Veredito */}
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
              className={`stamp px-6 py-2.5 text-[40px] leading-none bg-white/90 backdrop-blur-[2px] shadow-2xl ${
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
