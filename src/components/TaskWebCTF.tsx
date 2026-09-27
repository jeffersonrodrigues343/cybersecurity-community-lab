import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, Terminal, CheckCircle2, XCircle, Code2, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../services/api';

interface TaskWebCTFProps {
  isCompleted: boolean;
  onComplete: () => void;
}

export const TaskWebCTF: React.FC<TaskWebCTFProps> = ({ isCompleted, onComplete }) => {
  const [flagInput, setFlagInput] = useState('');
  const [showSimulatedDevTools, setShowSimulatedDevTools] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = flagInput.trim();
    if (!clean) return;

    setLoading(true);
    const res = await apiService.validateFlag(clean);
    setLoading(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: res.message || 'Parabéns! Flag correta, desafio concluído!',
      });
      onComplete();
    } else {
      setFeedback({
        type: 'error',
        message: res.message || 'Flag incorreta. Tente inspecionar o código com o F12.',
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
      {/* comentario real injetado no DOM pro aluno achar no F12 */}
      <div
        style={{ display: 'none' }}
        dangerouslySetInnerHTML={{
          __html: '<!-- FLAG_DO_DESAFIO_WEB: HACKLEARN{seguranca_web_iniciante_2024} -->',
        }}
      />

      {/* cabecalho da missao */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
            isCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}>
            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : '03'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Web CTF: Inspecionando o Front-end (F12)</span>
              {isCompleted && (
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                  Concluído
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-mono">Trilha: Segurança no Navegador e Código Aberto</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-3 py-1 rounded-md">
          <span>+100 XP</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* explicacao teorica */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold uppercase tracking-wider font-mono">
            <Terminal className="w-4 h-4" />
            <span>Conceito: Código no Cliente é Público</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Tudo o que é baixado pelo navegador (HTML, JavaScript, CSS) pode ser lido pelo usuário. Um erro muito comum de iniciantes é esquecer comentários com senhas de teste, tokens de acesso ou rotas internas no código da página.
          </p>
        </div>

        {/* caixa do desafio */}
        <div className="bg-slate-950 border border-dashed border-slate-700/80 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span><strong>Desafio:</strong> Encontre a FLAG secreta escondida no código desta página.</span>
            </div>

            <button
              type="button"
              onClick={() => setShowSimulatedDevTools(!showSimulatedDevTools)}
              className="text-xs font-mono flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-600 transition"
            >
              {showSimulatedDevTools ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showSimulatedDevTools ? 'Ocultar Dica' : 'Ver Dica / Console'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            💡 <em>Dica:</em> Pressione <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-slate-700">F12</kbd> ou <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-slate-700">Ctrl + Shift + I</kbd> para abrir as Ferramentas do Desenvolvedor e inspecionar os elementos desta seção.
          </p>

          <AnimatePresence>
            {showSimulatedDevTools && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[#0b101b] border border-emerald-950/70 rounded-lg p-3 font-mono text-[11px] text-slate-300 space-y-1">
                  <div className="text-slate-500 border-b border-slate-800 pb-1 flex justify-between">
                    <span>Console do Navegador (Elementos HTML)</span>
                    <span className="text-emerald-400">&lt;section id="task3-ctf"&gt;</span>
                  </div>
                  <div className="text-slate-400 pt-1">
                    &lt;div class="container-ctf"&gt;
                  </div>
                  <div className="pl-4 text-emerald-400/90 font-bold bg-emerald-950/20 py-1 rounded px-2">
                    &lt;!-- TODO: remover antes de publicar! FLAG: HACKLEARN&#123;seguranca_web_iniciante_2024&#125; --&gt;
                  </div>
                  <div className="pl-4 text-slate-400">
                    &lt;p&gt;Conteudo visivel da pagina...&lt;/p&gt;
                  </div>
                  <div className="text-slate-400">
                    &lt;/div&gt;
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* formulario de envio da flag */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
            Digite a Flag encontrada (formato HACKLEARN&#123;...&#125;):
          </label>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Flag className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={flagInput}
                onChange={(e) => setFlagInput(e.target.value)}
                placeholder="HACKLEARN{...}"
                disabled={isCompleted || loading}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: isCompleted || loading ? 1 : 1.02 }}
              whileTap={{ scale: isCompleted || loading ? 1 : 0.98 }}
              disabled={isCompleted || loading}
              className={`px-6 py-2 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center space-x-2 ${
                isCompleted
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-900/30'
              }`}
            >
              <span>{loading ? 'Validando...' : isCompleted ? '✓ Flag Validada' : 'Submeter Flag'}</span>
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
