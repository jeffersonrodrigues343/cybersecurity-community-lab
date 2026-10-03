import React from 'react';
import { motion } from 'motion/react';
import {
  PhoneCall,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Smartphone,
  CreditCard,
  Building,
  Package,
  Wifi,
  Coins,
  ThumbsUp,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

interface ScenarioAnimation2DProps {
  caseId?: string;
  scenarioType: 'whatsapp' | 'correios' | 'banco' | 'loja' | 'tarefas' | 'remoto' | 'oficial' | 'geral';
  isScam?: boolean;
  verdictResult?: 'correct' | 'incorrect' | null;
  onPropClick?: (propType: string) => void;
}

// COMPONENTE VETORIAL DO BONECO PALITO (Réplica 2D Fiel de images.jpeg)
interface BonecoPalito2DProps {
  pose?: 'pondering' | 'holding_phone' | 'holding_coffee' | 'inspecting';
  characterType?: 'mom' | 'senior' | 'default';
  verdictResult?: 'correct' | 'incorrect' | null;
  thoughtBubble?: string;
  dilemmaLabel?: string;
}

const BonecoPalito2D: React.FC<BonecoPalito2DProps> = ({
  pose = 'pondering',
  characterType = 'default',
  verdictResult = null,
  thoughtBubble,
  dilemmaLabel = 'Dilema do Cidadão',
}) => {
  const isHappy = verdictResult === 'correct';
  const isShocked = verdictResult === 'incorrect';

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] relative">
      {/* Balão de Pensamento Cômico */}
      {thoughtBubble && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-[11px] text-white/90 text-center font-medium shadow-md max-w-[220px] leading-tight"
        >
          <span>{thoughtBubble}</span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/60 border-r border-b border-white/10 rotate-45" />
        </motion.div>
      )}

      {/* SVG Animado do Boneco Palito */}
      <motion.div
        animate={
          isHappy
            ? { y: [0, -12, 0], scale: [1, 1.04, 1] }
            : isShocked
            ? { x: [-3, 3, -3, 3, 0] }
            : { y: [0, -3, 0] }
        }
        transition={
          isHappy
            ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
            : isShocked
            ? { repeat: Infinity, duration: 0.8 }
            : { repeat: Infinity, duration: 3.2, ease: 'easeInOut' }
        }
        className="relative w-28 sm:w-32 h-44 flex items-center justify-center select-none"
      >
        <svg
          viewBox="0 0 130 200"
          className="w-full h-full drop-shadow-md overflow-visible"
        >
          {/* 1. Sombra de Hachura Cômica no Chão (Traços de nanquim da imagem) */}
          <g stroke="#1a202c" strokeWidth="2.2" strokeLinecap="round" opacity="0.7">
            <line x1="28" y1="194" x2="42" y2="184" />
            <line x1="38" y1="194" x2="52" y2="184" />
            <line x1="48" y1="194" x2="62" y2="184" />
            <line x1="58" y1="194" x2="72" y2="184" />
            <line x1="68" y1="194" x2="82" y2="184" />
            <line x1="78" y1="194" x2="92" y2="184" />
            <line x1="88" y1="194" x2="102" y2="184" />
          </g>
          <ellipse cx="65" cy="189" rx="38" ry="5.5" fill="#000000" fillOpacity="0.25" />

          {/* 2. Pés / Sapatos */}
          {characterType === 'mom' ? (
            /* Sapatilhas femininas delicadas com lacinho de mãe */
            <g>
              <ellipse cx="50" cy="185" rx="8.5" ry="3.5" fill="#ffffff" stroke="#090b10" strokeWidth="2.8" />
              <ellipse cx="78" cy="185" rx="8.5" ry="3.5" fill="#ffffff" stroke="#090b10" strokeWidth="2.8" />
              <circle cx="50" cy="183.5" r="1.5" fill="#090b10" />
              <circle cx="78" cy="183.5" r="1.5" fill="#090b10" />
            </g>
          ) : (
            /* Pés Ovais Brancos Tradicionais */
            <g>
              <ellipse cx="50" cy="184" rx="10" ry="3.8" fill="#ffffff" stroke="#090b10" strokeWidth="3" />
              <ellipse cx="80" cy="184" rx="10" ry="3.8" fill="#ffffff" stroke="#090b10" strokeWidth="3" />
            </g>
          )}

          {/* 3. Pernas Palito */}
          {characterType === 'mom' ? (
            <g>
              <line x1="55" y1="134" x2="51" y2="183" stroke="#090b10" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="72" y1="134" x2="77" y2="183" stroke="#090b10" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <line x1="56" y1="126" x2="52" y2="182" stroke="#090b10" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 68 126 L 75 155 L 80 182" stroke="#090b10" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}

          {/* 4. Tronco / Roupa */}
          {characterType === 'mom' ? (
            /* Vestido Evasê Clássico de Mãe com Gola e Colar de Pérolas */
            <g>
              <path d="M 52 80 L 38 134 L 86 134 L 72 80 Z" fill="#ffffff" stroke="#090b10" strokeWidth="3.5" strokeLinejoin="round" />
              {/* Colar de pérolas delicado */}
              <path d="M 55 82 Q 62 90, 69 82" stroke="#090b10" strokeWidth="2" fill="none" />
              <circle cx="62" cy="88" r="2.2" fill="#ffd700" stroke="#090b10" strokeWidth="1" />
              {/* Barra do vestido pontilhada */}
              <line x1="40" y1="128" x2="84" y2="128" stroke="#090b10" strokeWidth="1.5" strokeDasharray="3 3" />
            </g>
          ) : (
            /* Tronco em Pílula Branca Reto */
            <rect x="52" y="80" width="20" height="46" rx="9" fill="#ffffff" stroke="#090b10" strokeWidth="3.5" />
          )}

          {/* 5. Braços Conforme a Pose e Personagem */}
          {isHappy ? (
            /* Comemoração: Braços erguidos em V */
            <g>
              <path d="M 52 86 L 32 64 L 24 42" stroke="#090b10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 72 86 L 92 64 L 100 42" stroke="#090b10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <ellipse cx="23" cy="41" rx="3" ry="3" fill="#090b10" />
              <ellipse cx="101" cy="41" rx="3" ry="3" fill="#090b10" />
            </g>
          ) : isShocked ? (
            /* Choque: Mãos nas bochechas */
            <g>
              <path d="M 52 88 L 36 72 L 44 56" stroke="#090b10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 72 88 L 88 72 L 80 56" stroke="#090b10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <ellipse cx="44" cy="56" rx="3" ry="3" fill="#090b10" />
              <ellipse cx="80" cy="56" rx="3" ry="3" fill="#090b10" />
            </g>
          ) : characterType === 'mom' ? (
            /* POSE DA MÃE: Mão segurando o celular do WhatsApp + mão no queixo angustiada */
            <g>
              {/* Braço segurando o smartphone da mãe */}
              <path d="M 52 86 L 36 102 L 46 94" stroke="#090b10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              {/* Smartphone da mãe com tela verde de WhatsApp */}
              <rect x="40" y="80" width="14" height="23" rx="3" fill="#25d366" stroke="#090b10" strokeWidth="2.2" />
              <rect x="42" y="83" width="10" height="15" rx="1.5" fill="#ffffff" />
              <circle cx="47" cy="99" r="1.2" fill="#090b10" />

              {/* Braço com a mão no queixo (pensativa e preocupada) */}
              <path d="M 72 86 L 88 110 L 68 68" stroke="#090b10" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 64 68 C 67 63, 71 63, 69 70" stroke="#090b10" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            </g>
          ) : pose === 'holding_phone' ? (
            /* Segurando telefone no ouvido */
            <g>
              <path d="M 52 88 L 36 108 L 48 122" stroke="#090b10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <ellipse cx="49" cy="123" rx="3.5" ry="3.5" fill="none" stroke="#090b10" strokeWidth="3" />
              <path d="M 72 88 L 90 76 L 82 50" stroke="#090b10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 80 40 C 88 42, 88 56, 80 60" stroke="#ff3b30" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            </g>
          ) : pose === 'holding_coffee' ? (
            /* Segurando xícara de café */
            <g>
              <path d="M 72 88 L 90 98 L 86 82" stroke="#090b10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <rect x="82" y="74" width="13" height="13" rx="3" fill="#ffffff" stroke="#090b10" strokeWidth="2.5" />
              <path d="M 95 78 Q 100 80 95 84" stroke="#090b10" strokeWidth="2" fill="none" />
              <path d="M 52 88 L 38 106 L 58 68" stroke="#090b10" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 60 67 C 62 63, 66 63, 64 70" stroke="#090b10" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            </g>
          ) : pose === 'inspecting' ? (
            /* Segurando lupa */
            <g>
              <path d="M 52 88 L 36 108 L 48 122" stroke="#090b10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <ellipse cx="49" cy="123" rx="3.5" ry="3.5" fill="none" stroke="#090b10" strokeWidth="3" />
              <path d="M 72 88 L 92 84 L 80 54" stroke="#090b10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <circle cx="82" cy="48" r="8" fill="none" stroke="#2997ff" strokeWidth="3" />
              <line x1="88" y1="54" x2="94" y2="60" stroke="#090b10" strokeWidth="3" />
            </g>
          ) : (
            /* POSE OFICIAL DE IMAGES.JPEG: O PENSADOR (Mão no queixo + Mão na cintura) */
            <g>
              <path d="M 52 88 L 36 108 L 48 122" stroke="#090b10" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <ellipse cx="49" cy="123" rx="3.5" ry="3.5" fill="none" stroke="#090b10" strokeWidth="3" />
              <path d="M 72 88 L 86 112 L 68 68" stroke="#090b10" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 64 68 C 67 63, 71 63, 69 70" stroke="#090b10" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            </g>
          )}

          {/* 6. Pescoço */}
          <line x1="62" y1="72" x2="62" y2="82" stroke="#090b10" strokeWidth="4" strokeLinecap="round" />

          {/* 7. Cabeça (Círculo Branco com Borda Nanquim) */}
          <circle cx="62" cy="48" r="23" fill="#ffffff" stroke="#090b10" strokeWidth="3.5" />

          {/* 8. Penteado e Acessórios de Cabeça */}
          {characterType === 'mom' ? (
            /* CABELO DE MÃE: Coque clássico no topo com grampinho + mechas suaves */
            <g>
              {/* Coque fofo no topo da cabeça */}
              <circle cx="62" cy="18" r="11" fill="#ffffff" stroke="#090b10" strokeWidth="3" />
              <path d="M 55 18 Q 62 13, 69 18" stroke="#090b10" strokeWidth="2.2" fill="none" />
              <path d="M 57 22 Q 62 17, 67 22" stroke="#090b10" strokeWidth="2" fill="none" />
              {/* Grampo de cabelo transversal decorativo */}
              <line x1="47" y1="23" x2="77" y2="12" stroke="#090b10" strokeWidth="2.8" strokeLinecap="round" />

              {/* Mechas laterais onduladas emoldurando o rosto */}
              <path d="M 40 46 C 38 29, 48 24, 62 25 C 76 24, 86 29, 84 46" stroke="#090b10" strokeWidth="3.2" fill="none" />
              <path d="M 39 46 Q 37 54, 42 58" stroke="#090b10" strokeWidth="2.5" fill="none" />
              <path d="M 85 46 Q 87 54, 82 58" stroke="#090b10" strokeWidth="2.5" fill="none" />

              {/* Brincos de pérola dourada */}
              <circle cx="38.5" cy="50" r="2.8" fill="#ffd700" stroke="#090b10" strokeWidth="1.5" />
              <circle cx="85.5" cy="50" r="2.8" fill="#ffd700" stroke="#090b10" strokeWidth="1.5" />
            </g>
          ) : (
            /* Os 3 Fios de Cabelo Originais (\ | /) de images.jpeg */
            <g>
              <path d="M 62 25 C 53 14, 46 8, 38 4" stroke="#090b10" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 62 25 C 63 14, 64 8, 66 2" stroke="#090b10" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 62 25 C 71 14, 79 8, 88 5" stroke="#090b10" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
          )}

          {/* 9. Rosto Expressivo */}
          {isHappy ? (
            /* Expressão de Alívio / Acerto */
            <g>
              <path d="M 48 36 Q 54 32, 60 36" stroke="#090b10" strokeWidth="2.8" fill="none" strokeLinecap="round" />
              <path d="M 65 36 Q 71 32, 77 36" stroke="#090b10" strokeWidth="2.8" fill="none" strokeLinecap="round" />
              <path d="M 50 48 Q 54 42, 58 48" stroke="#090b10" strokeWidth="2.8" fill="none" strokeLinecap="round" />
              <path d="M 67 48 Q 71 42, 75 48" stroke="#090b10" strokeWidth="2.8" fill="none" strokeLinecap="round" />
              <path d="M 53 56 Q 63 68, 73 56" stroke="#090b10" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            </g>
          ) : isShocked ? (
            /* Expressão de Choque / Erro com Gota de Suor */
            <g>
              <path d="M 48 36 L 58 41" stroke="#090b10" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M 77 36 L 67 41" stroke="#090b10" strokeWidth="2.8" strokeLinecap="round" />
              <circle cx="54" cy="46" r="4.2" fill="none" stroke="#090b10" strokeWidth="2.2" />
              <circle cx="54" cy="46" r="1.6" fill="#090b10" />
              <circle cx="71" cy="46" r="4.2" fill="none" stroke="#090b10" strokeWidth="2.2" />
              <circle cx="71" cy="46" r="1.6" fill="#090b10" />
              <path d="M 53 60 L 57 63 L 61 59 L 65 63 L 69 60" stroke="#090b10" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 78 32 C 75 36, 75 41, 78 42 C 81 41, 81 36, 78 32" fill="#2997ff" />
            </g>
          ) : (
            /* EXPRESSÃO IDLE: O Pensador com Dúvida */
            <g>
              <path d="M 48 39 Q 55 31, 60 38" stroke="#090b10" strokeWidth="2.8" fill="none" strokeLinecap="round" />
              <path d="M 65 40 Q 70 38, 77 42" stroke="#090b10" strokeWidth="2.8" fill="none" strokeLinecap="round" />
              <ellipse cx="54" cy="46" rx="2.4" ry="4.5" fill="#090b10" />
              <ellipse cx="71" cy="46" rx="2.4" ry="4.5" fill="#090b10" />
              <path d="M 55 60 Q 60 57, 65 62 T 71 58" stroke="#090b10" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
          )}

          {/* 10. Óculos de Leitura Especiais da Mãe */}
          {characterType === 'mom' && (
            <g>
              <ellipse cx="53" cy="46" rx="6.5" ry="5.5" fill="rgba(255,255,255,0.4)" stroke="#090b10" strokeWidth="2.2" />
              <ellipse cx="71" cy="46" rx="6.5" ry="5.5" fill="rgba(255,255,255,0.4)" stroke="#090b10" strokeWidth="2.2" />
              <line x1="59.5" y1="46" x2="64.5" y2="46" stroke="#090b10" strokeWidth="2.2" />
              <line x1="46.5" y1="46" x2="40" y2="44" stroke="#090b10" strokeWidth="1.8" />
              <line x1="77.5" y1="46" x2="84" y2="44" stroke="#090b10" strokeWidth="1.8" />
            </g>
          )}
        </svg>
      </motion.div>

      {/* Legenda do Boneco */}
      <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider mt-1">
        {dilemmaLabel}
      </span>
    </div>
  );
};

