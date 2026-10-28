import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Sparkles, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstVisit?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const handleStart = () => {
    sound.playSuccess();
    try {
      localStorage.setItem('hacklearn_onboarding_seen', 'true');
    } catch {
      // ignore
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="paper rounded-2xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col p-4 sm:p-6 shadow-2xl relative border-2 border-ink/20 my-auto overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-dashed border-ink/15 pb-2.5 sm:pb-3 shrink-0">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-ink/10 text-[10.5px] font-mono text-ink-soft uppercase tracking-wider font-semibold">
                <Sparkles className="w-3 h-3 text-marker" />
                <span>Manual do Investigador</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-ink tracking-tight mt-0.5">
                Como Funciona o Jogo
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-ink/10 hover:bg-ink/20 flex items-center justify-center text-ink font-bold transition cursor-pointer active:scale-95 shrink-0"
              title="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Corpo Rolável dos 3 Passos */}
          <div className="flex-1 overflow-y-auto overscroll-contain space-y-2.5 py-3 pr-1 text-xs">
            <p className="text-[11.5px] sm:text-xs text-ink-soft pb-0.5">
              Você vai encarar as 4 fases com os golpes de WhatsApp mais comuns no Brasil. É assim que funciona:
            </p>

            {/* Passo 1 */}
            <div className="p-3 rounded-xl bg-white/75 border border-ink/15 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-ink/10 flex items-center justify-center shrink-0 font-mono text-xs font-bold text-ink">
                1
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-display font-bold text-ink">
                  Analise o Celular com Calma
                </h4>
                <p className="text-[11.5px] sm:text-xs text-ink-soft leading-relaxed">
                  Receba mensagens no WhatsApp ou SMS e atenda chamadas telefônicas sem cair na armadilha da pressa.
                </p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="p-3 rounded-xl bg-white/75 border border-ink/15 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-400/25 flex items-center justify-center shrink-0 font-mono text-xs font-bold text-amber-900">
                2
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-display font-bold text-ink">
                  Investigue antes de decidir 📋
                </h4>
                <p className="text-[11.5px] sm:text-xs text-ink-soft leading-relaxed">
                  Abra o aplicativo <strong>Meu Banco</strong> para conferir o extrato e as chaves Pix, use o <strong>Google</strong> para checar links e peça um áudio ou ligue para confirmar.
                </p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="p-3 rounded-xl bg-white/75 border border-ink/15 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-ink/10 flex items-center justify-center shrink-0 font-mono text-xs font-bold text-ink">
                3
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-display font-bold text-ink">
                  Decida e mostre a pista
                </h4>
                <p className="text-[11.5px] sm:text-xs text-ink-soft leading-relaxed flex flex-wrap items-center gap-1.5 pt-0.5">
                  Você pode decidir quando quiser, mas precisa dizer qual pista te convenceu. Se errar, o jogo te ajuda a conferir as pistas antes de tentar de novo.
                </p>
              </div>
            </div>
          </div>

          {/* Botão Inferior Fixo e Acessível */}
          <div className="pt-2 border-t border-ink/10 shrink-0">
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-3.5 sm:py-4 rounded-xl bg-marker hover:bg-[#ffc91f] text-ink font-display font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 stamp-btn cursor-pointer shadow-lg active:scale-98 transition"
            >
              <span>Abrir Meu Primeiro Caso</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
