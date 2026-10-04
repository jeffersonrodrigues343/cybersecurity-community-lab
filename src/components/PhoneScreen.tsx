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
    const match = v.match(/(\+55\s*\(?\d{2}\)?\s*9?\d{4}-?\d{4}|0800\s*\d{3}\s*\d{4})/);
    if (match) return match[0];
  }
  return null;
};

const cleanName = (sender: string) => sender.replace(/\s*\(.*?\)\s*/g, '').trim();

const renderWithLinks = (text: string, flagged: boolean) => {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <span
        key={i}
        className={`underline break-all font-semibold ${
          flagged ? 'text-[#d93025] decoration-wavy decoration-2' : 'text-[#1a73e8]'
        }`}
      >
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
};

const StatusBar = ({ time, dark }: { time: string; dark?: boolean }) => (
  <div
    className={`flex items-center justify-between px-6 pt-3 pb-1 text-[12px] font-semibold ${
      dark ? 'text-white' : 'text-black'
    }`}
  >
    <span>{time}</span>
    <div className="flex items-center gap-1">
      <Signal className="w-3.5 h-3.5" />
      <Wifi className="w-3.5 h-3.5" />
      <BatteryFull className="w-4 h-4" />
    </div>
  </div>
);

// ---------- WhatsApp com Respostas Interativas do Jogador ----------
const WhatsAppScreen = ({
  c,
  flagged,
  onPerformAction,
  executedActionIds,
  actionHistory,
  stamped,
}: {
  c: ScamCase;
  flagged: boolean;
  onPerformAction: (action: InteractiveAction) => void;
  executedActionIds: string[];
  actionHistory: { player: string; reply: string }[];
  stamped: Verdict;
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

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#008069] text-white">
        <StatusBar time={c.time} dark />
        <div className="flex items-center gap-2 px-2.5 pb-2.5 pt-1">
          <ArrowLeft className="w-4 h-4 shrink-0 cursor-pointer" />
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="w-8 h-8 rounded-full bg-[#dfe5e7] flex items-center justify-center text-[#54656f] font-semibold text-xs shadow-inner shrink-0"
          >
            {name.charAt(0)}
          </motion.div>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="font-semibold text-[14px] truncate">{unknown && number ? number : name}</div>
            <div className="text-[11px] text-white/80 truncate">
              {isTyping ? (
                <span className="italic font-medium text-emerald-200 animate-pulse">digitando...</span>
              ) : unknown ? (
                `~${name}`
              ) : (
                'online'
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90 shrink-0">
            <Video className="w-4 h-4 opacity-90" />
            <Phone className="w-4 h-4 opacity-90" />
            <MoreVertical className="w-4 h-4 opacity-90" />
          </div>
        </div>
      </div>

      <div className="flex-1 wa-wallpaper overflow-y-auto no-scrollbar px-3 py-3 space-y-2">
        <div className="mx-auto w-fit bg-[#ffeecd] text-[#54656f] text-[11px] px-3 py-1.5 rounded-lg text-center max-w-[90%] flex items-center gap-1.5 shadow-sm">
          <Lock className="w-3 h-3 flex-shrink-0" />
          As mensagens são protegidas com criptografia de ponta a ponta.
        </div>

        {unknown && (
          <div className="mx-auto w-full bg-white rounded-lg text-center text-[12px] text-[#54656f] p-2.5 shadow-sm border border-emerald-100">
            Este número não está na sua lista de contatos
            <div className="flex justify-center gap-6 mt-1.5 font-semibold text-[#008069]">
              <span className="hover:underline cursor-pointer">Bloquear</span>
              <span className="hover:underline cursor-pointer">Adicionar</span>
            </div>
          </div>
        )}

        <div className="mx-auto w-fit bg-white/90 text-[#54656f] text-[11px] px-2.5 py-1 rounded-md shadow-sm font-mono">
          HOJE
        </div>

        {/* Mensagem Inicial do Caso */}
        {c.messageContent.split(/\n\n+/).map((para, i) => (
          <div
            key={i}
            className="relative bg-white text-[#111b21] text-[14.2px] leading-[19px] rounded-lg rounded-tl-none px-3 pt-2 pb-4 max-w-[88%] shadow-[0_1px_1px_rgba(11,20,26,0.15)] whitespace-pre-wrap"
          >
            {renderWithLinks(para, flagged)}
            <span className="absolute right-2 bottom-1 text-[10.5px] text-[#667781] font-mono">
              {c.time}
            </span>
          </div>
        ))}

        {/* Histórico de Interações Conduzidas pelo Jogador */}
        {actionHistory.map((item, idx) => (
          <React.Fragment key={idx}>
            {/* Mensagem enviada pelo jogador */}
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="ml-auto bg-[#d9fdd3] text-[#111b21] text-[14.2px] leading-[19px] rounded-lg rounded-tr-none px-3 pt-2 pb-4 max-w-[88%] shadow-[0_1px_1px_rgba(11,20,26,0.15)] relative"
            >
              <div>{item.player}</div>
              <span className="absolute right-2 bottom-1 text-[10px] text-[#667781] font-mono">✓✓</span>
            </motion.div>

            {/* Resposta do contato */}
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="mr-auto bg-white text-[#111b21] text-[14.2px] leading-[19px] rounded-lg rounded-tl-none px-3 pt-2 pb-4 max-w-[88%] shadow-[0_1px_1px_rgba(11,20,26,0.15)] relative"
            >
              <div>{item.reply}</div>
              <span className="absolute right-2 bottom-1 text-[10px] text-[#667781] font-mono">
                {c.time}
              </span>
            </motion.div>
          </React.Fragment>
        ))}

        {isTyping && (
          <div className="bg-white rounded-lg rounded-tl-none px-3.5 py-2.5 w-fit shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.15s]" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.3s]" />
          </div>
        )}
      </div>

      {/* Barra de Respostas Rápidas / Condução do Jogador */}
      {!stamped && availableActions.length > 0 ? (
        <div className="bg-[#f0f2f5] p-2 border-t border-black/10 space-y-1.5">
          <div className="text-[10.5px] font-mono text-[#54656f] uppercase tracking-wider font-bold px-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#008069]" /> Escolha como responder ao contato:
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
            {availableActions.map((act) => (
              <button
                key={act.id}
                onClick={() => handleActionClick(act)}
                className="w-full text-left bg-white hover:bg-emerald-50 border border-emerald-200 text-[#008069] rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-sm transition cursor-pointer flex items-center justify-between gap-2"
              >
                <span className="text-[11px] leading-[1.3] font-medium line-clamp-2">{act.label}</span>
                <span className="text-[9.5px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded shrink-0">
                  +Ação
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#f0f2f5] px-2 py-2 flex items-center gap-2 border-t border-black/5">
          <div className="flex-1 bg-white rounded-full px-4 py-2 text-[14px] text-[#8696a0] shadow-sm">
            Mensagem
          </div>
          <div className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-sm">
            <Mic className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- SMS Interativo com Testes Rápidos ----------
const SmsScreen = ({
  c,
  flagged,
  onPerformAction,
  executedActionIds,
  actionHistory,
  stamped,
}: {
  c: ScamCase;
  flagged: boolean;
  onPerformAction: (action: InteractiveAction) => void;
  executedActionIds: string[];
  actionHistory: { player: string; reply: string }[];
  stamped: Verdict;
}) => {
  const number = findContactNumber(c);
  const availableActions = (c.interactiveActions || []).filter(
    (act) => !executedActionIds.includes(act.id),
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <StatusBar time={c.time} />
      <div className="flex flex-col items-center pb-3 pt-1 border-b border-black/10 relative">
        <ChevronLeft className="w-6 h-6 text-[#007aff] absolute left-3 top-3" />
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="w-12 h-12 rounded-full bg-gradient-to-b from-[#a5abb8] to-[#858994] flex items-center justify-center text-white font-semibold text-lg shadow-sm"
        >
          {c.sender.charAt(0)}
        </motion.div>
        <div className="text-[12px] text-black mt-1 flex items-center gap-0.5 font-medium">
          {number ?? c.sender} <span className="text-[#8e8e93]">›</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3 space-y-2">
        <div className="text-center text-[11px] text-[#8e8e93] font-mono">
          Mensagem de Texto • SMS
          <br />
          Hoje {c.time}
        </div>
        <div className="bg-[#e9e9eb] text-black text-[15px] leading-[20px] rounded-[18px] rounded-bl-[4px] px-3.5 py-2.5 max-w-[85%] whitespace-pre-wrap shadow-sm">
          {renderWithLinks(c.messageContent, flagged)}
        </div>

        {/* Respostas e investigações efetuadas */}
        {actionHistory.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 rounded-xl bg-neutral-100 border border-neutral-300 text-xs text-neutral-800 space-y-1 shadow-sm"
          >
            <div className="font-semibold flex items-center gap-1 text-[#007aff]">
              <ExternalLink className="w-3 h-3" /> {item.player}
            </div>
            <div className="text-[11.5px] leading-relaxed text-neutral-600">{item.reply}</div>
          </motion.div>
        ))}

        <div className="text-[11px] text-[#8e8e93] pl-2 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-[#ff9500]" /> Remetente não verificado.
        </div>
      </div>

      {/* Ações interativas no SMS */}
      {!stamped && availableActions.length > 0 && (
        <div className="p-2.5 bg-neutral-50 border-t border-black/10 space-y-1.5">
          <div className="text-[10px] font-mono uppercase text-neutral-500 font-bold">
            Conduzir Investigação no Aparelho:
          </div>
          {availableActions.map((act) => (
            <button
              key={act.id}
              onClick={() => {
                sound.playBlip();
                onPerformAction(act);
              }}
              className="w-full text-left bg-white hover:bg-blue-50 border border-blue-200 text-[#007aff] rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-sm transition cursor-pointer flex items-center justify-between gap-2"
            >
              <span className="text-[11px] leading-[1.3] font-medium line-clamp-2">{act.label}</span>
              <span className="text-[9px] font-mono bg-blue-100 text-blue-800 px-1 rounded shrink-0">
                +Auditoria
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------- Ligação Interativa com Diálogo Conduzido pelo Jogador ----------
const CallScreen = ({
  c,
  onPerformAction,
  executedActionIds,
  actionHistory,
  stamped,
}: {
  c: ScamCase;
  onPerformAction: (action: InteractiveAction) => void;
  executedActionIds: string[];
  actionHistory: { player: string; reply: string }[];
  stamped: Verdict;
}) => {
  const number = findContactNumber(c);
  const availableActions = (c.interactiveActions || []).filter(
    (act) => !executedActionIds.includes(act.id),
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] text-white">
      <StatusBar time={c.time} dark />

      <div className="text-center pt-3 pb-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[11px] font-mono tracking-wider animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          CHAMADA ATIVA
        </div>
        <div className="text-[22px] font-light mt-1 tracking-tight">{number ?? c.sender}</div>
        <div className="text-[12px] text-white/70">{cleanName(c.sender)}</div>

        {/* Ondas sonoras animadas */}
        <div className="flex items-center justify-center gap-1 my-2">
          {[40, 70, 100, 50, 85, 60, 95, 45, 75].map((h, i) => (
            <motion.span
              key={i}
              animate={{ height: [6, h * 0.25, 6] }}
              transition={{ repeat: Infinity, duration: 0.8 + (i % 3) * 0.2 }}
              className="w-1 bg-[#38bdf8] rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Histórico da Chamada */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-2 pb-2">
        <div className="p-2.5 rounded-xl bg-white/10 text-xs text-white/90 leading-relaxed border border-white/10">
          <span className="font-mono text-[10px] text-white/60 block uppercase">Atendente:</span>
          {c.messageContent.replace(/LIGAÇÃO TELEFÔNICA RECEBIDA:\s*/i, '')}
        </div>

        {actionHistory.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <div className="p-2 rounded-xl bg-[#0a84ff] text-white text-xs ml-4 shadow-sm">
              <span className="font-mono text-[9px] opacity-75 block">Você disse:</span>
              {item.player}
            </div>
            <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-white/90 text-xs mr-4 shadow-sm">
              <span className="font-mono text-[9px] opacity-75 block text-sky-300">Atendente respondeu:</span>
              {item.reply}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Opções de diálogo para o jogador falar na chamada */}
      {!stamped && availableActions.length > 0 ? (
        <div className="p-2.5 bg-white/10 border-t border-white/15 space-y-1.5">
          <div className="text-[10px] font-mono uppercase text-sky-400 font-bold">
            Como você quer conduzir a ligação?
          </div>
          {availableActions.map((act) => (
            <button
              key={act.id}
              onClick={() => {
                sound.playBlip();
                onPerformAction(act);
              }}
              className="w-full text-left bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center justify-between gap-2"
            >
              <span className="text-[11px] leading-[1.3] font-medium line-clamp-2">{act.label}</span>
              <span className="text-[9px] font-mono bg-sky-500/30 text-sky-300 px-1 rounded shrink-0">
                Falar
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex justify-around items-center px-8 pb-4 pt-1">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80">
            <Mic className="w-4 h-4" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-14 h-14 rounded-full bg-[#ff3b30] flex items-center justify-center shadow-lg shadow-red-500/30 cursor-pointer"
          >
            <PhoneOff className="w-6 h-6" />
          </motion.div>
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
}: {
  c: ScamCase;
  onPerformAction: (action: InteractiveAction) => void;
  executedActionIds: string[];
  actionHistory: { player: string; reply: string }[];
  stamped: Verdict;
}) => {
  const [title, ...rest] = c.messageContent.split(':');
  const body = rest.join(':').trim();
  const app = c.sender.split('/')[0].trim();
  const availableActions = (c.interactiveActions || []).filter(
    (act) => !executedActionIds.includes(act.id),
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#2e1065] via-[#1e1b4b] to-[#0f172a] text-white">
      <StatusBar time={c.time} dark />

      <div className="text-center pt-4">
        <Lock className="w-4 h-4 mx-auto text-white/80" />
        <div className="text-[13px] text-white/80 mt-1 font-medium">sábado, 3 de outubro</div>
        <div className="text-[58px] font-semibold leading-none tracking-tight mt-1">{c.time}</div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-2 mt-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-[22px] bg-white/15 backdrop-blur-2xl p-3.5 border border-white/20 shadow-2xl"
        >
          <div className="flex items-center gap-2 text-[12px] text-white/80">
            <div className="w-5 h-5 rounded-md bg-[#820ad1] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              {app.charAt(0)}
            </div>
            <span className="uppercase tracking-wider font-semibold text-[11px]">{app}</span>
            <span className="ml-auto text-[11px] opacity-70">agora</span>
          </div>
          <div className="mt-2 font-bold text-[14.5px]">{title}</div>
          <div className="text-[13px] text-white/90 leading-[18px] whitespace-pre-wrap mt-0.5">
            {body}
          </div>
        </motion.div>

        {actionHistory.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-2xl bg-white/15 border border-white/20 text-white text-xs space-y-1 shadow-lg"
          >
            <div className="font-semibold flex items-center gap-1.5 text-purple-300">
              <ShieldCheck className="w-4 h-4" /> {item.player}
            </div>
            <div className="text-[12px] leading-relaxed text-white/90">{item.reply}</div>
          </motion.div>
        ))}
      </div>

      {/* Ações para checar o app */}
      {!stamped && availableActions.length > 0 && (
        <div className="p-3 bg-black/40 border-t border-white/15 space-y-1.5">
          <div className="text-[10px] font-mono uppercase text-purple-300 font-bold">
            Conduzir Ações no Smartphone:
          </div>
          {availableActions.map((act) => (
            <button
              key={act.id}
              onClick={() => {
                sound.playBlip();
                onPerformAction(act);
              }}
              className="w-full text-left bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl px-3 py-2 text-xs font-semibold transition cursor-pointer flex items-center justify-between gap-2"
            >
              <span className="text-[11px] leading-[1.3] font-medium line-clamp-2">{act.label}</span>
              <span className="text-[9px] font-mono bg-purple-500 text-white px-1.5 py-0.5 rounded shrink-0">
                Checar
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const PhoneScreen: React.FC<PhoneScreenProps> = ({
  scamCase,
  stamped,
  wasCorrect,
  onPerformAction,
  executedActionIds,
  actionHistory,
}) => {
  const [vibrateKey, setVibrateKey] = useState(0);

  useEffect(() => {
    sound.playPhoneVibrate();
    if (scamCase.channel === 'call') {
      sound.playPhoneRingtone();
    } else {
      sound.playMessagePing();
    }
    setVibrateKey((k) => k + 1);
  }, [scamCase.id, scamCase.channel]);

  useEffect(() => {
    if (stamped) {
      sound.playStampThud();
    }
  }, [stamped]);

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
        />
      );
  }

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
      className="relative mx-auto w-full max-w-[330px]"
    >
      <div className="relative rounded-[46px] bg-[#0c0e14] p-[9px] shadow-[0_0_0_2px_#272b38,0_32px_55px_-15px_rgba(0,0,0,0.85)] border border-white/10">
        <div className="relative h-[590px] max-h-[78vh] min-h-[490px] rounded-[38px] overflow-hidden font-phone select-none">
          {screen}

          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[82px] h-[22px] rounded-full bg-black flex items-center justify-between px-2.5 z-30 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1e293b]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
          </div>
        </div>
      </div>

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
              className={`stamp px-6 py-2.5 text-[42px] leading-none bg-white/85 backdrop-blur-[2px] shadow-2xl ${
                stamped === 'scam' ? 'text-scam' : 'text-safe'
              }`}
            >
              {stamped === 'scam' ? 'GOLPE!' : 'SEGURO'}
              <div className="text-[11px] tracking-[0.3em] text-center mt-1 font-mono font-bold uppercase">
                {wasCorrect ? 'veredito comprovado' : 'veredito incorreto'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
