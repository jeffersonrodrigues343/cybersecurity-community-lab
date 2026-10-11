import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ShieldAlert, ShieldCheck, Sparkles, Paperclip } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="paper rounded-lg max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border-2 border-ink/20"
        >
          <Paperclip className="absolute -top-4 left-8 w-8 h-8 text-clip rotate-[-20deg]" aria-hidden />

          <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-1.5 border-b-2 border-dashed border-ink/15 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-ink/10 text-xs font-mono text-ink-soft uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-marker" />
                  <span>Manual do Investigador</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-ink tracking-tight">
                  Como Funciona o Jogo
                </h2>
                <p className="text-xs sm:text-sm text-ink-soft max-w-md mx-auto">
                  Você vai analisar mensagens reais que circulam no Brasil. Seu trabalho é simples:
                </p>
              </div>

              {/* 3 Passos */}
              <div className="grid grid-cols-1 gap-3">
                {/* Passo 1 */}
                <div className="p-3.5 rounded-md bg-white/70 border border-ink/15 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded bg-ink/10 flex items-center justify-center shrink-0 font-mono text-xs font-bold text-ink">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-display font-bold text-ink">
                      Leia o Celular com Calma
                    </h4>
                    <p className="text-xs text-ink-soft leading-relaxed">
                      Veja a mensagem que chegou no WhatsApp, SMS, Ligação ou Notificação.
                    </p>
                  </div>
                </div>

                {/* Passo 2 */}
                <div className="p-3.5 rounded-md bg-white/70 border border-ink/15 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded bg-ink/10 flex items-center justify-center shrink-0 font-mono text-xs font-bold text-ink">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-display font-bold text-ink">
                      Inspecione as Pistas Técnicas
                    </h4>
                    <p className="text-xs text-ink-soft leading-relaxed">
                      Clique nas pistas da prancheta para conferir titular da chave Pix, dados de quem registrou o link e operadora (+10 XP).
                    </p>
                  </div>
                </div>

                {/* Passo 3 */}
                <div className="p-3.5 rounded-md bg-white/70 border border-ink/15 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded bg-ink/10 flex items-center justify-center shrink-0 font-mono text-xs font-bold text-ink">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-display font-bold text-ink">
                      Carimbe o seu Veredito
                    </h4>
                    <p className="text-xs text-ink-soft leading-relaxed flex flex-wrap items-center gap-1.5 pt-0.5">
                      Bata o carimbo entre
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-scam/15 text-scam font-bold font-mono text-[11px] border border-scam/30">
                        <ShieldAlert className="w-3 h-3" /> É GOLPE
                      </span>
                      ou
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-safe/15 text-safe font-bold font-mono text-[11px] border border-safe/30">
                        <ShieldCheck className="w-3 h-3" /> É SEGURO
                      </span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botão de Iniciar */}
              <div className="pt-2">
                <button
                  onClick={handleStart}
                  className="w-full py-4 rounded-md bg-marker text-ink font-display font-extrabold text-base flex items-center justify-center gap-2 stamp-btn cursor-pointer shadow-lg"
                >
                  <span>Abrir Meu Primeiro Caso</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
