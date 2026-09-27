import React from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
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

export const ScenarioAnimation2D: React.FC<ScenarioAnimation2DProps> = ({
  caseId = '',
  scenarioType,
  verdictResult = null,
  onPropClick,
}) => {
  // Identificação do contexto específico do enunciado
  const isCase1 = caseId === 'case-1-whatsapp' || (scenarioType === 'whatsapp' && !caseId.includes('6'));
  const isCase2 = caseId === 'case-2-correios' || scenarioType === 'correios';
  const isCase3 = caseId === 'case-3-compra-aprovada';
  const isCase4 = caseId === 'case-4-falsa-central';
  const isCase5 = caseId === 'case-5-loja-falsa-promocao' || scenarioType === 'loja';
  const isCase6 = caseId === 'case-6-sms-seguranca-real';
  const isCase7 = caseId === 'case-7-vaga-tarefas' || scenarioType === 'tarefas';
  const isCase8 = caseId === 'case-8-receita-ecac' || scenarioType === 'oficial';
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
            <span>Encenação 2D do Enunciado</span>
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
          <span className="text-[10px] text-[#86868b] bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
            Toque nos elementos para inspecionar
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PALCO 2D INTERATIVO (ENCENAÇÃO NARRATIVA BASEADA NO ENUNCIADO)            */}
      {/* ========================================================================= */}
      <div className="relative z-10 min-h-[190px] sm:min-h-[210px] flex items-center justify-center">

        {/* ----------------------------------------------------------------------- */}
        {/* CASO 1: CELULAR QUEBRADO DA FILHA + PEDIDO DE PIX URGENTE               */}
        {/* ----------------------------------------------------------------------- */}
        {isCase1 && (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Boneco 1: A Mãe apreensiva recebendo a mensagem */}
            <div className="md:col-span-5 flex items-center space-x-3 bg-white/[0.02] p-3 rounded-2xl border border-white/[0.06]">
              {/* Avatar da Mãe / Responsável */}
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8a3b5c] to-[#4a154b] p-0.5 shadow-lg flex-shrink-0"
              >
                <div className="w-full h-full rounded-2xl bg-[#14151b] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-[#e8cfb8] mb-1" />
                  <div className="w-9 h-6 rounded-t-full bg-[#8a3b5c]" />
                  <motion.div
                    animate={{ scaleY: [1, 0.1, 1] }}
                    transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 0.1] }}
                    className="absolute top-4 w-3.5 h-1 bg-[#14151b] rounded-full"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#25d366] flex items-center justify-center shadow-md">
                  <Smartphone className="w-3 h-3 text-white" />
                </span>
              </motion.div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#86868b] tracking-wider block">
                  Receptor do Dilema
                </span>
                <p className="text-xs font-semibold text-white leading-tight">
                  Mãe / Parente em Casa
                </p>
                <p className="text-[11px] text-[#25d366] flex items-center gap-1 font-medium">
                  <MessageSquare className="w-3 h-3" /> Mensagem recebida no WhatsApp
                </p>
              </div>
            </div>

            {/* Centro: Chat com Urgência e Situação do Enunciado */}
            <div className="md:col-span-7 flex flex-col sm:flex-row items-center gap-3">
              {/* Celular caído no chão com a tela quebrada alegada no enunciado */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onPropClick && onPropClick('celular_quebrado')}
                className="flex-1 w-full p-3 rounded-2xl bg-black/40 border border-white/[0.08] hover:border-[#0071e3]/50 transition text-left cursor-pointer group shadow-lg"
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
                  {/* Ícone de Celular com Trinca */}
                  <div className="w-10 h-10 rounded-xl bg-[#ff3b30]/10 border border-[#ff3b30]/25 flex items-center justify-center text-[#ff3b30] relative overflow-hidden flex-shrink-0">
                    <Smartphone className="w-5 h-5" />
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ff3b3040_0,transparent_70%)]"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#2997ff] transition">
                      "Celular Caiu e Quebrou"
                    </h5>
                    <p className="text-[11px] text-[#86868b] line-clamp-1">
                      Justificativa para o número desconhecido
                    </p>
                  </div>
                </div>
              </motion.button>

              {/* Pedido de Pix Urgente de R$ 480 para Faculdade */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onPropClick && onPropClick('pix_faculdade')}
                className="flex-1 w-full p-3 rounded-2xl bg-[#0071e3]/10 border border-[#0071e3]/25 hover:border-[#2997ff] transition text-left cursor-pointer group shadow-lg"
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
                      Chave informada no chat
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* CASO 2: PACOTE RETIDO NA ALFÂNDEGA + CANCELA ADUANEIRA FECHADA          */}
        {/* ----------------------------------------------------------------------- */}
        {isCase2 && (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Esteira de Fiscalização Aduaneira */}
            <div className="md:col-span-6 bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#ff9f0a] tracking-wider flex items-center gap-1.5">
                  <Building className="w-3 h-3" /> Fiscalização Aduaneira / Correios
                </span>
                <span className="text-[10px] font-mono text-[#86868b]">Objeto: NL8392019BR</span>
              </div>

              {/* Pacote com Cancela / Barreira Aduaneira */}
              <div className="relative p-3 rounded-xl bg-black/50 border border-white/[0.08] flex items-center space-x-3 overflow-hidden">
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-12 h-12 rounded-xl bg-[#b08257]/20 border border-[#b08257]/40 flex items-center justify-center text-[#d4a373] flex-shrink-0"
                >
                  <Package className="w-6 h-6" />
                </motion.div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Encomenda Internacional</span>
                    <span className="text-[10px] bg-[#ff3b30]/20 text-[#ff3b30] font-bold px-1.5 py-0.2 rounded border border-[#ff3b30]/30">
                      RETIDO
                    </span>
                  </div>
                  <p className="text-[11px] text-[#86868b]">Aguardando quitação de taxa de importação</p>
                </div>

                {/* Cancela de Bloqueio Listrada */}
                <div className="absolute top-0 right-0 bottom-0 w-2.5 bg-[repeating-linear-gradient(45deg,#ff9f0a,#ff9f0a_6px,#000_6px,#000_12px)] opacity-80" />
              </div>
            </div>

            {/* Notificação SMS de Cobrança Urgente */}
            <div className="md:col-span-6 space-y-2.5">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPropClick && onPropClick('sms_link_correios')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#ff3b30]/10 to-[#ff9f0a]/10 border border-[#ff3b30]/25 hover:border-[#ff3b30] transition text-left cursor-pointer group shadow-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#ff3b30] uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Prazo: Pague Hoje ou Devolução
                  </span>
                  <span className="text-[10px] text-[#2997ff] font-semibold flex items-center gap-1">
                    <Search className="w-3 h-3" /> Auditar Link
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#ff3b30] transition">
                      Taxa de R$ 27,90 Solicitada
                    </h5>
                    <p className="text-[11px] text-[#86868b] font-mono">
                      Link: correios-taxas-alfandega.online
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
            {/* O Balcão da Padaria Estrela com Café e Maquininha */}
            <div className="md:col-span-6 bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06] flex items-center space-x-3.5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[#5c4033]/25 border border-[#5c4033]/40 flex items-center justify-center text-[#d4a373] text-xl font-bold shadow-md">
                  ☕
                </div>
                <motion.div
                  animate={{ y: [-2, -8, -2], opacity: [0.2, 0.7, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] text-white/60 pointer-events-none"
                >
                  ♨️
                </motion.div>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-white">Padaria Estrela</h5>
                  <span className="text-[10px] text-[#30d158] bg-[#30d158]/10 px-1.5 py-0.2 rounded font-semibold border border-[#30d158]/20">
                    Débito Físico
                  </span>
                </div>
                <p className="text-[11px] text-[#86868b]">Compra de R$ 34,90 realizada há 1 minuto</p>
                <div className="flex items-center gap-1.5 text-[10px] text-[#30d158] font-medium pt-0.5">
                  <Wifi className="w-3 h-3 rotate-90" />
                  <span>Aproximação Contactless Reconhecida</span>
                </div>
              </div>
            </div>

            {/* Notificação Push Oficial no Celular */}
            <div className="md:col-span-6">
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
                      Alerta Transparente em Tempo Real
                    </h5>
                    <p className="text-[11px] text-[#86868b]">
                      "Compra de R$ 34,90 em Padaria Estrela"
                    </p>
                  </div>
                  <span className="text-xs font-bold text-white bg-white/[0.06] px-2.5 py-1 rounded-xl border border-white/[0.08]">
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
            {/* Visor do Celular com Spoofing 0800 */}
            <div className="md:col-span-6 bg-black/50 p-3.5 rounded-2xl border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-[10px] text-[#86868b]">
                <span className="uppercase font-bold text-[#ff3b30] flex items-center gap-1 animate-pulse">
                  <PhoneCall className="w-3 h-3" /> Chamada Externa Ativa
                </span>
                <span className="font-mono">Visor do Aparelho</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-mono font-bold text-white tracking-wide">
                    0800 729 0001
                  </h4>
                  <p className="text-[10px] text-[#2997ff]">Identificação do Banco no Celular</p>
                </div>
                <span className="text-[10px] bg-[#ff3b30]/15 text-[#ff3b30] px-2 py-0.5 rounded font-mono font-bold border border-[#ff3b30]/25">
                  BINA Mascarada
                </span>
              </div>
            </div>

            {/* A "Conta Cofre" Exigida na Ligação */}
            <div className="md:col-span-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPropClick && onPropClick('conta_cofre_pix')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#ff3b30]/15 to-[#ff9f0a]/10 border border-[#ff3b30]/30 hover:border-[#ff3b30] transition text-left cursor-pointer group shadow-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#ff3b30] uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Exigência do Atendente
                  </span>
                  <span className="text-[10px] text-[#2997ff] font-semibold flex items-center gap-1">
                    <Search className="w-3 h-3" /> Checar Titular
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#ff3b30] transition">
                      "Transfira para a Conta Cofre Provisória"
                    </h5>
                    <p className="text-[11px] text-[#d2d2d7]">
                      Suposta proteção contra golpe de R$ 2.800
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
            {/* O Anúncio com Super Desconto */}
            <div className="md:col-span-6 bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06] flex items-center space-x-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#ff3b30]/15 border border-[#ff3b30]/30 flex flex-col items-center justify-center text-white shadow-md flex-shrink-0">
                <span className="text-[11px] font-bold text-[#ff3b30] leading-none">-85%</span>
                <span className="text-[9px] uppercase tracking-tighter text-[#86868b]">Promo</span>
              </div>
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-white">Air Fryer Digital 5 Litros</h5>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#86868b] line-through">R$ 699,00</span>
                  <span className="text-sm font-bold text-[#30d158]">R$ 119,90 no Pix</span>
                </div>
                <p className="text-[10px] text-[#ff9f0a] font-medium">Anúncio patrocinado no Instagram</p>
              </div>
            </div>

            {/* Checkout Falso com Cartão Bloqueado forçando Pix */}
            <div className="md:col-span-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPropClick && onPropClick('checkout_bloqueado')}
                className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/[0.08] hover:border-[#2997ff] transition text-left cursor-pointer group shadow-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#ff9f0a] uppercase tracking-wider flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Simulação de Carrinho
                  </span>
                  <span className="text-[10px] text-[#2997ff] font-semibold flex items-center gap-1">
                    <Search className="w-3 h-3" /> Ver Domínio
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#2997ff] transition">
                      Cartão de Crédito com Erro 403
                    </h5>
                    <p className="text-[11px] text-[#86868b]">
                      Site força exclusivamente pagamento por Pix
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
            {/* Login no Computador Desktop */}
            <div className="md:col-span-6 bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06] flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#0071e3]/20 border border-[#0071e3]/30 flex items-center justify-center text-[#2997ff] flex-shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h5 className="text-xs font-bold text-white">Login Voluntário no bb.com.br</h5>
                  <span className="text-[9px] bg-[#30d158]/15 text-[#30d158] font-bold px-1.5 py-0.2 rounded">
                    Solicitado por você
                  </span>
                </div>
                <p className="text-[11px] text-[#86868b]">Acesso iniciado no navegador há 3 segundos</p>
              </div>
            </div>

            {/* Código de Segurança 2FA Recebido via Shortcode */}
            <div className="md:col-span-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPropClick && onPropClick('codigo_2fa_sms')}
                className="w-full p-3.5 rounded-2xl bg-[#0071e3]/10 border border-[#0071e3]/25 hover:border-[#2997ff] transition text-left cursor-pointer group shadow-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#2997ff] uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Shortcode 28588 (Oficial)
                  </span>
                  <span className="text-[10px] text-[#30d158] font-semibold">2 Fatores Legítimo</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#2997ff] transition">
                      Código de Autorização: 839-201
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
        {/* CASO 7: GOLPE DAS TAREFAS - CURTIR VÍDEOS COM PIRÂMIDE DE DEPÓSITOS    */}
        {/* ----------------------------------------------------------------------- */}
        {isCase7 && (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* A Isca: R$ 350 a R$ 500 por dia para curtir vídeos */}
            <div className="md:col-span-6 bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06] flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#ff0000]/15 border border-[#ff0000]/30 flex items-center justify-center text-[#ff0000] flex-shrink-0">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h5 className="text-xs font-bold text-white">Trabalho de Curtir Vídeos</h5>
                  <span className="text-[9px] bg-[#ff3b30]/15 text-[#ff3b30] font-bold px-1.5 py-0.2 rounded">
                    Telegram
                  </span>
                </div>
                <p className="text-[11px] text-[#30d158] font-bold">Promessa: R$ 350 a R$ 500 / dia</p>
                <p className="text-[10px] text-[#86868b]">Sem nenhuma qualificação ou contrato</p>
              </div>
            </div>

            {/* A Armadilha: Depósito Prévio de R$ 100 para "Tarefas VIP" */}
            <div className="md:col-span-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPropClick && onPropClick('tarefa_deposito_vip')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#ff9f0a]/15 to-[#ff3b30]/10 border border-[#ff9f0a]/30 hover:border-[#ff9f0a] transition text-left cursor-pointer group shadow-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#ff9f0a] uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Mecânica de Pirâmide
                  </span>
                  <span className="text-[10px] text-[#2997ff] font-semibold flex items-center gap-1">
                    <Search className="w-3 h-3" /> Analisar RH
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#ff9f0a] transition">
                      "Pague R$ 100 no Pix para Liberar Saques"
                    </h5>
                    <p className="text-[11px] text-[#86868b]">
                      Trabalhador é quem tem que pagar para trabalhar
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
            {/* Totem Institucional Gov.br Ouro */}
            <div className="md:col-span-6 bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06] flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#ffd700]/15 border border-[#ffd700]/30 flex items-center justify-center text-[#ffd700] flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h5 className="text-xs font-bold text-white">Portal e-CAC / Gov.br</h5>
                  <span className="text-[9px] bg-[#ffd700]/20 text-[#ffd700] font-bold px-1.5 py-0.2 rounded border border-[#ffd700]/30">
                    Selo Ouro
                  </span>
                </div>
                <p className="text-[11px] text-[#86868b]">Acessado via cav.receita.fazenda.gov.br</p>
                <p className="text-[10px] text-[#30d158] font-medium">Caixa Postal interna autenticada</p>
              </div>
            </div>

            {/* Notificação Legal sem Pedido de Pix */}
            <div className="md:col-span-6">
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
                      Auditoria de Despesa Médica (R$ 4.200)
                    </h5>
                    <p className="text-[11px] text-[#86868b]">
                      Sem cobrança de Pix: apenas envio de recibos no portal
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
            {/* O Terror Psicológico do Vírus Alegado */}
            <div className="md:col-span-6 bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06] flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#ff3b30]/15 border border-[#ff3b30]/30 flex items-center justify-center text-[#ff3b30] flex-shrink-0 animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h5 className="text-xs font-bold text-white">Ligação do "Engenheiro do Banco"</h5>
                  <span className="text-[9px] bg-[#ff3b30]/20 text-[#ff3b30] font-bold px-1.5 py-0.2 rounded">
                    Ameaça
                  </span>
                </div>
                <p className="text-[11px] text-[#ff3b30] font-medium">"Seu celular está infectado por vírus!"</p>
                <p className="text-[10px] text-[#86868b]">Pressão psicológica para não desligar a chamada</p>
              </div>
            </div>

            {/* A Mão Fantasma: Pedido para Baixar AnyDesk / TeamViewer */}
            <div className="md:col-span-6">
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
                    <Search className="w-3 h-3" /> Consultar Febraban
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-[#ff3b30] transition">
                      "Baixe o AnyDesk para Eu Limpar o Vírus"
                    </h5>
                    <p className="text-[11px] text-[#86868b]">
                      Entrega o controle remoto total do celular ao criminoso
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
