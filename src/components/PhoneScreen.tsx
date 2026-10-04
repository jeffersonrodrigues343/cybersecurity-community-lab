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
} from 'lucide-react';
import type { ScamCase } from '../data/scamsData';
import { sound } from '../utils/audio';

type Verdict = 'scam' | 'safe' | null;

interface PhoneScreenProps {
  scamCase: ScamCase;
  stamped: Verdict;
  wasCorrect: boolean | null;
}

const findContactNumber = (c: ScamCase): string | null => {
  const contact = c.clues.find((cl) => cl.inspection.type === 'contact');
  if (contact) return contact.inspection.field1Value;
  const anyPhone = c.clues
    .flatMap((cl) => [cl.inspection.field1Value, cl.inspection.field2Value])
    .find((v) => /(\+55|0800|\(\d{2}\))/.test(v));
  return anyPhone ?? null;
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

// ---------- WhatsApp com animação de digitação e chegada ----------
const WhatsAppScreen = ({ c, flagged }: { c: ScamCase; flagged: boolean }) => {
  const [isTyping, setIsTyping] = useState(true);
  const number = findContactNumber(c);
  const name = cleanName(c.sender);
  const unknown = /desconhecid|n[uú]mero novo/i.test(c.sender);

  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [c.id]);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#008069] text-white">
        <StatusBar time={c.time} dark />
        <div className="flex items-center gap-2 px-2 pb-2.5 pt-1">
          <ArrowLeft className="w-5 h-5" />
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="w-9 h-9 rounded-full bg-[#dfe5e7] flex items-center justify-center text-[#54656f] font-semibold text-sm shadow-inner"
          >
            {name.charAt(0)}
          </motion.div>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="font-semibold text-[15px] truncate">{unknown && number ? number : name}</div>
            <div className="text-[11.5px] text-white/80 truncate">
              {isTyping ? (
                <span className="italic font-medium text-emerald-200 animate-pulse">digitando...</span>
              ) : unknown ? (
                `~${name}`
              ) : (
                'online'
              )}
            </div>
          </div>
          <Video className="w-5 h-5 opacity-90" />
          <Phone className="w-[18px] h-[18px] ml-3 opacity-90" />
          <MoreVertical className="w-5 h-5 ml-1 opacity-90" />
        </div>
      </div>

      <div className="flex-1 wa-wallpaper overflow-y-auto no-scrollbar px-3 py-3 space-y-2">
        <div className="mx-auto w-fit bg-[#ffeecd] text-[#54656f] text-[11px] px-3 py-1.5 rounded-lg text-center max-w-[90%] flex items-center gap-1.5 shadow-sm">
          <Lock className="w-3 h-3 flex-shrink-0" />
          As mensagens são protegidas com criptografia de ponta a ponta.
        </div>

        {unknown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto w-full bg-white rounded-lg text-center text-[12px] text-[#54656f] p-2.5 shadow-sm border border-emerald-100"
          >
            Este número não está na sua lista de contatos
            <div className="flex justify-center gap-6 mt-1.5 font-semibold text-[#008069]">
              <span className="hover:underline cursor-pointer">Bloquear</span>
              <span className="hover:underline cursor-pointer">Adicionar</span>
            </div>
          </motion.div>
        )}

        <div className="mx-auto w-fit bg-white/90 text-[#54656f] text-[11px] px-2.5 py-1 rounded-md shadow-sm font-mono">
          HOJE
        </div>

        {isTyping ? (
          <div className="bg-white rounded-lg rounded-tl-none px-3.5 py-2.5 w-fit shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.15s]" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.3s]" />
          </div>
        ) : (
          c.messageContent.split(/\n\n+/).map((para, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.96, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.1 }}
              className="relative bg-white text-[#111b21] text-[14.2px] leading-[19px] rounded-lg rounded-tl-none px-3 pt-2 pb-4 max-w-[88%] shadow-[0_1px_1px_rgba(11,20,26,0.15)] whitespace-pre-wrap"
            >
              {renderWithLinks(para, flagged)}
              <span className="absolute right-2 bottom-1 text-[10.5px] text-[#667781] font-mono">
                {c.time}
              </span>
            </motion.div>
          ))
        )}
      </div>

      <div className="bg-[#f0f2f5] px-2 py-2 flex items-center gap-2 border-t border-black/5">
        <div className="flex-1 bg-white rounded-full px-4 py-2 text-[14px] text-[#8696a0] shadow-sm">
          Mensagem
        </div>
        <div className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-sm">
          <Mic className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

// ---------- SMS com animação de balão ----------
const SmsScreen = ({ c, flagged }: { c: ScamCase; flagged: boolean }) => {
  const number = findContactNumber(c);
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
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="bg-[#e9e9eb] text-black text-[15px] leading-[20px] rounded-[18px] rounded-bl-[4px] px-3.5 py-2.5 max-w-[85%] whitespace-pre-wrap shadow-sm"
        >
          {renderWithLinks(c.messageContent, flagged)}
        </motion.div>
        <div className="text-[11px] text-[#8e8e93] pl-2 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-[#ff9500]" /> O remetente não está na sua lista de contatos.
        </div>
      </div>

      <div className="px-3 py-2 border-t border-black/5">
        <div className="rounded-full border border-black/15 px-4 py-1.5 text-[14px] text-[#8e8e93] bg-neutral-50">
          Mensagem de Texto
        </div>
      </div>
    </div>
  );
};

