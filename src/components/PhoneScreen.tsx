import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Phone, Video, MoreVertical, Lock, PhoneOff, Signal, Wifi, BatteryFull, ChevronLeft, Info } from 'lucide-react';
import type { ScamCase } from '../data/scamsData';

type Verdict = 'scam' | 'safe' | null;

interface PhoneScreenProps {
  scamCase: ScamCase;
  stamped: Verdict;
  wasCorrect: boolean | null;
}

// acha o numero/remetente real nas pistas (fica mais fiel que o nome do caso)
const findContactNumber = (c: ScamCase): string | null => {
  const contact = c.clues.find((cl) => cl.inspection.type === 'contact');
  if (contact) return contact.inspection.field1Value;
  const anyPhone = c.clues
    .flatMap((cl) => [cl.inspection.field1Value, cl.inspection.field2Value])
    .find((v) => /(\+55|0800|\(\d{2}\))/.test(v));
  return anyPhone ?? null;
};

const cleanName = (sender: string) => sender.replace(/\s*\(.*?\)\s*/g, '').trim();

// transforma links em texto azul clicavel (sem navegar de verdade)
const renderWithLinks = (text: string, flagged: boolean) => {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <span
        key={i}
        className={`underline break-all ${flagged ? 'text-[#d93025] decoration-wavy decoration-2' : 'text-[#1a73e8]'}`}
      >
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
};

const StatusBar = ({ time, dark }: { time: string; dark?: boolean }) => (
  <div className={`flex items-center justify-between px-6 pt-3 pb-1 text-[12px] font-semibold ${dark ? 'text-white' : 'text-black'}`}>
    <span>{time}</span>
    <div className="flex items-center gap-1">
      <Signal className="w-3.5 h-3.5" />
      <Wifi className="w-3.5 h-3.5" />
      <BatteryFull className="w-4 h-4" />
    </div>
  </div>
);

// ---------- WhatsApp ----------
const WhatsAppScreen = ({ c, flagged }: { c: ScamCase; flagged: boolean }) => {
  const number = findContactNumber(c);
  const name = cleanName(c.sender);
  const unknown = /desconhecid|n[uú]mero novo/i.test(c.sender);
  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#008069] text-white">
        <StatusBar time={c.time} dark />
        <div className="flex items-center gap-2 px-2 pb-2.5 pt-1">
          <ArrowLeft className="w-5 h-5" />
          <div className="w-9 h-9 rounded-full bg-[#dfe5e7] flex items-center justify-center text-[#54656f] font-semibold text-sm">
            {name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="font-semibold text-[15px] truncate">{unknown && number ? number : name}</div>
            <div className="text-[11.5px] text-white/80 truncate">{unknown ? `~${name}` : 'online'}</div>
          </div>
          <Video className="w-5 h-5" />
          <Phone className="w-[18px] h-[18px] ml-3" />
          <MoreVertical className="w-5 h-5 ml-1" />
        </div>
      </div>

      <div className="flex-1 wa-wallpaper overflow-y-auto no-scrollbar px-3 py-3 space-y-2">
        <div className="mx-auto w-fit bg-[#ffeecd] text-[#54656f] text-[11px] px-3 py-1.5 rounded-lg text-center max-w-[90%] flex items-center gap-1.5">
          <Lock className="w-3 h-3 flex-shrink-0" />
          As mensagens são protegidas com a criptografia de ponta a ponta.
        </div>
        {unknown && (
          <div className="mx-auto w-full bg-white rounded-lg text-center text-[12px] text-[#54656f] p-2.5 shadow-sm">
            Este número não está nos seus contatos
            <div className="flex justify-center gap-6 mt-1.5 font-semibold text-[#008069]">
              <span>Bloquear</span>
              <span>Adicionar</span>
            </div>
          </div>
        )}
        <div className="mx-auto w-fit bg-white/90 text-[#54656f] text-[11px] px-2.5 py-1 rounded-md shadow-sm">HOJE</div>
        {c.messageContent.split(/\n\n+/).map((para, i) => (
          <div key={i} className="relative bg-white text-[#111b21] text-[14.2px] leading-[19px] rounded-lg rounded-tl-none px-2.5 pt-1.5 pb-4 max-w-[85%] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] whitespace-pre-wrap">
            {renderWithLinks(para, flagged)}
            <span className="absolute right-2 bottom-1 text-[10.5px] text-[#667781]">{c.time}</span>
          </div>
        ))}
      </div>

      <div className="bg-[#f0f2f5] px-2 py-2 flex items-center gap-2">
        <div className="flex-1 bg-white rounded-full px-4 py-2 text-[14px] text-[#8696a0]">Mensagem</div>
        <div className="w-10 h-10 rounded-full bg-[#00a884]" />
      </div>
    </div>
  );
};

