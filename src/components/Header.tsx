import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Award, Volume2, VolumeX, Info } from 'lucide-react';
import { sound } from '../utils/audio';
import { calculatePlayerRank } from '../data/scamsData';

interface HeaderProps {
  score: number;
  totalScore: number;
  completedCount: number;
  onOpenReportModal?: () => void;
}

export const Header = ({ score, totalScore, completedCount, onOpenReportModal }: HeaderProps) => {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const playerRank = calculatePlayerRank(score);

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundEnabled(sound.enabled);
    if (sound.enabled) {
      sound.playBlip();
    }
  };

  return (
    <header className="sticky top-0 z-50 h-12 bg-black/80 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Apple-style Brand / Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-white">
            <Shield className="w-3.5 h-3.5 text-[#2997ff]" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
            <span>HackLearn</span>
            <span className="text-[10px] text-[#86868b] font-normal hidden sm:inline">• Defesa Digital</span>
          </span>
        </div>

        {/* Right Stats & Apple Capsule Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#86868b] hover:text-white hover:bg-white/[0.08] transition"
            title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Botão Sobre o Projeto */}
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-[#86868b] hover:text-white transition text-xs font-normal"
              title="Sobre o Projeto de Extensão"
            >
              <Info className="w-3 h-3 text-[#2997ff]" />
              <span>Sobre</span>
            </button>
          )}

          {/* Progress Capsule */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] text-xs text-[#86868b]">
            <span className="text-white font-medium">{completedCount}</span>
            <span>/ 9 casos</span>
          </div>

          {/* XP Pill with Motion */}
          <motion.div 
            key={score}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.1] text-xs font-medium text-white"
          >
            <span className="text-xs">{playerRank.icon}</span>
            <span className="text-[#2997ff] font-semibold">{score}</span>
            <span className="text-[#86868b] text-[11px]">/ {totalScore} XP</span>
          </motion.div>

          {/* Completion Badge */}
          {completedCount >= 9 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#30d158]/20 border border-[#30d158]/40 text-[#30d158] text-xs font-medium"
            >
              <Award className="w-3 h-3" />
              <span className="hidden md:inline">Certificado Pronto</span>
            </motion.div>
          )}
        </div>

      </div>
    </header>
  );
};
