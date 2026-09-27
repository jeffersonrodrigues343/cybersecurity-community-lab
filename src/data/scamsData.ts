export type ScamLevel = 'basico' | 'medio' | 'avancado';

export interface ScamCase {
  id: string;
  level: ScamLevel;
  levelTitle: string;
  xpReward: number;
  category: string;
  title: string;
  sender: string;
  channel: 'whatsapp' | 'sms' | 'call' | 'social' | 'document';
  time: string;
  preview: string;
  messageContent: string;
  extraDetails?: {
    label: string;
    value: string;
  }[];
  isScam: boolean;
  redFlags: string[];
  explanation: string;
  realWorldTip: string;
}

export const SCAM_CASES: ScamCase[] = [
  // ==========================================
  // NIVEL 1: BASICO (Cotidiano / WhatsApp / SMS)
  // ==========================================
  {
    id: 'case-1-whatsapp',
    level: 'basico',
    levelTitle: 'Nível Básico',
    xpReward: 50,
    category: 'WhatsApp & Família',
    title: 'Parente Pedindo Pix com Número Novo',
    sender: 'Filha (Número Desconhecido)',
    channel: 'whatsapp',
    time: '14:22',
    preview: 'Oi mãe, anota meu número novo! Meu celular antigo quebrou...',
    messageContent:
      'Oi mãe! Salva meu número novo aí, por favor. O meu celular antigo caiu no chão e parou de funcionar. Tô usando esse provisório.\n\nPreciso muito de um favor urgente: tenho que pagar uma conta da faculdade até às 15h e meu app do banco ainda não autorizou nesse aparelho. Consegue me transferir um Pix de R$ 480 agora? Te devolvo assim que chegar em casa!',
    extraDetails: [
      { label: 'Foto de Perfil', value: 'Foto real do parente retirada de rede social pública' },
      { label: 'DDD do Número', value: 'DDD de outro estado diferente da família' },
      { label: 'Chave Pix informada', value: 'CPF de uma pessoa desconhecida' },
    ],
    isScam: true,
    redFlags: [
      'Uso de número desconhecido alegando que "trocou de aparelho".',
      'Urgência excessiva para que a vítima não tenha tempo de pensar.',
      'Chave Pix em nome de um terceiro desconhecido.',
      'Desculpas para não atender ligações normais ou chamadas de vídeo.',
    ],
    explanation:
      'Este é o golpe financeiro número 1 no Brasil (mais de 150 mil casos anuais). Os golpistas pegam fotos de perfil em redes sociais abertas e criam contas falsas se passando por filhos ou parentes para extorquir dinheiro com histórias de emergência.',
    realWorldTip:
      'Regra de Ouro da Febraban: Nunca faça transferências para alguém que alega ser seu parente em um número novo sem antes LIGAR para o número antigo ou fazer uma chamada de vídeo para confirmar o rosto e a voz.',
  },
  {
    id: 'case-2-correios',
    level: 'basico',
    levelTitle: 'Nível Básico',
    xpReward: 50,
    category: 'SMS & Encomendas',
    title: 'Taxa Alfandegária de Encomenda Retida',
    sender: 'CORREIOS_AVISO',
    channel: 'sms',
    time: '09:15',
    preview: 'CORREIOS: Objeto internacional retido por pendência...',
    messageContent:
      'CORREIOS: Sua encomenda internacional LK8492019BR foi retida na fiscalização aduaneira por pendência tributária de R$ 28,40. Efetue o pagamento hoje para evitar devolução ao remetente: https://correios-rastreio-taxa.net/pagamento',
    extraDetails: [
      { label: 'Remetente', value: 'SMS de número curto desconhecido' },
      { label: 'Link fornecido', value: 'correios-rastreio-taxa.net (não oficial)' },
    ],
    isScam: true,
    redFlags: [
      'O link termina em ".net" em vez do domínio governamental/oficial "correios.com.br".',
      'Os Correios não mandam SMS com cobrança de Pix direto para links encurtados.',
      'Ameaça de "devolução imediata" para forçar a vítima a pagar por impulso.',
    ],
    explanation:
      'Golpe de Phishing por SMS extremamente comum entre pessoas que compram na internet (Shopee, Shein, AliExpress). A página falsa imita o site dos Correios e gera um Pix que vai direto para a conta dos estelionatários.',
    realWorldTip:
      'Para conferir qualquer taxa de encomenda, acesse EXCLUSIVAMENTE o site oficial dos Correios (correios.com.br) ou o aplicativo oficial na área "Minhas Importações". Nunca clique em links recebidos por SMS.',
  },
  {
    id: 'case-3-legit-2fa',
    level: 'basico',
    levelTitle: 'Nível Básico',
    xpReward: 50,
    category: 'Segurança Real',
    title: 'Notificação Oficial de Código de Verificação (2FA)',
    sender: 'Banco Digital (Canal Oficial)',
    channel: 'sms',
    time: '11:03',
    preview: 'Seu código de acesso é 839-102. Não compartilhe...',
    messageContent:
      'BANCO: Seu código de segurança para acesso à conta é 839-102. ATENÇÃO: Nossos atendentes NUNCA pedem este código por telefone ou mensagem. Se você não solicitou este acesso, abra o app do banco e altere sua senha.',
    extraDetails: [
      { label: 'Link externo', value: 'Nenhum link enviado' },
      { label: 'Pedido de resposta', value: 'Não solicita resposta por mensagem' },
    ],
    isScam: false,
    redFlags: [],
    explanation:
      'Esta é uma notificação legítima de segurança! Observe que ela não possui nenhum link suspeito, não pede para você ligar para nenhum 0800 e avisa expressamente que funcionários do banco nunca solicitam esse código.',
    realWorldTip:
      'Mensagens legítimas de autenticação em 2 etapas não contêm links de pagamento nem pedem para você repassar o token para ninguém. Guarde esse código sempre com você.',
  },

  // ==========================================
  // NIVEL 2: MEDIO (Engenharia Social / Lojas / Bancos)
  // ==========================================
  {
    id: 'case-4-falsa-central',
    level: 'medio',
    levelTitle: 'Nível Médio',
    xpReward: 100,
    category: 'Golpe Bancário & Falsa Central',
    title: 'Falsa Notificação de Compra de R$ 3.850 e Central 0800',
    sender: 'ALERTA_BANCARIO',
    channel: 'sms',
    time: '16:40',
    preview: 'Compra aprovada de R$ 3.850,00 nas Casas Bahia...',
    messageContent:
      'BANCO INFORMA: Compra aprovada de R$ 3.850,00 no Magazine Luiza em 27/09 às 16:35. Caso NÃO reconheça esta transação, ligue imediatamente para nossa Central de Fraudes no 0800-878-1920.',
    extraDetails: [
      { label: 'Telefone informado', value: '0800-878-1920' },
      { label: 'Efeito psicológico', value: 'Desespero ao ver uma cobrança alta inexistente' },
    ],
    isScam: true,
    redFlags: [
      'O banco não envia SMS mandando ligar para um número 0800 desconhecido.',
      'O 0800 é contratado pelos próprios criminosos, com som de call center simulado.',
      'Na ligação, o falso atendente diz que para "bloquear a compra", você deve fazer um Pix temporário para uma "conta de segurança".',
    ],
    explanation:
      'O golpe da Falsa Central de Atendimento é um dos mais lesivos no Brasil. Ao ligar para o 0800, falsos atendentes muito bem treinados induzem a vítima a transferir seu dinheiro para os golpistas sob o pretexto de "estorno de segurança".',
    realWorldTip:
      'Bancos NUNCA pedem para você fazer um Pix para cancelar outro Pix ou compra! Se receber mensagem de compra suspeita, não ligue para o número do SMS: abra o aplicativo do seu banco ou ligue para o número impresso no verso do seu cartão físico.',
  },
  {
    id: 'case-5-falsa-loja',
    level: 'medio',
    levelTitle: 'Nível Médio',
    xpReward: 100,
    category: 'Redes Sociais & Falsa Loja',
    title: 'Anúncio Patrocinado com Preço Irreal no Instagram',
    sender: 'MegaEletro_Brasil (Anúncio Patrocinado)',
    channel: 'social',
    time: '18:10',
    preview: 'QUEIMA DE ESTOQUE: iPhone 15 Pro Max por R$ 1.199...',
    messageContent:
      '🔥 MEGA LIQUIDAÇÃO DE ANIVERSÁRIO! Lotes de importação apreendidos com 75% de desconto. iPhone 15 Pro Max 256GB lacrado com nota fiscal: de R$ 7.999 por apenas R$ 1.199,00! Pagamento exclusivo via Pix com envio imediato. Restam apenas 4 unidades!',
    extraDetails: [
      { label: 'Preço anunciado', value: 'R$ 1.199 (Valor real de mercado: ~R$ 7.000)' },
      { label: 'Forma de pagamento', value: 'Apenas Pix (sem cartão ou proteção de estorno)' },
      { label: 'Comentários no post', value: 'Comentários desativados na publicação' },
    ],
    isScam: true,
    redFlags: [
      'Preço milagroso (desconto de mais de 70% em eletrônicos de ponta).',
      'Urgência forçada ("Restam apenas 4 unidades").',
      'Exigência de pagamento exclusivamente via Pix à vista.',
      'Comentários da postagem desativados para esconder alertas de outras vítimas.',
    ],
    explanation:
      'O golpe da falsa loja de rede social lidera as queixas de consumo. Os criminosos pagam anúncios para promover páginas falsas que usam marcas copiadas. O dinheiro cai na conta do golpista e o produto nunca é enviado.',
    realWorldTip:
      'Desconfie imediatamente de preços "bons demais para ser verdade". Antes de comprar em lojas desconhecidas, confira a reputação no site Reclame Aqui e cheque o CNPJ da empresa no site da Receita Federal.',
  },
  {
    id: 'case-6-falso-emprego',
    level: 'medio',
    levelTitle: 'Nível Médio',
    xpReward: 100,
    category: 'Vagas & Emprego Fácil',
    title: 'Vaga de Trabalho Home Office: Ganhe R$ 300 Curtindo Vídeos',
    sender: 'Recrutadora Sofia (Global Marketing)',
    channel: 'whatsapp',
    time: '10:45',
    preview: 'Olá! Temos vagas de meio período home office para...',
    messageContent:
      'Olá! Sou Sofia da agência de marketing digital Global Influencer. Selecionamos o seu perfil para trabalhar de casa apenas 1 hora por dia avaliando produtos e curtindo vídeos no YouTube. Remuneração diária de R$ 200 a R$ 600 via Pix. Clique no link para falar com nosso gerente no Telegram e começar sua primeira tarefa!',
    extraDetails: [
      { label: 'Requisitos exigidos', value: 'Nenhum requisito profissional' },
      { label: 'Canal de migração', value: 'Pede para migrar para grupo anônimo no Telegram' },
    ],
    isScam: true,
    redFlags: [
      'Oferta de emprego não solicitada enviada por número estrangeiro (+234, +1, etc.).',
      'Promessa de ganhos elevados por tarefas banais (curtir vídeos).',
      'Migração forçada para grupos de Telegram sem identificação corporativa.',
      'Após tarefas iniciais, exigem que a vítima deposite dinheiro para "desbloquear saques".',
    ],
    explanation:
      'O "Golpe das Tarefas" atinge principalmente adolescentes e desempregados. No começo, os golpistas chegam a transferir R$ 10 ou R$ 20 para passar credibilidade. Depois, exigem depósitos crescentes de R$ 500 a R$ 3.000 para "subir de nível VIP", sumindo com todo o dinheiro.',
    realWorldTip:
      'Nenhuma empresa séria cobra dinheiro de candidatos para trabalhar ou liberar salários. Se uma vaga oferece ganhos altos sem processo seletivo claro, é golpe garantido.',
  },

  // ==========================================
  // NIVEL 3: AVANCADO (Mão Fantasma / Falso Boleto / Bug do Pix)
  // ==========================================
  {
    id: 'case-7-mao-fantasma',
    level: 'avancado',
    levelTitle: 'Nível Avançado',
    xpReward: 150,
    category: 'Acesso Remoto & Invasão',
    title: 'Golpe da "Mão Fantasma" (Falso Suporte Técnico)',
    sender: 'Suporte de Segurança Bancária',
    channel: 'call',
    time: '15:20',
    preview: 'Ligação do Suporte: "Identificamos um vírus invadindo sua conta..."',
    messageContent:
      'Voz do atendente: "Senhor(a), nosso sistema de inteligência detectou uma tentativa de invasão na sua conta corrente. Para remover o arquivo malicioso e limpar o token de segurança, por favor abra a Google Play Store no seu celular e baixe o aplicativo de suporte AnyDesk ou QuickSupport. Vou lhe passar um código de 9 dígitos para autorizar nossa equipe a fazer a limpeza."',
    extraDetails: [
      { label: 'Ambiente sonoro', value: 'Ruído de call center e música de espera idêntica à do banco' },
      { label: 'Ação solicitada', value: 'Instalar aplicativo AnyDesk / TeamViewer QuickSupport' },
    ],
    isScam: true,
    redFlags: [
      'Solicitação para baixar aplicativos de controle remoto (AnyDesk, TeamViewer, RustDesk).',
      'Pedido para informar o código de conexão gerado pelo app.',
      'Alegação dramática de que a conta bancária está "sendo invadida agora".',
    ],
    explanation:
      'No golpe da Mão Fantasma, o aplicativo instalado dá controle visual e remoto total do smartphone para o fraudador. Enquanto o golpista conversa, ele acessa o app do banco na tela da vítima, transfere saldos e solicita empréstimos em segundos.',
    realWorldTip:
      'NENHUM banco solicita que clientes instalem aplicativos de suporte remoto em seus celulares. Se alguém pedir para você baixar AnyDesk ou similar dizendo ser do seu banco, desligue imediatamente.',
  },
  {
    id: 'case-8-falso-boleto',
    level: 'avancado',
    levelTitle: 'Nível Avançado',
    xpReward: 150,
    category: 'Fraude Financeira & Boletos',
    title: 'Boleto Falso com Beneficiário Adulterado',
    sender: 'Fatura Mensal (E-mail: cobranca@operadora-aviso.com)',
    channel: 'document',
    time: '08:30',
    preview: 'Segunda via da sua fatura de internet com desconto...',
    messageContent:
      'Prezado cliente, segue em anexo a 2ª via da sua fatura de internet e celular com desconto especial de pontualidade de 20%. Para garantir o desconto, pague o boleto bancário anexo até a data de hoje.\n\nLinha Digitável: 23793.38128 60002.819203 12093.810293 8 98210000012000',
    extraDetails: [
      { label: 'Logotipo impresso', value: 'Logo idêntico da empresa prestadora de serviços' },
      { label: 'Beneficiário na tela de pagamento', value: 'SOLUCOES PAGAMENTOS DIGITAIS LTDA (CNPJ desconhecido)' },
      { label: 'Empresa real', value: 'Telefônica Brasil S.A. / Claro S.A.' },
    ],
    isScam: true,
    redFlags: [
      'E-mail do remetente não é do domínio oficial da empresa (usa provedores paralelos).',
      'Oferta de desconto atípico para pagamento imediato.',
      'Na tela de confirmação do banco, o nome do beneficiário final NÃO é a empresa prestadora do serviço.',
    ],
    explanation:
      'Criminosos interceptam rotinas de cobrança ou enviam e-mails em massa simulando contas de luz, telefone ou condomínio. O código de barras adulterado desvia o dinheiro para a conta de um terceiro ou de uma fintech golpista.',
    realWorldTip:
      'Ao pagar qualquer boleto no aplicativo do banco, NUNCA confirme a operação sem ler a tela final de comprovante. Verifique sempre se o nome e o CNPJ do beneficiário são exatamente os da empresa contratada.',
  },
  {
    id: 'case-9-robo-pix',
    level: 'avancado',
    levelTitle: 'Nível Avançado',
    xpReward: 150,
    category: 'Engenharia Social & Promessa Milagrosa',
    title: 'O Golpe do "Bug do Pix" / Multiplicação de Saldo',
    sender: 'Canal Segredos do Lucro (Redes Sociais)',
    channel: 'social',
    time: '20:00',
    preview: 'NOVO BUG DO PIX FUNCIONANDO: Envie R$ 50 e receba R$ 500...',
    messageContent:
      '🚨 BRECHA DESCOBERTA NO SISTEMA DO BANCO CENTRAL! O algoritmo de compensação do Pix está com falha de estorno duplo. Se você transferir qualquer valor entre R$ 50 e R$ 500 para a chave Pix de homologação: [ falha-bc-estorno@pix-central.me ], o sistema entende como erro e estorna DEZ VEZES o valor na sua conta em 3 minutos! Testado e aprovado hoje!',
    extraDetails: [
      { label: 'Prova apresentada', value: 'Prints forjados de extratos bancários com saldo subindo' },
      { label: 'Chave Pix informada', value: 'Chave de e-mail ou aleatória de conta de pessoa física' },
    ],
    isScam: true,
    redFlags: [
      'Promessa absurda de retorno financeiro imediato e multiplicação de dinheiro.',
      'Alegação falsa de "brecha ou bug no Banco Central".',
      'Chave Pix de destino controlada diretamente pelos estelionatários.',
    ],
    explanation:
      'Não existe "bug do Pix", "robô do Pix" ou falha de sistema que multiplique valores. Esse golpe explora a ingenuidade ou a ganância da vítima, que envia o dinheiro por vontade própria acreditando em um milagre financeiro.',
    realWorldTip:
      'O Banco Central do Brasil nunca disponibiliza chaves de teste para o público. Transferências via Pix são instantâneas e irreversíveis. Dinheiro fácil na internet não existe: se pedem para enviar um valor para receber mais, é golpe.',
  },
];
