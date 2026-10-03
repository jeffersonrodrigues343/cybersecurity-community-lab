import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { sound } from '../utils/audio';
import { AnimatedCounter } from './AnimatedCounter';

interface HeaderProps {
  score: number;
  onOpenInstructions?: () => void;
}

export const Header = ({ score, onOpenInstructions }: HeaderProps) => {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundEnabled(sound.enabled);
    if (sound.enabled) {
      sound.playBlip();
    }
  };

  return (
    <header className="sticky top-0 z-50 h-14 bg-desk/85 backdrop-blur-xl border-b border-desk-line transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Marca */}
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-white">
            <Shield className="w-3.5 h-3.5 text-[#2997ff]" />
          </div>
          <span className="font-display font-extrabold text-[17px] tracking-tight text-white">HackLearn<span className="hidden sm:inline font-mono font-normal text-[11px] tracking-[0.2em] uppercase text-clip ml-3">Agência anti-golpe</span></span>
        </div>

        {/* Controles mínimos: som, como jogar e XP (o único número fixo da tela) */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleSound}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#86868b] hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
            title={soundEnabled ? 'Silenciar áudio' : 'Ativar áudio'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {onOpenInstructions && (
            <button
              onClick={onOpenInstructions}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white transition text-xs font-medium cursor-pointer"
              title="Como jogar"
            >
              <HelpCircle className="w-3.5 h-3.5 text-marker" />
              <span className="hidden sm:inline">Como jogar</span>
            </button>
          )}

          <motion.div
            key={score}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.12] text-xs font-medium text-white"
          >
            <AnimatedCounter value={score} className="text-marker font-semibold" />
            <span className="text-[#86868b] text-[11px]">XP</span>
          </motion.div>
        </div>
      </div>
    </header>
  );
};
