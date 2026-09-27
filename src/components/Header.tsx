import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Terminal, Award, Sparkles, Volume2, VolumeX, FileText } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  score: number;
  totalScore: number;
  completedCount: number;
  onOpenReportModal?: () => void;
}

export const Header = ({ score, totalScore, completedCount, onOpenReportModal }: HeaderProps) => {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundEnabled(sound.enabled);
    if (sound.enabled) {
      sound.playBlip();
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#080c14]/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-wider text-white">HACK<span className="text-emerald-400">LEARN</span></span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                v1.0 Community
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">
              Extensão Universitária • CST Análise e Desenv. de Sistemas
            </p>
          </div>
        </div>

        {/* Right Stats & Badge */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-600 transition"
            title={soundEnabled ? 'Desativar Sons' : 'Ativar Efeitos Sonoros'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Botao Sobre o Projeto */}
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500 transition text-xs font-mono"
              title="Sobre o Projeto de Extensão"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sobre o Projeto</span>
            </button>
          )}

          {/* Progress Pill */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Desafios:</span>
            <span className="text-emerald-400 font-semibold">{completedCount}/3</span>
          </div>

          {/* XP Counter with Motion animation */}
          <motion.div 
            key={score}
            initial={{ scale: 1.15, borderColor: '#10b981' }}
            animate={{ scale: 1, borderColor: '#334155' }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs sm:text-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 text-xs">XP:</span>
            <span className="font-bold text-emerald-400">{score}</span>
            <span className="text-slate-600 text-xs">/ {totalScore}</span>
          </motion.div>

          {/* Completion Badge */}
          {completedCount === 3 && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold font-mono shadow-lg shadow-emerald-900/40"
            >
              <Award className="w-4 h-4" />
              <span className="hidden lg:inline">CERTIFICADO LIBERADO</span>
            </motion.div>
          )}
        </div>

      </div>
    </header>
  );
};
