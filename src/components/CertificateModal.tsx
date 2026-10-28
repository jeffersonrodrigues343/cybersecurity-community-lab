import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle, MessageSquare, Send, UserCheck, ShieldCheck } from 'lucide-react';
import { apiService } from '../services/api';
import { calculatePlayerRank } from '../data/scamsData';

interface CertificateModalProps {
  isOpen: boolean;
  score: number;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, score }) => {
  const [participantName, setParticipantName] = useState('Membro da Comunidade / Aluno');
  const [testimonial, setTestimonial] = useState('');
  const [saveError, setSaveError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0071e3', '#30d158', '#ff9f0a', '#ffffff'],
      });
    }
  }, [isOpen]);

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (testimonial.trim().length > 3) {
      const ok = await apiService.submitFeedback(participantName, testimonial);
      setSaveError(!ok);
      setIsSaved(ok);
    }
  };

  const playerRank = calculatePlayerRank(score);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="my-10 rounded-[32px] p-6 sm:p-8 bg-[#161617] border border-white/[0.1] shadow-2xl relative overflow-hidden"
    >
      {/* Top Banner */}
      <div className="text-center space-y-2 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white mx-auto shadow-md">
          <Award className="w-7 h-7 text-[#ff9f0a]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Parabéns! Você concluiu a trilha.
        </h2>
        <p className="text-[#86868b] text-xs sm:text-sm max-w-lg mx-auto">
          Você analisou os casos mais perigosos do Brasil e desenvolveu pensamento crítico para blindar sua família contra fraudes virtuais.
        </p>
      </div>

      {/* Certificate Card (Apple Style) */}
      <div className="max-w-xl mx-auto bg-black border border-white/[0.08] rounded-[24px] p-6 sm:p-7 text-xs relative shadow-inner space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <span className="text-[#30d158] font-medium tracking-wide flex items-center gap-1.5 uppercase text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>Certificado de Extensão Universitária</span>
          </span>
          <span className="text-[#86868b] text-[11px]">
            {new Date().toLocaleDateString('pt-BR')}
          </span>
        </div>

        <div className="space-y-3 text-[#d2d2d7] leading-relaxed">
          <p>
            Certificamos que{' '}
            <strong className="text-white underline underline-offset-4">
              {participantName}
            </strong>{' '}
            concluiu o simulador educativo <strong>HackLearn Brasil</strong>, desenvolvido no âmbito do <strong>Projeto de Extensão Universitária I</strong> do Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="bg-white/[0.04] p-3 rounded-[16px] border border-white/[0.06]">
              <span className="text-[#86868b] block text-[10px] uppercase">Pontuação Conquistada:</span>
              <strong className="text-[#30d158] text-sm font-semibold">{score} XP</strong>
            </div>
            <div className="bg-white/[0.04] p-3 rounded-[16px] border border-white/[0.06]">
              <span className="text-[#86868b] block text-[10px] uppercase">Patente Alcançada:</span>
              <strong className="text-white text-xs flex items-center gap-1.5 mt-0.5 font-medium">
                <span>{playerRank.icon}</span>
                <span>{playerRank.name}</span>
              </strong>
            </div>
          </div>

          <div className="bg-white/[0.03] p-3 rounded-[16px] border border-white/[0.06] space-y-1">
            <span className="text-[#86868b] block text-[10px] uppercase font-medium">
              Competências Formativas Validadas:
            </span>
            <ul className="text-[11px] text-[#d2d2d7] space-y-0.5">
              <li>✓ Identificação de Engenharia Social, Phishing e Gatilhos de Urgência</li>
              <li>✓ Auditoria Forense Digital (Whois, Chaves Pix e Linhas Digitáveis)</li>
              <li>✓ Mecanismos Oficiais de Defesa (Mecanismo Especial de Devolução - MED / B.O.)</li>
              <li>✓ Blindagem e Educação Digital Familiar para Crianças e Idosos</li>
            </ul>
          </div>
        </div>

        {/* Name input */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2.5">
          <UserCheck className="w-4 h-4 text-[#86868b] flex-shrink-0" />
          <span className="text-[#86868b] text-[11px]">Nome no Certificado:</span>
          <input
            type="text"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-full px-3 py-1 text-white text-base sm:text-xs focus:outline-none focus:border-[#2997ff]"
          />
        </div>
      </div>

      {/* Community Testimonial Form */}
      <div className="max-w-xl mx-auto mt-6 bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-5">
        <div className="flex items-center space-x-2 text-white font-semibold text-xs mb-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-[#2997ff]" />
          <span>Deixe seu depoimento sobre a experiência:</span>
        </div>
        <p className="text-[#86868b] text-xs mb-3">
          Ajude a comunidade compartilhando o que você aprendeu no simulador.
        </p>

        {!isSaved ? (
          <form onSubmit={handleSaveTestimonial} className="space-y-3">
            <textarea
              rows={3}
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              placeholder="Ex: A simulação do golpe do falso WhatsApp é idêntica ao que tentaram mandar na minha família. Agora sei exatamente como identificar o golpe..."
              className="w-full bg-black/60 border border-white/[0.08] rounded-[18px] p-3 text-base sm:text-xs text-white focus:outline-none focus:border-[#2997ff]"
            />
            <p className="text-[#86868b] text-[11px]">
              Seu nome e depoimento podem aparecer publicamente no app. Não escreva dados pessoais (CPF, telefone, endereço).
            </p>
            {saveError && (
              <p role="alert" className="text-[#ff453a] text-xs">
                Não foi possível enviar agora. Verifique a internet e tente de novo.
              </p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs transition flex items-center justify-center space-x-2 shadow-md shadow-[#0071e3]/20"
            >
              <Send className="w-3 h-3" />
              <span>Registrar Depoimento</span>
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-[18px] bg-[#30d158]/10 border border-[#30d158]/30 text-white text-xs space-y-1.5"
          >
            <div className="flex items-center space-x-1.5 font-medium text-[#30d158]">
              <CheckCircle className="w-4 h-4" />
              <span>Depoimento gravado com sucesso!</span>
            </div>
            <p className="italic text-[#d2d2d7]">
              "{testimonial}"
            </p>
            <p className="text-[10px] text-[#86868b] pt-0.5">
              ✓ Sincronizado com o banco de dados da extensão comunitária.
            </p>
          </motion.div>
        )}
      </div>

    </motion.div>
  );
};