// componente pai
export const ScenarioAnimation2D: React.FC<ScenarioAnimation2DProps> = ({
  caseId = '',
  scenarioType,
  verdictResult = null,
  onPropClick,
}) => {
  const isCase1 = caseId === 'case-1-whatsapp' || (scenarioType === 'whatsapp' && !caseId.includes('6'));
  const isCase2 = caseId === 'case-2-correios' || scenarioType === 'correios';
  const isCase3 = caseId === 'case-3-compra-aprovada' || (scenarioType === 'banco' && caseId.includes('compra'));
  const isCase4 = caseId === 'case-4-falsa-central' || (scenarioType === 'banco' && !caseId.includes('compra'));
  const isCase5 = caseId === 'case-5-loja-falsa-promocao' || scenarioType === 'loja';
  const isCase6 = caseId === 'case-6-sms-seguranca-real' || scenarioType === 'oficial';
  const isCase7 = caseId === 'case-7-vaga-tarefas' || scenarioType === 'tarefas';
  const isCase8 = caseId === 'case-8-receita-ecac' || (scenarioType === 'oficial' && caseId.includes('receita'));
  const isCase9 = caseId === 'case-9-mao-fantasma-suporte' || scenarioType === 'remoto';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#0c0d11] via-[#12131a] to-[#161822] border border-white/[0.08] shadow-2xl p-4 sm:p-5 select-none transition-all">
      {/* Grade de fundo cibernética suave */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header do Cenário 2D */}
      <div className="relative z-10 flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#0071e3] animate-pulse" />
          <span className="text-[11px] font-mono tracking-wider uppercase text-white font-semibold flex items-center gap-1.5">
            
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {verdictResult === 'correct' && (
            <span className="text-[10px] font-bold text-[#30d158] bg-[#30d158]/15 px-2.5 py-0.5 rounded-full border border-[#30d158]/30 flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="w-3 h-3" /> Julgamento Correto
            </span>
          )}
          {verdictResult === 'incorrect' && (
            <span className="text-[10px] font-bold text-[#ff3b30] bg-[#ff3b30]/15 px-2.5 py-0.5 rounded-full border border-[#ff3b30]/30 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" /> Veredito Incorreto
            </span>
          )}
          
        </div>
      </div>

      {/* PALCO 2D INTERATIVO */}
      <div className="relative z-10 min-h-[190px] sm:min-h-[210px] flex items-center justify-center">

        {/* ----------------------------------------------------------------------- */}
        {/* CASO 1: CELULAR QUEBRADO DO FILHO + PEDIDO DE PIX URGENTE               */}
        {/* ----------------------------------------------------------------------- */}
        {isCase1 && (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Boneco Palito: A Mãe com aparência inconfundível de mãe */}
            <div className="md:col-span-4 flex justify-center">
              <BonecoPalito2D
                characterType="mom"
                pose="pondering"
                verdictResult={verdictResult}
                dilemmaLabel="Mãe Preocupada"
                thoughtBubble='"Ai meu Deus, é meu filho mesmo? Por que ele tá sem foto pedindo Pix urgente?"'
              />
            </div>

            {/* Elementos Periciais Centrais */}
            <div className="md:col-span-8 flex flex-col sm:flex-row items-center gap-3">
              {/* Celular com tela quebrada */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPropClick && onPropClick('celular_quebrado')}
                className="flex-1 w-full p-3.5 rounded-2xl bg-black/40 border border-white/[0.08] hover:border-[#0071e3]/50 transition text-left cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-[#ff3b30] font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Fato Alegado
                  </span>
                  <span className="text-[10px] text-[#86868b] group-hover:text-[#2997ff] flex items-center gap-1">
                    <Search className="w-3 h-3" /> Inspecionar
                  </span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#ff3b30]/10 border border-[#ff3b30]/25 flex items-center justify-center text-[#ff3b30] relative overflow-hidden flex-shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#2997ff] transition">
                      "Celular Caiu e Quebrou"
                    </h5>
                    <p className="text-[11px] text-[#86868b] line-clamp-1">
                      Justificativa para o número novo sem foto
                    </p>
                  </div>
                </div>
              </motion.button>

              {/* Pedido de Pix Urgente R$ 480 */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPropClick && onPropClick('pix_faculdade')}
                className="flex-1 w-full p-3.5 rounded-2xl bg-[#0071e3]/10 border border-[#0071e3]/25 hover:border-[#2997ff] transition text-left cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-[#2997ff] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Coins className="w-3 h-3" /> Pedido Imediato
                  </span>
                  <span className="text-[10px] text-[#ff9f0a] font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Até às 15h
                  </span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0071e3]/20 border border-[#0071e3]/40 flex items-center justify-center text-[#2997ff] flex-shrink-0 font-bold text-xs">
                    R$ 480
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#2997ff] transition">
                      Pix para Faculdade
                    </h5>
                    <p className="text-[11px] text-[#d2d2d7]">
                      Chave aleatória em nome de terceiro
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* CASO 2: PACOTE RETIDO NA ALFÂNDEGA + CANCELA ADUANEIRA                   */}
        {/* ----------------------------------------------------------------------- */}
        {isCase2 && (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Boneco Palito: Comprador em dúvida */}
            <div className="md:col-span-4 flex justify-center">
              <BonecoPalito2D
                pose="pondering"
                verdictResult={verdictResult}
                dilemmaLabel="Destinatário"
                thoughtBubble='"Encomenda retida? Mas eu paguei o frete completo..."'
              />
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pacote Retido com Cancela */}
              <div className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#ff9f0a] tracking-wider flex items-center gap-1">
                    <Building className="w-3 h-3" /> Correios / Alfândega
                  </span>
                  <span className="text-[10px] font-mono text-[#86868b]">NL8392019BR</span>
                </div>
                <div className="relative p-2.5 rounded-xl bg-black/50 border border-white/[0.08] flex items-center space-x-2.5 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-[#b08257]/20 border border-[#b08257]/40 flex items-center justify-center text-[#d4a373] flex-shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <span className="text-xs font-bold text-white block">Pacote Retido</span>
                    <span className="text-[10px] text-[#ff3b30] font-semibold">Exige taxa alfandegária</span>
                  </div>
                  <div className="absolute top-0 right-0 bottom-0 w-2 bg-[repeating-linear-gradient(45deg,#ff3b30,#ff3b30_4px,#fff_4px,#fff_8px)] opacity-90" />
                </div>
              </div>

              {/* Notificação SMS de Cobrança com Link Falso */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPropClick && onPropClick('sms_link_correios')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#ff3b30]/10 to-[#ff9f0a]/10 border border-[#ff3b30]/25 hover:border-[#ff3b30] transition text-left cursor-pointer group shadow-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#ff3b30] uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Prazo Urgente
                  </span>
                  <span className="text-[10px] text-[#2997ff] font-semibold flex items-center gap-1">
                    <Search className="w-3 h-3" /> Auditar Link
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#ff3b30] transition">
                      Taxa de R$ 27,90
                    </h5>
                    <p className="text-[11px] text-[#86868b] font-mono">
                      correios-taxas-alfandega.online
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#ffd60a] bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                    R$ 27,90
                  </span>
                </div>
              </motion.button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* CASO 3: PADARIA ESTRELA - PAGAMENTO POR APROXIMAÇÃO (CONTACTLESS REAL)   */}
        {/* ----------------------------------------------------------------------- */}
        {isCase3 && (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Boneco Palito: Segurando caneca de café */}
            <div className="md:col-span-4 flex justify-center">
              <BonecoPalito2D
                pose="holding_coffee"
                verdictResult={verdictResult}
                dilemmaLabel="Cliente na Padaria"
                thoughtBubble='"Tomei meu café e passei o cartão agora mesmo!"'
              />
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Balcão da Padaria Estrela com Maquininha */}
              <div className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06] flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-[#5c4033]/25 border border-[#5c4033]/40 flex items-center justify-center text-xl font-bold shadow-md flex-shrink-0">
                  ☕
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-white">Padaria Estrela</h5>
                    <span className="text-[10px] text-[#30d158] bg-[#30d158]/10 px-1.5 py-0.2 rounded font-semibold border border-[#30d158]/20">
                      Físico
                    </span>
                  </div>
                  <p className="text-[11px] text-[#86868b]">Compra de R$ 34,90 no débito</p>
                  <div className="flex items-center gap-1 text-[10px] text-[#30d158] font-medium pt-0.5">
                    <Wifi className="w-3 h-3 rotate-90" />
                    <span>NFC Reconhecido na Maquininha</span>
                  </div>
                </div>
              </div>

              {/* Notificação Push Oficial no Celular */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPropClick && onPropClick('notificacao_push')}
                className="w-full p-3.5 rounded-2xl bg-[#30d158]/10 border border-[#30d158]/25 hover:border-[#30d158] transition text-left cursor-pointer group shadow-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#30d158] uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> App Oficial Nubank
                  </span>
                  <span className="text-[10px] text-[#86868b]">Sem links externos</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#30d158] transition">
                      Push em Tempo Real
                    </h5>
                    <p className="text-[11px] text-[#86868b]">
                      "Compra de R$ 34,90 aprovada"
                    </p>
                  </div>
                  <span className="text-xs font-bold text-white bg-white/[0.06] px-2 py-1 rounded-xl border border-white/[0.08]">
                    Legítimo
                  </span>
                </div>
              </motion.button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* CASO 4: FALSA CENTRAL 0800 COM BINA FALSIFICADA E CONTA COFRE ILUSÓRIA */}
        {/* ----------------------------------------------------------------------- */}
        {isCase4 && (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Boneco Palito: Com fone de ouvido atendendo a chamada com receio */}
            <div className="md:col-span-4 flex justify-center">
              <BonecoPalito2D
                pose="holding_phone"
                verdictResult={verdictResult}
                dilemmaLabel="Correntista em Pânico"
                thoughtBubble='"O atendente jura que é do banco e quer que eu envie o dinheiro pra um cofre!"'
              />
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Visor do Celular com Spoofing 0800 */}
              <div className="bg-black/50 p-3.5 rounded-2xl border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-[10px] text-[#86868b]">
                  <span className="uppercase font-bold text-[#ff3b30] flex items-center gap-1 animate-pulse">
                    <PhoneCall className="w-3 h-3" /> Chamada Externa
                  </span>
                  <span className="font-mono">BINA Anatel</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-mono font-bold text-white">0800 729 0001</h4>
                    <p className="text-[10px] text-[#2997ff]">Identificador na tela</p>
                  </div>
                  <span className="text-[10px] bg-[#ff3b30]/15 text-[#ff3b30] px-2 py-0.5 rounded font-mono font-bold border border-[#ff3b30]/25">
                    Spoofing
                  </span>
                </div>
              </div>

              {/* A "Conta Cofre" Exigida na Ligação */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPropClick && onPropClick('conta_cofre_pix')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#ff3b30]/15 to-[#ff9f0a]/10 border border-[#ff3b30]/30 hover:border-[#ff3b30] transition text-left cursor-pointer group shadow-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#ff3b30] uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Exigência Imediata
                  </span>
                  <span className="text-[10px] text-[#2997ff] font-semibold flex items-center gap-1">
                    <Search className="w-3 h-3" /> Checar Titular
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#ff3b30] transition">
                      "Transfira para a Conta Cofre"
                    </h5>
                    <p className="text-[11px] text-[#d2d2d7]">
                      Proteção ilusória contra falso golpe
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#ff3b30] bg-[#ff3b30]/15 px-2 py-1 rounded-lg border border-[#ff3b30]/25">
                    Fraude
                  </span>
                </div>
              </motion.button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* CASO 5: INSTAGRAM - AIR FRYER COM 85% DE DESCONTO E CARTÃO BLOQUEADO    */}
        {/* ----------------------------------------------------------------------- */}
        {isCase5 && (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Boneco Palito: Comprador impressionado e desconfiado */}
            <div className="md:col-span-4 flex justify-center">
              <BonecoPalito2D
                pose="pondering"
                verdictResult={verdictResult}
                dilemmaLabel="Consumidor no Instagram"
                thoughtBubble='"De R$ 700 por R$ 119? E só aceita Pix porque o cartão deu erro?"'
              />
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* O Anúncio com Super Desconto */}
              <div className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06] flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-[#ff3b30]/15 border border-[#ff3b30]/30 flex flex-col items-center justify-center text-white shadow-md flex-shrink-0">
                  <span className="text-xs font-bold text-[#ff3b30] leading-none">-85%</span>
                  <span className="text-[8px] uppercase tracking-tighter text-[#86868b]">Promo</span>
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-white">Air Fryer Digital 5L</h5>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#86868b] line-through">R$ 699</span>
                    <span className="text-sm font-bold text-[#30d158]">R$ 119,90 no Pix</span>
                  </div>
                  <p className="text-[10px] text-[#ff9f0a] font-medium">Anúncio patrocinado</p>
                </div>
              </div>

              {/* Checkout Falso Bloqueando Cartão de Crédito */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPropClick && onPropClick('checkout_bloqueado')}
                className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/[0.08] hover:border-[#2997ff] transition text-left cursor-pointer group shadow-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#ff9f0a] uppercase tracking-wider flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Simulação de Compra
                  </span>
                  <span className="text-[10px] text-[#2997ff] font-semibold flex items-center gap-1">
                    <Search className="w-3 h-3" /> Ver Domínio
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#2997ff] transition">
                      Cartão Bloqueado (Erro 403)
                    </h5>
                    <p className="text-[11px] text-[#86868b]">
                      Força exclusivamente pagamento instantâneo
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#ff3b30] bg-[#ff3b30]/15 px-2 py-0.5 rounded border border-[#ff3b30]/30">
                    Apenas Pix
                  </span>
                </div>
              </motion.button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* CASO 6: AUTENTICAÇÃO REAL EM 2 FATORES (DESKTOP + SMS DE 6 DÍGITOS)     */}
        {/* ----------------------------------------------------------------------- */}
        {isCase6 && (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Boneco Palito: Usuário no computador */}
            <div className="md:col-span-4 flex justify-center">
              <BonecoPalito2D
                pose="pondering"
                verdictResult={verdictResult}
                dilemmaLabel="Usuário no PC"
                thoughtBubble='"Eu mesmo fiz o login no navegador e recebi o código SMS agora!"'
              />
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Login Desktop */}
              <div className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06] flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-[#0071e3]/20 border border-[#0071e3]/30 flex items-center justify-center text-[#2997ff] flex-shrink-0">
                  <Building className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-xs font-bold text-white">Login no bb.com.br</h5>
                    <span className="text-[9px] bg-[#30d158]/15 text-[#30d158] font-bold px-1.5 py-0.2 rounded">
                      Iniciado por Você
                    </span>
                  </div>
                  <p className="text-[11px] text-[#86868b]">Navegador seguro com HTTPS oficial</p>
                </div>
              </div>

              {/* Código 2FA Seguro */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPropClick && onPropClick('codigo_2fa_sms')}
                className="w-full p-3.5 rounded-2xl bg-[#0071e3]/10 border border-[#0071e3]/25 hover:border-[#2997ff] transition text-left cursor-pointer group shadow-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#2997ff] uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Shortcode 28588
                  </span>
                  <span className="text-[10px] text-[#30d158] font-semibold">2FA Autêntico</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#2997ff] transition">
                      Token: 839-201
                    </h5>
                    <p className="text-[11px] text-[#86868b]">
                      "O Banco NUNCA liga pedindo este código"
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#30d158] bg-[#30d158]/15 px-2 py-1 rounded-lg border border-[#30d158]/25">
                    Seguro
                  </span>
                </div>
              </motion.button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* CASO 7: GOLPE DAS TAREFAS - PIRÂMIDE DE CURTIDAS COM DEPÓSITOS VIP     */}
        {/* ----------------------------------------------------------------------- */}
        {isCase7 && (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Boneco Palito: Trabalhador iludido */}
            <div className="md:col-span-4 flex justify-center">
              <BonecoPalito2D
                pose="pondering"
                verdictResult={verdictResult}
                dilemmaLabel="Candidato a Vaga"
                thoughtBubble='"Ganhar R$ 500 por dia só curtindo vídeo? Mas por que tenho que pagar R$ 100?"'
              />
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Promessa de Renda Fácil */}
              <div className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06] flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-[#ff0000]/15 border border-[#ff0000]/30 flex items-center justify-center text-[#ff0000] flex-shrink-0">
                  <ThumbsUp className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-xs font-bold text-white">Tarefas no Telegram</h5>
                    <span className="text-[9px] bg-[#ff3b30]/15 text-[#ff3b30] font-bold px-1.5 py-0.2 rounded">
                      Isca Fácil
                    </span>
                  </div>
                  <p className="text-[11px] text-[#30d158] font-bold">Promessa: R$ 350 a R$ 500 / dia</p>
                  <p className="text-[10px] text-[#86868b]">Sem contrato de trabalho formal</p>
                </div>
              </div>

              {/* Depósito VIP para Liberar Saques */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPropClick && onPropClick('tarefa_deposito_vip')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#ff9f0a]/15 to-[#ff3b30]/10 border border-[#ff9f0a]/30 hover:border-[#ff9f0a] transition text-left cursor-pointer group shadow-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#ff9f0a] uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Armadilha de Pirâmide
                  </span>
                  <span className="text-[10px] text-[#2997ff] font-semibold flex items-center gap-1">
                    <Search className="w-3 h-3" /> Analisar RH
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#ff9f0a] transition">
                      "Pague R$ 100 para Liberar Saques"
                    </h5>
                    <p className="text-[11px] text-[#86868b]">
                      Trabalhador é obrigado a depositar para receber
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#ff3b30] bg-[#ff3b30]/15 px-2 py-0.5 rounded border border-[#ff3b30]/30">
                    Golpe
                  </span>
                </div>
              </motion.button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* CASO 8: RECEITA FEDERAL / GOV.BR - CAIXA POSTAL OFICIAL COM PRAZO LEGAL */}
        {/* ----------------------------------------------------------------------- */}
        {isCase8 && (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Boneco Palito: Com lupa analisando o documento */}
            <div className="md:col-span-4 flex justify-center">
              <BonecoPalito2D
                pose="inspecting"
                verdictResult={verdictResult}
                dilemmaLabel="Contribuinte"
                thoughtBubble='"Notificação dentro da minha conta Gov.br oficial com 30 dias de prazo legal..."'
              />
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Selo Ouro Gov.br */}
              <div className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06] flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-[#ffd700]/15 border border-[#ffd700]/30 flex items-center justify-center text-[#ffd700] flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-xs font-bold text-white">Portal e-CAC Gov.br</h5>
                    <span className="text-[9px] bg-[#ffd700]/20 text-[#ffd700] font-bold px-1.5 py-0.2 rounded border border-[#ffd700]/30">
                      Selo Ouro
                    </span>
                  </div>
                  <p className="text-[11px] text-[#86868b]">cav.receita.fazenda.gov.br</p>
                  <p className="text-[10px] text-[#30d158] font-medium">Caixa Postal interna autenticada</p>
                </div>
              </div>

              {/* Notificação Legal Sem Pedido de Pix */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPropClick && onPropClick('malha_fina_ecac')}
                className="w-full p-3.5 rounded-2xl bg-[#30d158]/10 border border-[#30d158]/25 hover:border-[#30d158] transition text-left cursor-pointer group shadow-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#30d158] uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Prazo Legal de 30 Dias
                  </span>
                  <span className="text-[10px] text-[#2997ff] font-semibold">Oficial</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#30d158] transition">
                      Auditoria de Despesa Médica
                    </h5>
                    <p className="text-[11px] text-[#86868b]">
                      Apenas envio de comprovantes fiscais no sistema
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#30d158] bg-[#30d158]/15 px-2 py-0.5 rounded border border-[#30d158]/25">
                    Legítimo
                  </span>
                </div>
              </motion.button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* CASO 9: GOLPE DA MÃO FANTASMA - SUPORTE PEDINDO ACESSO REMOTO           */}
        {/* ----------------------------------------------------------------------- */}
        {isCase9 && (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Boneco Palito: Em alerta/aflição */}
            <div className="md:col-span-4 flex justify-center">
              <BonecoPalito2D
                pose="pondering"
                verdictResult={verdictResult}
                dilemmaLabel="Vítima sob Pressão"
                thoughtBubble='"O atendente quer que eu instale um app de controle remoto no meu celular!"'
              />
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pressão de Falso Vírus */}
              <div className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06] flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-[#ff3b30]/15 border border-[#ff3b30]/30 flex items-center justify-center text-[#ff3b30] flex-shrink-0 animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-xs font-bold text-white">Falso Engenheiro do Banco</h5>
                    <span className="text-[9px] bg-[#ff3b30]/20 text-[#ff3b30] font-bold px-1.5 py-0.2 rounded">
                      Terror
                    </span>
                  </div>
                  <p className="text-[11px] text-[#ff3b30] font-medium">"Seu aparelho foi invadido por vírus!"</p>
                  <p className="text-[10px] text-[#86868b]">Pressão psicológica para não desligar</p>
                </div>
              </div>

              {/* Pedido de AnyDesk / Acesso Remoto */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPropClick && onPropClick('app_anydesk_suporte')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#ff3b30]/15 to-[#bf5af2]/10 border border-[#ff3b30]/30 hover:border-[#ff3b30] transition text-left cursor-pointer group shadow-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#ff3b30] uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Golpe da Mão Fantasma
                  </span>
                  <span className="text-[10px] text-[#2997ff] font-semibold flex items-center gap-1">
                    <Search className="w-3 h-3" /> Consultar Alerta
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#ff3b30] transition">
                      "Instale o AnyDesk / RustDesk"
                    </h5>
                    <p className="text-[11px] text-[#86868b]">
                      Entrega o controle e as senhas do aparelho
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#ff3b30] bg-[#ff3b30]/15 px-2 py-0.5 rounded border border-[#ff3b30]/30">
                    Crítico
                  </span>
                </div>
              </motion.button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
