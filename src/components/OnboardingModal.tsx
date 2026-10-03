import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, Sparkles, FileText, ShieldAlert, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstVisit?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);

  // Simula o breve bloco de carregamento fluido estilo Apple (600ms)
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#161617] border border-white/[0.12] rounded-[32px] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          {loading ? (
            /* Bloco de Carregamento Fluido Apple */
            <div className="py-16 flex flex-col items-center justify-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-10 h-10 rounded-full border-2 border-white/20 border-t-[#2997ff]"
              />
              <p className="text-xs text-[#86868b] tracking-wider uppercase font-mono">
                Carregando os dados da treta...
              </p>
            </div>
          ) : (
            /* Bloco de Instruções Extremamente Simples */
            <div className="space-y-6">
              {/* Header do Bloco */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs text-[#86868b]">
                  <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" />
                  <span>Como Jogar</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                  Como Funciona o Simulador
                </h2>
                <p className="text-xs sm:text-sm text-[#86868b] max-w-md mx-auto">
                  Você vai encarar mensagens reais que circulam no Brasil. O jogo é simples:
                </p>
              </div>

              {/* 3 Blocos Apple de Instrução Visual */}
              <div className="grid grid-cols-1 gap-3">
                {/* Bloco 1: A Mensagem */}
                <div className="p-4 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] flex items-start space-x-3.5 hover:border-white/[0.15] transition">
                  <div className="w-9 h-9 rounded-xl bg-[#0071e3]/15 border border-[#0071e3]/30 flex items-center justify-center flex-shrink-0 text-[#2997ff]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-semibold text-white">
                      1. Leia o Caso com Atenção
                    </h4>
                    <p className="text-xs text-[#86868b] leading-relaxed">
                      Leia a mensagem com calma e veja de quem veio. (WhatsApp, SMS, Ligação ou E-mail).
                    </p>
                  </div>
                </div>

                {/* Bloco 2: A Investigação */}
                <div className="p-4 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] flex items-start space-x-3.5 hover:border-white/[0.15] transition">
                  <div className="w-9 h-9 rounded-xl bg-[#ff9f0a]/15 border border-[#ff9f0a]/30 flex items-center justify-center flex-shrink-0 text-[#ff9f0a]">
                    <Search className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-semibold text-white">
                      2. Inspecione as Pistas Técnicas
                    </h4>
                    <p className="text-xs text-[#86868b] leading-relaxed">
                      Clique nas pistas para abrir a base de dados (WHOIS), dados da chave PIX e falsidade do autor (+10 XP cada).
                    </p>
                  </div>
                </div>

                {/* Bloco 3: O Veredito */}
                <div className="p-4 rounded-2xl bg-[#1c1c1e] border border-white/[0.08] flex items-start space-x-3.5 hover:border-white/[0.15] transition">
                  <div className="w-9 h-9 rounded-xl bg-[#30d158]/15 border border-[#30d158]/30 flex items-center justify-center flex-shrink-0 text-[#30d158]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-semibold text-white">
                      3. Bata o Martelo
                    </h4>
                    <p className="text-xs text-[#86868b] leading-relaxed flex flex-wrap items-center gap-1.5 pt-0.5">
                      Decida entre
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ff3b30]/15 text-[#ff3b30] font-semibold text-[11px] border border-[#ff3b30]/30">
                        <ShieldAlert className="w-3 h-3" /> GOLPE
                      </span>
                      ou
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#30d158]/15 text-[#30d158] font-semibold text-[11px] border border-[#30d158]/30">
                        <ShieldCheck className="w-3 h-3" /> SEGURO
                      </span>.
                      Faça pontos e não caia em papo furado!
                    </p>
                  </div>
                </div>
              </div>

              {/* Botão de Ação Primária Apple */}
              <div className="pt-2">
                <button
                  onClick={handleStart}
                  className="w-full py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-sm flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg"
                >
                  <span>Iniciar Simulação</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