// ---------- Ligação com ondas de áudio pulsantes ----------
const CallScreen = ({ c }: { c: ScamCase }) => {
  const number = findContactNumber(c);
  const lines = c.messageContent
    .split(/\n\n+/)
    .filter((l) => !/^LIGA[ÇC][ÃA]O/i.test(l.trim()));

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] text-white">
      <StatusBar time={c.time} dark />

      <div className="text-center pt-4 pb-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[11px] font-mono tracking-wider animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          CHAMADA ATIVA • 00:47
        </div>
        <div className="text-[26px] font-light mt-2 tracking-tight">{number ?? c.sender}</div>
        <div className="text-[13px] text-white/70">{cleanName(c.sender)}</div>

        {/* Ondas de frequência de voz */}
        <div className="flex items-center justify-center gap-1 my-3">
          {[40, 70, 100, 50, 85, 60, 95, 45, 75].map((h, i) => (
            <motion.span
              key={i}
              animate={{ height: [8, h * 0.3, 8] }}
              transition={{
                repeat: Infinity,
                duration: 0.8 + (i % 3) * 0.2,
                ease: 'easeInOut',
              }}
              className="w-1 bg-[#38bdf8] rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Transcrição da conversa com balões */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-2 pb-2">
        {lines.map((l, i) => {
          const me = /^Voc[eê]:/i.test(l.trim());
          const m = l.match(/^([^:]{1,40}):\s*([\s\S]*)$/);
          const who = m ? m[1] : '';
          const said = (m ? m[2] : l).replace(/^"|"$/g, '');
          return (
            <div key={i} className={`flex ${me ? 'justify-end' : 'justify-start'}`}>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13.5px] leading-[18px] shadow-sm ${
                  me
                    ? 'bg-[#0a84ff] text-white rounded-br-sm'
                    : 'bg-white/15 backdrop-blur-md text-white/95 rounded-bl-sm border border-white/10'
                }`}
              >
                {!me && who && <div className="text-[10.5px] text-white/60 mb-0.5 font-mono">{who}</div>}
                {said}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Botões de chamada */}
      <div className="flex justify-around items-center px-8 pb-5 pt-1">
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/80">
            <Mic className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-white/60">Mudo</span>
        </div>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-16 h-16 rounded-full bg-[#ff3b30] flex items-center justify-center shadow-lg shadow-red-500/30 cursor-pointer"
        >
          <PhoneOff className="w-7 h-7" />
        </motion.div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/80">
            <Volume2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-white/60">Alto-falante</span>
        </div>
      </div>
    </div>
  );
};

// ---------- Notificação Push caindo da Ilha Dinâmica ----------
const PushScreen = ({ c }: { c: ScamCase }) => {
  const [title, ...rest] = c.messageContent.split(':');
  const body = rest.join(':').trim();
  const app = c.sender.split('/')[0].trim();

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#2e1065] via-[#1e1b4b] to-[#0f172a] text-white">
      <StatusBar time={c.time} dark />

      <div className="text-center pt-5">
        <Lock className="w-4 h-4 mx-auto text-white/80" />
        <div className="text-[13px] text-white/80 mt-1.5 font-medium">sábado, 3 de outubro</div>
        <div className="text-[64px] font-semibold leading-none tracking-tight mt-1">{c.time}</div>
      </div>

      <div className="px-3 mt-6">
        <motion.div
          initial={{ y: -40, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22, delay: 0.2 }}
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
          <div className="text-[13.5px] text-white/90 leading-[18px] whitespace-pre-wrap mt-0.5">
            {body}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const PhoneScreen: React.FC<PhoneScreenProps> = ({ scamCase, stamped, wasCorrect }) => {
  const [vibrateKey, setVibrateKey] = useState(0);

  // Som e Vibração física do celular a cada novo caso
  useEffect(() => {
    sound.playPhoneVibrate();
    if (scamCase.channel === 'call') {
      sound.playPhoneRingtone();
    } else {
      sound.playMessagePing();
    }
    setVibrateKey((k) => k + 1);
  }, [scamCase.id, scamCase.channel]);

  // Efeito sonoro do carimbo
  useEffect(() => {
    if (stamped) {
      sound.playStampThud();
    }
  }, [stamped]);

  const flagged = stamped !== null && scamCase.isScam;
  let screen: React.ReactNode;
  switch (scamCase.channel) {
    case 'whatsapp':
      screen = <WhatsAppScreen c={scamCase} flagged={flagged} />;
      break;
    case 'call':
      screen = <CallScreen c={scamCase} />;
      break;
    case 'push':
      screen = <PushScreen c={scamCase} />;
      break;
    default:
      screen = <SmsScreen c={scamCase} flagged={flagged} />;
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
      className="relative mx-auto w-full max-w-[340px]"
    >
      {/* Moldura de Hardware do Smartphone */}
      <div className="relative rounded-[48px] bg-[#0b0d12] p-[10px] shadow-[0_0_0_2px_#2c3142,0_40px_60px_-20px_rgba(0,0,0,0.8)] border border-white/5">
        <div className="relative h-[610px] max-h-[74vh] min-h-[490px] rounded-[38px] overflow-hidden font-phone select-none">
          {screen}

          {/* Ilha Dinâmica com indicador ativo */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[96px] h-[26px] rounded-full bg-black flex items-center justify-between px-3 z-30 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1e293b]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Carimbo de Borracha Batendo com Física e Tinta */}
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
