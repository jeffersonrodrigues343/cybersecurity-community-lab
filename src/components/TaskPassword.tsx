import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, CheckCircle2, XCircle, Gauge, Lock } from 'lucide-react';

interface TaskPasswordProps {
  isCompleted: boolean;
  onComplete: () => void;
}

export const TaskPassword: React.FC<TaskPasswordProps> = ({ isCompleted, onComplete }) => {
  const [testPassword, setTestPassword] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Entropy evaluation
  const evaluatePassword = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Aguardando digitação...', time: '--', color: 'bg-slate-700' };

    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (pwd.length >= 12) score += 25;
    if (/[A-Z]/.test(pwd)) score += 15;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 20;

    if (score < 40) {
      return { score, label: 'Muito Fraca (Vulnerável a Wordlist/Brute Force)', time: 'Poucos segundos', color: 'bg-red-500' };
    } else if (score < 75) {
      return { score, label: 'Média (Aceitável para logins secundários)', time: 'Dias a meses', color: 'bg-amber-500' };
    } else {
      return { score, label: 'Forte (Excelente resistência criptográfica)', time: 'Centenas de séculos', color: 'bg-emerald-500' };
    }
  };

  const currentEntropy = evaluatePassword(testPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = answerInput.trim();

    if (clean === '8' || clean === '12' || clean === '16') {
      setFeedback({
        type: 'success',
        message: 'Correto! Cartilhas como NIST e CERT.br preconizam um comprimento mínimo de 8 a 12 caracteres variados.',
      });
      onComplete();
    } else {
      setFeedback({
        type: 'error',
        message: 'Tente 8 ou 12. Pense no comprimento mínimo clássico exigido para resistir a ataques de dicionário.',
      });
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl border transition-all duration-300 ${
        isCompleted 
          ? 'bg-slate-900/40 border-emerald-500/40 shadow-lg shadow-emerald-950/20' 
          : 'bg-slate-900/80 border-slate-800'
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
            isCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}>
            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : '02'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Higiene de Senhas & Ataques de Força Bruta</span>
              {isCompleted && (
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                  Resolvido
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-mono">Trilha: Criptografia e Armazenamento Seguro</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-3 py-1 rounded-md">
          <span>+100 XP</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Interactive Lab Sandbox */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-4 h-4" />
              <span>Simulador Interativo de Entropia (Algoritmo Client-Side)</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Experimente digitar algo</span>
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              placeholder="Digite qualquer senha de exemplo (ex: admin123, tr0cador!99)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Real-time bar */}
          <div className="space-y-2">
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={false}
                animate={{ width: `${currentEntropy.score}%` }}
                className={`h-full ${currentEntropy.color} transition-colors duration-300`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs font-mono gap-2">
              <span className="text-slate-300">
                Nível: <strong className="text-white">{currentEntropy.label}</strong>
              </span>
              <span className="text-slate-400">
                Estimativa de Quebra (Hashcat): <strong className="text-emerald-400">{currentEntropy.time}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Validation Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            <strong>Questão Teórico-Prática:</strong> Conforme as recomendações técnicas da cartilha <em>CERT.br</em> (Centro de Estudos, Resposta e Tratamento de Incidentes de Segurança no Brasil), qual é o comprimento <strong>mínimo</strong> em caracteres indicado para garantir que uma senha não seja trivialmente quebrada por computadores domésticos modernos?
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative w-full sm:w-48">
              <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="Ex: 8"
                disabled={isCompleted}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: isCompleted ? 1 : 1.02 }}
              whileTap={{ scale: isCompleted ? 1 : 0.98 }}
              disabled={isCompleted}
              className={`px-6 py-2 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center space-x-2 ${
                isCompleted
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-900/30'
              }`}
            >
              <span>{isCompleted ? '✓ Validado' : 'Submeter Resposta'}</span>
            </motion.button>
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-xs font-mono flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
                <span>{feedback.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

      </div>
    </motion.section>
  );
};