// ---------- SMS ----------
const SmsScreen = ({ c, flagged }: { c: ScamCase; flagged: boolean }) => {
  const number = findContactNumber(c);
  return (
    <div className="flex flex-col h-full bg-white">
      <StatusBar time={c.time} />
      <div className="flex flex-col items-center pb-3 pt-1 border-b border-black/10 relative">
        <ChevronLeft className="w-6 h-6 text-[#007aff] absolute left-3 top-3" />
        <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#a5abb8] to-[#858994] flex items-center justify-center text-white font-semibold text-lg">
          {c.sender.charAt(0)}
        </div>
        <div className="text-[12px] text-black mt-1 flex items-center gap-0.5">
          {number ?? c.sender} <span className="text-[#8e8e93]">›</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3 space-y-2">
        <div className="text-center text-[11px] text-[#8e8e93]">
          Mensagem de Texto • SMS
          <br />
          Hoje {c.time}
        </div>
        <div className="bg-[#e9e9eb] text-black text-[15px] leading-[20px] rounded-[18px] rounded-bl-[4px] px-3.5 py-2 max-w-[82%] whitespace-pre-wrap">
          {renderWithLinks(c.messageContent, flagged)}
        </div>
        <div className="text-[11px] text-[#8e8e93] pl-2 flex items-center gap-1">
          <Info className="w-3 h-3" /> O remetente não está na sua lista de contatos.
        </div>
      </div>
      <div className="px-3 py-2 border-t border-black/5">
        <div className="rounded-full border border-black/15 px-4 py-1.5 text-[14px] text-[#8e8e93]">Mensagem de Texto</div>
      </div>
    </div>
  );
};

// ---------- Ligacao ----------
const CallScreen = ({ c }: { c: ScamCase }) => {
  const number = findContactNumber(c);
  const lines = c.messageContent
    .split(/\n\n+/)
    .filter((l) => !/^LIGA[ÇC][ÃA]O/i.test(l.trim()));
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#2b3a4a] via-[#1d2733] to-[#10151c] text-white">
      <StatusBar time={c.time} dark />
      <div className="text-center pt-4 pb-3">
        <div className="text-[12px] text-white/60">chamada em andamento • 00:47</div>
        <div className="text-[26px] font-light mt-1 tracking-tight">{number ?? c.sender}</div>
        <div className="text-[13px] text-white/70">{cleanName(c.sender)}</div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-2 pb-3">
        {lines.map((l, i) => {
          const me = /^Voc[eê]:/i.test(l.trim());
          const m = l.match(/^([^:]{1,40}):\s*([\s\S]*)$/);
          const who = m ? m[1] : '';
          const said = (m ? m[2] : l).replace(/^"|"$/g, '');
          return (
            <div key={i} className={`flex ${me ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13.5px] leading-[18px] ${me ? 'bg-[#0a84ff] rounded-br-sm' : 'bg-white/12 bg-white/10 rounded-bl-sm'}`}>
                {!me && who && <div className="text-[10.5px] text-white/55 mb-0.5">{who}</div>}
                {said}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center pb-6 pt-2">
        <div className="w-16 h-16 rounded-full bg-[#ff3b30] flex items-center justify-center">
          <PhoneOff className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
};

// ---------- Notificacao na tela de bloqueio ----------
const PushScreen = ({ c }: { c: ScamCase }) => {
  const [title, ...rest] = c.messageContent.split(':');
  const body = rest.join(':').trim();
  const app = c.sender.split('/')[0].trim();
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#3a2d5c] via-[#1f2a52] to-[#0f1a2e] text-white">
      <StatusBar time={c.time} dark />
      <div className="text-center pt-6">
        <Lock className="w-4 h-4 mx-auto text-white/80" />
        <div className="text-[13px] text-white/80 mt-2">sábado, 3 de outubro</div>
        <div className="text-[64px] font-semibold leading-none tracking-tight mt-1">{c.time}</div>
      </div>
      <div className="px-3 mt-8">
        <div className="rounded-[20px] bg-white/18 bg-white/15 backdrop-blur-xl p-3 border border-white/10">
          <div className="flex items-center gap-2 text-[12px] text-white/75">
            <div className="w-5 h-5 rounded-md bg-[#820ad1] flex items-center justify-center text-[10px] font-bold">
              {app.charAt(0)}
            </div>
            <span className="uppercase tracking-wide">{app}</span>
            <span className="ml-auto">agora</span>
          </div>
          <div className="mt-1.5 font-semibold text-[14px] capitalize">{title.toLowerCase()}</div>
          <div className="text-[13.5px] text-white/90 leading-[18px] whitespace-pre-wrap">{body}</div>
        </div>
      </div>
    </div>
  );
};

export const PhoneScreen: React.FC<PhoneScreenProps> = ({ scamCase, stamped, wasCorrect }) => {
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
      animate={stamped ? { x: [0, -6, 6, -3, 0], rotate: [0, -0.6, 0.6, 0] } : { x: 0 }}
      transition={{ duration: 0.35, delay: 0.12 }}
      className="relative mx-auto w-full max-w-[340px]"
    >
      {/* aparelho */}
      <div className="relative rounded-[46px] bg-[#0b0d12] p-[10px] shadow-[0_0_0_2px_#2c3142,0_40px_60px_-20px_rgba(0,0,0,0.8)]">
        <div className="relative h-[600px] max-h-[72vh] min-h-[480px] rounded-[36px] overflow-hidden font-phone">
          {screen}
          {/* ilha */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[92px] h-[26px] rounded-full bg-black" />
        </div>
      </div>

      {/* carimbo batendo no celular */}
      <AnimatePresence>
        {stamped && (
          <motion.div
            key={stamped}
            initial={{ scale: 2.6, opacity: 0, rotate: -24 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            transition={{ type: 'spring', stiffness: 520, damping: 22 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div
              className={`stamp px-6 py-2 text-[44px] leading-none bg-white/80 backdrop-blur-[1px] ${
                stamped === 'scam' ? 'text-scam' : 'text-safe'
              }`}
            >
              {stamped === 'scam' ? 'Golpe!' : 'Seguro'}
              <div className="text-[11px] tracking-[0.3em] text-center mt-1 font-mono">
                {wasCorrect ? 'veredito certo' : 'veredito errado'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
