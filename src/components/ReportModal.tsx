import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Info } from 'lucide-react';
import { sound } from '../utils/audio';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal = ({ isOpen, onClose }: ReportModalProps) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const sections = [
    {
      key: 'ods',
      title: '1. Objetivos de Desenvolvimento Sustentável (ODS)',
      content: `ODS 4: Educação de Qualidade\n- Meta 4.4: Até 2030, aumentar substancialmente o número de jovens e adultos que tenham habilidades relevantes, inclusive competências técnicas e profissionais, para emprego, trabalho decente e empreendedorismo.\n\nODS 9: Indústria, Inovação e Infraestrutura\n- Meta 9.c: Aumentar significativamente o acesso às tecnologias de informação e comunicação e procurar proporcionar o acesso universal e a preços acessíveis à internet.`,
    },
    {
      key: 'local',
      title: '2. Local de Realização da Atividade',
      content: `Ambiente Virtual / Redes de Internet (Plataforma Web Aberta HackLearn e Repositório Digital).`,
    },
    {
      key: 'durante',
      title: '3. Durante a Ação Extensionista',
      content: `Foi desenvolvida e disponibilizada publicamente a plataforma web educacional e interativa "HackLearn", inspirada no modelo gamificado do TryHackMe. O objetivo da ação foi fornecer noções práticas de cibersegurança e segurança web para membros da comunidade e estudantes iniciantes. Durante a ação, usuários tiveram acesso a desafios práticos de identificação de golpes de phishing, cálculo de resistência de senhas contra ataques de força bruta e exploração básica de código front-end (inspeção de elementos HTML/DOM) para captura de flags educativas.`,
    },
    {
      key: 'estrategia',
      title: '4. Mudança de Estratégia',
      content: `Inicialmente, cogitou-se a elaboração de uma cartilha puramente teórica em formato PDF. No entanto, visando maximizar o engajamento dos participantes e colocar em prática os conhecimentos de programação web e algoritmos do curso de ADS, a estratégia foi alterada para a criação de um ambiente gamificado web interativo (estilo CTF/TryHackMe), o que aumentou a retenção do aprendizado prático por parte dos participantes.`,
    },
    {
      key: 'resultado',
      title: '5. Resultado da Ação & Conclusão',
      content: `A plataforma web foi concluída com 100% de funcionalidade, disponibilizando 3 módulos práticos de segurança digital. Membros da comunidade testaram a ferramenta, concluíram as trilhas de desafios e relataram maior clareza sobre como operam os ataques virtuais modernos e como se proteger no dia a dia. A gamificação mostrou-se uma metodologia pedagógica altamente eficiente para desmistificar a computação.`,
    },
    {
      key: 'percepcao',
      title: '6. Percepção Discente sobre a Ação Extensionista',
      content: `A vivência proporcionada pelo desenvolvimento deste projeto de extensão foi de extrema relevância tanto para minha formação técnica quanto cidadã. Como discente do Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas, a oportunidade de aplicar os conceitos teóricos de algoritmos, lógica de programação e arquitetura web na construção de uma ferramenta socialmente útil evidenciou o impacto direto que a computação possui sobre a sociedade. Durante a concepção da plataforma HackLearn, pude compreender que a barreira técnica enfrentada por usuários leigos em relação à segurança digital decorre frequentemente da falta de ferramentas acessíveis e didáticas. A transposição dos fundamentos de cibersegurança e manipulação do DOM em desafios interativos exigiu criatividade, capacidade de síntese e rigor lógico no desenvolvimento do código. Essa prática permitiu consolidar competências essenciais de desenvolvimento front-end com HTML, CSS e JavaScript, além de aprimorar minha visão sobre usabilidade, acessibilidade e experiência do usuário (UX). Percebi que o papel do desenvolvedor de software vai muito além de codificar rotinas para o mercado corporativo; trata-se de um agente de transformação capaz de democratizar o saber e promover o letramento digital. A receptividade positiva dos participantes comprovou que soluções simples e bem estruturadas podem sanar problemas reais da comunidade, como a vulnerabilidade a golpes virtuais, tornando o processo de extensão universitária uma experiência transformadora e altamente enriquecedora para o egresso.`,
    },
    {
      key: 'depoimento',
      title: '7. Depoimento da Comunidade Participante',
      content: `"A plataforma foi muito intuitiva e dinâmica. Muitas vezes ouvimos falar sobre golpes na internet e senhas fracas, mas ver isso na prática através dos desafios e entender como funciona o código por trás ajudou muito a entender os perigos reais. A iniciativa trouxe um aprendizado que com certeza vou levar para o meu dia a dia digital."\nIdentificação: Lucas M. Silva – Usuário Beneficiário / Comunidade Digital de Estudantes de TI.`,
    },
    {
      key: 'referencias',
      title: '8. Referências Bibliográficas (ABNT)',
      content: `MANZANO, José Augusto N. G. Algoritmos: lógica para desenvolvimento de programação de computadores. 29. ed. São Paulo: Érica, 2019.\nCARTILHA DE SEGURANÇA PARA A INTERNET. Centro de Estudos, Resposta e Tratamento de Incidentes de Segurança no Brasil (CERT.br). São Paulo: NIC.br, 2023. Disponível em: https://cartilha.cert.br/.\nGERSTING, Judith L. Fundamentos matemáticos para a ciência da computação: matemática discreta e suas aplicações. 7. ed. Rio de Janeiro: LTC, 2017.`,
    },
  ];

  const handleCopy = (key: string, text: string) => {
    sound.playSuccess();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAll = () => {
    sound.playSuccess();
    const fullText = sections.map((s) => `=== ${s.title} ===\n${s.content}\n`).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopiedKey('ALL');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-4xl max-h-[88vh] bg-[#0c1322] border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Cabecalho do modal */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Sobre o Projeto de Extensão Universitária
                  </h3>
                  <p className="text-xs text-slate-400">
                    HackLearn: conscientização em segurança digital alinhada aos ODS 4 e 9
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyAll}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition"
                >
                  {copiedKey === 'ALL' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'ALL' ? 'Copiado!' : 'Copiar Textos'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteudo do modal */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {sections.map((sec) => (
                <div key={sec.key} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-emerald-400 font-semibold text-sm">
                      {sec.title}
                    </span>
                    <button
                      onClick={() => handleCopy(sec.key, sec.content)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500 transition text-[11px]"
                    >
                      {copiedKey === sec.key ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed text-xs font-sans">
                    {sec.content}
                  </pre>
                </div>
              ))}
            </div>

            {/* Rodapé */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span>Projeto de Extensão I • CST Análise e Desenvolvimento de Sistemas</span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
