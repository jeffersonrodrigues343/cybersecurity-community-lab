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
  Search,
  Sun,
  MessageCircle,
  CreditCard,
  FileText,
  Check,
  CheckCircle,
  Copy,
  Lightbulb,
  AlertTriangle,
  Send,
  Smile,
  Paperclip,
} from 'lucide-react';
import type { ScamCase, InteractiveAction, InvestigativeClue } from '../data/scamsData';
import { sound } from '../utils/audio';

type Verdict = 'scam' | 'safe' | null;

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
              initial={{ y: -25, opacity: 0, scale: 0.94 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
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
                <span className="animate-pulse">💬 Toque para ler a mensagem</span>
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
  onOpenBank,
  onOpenBrowser,
  onStartVoiceCall,
  onOpenContactModal,
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
    <div className="flex flex-col h-full bg-[#18181b] text-white select-none">
      <StatusBar time={c.time} dark />

      {/* Header do Dossiê */}
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
          <span>Meu Dossiê de Investigação 📋</span>
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenTips && (
            <button
              type="button"
              onClick={onOpenTips}
              className="flex items-center gap-1 text-[10.5px] font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 rounded-full cursor-pointer transition active:scale-95"
              title="Dicas de investigação"
            >
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>Dicas</span>
            </button>
          )}
          <span className="text-[11px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full font-bold">
            {completedCount}/{totalClues}
          </span>
        </div>
      </div>

      {/* Conteúdo do Dossiê */}
      <div className="flex-1 overflow-y-auto no-scrollbar overscroll-contain p-3.5 space-y-3">
        <div className="border-b border-white/10 pb-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
            Checklist de Evidências Forenses
          </div>
          <h2 className="text-sm font-bold text-white mt-0.5">
            {c.title}
          </h2>
        </div>

        {/* Os 3 Passos de Verificação com Botões de Ação Direta */}
        <div className="space-y-2.5">
          {c.clues.slice(0, 3).map((clue, idx) => {
            const isChecked = isStepChecked(idx);
            const guide = getClueGuide(clue);

            return (
              <motion.div
                key={clue.id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-2xl border transition-all ${
                  isChecked
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-white/5 border-amber-400/40 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition ${
                      isChecked
                        ? 'bg-emerald-500 text-white'
                        : 'border-2 border-amber-400/80 bg-amber-400/10'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block">
                        Passo {idx + 1} • {clue.name}
                      </span>
                      {isChecked ? (
                        <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                          ✓ Prova Apurada
                        </span>
                      ) : (
                        <span className="text-[9.5px] font-mono text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded font-bold">
                          Pendente
                        </span>
                      )}
                    </div>

                    {!isChecked ? (
                      <div className="mt-1 space-y-2">
                        <p className="text-xs font-bold text-white leading-snug">
                          👉 {guide.title}
                        </p>

                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/25 space-y-1.5 text-[11.5px] text-neutral-200">
                          {guide.steps.map((stepText, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-1.5 leading-snug">
                              <span className="text-amber-400 font-bold shrink-0">{sIdx + 1}.</span>
                              <span>{stepText}</span>
                            </div>
                          ))}
                        </div>

                        {/* Botões de Ação Direta (Atalhos diegéticos para evitar softlock) */}
                        {(clue.category === 'pix' || clue.inspection.type === 'pix') && onOpenBank && (
                          <button
                            type="button"
                            onClick={onOpenBank}
                            className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Abrir Meu Banco (Conferir Titular Pix) ➔</span>
                          </button>
                        )}

                        {(clue.category === 'system' || clue.id.includes('extrato') || clue.name.toLowerCase().includes('extrato') || clue.name.toLowerCase().includes('banco')) && onOpenBank && (
                          <button
                            type="button"
                            onClick={onOpenBank}
                            className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Abrir Meu Banco (Conferir Extrato Real) ➔</span>
                          </button>
                        )}

                        {(clue.category === 'whois' || clue.inspection.type === 'link' || clue.id.includes('url') || clue.id.includes('google')) && onOpenBrowser && (
                          <button
                            type="button"
                            onClick={() => onOpenBrowser(clue.inspection.field1Value?.startsWith('http') ? clue.inspection.field1Value : undefined)}
                            className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shadow-sm"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>Inspecionar no Google / Navegador ➔</span>
                          </button>
                        )}

                        {(clue.category === 'behavior' || clue.id.includes('behavior') || clue.id.includes('central-0800') || clue.id.includes('call')) && onStartVoiceCall && (
                          <button
                            type="button"
                            onClick={onStartVoiceCall}
                            className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shadow-sm"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Fazer Ligação Telefônica / Teste de Voz ➔</span>
                          </button>
                        )}

                        {(clue.category === 'phone' || clue.inspection.type === 'contact' || clue.id.includes('ddd') || clue.id.includes('ddi') || clue.id.includes('remetente')) && onOpenContactModal && (
                          <button
                            type="button"
                            onClick={onOpenContactModal}
                            className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shadow-sm"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Inspecionar Ficha do Remetente (DDD / Linha) ➔</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-white leading-snug mt-0.5">
                          {clue.question}
                        </p>
                        <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                          {clue.inspection.observation}
                        </p>
                        <div className="mt-2 pt-1.5 border-t border-emerald-500/20 text-[10.5px] text-emerald-300 font-medium">
                          ✓ Fato apurado: {clue.evidenceResult.fato}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Card de Celebração e Botão de Veredito quando 3/3 Passos Estão Checados */}
        {completedCount >= totalClues && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border-2 border-amber-400 text-center space-y-2 mt-2"
          >
            <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider font-mono">
              <span>🎯 AUDITORIA COMPLETA (3/3)</span>
            </div>
            <p className="text-xs text-white/90">
              Você auditou todas as evidências no celular e possui provas irrefutáveis para julgar o caso com segurança total.
            </p>
            {onOpenVerdict && (
              <button
                type="button"
                onClick={onOpenVerdict}
                className="w-full min-h-[48px] py-3 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>⚖️ Emitir Veredito Pericial (Perícia Concluída ✓)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}

        <div className="pt-2 text-center">
          <span className="text-[10px] font-mono text-neutral-500">
            Dossiê investigativo pessoal • Salvo no aparelho
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
  inspectedClueIds = [],
  hasOpenedScamMessage: _hasOpenedScamMessage = false,
  copiedPixKey = null,
  onInspectClue,
  onConfrontPixInChat,
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

  const [enteredKey, setEnteredKey] = useState<string>(() => copiedPixKey || pixClue?.inspection.field1Value || '');
  const [hasQueriedPix, setHasQueriedPix] = useState<boolean>(() => Boolean(copiedPixKey || pixClue));

  // Sincroniza se a chave copiada mudar externamente
  useEffect(() => {
    if (copiedPixKey) {
      setEnteredKey(copiedPixKey);
      setHasQueriedPix(true);
    }
  }, [copiedPixKey]);

  // Dados do Pix extraídos dinamicamente do caso
  const pixTargetName = pixClue?.inspection.field2Value || 'Valdir dos Santos';
  const pixBankName = pixClue?.inspection.field3Value || 'Pessoa Física - Nu Pagamentos S.A.';
  const matchedAmount = c.messageContent.match(/R\$\s?[\d.,]+/)?.[0];
  const pixAmount = matchedAmount || (c.clues[0]?.inspection?.field3Value?.includes('R$')
    ? c.clues[0].inspection.field3Value
    : 'R$ 480,00');

  const isPixInspected = Boolean(pixClue && inspectedClueIds.includes(pixClue.id));
  const isBankInspected = Boolean(bankClue && inspectedClueIds.includes(bankClue.id));

  const isCaseLegitimate = !c.isScam;

  return (
    <div className="flex flex-col h-full bg-[#0d0914] text-white select-none">
      <StatusBar time={c.time} dark />

      {/* Topo Limpo do Banco */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/5 bg-[#140e21]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-purple-300 hover:text-white font-medium cursor-pointer active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
        <div className="flex items-center gap-1.5 font-semibold text-xs text-white tracking-wide">
          <CreditCard className="w-3.5 h-3.5 text-purple-300" />
          <span>Meu Banco</span>
        </div>
        <span className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
        {/* Card de Saldo Minimalista */}
        <div className="bg-[#181126] rounded-2xl p-3.5 border border-purple-500/15 shadow-sm">
          <span className="text-[11px] text-purple-300/70 font-medium">Saldo disponível</span>
          <div className="text-2xl font-bold font-mono tracking-tight mt-0.5 text-white">R$ 1.250,00</div>
        </div>

        {/* Abas Limpas */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-xl border border-white/5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('pix')}
            className={`py-1.5 rounded-lg transition cursor-pointer active:scale-95 ${
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
            className={`py-1.5 rounded-lg transition cursor-pointer active:scale-95 ${
              activeTab === 'statement'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Extrato
          </button>
        </div>

        {/* ================= ABA 1: ÁREA PIX ================= */}
        {activeTab === 'pix' && (
          <div className="space-y-2.5">
            {hasQueriedPix ? (
              /* Tela de Conferência Limpa */
              <div className="bg-[#181126] rounded-2xl p-3.5 border border-purple-500/15 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs">
                  <span className="text-purple-300 font-medium">Dados da Transferência</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Cadastro Banco Central ✓</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Valor solicitado</span>
                    <span className="text-base font-bold font-mono text-white">{pixAmount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Favorecido (Titular Real da Conta)</span>
                    <span className="text-sm font-bold font-mono text-amber-300">{pixTargetName}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-white/5">
                    <span className="text-neutral-400">Chave Pix</span>
                    <span className="font-mono text-neutral-200">{enteredKey || pixClue?.inspection.field1Value}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Instituição</span>
                    <span className="text-neutral-200">{pixBankName}</span>
                  </div>
                </div>

                <p className="text-[11px] text-purple-200/80 bg-purple-900/20 rounded-xl p-2.5 border border-purple-500/15 leading-relaxed">
                  💡 O Banco Central revelou que o dono real desta chave é <strong>{pixTargetName}</strong>. Confira se bate com quem pediu o dinheiro!
                </p>

                {pixClue && (
                  <div className="space-y-2">
                    {onConfrontPixInChat && c.channel === 'whatsapp' && (
                      <button
                        type="button"
                        onClick={() => onConfrontPixInChat(pixClue)}
                        className="w-full py-2.5 px-3 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4 shrink-0" />
                        <span>Anotar Prova e Questionar &quot;{pixTargetName}&quot; no Chat ➔</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (!isPixInspected) onInspectClue?.(pixClue);
                        onBack();
                      }}
                      className={`w-full py-2.5 text-xs font-semibold rounded-xl transition cursor-pointer active:scale-95 ${
                        isPixInspected
                          ? 'bg-emerald-600/80 text-white'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {isPixInspected
                        ? '✓ Titular já salvo no Dossiê • Voltar à Mensagem'
                        : '✓ Salvar Evidência no Dossiê e Voltar'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Entrada de Chave Limpa */
              <div className="bg-[#181126] rounded-2xl p-3.5 border border-purple-500/15 space-y-2.5">
                <span className="text-xs font-medium text-neutral-300 block">Informe a Chave Pix</span>

                {copiedPixKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setEnteredKey(copiedPixKey);
                      setHasQueriedPix(true);
                    }}
                    className="w-full py-2 px-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-xl text-purple-200 text-xs font-medium flex items-center justify-between cursor-pointer active:scale-95 transition"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      Colar chave copiada: {copiedPixKey}
                    </span>
                    <span className="text-[10px] text-purple-300 font-bold ml-1">Colar ➔</span>
                  </button>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={enteredKey}
                    onChange={(e) => setEnteredKey(e.target.value)}
                    placeholder="Cole ou digite a chave..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (enteredKey.trim()) setHasQueriedPix(true);
                    }}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl cursor-pointer active:scale-95 transition"
                  >
                    Consultar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= ABA 2: EXTRATO ================= */}
        {activeTab === 'statement' && (
          <div className="bg-[#181126] rounded-2xl p-3.5 border border-purple-500/15 space-y-3">
            <span className="text-xs font-medium text-neutral-300 block">Movimentações Recentes</span>

            <div className="space-y-2.5 text-xs divide-y divide-white/5">
              {isCaseLegitimate ? (
                <div className="pt-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">Padaria Estrela</span>
                    <span className="font-mono font-bold text-white">- R$ 34,90</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">Hoje, 08:44 • Débito</span>
                </div>
              ) : (
                <div className="pt-1">
                  <div className="flex justify-between items-center text-neutral-300">
                    <span>Hoje ({c.time})</span>
                    <span className="text-[10px] text-neutral-400 font-mono">Sem lançamentos</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">Nenhuma compra ou débito foi realizado hoje.</span>
                </div>
              )}

              <div className="pt-2">
                <div className="flex justify-between items-center text-neutral-300">
                  <span>Supermercado Central</span>
                  <span className="font-mono text-neutral-400">- R$ 112,40</span>
                </div>
                <span className="text-[10px] text-neutral-500 block mt-0.5">07 de outubro • Débito</span>
              </div>
            </div>

            <p className="text-[11px] text-purple-200/80 bg-purple-900/20 rounded-xl p-2.5 border border-purple-500/15 leading-relaxed">
              💡 Verifique se a compra mencionada na mensagem realmente existe no extrato de hoje.
            </p>

            {bankClue && (
              <button
                type="button"
                onClick={() => {
                  if (!isBankInspected) onInspectClue?.(bankClue);
                  onBack();
                }}
                className={`w-full py-2.5 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95 ${
                  isBankInspected
                    ? 'bg-emerald-600/80 text-white'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg'
                }`}
              >
                {isBankInspected
                  ? '✓ Extrato Limpo já anotado • Voltar à Mensagem'
                  : '✓ Confirmar Extrato Limpo no Dossiê e Voltar ➔'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Botão de Retorno */}
      <div className="p-2.5 bg-[#140e21] border-t border-white/5">
        <button
          type="button"
          onClick={onBack}
          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl cursor-pointer active:scale-95 transition text-center"
        >
          ← Voltar ao Celular
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
// BARRA DE AÇÃO DE VEREDITO UNIFICADA (HOMESCREEN, WHATSAPP E SMS)
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
      <div className="p-2 pt-0 w-full">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenNotes();
          }}
          className="w-full min-h-[48px] py-2.5 px-3 rounded-xl bg-slate-900 border border-amber-400/50 hover:border-amber-400 text-amber-200 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">🔒 Perícia Obrigatória ({inspectedClueCount}/3 Provas) • Ver Dossiê</span>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
        </button>
      </div>
    );
  }

  if (inspectedClueCount >= 3) {
    return (
      <div className="p-2 pt-0 w-full">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenVerdictModal();
          }}
          className="w-full min-h-[48px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400 hover:brightness-110 text-slate-950 font-extrabold text-xs shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-between animate-pulse"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⚖️</span>
            <span>Emitir Veredito Pericial (Perícia Concluída ✓)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-950/70 shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-2 pt-0 w-full">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenVerdictModal();
        }}
        className="w-full min-h-[48px] py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm">⚖️</span>
          <span>Julgar Mensagem ({directChancesLeft}/2 chances)</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono bg-slate-950/20 px-2 py-0.5 rounded-md font-bold shrink-0">
          <span>Provar Decisão</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </button>
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
  const isBrowserClueInspected = Boolean(browserClue && inspectedClueIds.includes(browserClue.id));

  const displayUrl = url || 'https://pesquisa-segura.com.br';
  const isSuspicious = c.isScam;

  // Sugestões contextuais realistas para o caso atual
  const getSuggestedQueries = () => {
    const text = `${c.title} ${c.messageContent} ${c.sender}`.toLowerCase();
    const suggestions: string[] = [];

    if (text.includes('pix') || text.includes('banco') || text.includes('transferência') || text.includes('magalu') || c.category === 'pix') {
      suggestions.push('sms compra aprovada 0800 Magazine Luiza é golpe?');
      suggestions.push('falsa central de segurança número 0800 pede pix');
    }
    if (text.includes('mãe') || text.includes('pai') || text.includes('filho') || text.includes('número novo')) {
      suggestions.push('golpe do novo número filho pedindo dinheiro whatsapp');
      suggestions.push('como saber se parente realmente trocou de zap');
    }
    if (text.includes('correios') || text.includes('encomenda') || text.includes('alfândega') || text.includes('taxa')) {
      suggestions.push('sms correios taxa alfandegária retirada é golpe?');
      suggestions.push('como rastrear encomenda no portal oficial correios');
    }
    if (text.includes('vaga') || text.includes('shopee') || text.includes('tarefas') || text.includes('telegram')) {
      suggestions.push('vaga de emprego shopee telegram pedindo pix é golpe?');
      suggestions.push('golpe das tarefas curtir produtos pagar taxa vip');
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
    if (browserClue && !isBrowserClueInspected) {
      onInspectClue?.(browserClue);
    }
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
            <div className="mt-auto pt-4 space-y-2">
              {browserClue && (
                <button
                  type="button"
                  onClick={() => {
                    if (!isBrowserClueInspected) {
                      onInspectClue?.(browserClue);
                    }
                    onBack();
                  }}
                  className={`w-full py-2.5 font-bold text-xs rounded-xl shadow cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5 ${
                    isBrowserClueInspected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {isBrowserClueInspected
                      ? '✓ Evidência já salva • Voltar à Mensagem'
                      : '✓ Anotar Evidência no Dossiê e Voltar ➔'}
                  </span>
                </button>
              )}

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
                {isSuspicious ? '⚠️ Endereço Falso / Site Suspeito' : '✅ Conexão Criptografada e Segura'}
              </h4>
              <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                {isSuspicious
                  ? 'O endereço verificado não pertence ao site oficial da empresa e foi criado recentemente para aplicar golpes!'
                  : 'O site possui certificado digital válido e pertence aos canais autênticos.'}
              </p>
            </div>

            <div className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-left text-[10.5px] space-y-1">
              <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold block">
                Registro do Site:
              </span>
              <div className="font-mono text-white text-[11px] break-all">{displayUrl}</div>
              {browserClue && (
                <div className="text-[10.5px] text-amber-300 pt-1 font-medium">
                  • {browserClue.inspection.field2Label}: {browserClue.inspection.field2Value}
                  <br />• {browserClue.inspection.field3Label}: {browserClue.inspection.field3Value}
                </div>
              )}
              <div className="text-[10px] text-neutral-400 pt-1">
                {isSuspicious
                  ? browserClue?.inspection.observation || 'Site criado há poucos dias em servidor anônimo no exterior.'
                  : 'Domínio registrado com CNPJ e autoridade certificadora válida.'}
              </div>
            </div>

            <div className="w-full space-y-2 pt-2">
              {browserClue && (
                <button
                  type="button"
                  onClick={() => {
                    if (!isBrowserClueInspected) {
                      onInspectClue?.(browserClue);
                    }
                    onBack();
                  }}
                  className={`w-full py-2.5 font-bold text-xs rounded-xl shadow-lg cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5 ${
                    isBrowserClueInspected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {isBrowserClueInspected
                      ? '✓ Evidência do Link já salva • Voltar'
                      : '✓ Anotar Evidência do Site Falso e Voltar ➔'}
                  </span>
                </button>
              )}

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
// GERADOR DINÂMICO DE AÇÕES DE CONFRONTO FORENSE POR ETAPA
// ============================================================================
const getClueConfrontationAction = (
  clue: InvestigativeClue,
  c: ScamCase,
): InteractiveAction => {
  // Mapeamento específico para as 4 Fases Canônicas (100% Realista ao Contexto)
  if (clue.id === 'clue-1-ddd') {
    return {
      id: `act-${c.id}-ddd`,
      label: '📱 Perguntar: "Filha, por que esse número novo está com DDD 85 (Ceará)?"',
      actionType: 'investigation',
      playerMessage: 'Ué filha, por que esse número novo está com DDD 85 (Ceará) se a gente mora aqui em São Paulo?',
      replyMessage:
        'Mãe, é porque comprei esse chip provisório na banca perto da faculdade e foi o único prefixo de promoção que tinha disponível! Me ajuda logo com o Pix antes das 15h!',
      evidenceDiscovered: {
        id: `ev-${c.id}-ddd`,
        title: 'DDD 85 Incompatível e Chip Comprado Ontem',
        description: 'O número pertence a outro estado (DDD 85) e foi ativado ontem como pré-pago.',
        status: 'suspicious',
        forensicFact: 'Golpistas usam chips descartáveis de outros estados para fingir que são familiares.',
      },
    };
  }

  if (clue.id === 'clue-1-pix') {
    const titular = clue.inspection.field2Value || 'Valdir dos Santos';
    return {
      id: `act-${c.id}-pix`,
      label: `💸 Confrontar: "Olhei no banco e esse CPF é de ${titular}! Quem é esse?!"`,
      actionType: 'investigation',
      playerMessage: `Acabei de simular o Pix no app do Meu Banco e apareceu o nome de ${titular} (Pessoa Física)! Quem é esse homem?! A faculdade não cobra por boleto?!`,
      replyMessage:
        'Mãe, o Valdir é o coordenador financeiro da faculdade! Ele disse que só segura minha vaga se pagar direto na conta pessoal dele agora, por favor faz logo!',
      evidenceDiscovered: {
        id: `ev-${c.id}-pix`,
        title: `Chave Pix em Nome de Laranja (${titular})`,
        description: `A conta Pix pertence a um desconhecido (${titular}) e não à faculdade ou à filha.`,
        status: 'suspicious',
        forensicFact: 'Instituições de ensino e empresas cobram por CNPJ oficial ou boleto registrado.',
      },
    };
  }

  if (clue.id === 'clue-1-behavior') {
    return {
      id: `act-${c.id}-audio`,
      label: '🎙️ Pedir Áudio: "Me manda um áudio de 5 segundos falando comigo pra eu ouvir sua voz"',
      actionType: 'investigation',
      playerMessage:
        'Filha, me manda um áudio de 5 segundos agora falando meu nome. Só transfiro dinheiro depois de ouvir a sua voz.',
      replyMessage:
        'Mãe, já falei que a tela caiu no chão e queimou o microfone desse aparelho! O áudio sai todo mudo! Poxa, você tá desconfiando da sua própria filha?! Faltam 10 minutos!',
      evidenceDiscovered: {
        id: `ev-${c.id}-audio`,
        title: 'Recusa Sistemática de Mandar Áudio ou Atender Voz',
        description: 'O contato inventou desculpa de microfone quebrado para fugir da prova de voz.',
        status: 'suspicious',
        forensicFact: 'Regra de ouro: Nunca transfira dinheiro para número novo sem ouvir a voz real do parente.',
      },
    };
  }

  if (clue.id === 'clue-2-url') {
    return {
      id: `act-${c.id}-url`,
      label: '🌐 Inspecionar o link "correios-taxas-alfandega.online" no Navegador',
      actionType: 'investigation',
      playerMessage: 'Inspeção de Segurança do Link: https://correios-taxas-alfandega.online/pagar',
      replyMessage:
        'Auditoria do Navegador: Site FALSO terminado em .online, registrado há apenas 3 dias na Islândia. O único site oficial dos Correios é correios.com.br.',
      evidenceDiscovered: {
        id: `ev-${c.id}-url`,
        title: 'Site Falso (.online) Criado Há 3 Dias no Exterior',
        description: 'O link não pertence aos Correios (correios.com.br) e foi criado recentemente para roubar Pix.',
        status: 'suspicious',
        forensicFact: 'Os Correios nunca usam sites terminados em .online, .top ou .site.',
      },
    };
  }

  if (clue.id === 'clue-2-rastreio') {
    return {
      id: `act-${c.id}-rastreio`,
      label: '📦 Consultar código "NL8392019BR" no Sistema Oficial dos Correios',
      actionType: 'investigation',
      playerMessage: 'Consulta no Sistema Oficial dos Correios: Código NL8392019BR',
      replyMessage:
        'Banco de Dados dos Correios: Objeto NL8392019BR NÃO ENCONTRADO. Código de rastreio falso/inexistente.',
      evidenceDiscovered: {
        id: `ev-${c.id}-rastreio`,
        title: 'Código de Rastreio Inexistente nos Correios',
        description: 'A encomenda citada no SMS simplesmente não existe no sistema oficial.',
        status: 'suspicious',
        forensicFact: 'Taxas reais de importação só existem dentro do portal oficial Minhas Importações (correios.com.br).',
      },
    };
  }

  if (clue.id === 'clue-2-remetente') {
    return {
      id: `act-${c.id}-remetente`,
      label: '📱 Verificar número que enviou o SMS (+55 11 98842-1092)',
      actionType: 'investigation',
      playerMessage: 'Auditoria da Linha Remetente: +55 (11) 98842-1092',
      replyMessage:
        'Operadora Informa: Este SMS partiu de um número de celular pré-pago comum de 9 dígitos, e não do código oficial de 5 dígitos dos Correios.',
      evidenceDiscovered: {
        id: `ev-${c.id}-remetente`,
        title: 'SMS Enviado por Celular Comum de 9 Dígitos',
        description: 'Órgãos oficiais usam números curtos de 5 dígitos, nunca celulares comuns.',
        status: 'suspicious',
        forensicFact: 'Golpistas usam disparo em massa por chips pré-pagos comuns.',
      },
    };
  }

  if (clue.id === 'clue-3-extrato') {
    return {
      id: `act-${c.id}-extrato`,
      label: '🏦 Abrir o app Meu Banco e olhar o Extrato Real da Conta',
      actionType: 'investigation',
      playerMessage: 'Consulta do Extrato em Tempo Real no App Meu Banco',
      replyMessage:
        'Extrato Meu Banco: R$ 0,00 gastos hoje. Nenhuma compra de R$ 3.890,00 no Magazine Luiza foi feita no seu cartão!',
      evidenceDiscovered: {
        id: `ev-${c.id}-extrato`,
        title: 'Extrato Bancário 100% Limpo (Compra Inexistente)',
        description: 'Não há nenhuma compra de R$ 3.890 no app oficial do banco.',
        status: 'suspicious',
        forensicFact: 'Se a compra não aparece no app oficial do seu banco, o SMS é uma isca falsa.',
      },
    };
  }

  if (clue.id === 'clue-3-central-0800') {
    return {
      id: `act-${c.id}-0800`,
      label: '📞 Ligar no 0800 729 0001 para testar o que o atendente pede',
      actionType: 'investigation',
      playerMessage: 'Teste de Chamada para o 0800 729 0001 informado no SMS',
      replyMessage:
        'Falso Atendente 0800: Exigiu que você transfira seu saldo via Pix para uma "Conta Segura do Banco Central" para cancelar a compra!',
      evidenceDiscovered: {
        id: `ev-${c.id}-0800`,
        title: 'Falso Atendente 0800 Exigindo Pix de Cancelamento',
        description: 'O golpista no 0800 pediu um Pix para supostamente estornar a compra.',
        status: 'suspicious',
        forensicFact: 'Nenhum banco pede para você fazer Pix para cancelar compras ou proteger a conta.',
      },
    };
  }

  if (clue.id === 'clue-3-google-pesquisa') {
    return {
      id: `act-${c.id}-google`,
      label: '🌐 Pesquisar "SMS compra aprovada 0800 Magalu" no Google',
      actionType: 'investigation',
      playerMessage: 'Pesquisa no Google: "SMS compra aprovada 0800 Magazine Luiza"',
      replyMessage:
        'Alerta G1 / FEBRABAN: Golpe da Falsa Central dispara SMS de compras falsas para atrair vítimas para números 0800 criminosos.',
      evidenceDiscovered: {
        id: `ev-${c.id}-google`,
        title: 'Alerta Nacional: Golpe da Falsa Central 0800',
        description: 'Notícias confirmam que o 0800 do SMS pertence a uma quadrilha.',
        status: 'suspicious',
        forensicFact: 'Nunca ligue para números 0800 recebidos por SMS.',
      },
    };
  }

  if (clue.id === 'clue-7-mecanica') {
    return {
      id: `act-${c.id}-mecanica`,
      label: '💬 Perguntar: "Por que tenho que depositar R$ 100 via Pix para liberar meu pagamento?"',
      actionType: 'investigation',
      playerMessage:
        'Por que eu preciso depositar R$ 100 do meu próprio bolso via Pix para liberar os saques das Tarefas VIP? Trabalho de verdade paga o funcionário, não cobra!',
      replyMessage:
        'Essa cota de R$ 100 é apenas uma recarga obrigatória do sistema VIP de lojistas! Assim que você fizer o Pix de R$ 100, o sistema desbloqueia R$ 500 de comissão pra você na hora!',
      evidenceDiscovered: {
        id: `ev-${c.id}-mecanica`,
        title: 'Exigência de Depósito Pix Prévio para Trabalhar',
        description: 'A suposta recrutadora exige que você pague R$ 100 via Pix para poder receber comissões.',
        status: 'suspicious',
        forensicFact: 'Nenhuma vaga de emprego legítima cobra Pix ou depósitos do trabalhador.',
      },
    };
  }

  if (clue.id === 'clue-7-canal-rh') {
    return {
      id: `act-${c.id}-rh`,
      label: '🌐 Questionar: "A Shopee oficial contrata funcionários por grupo de Telegram?"',
      actionType: 'investigation',
      playerMessage:
        'A Shopee Brasil contrata pessoas por grupos fechados do Telegram? Vou conferir no site oficial da empresa se isso existe.',
      replyMessage:
        'É uma seleção terceirizada expressa pelo Telegram! Não precisa olhar no site oficial da Shopee não, entra logo no grupo antes que sua vaga expire!',
      evidenceDiscovered: {
        id: `ev-${c.id}-rh`,
        title: 'Recrutamento Falso via Grupo de Telegram',
        description: 'Grandes empresas contratam apenas por portais oficiais, nunca por grupos de tarefas no Telegram.',
        status: 'suspicious',
        forensicFact: 'Grupos de "tarefas VIP" no Telegram são esquemas de pirâmide financeira.',
      },
    };
  }

  if (clue.id === 'clue-7-ddi') {
    return {
      id: `act-${c.id}-ddi`,
      label: '📱 Perguntar: "Por que seu WhatsApp tem código +62 (Indonésia) se você é do RH no Brasil?"',
      actionType: 'investigation',
      playerMessage:
        'Olhei seu número e ele começa com +62, que é código telefônico da Indonésia! Por que seu WhatsApp é da Indonésia se você diz ser do RH em São Paulo?',
      replyMessage:
        'É apenas um ramal virtual internacional automático da nossa central! Ignore o código +62 e clique logo no link do Telegram!',
      evidenceDiscovered: {
        id: `ev-${c.id}-ddi`,
        title: 'Número Estrangeiro da Indonésia (+62)',
        description: 'A golpista usa número virtual da Indonésia (+62) fingindo ser recrutadora no Brasil.',
        status: 'suspicious',
        forensicFact: 'Golpistas usam números virtuais estrangeiros descartáveis para aplicar o golpe das tarefas.',
      },
    };
  }

  if (clue.category === 'phone' || clue.inspection.type === 'contact') {
    return {
      id: `act-${c.id}-ddd`,
      label: '📱 Questionar DDD: "Por que você está com DDD de outro estado?"',
      actionType: 'investigation',
      playerMessage: 'Por que o seu número está com DDD diferente da nossa cidade?',
      replyMessage:
        'É porque eu comprei o chip provisório na banca perto da rodoviária e foi o único prefixo de promoção que tinha disponível! Me ajuda logo!',
      evidenceDiscovered: {
        id: `ev-${c.id}-ddd`,
        title: 'DDD Incompatível',
        description: 'O número foi ativado recentemente com DDD divergente da família.',
        status: 'suspicious',
        forensicFact: 'Golpistas compram chips descartáveis de outros DDDs para aplicar golpes.',
      },
    };
  }

  if (clue.category === 'pix' || clue.inspection.type === 'pix') {
    const titular = clue.inspection.field2Value || 'Valdir dos Santos';
    return {
      id: `act-${c.id}-pix`,
      label: `💸 Confrontar Favorecido: "Quem é ${titular}?"`,
      actionType: 'investigation',
      playerMessage: `Quem é esse ${titular} da chave Pix? A instituição não cobra por boleto ou CNPJ?`,
      replyMessage:
        'Mãe, é o coordenador financeiro! Ele disse que só segura minha vaga se pagar direto na conta dele agora, por favor faz logo!',
      evidenceDiscovered: {
        id: `ev-${c.id}-pix`,
        title: `Titular Incompatível: ${titular}`,
        description: `A conta de destino pertence a uma pessoa física estranha (${titular}).`,
        status: 'suspicious',
        forensicFact: 'Instituições de ensino e empresas cobram por CNPJ oficial ou boleto registrado.',
      },
    };
  }

  return {
    id: `act-${c.id}-clue-${clue.id}`,
    label: `🔍 Questionar: "${clue.name}"`,
    actionType: 'investigation',
    playerMessage: `Verifiquei as informações e identifiquei inconsistências em: ${clue.question}`,
    replyMessage: 'Aviso: Confirme seus dados com urgência para evitar bloqueio definitivo.',
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
  onBlockContact: _onBlockContact,
  onCallClick,
  onBackToHome,
  onOpenNotes,
  onStoryDeliveredChange,
  initialDelivered = false,
  onOpenTips,
  onOpenVerdictModal,
  onOpenPixModal: _onOpenPixModal,
  inspectedClueCount = 0,
  inspectedClueIds = [],
  onInspectClue,
  onOpenBank,
  onCopyPixKey,
  onRequestVoiceProof,
  onRequestVoiceAudio,
  directChancesLeft = 2,
  isDirectVerdictLocked = false,
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
  initialDelivered?: boolean;
  onOpenTips?: () => void;
  onOpenVerdictModal?: () => void;
  onOpenPixModal?: () => void;
  inspectedClueCount?: number;
  inspectedClueIds?: string[];
  onInspectClue?: (clue: InvestigativeClue) => void;
  onOpenBank?: () => void;
  onCopyPixKey?: (key: string) => void;
  onRequestVoiceProof?: () => void;
  onRequestVoiceAudio?: () => void;
  directChancesLeft?: number;
  isDirectVerdictLocked?: boolean;
}) => {
  const pixClue = c.clues.find(
    (k) => k.category === 'pix' || k.inspection.type === 'pix'
  );
  const [isTypingPlayer, setIsTypingPlayer] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const number = findContactNumber(c);
  const name = cleanName(c.sender);
  const unknown = /desconhecid|n[uú]mero novo/i.test(c.sender);

  // Mensagens do caso divididas por parágrafos para simular digitação suave e realista
  const messageParagraphs = c.messageContent.split(/\n\n+/).filter(Boolean);
  const [revealedCount, setRevealedCount] = useState(() =>
    initialDelivered ? messageParagraphs.length : 0
  );
  const [isSuspectTyping, setIsSuspectTyping] = useState(() => !initialDelivered);
  const [hasFinishedTyping, setHasFinishedTyping] = useState(() => initialDelivered);

  const onStoryDeliveredChangeRef = useRef(onStoryDeliveredChange);
  onStoryDeliveredChangeRef.current = onStoryDeliveredChange;

  useEffect(() => {
    if (initialDelivered) {
      setRevealedCount(messageParagraphs.length);
      setIsSuspectTyping(false);
      setHasFinishedTyping(true);
      onStoryDeliveredChangeRef.current?.(true);
      return;
    }

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
          activeTimer = setTimeout(deliverNext, 650);
        } else {
          activeTimer = setTimeout(() => {
            setHasFinishedTyping(true);
            onStoryDeliveredChangeRef.current?.(true);
          }, 450);
        }
      }, 1550);
    };

    const startTimer = setTimeout(deliverNext, 550);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(activeTimer);
    };
  }, [c.id, messageParagraphs.length, initialDelivered]);

  // Auto-scroll suave conforme balões e opções aparecem
  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 80);
    return () => clearTimeout(t);
  }, [revealedCount, hasFinishedTyping, actionHistory.length, isTypingPlayer]);

  // Toque para acelerar a leitura caso o jogador não queira esperar
  const handleFastForward = () => {
    if (!hasFinishedTyping) {
      setRevealedCount(messageParagraphs.length);
      setIsSuspectTyping(false);
      setHasFinishedTyping(true);
      onStoryDeliveredChangeRef.current?.(true);
    }
  };

  // Status de auditoria de cada um dos 3 passos do caso
  const step0 = c.clues[0];
  const step1 = c.clues[1];
  const step2 = c.clues[2];

  const isStep0Done = Boolean(step0 && inspectedClueIds.includes(step0.id));
  const isStep1Done = Boolean(step1 && inspectedClueIds.includes(step1.id));
  const isStep2Done = Boolean(step2 && inspectedClueIds.includes(step2.id));

  // Ações de confronto contextual geradas para cada evidência
  const act0 = step0 ? getClueConfrontationAction(step0, c) : null;
  const act1 = step1 ? getClueConfrontationAction(step1, c) : null;
  const act2 = step2 ? getClueConfrontationAction(step2, c) : null;

  const isAct0Done = Boolean(act0 && executedActionIds.includes(act0.id));
  const isAct1Done = Boolean(act1 && executedActionIds.includes(act1.id));
  const isAct2Done = Boolean(act2 && executedActionIds.includes(act2.id));

  // Próxima ação pendente para destaque no rodapé
  const activeAction = (!isAct0Done && act0 && (step0?.category !== 'pix' || isStep0Done))
    ? { act: act0, clue: step0 }
    : (!isAct1Done && act1 && (step1?.category !== 'pix' || isStep1Done))
    ? { act: act1, clue: step1 }
    : (!isAct2Done && act2 && (step2?.category !== 'pix' || isStep2Done))
    ? { act: act2, clue: step2 }
    : null;

  const handleActionClick = (action: InteractiveAction, targetClue?: InvestigativeClue) => {
    if (isTypingPlayer) return;
    sound.playKeyboardClick();
    setIsTypingPlayer(true);
    setTimeout(() => {
      setIsTypingPlayer(false);
      sound.playMessagePing();
      sound.playTensionPulse();
      if (targetClue && !inspectedClueIds.includes(targetClue.id)) {
        onInspectClue?.(targetClue);
      }
      onPerformAction(action);
    }, 850);
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
            {onOpenTips && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenTips();
                }}
                className="p-1 hover:bg-white/10 rounded-full cursor-pointer active:scale-90 transition-transform"
                title="Dicas do Celular (Tips)"
              >
                <Lightbulb className="w-4 h-4 text-amber-300" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onRequestVoiceProof) {
                  onRequestVoiceProof();
                } else {
                  onCallClick();
                }
              }}
              className="p-1 hover:bg-white/10 rounded-full cursor-pointer active:scale-90 transition-transform"
              title="Ligar (Exigir Prova de Voz)"
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
      <div
        ref={chatScrollRef}
        className="flex-1 wa-wallpaper overflow-y-auto no-scrollbar px-2.5 py-2.5 space-y-2"
      >
        <div className="mx-auto w-fit bg-[#ffeecd] text-[#54656f] text-[10px] px-2.5 py-1 rounded-md text-center max-w-[94%] flex items-center gap-1 shadow-sm leading-tight">
          <Lock className="w-2.5 h-2.5 flex-shrink-0" />
          Mensagens protegidas com criptografia de ponta a ponta.
        </div>

        {unknown && !isBlocked && (
          <div className="mx-auto w-full bg-white rounded-lg text-center text-[10.5px] text-[#54656f] py-1.5 px-2 shadow-sm border border-emerald-100">
            Número fora da sua lista de contatos
            <div className="flex justify-center gap-4 mt-1 font-semibold text-[#008069]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onContactClick();
                }}
                className="hover:underline cursor-pointer active:scale-95 transition-transform"
              >
                Inspecionar Perfil
              </button>
              {onRequestVoiceProof && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestVoiceProof();
                  }}
                  className="hover:underline cursor-pointer active:scale-95 transition-transform text-purple-700 font-bold flex items-center gap-1"
                >
                  <Mic className="w-3 h-3" /> Exigir Prova de Voz
                </button>
              )}
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

            {/* Botão diegético de copiar chave Pix para usar no banco */}
            {pixClue && (para.toLowerCase().includes('pix') || para.includes(pixClue.inspection.field1Value) || i === messageParagraphs.length - 1) && onCopyPixKey && (
              <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyPixKey(pixClue.inspection.field1Value);
                    onOpenBank?.();
                  }}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold border border-purple-300/60 cursor-pointer active:scale-95 transition"
                >
                  <CreditCard className="w-3 h-3" />
                  <span>Conferir CPF ({pixClue.inspection.field1Value}) no Meu Banco ➔</span>
                </button>
              </div>
            )}

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

        {/* PAINEL DE OPÇÕES DE MENSAGENS E ATITUDES DECISIVAS (SURGE SUAVEMENTE AO FINAL) */}
        {hasFinishedTyping && !stamped && !isBlocked && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 bg-white/95 backdrop-blur-md border-2 border-[#00a884]/40 rounded-2xl p-2.5 shadow-md space-y-2"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="text-[10.5px] font-extrabold text-[#008069] uppercase tracking-wide flex items-center gap-1">
                💬 Opções Decisivas neste Contexto
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {inspectedClueCount}/3 Provas
              </span>
            </div>

            <div className="space-y-1.5">
              {c.clues.slice(0, 3).map((clue) => {
                const act = getClueConfrontationAction(clue, c);
                const isClueDone = inspectedClueIds.includes(clue.id);
                const isActDone = executedActionIds.includes(act.id);
                const isPixStep = clue.category === 'pix' || clue.inspection.type === 'pix';

                if (isClueDone && isActDone) {
                  return (
                    <div
                      key={clue.id}
                      className="w-full text-left px-2.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] font-semibold flex items-center gap-2"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="flex-1 leading-snug">
                        <strong>{clue.name}:</strong> {clue.evidenceResult.headline}
                      </span>
                    </div>
                  );
                }

                if (isPixStep && !isClueDone) {
                  return (
                    <button
                      key={clue.id}
                      type="button"
                      onClick={() => {
                        onCopyPixKey?.(clue.inspection.field1Value);
                        onOpenBank?.();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-950 text-[11.5px] font-bold transition cursor-pointer active:scale-98 flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <span className="leading-snug">
                        🏦 Conferir CPF ({clue.inspection.field1Value}) no app Meu Banco antes de responder
                      </span>
                      <ChevronRight className="w-4 h-4 text-purple-600 shrink-0" />
                    </button>
                  );
                }

                return (
                  <button
                    key={clue.id}
                    type="button"
                    disabled={isTypingPlayer}
                    onClick={() => handleActionClick(act, clue)}
                    className="w-full text-left px-2.5 py-2 rounded-xl bg-[#e7fce3] hover:bg-[#d1f7cb] border border-[#00a884]/40 text-[#111b21] text-[11.5px] font-semibold transition cursor-pointer active:scale-98 flex items-center justify-between gap-2 shadow-2xs disabled:opacity-50"
                  >
                    <span className="leading-snug">{act.label}</span>
                    <Send className="w-3.5 h-3.5 text-[#008069] shrink-0" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Rodapé do WhatsApp */}
      <div className="bg-[#f0f2f5] border-t border-black/10 flex flex-col">
        {isBlocked ? (
          <div className="px-3 py-2 text-center bg-red-50">
            <span className="text-xs text-red-600 font-semibold flex items-center justify-center gap-1.5">
              <UserX className="w-3.5 h-3.5" /> Você bloqueou este contato
            </span>
          </div>
        ) : !hasFinishedTyping ? (
          <div className="px-3 py-2 text-center">
            <span className="text-[10px] text-neutral-500 font-medium italic animate-pulse">
              Recebendo mensagens... (Toque no chat para acelerar)
            </span>
          </div>
        ) : (
          <div className="p-2 flex items-center gap-2">
            {activeAction ? (
              <>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActionClick(activeAction.act, activeAction.clue);
                  }}
                  className="flex-1 bg-white rounded-full px-3 py-1.5 flex items-center gap-2 shadow-xs border border-emerald-400 cursor-pointer hover:bg-emerald-50/30 transition"
                >
                  <Smile className="w-5 h-5 text-neutral-400 shrink-0" />
                  <span className="flex-1 text-xs text-neutral-800 font-medium truncate">
                    {activeAction.act.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActionClick(activeAction.act, activeAction.clue);
                  }}
                  className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center shadow-xs shrink-0 active:scale-95 transition cursor-pointer"
                  title="Enviar mensagem"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </>
            ) : (
              <>
                <div className="flex-1 bg-white rounded-full px-3 py-2 flex items-center gap-2 shadow-xs border border-neutral-200">
                  <Smile className="w-5 h-5 text-neutral-400 shrink-0" />
                  <div className="flex-1 text-[13px] text-neutral-400 select-none truncate">
                    Todas as perguntas enviadas ✓
                  </div>
                  <Paperclip className="w-4 h-4 text-neutral-400 shrink-0" />
                  <Camera className="w-4 h-4 text-neutral-400 shrink-0" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onRequestVoiceAudio) {
                      onRequestVoiceAudio();
                    } else if (onRequestVoiceProof) {
                      onRequestVoiceProof();
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center shadow-xs shrink-0 active:scale-95 transition cursor-pointer"
                  title="Pedir Mensagem de Voz (Prova de Voz)"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        )}

        {/* Barra de Ação de Veredito com 2 Chances ou Perícia Obrigatória */}
        {onOpenVerdictModal && onOpenNotes && (
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
  initialDelivered = false,
  onOpenTips,
  onOpenVerdictModal,
  onOpenPixModal: _onOpenPixModal,
  inspectedClueCount = 0,
  inspectedClueIds = [],
  onInspectClue,
  onOpenBank,
  onCopyPixKey,
  onCallClick,
  onRequestVoiceProof,
  directChancesLeft = 2,
  isDirectVerdictLocked = false,
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
  initialDelivered?: boolean;
  onOpenTips?: () => void;
  onOpenVerdictModal?: () => void;
  onOpenPixModal?: () => void;
  inspectedClueCount?: number;
  inspectedClueIds?: string[];
  onInspectClue?: (clue: InvestigativeClue) => void;
  onOpenBank?: () => void;
  onCopyPixKey?: (key: string) => void;
  onCallClick?: () => void;
  onRequestVoiceProof?: () => void;
  directChancesLeft?: number;
  isDirectVerdictLocked?: boolean;
}) => {
  const pixClue = c.clues.find(
    (k) => k.category === 'pix' || k.inspection.type === 'pix'
  );
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const number = findContactNumber(c);
  const messageParagraphs = c.messageContent.split(/\n\n+/).filter(Boolean);
  const [revealedCount, setRevealedCount] = useState(() =>
    initialDelivered ? messageParagraphs.length : 0
  );
  const [hasFinishedTyping, setHasFinishedTyping] = useState(() => initialDelivered);

  const onStoryDeliveredChangeRef = useRef(onStoryDeliveredChange);
  onStoryDeliveredChangeRef.current = onStoryDeliveredChange;

  useEffect(() => {
    if (initialDelivered) {
      setRevealedCount(messageParagraphs.length);
      setHasFinishedTyping(true);
      onStoryDeliveredChangeRef.current?.(true);
      return;
    }

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
          activeTimer = setTimeout(deliverNext, 650);
        } else {
          activeTimer = setTimeout(() => {
            setHasFinishedTyping(true);
            onStoryDeliveredChangeRef.current?.(true);
          }, 450);
        }
      }, 1350);
    };

    const startTimer = setTimeout(deliverNext, 450);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(activeTimer);
    };
  }, [c.id, messageParagraphs.length, initialDelivered]);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 80);
    return () => clearTimeout(t);
  }, [revealedCount, hasFinishedTyping, actionHistory.length]);

  const handleFastForward = () => {
    if (!hasFinishedTyping) {
      setRevealedCount(messageParagraphs.length);
      setHasFinishedTyping(true);
      onStoryDeliveredChangeRef.current?.(true);
    }
  };

  // Status de auditoria de cada um dos 3 passos do caso
  const step0 = c.clues[0];
  const step1 = c.clues[1];
  const step2 = c.clues[2];

  const isStep0Done = Boolean(step0 && inspectedClueIds.includes(step0.id));
  const isStep1Done = Boolean(step1 && inspectedClueIds.includes(step1.id));
  const isStep2Done = Boolean(step2 && inspectedClueIds.includes(step2.id));

  // Ações de confronto contextual geradas para cada evidência
  const act0 = step0 ? getClueConfrontationAction(step0, c) : null;
  const act1 = step1 ? getClueConfrontationAction(step1, c) : null;
  const act2 = step2 ? getClueConfrontationAction(step2, c) : null;

  const isAct0Done = Boolean(act0 && executedActionIds.includes(act0.id));
  const isAct1Done = Boolean(act1 && executedActionIds.includes(act1.id));
  const isAct2Done = Boolean(act2 && executedActionIds.includes(act2.id));

  const activeAction = (!isAct0Done && act0 && !isStep0Done)
    ? { act: act0, clue: step0 }
    : (!isAct1Done && act1 && !isStep1Done)
    ? { act: act1, clue: step1 }
    : (!isAct2Done && act2 && !isStep2Done)
    ? { act: act2, clue: step2 }
    : null;

  const handleActionClick = (action: InteractiveAction, targetClue?: InvestigativeClue) => {
    sound.playBlip();
    if (targetClue && !inspectedClueIds.includes(targetClue.id)) {
      onInspectClue?.(targetClue);
    }
    if (!executedActionIds.includes(action.id)) {
      onPerformAction(action);
    }
  };

  const handleSmsDecisionOption = (clue: InvestigativeClue, act: InteractiveAction) => {
    if (clue.id === 'clue-3-extrato') {
      onOpenBank?.();
      return;
    }
    if (clue.id === 'clue-3-central-0800') {
      if (onCallClick) {
        onCallClick();
      } else {
        handleActionClick(act, clue);
      }
      return;
    }
    if (clue.id === 'clue-2-url') {
      handleActionClick(act, clue);
      onLinkClick('https://correios-taxas-alfandega.online/pagar');
      return;
    }
    if (clue.id === 'clue-3-google-pesquisa') {
      handleActionClick(act, clue);
      onLinkClick('https://pesquisa-segura.com.br');
      return;
    }
    handleActionClick(act, clue);
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

        <div className="flex items-center gap-1 text-[#007aff]">
          {(onRequestVoiceProof || onCallClick) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onRequestVoiceProof) {
                  onRequestVoiceProof();
                } else if (onCallClick) {
                  onCallClick();
                }
              }}
              className="p-1 hover:bg-neutral-100 rounded-full cursor-pointer active:scale-90 transition-transform"
              title="Ligar (Exigir Prova de Voz)"
            >
              <Phone className="w-4 h-4" />
            </button>
          )}
          {onOpenTips && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenTips();
              }}
              className="p-1 text-amber-500 hover:bg-amber-50 rounded-full cursor-pointer"
              title="Dicas de Investigação"
            >
              <Lightbulb className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto no-scrollbar px-2.5 py-2.5 space-y-2"
      >
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

            {/* Botão diegético de copiar chave Pix para usar no banco */}
            {pixClue && (para.toLowerCase().includes('pix') || para.includes(pixClue.inspection.field1Value) || i === messageParagraphs.length - 1) && onCopyPixKey && (
              <div className="mt-2 pt-1 border-t border-black/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyPixKey(pixClue.inspection.field1Value);
                    onOpenBank?.();
                  }}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white hover:bg-neutral-50 text-[#007aff] text-[11px] font-bold border border-neutral-300 cursor-pointer active:scale-95 transition"
                >
                  <Copy className="w-3 h-3" />
                  <span>Conferir Chave Pix ({pixClue.inspection.field1Value}) no Banco</span>
                </button>
              </div>
            )}
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

        {/* PAINEL DE ATITUDES DECISIVAS APÓS O SMS CHEGAR SUAVEMENTE */}
        {hasFinishedTyping && !stamped && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 bg-slate-50 border-2 border-[#007aff]/35 rounded-2xl p-2.5 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="text-[10.5px] font-extrabold text-[#007aff] uppercase tracking-wide flex items-center gap-1">
                🔍 Opções Decisivas para Verificar este SMS
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {inspectedClueCount}/3 Provas
              </span>
            </div>

            <div className="space-y-1.5">
              {c.clues.slice(0, 3).map((clue) => {
                const act = getClueConfrontationAction(clue, c);
                const isClueDone = inspectedClueIds.includes(clue.id);

                if (isClueDone) {
                  return (
                    <div
                      key={clue.id}
                      className="w-full text-left px-2.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] font-semibold flex items-center gap-2"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="flex-1 leading-snug">
                        <strong>{clue.name}:</strong> {clue.evidenceResult.headline}
                      </span>
                    </div>
                  );
                }

                return (
                  <button
                    key={clue.id}
                    type="button"
                    onClick={() => handleSmsDecisionOption(clue, act)}
                    className="w-full text-left px-2.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-[#007aff]/40 text-slate-900 text-[11.5px] font-semibold transition cursor-pointer active:scale-98 flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <span className="leading-snug">{act.label}</span>
                    <ChevronRight className="w-4 h-4 text-[#007aff] shrink-0" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Rodapé do SMS */}
      <div className="bg-[#f6f6f6] border-t border-black/10 flex flex-col">
        {!hasFinishedTyping ? (
          <div className="p-2 bg-neutral-50 text-center">
            <span className="text-[10px] text-neutral-500 font-medium italic animate-pulse">
              Recebendo SMS... (Toque para acelerar)
            </span>
          </div>
        ) : (
          <div className="p-2 flex items-center gap-2">
            {activeAction ? (
              <>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSmsDecisionOption(activeAction.clue, activeAction.act);
                  }}
                  className="flex-1 bg-white rounded-full px-3 py-1.5 flex items-center gap-2 border border-blue-400 shadow-xs cursor-pointer hover:bg-blue-50/40 transition"
                >
                  <span className="flex-1 text-xs text-neutral-800 font-medium truncate">
                    {activeAction.act.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSmsDecisionOption(activeAction.clue, activeAction.act);
                  }}
                  className="w-8 h-8 rounded-full bg-[#007aff] hover:bg-[#0062cc] text-white flex items-center justify-center shadow-xs shrink-0 active:scale-95 transition cursor-pointer"
                  title="Verificar Evidência"
                >
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-neutral-200 text-[#8e8e93] flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="flex-1 bg-white rounded-full px-3.5 py-1.5 flex items-center gap-2 border border-neutral-300 shadow-xs">
                  <div className="flex-1 text-xs text-[#8e8e93] select-none truncate">
                    Todas as verificações do SMS concluídas ✓
                  </div>
                  <Mic className="w-3.5 h-3.5 text-[#8e8e93] shrink-0" />
                </div>
              </>
            )}
          </div>
        )}

        {/* Barra de Ação de Veredito com 2 Chances ou Perícia Obrigatória */}
        {onOpenVerdictModal && onOpenNotes && (
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
  scamCountdown = 30,
  onFastForwardScam,
  onOpenMessaging,
  onOpenNotes,
  onOpenBank,
  onOpenBrowser,
  onOpenVerdictModal,
  onOpenTips,
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

  return (
    <div className="relative flex flex-col h-full bg-gradient-to-b from-[#111827] via-[#0f172a] to-[#030712] text-white select-none overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900/50 to-black pointer-events-none" />

      <StatusBar time={c.time} dark levelText={levelText} />

      {/* Banner de Notificação no Topo da HomeScreen */}
      <div className="min-h-[58px] flex items-center justify-center">
        <AnimatePresence>
          {notificationArrived && (
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
          )}
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
          {/* 1. WhatsApp */}
          <div
            onClick={onOpenMessaging}
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
              {notificationArrived && isTargetChannel('whatsapp') && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold flex items-center justify-center animate-bounce shadow">
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

          {/* 4. DOSSIÊ (Checklist de Procedimentos) */}
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
            <span className="text-[11px] text-white/90 font-medium">Dossiê</span>
          </div>

          {/* 5. DICAS DO CELULAR (Tips de Investigação) */}
          <div
            onClick={onOpenTips}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition-transform">
              <Lightbulb className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-white/90 font-medium">Dicas</span>
          </div>

          {/* 6. Google */}
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

        {/* Rodapé da Tela Inicial com Contagem Regressiva e Botão de Veredito com 2 Chances ou Perícia */}
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

          {/* Barra de Ação Unificada de Veredito */}
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
  const [activeApp, setActiveApp] = useState<'home' | 'messaging' | 'notes' | 'bank' | 'browser'>('home');
  const [previousApp, setPreviousApp] = useState<'home' | 'messaging' | 'notes'>('home');
  const [isLocked, setIsLocked] = useState(true);
  const [isScreenOff, setIsScreenOff] = useState(true);
  const [bootStage, setBootStage] = useState<'hello' | 'welcome' | 'about' | 'ready'>(() => {
    return initialBootDone ? 'ready' : 'hello';
  });
  const [notificationArrived, setNotificationArrived] = useState(false);
  const [hasOpenedScamMessage, setHasOpenedScamMessage] = useState(false);
  const [hasDeliveredStory, setHasDeliveredStory] = useState(false);
  const [scamCountdown, setScamCountdown] = useState(30);
  const [isVerdictModalOpen, setIsVerdictModalOpen] = useState(false);
  const [userHypothesisIndex, setUserHypothesisIndex] = useState<number | null>(null);
  const [vibrateKey, setVibrateKey] = useState(0);
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
    setScamCountdown(30);
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

  // Chegada orgânica da mensagem do caso (1.5s após prontidão)
  useEffect(() => {
    if (bootStage !== 'ready' || notificationArrived) return;
    const notifTimer = setTimeout(() => {
      triggerNotificationArrival();
    }, 1500);

    return () => clearTimeout(notifTimer);
  }, [bootStage, notificationArrived, triggerNotificationArrival]);

  // Temporizador de 30 segundos de suporte caso o usuário ainda não tenha aberto
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
      // SUCESSO! Prova pericial confirmada
      setUserHypothesisIndex(hypothesisIndex);
      try {
        sessionStorage.removeItem(`hacklearn_chances_${scamCase.id}`);
        sessionStorage.removeItem(`hacklearn_locked_${scamCase.id}`);
      } catch {}
      onVerdict?.(verdict);
    } else {
      // ERRO! Decrementa 1 chance
      const nextChances = Math.max(0, directChancesLeft - 1);
      setDirectChancesLeft(nextChances);
      try {
        sessionStorage.setItem(`hacklearn_chances_${scamCase.id}`, String(nextChances));
      } catch {}

      if (nextChances === 1) {
        // 1º Erro -> Modal de Recalibração Didática
        sound.playError();
        const isCircumstantial = hypothesisIndex === scamCase.circumstantialHintIndex;
        let feedbackText = '';
        if (isCircumstantial && scamCase.circumstantialHintFeedback) {
          feedbackText = scamCase.circumstantialHintFeedback;
        } else if (!isVerdictRight) {
          feedbackText = scamCase.isScam
            ? 'Atenção pericial: Esta mensagem é uma tentativa real de golpe! Dizer que é segura colocaria suas economias em risco grave.'
            : 'Atenção pericial: Esta mensagem é autêntica e legítima do próprio aplicativo instalado, sem perigo.';
        } else {
          feedbackText = 'Essa afirmação não comprova a situação e é apenas uma suposição. A prova concreta que confirma o caso deve ser investigada nos aplicativos do celular!';
        }

        setDidacticFeedback({
          open: true,
          feedback: feedbackText,
          isCircumstantial,
          chancesLeft: 1,
        });
      } else {
        // 2º Erro -> Bloqueio por Impulso! Perícia Obrigatória
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

          if (behaviorClue) {
            handleInspectClue(behaviorClue);
          }

          onPerformAction({
            id: `act-${scamCase.id}-call-attempt`,
            label: 'Ligar para o Contato (Chamada de Voz)',
            actionType: 'investigation',
            playerMessage: `[Tentativa de Chamada de Voz - Recusada pelo Contato]`,
            replyMessage: replyText,
            evidenceDiscovered: {
              id: `ev-${scamCase.id}-call-refusal`,
              title: 'Recusa Sistemática de Chamada de Voz',
              description: 'O contato rejeitou a chamada telefônica e deu desculpa para só falar por texto.',
              status: 'suspicious',
              forensicFact: 'Golpistas evitam ligações porque não possuem a voz real da vítima.',
            },
          });

          showToast('📞 Chamada recusada! Golpistas evitam atender por voz.');
        }, 1200);
      }, 2500);
    } else {
      setTimeout(() => {
        sound.playCallPickup();
        setVoiceCallOverlayState('connected');

        setTimeout(() => {
          setVoiceCallOverlayState(null);
          sound.playSuccess();

          if (behaviorClue) {
            handleInspectClue(behaviorClue);
          }

          onPerformAction({
            id: `act-${scamCase.id}-call-attempt`,
            label: 'Ligar para o Contato (Chamada de Voz)',
            actionType: 'investigation',
            playerMessage: `[Chamada Telefônica de Confirmação]`,
            replyMessage: `Alô? Olá, sou eu mesmo! Estou confirmando as informações diretamente com você.`,
            evidenceDiscovered: {
              id: `ev-${scamCase.id}-call-success`,
              title: 'Voz Autêntica Confirmada',
              description: 'O contato atendeu normalmente e confirmou sua identidade.',
              status: 'clean',
              forensicFact: 'Canais e pessoas legítimas atendem ligações ou autorizam contato oficial.',
            },
          });

          showToast('📞 Chamada atendida! Identidade confirmada por voz.');
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

    const playerMsg = 'Manda um áudio de 5 segundos falando meu nome para eu ouvir sua voz.';

    if (scamCase.isScam) {
      setTimeout(() => {
        sound.playMessagePing();
        sound.playTensionPulse();

        const isRelative = /mãe|pai|filho|filha|primo|tio|irmã|irmão/i.test(scamCase.title + scamCase.sender);
        const replyText = isRelative
          ? `Já falei que não dá pra gravar áudio agora, meu microfone tá queimado! Poxa, você não confia em mim?! Por favor me manda o Pix logo!`
          : `Sistema automático: Envio e recebimento de notas de voz desabilitados neste canal corporativo. Prossiga por texto.`;

        if (behaviorClue) {
          handleInspectClue(behaviorClue);
        }

        onPerformAction({
          id: `act-${scamCase.id}-audio-request`,
          label: 'Pedir Áudio de 5s Falando seu Nome',
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

        showToast('🎙️ Desculpa para não mandar áudio! Pista anotada.');
      }, 1000);
    } else {
      setTimeout(() => {
        sound.playMessagePing();
        sound.playSuccess();

        if (behaviorClue) {
          handleInspectClue(behaviorClue);
        }

        onPerformAction({
          id: `act-${scamCase.id}-audio-request`,
          label: 'Pedir Áudio de 5s Falando seu Nome',
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

        showToast('🎙️ Áudio de voz autêntico recebido!');
      }, 1000);
    }
  };

  const handleEndVoiceCall = () => {
    sound.playCallHangup();
    setVoiceCallOverlayState(null);
  };

  const handleHangup = () => {
    sound.playBlip();
    showToast('📴 Chamada encerrada na cara do golpista!');
  };

  const handleOpenContactModal = () => {
    sound.playBlip();
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
            onContactClick={handleOpenContactModal}
            isBlocked={isBlocked}
            onBlockContact={handleBlockContact}
            onCallClick={handleStartVoiceCall}
            onBackToHome={() => setActiveApp('home')}
            onOpenNotes={handleOpenNotes}
            onStoryDeliveredChange={(delivered) => {
              if (delivered) setHasDeliveredStory(true);
              onStoryDeliveredChange?.(delivered);
            }}
            initialDelivered={hasDeliveredStory}
            onOpenTips={() => setIsTipsModalOpen(true)}
            onOpenVerdictModal={() => setIsVerdictModalOpen(true)}
            onOpenPixModal={() => setIsPixDoubtModalOpen(true)}
            inspectedClueCount={inspectedClueIds.length}
            inspectedClueIds={inspectedClueIds}
            onInspectClue={handleInspectClue}
            onOpenBank={handleOpenBank}
            onCopyPixKey={handleCopyPixKey}
            onRequestVoiceProof={() => setIsVoiceProofModalOpen(true)}
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
            onStoryDeliveredChange={(delivered) => {
              if (delivered) setHasDeliveredStory(true);
              onStoryDeliveredChange?.(delivered);
            }}
            initialDelivered={hasDeliveredStory}
            onOpenTips={() => setIsTipsModalOpen(true)}
            onOpenVerdictModal={() => setIsVerdictModalOpen(true)}
            onOpenPixModal={() => setIsPixDoubtModalOpen(true)}
            inspectedClueCount={inspectedClueIds.length}
            inspectedClueIds={inspectedClueIds}
            onInspectClue={handleInspectClue}
            onOpenBank={handleOpenBank}
            onCopyPixKey={handleCopyPixKey}
            onCallClick={handleStartVoiceCall}
            onRequestVoiceProof={() => setIsVoiceProofModalOpen(true)}
            directChancesLeft={directChancesLeft}
            isDirectVerdictLocked={isDirectVerdictLocked}
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
                          <span><strong>Dossiê de Investigação:</strong> Consulte as pistas no Bloco de Notas e confira Banco, Google e Telefone antes de decidir.</span>
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

          {/* NOTIFICAÇÃO GLOBAL HEADS-UP (BANNER DESLIZANTE ESTILO IOS EM QUALQUER APLICATIVO) */}
          <AnimatePresence>
            {notificationArrived && activeApp !== 'messaging' && !isLocked && !stamped && (
              <motion.div
                key="global-headsup-scam"
                initial={{ y: -70, opacity: 0, scale: 0.94 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -70, opacity: 0, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                onClick={handleOpenAppDirectly}
                className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 right-2 sm:right-2.5 z-40 bg-slate-950/95 border-2 border-emerald-400/80 rounded-2xl p-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.9)] backdrop-blur-2xl cursor-pointer active:scale-98 transition group flex items-center gap-2.5 ring-1 ring-emerald-400/30"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${
                    scamCase.channel === 'whatsapp'
                      ? 'bg-[#25D366]'
                      : scamCase.channel === 'call'
                      ? 'bg-emerald-500 animate-pulse'
                      : scamCase.channel === 'push'
                      ? 'bg-[#820ad1]'
                      : 'bg-[#007aff]'
                  }`}
                >
                  {scamCase.channel === 'whatsapp' ? (
                    <MessageSquare className="w-4 h-4" />
                  ) : scamCase.channel === 'call' ? (
                    <Phone className="w-4 h-4 animate-bounce" />
                  ) : scamCase.channel === 'push' ? (
                    <CreditCard className="w-4 h-4" />
                  ) : (
                    <MessageCircle className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0 leading-tight">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{cleanName(scamCase.sender)}</span>
                    <span className="text-[9.5px] font-mono font-bold uppercase bg-emerald-500/25 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-400/30">
                      {scamCase.channel === 'call' ? 'Tocando...' : 'Agora'}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80 truncate mt-0.5">
                    {scamCase.channel === 'call'
                      ? '📞 Chamada de voz em andamento • Toque para atender'
                      : (scamCase.preview || scamCase.messageContent)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition" />
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
                  notificationArrived={notificationArrived}
                  onUnlock={handleUnlockToHome}
                  onOpenMessaging={handleOpenAppDirectly}
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
                  scamCountdown={scamCountdown}
                  onFastForwardScam={handleFastForwardScam}
                  onOpenMessaging={handleOpenAppDirectly}
                  onOpenNotes={handleOpenNotes}
                  onOpenBank={() => handleOpenBank()}
                  onOpenBrowser={() => handleOpenBrowser()}
                  onOpenVerdictModal={() => setIsVerdictModalOpen(true)}
                  onOpenTips={() => setIsTipsModalOpen(true)}
                  onToast={showToast}
                  inspectedClueCount={inspectedClueIds.length}
                  levelText={levelText}
                  directChancesLeft={directChancesLeft}
                  isDirectVerdictLocked={isDirectVerdictLocked}
                  stamped={stamped}
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
                  onBack={() => setActiveApp(previousApp === 'notes' ? 'home' : previousApp)}
                  onOpenVerdict={() => setIsVerdictModalOpen(true)}
                  onOpenTips={() => setIsTipsModalOpen(true)}
                  onOpenBank={() => handleOpenBank()}
                  onOpenBrowser={(url) => handleOpenBrowser(url)}
                  onStartVoiceCall={handleStartVoiceCall}
                  onOpenContactModal={handleOpenContactModal}
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
                  inspectedClueIds={inspectedClueIds}
                  hasOpenedScamMessage={hasOpenedScamMessage}
                  copiedPixKey={copiedPixKey}
                  onInspectClue={handleInspectClue}
                  onConfrontPixInChat={handleConfrontPixInChat}
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
                  inspectedClueIds={inspectedClueIds}
                  onInspectClue={handleInspectClue}
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
                      <p className="text-[11px] text-white/80 leading-snug italic">&quot;{SKILL_INFO[sk].guide}&quot;</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* MODAL: Perfil do Contato (Point & Click no Remetente) */}
          <AnimatePresence>
            {activeModal === 'contact' && (() => {
              const contactClue = scamCase.clues.find(
                (k) => k.category === 'phone' || k.inspection.type === 'contact'
              );
              return (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className="absolute inset-0 z-50 bg-[#111317] text-white flex flex-col p-4 overflow-y-auto"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-neutral-300">Auditoria Forense da Linha</span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-400/30 px-1.5 py-0.5 rounded-full font-mono font-bold">
                        ANATEL / Carrier
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="p-1 hover:bg-white/10 rounded-full cursor-pointer text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-start text-center space-y-3 pt-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#3a3a3c] to-[#636366] flex items-center justify-center text-2xl font-bold shadow-xl border-2 border-white/20">
                      {scamCase.sender.charAt(0)}
                    </div>

                    <div>
                      <h3 className="font-bold text-base">{cleanName(scamCase.sender)}</h3>
                      <div className="text-xs text-neutral-400 font-mono mt-0.5">
                        {number ?? 'Sem identificador de chamada'}
                      </div>
                    </div>

                    {/* DADOS DA OPERADORA / DDD SE HOUVER CLUE */}
                    {contactClue ? (
                      <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-left space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                            {contactClue.inspection.badge || 'Registro Telefônico'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                            Evidência Crítica
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-neutral-300">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400">{contactClue.inspection.field1Label}:</span>
                            <span className="font-semibold text-white font-mono">{contactClue.inspection.field1Value}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400">{contactClue.inspection.field2Label}:</span>
                            <span className="font-semibold text-amber-400 font-mono">{contactClue.inspection.field2Value}</span>
                          </div>
                          {contactClue.inspection.field3Label && (
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-400">{contactClue.inspection.field3Label}:</span>
                              <span className="font-semibold text-rose-400 font-mono">{contactClue.inspection.field3Value}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-[11px] text-amber-200/90 bg-black/40 p-2 rounded-lg border border-amber-500/20 leading-relaxed">
                          ⚠️ <strong>Alerta Pericial:</strong> {contactClue.inspection.observation}
                        </div>
                      </div>
                    ) : null}

                    {/* DADOS GERAIS */}
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

                    <div className="w-full space-y-2 pt-1 pb-2">
                      {contactClue && (
                        <button
                          type="button"
                          disabled={!hasOpenedScamMessage}
                          onClick={() => {
                            if (!hasOpenedScamMessage) return;
                            if (!inspectedClueIds.includes(contactClue.id)) {
                              handleInspectClue(contactClue);
                            }
                            setActiveModal(null);
                            setActiveApp('messaging');
                          }}
                          className={`w-full py-2.5 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition ${
                            !hasOpenedScamMessage
                              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                              : inspectedClueIds.includes(contactClue.id)
                              ? 'bg-emerald-600/80 hover:bg-emerald-600 text-white cursor-pointer active:scale-95'
                              : 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer active:scale-95'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            {!hasOpenedScamMessage
                              ? 'Aguardando leitura da mensagem suspeita...'
                              : inspectedClueIds.includes(contactClue.id)
                              ? '✓ Evidência já anotada nas Notas'
                              : 'Anotar Evidência da Linha (Conferir DDD)'}
                          </span>
                        </button>
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
              );
            })()}
          </AnimatePresence>

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
                {/* Cabeçalho do Resumo */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-1">
                    📋 RESUMO DO CASO
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
                      ? 'Você acertou! Decisão correta.'
                      : scamCase.isScam
                      ? 'Atenção: era um golpe! Você caiu nele.'
                      : 'Atenção: a mensagem era segura e verdadeira.'}
                  </div>
                </div>

                {/* Avaliação da Opção Escolhida */}
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

                {/* Como o Golpista Agiu */}
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

                {/* O Que Foi Descoberto */}
                <div className="text-[11px] text-neutral-200 leading-relaxed bg-black/40 border border-white/10 rounded-xl p-2.5">
                  <span className="text-[9px] font-mono uppercase tracking-wide text-sky-400 font-bold block mb-0.5">
                    🔎 O que foi descoberto:
                  </span>
                  {scamCase.keyEvidenceReason || scamCase.explanation}
                </div>

                {/* Regra de Ouro */}
                <div className="p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/30">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                    📌 Regra de Ouro (Para lembrar sempre)
                  </div>
                  <p className="text-[11px] font-semibold text-white leading-snug mt-0.5">
                    {scamCase.pedagogy.goldenRule}
                  </p>
                </div>

                {/* Ação de Bloqueio Liberada no Final para Casos de Golpe */}
                {scamCase.isScam && !isBlocked && (
                  <button
                    type="button"
                    onClick={handleBlockContact}
                    className="w-full py-2 bg-red-600/85 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Bloquear e Denunciar este Número aos Órgãos</span>
                  </button>
                )}
                {scamCase.isScam && isBlocked && (
                  <div className="py-2 bg-red-950/60 border border-red-500/30 text-red-300 font-bold text-xs rounded-xl text-center">
                    ✓ Número bloqueado e denunciado com sucesso!
                  </div>
                )}

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
    </motion.div>
  );
};
