import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, XCircle, ShieldAlert, ExternalLink } from 'lucide-react';

interface TaskPhishingProps {
  isCompleted: boolean;
  onComplete: () => void;
}

export const TaskPhishing: React.FC<TaskPhishingProps> = ({ isCompleted, onComplete }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const options = [
    {
      id: 'phish1',
      url: 'https://bancodobrasil-seguranca-login.com/atualizar-token',
      explanation: 'Golpe clássico: domínio falso registrado com palavras-chave de segurança para enganar o usuário.',
      isCorrect: false,
    },
    {
      id: 'phish2',
      url: 'https://www.bb.com.br/atendimento/seguranca-digital',
      explanation: 'URL Legítima! O domínio raiz termina estritamente no TLD oficial da instituição (.com.br).',
      isCorrect: true,
    },
    {
      id: 'phish3',
      url: 'http://notificacao-bb-urgente.net/recadastro-pix',
      explanation: 'Golpe perigoso: utiliza protocolo inseguro HTTP (sem cadeado) e domínio genérico .net.',
      isCorrect: false,
    },
  ];

  const handleSubmit = () => {
    if (!selected) {
      setFeedback({ type: 'error', message: 'Selecione uma das opções acima antes de validar.' });
      return;
    }

    const chosen = options.find((o) => o.id === selected);
    if (chosen?.isCorrect) {
      setFeedback({
        type: 'success',
        message: 'Excelente! Você identificou corretamente o domínio oficial e evitou uma tentativa de phishing.',
      });
      onComplete();
    } else {
      setFeedback({
        type: 'error',
        message: `Incorreto! ${chosen?.explanation || 'Esse link é um golpe de clonagem de tela.'}`,
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
      {/* Task Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
            isCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}>
            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : '01'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Engenharia Social & Detecção de Phishing</span>
              {isCompleted && (
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                  Resolvido
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-mono">Trilha: Defesa do Cidadão na Web</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-3 py-1 rounded-md">
          <span>+100 XP</span>
        </div>
      </div>

      {/* Task Content */}
      <div className="p-6 space-y-5">
        
        {/* Concept Pill */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-sm text-slate-300 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider font-mono">
            <ShieldAlert className="w-4 h-4" />
            <span>Fundamento Técnico (Análise de URL)</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            O <em>Phishing</em> é o vetor de ataque mais frequente contra a população. Criminosos criam páginas idênticas às de bancos e cadastram domínios com nomes parecidos (Typosquatting) para furtar senhas e chaves PIX. A defesa básica consiste em ler a URL da <strong>direita para a esquerda</strong> a partir do domínio raiz (.br / .com).
          </p>
        </div>

        {/* Challenge prompt */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulação Prática: Identifique a única URL Segura e Legítima</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">Escolha uma opção</span>
          </div>

          <div className="space-y-2.5">
            {options.map((opt) => {
              const isChosen = selected === opt.id;
              return (
                <motion.div
                  key={opt.id}
                  whileHover={{ scale: isCompleted ? 1 : 1.008 }}
                  whileTap={{ scale: isCompleted ? 1 : 0.995 }}
                  onClick={() => !isCompleted && setSelected(opt.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isChosen
                      ? 'border-emerald-500 bg-emerald-950/20 text-white'
                      : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 text-slate-300'
                  } ${isCompleted ? 'opacity-70 cursor-default' : ''}`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <input
                      type="radio"
                      name="phish_opt"
                      checked={isChosen}
                      onChange={() => setSelected(opt.id)}
                      disabled={isCompleted}
                      className="accent-emerald-500 w-4 h-4"
                    />
                    <span className="font-mono text-xs sm:text-sm truncate">{opt.url}</span>
                  </div>

                  <ExternalLink className="w-4 h-4 text-slate-600 flex-shrink-0 ml-2" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Action Button & Feedback */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.button
            whileHover={{ scale: isCompleted ? 1 : 1.02 }}
            whileTap={{ scale: isCompleted ? 1 : 0.98 }}
            onClick={handleSubmit}
            disabled={isCompleted}
            className={`px-6 py-2.5 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center space-x-2 ${
              isCompleted
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-900/30'
            }`}
          >
            <span>{isCompleted ? '✓ Tarefa Concluída' : 'Validar Resposta'}</span>
          </motion.button>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
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
        </div>

      </div>
    </motion.section>
  );
};
