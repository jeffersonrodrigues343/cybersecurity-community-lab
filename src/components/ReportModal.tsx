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
      content: `Foi desenvolvida e disponibilizada publicamente a plataforma web educacional e interativa "HackLearn: Simulador Pedagógico de Defesa contra Golpes Virtuais". O objetivo da ação foi fornecer noções práticas de cibersegurança e letramento digital para membros da comunidade, famílias, adolescentes e idosos. Durante a ação, usuários tiveram acesso a 9 simulações realistas baseadas nos 10 golpes mais comuns do Brasil (dados da FEBRABAN e CERT.br), incluindo clonagem de WhatsApp de parentes, falsas centrais telefônicas 0800, falsas lojas virtuais, o Golpe da Mão Fantasma e boletos adulterados. Para cada caso, o participante atua ativamente como perito investigativo, auditando registros Whois, chaves Pix e códigos bancários antes de emitir seu veredito.`,
    },
    {
      key: 'estrategia',
      title: '4. Mudança de Estratégia',
      content: `Inicialmente, cogitou-se a elaboração de uma cartilha puramente teórica em formato PDF ou desafios puramente técnicos de CTF voltados a programadores. No entanto, para alcançar a comunidade real (crianças, adolescentes, pais e idosos vulneráveis a golpes financeiros), a estratégia evoluiu para um simulador pedagógico gamificado. Foram incorporadas lentes pedagógicas duplas (visão lúdica com metáforas para crianças e visão jurídica/financeira com diretrizes do Banco Central para adultos), sistema de medalhas colecionáveis, combos de acerto e a Cartilha da Família Segura, ampliando o impacto social e a retenção do aprendizado.`,
    },
    {
      key: 'resultado',
      title: '5. Resultado da Ação & Conclusão',
      content: `A plataforma web foi concluída com 100% de funcionalidade, disponibilizando os 3 níveis de dificuldade (Básico, Médio e Avançado), 8 conquistas pedagógicas desbloqueáveis, o Kit do Investigador Forense e certificação de conclusão sincronizada com backend em C# .NET 8, banco SQLite local e persistência em nuvem no Supabase. Membros da comunidade testaram a ferramenta, concluíram as trilhas e relataram maior segurança no uso do Pix, WhatsApp e internet banking. A sistema de pontuação mostrou-se uma metodologia transformadora para a cidadania digital.`,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-3xl max-h-[85vh] bg-[#1c1c1e] border border-white/[0.1] rounded-[32px] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Cabecalho do modal */}
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-[#161617]/80">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-[#2997ff]">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Sobre o Projeto de Extensão
                  </h3>
                  <p className="text-xs text-[#86868b]">
                    HackLearn: conscientização em segurança digital alinhada aos ODS 4 e 9
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyAll}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs transition"
                >
                  {copiedKey === 'ALL' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'ALL' ? 'Copiado!' : 'Copiar Textos'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-[#86868b] hover:text-white rounded-full hover:bg-white/[0.08] transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conteudo do modal */}
            <div className="p-5 overflow-y-auto space-y-3 text-xs">
              {sections.map((sec) => (
                <div key={sec.key} className="bg-white/[0.03] border border-white/[0.06] rounded-[20px] p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="text-[#2997ff] font-medium text-xs">
                      {sec.title}
                    </span>
                    <button
                      onClick={() => handleCopy(sec.key, sec.content)}
                      className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#86868b] hover:text-white transition text-[11px]"
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
