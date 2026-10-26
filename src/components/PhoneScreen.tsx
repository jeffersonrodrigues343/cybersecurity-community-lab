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
  ShieldCheck,
  ShieldAlert,
  Globe,
  UserX,
  X,
  MessageSquare,
  Bell,
  ChevronRight,
  Camera,
  Search,
  Sun,
  MessageCircle,
  CreditCard,
  FileText,
  Check,
  Copy,
  Lightbulb,
  AlertTriangle,
  Send,
  Smile,
  Paperclip,
} from 'lucide-react';
import type { ScamCase, InteractiveAction, InvestigativeClue, AgeGroup } from '../data/scamsData';
import { sound } from '../utils/audio';

type Verdict = 'scam' | 'safe' | null;
export type { AgeGroup };

// Habilidades investigativas do perito
export type Skill = 'question' | 'bank' | 'browser' | 'verdict';

export const SKILL_INFO: Record<Skill, { icon: string; title: string; guide: string }> = {
  question: {
    icon: '💬',
    title: 'Fazer Perguntas',
    guide: 'Pergunte algo que só a pessoa de verdade saberia responder.',
  },
  bank: {
    icon: '🏦',
    title: 'Conferir no Banco',
    guide: 'Abra o app do banco e audite o extrato e o titular da chave Pix no Banco Central.',
  },
  browser: {
    icon: '🌐',
    title: 'Inspecionar Links',
    guide: 'Antes de tocar num link, confira o endereço no navegador para ver a data do site.',
  },
  verdict: {
    icon: '⚖️',
    title: 'Dar o Veredito',
    guide: 'Conferiu as provas? Agora decida com segurança: é golpe ou é seguro.',
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
  onAgeGroupChange?: (age: AgeGroup) => void;
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
// ============================================================================
// TELA DE BLOQUEIO (LOCKSCREEN ESTILO SMARTPHONE COM NOTIFICAÇÃO DO CASO)
// ============================================================================
const LockScreen = ({
  c,
  notificationArrived = false,
  onUnlock,
  onOpenMessaging,
  levelText,
}: {
  c: ScamCase;
  notificationArrived?: boolean;
  onUnlock: () => void;
  onOpenMessaging: () => void;
  levelText?: string;
}) => {
  return (
    <div className="relative flex flex-col h-full bg-gradient-to-b from-[#0b0f19] via-[#111827] to-[#030712] text-white select-none overflow-hidden justify-between p-4">
      {/* Luz ambiente de fundo estilo wallpaper moderno */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/35 via-slate-900/40 to-black pointer-events-none" />

      <StatusBar time={c.time} dark levelText={levelText} />

      {/* Topo da LockScreen: Ícone de Cadeado & Relógio */}
      <div className="flex flex-col items-center pt-2 z-10">
        <Lock className="w-4 h-4 text-white/70 mb-1" />
        <div className="text-[12px] font-medium text-white/80">Sábado, 10 de outubro</div>
        <div className="text-[52px] font-light leading-none tracking-tight font-display mt-0.5 text-white/95 drop-shadow-md">
          {c.time}
        </div>
      </div>

      {/* Centro: Notificação do Caso na LockScreen */}
      <div className="flex-1 flex flex-col justify-center my-auto z-10 max-h-[340px] space-y-2.5 overflow-y-auto no-scrollbar py-2">
        <AnimatePresence>
          {notificationArrived && (
            <motion.div
              key="lockscreen-case-notif"
              initial={{ y: -45, opacity: 0, scale: 0.92 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26, mass: 0.9 }}
              onClick={() => {
                onUnlock();
                onOpenMessaging();
              }}
              className="bg-slate-900/90 hover:bg-slate-850/95 border border-emerald-400/40 rounded-2xl p-3 backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.85)] cursor-pointer active:scale-98 transition group ring-1 ring-emerald-400/20"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold shadow ${
                    c.channel === 'whatsapp' ? 'bg-[#25D366]' : 'bg-[#007aff]'
                  }`}
                >
                  {c.channel === 'whatsapp' ? <MessageSquare className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                </div>
                <span className="font-semibold text-xs text-white truncate">{cleanName(c.sender)}</span>
                <span className="text-[9px] text-emerald-400 font-mono ml-auto">agora</span>
              </div>

              <p className="text-[12px] text-white/90 leading-tight line-clamp-3">
                {c.preview || c.messageContent}
              </p>

              <div className="mt-2.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-emerald-300 font-semibold">
                <span>Toque para abrir</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/60 group-hover:translate-x-0.5 transition" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Base: Deslize para Cima para Desbloquear */}
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
        <div className="flex flex-col items-center text-white/60 text-[11px] font-medium">
          <span className="text-xs">▲</span>
          <span className="text-[10px] tracking-wide font-medium mt-0.5">
            Toque ou deslize para desbloquear
          </span>
        </div>
        <div className="w-28 h-1 rounded-full bg-white/50 shadow-sm" />
      </motion.div>
    </div>
  );
};

// ============================================================================
// BLOCO DE NOTAS LIMPO: APENAS CHECKLIST DE PROCEDIMENTOS DO CASO
// ============================================================================
// ============================================================================
// DICAS DO CELULAR (TIPS NATIVO - GUIA FORENSE DE NAVEGAÇÃO)
// ============================================================================
const TipsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  c?: ScamCase;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-sm max-h-[92vh] overflow-y-auto no-scrollbar bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-4 shadow-2xl text-white space-y-3 ring-1 ring-amber-400/20"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm font-bold">
              💡
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">Dicas do Celular (Tips)</h3>
              <p className="text-[10px] text-white/50">Onde encontrar cada prova no aparelho</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-xs">
              <span>👤</span>
              <span>1. Ficha do Contato (DDD e Chip)</span>
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed">
              Toque no nome do contato no topo do chat para abrir o perfil. Confira o prefixo DDD e a data de ativação do chip. Golpistas compram chips descartáveis de outros estados.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-xs">
              <span>💸</span>
              <span>2. Chave Pix e Titular no Banco Central</span>
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed">
              Ao simular o Pix, o Banco Central sempre exibe o nome de quem vai receber. Verifique se o nome bate com o seu familiar ou se é uma conta &quot;laranja&quot; em nome de um desconhecido.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-xs">
              <span>🏦</span>
              <span>3. App &quot;Meu Banco&quot; (Extrato Oficial)</span>
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed">
              Recebeu SMS de compra aprovada? Não ligue para o 0800 do SMS! Abra o app do banco na tela inicial e audite o extrato oficial com a data e hora exatas da sua última transação.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-xs">
              <span>🎙️</span>
              <span>4. Regra de Ouro: Prova de Voz / Áudio</span>
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed">
              Se alguém pedir dinheiro de número novo alegando urgência, exija um áudio de 5 segundos chamando você pelo nome. Golpistas nunca enviam áudio e sempre dizem que o microfone quebrou.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-xs">
              <span>🌐</span>
              <span>5. Pesquisa Web e Domínios</span>
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed">
              Use o navegador para pesquisar o suposto golpe no Google e inspecionar se a terminação do link pertence a um órgão oficial (como .gov.br ou .com.br).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition cursor-pointer"
        >
          Entendido, voltar ao celular
        </button>
      </motion.div>
    </div>
  );
};

// ============================================================================
// MODAL DE DÚVIDA PERICIAL NA TRANSFERÊNCIA PIX
// ============================================================================
const PixDoubtModal = ({
  isOpen,
  onClose,
  c,
  onConfrontInChat,
  onMarkClue,
}: {
  isOpen: boolean;
  onClose: () => void;
  c: ScamCase;
  onConfrontInChat: (pixClue: InvestigativeClue) => void;
  onMarkClue: (pixClue: InvestigativeClue) => void;
}) => {
  if (!isOpen) return null;

  const pixClue = c.clues.find((cl) => cl.category === 'pix') || c.clues[1] || c.clues[0];
  const titular = pixClue?.inspection.field2Value || 'Valdir dos Santos';
  const chave = pixClue?.inspection.field1Value || '489.120.392-80';
  const banco = pixClue?.inspection.field3Value || 'Nu Pagamentos S.A.';
  const valor = 'R$ 480,00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-sm max-h-[92vh] overflow-y-auto no-scrollbar bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-4 shadow-2xl text-white space-y-3.5 ring-1 ring-amber-400/20"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm font-bold">
              💸
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">Simulação de Pix (DICT)</h3>
              <p className="text-[10px] text-white/50">Consulta oficial ao Banco Central</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card do comprovante simulado */}
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-3 space-y-2 text-xs">
          <div className="flex justify-between items-center text-[11px] text-white/60">
            <span>Valor a Transferir:</span>
            <span className="text-sm font-mono font-bold text-emerald-400">{valor}</span>
          </div>
          <div className="border-t border-white/10 pt-2 space-y-1 text-[11.5px]">
            <div className="flex justify-between">
              <span className="text-white/50">Chave Pix:</span>
              <span className="font-mono font-semibold text-white/90">{chave}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Instituição:</span>
              <span className="font-semibold text-white/90">{banco}</span>
            </div>
            <div className="flex justify-between items-center bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/30">
              <span className="text-amber-400 font-bold text-[11px]">Titular Registrado:</span>
              <span className="font-bold text-amber-300 text-xs">{titular}</span>
            </div>
          </div>
        </div>

        {/* Box da Dúvida Reflexiva */}
        <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/40 space-y-1.5 text-left">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Dúvida Investigativa</span>
          </div>
          <p className="text-[11.5px] text-white/90 leading-relaxed">
            {c.category.includes('Família') || c.category.includes('WhatsApp')
              ? `Espere um pouco... A mensagem dizia ser da sua filha Sofia. Mas o titular cadastrado no Banco Central é "${titular}"! Por que você pagaria uma conta de faculdade para a conta pessoal de um estranho?`
              : `Atenção: A chave Pix informada está em nome de pessoa física ("${titular}"), e não no CNPJ oficial do órgão ou empresa!`}
          </p>
          <div className="text-[10.5px] font-mono text-amber-300/80 pt-1">
            💡 Dica: Esta é a clássica conta de &quot;laranja&quot; usada para pulverizar dinheiro de golpes.
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => onConfrontInChat(pixClue)}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Desconfiar e Confrontar no Chat</span>
          </button>

          <button
            type="button"
            onClick={() => onMarkClue(pixClue)}
            className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-bold text-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Anotar Evidência no Bloco de Notas</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-white/60 hover:text-white font-medium text-xs cursor-pointer text-center"
          >
            Cancelar e Voltar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// MODAL DE EXIGÊNCIA DE PROVA DE VOZ (CHAMADA OU ÁUDIO)
// ============================================================================
const VoiceProofModal = ({
  isOpen,
  onClose,
  c: _c,
  onStartCall,
  onRequestAudio,
}: {
  isOpen: boolean;
  onClose: () => void;
  c: ScamCase;
  onStartCall: () => void;
  onRequestAudio: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#1c1c1e] border border-white/15 rounded-3xl p-4 text-white space-y-3.5 shadow-2xl"
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Exigir Prova de Voz</h3>
              <p className="text-[10px] text-neutral-400">Validar identidade antes de decidir</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          Criminosos usam fotos roubadas e números descartáveis, mas <b>não possuem a voz da pessoa</b> e costumam fugir de ligações telefônicas.
        </p>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartCall();
            }}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white flex items-center justify-between cursor-pointer active:scale-95 transition shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Ligar para o Contato
            </span>
            <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded font-mono">Chamada ➔</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestAudio();
            }}
            className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-semibold text-white flex items-center justify-between cursor-pointer active:scale-95 transition shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Pedir Áudio no Chat (5 segundos)
            </span>
            <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded font-mono">Gravação ➔</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-1.5 text-xs text-neutral-400 hover:text-white font-medium cursor-pointer text-center"
        >
          Cancelar
        </button>
      </motion.div>
    </div>
  );
};

// ============================================================================
// OVERLAY DE CHAMADA TELEFÔNICA (PROVA DE VOZ CONTEXTUALIZADA)
// ============================================================================
const VoiceCallOverlay = ({
  state,
  c,
  onEndCall,
}: {
  state: 'calling' | 'rejected' | 'connected' | null;
  c: ScamCase;
  onEndCall: () => void;
}) => {
  if (!state) return null;
  const number = findContactNumber(c);

  let contextualDialogue = 'Alô? Sim, sou eu mesmo! Pode prosseguir com a verificação.';
  if (c.id === 'case-1-whatsapp') {
    contextualDialogue = 'Chamada recusada pelo contato. Resposta por texto: "Mãe, tô em aula agora na faculdade, o professor não deixa atender! Faz o Pix logo por favor."';
  } else if (c.id === 'case-2-correios') {
    contextualDialogue = 'Mensagem automática da operadora: "O número discado não recebe chamadas ou está temporariamente fora de serviço."';
  } else if (c.id === 'case-3-falsa-central-sms' || c.id === 'case-4-falsa-central') {
    contextualDialogue = 'Falso Atendente (Central 0800): "Aqui é da Central de Prevenção a Fraudes. A compra de R$ 3.890 no Magalu foi pré-aprovada. Para cancelar, você precisa transferir seu saldo disponível para a Conta Segura do Banco Central via Pix agora!"';
  } else if (c.id === 'case-7-vaga-tarefas') {
    contextualDialogue = 'Recusa de chamada. Mensagem automática: "Atendimento de recrutamento Larissa Shopee é realizado exclusivamente pelo grupo de tarefas no Telegram."';
  }

  return (
    <div className="absolute inset-0 z-50 bg-[#121214] text-white flex flex-col justify-between p-6 select-none animate-fadeIn">
      <div className="text-center pt-10 space-y-3">
        <motion.div
          animate={state === 'calling' ? { scale: [1, 1.08, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-neutral-700 to-neutral-500 flex items-center justify-center text-3xl font-bold shadow-2xl border-2 border-white/20"
        >
          {cleanName(c.sender).charAt(0)}
        </motion.div>
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">{cleanName(c.sender)}</h3>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">{number || 'Chamada Telefônica'}</p>
        </div>

        <div className="pt-2">
          {state === 'calling' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-neutral-300 font-medium animate-pulse">
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> Chamando...
            </span>
          )}
          {state === 'rejected' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-xs text-red-400 font-medium border border-red-500/30">
              <PhoneOff className="w-3.5 h-3.5" /> Chamada Recusada pelo Contato
            </span>
          )}
          {state === 'connected' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-xs text-emerald-400 font-medium border border-emerald-500/30">
              <Phone className="w-3.5 h-3.5" /> Conectado (00:03)
            </span>
          )}
        </div>
      </div>

      {(state === 'connected' || state === 'rejected') && (
        <div className="bg-black/60 border border-white/15 rounded-2xl p-3.5 text-xs text-neutral-200 text-center mx-auto max-w-xs shadow-xl leading-relaxed">
          &quot;{contextualDialogue}&quot;
        </div>
      )}

      <div className="pb-8 flex justify-center">
        <button
          type="button"
          onClick={onEndCall}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-2xl transition cursor-pointer"
          title="Encerrar Chamada"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MEU DOSSIÊ DE INVESTIGAÇÃO (CHECKLIST DIEGÉTICO COM ATALHOS DE AÇÃO DIRETA)
// ============================================================================
const getClueGuide = (clue: InvestigativeClue) => {
  if (clue.category === 'phone' || clue.inspection.type === 'contact') {
    return {
      title: 'Você deve verificar o DDD e a procedência do número.',
      steps: [
        'Volte ao app de mensagens (WhatsApp ou SMS).',
        'Toque no nome ou na foto do contato no topo da conversa.',
        'Confira o DDD (prefixo regional) e há quanto tempo o chip foi ativado.',
      ],
    };
  }
  if (clue.category === 'pix' || clue.inspection.type === 'pix') {
    return {
      title: 'Você deve verificar quem é o titular da chave Pix no Banco Central.',
      steps: [
        'Abra o app Meu Banco e consulte a chave Pix.',
        'Confira o nome do dono da conta registrado no Banco Central.',
        'Veja se o dinheiro vai para uma pessoa desconhecida (laranja).',
      ],
    };
  }
  if (clue.category === 'whois' || clue.inspection.type === 'link') {
    return {
      title: 'Você deve verificar o endereço real do link no navegador.',
      steps: [
        'Abra o navegador e examine o endereço do link com calma.',
        'Confira a terminação do domínio (veja se termina em .online ou se é oficial .com.br).',
        'Verifique a data de criação do site no exterior.',
      ],
    };
  }
  if (clue.category === 'system' || clue.inspection.type === 'official' || clue.name.toLowerCase().includes('banco') || clue.name.toLowerCase().includes('extrato')) {
    return {
      title: 'Você deve conferir seu extrato no aplicativo oficial do banco.',
      steps: [
        'Abra o aplicativo Meu Banco e consulte a aba Extrato.',
        'Confira o histórico de compras e débitos de hoje.',
        'Veja se a cobrança alarmada na mensagem realmente existe na conta.',
      ],
    };
  }
  return {
    title: 'Você deve exigir uma prova de voz real antes de qualquer decisão.',
    steps: [
      'Ligue para o contato ou faça uma chamada telefônica de teste.',
      'Nunca faça transferências sem ouvir a voz real da pessoa.',
      'Desconfie de desculpas de microfone quebrado ou recusa em atender.',
    ],
  };
};

const NotesScreen = ({
  c,
  inspectedClueIds = [],
  onBack,
  onOpenVerdict,
  onOpenTips,
}: {
  c: ScamCase;
  inspectedClueIds: string[];
  onBack: () => void;
  onOpenVerdict?: () => void;
  onOpenTips?: () => void;
  onOpenBank?: () => void;
  onOpenBrowser?: (url?: string) => void;
  onStartVoiceCall?: () => void;
  onOpenContactModal?: () => void;
}) => {
  const isStepChecked = (idx: number) => {
    return Boolean(c.clues[idx] && inspectedClueIds.includes(c.clues[idx].id));
  };

  const completedCount = [0, 1, 2].filter((idx) => isStepChecked(idx)).length;
  const totalClues = Math.min(3, c.clues.length);

  return (
    <div className="flex flex-col h-full bg-[#1c1c1e] text-white select-none">
      <StatusBar time={c.time} dark />

      {/* Header do App Notas */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/10 bg-[#2c2c2e]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Início</span>
        </button>
        <div className="flex items-center gap-1.5 font-semibold text-xs text-neutral-100">
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>Notas</span>
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenTips && (
            <button
              type="button"
              onClick={onOpenTips}
              className="flex items-center gap-1 text-[10.5px] font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 px-2 py-0.5 rounded-full cursor-pointer transition"
            >
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>Ajuda</span>
            </button>
          )}
          <span className="text-[11px] font-mono text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full font-semibold">
            {completedCount}/{totalClues}
          </span>
        </div>
      </div>

      {/* Conteúdo da Nota Pessoal */}
      <div className="flex-1 overflow-y-auto no-scrollbar overscroll-contain p-4 space-y-3">
        <div className="border-b border-white/10 pb-2.5">
          <div className="text-[10px] text-neutral-400">
            Nota fixada • Hoje às {c.time}
          </div>
          <h2 className="text-sm font-bold text-white mt-0.5">
            Lembretes de segurança antes de fazer Pix ou clicar em links
          </h2>
        </div>

        {/* Lista de conferência pessoal sem botões mágicos de teletransporte */}
        <div className="space-y-2.5">
          {c.clues.slice(0, 3).map((clue, idx) => {
            const isChecked = isStepChecked(idx);
            const guide = getClueGuide(clue);

            return (
              <div
                key={clue.id || idx}
                className={`p-3 rounded-xl border ${
                  isChecked
                    ? 'bg-emerald-950/25 border-emerald-500/35'
                    : 'bg-[#2c2c2e] border-white/10'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isChecked
                        ? 'bg-emerald-500 text-white'
                        : 'border border-amber-400/70 bg-transparent'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">
                        {idx + 1}. {clue.name}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                          isChecked
                            ? 'text-emerald-300 bg-emerald-500/15'
                            : 'text-amber-300 bg-amber-500/15'
                        }`}
                      >
                        {isChecked ? 'Conferido' : 'Falta olhar'}
                      </span>
                    </div>

                    {!isChecked ? (
                      <div className="mt-1.5 space-y-1 text-[11px] text-neutral-300 leading-snug">
                        <p className="text-neutral-200 font-medium">{guide.title}</p>
                        {guide.steps.map((stepText, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-1.5 text-neutral-400">
                            <span>•</span>
                            <span>{stepText}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1.5 space-y-1">
                        <p className="text-[11px] text-neutral-300 leading-relaxed">
                          {clue.inspection.observation}
                        </p>
                        <div className="text-[10.5px] text-emerald-300 font-medium">
                          ✓ Anotado: {clue.evidenceResult.fato}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {completedCount >= totalClues && onOpenVerdict && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-center space-y-2 mt-2">
            <p className="text-xs text-white/90 font-medium">
              Você já conferiu os 3 itens no celular. Já pode tomar sua decisão com segurança.
            </p>
            <button
              type="button"
              onClick={onOpenVerdict}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Tomar Decisão sobre o Caso</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// APP MEU BANCO DIGITAL (FIDELIDADE DE SISTEMA OPERACIONAL BANCÁRIO REAL)
// ============================================================================
const BankScreen = ({
  c,
  inspectedClueIds = [],
  hasOpenedScamMessage: _hasOpenedScamMessage = false,
  copiedPixKey = null,
  onInspectClue,
  onConfrontPixInChat: _onConfrontPixInChat,
  onBack,
}: {
  c: ScamCase;
  inspectedClueIds?: string[];
  hasOpenedScamMessage?: boolean;
  copiedPixKey?: string | null;
  onInspectClue?: (clue: InvestigativeClue) => void;
  onConfrontPixInChat?: (clue: InvestigativeClue) => void;
  onBack: () => void;
}) => {
  const pixClue = c.clues.find(
    (k) => k.category === 'pix' || k.inspection.type === 'pix'
  );
  const bankClue = c.clues.find(
    (k) =>
      k.category === 'system' ||
      k.inspection.type === 'official' ||
      k.id.includes('fatura') ||
      k.id.includes('banco') ||
      k.id.includes('extrato')
  );

  const [activeTab, setActiveTab] = useState<'pix' | 'statement'>(() => {
    return pixClue ? 'pix' : 'statement';
  });

  const [enteredKey, setEnteredKey] = useState<string>(
    () => copiedPixKey || pixClue?.inspection.field1Value || ''
  );
  const [hasQueriedPix, setHasQueriedPix] = useState<boolean>(() =>
    Boolean(copiedPixKey || pixClue)
  );

  useEffect(() => {
    if (copiedPixKey) {
      setEnteredKey(copiedPixKey);
      setHasQueriedPix(true);
    }
  }, [copiedPixKey]);

  const pixTargetName = pixClue?.inspection.field2Value || 'Valdir dos Santos';
  const pixBankName = pixClue?.inspection.field3Value || 'Pessoa Física - Nu Pagamentos S.A.';
  const matchedAmount = c.messageContent.match(/R\$\s?[\d.,]+/)?.[0];
  const pixAmount =
    matchedAmount ||
    (c.clues[0]?.inspection?.field3Value?.includes('R$')
      ? c.clues[0].inspection.field3Value
      : 'R$ 480,00');

  const isPixInspected = Boolean(pixClue && inspectedClueIds.includes(pixClue.id));
  const isBankInspected = Boolean(bankClue && inspectedClueIds.includes(bankClue.id));

  // Registra silenciosamente quando o jogador visualiza os dados bancários reais
  useEffect(() => {
    if (activeTab === 'pix' && hasQueriedPix && pixClue && !isPixInspected) {
      const t = setTimeout(() => {
        onInspectClue?.(pixClue);
      }, 650);
      return () => clearTimeout(t);
    }
  }, [activeTab, hasQueriedPix, pixClue, isPixInspected, onInspectClue]);

  useEffect(() => {
    if (activeTab === 'statement' && bankClue && !isBankInspected) {
      const t = setTimeout(() => {
        onInspectClue?.(bankClue);
      }, 650);
      return () => clearTimeout(t);
    }
  }, [activeTab, bankClue, isBankInspected, onInspectClue]);

  const isCaseLegitimate = !c.isScam;

  return (
    <div className="flex flex-col h-full bg-[#0d0914] text-white select-none">
      <StatusBar time={c.time} dark />

      {/* Topo do Aplicativo Bancário */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/5 bg-[#140e21]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-purple-300 hover:text-white font-medium cursor-pointer active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Início</span>
        </button>
        <div className="flex items-center gap-1.5 font-semibold text-xs text-white tracking-wide">
          <CreditCard className="w-3.5 h-3.5 text-purple-300" />
          <span>Meu Banco</span>
        </div>
        <span className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-3">
        {/* Saldo em Conta */}
        <div className="bg-[#181126] rounded-2xl p-3.5 border border-purple-500/15 shadow-sm">
          <span className="text-[11px] text-purple-300/70 font-medium">Conta • Saldo disponível</span>
          <div className="text-2xl font-bold font-mono tracking-tight mt-0.5 text-white">R$ 1.250,00</div>
        </div>

        {/* Navegação do App */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-xl border border-white/5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('pix')}
            className={`py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'pix'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Área Pix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('statement')}
            className={`py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'statement'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Extrato da Conta
          </button>
        </div>

        {/* ================= ABA 1: ÁREA PIX ================= */}
        {activeTab === 'pix' && (
          <div className="space-y-3">
            {hasQueriedPix ? (
              /* Tela Realista de Revisão de Pix (Sem Spoilers Forenses) */
              <div className="bg-[#181126] rounded-2xl p-4 border border-purple-500/15 space-y-3.5">
                <div className="pb-2 border-b border-white/5">
                  <span className="text-xs font-semibold text-white block">
                    Transferindo {pixAmount}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Confira os dados de quem vai receber antes de confirmar
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[10px] text-neutral-400 block">Para</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      {pixTargetName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-neutral-400">Chave Pix</span>
                    <span className="font-mono text-neutral-200">
                      {enteredKey || pixClue?.inspection.field1Value}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-neutral-400">Instituição</span>
                    <span className="text-neutral-200 text-right">{pixBankName}</span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-neutral-400">Quando</span>
                    <span className="text-neutral-200">Agora ({c.time})</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={onBack}
                    className="w-full py-2.5 px-3 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/15 text-white transition cursor-pointer"
                  >
                    Cancelar transferência
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasQueriedPix(false)}
                    className="w-full py-2 text-[11px] text-purple-300 hover:text-white transition cursor-pointer text-center"
                  >
                    Digitar outra chave Pix
                  </button>
                </div>
              </div>
            ) : (
              /* Entrada de Chave Pix */
              <div className="bg-[#181126] rounded-2xl p-4 border border-purple-500/15 space-y-3">
                <span className="text-xs font-medium text-neutral-200 block">
                  Para quem você quer transferir?
                </span>

                {(copiedPixKey || pixClue?.inspection.field1Value) && (
                  <button
                    type="button"
                    onClick={() => {
                      const k = copiedPixKey || pixClue?.inspection.field1Value || '';
                      setEnteredKey(k);
                      setHasQueriedPix(true);
                    }}
                    className="w-full py-2 px-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-xl text-purple-200 text-xs font-medium flex items-center justify-between cursor-pointer transition"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      Chave da área de transferência: {copiedPixKey || pixClue?.inspection.field1Value}
                    </span>
                    <span className="text-[10px] text-purple-300 font-bold ml-1">Usar</span>
                  </button>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={enteredKey}
                    onChange={(e) => setEnteredKey(e.target.value)}
                    placeholder="CPF, celular, e-mail ou chave..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (enteredKey.trim()) setHasQueriedPix(true);
                    }}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= ABA 2: EXTRATO ================= */}
        {activeTab === 'statement' && (
          <div className="bg-[#181126] rounded-2xl p-4 border border-purple-500/15 space-y-3">
            <span className="text-xs font-semibold text-white block">Histórico de Movimentações</span>

            <div className="space-y-3 text-xs divide-y divide-white/5">
              {isCaseLegitimate ? (
                <div className="pt-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">Padaria Estrela</span>
                    <span className="font-mono font-bold text-white">- R$ 34,90</span>
                  </div>
                  <span className="text-[10.5px] text-neutral-400 block mt-0.5">
                    Hoje, 08:44 • Compra no débito
                  </span>
                </div>
              ) : (
                <div className="pt-1">
                  <div className="flex justify-between items-center text-neutral-200">
                    <span className="font-medium">Hoje</span>
                    <span className="text-[10.5px] text-neutral-400 font-mono">R$ 0,00</span>
                  </div>
                  <span className="text-[11px] text-neutral-400 block mt-0.5">
                    Nenhuma compra no cartão ou transferência realizada hoje.
                  </span>
                </div>
              )}

              <div className="pt-2.5">
                <div className="flex justify-between items-center text-neutral-300">
                  <span>Supermercado Central</span>
                  <span className="font-mono text-neutral-400">- R$ 112,40</span>
                </div>
                <span className="text-[10.5px] text-neutral-500 block mt-0.5">
                  07 de outubro • Compra no débito
                </span>
              </div>

              <div className="pt-2.5">
                <div className="flex justify-between items-center text-neutral-300">
                  <span>Farmácia São João</span>
                  <span className="font-mono text-neutral-400">- R$ 48,00</span>
                </div>
                <span className="text-[10.5px] text-neutral-500 block mt-0.5">
                  04 de outubro • Compra no débito
                </span>
              </div>
            </div>
          </div>
        )}
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
  chancesLeft = 2,
  isPericial = false,
  onClose,
  onConfirm,
}: {
  c: ScamCase;
  isOpen: boolean;
  chancesLeft?: number;
  isPericial?: boolean;
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
        {/* Cabeçalho do Veredito */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-base font-bold shrink-0">
              ⚖️
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                {isPericial ? 'Perícia Forense Completa' : `Julgamento Direto (${chancesLeft}/2 chances)`}
              </div>
              <h3 className="text-xs font-bold text-white">Veredito & Prova Material</h3>
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
            1. Qual é o seu veredito técnico sobre o caso?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playBlip();
                setChosenVerdict('scam');
              }}
              className={`min-h-[52px] p-2.5 rounded-xl border text-left cursor-pointer transition active:scale-95 ${
                chosenVerdict === 'scam'
                  ? 'bg-red-600 border-red-400 text-white shadow-lg ring-2 ring-red-400/50'
                  : 'bg-white/5 border-white/10 hover:border-red-400/40 text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                <ShieldAlert className="w-4 h-4 text-red-300" />
                <span>É Golpe!</span>
              </div>
              <span className="text-[10px] opacity-80 leading-tight block">
                Tentativa criminosa de roubar dinheiro ou dados.
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playBlip();
                setChosenVerdict('safe');
              }}
              className={`min-h-[52px] p-2.5 rounded-xl border text-left cursor-pointer transition active:scale-95 ${
                chosenVerdict === 'safe'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-400/50'
                  : 'bg-white/5 border-white/10 hover:border-emerald-400/40 text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>É Seguro!</span>
              </div>
              <span className="text-[10px] opacity-80 leading-tight block">
                Mensagem autêntica, legítima e sem risco.
              </span>
            </button>
          </div>
        </div>

        {/* ETAPA 2: Cartões Visuais de Evidência (A Prova Material) */}
        {chosenVerdict && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 pt-1 border-t border-white/10"
          >
            <label className="text-[11px] font-semibold text-amber-300 block">
              2. Qual prova concreta confirma a sua decisão?
              <span className="text-[10px] text-white/60 font-normal block mt-0.5">
                Selecione o cartão com a evidência técnica incontestável:
              </span>
            </label>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
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
                    className={`w-full min-h-[48px] p-3 rounded-xl border text-left transition text-xs cursor-pointer active:scale-98 flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-amber-500/25 border-amber-400 text-white font-medium ring-2 ring-amber-400/50 shadow-md'
                        : 'bg-white/5 border-white/10 hover:border-white/25 text-neutral-300'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold mt-0.5 ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug text-[11.5px] flex-1">
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
            className={`w-full min-h-[48px] py-3 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
              chosenVerdict && selectedHypothesisIndex !== null
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-95'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            <span>Confirmar Veredito Técnico ➔</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// MODAL DE RECALIBRAÇÃO DIDÁTICA (1º ERRO - INDÍCIO CIRCUNSTANCIAL VS PROVA REAL)
// ============================================================================
const DidacticFeedbackModal = ({
  isOpen,
  onClose,
  onRetryVerdict,
  onInvestigate,
  feedback,
  isCircumstantial,
  chancesLeft,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRetryVerdict: () => void;
  onInvestigate: () => void;
  feedback: string;
  isCircumstantial: boolean;
  chancesLeft: number;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="w-full max-w-sm bg-slate-900 border-2 border-amber-400 rounded-3xl p-4 shadow-2xl text-white space-y-3.5 ring-1 ring-amber-400/30"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block">
                {isCircumstantial ? 'Indício Circunstancial' : 'Evidência Incorreta'}
              </span>
              <h3 className="text-xs font-bold text-white">Você gastou 1 chance ({chancesLeft} restante)</h3>
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

        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-2">
          <p className="text-xs text-amber-100 leading-relaxed font-medium">
            {feedback}
          </p>
          <p className="text-[11px] text-amber-300/90 italic">
            💡 Dica de Perito: Golpistas se aproveitam de pressa e suposições. Você pode investigar nos apps do celular para confirmar com 100% de certeza!
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onInvestigate}
            className="w-full min-h-[46px] py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🔍 Investigar no Celular Primeiro (Recomendado)</span>
          </button>
          <button
            type="button"
            onClick={onRetryVerdict}
            className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-200 font-semibold text-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>⚖️ Tentar Julgar Novamente (Última Chance)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// MODAL DE BLOQUEIO POR IMPULSO (2º ERRO - PERÍCIA OBRIGATÓRIA NO DOSSIÊ)
// ============================================================================
const LockoutModal = ({
  isOpen,
  onOpenNotes,
}: {
  isOpen: boolean;
  onOpenNotes: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/90 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="w-full max-w-sm bg-slate-900 border-2 border-red-500 rounded-3xl p-4 shadow-2xl text-white space-y-3.5 ring-2 ring-red-500/20"
      >
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center text-base font-bold shrink-0">
            🔒
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-red-400 block">
              Tentativas Diretas Esgotadas
            </span>
            <h3 className="text-xs font-bold text-white">Perícia Obrigatória Ativada</h3>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2">
          <p className="text-xs text-red-100 leading-relaxed">
            Você gastou as <strong>2 chances diretas</strong> de veredito sem apontar a prova material concreta.
          </p>
          <p className="text-[11.5px] text-neutral-300 leading-relaxed">
            Para não agir por impulso e se proteger de fraudes reais, você agora deve abrir o seu <strong>Dossiê</strong> e checar as 3 evidências nos apps do celular antes de poder julgar novamente.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNotes}
          className="w-full min-h-[48px] py-3 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>📋 Abrir Meu Dossiê de Investigação ➔</span>
        </button>
      </motion.div>
    </div>
  );
};

// ============================================================================
// BARRA DE AÇÃO DE VEREDITO UNIFICADA (ESTÁVEL E SEM PISCAR)
// ============================================================================
const VerdictActionBar = ({
  directChancesLeft,
  isDirectVerdictLocked,
  inspectedClueCount,
  stamped,
  onOpenVerdictModal,
  onOpenNotes,
}: {
  directChancesLeft: number;
  isDirectVerdictLocked: boolean;
  inspectedClueCount: number;
  stamped: Verdict;
  onOpenVerdictModal: () => void;
  onOpenNotes: () => void;
}) => {
  if (stamped) return null;

  if (isDirectVerdictLocked && inspectedClueCount < 3) {
    return (
      <div className="p-2 pt-1 w-full">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenNotes();
          }}
          className="w-full min-h-[42px] py-2 px-3 rounded-xl bg-slate-900 border border-amber-400/50 hover:border-amber-400 text-amber-200 font-bold text-xs shadow-sm transition cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Verificações pendentes ({inspectedClueCount}/3) • Abrir Notas</span>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-2 pt-1 w-full">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenVerdictModal();
        }}
        className="w-full min-h-[42px] py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm transition cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm">⚖️</span>
          <span>
            {inspectedClueCount >= 3
              ? 'Dar Veredito Final'
              : `Dar Veredito (${directChancesLeft}/2 chances)`}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold bg-slate-950/15 px-2 py-0.5 rounded-md shrink-0">
          <span>Decidir</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </button>
    </div>
  );
};

// ============================================================================
// APP NAVEGADOR MOBILE REALISTA (GOOGLE BRASIL & NAVEGAÇÃO WEB)
// ============================================================================
const BrowserScreen = ({
  c,
  url,
  inspectedClueIds = [],
  onInspectClue,
  onBack,
}: {
  c: ScamCase;
  url?: string;
  inspectedClueIds?: string[];
  onInspectClue?: (clue: InvestigativeClue) => void;
  onBack: () => void;
}) => {
  const hasSpecificUrl = Boolean(url && url !== 'https://pesquisa-segura.com.br');
  const [activeTab, setActiveTab] = useState<'google' | 'site'>(hasSpecificUrl ? 'site' : 'google');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);

  const browserClue = c.clues.find(
    (k) =>
      k.category === 'whois' ||
      k.inspection.type === 'link' ||
      k.id.includes('url') ||
      k.id.includes('google') ||
      k.id.includes('rh')
  );
  const trackingClue = c.clues.find((k) => k.id === 'clue-2-rastreio');

  const isBrowserClueInspected = Boolean(browserClue && inspectedClueIds.includes(browserClue.id));
  const isTrackingClueInspected = Boolean(trackingClue && inspectedClueIds.includes(trackingClue.id));

  const displayUrl = url || 'https://www.google.com.br';
  const isSuspicious = c.isScam;

  // Registra silenciosamente quando o jogador abre e examina o link externo
  useEffect(() => {
    if (activeTab === 'site' && hasSpecificUrl && browserClue && !isBrowserClueInspected) {
      const t = setTimeout(() => {
        onInspectClue?.(browserClue);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [activeTab, hasSpecificUrl, browserClue, isBrowserClueInspected, onInspectClue]);

  const getSuggestedQueries = () => {
    const text = `${c.title} ${c.messageContent} ${c.sender}`.toLowerCase();
    const suggestions: string[] = [];

    if (text.includes('correios') || text.includes('nl8392019br') || text.includes('alfandega')) {
      suggestions.push('rastrear objeto NL8392019BR correios oficial');
      suggestions.push('correios cobram taxa por link de sms .online?');
    }
    if (text.includes('magalu') || text.includes('0800 729 0001') || text.includes('3.890')) {
      suggestions.push('sms compra aprovada 0800 729 0001 magazine luiza');
      suggestions.push('central 0800 pede pix para cancelar compra no cartão');
    }
    if (text.includes('mãe') || text.includes('filha') || text.includes('número novo')) {
      suggestions.push('filho pedindo pix de número novo celular quebrado');
    }
    if (text.includes('vaga') || text.includes('shopee') || text.includes('tarefas')) {
      suggestions.push('trabalho curtir vídeos pagar taxa vip de 100 reais');
      suggestions.push('shopee contrata avaliadores por grupo de telegram?');
    }

    if (suggestions.length === 0) {
      suggestions.push('como saber se mensagem cobrando pix é verdadeira');
    }

    return suggestions;
  };

  const handleExecuteSearch = (query: string) => {
    if (!query.trim()) return;
    sound.playGoogleSearch();
    const q = query.trim();
    setSubmittedQuery(q);
    setSearchQuery(q);
    if (browserClue && !isBrowserClueInspected) {
      onInspectClue?.(browserClue);
    }
    if (trackingClue && !isTrackingClueInspected && /nl8392019br|rastrear|correios/i.test(q)) {
      onInspectClue?.(trackingClue);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e24] text-white select-none">
      <StatusBar time={c.time} dark />

      {/* Barra de Endereço do Navegador Mobile */}
      <div className="px-3 py-2 border-b border-white/10 bg-[#16161a]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-1 hover:bg-white/10 rounded-full cursor-pointer text-neutral-300 transition"
            title="Voltar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

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
                    ? 'bg-neutral-700 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span className="truncate max-w-[110px]">
                  {displayUrl.replace(/https?:\/\//, '')}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo do Navegador */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'google' ? (
          <div className="min-h-full bg-white text-slate-800 p-3.5 flex flex-col">
            <div className="flex flex-col items-center pt-2 pb-3">
              <div className="flex items-center text-3xl font-bold tracking-tight select-none">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
              </div>
            </div>

            <div className="relative mb-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-full px-3 py-2 shadow-2xs focus-within:border-blue-500 transition">
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
                  placeholder="Pesquisar ou digitar endereço..."
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
              </div>
            </div>

            {/* Sugestões de busca do Google */}
            <div className="mb-3">
              <span className="text-[10px] font-medium text-slate-400 block mb-1.5 px-1">
                Pesquisas relacionadas
              </span>
              <div className="flex flex-col gap-1.5">
                {getSuggestedQueries().map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleExecuteSearch(q)}
                    className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-[11.5px] transition cursor-pointer flex items-center gap-2"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate flex-1">{q}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resultados da Busca (SERP Realista) */}
            {submittedQuery && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                {c.id === 'case-2-correios' && (
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
                    <div className="text-[10px] text-slate-500">
                      rastreamento.correios.com.br › oficial
                    </div>
                    <h5 className="text-[12.5px] font-bold text-blue-700 leading-snug">
                      Rastreamento Oficial dos Correios - Consulta de Objetos
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Resultado para <b>NL8392019BR</b>: Objeto não encontrado na base de dados dos Correios. Importações reais só podem ser consultadas e pagas pelo portal oficial <b>correios.com.br</b> (Minhas Importações).
                    </p>
                  </div>
                )}

                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
                  <div className="text-[10px] text-slate-500">
                    g1.globo.com › economia › seguranca-digital
                  </div>
                  <h5 className="text-[12.5px] font-bold text-blue-700 leading-snug">
                    Como funcionam os golpes de urgência por WhatsApp e SMS no Brasil
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Bancos, Correios e grandes empresas nunca enviam links terminados em <b>.online</b> nem pedem transferências Pix para pessoas físicas, cancelamento de compras ou liberação de vagas de emprego.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Aba: Visualização Realista da Página Web / Certificado do Domínio */
          <div className="p-3.5 space-y-3">
            <div className="bg-black/50 border border-white/10 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono break-all text-neutral-200">
                <Info className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>{displayUrl}</span>
              </div>
              <div className="text-[11px] text-neutral-400 border-t border-white/10 pt-2 space-y-1">
                <div>
                  <span className="text-neutral-500">Domínio: </span>
                  <span className="text-neutral-200 font-mono">
                    {browserClue?.inspection.field1Value || displayUrl}
                  </span>
                </div>
                {browserClue && (
                  <>
                    <div>
                      <span className="text-neutral-500">{browserClue.inspection.field2Label}: </span>
                      <span className="text-neutral-200">{browserClue.inspection.field2Value}</span>
                    </div>
                    {browserClue.inspection.field3Label && (
                      <div>
                        <span className="text-neutral-500">{browserClue.inspection.field3Label}: </span>
                        <span className="text-neutral-200">{browserClue.inspection.field3Value}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Simulação da Página Aberta */}
            <div className="bg-white text-slate-900 rounded-xl p-3.5 space-y-2.5 shadow">
              <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
                {c.id === 'case-2-correios'
                  ? 'Portal Expresso de Taxas Aduaneiras (.online)'
                  : 'Página Externa'}
              </div>
              <p className="text-[11.5px] text-slate-600 leading-relaxed">
                {isSuspicious
                  ? browserClue?.inspection.observation ||
                    'Esta página solicita pagamento imediato exclusivamente via chave Pix avulsa, sem login oficial.'
                  : 'Página institucional verificada.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('google')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer"
              >
                Pesquisar este endereço no Google
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// GERADOR DE PERGUNTAS COTIDIANAS ("O QUE A DONA MARIA MANDARIA?")
// ============================================================================
const getClueConfrontationAction = (
  clue: InvestigativeClue,
  c: ScamCase,
  ageGroup: AgeGroup = 'adult',
  isPixAlreadyChecked = false
): InteractiveAction => {
  const isSenior = ageGroup === 'senior';

  // FASE 1: Falsa Filha no WhatsApp
  if (clue.id === 'clue-1-ddd') {
    return {
      id: `act-${c.id}-ddd`,
      label: isSenior
        ? 'Filha, o que aconteceu com o seu celular antigo?'
        : 'Ué filha, o que houve com seu celular antigo?',
      actionType: 'investigation',
      playerMessage: isSenior
        ? 'Filha do céu, mas o que aconteceu com o seu celular antigo? Onde você arrumou esse outro número?'
        : 'Ué Sofia, o que houve com o seu celular antigo? De quem é esse número que você tá usando?',
      replyMessage:
        'Mãe, meu celular caiu na escada da faculdade hoje cedo e apagou a tela toda! Comprei esse chip provisório na banca aqui perto só pra falar com você. Me ajuda logo com o Pix antes das 15h!',
      evidenceDiscovered: {
        id: `ev-${c.id}-ddd`,
        title: 'Desculpa de Celular Quebrado e Chip Provisório',
        description: 'A pessoa diz que quebrou a tela hoje e pegou um chip avulso para pedir dinheiro rápido.',
        status: 'suspicious',
        forensicFact: 'Golpistas usam a desculpa de celular quebrado para justificar um número desconhecido.',
      },
    };
  }

  if (clue.id === 'clue-1-behavior') {
    return {
      id: `act-${c.id}-audio`,
      label: isSenior
        ? 'Me manda um áudio rapidinho pra mãe ouvir sua voz'
        : 'Manda um áudio rápido aí pra eu ouvir sua voz',
      actionType: 'investigation',
      playerMessage: isSenior
        ? 'Sofia, me manda um áudio curtinho falando comigo só pra mãe ouvir sua voz e ficar mais tranquila.'
        : 'Me manda um áudio rápido aí falando comigo só pra eu ouvir sua voz antes de fazer qualquer Pix.',
      replyMessage:
        'Mãe, esse aparelho emprestado tá com o microfone estragado, quando tento gravar áudio sai tudo mudo! E tô dentro da secretaria agora, não posso atender ligação! Faz logo por favor!',
      evidenceDiscovered: {
        id: `ev-${c.id}-audio`,
        title: 'Recusa em Mandar Áudio ou Atender Ligação',
        description: 'O contato inventou que o microfone está estragado para não mandar áudio.',
        status: 'suspicious',
        forensicFact: 'Nunca transfira dinheiro para número novo sem ouvir a voz real do familiar.',
      },
    };
  }

  if (clue.id === 'clue-1-pix') {
    const titular = clue.inspection.field2Value || 'Valdir dos Santos';
    if (isPixAlreadyChecked) {
      return {
        id: `act-${c.id}-pix`,
        label: `No banco apareceu ${titular}! Quem é esse?`,
        actionType: 'investigation',
        playerMessage: `Coloquei esse CPF aqui no aplicativo do Meu Banco e apareceu o nome de ${titular}! Quem é esse homem?! A faculdade não cobra por boleto?`,
        replyMessage:
          'Mãe, o Valdir é o coordenador financeiro aqui da secretaria! Como o sistema de boletos caiu, ele autorizou receber na conta pessoal dele pra segurar minha vaga. Faz logo por favor!',
        evidenceDiscovered: {
          id: `ev-${c.id}-pix`,
          title: `Chave Pix em Nome de Terceiro (${titular})`,
          description: `A conta Pix pertence a ${titular} e não à faculdade ou à filha.`,
          status: 'suspicious',
          forensicFact: 'Instituições de ensino cobram por boleto oficial ou CNPJ, nunca no CPF de funcionários.',
        },
      };
    }
    return {
      id: `act-${c.id}-pix`,
      label: isSenior
        ? 'Mas por que pagar no CPF de outra pessoa e não em boleto?'
        : 'Por que pagar em CPF de pessoa física e não boleto?',
      actionType: 'investigation',
      playerMessage: isSenior
        ? 'Filha, mas a faculdade não cobra por boleto bancário? Por que você me passou o CPF de uma pessoa física?'
        : 'Mas a faculdade não emite boleto no sistema deles? Por que tenho que fazer Pix para um CPF?',
      replyMessage:
        'Mãe, o sistema de boletos da faculdade saiu do ar hoje! O coordenador financeiro (Sr. Valdir) pediu pra transferir direto pro CPF dele pra não cancelar minha matrícula. Faz o Pix de R$ 480 agora por favor!',
      evidenceDiscovered: {
        id: `ev-${c.id}-pix`,
        title: `Cobrança em CPF de Terceiro (${titular})`,
        description: 'O contato pede transferência para o CPF pessoal de um suposto coordenador em vez da faculdade.',
        status: 'suspicious',
        forensicFact: 'Faculdades e empresas nunca cobram mensalidades na conta pessoal de terceiros.',
      },
    };
  }

  // FASE 2: SMS dos Correios
  if (clue.id === 'clue-2-rastreio') {
    return {
      id: `act-${c.id}-rastreio`,
      label: 'Responder: "Que pacote é esse? Não encomendei nada"',
      actionType: 'investigation',
      playerMessage: 'Que pacote NL8392019BR é esse? Não tenho nenhuma encomenda retida.',
      replyMessage:
        '[Mensagem Automática]: O objeto NL8392019BR será devolvido hoje caso a guia de R$ 27,90 não seja paga pelo link enviado.',
      evidenceDiscovered: {
        id: `ev-${c.id}-rastreio`,
        title: 'Cobrança Automática Sem Identificação',
        description: 'A mensagem pressiona o pagamento imediato sem informar dados reais da compra.',
        status: 'suspicious',
        forensicFact: 'Encomendas reais devem ser conferidas diretamente no app ou site oficial correios.com.br.',
      },
    };
  }

  if (clue.id === 'clue-2-remetente') {
    return {
      id: `act-${c.id}-remetente`,
      label: 'Responder: "Por que esse SMS veio de um celular comum?"',
      actionType: 'investigation',
      playerMessage: 'Por que esse aviso dos Correios veio de um número de celular comum?',
      replyMessage:
        '[Sistema de Despacho]: Canal temporário de notificação. Acesse o link imediatamente para regularizar seu CPF na alfândega.',
      evidenceDiscovered: {
        id: `ev-${c.id}-remetente`,
        title: 'SMS Enviado por Número de Celular Comum',
        description: 'O aviso partiu de um número móvel comum de 9 dígitos.',
        status: 'suspicious',
        forensicFact: 'Órgãos oficiais utilizam códigos curtos (shortcodes) de 5 dígitos.',
      },
    };
  }

  if (clue.id === 'clue-2-url') {
    return {
      id: `act-${c.id}-url`,
      label: 'Responder: "Esse site .online não é o oficial dos Correios"',
      actionType: 'investigation',
      playerMessage: 'O site dos Correios é correios.com.br, por que esse link termina em .online?',
      replyMessage:
        '[Aviso Final]: Link externo exclusivo para pagamento rápido via Pix. Prazo encerrando hoje.',
      evidenceDiscovered: {
        id: `ev-${c.id}-url`,
        title: 'Link Externo Terminado em .online',
        description: 'O endereço indicado no SMS não pertence ao domínio oficial correios.com.br.',
        status: 'suspicious',
        forensicFact: 'Os Correios nunca cobram taxas por links terminados em .online, .top ou .site.',
      },
    };
  }

  // FASE 3: SMS Falsa Central 0800
  if (clue.id === 'clue-3-extrato') {
    return {
      id: `act-${c.id}-extrato`,
      label: 'Responder: "Não fiz essa compra! Vou olhar meu app do banco"',
      actionType: 'investigation',
      playerMessage: 'Eu não fiz nenhuma compra de R$ 3.890! Vou abrir o aplicativo do meu banco agora para olhar o extrato.',
      replyMessage:
        '[Alerta Automático]: Transação em pré-autorização. Para impedir o lançamento na fatura, ligue imediatamente para 0800 729 0001.',
      evidenceDiscovered: {
        id: `ev-${c.id}-extrato`,
        title: 'Pressão para Ligar no 0800 Sem Olhar o Extrato',
        description: 'A mensagem tenta assustar para que você ligue no 0800 antes de conferir o app do banco.',
        status: 'suspicious',
        forensicFact: 'Sempre confira o extrato diretamente no aplicativo oficial do seu banco.',
      },
    };
  }

  if (clue.id === 'clue-3-central-0800') {
    return {
      id: `act-${c.id}-0800`,
      label: 'Ligar no 0800 729 0001 para ver o que o atendente diz',
      actionType: 'investigation',
      playerMessage: '[Ligação realizada para 0800 729 0001]',
      replyMessage:
        'Atendente 0800: "Para cancelar a compra de R$ 3.890 no seu cartão, você precisa transferir seu saldo via Pix agora para a Conta Segura do Banco Central!"',
      evidenceDiscovered: {
        id: `ev-${c.id}-0800`,
        title: 'Atendente 0800 Exigindo Pix para Cancelar Compra',
        description: 'Ao atender no 0800, o suposto funcionário exige um Pix para anular a compra.',
        status: 'suspicious',
        forensicFact: 'Nenhum banco pede Pix ou transferência para cancelar compras no cartão.',
      },
    };
  }

  if (clue.id === 'clue-3-google-pesquisa') {
    return {
      id: `act-${c.id}-google`,
      label: 'Responder: "Cancelar compra imediatamente"',
      actionType: 'investigation',
      playerMessage: 'CANCELAR COMPRA',
      replyMessage:
        '[Comando Inválido]: Cancelamentos por texto não são aceitos. Ligue urgente para a central 0800 729 0001.',
      evidenceDiscovered: {
        id: `ev-${c.id}-google`,
        title: 'Isca de SMS para Forçar Ligação ao 0800',
        description: 'O SMS recusa comandos e insiste que a vítima ligue para a falsa central.',
        status: 'suspicious',
        forensicFact: 'Nunca ligue para números 0800 recebidos por SMS de compras suspeitas.',
      },
    };
  }

  // FASE 4: Vaga de Tarefas no WhatsApp
  if (clue.id === 'clue-7-ddi') {
    return {
      id: `act-${c.id}-ddi`,
      label: 'Onde vocês conseguiram meu número? Qual é a empresa?',
      actionType: 'investigation',
      playerMessage: 'Oi! Como vocês conseguiram meu número de WhatsApp? Qual é o CNPJ oficial dessa agência no Brasil?',
      replyMessage:
        'Seu número foi selecionado pelo nosso sistema internacional de talentos! Usamos ramal virtual internacional para atendimento rápido, não precisa de burocracia!',
      evidenceDiscovered: {
        id: `ev-${c.id}-ddi`,
        title: 'Abordagem de Número Estrangeiro Sem CNPJ',
        description: 'A recrutadora evita informar CNPJ e usa linha virtual internacional (+62).',
        status: 'suspicious',
        forensicFact: 'Golpistas usam linhas virtuais estrangeiras para oferecer falsas vagas no WhatsApp.',
      },
    };
  }

  if (clue.id === 'clue-7-mecanica') {
    return {
      id: `act-${c.id}-mecanica`,
      label: 'Por que preciso pagar R$ 100 se estou procurando trabalho?',
      actionType: 'investigation',
      playerMessage:
        'Espera aí: se é um trabalho pra eu ganhar dinheiro, por que eu tenho que depositar R$ 100 do meu bolso via Pix?',
      replyMessage:
        'Os R$ 100 são apenas a cota de ativação do painel VIP de lojistas! Assim que você fizer o Pix de R$ 100, o sistema libera R$ 500 de comissão pra você na mesma hora!',
      evidenceDiscovered: {
        id: `ev-${c.id}-mecanica`,
        title: 'Exigência de Pagamento para Trabalhar',
        description: 'A recrutadora exige depósito prévio de R$ 100 via Pix para liberar ganhos maiores.',
        status: 'suspicious',
        forensicFact: 'Emprego legítimo nunca cobra depósito ou taxa do trabalhador.',
      },
    };
  }

  if (clue.id === 'clue-7-canal-rh') {
    return {
      id: `act-${c.id}-rh`,
      label: 'Não dá pra descontar esses R$ 100 do que vou receber?',
      actionType: 'investigation',
      playerMessage:
        'Vocês não podem simplesmente descontar esses R$ 100 das comissões que eu tenho pra receber? E por que é por grupo de Telegram?',
      replyMessage:
        'O sistema do Telegram é 100% automatizado e bloqueia quem não deposita a cota antes! Faça o Pix agora ou sua vaga VIP será passada para outro!',
      evidenceDiscovered: {
        id: `ev-${c.id}-rh`,
        title: 'Recusa de Desconto e Pressão por Depósito no Telegram',
        description: 'Insiste que a vítima deposite dinheiro do próprio bolso antes de liberar saques.',
        status: 'suspicious',
        forensicFact: 'Grupos de tarefas pré-pagas no Telegram são golpes financeiros.',
      },
    };
  }

  return {
    id: `act-${c.id}-clue-${clue.id}`,
    label: `${clue.question}`,
    actionType: 'investigation',
    playerMessage: clue.question,
    replyMessage: 'Por favor, confirme o procedimento com urgência para evitar o encerramento do prazo.',
    evidenceDiscovered: {
      id: `ev-${c.id}-${clue.id}`,
      title: clue.name,
      description: clue.inspection.observation,
      status: 'suspicious',
      forensicFact: clue.evidenceResult.fato,
    },
  };
};

// ============================================================================
// WHATSAPP REALISTA (FIDELIDADE DE OS, SEM ATALHOS E SEM FLICKER)
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
  onCallClick,
  onBackToHome,
  onOpenNotes,
  onOpenVerdictModal,
  inspectedClueCount = 0,
  inspectedClueIds = [],
  onInspectClue,
  onCopyPixKey,
  onRequestVoiceAudio,
  directChancesLeft = 2,
  isDirectVerdictLocked = false,
  revealedCount,
  isSuspectTyping,
  hasFinishedTyping,
  revealedChoicesCount,
  ageGroup = 'adult',
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
  onBlockContact?: () => void;
  onCallClick: () => void;
  onBackToHome: () => void;
  onOpenNotes?: () => void;
  onOpenVerdictModal?: () => void;
  inspectedClueCount?: number;
  inspectedClueIds?: string[];
  onInspectClue?: (clue: InvestigativeClue) => void;
  onCopyPixKey?: (key: string) => void;
  onRequestVoiceAudio?: () => void;
  directChancesLeft?: number;
  isDirectVerdictLocked?: boolean;
  revealedCount: number;
  isSuspectTyping: boolean;
  hasFinishedTyping: boolean;
  revealedChoicesCount: number;
  ageGroup?: AgeGroup;
}) => {
  const pixClue = c.clues.find(
    (k) => k.category === 'pix' || k.inspection.type === 'pix'
  );
  const [isTypingReply, setIsTypingReply] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const number = findContactNumber(c);
  const name = cleanName(c.sender);
  const unknown = /desconhecid|n[uú]mero novo/i.test(c.sender);

  const messageParagraphs = c.messageContent.split(/\n\n+/).filter(Boolean);
  const isSenior = ageGroup === 'senior';
  const bubbleTextClass = isSenior
    ? 'text-[14px] leading-[19px]'
    : 'text-[13px] leading-[17.5px]';

  // Blindagem anti-replay: mensagens e histórico prévios não reanimam ao alternar de aplicativo
  const initialMountRevealedCount = useRef(revealedCount);
  const initialMountHistoryCount = useRef(actionHistory.length);

  // Rolagem suave apenas quando chegam novas mensagens ou opções
  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 60);
    return () => clearTimeout(t);
  }, [revealedCount, revealedChoicesCount, actionHistory.length, isTypingReply]);

  const isPixAlreadyChecked = Boolean(pixClue && inspectedClueIds.includes(pixClue.id));

  const handleActionClick = (action: InteractiveAction, targetClue?: InvestigativeClue) => {
    if (isTypingReply) return;
    sound.playKeyboardClick();
    setIsTypingReply(true);
    setTimeout(() => {
      setIsTypingReply(false);
      sound.playMessagePing();
      if (targetClue && !inspectedClueIds.includes(targetClue.id)) {
        onInspectClue?.(targetClue);
      }
      onPerformAction(action);
    }, 1100);
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
          className={`underline break-all font-medium cursor-pointer text-left inline hover:opacity-80 ${
            flagged ? 'text-[#d93025]' : 'text-[#027eb5]'
          }`}
        >
          {part}
        </button>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    );
  };

  // Opções cotidianas reveladas aos poucos (1 por 1) e que somem após enviadas
  const visibleClues = c.clues.slice(0, Math.min(3, revealedChoicesCount));
  const pendingChoices = visibleClues
    .map((clue) => {
      const act = getClueConfrontationAction(clue, c, ageGroup, isPixAlreadyChecked);
      return { clue, act };
    })
    .filter(({ act }) => !executedActionIds.includes(act.id));

  return (
    <div className="flex flex-col h-full select-none bg-[#efeae2]">
      {/* Cabeçalho Nativo do WhatsApp */}
      <div className="bg-[#008069] text-white shrink-0">
        <StatusBar time={c.time} dark />
        <div className="flex items-center gap-1.5 px-2 pb-2 pt-1">
          <button
            type="button"
            onClick={onBackToHome}
            className="p-1 hover:bg-white/10 rounded-full cursor-pointer transition"
            title="Voltar"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
          </button>

          <button
            type="button"
            onClick={onContactClick}
            className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer hover:opacity-95 transition"
            title="Dados do contato"
          >
            <div className="w-8 h-8 rounded-full bg-[#dfe5e7] flex items-center justify-center text-[#54656f] font-semibold text-xs shrink-0">
              {name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0 leading-tight">
              <div className="font-semibold text-[13.5px] truncate flex items-center gap-1">
                <span>{unknown && number ? number : name}</span>
                {isBlocked && (
                  <span className="bg-red-600 text-[9px] px-1 rounded uppercase font-bold">
                    Bloqueado
                  </span>
                )}
              </div>
              <div className="text-[10.5px] text-white/85 truncate">
                {isTypingReply || isSuspectTyping ? (
                  <span className="text-emerald-100 font-medium">digitando...</span>
                ) : isBlocked ? (
                  'bloqueado'
                ) : unknown ? (
                  `~${name}`
                ) : (
                  'online'
                )}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1 text-white/90 shrink-0">
            <button
              type="button"
              onClick={onCallClick}
              className="p-1.5 hover:bg-white/10 rounded-full cursor-pointer transition"
              title="Ligar"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onContactClick}
              className="p-1.5 hover:bg-white/10 rounded-full cursor-pointer transition"
              title="Dados do contato"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Área da Conversa */}
      <div
        ref={chatScrollRef}
        className="flex-1 wa-wallpaper overflow-y-auto no-scrollbar px-2.5 py-2.5 space-y-2"
      >
        <div className="mx-auto w-fit bg-[#ffeecd] text-[#54656f] text-[10px] px-2.5 py-1 rounded-md text-center max-w-[92%] flex items-center gap-1 shadow-2xs leading-tight">
          <Lock className="w-2.5 h-2.5 shrink-0" />
          As mensagens são protegidas com a criptografia de ponta a ponta.
        </div>

        <div className="mx-auto w-fit bg-white/90 text-[#54656f] text-[10px] px-2 py-0.5 rounded shadow-2xs font-medium">
          HOJE
        </div>

        {/* Bolhas recebidas gradualmente com física suave do Telegram e blindagem anti-replay */}
        {messageParagraphs.slice(0, revealedCount).map((para, i) => {
          const hasPixKeyInBubble =
            pixClue &&
            onCopyPixKey &&
            (para.includes(pixClue.inspection.field1Value) ||
              (i === messageParagraphs.length - 1 && para.toLowerCase().includes('pix')));

          const isNewlyArrived = i >= initialMountRevealedCount.current;

          return (
            <motion.div
              key={i}
              initial={isNewlyArrived ? { opacity: 0, scale: 0.88, y: 16 } : false}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.8 }}
              className={`relative bg-white text-[#111b21] ${bubbleTextClass} rounded-lg rounded-tl-none px-2.5 pt-1.5 pb-4 max-w-[88%] shadow-[0_1px_1px_rgba(11,20,26,0.12)] whitespace-pre-wrap origin-bottom-left`}
            >
              {renderMessageContent(para)}

              {hasPixKeyInBubble && (
                <div className="mt-1.5 pt-1 border-t border-neutral-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyPixKey(pixClue.inspection.field1Value);
                    }}
                    className="inline-flex items-center gap-1 text-[10.5px] text-[#008069] hover:underline font-medium cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar chave ({pixClue.inspection.field1Value})</span>
                  </button>
                </div>
              )}

              <span className="absolute right-2 bottom-0.5 text-[9.5px] text-[#667781]">
                {c.time}
              </span>
            </motion.div>
          );
        })}

        {/* Indicador de digitação suave estilo Telegram (onda suave, sem bounce seco) */}
        {isSuspectTyping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white rounded-lg rounded-tl-none px-3 py-2.5 w-fit shadow-2xs flex items-center gap-1.5"
          >
            {[0, 1, 2].map((dotIndex) => (
              <motion.span
                key={dotIndex}
                className="w-1.5 h-1.5 rounded-full bg-[#8696a0]"
                animate={{ y: [0, -3.5, 0], opacity: [0.35, 1, 0.35] }}
                transition={{
                  duration: 0.85,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: dotIndex * 0.18,
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Mensagens enviadas pelo jogador e respostas do contato */}
        {actionHistory.map((item, idx) => {
          const isNewAction = idx >= initialMountHistoryCount.current;
          return (
            <React.Fragment key={idx}>
              <motion.div
                initial={isNewAction ? { opacity: 0, scale: 0.9, y: 12 } : false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.8 }}
                className={`ml-auto bg-[#d9fdd3] text-[#111b21] ${bubbleTextClass} rounded-lg rounded-tr-none px-2.5 pt-1.5 pb-4 max-w-[88%] shadow-[0_1px_1px_rgba(11,20,26,0.12)] relative origin-bottom-right`}
              >
                <div>{item.player}</div>
                <span className="absolute right-2 bottom-0.5 text-[9.5px] text-[#53bdeb] font-bold">
                  {c.time} ✓✓
                </span>
              </motion.div>

              <motion.div
                initial={isNewAction ? { opacity: 0, scale: 0.9, y: 12 } : false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.8 }}
                className={`mr-auto bg-white text-[#111b21] ${bubbleTextClass} rounded-lg rounded-tl-none px-2.5 pt-1.5 pb-4 max-w-[88%] shadow-[0_1px_1px_rgba(11,20,26,0.12)] relative origin-bottom-left`}
              >
                <div>{renderMessageContent(item.reply)}</div>
                <span className="absolute right-2 bottom-0.5 text-[9.5px] text-[#667781]">
                  {c.time}
                </span>
              </motion.div>
            </React.Fragment>
          );
        })}

        {isTypingReply && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg rounded-tl-none px-3 py-2.5 w-fit shadow-2xs flex items-center gap-1.5"
          >
            {[0, 1, 2].map((dotIndex) => (
              <motion.span
                key={dotIndex}
                className="w-1.5 h-1.5 rounded-full bg-[#8696a0]"
                animate={{ y: [0, -3.5, 0], opacity: [0.35, 1, 0.35] }}
                transition={{
                  duration: 0.85,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: dotIndex * 0.18,
                }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Sugestões de Resposta do Dia a Dia (Aparecem aos poucos, 1 por 1, com entrada fluida) */}
      {hasFinishedTyping && !stamped && !isBlocked && pendingChoices.length > 0 && (
        <div className="px-2 pt-1.5 pb-1 bg-[#efeae2] border-t border-black/5 space-y-1 shrink-0">
          {pendingChoices.map(({ clue, act }) => (
            <motion.button
              key={clue.id}
              type="button"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              disabled={isTypingReply}
              onClick={() => handleActionClick(act, clue)}
              className="w-full text-left px-3 py-1.5 rounded-full bg-white hover:bg-[#e7fce3] border border-[#00a884]/40 text-[#111b21] text-[11.5px] font-medium transition cursor-pointer flex items-center justify-between gap-2 shadow-2xs disabled:opacity-50"
            >
              <span className="truncate">{act.label}</span>
              <Send className="w-3.5 h-3.5 text-[#008069] shrink-0" />
            </motion.button>
          ))}
        </div>
      )}

      {/* Barra Inferior Padrão do WhatsApp */}
      <div className="bg-[#f0f2f5] border-t border-black/5 flex flex-col shrink-0">
        {isBlocked ? (
          <div className="px-3 py-2 text-center bg-neutral-100">
            <span className="text-xs text-neutral-600 font-medium">
              Você bloqueou este contato.
            </span>
          </div>
        ) : (
          <div className="px-2 py-1.5 flex items-center gap-1.5">
            <div className="flex-1 bg-white rounded-full px-3 py-1.5 flex items-center gap-2 border border-neutral-200">
              <Smile className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="flex-1 text-xs text-neutral-400 truncate">
                {!hasFinishedTyping
                  ? 'Aguardando mensagem...'
                  : pendingChoices.length > 0
                  ? 'Toque em uma resposta acima...'
                  : 'Mensagem'}
              </span>
              <Paperclip className="w-4 h-4 text-neutral-400 shrink-0" />
              <Camera className="w-4 h-4 text-neutral-400 shrink-0" />
            </div>
            <button
              type="button"
              onClick={() => onRequestVoiceAudio?.()}
              className="w-9 h-9 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center shrink-0 cursor-pointer transition"
              title="Pedir áudio de voz"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Botão de Veredito só aparece após as mensagens chegarem para não poluir */}
        {hasFinishedTyping && onOpenVerdictModal && onOpenNotes && (
          <VerdictActionBar
            directChancesLeft={directChancesLeft}
            isDirectVerdictLocked={isDirectVerdictLocked}
            inspectedClueCount={inspectedClueCount}
            stamped={stamped}
            onOpenVerdictModal={onOpenVerdictModal}
            onOpenNotes={onOpenNotes}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// SMS NATIVO REALISTA (FIDELIDADE DE OS, SEM ATALHOS E SEM FLICKER)
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
  onOpenVerdictModal,
  inspectedClueCount = 0,
  inspectedClueIds = [],
  onInspectClue,
  onCallClick,
  directChancesLeft = 2,
  isDirectVerdictLocked = false,
  revealedCount,
  hasFinishedTyping,
  revealedChoicesCount,
  ageGroup = 'adult',
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
  onOpenVerdictModal?: () => void;
  inspectedClueCount?: number;
  inspectedClueIds?: string[];
  onInspectClue?: (clue: InvestigativeClue) => void;
  onCallClick?: () => void;
  directChancesLeft?: number;
  isDirectVerdictLocked?: boolean;
  revealedCount: number;
  hasFinishedTyping: boolean;
  revealedChoicesCount: number;
  ageGroup?: AgeGroup;
}) => {
  const [isSendingSms, setIsSendingSms] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const number = findContactNumber(c);
  const messageParagraphs = c.messageContent.split(/\n\n+/).filter(Boolean);
  const isSenior = ageGroup === 'senior';
  const bubbleTextClass = isSenior
    ? 'text-[14px] leading-[19.5px]'
    : 'text-[13px] leading-[18px]';

  // Blindagem anti-replay para SMS: histórico prévio não reanima ao alternar de app
  const initialMountRevealedCount = useRef(revealedCount);
  const initialMountHistoryCount = useRef(actionHistory.length);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 60);
    return () => clearTimeout(t);
  }, [revealedCount, revealedChoicesCount, actionHistory.length, isSendingSms]);

  const handleSmsOptionClick = (clue: InvestigativeClue, act: InteractiveAction) => {
    if (isSendingSms) return;
    if (clue.id === 'clue-3-central-0800' && onCallClick) {
      onCallClick();
      return;
    }
    sound.playKeyboardClick();
    setIsSendingSms(true);
    setTimeout(() => {
      setIsSendingSms(false);
      sound.playMessagePop();
      if (!inspectedClueIds.includes(clue.id)) {
        onInspectClue?.(clue);
      }
      if (!executedActionIds.includes(act.id)) {
        onPerformAction(act);
      }
    }, 900);
  };

  const renderMessageContent = (text: string) => {
    const parts = text.split(/(https?:\/\/[^\s]+|0800\s*\d{3}\s*\d{4})/g);
    return parts.map((part, i) => {
      if (/^https?:\/\//.test(part)) {
        return (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLinkClick(part);
            }}
            className={`underline break-all font-medium cursor-pointer text-left inline hover:opacity-80 ${
              flagged ? 'text-[#d93025]' : 'text-[#007aff]'
            }`}
          >
            {part}
          </button>
        );
      }
      if (/^0800\s*\d{3}\s*\d{4}$/.test(part) && onCallClick) {
        return (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCallClick();
            }}
            className="underline font-medium text-[#007aff] cursor-pointer inline hover:opacity-80"
          >
            {part}
          </button>
        );
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  const visibleClues = c.clues.slice(0, Math.min(3, revealedChoicesCount));
  const pendingChoices = visibleClues
    .map((clue) => {
      const act = getClueConfrontationAction(clue, c, ageGroup, false);
      return { clue, act };
    })
    .filter(({ act, clue }) => !executedActionIds.includes(act.id) && !inspectedClueIds.includes(clue.id));

  return (
    <div className="flex flex-col h-full bg-white select-none">
      <StatusBar time={c.time} />
      {/* Cabeçalho Nativo de SMS */}
      <div className="flex items-center justify-between px-2 pb-2 pt-1 border-b border-black/10 bg-[#f9f9f9] shrink-0">
        <button
          type="button"
          onClick={onBackToHome}
          className="p-1 text-[#007aff] hover:bg-neutral-200/60 rounded-full cursor-pointer flex items-center"
          title="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onContactClick}
          className="flex flex-col items-center cursor-pointer hover:opacity-90 flex-1 min-w-0"
          title="Dados do remetente"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#a5abb8] to-[#858994] flex items-center justify-center text-white font-semibold text-xs">
            {c.sender.charAt(0)}
          </div>
          <div className="text-[11px] text-black mt-0.5 flex items-center gap-0.5 font-medium truncate max-w-[180px]">
            <span>{number ?? c.sender}</span>
            <span className="text-[#8e8e93]">›</span>
          </div>
        </button>

        <div className="flex items-center gap-1 text-[#007aff]">
          {onCallClick && (
            <button
              type="button"
              onClick={onCallClick}
              className="p-1.5 hover:bg-neutral-200/60 rounded-full cursor-pointer transition"
              title="Ligar para este número"
            >
              <Phone className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Corpo das Mensagens SMS */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto no-scrollbar px-3 py-2.5 space-y-2"
      >
        <div className="text-center text-[10px] text-[#8e8e93]">
          Mensagem de Texto • SMS
          <br />
          Hoje {c.time}
        </div>

        {messageParagraphs.slice(0, revealedCount).map((para, i) => {
          const isNewlyArrived = i >= initialMountRevealedCount.current;
          return (
            <motion.div
              key={i}
              initial={isNewlyArrived ? { opacity: 0, scale: 0.88, y: 16 } : false}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.8 }}
              className={`bg-[#e9e9eb] text-black ${bubbleTextClass} rounded-2xl rounded-bl-xs px-3 py-2 max-w-[88%] whitespace-pre-wrap origin-bottom-left`}
            >
              {renderMessageContent(para)}
            </motion.div>
          );
        })}

        {!hasFinishedTyping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#e9e9eb] rounded-2xl rounded-bl-xs px-3 py-2.5 w-fit flex items-center gap-1.5"
          >
            {[0, 1, 2].map((dotIndex) => (
              <motion.span
                key={dotIndex}
                className="w-1.5 h-1.5 rounded-full bg-[#8e8e93]"
                animate={{ y: [0, -3.5, 0], opacity: [0.35, 1, 0.35] }}
                transition={{
                  duration: 0.85,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: dotIndex * 0.18,
                }}
              />
            ))}
          </motion.div>
        )}

        {actionHistory.map((item, idx) => {
          const isNewAction = idx >= initialMountHistoryCount.current;
          return (
            <React.Fragment key={idx}>
              <motion.div
                initial={isNewAction ? { opacity: 0, scale: 0.9, y: 12 } : false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.8 }}
                className={`ml-auto bg-[#007aff] text-white ${bubbleTextClass} rounded-2xl rounded-br-xs px-3 py-2 max-w-[86%] origin-bottom-right`}
              >
                {item.player}
              </motion.div>
              <motion.div
                initial={isNewAction ? { opacity: 0, scale: 0.9, y: 12 } : false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.8 }}
                className={`mr-auto bg-[#e9e9eb] text-black ${bubbleTextClass} rounded-2xl rounded-bl-xs px-3 py-2 max-w-[88%] origin-bottom-left`}
              >
                {renderMessageContent(item.reply)}
              </motion.div>
            </React.Fragment>
          );
        })}

        {isSendingSms && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#e9e9eb] rounded-2xl rounded-bl-xs px-3 py-2.5 w-fit flex items-center gap-1.5"
          >
            {[0, 1, 2].map((dotIndex) => (
              <motion.span
                key={dotIndex}
                className="w-1.5 h-1.5 rounded-full bg-[#8e8e93]"
                animate={{ y: [0, -3.5, 0], opacity: [0.35, 1, 0.35] }}
                transition={{
                  duration: 0.85,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: dotIndex * 0.18,
                }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Opções graduais (1 por 1) após leitura do SMS */}
      {hasFinishedTyping && !stamped && pendingChoices.length > 0 && (
        <div className="px-2.5 pt-1.5 pb-1 bg-white border-t border-black/5 space-y-1 shrink-0">
          {pendingChoices.map(({ clue, act }) => (
            <motion.button
              key={clue.id}
              type="button"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              disabled={isSendingSms}
              onClick={() => handleSmsOptionClick(clue, act)}
              className="w-full text-left px-3 py-1.5 rounded-full bg-blue-50/70 hover:bg-blue-100/80 border border-[#007aff]/30 text-slate-900 text-[11.5px] font-medium transition cursor-pointer flex items-center justify-between gap-2 disabled:opacity-50"
            >
              <span className="truncate">{act.label}</span>
              <Send className="w-3.5 h-3.5 text-[#007aff] shrink-0" />
            </motion.button>
          ))}
        </div>
      )}

      {/* Barra Inferior Nativa do SMS */}
      <div className="bg-[#f6f6f6] border-t border-black/10 flex flex-col shrink-0">
        <div className="px-2.5 py-1.5 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-neutral-200 text-[#8e8e93] flex items-center justify-center shrink-0">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 bg-white rounded-full px-3 py-1.5 flex items-center justify-between border border-neutral-300">
            <span className="text-xs text-[#8e8e93] truncate">
              {!hasFinishedTyping ? 'Mensagem de texto...' : 'Mensagem de texto • SMS'}
            </span>
            <Mic className="w-3.5 h-3.5 text-[#8e8e93] shrink-0" />
          </div>
        </div>

        {hasFinishedTyping && onOpenVerdictModal && onOpenNotes && (
          <VerdictActionBar
            directChancesLeft={directChancesLeft}
            isDirectVerdictLocked={isDirectVerdictLocked}
            inspectedClueCount={inspectedClueCount}
            stamped={stamped}
            onOpenVerdictModal={onOpenVerdictModal}
            onOpenNotes={onOpenNotes}
          />
        )}
      </div>
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
  onOpenVerdictModal,
  onOpenNotes,
  directChancesLeft = 2,
  isDirectVerdictLocked = false,
  stamped,
}: {
  c: ScamCase;
  onPerformAction: (action: InteractiveAction) => void;
  executedActionIds: string[];
  actionHistory: { player: string; reply: string }[];
  onHangup: () => void;
  onBackToHome?: () => void;
  onStoryDeliveredChange?: (delivered: boolean) => void;
  onOpenVerdictModal?: () => void;
  onOpenNotes?: () => void;
  directChancesLeft?: number;
  isDirectVerdictLocked?: boolean;
  stamped?: Verdict;
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
            <div className="w-full space-y-2">
              <div className="text-[11px] font-mono text-neutral-400 bg-neutral-800/80 px-4 py-2 rounded-full border border-white/10 flex items-center justify-center gap-2">
                <PhoneOff className="w-3.5 h-3.5 text-red-400" />
                <span>Chamada Encerrada • Linha desconectada</span>
              </div>
              {onOpenVerdictModal && onOpenNotes && (
                <VerdictActionBar
                  directChancesLeft={directChancesLeft}
                  isDirectVerdictLocked={isDirectVerdictLocked}
                  inspectedClueCount={0}
                  stamped={stamped ?? null}
                  onOpenVerdictModal={onOpenVerdictModal}
                  onOpenNotes={onOpenNotes}
                />
              )}
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
// TELA INICIAL REALISTA DO CELULAR (FIDELIDADE DE SISTEMA OPERACIONAL)
// ============================================================================
const HomeScreen = ({
  c,
  notificationArrived = false,
  onOpenMessaging,
  onOpenNotes,
  onOpenBank,
  onOpenBrowser,
  onOpenVerdictModal,
  onOpenTips,
  onStartVoiceCall,
  onChangeAgeGroup,
  ageGroup = 'adult',
  onToast,
  inspectedClueCount,
  levelText,
  directChancesLeft = 2,
  isDirectVerdictLocked = false,
  stamped = null,
}: {
  c: ScamCase;
  notificationArrived?: boolean;
  scamCountdown?: number;
  onFastForwardScam?: () => void;
  onOpenMessaging: () => void;
  onOpenNotes: () => void;
  onOpenBank: () => void;
  onOpenBrowser: () => void;
  onOpenVerdictModal: () => void;
  onOpenTips?: () => void;
  onStartVoiceCall?: () => void;
  onChangeAgeGroup?: () => void;
  ageGroup?: AgeGroup;
  onToast: (msg: string) => void;
  inspectedClueCount: number;
  levelText?: string;
  directChancesLeft?: number;
  isDirectVerdictLocked?: boolean;
  stamped?: Verdict;
}) => {
  const isTargetChannel = (target: string) => {
    if (c.channel === 'whatsapp' && target === 'whatsapp') return true;
    if (c.channel === 'sms' && target === 'sms') return true;
    if (c.channel === 'push' && target === 'bank') return true;
    if (c.channel === 'call' && target === 'call') return true;
    return false;
  };

  const ageLabel = ageGroup === 'senior' ? '60+ anos' : ageGroup === 'adult' ? '36–59 anos' : 'Até 35 anos';

  return (
    <div className="relative flex flex-col h-full bg-gradient-to-b from-[#111827] via-[#0f172a] to-[#030712] text-white select-none overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/25 via-slate-900/50 to-black pointer-events-none" />

      <StatusBar time={c.time} dark levelText={levelText} />

      {/* Banner de Notificação no Topo da HomeScreen (sem piscar) */}
      <div className="min-h-[56px] flex items-center justify-center">
        {notificationArrived && (
          <div
            onClick={onOpenMessaging}
            className="w-full mx-3 bg-slate-900/95 border border-white/15 rounded-2xl p-2.5 backdrop-blur-xl shadow-lg cursor-pointer active:scale-98 transition flex items-center gap-2.5 group"
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shadow shrink-0 ${
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
              <div className="text-xs font-bold text-white truncate flex items-center justify-between gap-1.5">
                <span className="truncate">{cleanName(c.sender)}</span>
                <span className="text-[10px] text-neutral-400 font-normal shrink-0">agora</span>
              </div>
              <div className="text-[11px] text-white/75 truncate">
                {c.channel === 'call' ? 'Chamada recebida • Toque para atender' : (c.preview || c.messageContent)}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/50 shrink-0" />
          </div>
        )}
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
            <span>Sábado, 10 de out • 26°C</span>
            {onChangeAgeGroup && (
              <button
                type="button"
                onClick={onChangeAgeGroup}
                className="ml-1 px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-[10px] text-white/80 font-medium transition cursor-pointer"
                title="Alterar faixa etária"
              >
                Perfil: {ageLabel}
              </button>
            )}
          </div>
        </div>

        {/* Barra de Pesquisa Estilo Google */}
        <div
          onClick={onOpenBrowser}
          className="w-full bg-white/10 hover:bg-white/15 border border-white/15 rounded-full py-2 px-3.5 flex items-center justify-between text-white/60 text-xs backdrop-blur-md transition mt-1 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-sky-400">G</span>
            <span className="text-xs text-white/70">Pesquisar no Google...</span>
          </div>
          <Search className="w-3.5 h-3.5 text-white/60" />
        </div>

        {/* Grid de Apps Estável (Zero Piscar) */}
        <div className="grid grid-cols-4 gap-y-4 gap-x-2.5 my-auto px-0.5">
          {/* 1. WhatsApp */}
          <div
            onClick={onOpenMessaging}
            className="flex flex-col items-center gap-1 group cursor-pointer relative"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6" />
              {notificationArrived && isTargetChannel('whatsapp') && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow">
                  1
                </span>
              )}
            </div>
            <span className="text-[11px] text-white/90 font-medium">WhatsApp</span>
          </div>

          {/* 2. Mensagens SMS */}
          <div
            onClick={onOpenMessaging}
            className="flex flex-col items-center gap-1 group cursor-pointer relative"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-[#007aff] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <MessageCircle className="w-6 h-6" />
              {isTargetChannel('sms') && notificationArrived && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow">
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
            <div className="relative w-12 h-12 rounded-2xl bg-[#820ad1] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <CreditCard className="w-6 h-6" />
              {isTargetChannel('push') && notificationArrived && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow">
                  1
                </span>
              )}
            </div>
            <span className="text-[11px] text-white/90 font-medium">Meu Banco</span>
          </div>

          {/* 4. Notas */}
          <div
            onClick={onOpenNotes}
            className="flex flex-col items-center gap-1 group cursor-pointer relative"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
              {inspectedClueCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-4.5 rounded-full bg-amber-400 text-black font-mono text-[9.5px] font-bold flex items-center justify-center shadow">
                  {inspectedClueCount}
                </span>
              )}
            </div>
            <span className="text-[11px] text-white/90 font-medium">Notas</span>
          </div>

          {/* 5. Google */}
          <div
            onClick={onOpenBrowser}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform border border-slate-200">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>
            <span className="text-[11px] text-white/90 font-medium">Google</span>
          </div>

          {/* 6. Telefone */}
          <div
            onClick={() => {
              if (c.channel === 'call') {
                onOpenMessaging();
              } else if (onStartVoiceCall) {
                onStartVoiceCall();
              } else {
                onOpenMessaging();
              }
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer relative"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Phone className="w-6 h-6" />
              {isTargetChannel('call') && notificationArrived && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow">
                  1
                </span>
              )}
            </div>
            <span className="text-[11px] text-white/90 font-medium">Telefone</span>
          </div>

          {/* 7. Galeria */}
          <div
            onClick={() => onToast('📸 Fotos salvas no aparelho.')}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-white/90 font-medium">Galeria</span>
          </div>

          {/* 8. Ajuda / Dicas */}
          <div
            onClick={onOpenTips}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-700 border border-white/15 flex items-center justify-center text-amber-300 shadow-md group-hover:scale-105 transition-transform">
              <Lightbulb className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-white/90 font-medium">Ajuda</span>
          </div>
        </div>

        {/* Rodapé da Tela Inicial Estável (Sem botão de acelerar) */}
        <div className="pt-2">
          <VerdictActionBar
            directChancesLeft={directChancesLeft}
            isDirectVerdictLocked={isDirectVerdictLocked}
            inspectedClueCount={inspectedClueCount}
            stamped={stamped}
            onOpenVerdictModal={onOpenVerdictModal}
            onOpenNotes={onOpenNotes}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL DO CELULAR (PHONE SCREEN HUB COM PERSISTÊNCIA REAL)
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
  onAgeGroupChange,
}) => {
  const [activeApp, setActiveApp] = useState<'home' | 'messaging' | 'notes' | 'bank' | 'browser'>('home');
  const [previousApp, setPreviousApp] = useState<'home' | 'messaging' | 'notes'>('home');
  const [isLocked, setIsLocked] = useState(true);
  const [isScreenOff, setIsScreenOff] = useState(true);

  const [ageGroup, setAgeGroup] = useState<AgeGroup>(() => {
    if (typeof window === 'undefined') return 'adult';
    try {
      const saved = sessionStorage.getItem('hacklearn_age_group');
      if (saved === 'young' || saved === 'adult' || saved === 'senior') return saved;
    } catch {}
    return 'adult';
  });

  const [hasChosenAge, setHasChosenAge] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return Boolean(sessionStorage.getItem('hacklearn_age_group'));
    } catch {
      return false;
    }
  });

  const [bootStage, setBootStage] = useState<'hello' | 'age' | 'about' | 'ready'>(() => {
    if (!hasChosenAge) return 'hello';
    return initialBootDone ? 'ready' : 'hello';
  });

  const [notificationArrived, setNotificationArrived] = useState(false);
  const [hasOpenedScamMessage, setHasOpenedScamMessage] = useState(false);
  const [hasDeliveredStory, setHasDeliveredStory] = useState(false);
  const [revealedBubblesCount, setRevealedBubblesCount] = useState(0);
  const [isContactTyping, setIsContactTyping] = useState(false);
  const [revealedChoicesCount, setRevealedChoicesCount] = useState(0);

  const [isVerdictModalOpen, setIsVerdictModalOpen] = useState(false);
  const [userHypothesisIndex, setUserHypothesisIndex] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<'contact' | 'toast' | null>(null);
  const [browserUrl, setBrowserUrl] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [skillToast, setSkillToast] = useState<Skill[] | null>(null);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [isPixDoubtModalOpen, setIsPixDoubtModalOpen] = useState(false);
  const [copiedPixKey, setCopiedPixKey] = useState<string | null>(null);
  const [isVoiceProofModalOpen, setIsVoiceProofModalOpen] = useState(false);
  const [voiceCallOverlayState, setVoiceCallOverlayState] = useState<'calling' | 'rejected' | 'connected' | null>(null);

  // Sistema de Dedução em 2 Chances com Persistência Anti-F5
  const [directChancesLeft, setDirectChancesLeft] = useState<number>(() => {
    if (typeof window === 'undefined') return 2;
    try {
      const saved = sessionStorage.getItem(`hacklearn_chances_${scamCase.id}`);
      return saved !== null ? parseInt(saved, 10) : 2;
    } catch {
      return 2;
    }
  });

  const [isDirectVerdictLocked, setIsDirectVerdictLocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem(`hacklearn_locked_${scamCase.id}`) === 'true';
    } catch {
      return false;
    }
  });

  const [didacticFeedback, setDidacticFeedback] = useState<{
    open: boolean;
    feedback: string;
    isCircumstantial: boolean;
    chancesLeft: number;
  } | null>(null);

  const [isLockoutModalOpen, setIsLockoutModalOpen] = useState(false);

  const levelText = levelIndex ? `Fase ${levelIndex} de ${totalLevels || 4}` : undefined;

  const storyBubbles = React.useMemo(
    () => scamCase.messageContent.split(/\n\n+/).filter(Boolean),
    [scamCase.id, scamCase.messageContent]
  );

  // Som harmônico no primeiro boot
  useEffect(() => {
    if (bootStage === 'hello') {
      sound.playBootHelloChord();
    }
  }, [bootStage]);

  const handleSelectAgeGroup = (selected: AgeGroup) => {
    sound.playKeypress();
    setAgeGroup(selected);
    setHasChosenAge(true);
    try {
      sessionStorage.setItem('hacklearn_age_group', selected);
    } catch {}
    onAgeGroupChange?.(selected);
    setBootStage('about');
  };

  const handleFinishSetup = () => {
    sound.playBootHelloChord();
    sound.playUnlockClick();
    if (!hasChosenAge) {
      setHasChosenAge(true);
      try {
        sessionStorage.setItem('hacklearn_age_group', ageGroup);
      } catch {}
    }
    onCompleteInitialBoot?.();
    setBootStage('ready');
    setIsLocked(true);
  };

  // Ler/conferir uma dica ensina habilidades novas (persistem entre casos)
  const handleInspectClue = useCallback(
    (clue: InvestigativeClue) => {
      onInspectClue?.(clue);
      sound.playClueInspect();
      const gained: Skill[] = ['question', 'verdict', 'bank', 'browser'];
      const fresh = gained.filter((sk) => !unlockedSkills.includes(sk));
      if (fresh.length > 0) {
        fresh.forEach((sk) => onUnlockSkill?.(sk));
        sound.playSuccess();
        setSkillToast(fresh);
      }
    },
    [onInspectClue, unlockedSkills, onUnlockSkill]
  );

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

  // Ciclo de Vida: Transição Atômica ao mudar de fase (purge de vazamentos e restauração de chances)
  useEffect(() => {
    setIsBlocked(false);
    setActiveModal(null);
    setIsLocked(true);
    setActiveApp('home');
    setPreviousApp('home');
    setNotificationArrived(false);
    setHasOpenedScamMessage(false);
    setHasDeliveredStory(false);
    setRevealedBubblesCount(0);
    setIsContactTyping(false);
    setRevealedChoicesCount(0);
    setIsVerdictModalOpen(false);
    setUserHypothesisIndex(null);
    setIsTipsModalOpen(false);
    setIsPixDoubtModalOpen(false);
    setCopiedPixKey(null);
    setIsVoiceProofModalOpen(false);
    setVoiceCallOverlayState(null);
    setDidacticFeedback(null);
    setIsLockoutModalOpen(false);

    try {
      const savedChances = sessionStorage.getItem(`hacklearn_chances_${scamCase.id}`);
      setDirectChancesLeft(savedChances !== null ? parseInt(savedChances, 10) : 2);
      const savedLocked = sessionStorage.getItem(`hacklearn_locked_${scamCase.id}`);
      setIsDirectVerdictLocked(savedLocked === 'true');
    } catch {
      setDirectChancesLeft(2);
      setIsDirectVerdictLocked(false);
    }

    onAppOpenChangeRef.current?.(false);
    onStoryDeliveredChangeRef.current?.(false);

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

  // Chegada orgânica da mensagem do caso na LockScreen (calibrado -4s com ritmo natural por idade)
  useEffect(() => {
    if (bootStage !== 'ready' || notificationArrived) return;
    const notifDelay = ageGroup === 'senior' ? 18000 : ageGroup === 'adult' ? 16000 : 12000;
    const notifTimer = setTimeout(() => {
      triggerNotificationArrival();
    }, notifDelay);

    return () => clearTimeout(notifTimer);
  }, [bootStage, notificationArrived, triggerNotificationArrival, ageGroup]);

  // Persistência absoluta da entrega de bolhas (não reseta ao trocar de aplicativo!)
  useEffect(() => {
    if (!hasOpenedScamMessage || hasDeliveredStory) return;

    const total = storyBubbles.length;
    if (revealedBubblesCount >= total) {
      setIsContactTyping(false);
      setHasDeliveredStory(true);
      onStoryDeliveredChangeRef.current?.(true);
      return;
    }

    setIsContactTyping(true);
    const initialBubbleDelay = ageGroup === 'senior' ? 4500 : ageGroup === 'adult' ? 3500 : 2500;
    const subsequentBubbleDelay = ageGroup === 'senior' ? 16000 : ageGroup === 'adult' ? 12000 : 8000;
    const delay = revealedBubblesCount === 0 ? initialBubbleDelay : subsequentBubbleDelay;

    const timer = setTimeout(() => {
      const nextCount = revealedBubblesCount + 1;
      setRevealedBubblesCount(nextCount);
      sound.playMessagePing();
      if (nextCount >= total) {
        setIsContactTyping(false);
        setHasDeliveredStory(true);
        onStoryDeliveredChangeRef.current?.(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [hasOpenedScamMessage, hasDeliveredStory, revealedBubblesCount, storyBubbles.length, ageGroup]);

  // Revelação gradual e calma das opções de resposta (1 por 1, sem poluir a tela de uma vez)
  useEffect(() => {
    if (!hasDeliveredStory || revealedChoicesCount >= 3) return;

    const initialPause = ageGroup === 'senior' ? 12000 : ageGroup === 'adult' ? 8000 : 4000;
    const stepInterval = ageGroup === 'senior' ? 3500 : ageGroup === 'adult' ? 2500 : 1500;
    const delay = revealedChoicesCount === 0 ? initialPause : stepInterval;

    const timer = setTimeout(() => {
      setRevealedChoicesCount((prev) => Math.min(3, prev + 1));
    }, delay);

    return () => clearTimeout(timer);
  }, [hasDeliveredStory, revealedChoicesCount, ageGroup]);

  useEffect(() => {
    if (stamped) {
      sound.playStampThud();
      setIsLocked(false);
      setActiveApp('messaging');
      setRevealedBubblesCount(storyBubbles.length);
      setIsContactTyping(false);
      setHasDeliveredStory(true);
      onAppOpenChangeRef.current?.(true);
    }
  }, [stamped, storyBubbles.length]);

  const handleUnlockToHome = () => {
    sound.playUnlockClick();
    setIsLocked(false);
    setActiveApp('home');
  };

  const handleOpenAppDirectly = () => {
    sound.playKeypress();
    if (!notificationArrived) {
      setNotificationArrived(true);
      sound.playPhoneVibrate();
    }
    setIsLocked(false);
    setActiveApp('messaging');
    setPreviousApp('home');
    setHasOpenedScamMessage(true);
    onAppOpenChange?.(true);
  };

  const handleOpenNotes = () => {
    sound.playBlip();
    if (activeApp === 'home' || activeApp === 'messaging') {
      setPreviousApp(activeApp);
    }
    setActiveApp('notes');
  };

  const handleOpenBank = () => {
    sound.playBlip();
    if (activeApp === 'home' || activeApp === 'messaging' || activeApp === 'notes') {
      setPreviousApp(activeApp);
    }
    setActiveApp('bank');
  };

  const handleOpenBrowser = (url?: string) => {
    sound.playBlip();
    if (activeApp === 'home' || activeApp === 'messaging' || activeApp === 'notes') {
      setPreviousApp(activeApp);
    }
    setBrowserUrl(url || 'https://pesquisa-segura.com.br');
    setActiveApp('browser');
  };

  // Julgamento Pericial com 2 Chances e Dupla Confirmação Forense
  const handleConfirmVerdict = (verdict: 'scam' | 'safe', hypothesisIndex: number) => {
    setIsVerdictModalOpen(false);

    const isVerdictRight = verdict === (scamCase.isScam ? 'scam' : 'safe');
    const isHypothesisRight = hypothesisIndex === scamCase.correctEvidenceIndex;
    const isMastery = inspectedClueIds.length >= 3;

    if (isVerdictRight && (isHypothesisRight || isMastery)) {
      setUserHypothesisIndex(hypothesisIndex);
      try {
        sessionStorage.removeItem(`hacklearn_chances_${scamCase.id}`);
        sessionStorage.removeItem(`hacklearn_locked_${scamCase.id}`);
      } catch {}
      onVerdict?.(verdict);
    } else {
      const nextChances = Math.max(0, directChancesLeft - 1);
      setDirectChancesLeft(nextChances);
      try {
        sessionStorage.setItem(`hacklearn_chances_${scamCase.id}`, String(nextChances));
      } catch {}

      if (nextChances === 1) {
        sound.playError();
        const isCircumstantial = hypothesisIndex === scamCase.circumstantialHintIndex;
        let feedbackText = '';
        if (isCircumstantial && scamCase.circumstantialHintFeedback) {
          feedbackText = scamCase.circumstantialHintFeedback;
        } else if (!isVerdictRight) {
          feedbackText = scamCase.isScam
            ? 'Atenção: Esta mensagem é uma tentativa real de golpe! Dizer que é segura colocaria suas economias em risco.'
            : 'Atenção: Esta mensagem é autêntica e legítima do próprio aplicativo instalado, sem perigo.';
        } else {
          feedbackText = 'Essa afirmação não comprova a situação e é apenas uma suposição. A prova concreta deve ser conferida nos aplicativos do celular!';
        }

        setDidacticFeedback({
          open: true,
          feedback: feedbackText,
          isCircumstantial,
          chancesLeft: 1,
        });
      } else {
        sound.playPhoneVibrate();
        sound.playError();
        setIsDirectVerdictLocked(true);
        try {
          sessionStorage.setItem(`hacklearn_locked_${scamCase.id}`, 'true');
        } catch {}
        setIsLockoutModalOpen(true);
      }
    }
  };

  const handleConfrontPixInChat = (pixClue: InvestigativeClue) => {
    const titular = pixClue?.inspection?.field2Value || 'Valdir dos Santos';
    const playerMsg = `Sofia, quem é esse ${titular} da chave Pix? A faculdade não cobra por boleto ou CNPJ?`;
    const replyMsg = `Mãe, é o coordenador financeiro da faculdade! Ele disse que só segura minha vaga se pagar direto na conta dele agora, por favor faz logo!`;

    setIsPixDoubtModalOpen(false);
    setActiveApp('messaging');
    sound.playKeyboardClick();

    setTimeout(() => {
      sound.playMessagePing();
      sound.playTensionPulse();
      handleInspectClue(pixClue);
      onPerformAction({
        id: `act-${scamCase.id}-pix-confront`,
        label: `Confrontar Favorecido: ${titular}`,
        actionType: 'investigation',
        playerMessage: playerMsg,
        replyMessage: replyMsg,
        evidenceDiscovered: {
          id: `ev-${scamCase.id}-pix-favorecido`,
          title: `Favorecido Estranho: ${titular}`,
          description: `A conta Pix pertence a ${titular}, e não à instituição.`,
          status: 'suspicious',
          forensicFact: 'Instituições de ensino e empresas cobram por CNPJ oficial ou boleto registrado.',
        },
      });
    }, 600);
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

  const handleStartVoiceCall = () => {
    setIsVoiceProofModalOpen(false);
    setVoiceCallOverlayState('calling');
    sound.playPhoneRingtone();
    sound.playPhoneVibrate();

    const behaviorClue = scamCase.clues.find(
      (k) => k.category === 'behavior' || k.id.includes('behavior') || k.inspection.type === 'security'
    );

    if (scamCase.isScam) {
      setTimeout(() => {
        sound.playCallHangup();
        setVoiceCallOverlayState('rejected');

        setTimeout(() => {
          setVoiceCallOverlayState(null);
          sound.playMessagePing();
          sound.playTensionPulse();

          const isRelative = /mãe|pai|filho|filha|primo|tio|irmã|irmão/i.test(scamCase.title + scamCase.sender);
          const replyText = isRelative
            ? `Pai/Mãe, não consigo atender ligação agora! O microfone do celular quebrou quando caiu no chão. Por favor não desconfia de mim e me ajuda pelo texto!`
            : `Atenção: Por protocolo de segurança, este canal opera exclusivamente via mensagens criptografadas e não aceita chamadas de voz. Favor responder por aqui.`;

          if (behaviorClue && !inspectedClueIds.includes(behaviorClue.id)) {
            handleInspectClue(behaviorClue);
          }

          onPerformAction({
            id: `act-${scamCase.id}-call-attempt`,
            label: 'Ligar para o Contato (Chamada de Voz)',
            actionType: 'investigation',
            playerMessage: `Ligação de voz recusada`,
            replyMessage: replyText,
            evidenceDiscovered: {
              id: `ev-${scamCase.id}-call-refusal`,
              title: 'Recusa Sistemática de Chamada de Voz',
              description: 'O contato rejeitou a chamada telefônica e deu desculpa para só falar por texto.',
              status: 'suspicious',
              forensicFact: 'Golpistas evitam ligações porque não possuem a voz real da vítima.',
            },
          });

          showToast('📞 Chamada recusada pelo contato.');
        }, 1200);
      }, 2500);
    } else {
      setTimeout(() => {
        sound.playCallPickup();
        setVoiceCallOverlayState('connected');

        setTimeout(() => {
          setVoiceCallOverlayState(null);
          sound.playSuccess();

          if (behaviorClue && !inspectedClueIds.includes(behaviorClue.id)) {
            handleInspectClue(behaviorClue);
          }

          onPerformAction({
            id: `act-${scamCase.id}-call-attempt`,
            label: 'Ligar para o Contato (Chamada de Voz)',
            actionType: 'investigation',
            playerMessage: `Ligação telefônica atendida`,
            replyMessage: `Alô? Olá, sou eu mesmo! Estou confirmando as informações diretamente com você.`,
            evidenceDiscovered: {
              id: `ev-${scamCase.id}-call-success`,
              title: 'Voz Autêntica Confirmada',
              description: 'O contato atendeu normalmente e confirmou sua identidade.',
              status: 'clean',
              forensicFact: 'Canais e pessoas legítimas atendem ligações ou autorizam contato oficial.',
            },
          });

          showToast('📞 Chamada atendida! Identidade confirmada.');
        }, 2000);
      }, 2000);
    }
  };

  const handleRequestVoiceAudio = () => {
    setIsVoiceProofModalOpen(false);
    sound.playKeyboardClick();

    const behaviorClue = scamCase.clues.find(
      (k) => k.category === 'behavior' || k.id.includes('behavior') || k.inspection.type === 'security'
    );

    const playerMsg =
      ageGroup === 'senior'
        ? 'Me manda um áudio rapidinho falando comigo pra eu ouvir sua voz.'
        : 'Manda um áudio rápido de 5 segundos falando meu nome pra eu ouvir sua voz.';

    if (scamCase.isScam) {
      setTimeout(() => {
        sound.playMessagePing();
        sound.playTensionPulse();

        const isRelative = /mãe|pai|filho|filha|primo|tio|irmã|irmão/i.test(scamCase.title + scamCase.sender);
        const replyText = isRelative
          ? `Já falei que não dá pra gravar áudio agora, meu microfone tá queimado! Poxa, você não confia em mim?! Por favor me manda o Pix logo!`
          : `Sistema automático: Envio e recebimento de notas de voz desabilitados neste canal corporativo. Prossiga por texto.`;

        if (behaviorClue && !inspectedClueIds.includes(behaviorClue.id)) {
          handleInspectClue(behaviorClue);
        }

        onPerformAction({
          id: `act-${scamCase.id}-audio-request`,
          label: 'Pedir Áudio de Voz',
          actionType: 'investigation',
          playerMessage: playerMsg,
          replyMessage: replyText,
          evidenceDiscovered: {
            id: `ev-${scamCase.id}-audio-refusal`,
            title: 'Desculpa para Fugir do Áudio de Voz',
            description: 'O contato se recusou a enviar um áudio de voz e usou desculpas evasivas.',
            status: 'suspicious',
            forensicFact: 'Golpistas usam fotos roubadas, mas não têm a voz real da pessoa.',
          },
        });
      }, 1000);
    } else {
      setTimeout(() => {
        sound.playMessagePing();
        sound.playSuccess();

        if (behaviorClue && !inspectedClueIds.includes(behaviorClue.id)) {
          handleInspectClue(behaviorClue);
        }

        onPerformAction({
          id: `act-${scamCase.id}-audio-request`,
          label: 'Pedir Áudio de Voz',
          actionType: 'investigation',
          playerMessage: playerMsg,
          replyMessage: `[Áudio de Voz 0:04] "Oi! Sou eu sim, pode ficar tranquilo(a)!"`,
          evidenceDiscovered: {
            id: `ev-${scamCase.id}-audio-success`,
            title: 'Áudio de Voz Autêntico',
            description: 'A pessoa enviou mensagem de voz legítima comprovando quem é.',
            status: 'clean',
            forensicFact: 'Pessoas reais não têm medo de mandar áudio rápido.',
          },
        });
      }, 1000);
    }
  };

  const handleEndVoiceCall = () => {
    sound.playCallHangup();
    setVoiceCallOverlayState(null);
  };

  const handleHangup = () => {
    sound.playBlip();
    showToast('📴 Chamada encerrada!');
  };

  const handleOpenContactModal = () => {
    sound.playBlip();
    const contactClue = scamCase.clues.find(
      (k) => k.category === 'phone' || k.inspection.type === 'contact'
    );
    if (hasOpenedScamMessage && contactClue && !inspectedClueIds.includes(contactClue.id)) {
      handleInspectClue(contactClue);
    }
    setActiveModal('contact');
  };

  const handleCopyPixKey = (key: string) => {
    try {
      navigator.clipboard?.writeText(key);
    } catch {}
    setCopiedPixKey(key);
    sound.playKeypress();
    showToast(`📋 Chave Pix copiada: ${key}`);
  };

  const flagged = stamped !== null && scamCase.isScam;

  // Render do app de mensagens conforme canal (controlado pelo pai para nunca repetir animações)
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
            onContactClick={handleOpenContactModal}
            isBlocked={isBlocked}
            onBlockContact={handleBlockContact}
            onCallClick={handleStartVoiceCall}
            onBackToHome={() => setActiveApp('home')}
            onOpenNotes={handleOpenNotes}
            revealedCount={revealedBubblesCount}
            isSuspectTyping={isContactTyping}
            hasFinishedTyping={hasDeliveredStory}
            revealedChoicesCount={revealedChoicesCount}
            ageGroup={ageGroup}
            onOpenVerdictModal={() => setIsVerdictModalOpen(true)}
            inspectedClueCount={inspectedClueIds.length}
            inspectedClueIds={inspectedClueIds}
            onInspectClue={handleInspectClue}
            onCopyPixKey={handleCopyPixKey}
            onRequestVoiceAudio={handleRequestVoiceAudio}
            directChancesLeft={directChancesLeft}
            isDirectVerdictLocked={isDirectVerdictLocked}
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
            onOpenVerdictModal={() => setIsVerdictModalOpen(true)}
            onOpenNotes={handleOpenNotes}
            directChancesLeft={directChancesLeft}
            isDirectVerdictLocked={isDirectVerdictLocked}
            stamped={stamped}
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
            onContactClick={handleOpenContactModal}
            onBackToHome={() => setActiveApp('home')}
            onOpenNotes={handleOpenNotes}
            revealedCount={revealedBubblesCount}
            hasFinishedTyping={hasDeliveredStory}
            revealedChoicesCount={revealedChoicesCount}
            ageGroup={ageGroup}
            onOpenVerdictModal={() => setIsVerdictModalOpen(true)}
            inspectedClueCount={inspectedClueIds.length}
            inspectedClueIds={inspectedClueIds}
            onInspectClue={handleInspectClue}
            onCallClick={handleStartVoiceCall}
            directChancesLeft={directChancesLeft}
            isDirectVerdictLocked={isDirectVerdictLocked}
          />
        );
    }
  };

  const number = findContactNumber(scamCase);

  return (
    <div
      key={`phone-${scamCase.id}`}
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
          {/* SETUP INICIAL COM CALIBRAGEM DE IDADE (OLÁ -> SUA IDADE -> COMO FUNCIONA) */}
          <AnimatePresence>
            {bootStage !== 'ready' && (
              <motion.div
                key="boot-screen-overlay"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-between p-6 text-center select-none"
              >
                <div className="w-full flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleFinishSetup}
                    className="text-[11px] font-mono text-white/40 hover:text-white/80 transition px-2 py-1 cursor-pointer"
                  >
                    Pular ➔
                  </button>
                </div>

                {/* PASSO 1: OLÁ */}
                {bootStage === 'hello' && (
                  <div
                    onClick={() => {
                      sound.playKeypress();
                      setBootStage('age');
                    }}
                    className="flex flex-col items-center gap-4 cursor-pointer my-auto"
                  >
                    <span className="text-6xl sm:text-7xl font-extralight tracking-tight text-white/95 font-display">
                      Olá
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-white/60 font-mono tracking-widest uppercase">
                      <span>Toque para configurar</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}

                {/* PASSO 2: SELEÇÃO DE IDADE (CALIBRAGEM DE VIDA REAL E PERSONA) */}
                {bootStage === 'age' && (
                  <div className="flex flex-col items-center gap-4 my-auto w-full max-w-xs">
                    <div className="space-y-1">
                      <span className="text-2xl font-bold tracking-tight text-white font-display block">
                        Qual é a sua faixa de idade?
                      </span>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Ajustamos o tamanho do texto, o ritmo das mensagens e o estilo de conversa do celular para você.
                      </p>
                    </div>

                    <div className="w-full space-y-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSelectAgeGroup('young')}
                        className={`w-full p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                          ageGroup === 'young'
                            ? 'bg-white/15 border-white text-white'
                            : 'bg-white/5 border-white/15 hover:bg-white/10 text-neutral-200'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-white">Até 35 anos</div>
                          <div className="text-[11px] text-white/60">Ritmo rápido e respostas diretas</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/60 shrink-0" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectAgeGroup('adult')}
                        className={`w-full p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                          ageGroup === 'adult'
                            ? 'bg-white/15 border-white text-white'
                            : 'bg-white/5 border-white/15 hover:bg-white/10 text-neutral-200'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-white">36 a 59 anos</div>
                          <div className="text-[11px] text-white/60">Ritmo natural do dia a dia</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/60 shrink-0" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectAgeGroup('senior')}
                        className={`w-full p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                          ageGroup === 'senior'
                            ? 'bg-white/15 border-white text-white'
                            : 'bg-white/5 border-white/15 hover:bg-white/10 text-neutral-200'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-white">60 anos ou mais</div>
                          <div className="text-[11px] text-white/60">Letras maiores e leitura mais calma</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/60 shrink-0" />
                      </button>
                    </div>
                  </div>
                )}

                {/* PASSO 3: COMO FUNCIONA */}
                {bootStage === 'about' && (
                  <div className="flex flex-col items-center gap-4 my-auto max-w-xs">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-2xl font-bold tracking-tight text-white font-display block">
                        Como Funciona
                      </span>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Use o celular exatamente como você faria na vida real.
                      </p>
                    </div>

                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-left space-y-2.5 text-xs text-white/85">
                      <div className="flex items-start gap-2.5">
                        <span className="text-base leading-none">💬</span>
                        <span><strong>Leia com calma:</strong> As mensagens chegam no tempo normal de uma conversa.</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="text-base leading-none">🏦</span>
                        <span><strong>Use os aplicativos:</strong> Saia para a Tela Inicial para olhar o Meu Banco, o Google ou os Dados do Contato.</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="text-base leading-none">⚖️</span>
                        <span><strong>Decida com certeza:</strong> Quando descobrir a verdade, toque em Julgar Caso.</span>
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
                  </div>
                )}

                {/* Indicador de 3 passos na base */}
                <div className="w-full flex flex-col items-center gap-2 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full transition-all ${bootStage === 'hello' ? 'w-6 bg-white' : 'bg-white/30'}`} />
                    <span className={`w-2 h-2 rounded-full transition-all ${bootStage === 'age' ? 'w-6 bg-white' : 'bg-white/30'}`} />
                    <span className={`w-2 h-2 rounded-full transition-all ${bootStage === 'about' ? 'w-6 bg-white' : 'bg-white/30'}`} />
                  </div>
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
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-40 bg-black flex items-center justify-center pointer-events-none"
              >
                <div className="w-16 h-1 rounded-full bg-neutral-800/60" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* NOTIFICAÇÃO GLOBAL HEADS-UP (APENAS NA TELA INICIAL PARA NÃO POLUIR OUTROS APPS) */}
          {notificationArrived && activeApp === 'home' && !isLocked && !stamped && !hasOpenedScamMessage && (
            <div className="hidden" />
          )}

          {/* Roteador de Apps Estável (Zero Replay de Animações e Zero Flicker ao alternar apps) */}
          <div className="h-full w-full flex-1 overflow-hidden">
            {isLocked ? (
              <LockScreen
                c={scamCase}
                notificationArrived={notificationArrived}
                onUnlock={handleUnlockToHome}
                onOpenMessaging={handleOpenAppDirectly}
                levelText={levelText}
              />
            ) : activeApp === 'home' ? (
              <HomeScreen
                c={scamCase}
                notificationArrived={notificationArrived}
                onOpenMessaging={handleOpenAppDirectly}
                onOpenNotes={handleOpenNotes}
                onOpenBank={() => handleOpenBank()}
                onOpenBrowser={() => handleOpenBrowser()}
                onOpenVerdictModal={() => setIsVerdictModalOpen(true)}
                onOpenTips={() => setIsTipsModalOpen(true)}
                onStartVoiceCall={handleStartVoiceCall}
                onChangeAgeGroup={() => setBootStage('age')}
                ageGroup={ageGroup}
                onToast={showToast}
                inspectedClueCount={inspectedClueIds.length}
                levelText={levelText}
                directChancesLeft={directChancesLeft}
                isDirectVerdictLocked={isDirectVerdictLocked}
                stamped={stamped}
              />
            ) : activeApp === 'messaging' ? (
              renderMessagingApp()
            ) : activeApp === 'notes' ? (
              <NotesScreen
                c={scamCase}
                inspectedClueIds={inspectedClueIds}
                onBack={() => setActiveApp(previousApp === 'notes' ? 'home' : previousApp)}
                onOpenVerdict={() => setIsVerdictModalOpen(true)}
                onOpenTips={() => setIsTipsModalOpen(true)}
              />
            ) : activeApp === 'bank' ? (
              <BankScreen
                c={scamCase}
                inspectedClueIds={inspectedClueIds}
                hasOpenedScamMessage={hasOpenedScamMessage}
                copiedPixKey={copiedPixKey}
                onInspectClue={handleInspectClue}
                onConfrontPixInChat={handleConfrontPixInChat}
                onBack={() => setActiveApp(previousApp)}
              />
            ) : (
              <BrowserScreen
                c={scamCase}
                url={browserUrl}
                inspectedClueIds={inspectedClueIds}
                onInspectClue={handleInspectClue}
                onBack={() => setActiveApp(previousApp)}
              />
            )}
          </div>

          {/* Notch Dinâmico no Topo do Celular (Estático, sem piscar) */}
          <div className="hidden sm:flex absolute top-1.5 left-1/2 -translate-x-1/2 w-[82px] h-[19px] rounded-full bg-black items-center justify-between px-3 z-30 shadow-md border border-white/10 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-[#1e293b]" />
            <span className="w-2 h-2 rounded-full bg-[#10b981]/60" />
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

          {/* TELA NATIVA DE DADOS DO CONTATO (FIDELIDADE DE SISTEMA OPERACIONAL SEM SPOILERS FORENSES) */}
          {activeModal === 'contact' && (() => {
            const contactClue = scamCase.clues.find(
              (k) => k.category === 'phone' || k.inspection.type === 'contact'
            );
            const displayPhone = contactClue?.inspection.field1Value || number || 'Número desconhecido';
            const displayRegion = contactClue?.inspection.field2Value || 'Brasil';
            const displayAccountType = contactClue?.inspection.field3Value || 'Conta padrão';

            return (
              <div className="absolute inset-0 z-50 bg-[#0b141a] text-white flex flex-col overflow-y-auto select-none">
                <StatusBar time={scamCase.time} dark />

                {/* Barra de navegação nativa */}
                <div className="flex items-center justify-between px-3 py-2.5 bg-[#1f2c34] border-b border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex items-center gap-1 text-xs font-medium text-white/90 hover:text-white cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                  <span className="text-xs font-semibold text-white">Dados do contato</span>
                  <div className="w-12" />
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto no-scrollbar">
                  {/* Cabeçalho com Foto, Nome e Telefone */}
                  <div className="bg-[#1f2c34] rounded-2xl p-4 flex flex-col items-center text-center space-y-2 border border-white/5">
                    <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center text-2xl font-bold text-white shadow">
                      {cleanName(scamCase.sender).charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{cleanName(scamCase.sender)}</h3>
                      <p className="text-xs text-neutral-300 font-mono mt-0.5">{displayPhone}</p>
                    </div>

                    {/* Ações rápidas nativas do contato */}
                    <div className="grid grid-cols-3 gap-2 w-full pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModal(null);
                          handleStartVoiceCall();
                        }}
                        className="flex flex-col items-center gap-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 text-[11px] font-medium cursor-pointer transition"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Ligar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="flex flex-col items-center gap-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 text-[11px] font-medium cursor-pointer transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Conversar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleBlockContact}
                        className="flex flex-col items-center gap-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-red-400 text-[11px] font-medium cursor-pointer transition"
                      >
                        <UserX className="w-4 h-4" />
                        <span>{isBlocked ? 'Bloqueado' : 'Bloquear'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Recado e detalhes do número (onde o jogador percebe o DDD/DDI ou tipo da conta) */}
                  <div className="bg-[#1f2c34] rounded-2xl p-3.5 space-y-2.5 text-xs border border-white/5">
                    <div>
                      <span className="text-[10.5px] text-neutral-400 block">Recado</span>
                      <span className="text-white font-medium">Disponível</span>
                    </div>
                    <div className="border-t border-white/5 pt-2">
                      <span className="text-[10.5px] text-neutral-400 block">
                        {contactClue?.inspection.field1Label || 'Número de telefone'}
                      </span>
                      <span className="text-white font-mono font-medium">{displayPhone}</span>
                    </div>
                    <div className="border-t border-white/5 pt-2">
                      <span className="text-[10.5px] text-neutral-400 block">
                        {contactClue?.inspection.field2Label || 'Localidade / Prefixo'}
                      </span>
                      <span className="text-white font-medium">{displayRegion}</span>
                    </div>
                    {contactClue?.inspection.field3Label && (
                      <div className="border-t border-white/5 pt-2">
                        <span className="text-[10.5px] text-neutral-400 block">
                          {contactClue.inspection.field3Label}
                        </span>
                        <span className="text-white font-medium">{displayAccountType}</span>
                      </div>
                    )}
                  </div>

                  {/* Aviso padrão de criptografia */}
                  <div className="bg-[#1f2c34] rounded-2xl p-3.5 flex items-start gap-2.5 text-[11px] text-neutral-400 border border-white/5">
                    <Lock className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-neutral-200 font-medium block">Criptografia</span>
                      <span>As mensagens e as chamadas são protegidas com a criptografia de ponta a ponta.</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* MODAL DE DICAS DE INVESTIGAÇÃO DO CELULAR */}
          <TipsModal
            isOpen={isTipsModalOpen}
            onClose={() => setIsTipsModalOpen(false)}
            c={scamCase}
          />

          {/* MODAL DE DÚVIDA PERICIAL NA TRANSFERÊNCIA PIX */}
          <PixDoubtModal
            isOpen={isPixDoubtModalOpen}
            onClose={() => setIsPixDoubtModalOpen(false)}
            c={scamCase}
            onConfrontInChat={handleConfrontPixInChat}
            onMarkClue={(clue) => {
              handleInspectClue(clue);
              setIsPixDoubtModalOpen(false);
              showToast('✓ Favorecido desconhecido anotado nas notas!');
            }}
          />

          {/* MODAL DE EXIGÊNCIA DE PROVA DE VOZ */}
          <VoiceProofModal
            isOpen={isVoiceProofModalOpen}
            onClose={() => setIsVoiceProofModalOpen(false)}
            c={scamCase}
            onStartCall={handleStartVoiceCall}
            onRequestAudio={handleRequestVoiceAudio}
          />

          {/* OVERLAY DE CHAMADA TELEFÔNICA (PROVA DE VOZ) */}
          <VoiceCallOverlay
            state={voiceCallOverlayState}
            c={scamCase}
            onEndCall={handleEndVoiceCall}
          />

          {/* MODAL DO TRIBUNAL PERICIAL COM REVALIDAÇÃO FORENSE (O PORQUÊ) */}
          <VerdictModal
            c={scamCase}
            isOpen={isVerdictModalOpen}
            chancesLeft={directChancesLeft}
            isPericial={inspectedClueIds.length >= 3}
            onClose={() => setIsVerdictModalOpen(false)}
            onConfirm={handleConfirmVerdict}
          />

          {/* MODAL DE RECALIBRAÇÃO DIDÁTICA (1º ERRO - INDÍCIO CIRCUNSTANCIAL VS PROVA MATERIAL) */}
          <DidacticFeedbackModal
            isOpen={Boolean(didacticFeedback?.open)}
            onClose={() => setDidacticFeedback(null)}
            onRetryVerdict={() => {
              setDidacticFeedback(null);
              setIsVerdictModalOpen(true);
            }}
            onInvestigate={() => {
              setDidacticFeedback(null);
              handleOpenNotes();
            }}
            feedback={didacticFeedback?.feedback || ''}
            isCircumstantial={Boolean(didacticFeedback?.isCircumstantial)}
            chancesLeft={didacticFeedback?.chancesLeft ?? 1}
          />

          {/* MODAL DE BLOQUEIO POR IMPULSO (2º ERRO - PERÍCIA OBRIGATÓRIA NO DOSSIÊ) */}
          <LockoutModal
            isOpen={isLockoutModalOpen}
            onOpenNotes={() => {
              setIsLockoutModalOpen(false);
              handleOpenNotes();
            }}
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
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-1">
                    📋 RESUMO DO CASO
                  </span>
                  {wasCorrect && earnedXp > 0 && (
                    <span className="font-mono font-bold text-[10px] bg-emerald-500/25 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/40 shrink-0">
                      +{earnedXp} XP
                    </span>
                  )}
                </div>

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
                      ? 'Você acertou! Decisão correta.'
                      : scamCase.isScam
                      ? 'Atenção: era um golpe! Você caiu nele.'
                      : 'Atenção: a mensagem era segura e verdadeira.'}
                  </div>
                </div>

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
                        ? '✓ Motivo certo:'
                        : '⚠️ Motivo principal:'}
                    </span>
                    <p className="leading-snug">
                      {userHypothesisIndex === scamCase.correctEvidenceIndex
                        ? 'Você identificou exatamente o detalhe que comprova a situação!'
                        : `Você escolheu: "${scamCase.evidenceHypotheses[userHypothesisIndex]}". Mas o detalhe principal era: ${scamCase.keyEvidenceReason}`}
                    </p>
                  </div>
                )}

                {scamCase.pedagogy?.emotionalTrigger && (
                  <div className="text-[10.5px] bg-white/5 border border-white/10 rounded-xl p-2 space-y-0.5">
                    <span className="text-[9px] font-mono uppercase tracking-wide text-amber-300 font-bold block">
                      ⚠️ Como tentaram te enganar:
                    </span>
                    <span className="text-neutral-300 leading-snug block">
                      {scamCase.pedagogy.emotionalTrigger}
                    </span>
                  </div>
                )}

                <div className="text-[11px] text-neutral-200 leading-relaxed bg-black/40 border border-white/10 rounded-xl p-2.5">
                  <span className="text-[9px] font-mono uppercase tracking-wide text-sky-400 font-bold block mb-0.5">
                    🔎 O que foi descoberto:
                  </span>
                  {scamCase.keyEvidenceReason || scamCase.explanation}
                </div>

                <div className="p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/30">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                    📌 Regra de Ouro (Para lembrar sempre)
                  </div>
                  <p className="text-[11px] font-semibold text-white leading-snug mt-0.5">
                    {scamCase.pedagogy.goldenRule}
                  </p>
                </div>

                {scamCase.isScam && !isBlocked && (
                  <button
                    type="button"
                    onClick={handleBlockContact}
                    className="w-full py-2 bg-red-600/85 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Bloquear e Denunciar este Número</span>
                  </button>
                )}
                {scamCase.isScam && isBlocked && (
                  <div className="py-2 bg-red-950/60 border border-red-500/30 text-red-300 font-bold text-xs rounded-xl text-center">
                    ✓ Número bloqueado e denunciado com sucesso!
                  </div>
                )}

                {onNextCase && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBlip();
                      onNextCase();
                    }}
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
                  >
                    <span>Próximo Caso ➔</span>
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
                {wasCorrect ? 'resposta certa' : 'resposta incorreta'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
