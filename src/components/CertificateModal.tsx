import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle, MessageSquare, Send, UserCheck, ShieldCheck } from 'lucide-react';
import { apiService } from '../services/api';

interface CertificateModalProps {
  isOpen: boolean;
  score: number;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, score }) => {
  const [participantName, setParticipantName] = useState('Membro da Comunidade / Aluno');
  const [testimonial, setTestimonial] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#38bdf8', '#a855f7', '#fbbf24'],
      });
    }
  }, [isOpen]);

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (testimonial.trim().length > 3) {
      await apiService.submitFeedback(participantName, testimonial);
      setIsSaved(true);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="my-12 rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0f172a] to-[#080c14] border-2 border-emerald-500/70 shadow-2xl shadow-emerald-950/40 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Banner */}
      <div className="text-center space-y-3 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto text-3xl shadow-lg shadow-emerald-950/50">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Parabéns! Você se tornou um Cidadão Blindado contra Golpes!
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Você concluiu com êxito os desafios dos níveis Básico, Médio e Avançado, aprendendo na prática a identificar os 10 golpes mais comuns do Brasil.
        </p>
      </div>

      {/* Certificate Card */}
      <div className="max-w-2xl mx-auto bg-slate-950 border border-emerald-900/60 rounded-2xl p-6 sm:p-8 font-mono text-xs relative shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>CERTIFICADO DE EXTENSÃO UNIVERSITÁRIA</span>
          </span>
          <span className="text-slate-500 text-[11px]">
            {new Date().toLocaleDateString('pt-BR')}
          </span>
        </div>

        <div className="space-y-4 text-slate-300">
          <p className="leading-relaxed">
            Certificamos que{' '}
            <strong className="text-emerald-300 underline underline-offset-4">
              {participantName}
            </strong>{' '}
            concluiu o treinamento interativo da plataforma <strong>HackLearn Brasil</strong>, desenvolvida no âmbito do <strong>Projeto de Extensão Universitária I</strong> do Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Pontuação Conquistada:</span>
              <strong className="text-emerald-400 text-sm">{score} XP Conquistados</strong>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Competências Validadas:</span>
              <strong className="text-blue-400 text-sm">WhatsApp, Falsa Central, Pix & Boletos</strong>
            </div>
          </div>
        </div>

        {/* Name input */}
        <div className="mt-5 pt-4 border-t border-slate-900 flex items-center gap-3">
          <UserCheck className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span className="text-slate-400 text-[11px]">Personalizar Nome:</span>
          <input
            type="text"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Community Testimonial Form */}
      <div className="max-w-xl mx-auto mt-8 bg-slate-950/70 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center space-x-2 text-white font-bold text-sm mb-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>Deixe seu depoimento sobre a experiência:</span>
        </div>
        <p className="text-slate-400 text-xs mb-4">
          Conte o que achou da simulação dos golpes e como ela ajudou você a se proteger melhor no dia a dia.
        </p>

        {!isSaved ? (
          <form onSubmit={handleSaveTestimonial} className="space-y-3">
            <textarea
              rows={3}
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              placeholder="Ex: Achei a simulação muito realista! A mensagem do falso WhatsApp é idêntica ao que mandaram pra minha mãe semana passada. Agora sei exatamente como identificar o golpe..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
            />
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs uppercase py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Registrar Depoimento da Comunidade</span>
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 font-mono text-xs space-y-2"
          >
            <div className="flex items-center space-x-2 font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Depoimento gravado com sucesso no banco de dados!</span>
            </div>
            <p className="italic text-slate-300 font-sans">
              "{testimonial}"
            </p>
            <p className="text-[10px] text-emerald-400 pt-1">
              ✓ Obrigado pela sua contribuição! Seu feedback foi registrado e armazenado com sucesso.
            </p>
          </motion.div>
        )}
      </div>

    </motion.div>
  );
};
