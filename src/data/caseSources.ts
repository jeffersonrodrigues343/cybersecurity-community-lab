// Fontes públicas usadas para montar cada caso (conferidas em 28/10/2026)
export interface CaseSource {
  label: string;
  url: string;
}

const CERT_BR: CaseSource = {
  label: 'CERT.br – Cartilha "Phishing e Outros Golpes" (2022)',
  url: 'https://busca.acervo.nic.br/vufind/Record/oai:bibliotecadigital.acervo.nic.br:123456789-2155/Details',
};
const BCB: CaseSource = {
  label: 'Banco Central do Brasil – Golpes',
  url: 'https://www.bcb.gov.br/acessoinformacao/golpes',
};
const FEBRABAN: CaseSource = {
  label: 'Febraban – Golpes',
  url: 'https://portal.febraban.org.br/pagina/3267/1076/pt-br/golpes',
};
const CORREIOS_AOSFATOS: CaseSource = {
  label: 'Aos Fatos – É golpe alerta que exige pagamento para liberar encomenda dos Correios',
  url: 'https://www.aosfatos.org/noticias/e-golpe-alerta-que-exige-pagamento-para-liberar-encomenda-retida-pelos-correios/',
};
const CORREIOS_ALERTA: CaseSource = {
  label: 'Mercado & Consumo – Correios alertam sobre golpe de encomendas presas na alfândega (2024)',
  url: 'https://mercadoeconsumo.com.br/31/07/2024/economia/correios-alertam-sobre-golpe-de-encomendas-presas-na-alfandega/',
};
const PROCON: CaseSource = {
  label: 'Itatiaia – Procon lista sites para o consumidor evitar (2023)',
  url: 'https://www.itatiaia.com.br/brasil/black-friday-2023-procon-lista-78-sites-para-consumidor-evitar-em-compras',
};
const RECEITA: CaseSource = {
  label: 'Receita Federal – portal oficial (e-CAC e Caixa Postal)',
  url: 'https://www.gov.br/receitafederal/pt-br',
};
const FALSO_EMPREGO: CaseSource = {
  label: 'SBT News – Golpe do falso emprego atinge desempregados no Brasil',
  url: 'https://sbtnews.sbt.com.br/noticia/tecnologia/261784-alerta-golpe-do-falso-emprego-atinge-desempregados-no-brasil',
};

export const CASE_SOURCES: Record<string, CaseSource[]> = {
  'case-1-whatsapp': [CERT_BR, BCB],
  'case-2-correios': [CORREIOS_AOSFATOS, CORREIOS_ALERTA],
  'case-3-compra-aprovada': [FEBRABAN, BCB],
  'case-3-falsa-central-sms': [FEBRABAN, BCB],
  'case-4-falsa-central': [BCB, FEBRABAN],
  'case-5-loja-falsa-promocao': [PROCON, CERT_BR],
  'case-6-sms-seguranca-real': [FEBRABAN, CERT_BR],
  'case-7-vaga-tarefas': [FALSO_EMPREGO, CERT_BR],
  'case-8-receita-ecac': [RECEITA, CERT_BR],
  'case-9-mao-fantasma-suporte': [FEBRABAN, BCB],
};

export const ALL_SOURCES: CaseSource[] = [CERT_BR, BCB, FEBRABAN, CORREIOS_AOSFATOS, CORREIOS_ALERTA, PROCON, RECEITA, FALSO_EMPREGO];

export const sourcesFor = (caseId: string): CaseSource[] => CASE_SOURCES[caseId] ?? [CERT_BR, BCB];
