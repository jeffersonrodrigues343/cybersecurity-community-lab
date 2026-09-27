export type ScamLevel = 'basico' | 'medio' | 'avancado';

export interface InvestigativeClue {
  id: string;
  name: string;
  buttonLabel: string;
  category: 'whois' | 'pix' | 'phone' | 'behavior' | 'system';
  question: string;
  evidenceResult: {
    status: 'suspicious' | 'clean';
    headline: string;
    details: string;
    forensicFact: string;
  };
}

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
  clues: InvestigativeClue[];
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
      'Oi mãe! Salva meu número novo aí, por favor. O meu celular antigo caiu no chão e parou de funcionar. Tô usando esse provisório.\n\nPreciso muito de um favor urgente: tenho que pagar uma conta da faculdade até às 15h e meu app do banco ainda não autorizou nesse aparelho. Consegue me transferir um Pix de R$ 480 agora? Te devolvo assim que chegar em casa!\n\nChave Pix: 489.120.392-80',
    clues: [
      {
        id: 'clue-1-ddd',
        name: 'Checagem do DDD e Linha Telefônica',
        buttonLabel: '🔍 Checar DDD do Número',
        category: 'phone',
        question: 'De onde é esse número e quando a linha foi ativada?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'DDD incompatível e chip pré-pago recém-ativado!',
          details: 'A linha é do DDD (85) - Ceará, enquanto toda a família reside em São Paulo (11). O chip foi cadastrado há menos de 48 horas em nome de terceiro.',
          forensicFact: 'Criminosos adquirem chips pré-pagos descartáveis aos montes para aplicar golpes do novo número antes que a linha seja bloqueada.',
        },
      },
      {
        id: 'clue-1-pix',
        name: 'Consulta da Chave Pix (Banco Central)',
        buttonLabel: '💳 Consultar Titular do Pix',
        category: 'pix',
        question: 'Quem é o verdadeiro dono da conta que vai receber o dinheiro?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Chave Pix pertence a uma pessoa totalmente desconhecida!',
          details: 'A chave CPF pertence a "Marcos Vinicius de Souza" no Banco Digital PagBank. Não tem nenhuma ligação com sua filha ou com a faculdade.',
          forensicFact: 'Contas de laranjas ("money mules") são alugadas ou criadas com documentos falsos para receber o dinheiro do golpe e pulverizar o saldo em segundos.',
        },
      },
      {
        id: 'clue-1-voice',
        name: 'Tentativa de Chamada de Voz / Vídeo',
        buttonLabel: '📞 Ligar para Confirmar a Voz',
        category: 'behavior',
        question: 'O que acontece ao tentar ligar para este número?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Chamada recusada imediatamente com desculpa!',
          details: 'A pessoa rejeitou a chamada e mandou texto: "Mãe, não consigo atender agora, o microfone tá chiando muito, manda o comprovante por aqui!"',
          forensicFact: 'Golpistas sempre evitam chamadas em tempo real porque não conseguem imitar a voz e o rosto do parente verdadeiro.',
        },
      },
    ],
    isScam: true,
    redFlags: [
      'DDD diferente da residência da família.',
      'Chave Pix em nome de pessoa física desconhecida.',
      'Recusa em atender chamadas de voz ou vídeo.',
      'Pressão emocional com prazo curto ("até às 15h").',
    ],
    explanation:
      'Este é o golpe financeiro número 1 no Brasil. Criminosos obtêm fotos públicas em redes sociais e criam perfis falsos no WhatsApp se passando por parentes. A história de emergência visa impedir que a vítima pense com clareza.',
    realWorldTip:
      'Regra de Ouro da Febraban: Nunca transfira dinheiro para um parente que alega ter trocado de número sem antes ligar no NÚMERO ANTIGO dele ou fazer uma chamada de vídeo para ver o rosto da pessoa.',
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
    clues: [
      {
        id: 'clue-2-whois',
        name: 'Análise de Registro do Site (Whois)',
        buttonLabel: '🌐 Inspecionar Endereço do Link',
        category: 'whois',
        question: 'Quem é o dono desse site e quando ele foi criado?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Domínio falso criado há apenas 3 dias no exterior!',
          details: 'O site "correios-rastreio-taxa.net" foi registrado anonimamente em servidor na Islândia. O site oficial dos Correios brasileiros é estritamente "correios.com.br".',
          forensicFact: 'Órgãos governamentais e estatais no Brasil utilizam obrigatoriamente a terminação ".com.br" ou ".gov.br". Qualquer ".net", ".online" ou ".site" é fraude.',
        },
      },
      {
        id: 'clue-2-tracking',
        name: 'Consulta do Código no App Oficial dos Correios',
        buttonLabel: '📦 Conferir Código no App dos Correios',
        category: 'system',
        question: 'Esse código de rastreio LK8492019BR realmente existe?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Código de rastreio inexistente na base dos Correios!',
          details: 'Ao buscar o código "LK8492019BR" no sistema oficial dos Correios, o retorno é: "Objeto não encontrado na base de dados".',
          forensicFact: 'Os golpistas geram códigos aleatórios que imitam o padrão de letras e números internacionais (2 letras + 9 números + BR) para enganar quem comprou na Shopee ou Shein.',
        },
      },
      {
        id: 'clue-2-sms-policy',
        name: 'Política Oficial de Cobrança dos Correios',
        buttonLabel: '📋 Verificar Como os Correios Cobram',
        category: 'behavior',
        question: 'Os Correios mandam link por SMS para pagar taxa via Pix?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Os Correios NUNCA mandam link de pagamento por SMS!',
          details: 'A cobrança de taxas de importação (despacho postal) só pode ser paga dentro do portal logado "Minhas Importações" no site oficial correios.com.br.',
          forensicFact: 'O CERT.br já emitiu alerta nacional sobre campanhas massivas de SMS maliciosos usando o nome dos Correios.',
        },
      },
    ],
    isScam: true,
    redFlags: [
      'Link com final ".net" em vez do site oficial correios.com.br.',
      'Código de rastreio não existe no sistema oficial.',
      'Cobrança por link direto em SMS contraria a política dos Correios.',
    ],
    explanation:
      'Golpe de pescaria digital (Phishing). Os criminosos aproveitam o hábito dos brasileiros de comprar em e-commerces internacionais para disparar milhões de SMS com falsas taxas alfandegárias.',
    realWorldTip:
      'Para conferir qualquer taxa de encomenda, acesse EXCLUSIVAMENTE o site oficial dos Correios (correios.com.br) ou o app oficial. Jamais clique em links de cobrança recebidos por mensagem.',
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
    clues: [
      {
        id: 'clue-3-links',
        name: 'Verificação de Links e Endereços Externos',
        buttonLabel: '🔍 Checar se Há Links Suspeitos',
        category: 'whois',
        question: 'A mensagem pede para clicar em algum site externo?',
        evidenceResult: {
          status: 'clean',
          headline: 'Nenhum link enviado! Procedimento 100% seguro.',
          details: 'A mensagem contém apenas o código numérico. Não há URLs, encurtadores de link ou arquivos para baixar.',
          forensicFact: 'Mensagens verdadeiras de token 2FA nunca precisam de links externos: o código deve ser digitado na tela onde você mesmo estava fazendo o login.',
        },
      },
      {
        id: 'clue-3-safety-warning',
        name: 'Aviso de Segurança Institucional',
        buttonLabel: '🛡️ Analisar o Aviso da Mensagem',
        category: 'system',
        question: 'O que o banco orienta sobre o código?',
        evidenceResult: {
          status: 'clean',
          headline: 'Alerta preventivo: "Nossos atendentes NUNCA pedem este código"',
          details: 'O próprio banco reforça que ninguém tem autorização para pedir esse número, e orienta a mudar a senha no app oficial caso não tenha sido você.',
          forensicFact: 'Mecanismos legítimos de 2FA protegem o usuário. Golpistas tentam fazer o oposto: ligam pedindo para a vítima ditar o código para invadir a conta.',
        },
      },
      {
        id: 'clue-3-timing',
        name: 'Linha do Tempo da Ação do Usuário',
        buttonLabel: '⏱️ Checar se Você Solicitou o Acesso',
        category: 'behavior',
        question: 'Você acabou de tentar entrar no aplicativo do banco?',
        evidenceResult: {
          status: 'clean',
          headline: 'O token coincide exatamente com a tentativa de login legítima!',
          details: 'Você estava logando no internet banking no computador e o app solicitou a confirmação em duas etapas no celular.',
          forensicFact: 'Se você receber um token sem ter tentado logar, alguém sabe sua senha, mas não conseguiu entrar porque o 2FA bloqueou!',
        },
      },
    ],
    isScam: false,
    redFlags: [],
    explanation:
      'Esta é uma notificação legítima de segurança! Ela não possui links, não pede dados por resposta e traz aviso explícito de que funcionários nunca solicitam o código.',
    realWorldTip:
      'Mensagens verdadeiras de autenticação em duas etapas (2FA) são para seu próprio uso. Jamais repasse esse código por telefone ou mensagem para ninguém, mesmo que a pessoa diga ser do banco.',
  },

  // ==========================================
  // NIVEL 2: MEDIO (Falsa Central / Lojas / Vagas)
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
    clues: [
      {
        id: 'clue-4-app-statement',
        name: 'Checagem no Extrato Oficial do Banco',
        buttonLabel: '📱 Abrir App Oficial do Banco e Ver Extrato',
        category: 'system',
        question: 'Essa compra de R$ 3.850 realmente aparece no extrato da sua conta?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Nenhuma compra lançada no extrato nem limite retido!',
          details: 'Ao abrir o app oficial do seu banco, o extrato não mostra nenhuma compra de R$ 3.850,00 e o limite do cartão continua intacto.',
          forensicFact: 'A compra nunca aconteceu. O falso aviso de valor alto é uma armadilha psicológica de pânico para fazer a vítima ligar no 0800 sem pensar.',
        },
      },
      {
        id: 'clue-4-0800-owner',
        name: 'Investigação do Número 0800-878-1920',
        buttonLabel: '📞 Investigar Quem Registrou o 0800',
        category: 'phone',
        question: 'Esse número 0800 pertence a algum banco brasileiro?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Número 0800 contratado por estelionatários via VoIP!',
          details: 'Qualquer pessoa pode alugar um número 0800 pela internet pagando R$ 50. Esse número direciona para uma central telefônica clandestina com música de espera gravada.',
          forensicFact: 'A Anatel e a Febraban alertam: criminosos criaram falsas centrais telefônicas completas com menus de "Digite 1, Digite 2" para simular o banco.',
        },
      },
      {
        id: 'clue-4-scam-mechanic',
        name: 'Procedimento Exigido pelo "Atendente"',
        buttonLabel: '🕵️ Descobrir o Que o Atendente Pede',
        category: 'behavior',
        question: 'O que o suposto funcionário do banco diz quando você liga?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'O atendente pede para você fazer um Pix para "estornar o valor"!',
          details: 'Ele afirma: "Para cancelar o golpe, o senhor precisa transferir o mesmo valor para a chave de segurança do Banco Central". Isso é 100% golpe!',
          forensicFact: 'Bancos JAMAIS pedem para clientes realizarem transferências Pix ou digitarem senhas para cancelar operações suspeitas.',
        },
      },
    ],
    isScam: true,
    redFlags: [
      'Compra não consta no aplicativo oficial do banco.',
      'Instrução para ligar em um 0800 desconhecido.',
      'Falso atendente solicita transferência Pix para "estorno de segurança".',
    ],
    explanation:
      'O golpe da Falsa Central de Atendimento é um dos mais perigosos no Brasil (mais de 105 mil ocorrências). O objetivo é assustar a vítima com uma compra alta falsa para fazê-la ligar para os criminosos e transferir dinheiro por vontade própria.',
    realWorldTip:
      'Recebeu SMS de compra suspeita? Nunca ligue para o número informado na mensagem. Abra o aplicativo do seu banco ou ligue exclusivamente para o telefone impresso no verso do seu cartão físico.',
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
    clues: [
      {
        id: 'clue-5-price-benchmark',
        name: 'Comparativo de Preço Real de Mercado',
        buttonLabel: '🏷️ Comparar Preço com Lojas Oficiais',
        category: 'behavior',
        question: 'Quanto custa esse produto nas lojas autorizadas?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Preço 85% abaixo do custo de fabricação da Apple!',
          details: 'Nas lojas oficiais, o aparelho custa entre R$ 7.000 e R$ 8.500. Nenhuma empresa comercializa produtos novos com 85% de desconto.',
          forensicFact: 'Preço milagroso ("bom demais para ser verdade") é o anzol mais clássico do estelionato em redes sociais.',
        },
      },
      {
        id: 'clue-5-reclame-aqui',
        name: 'Checagem no Reclame Aqui e CNPJ',
        buttonLabel: '📋 Consultar CNPJ e Reclame Aqui',
        category: 'whois',
        question: 'A empresa "MegaEletro Brasil" existe legalmente?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'CNPJ clonado e centenas de queixas de "produto não entregue"!',
          details: 'O CNPJ no rodapé pertence a uma padaria em Curitiba que teve seus dados roubados. No Reclame Aqui há dezenas de denúncias de golpe nos últimos 7 dias.',
          forensicFact: 'Golpistas copiam CNPJ de pequenas empresas ativas para passar uma falsa impressão de legalidade em lojas virtuais fictícias.',
        },
      },
      {
        id: 'clue-5-comments',
        name: 'Auditoria dos Comentários da Publicação',
        buttonLabel: '💬 Inspecionar Comentários do Post',
        category: 'system',
        question: 'Por que não há comentários de clientes na postagem?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Comentários bloqueados para impedir denúncias de vítimas!',
          details: 'A postagem tem milhares de curtidas compradas, mas o campo de comentários está bloqueado ou filtrado apenas com emojis genéricos.',
          forensicFact: 'Lojas falsas desativam comentários para evitar que vítimas lesadas avisem aos outros usuários nos comentários.',
        },
      },
    ],
    isScam: true,
    redFlags: [
      'Preço 85% abaixo do mercado em produto de alta procura.',
      'Pagamento exclusivo via Pix (sem intermediação de cartão com estorno).',
      'Comentários bloqueados no anúncio.',
      'Urgência forçada ("restam apenas 4 unidades").',
    ],
    explanation:
      'Golpe da falsa loja virtual em redes sociais (150 mil casos registrados). Os criminosos pagam anúncios para promover páginas falsas que clonam o layout de grandes varejistas. O dinheiro vai para contas de laranjas e a mercadoria nunca existe.',
    realWorldTip:
      'Sempre desconfie de promoções inacreditáveis nas redes sociais. Antes de comprar em lojas desconhecidas, confira a reputação no Reclame Aqui e prefira métodos de pagamento com proteção contra fraudes.',
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
    clues: [
      {
        id: 'clue-6-ddi',
        name: 'Checagem do DDI do Remetente',
        buttonLabel: '🌍 Inspecionar Código do País (DDI)',
        category: 'phone',
        question: 'De qual país veio essa mensagem de WhatsApp?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Número de telefone da Nigéria ou Indonésia (+234 / +62)!',
          details: 'A recrutadora diz ser de uma agência de marketing no Brasil, mas a mensagem foi enviada por um número com DDI internacional estrangeiro.',
          forensicFact: 'Quadrilhas internacionais utilizam automação no WhatsApp com números comprados em países sem regulação para aplicar o "Golpe das Tarefas".',
        },
      },
      {
        id: 'clue-6-telegram',
        name: 'Investigação do Grupo no Telegram',
        buttonLabel: '👥 Investigar o Grupo no Telegram',
        category: 'system',
        question: 'Como funciona o grupo para onde eles te mandam?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Grupo controlado por bots que postam comprovantes falsos!',
          details: 'No Telegram, vários participantes falsos (bots) postam prints dizendo "Acabei de receber R$ 1.500!". O grupo exige que você faça depósitos para "subir de nível".',
          forensicFact: 'No início, eles pagam R$ 10 ou R$ 20 para fazer a vítima acreditar. Em seguida, exigem um depósito de R$ 500 para liberar o pagamento acumulado.',
        },
      },
      {
        id: 'clue-6-hiring-logic',
        name: 'Lógica Econômica da Contratação',
        buttonLabel: '💼 Analisar o Modelo de Negócio',
        category: 'behavior',
        question: 'Faz sentido econômico uma empresa pagar R$ 600 por dia para curtir vídeos?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Modelo de negócio inexistente: Ninguém paga R$ 18.000/mês para curtir vídeos!',
          details: 'Plataformas como YouTube e TikTok combatem ativamente curtidas falsas. Nenhuma empresa pagaria valores exorbitantes por uma ação que qualquer algoritmo faz de graça.',
          forensicFact: 'O golpe das tarefas é uma pirâmide financeira disfarçada de trabalho remoto, visando jovens e pessoas desempregadas.',
        },
      },
    ],
    isScam: true,
    redFlags: [
      'Remetente com DDI internacional estrangeiro.',
      'Promessa de ganhos absurdos sem entrevista ou qualificação.',
      'Migração obrigatória para grupos no Telegram.',
      'Exigência de depósitos em dinheiro para liberar saques.',
    ],
    explanation:
      'O Golpe das Tarefas cresceu vertiginosamente entre jovens e estudantes. A promessa de dinheiro fácil atrai a vítima, que é ludibriada com pequenas recompensas iniciais antes de ser coagida a depositar valores altos.',
    realWorldTip:
      'Nenhuma empresa séria cobra dinheiro de candidatos para trabalhar nem oferece salários altos para atividades simples como curtir posts. Se pedirem depósito para liberar pagamento, fuja imediatamente.',
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
    clues: [
      {
        id: 'clue-7-permissions',
        name: 'Análise das Permissões do Aplicativo AnyDesk',
        buttonLabel: '📱 Analisar o Que o Aplicativo AnyDesk Faz',
        category: 'system',
        question: 'O que o AnyDesk ou QuickSupport realmente faz quando instalado?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'O aplicativo dá CONTROLE REMOTO TOTAL da tela do seu celular para outra pessoa!',
          details: 'AnyDesk e TeamViewer são softwares legítimos de suporte empresarial para computadores. Quando instalados no celular, permitem que outra pessoa veja tudo o que você digita e clique na tela à distância.',
          forensicFact: 'Com esse app, o golpista assiste você abrindo o banco, vê sua senha digitada e faz transferências Pix enquanto a tela fica preta.',
        },
      },
      {
        id: 'clue-7-bank-policy',
        name: 'Procedimento Oficial dos Bancos em Caso de Invasão',
        buttonLabel: '🛡️ Checar Como os Bancos Tratam Invasões',
        category: 'behavior',
        question: 'Como um banco de verdade age quando detecta fraude?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Bancos bloqueiam o aplicativo internamente, NUNCA pedem apps de terceiros!',
          details: 'Se houver fraude, os sistemas do banco bloqueiam a conta no servidor central e pedem que o cliente compareça a uma agência ou refaça a biometria facial no próprio app do banco.',
          forensicFact: 'Nenhum banco brasileiro tem parceria ou utiliza AnyDesk, TeamViewer ou RustDesk para atendimento a clientes.',
        },
      },
      {
        id: 'clue-7-pin-code',
        name: 'O Código de 9 Dígitos Solicitado',
        buttonLabel: '🔑 Analisar o Código de Conexão Solicitado',
        category: 'phone',
        question: 'Para que serve o código numérico que o falso atendente pediu?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'O código é a CHAVE DE ACESSO que conecta o celular do golpista ao seu!',
          details: 'Ao ditar esse código, você autoriza o criminoso a se conectar diretamente ao seu aparelho, assumindo o controle do sistema Android/iOS.',
          forensicFact: 'Esse golpe recebeu o nome de "Mão Fantasma" porque a vítima vê os menus do celular se mexendo sozinhos na tela sem que ela encoste no aparelho.',
        },
      },
    ],
    isScam: true,
    redFlags: [
      'Pedido para instalar aplicativos de acesso remoto (AnyDesk, QuickSupport, TeamViewer).',
      'Solicitação de código de autorização de compartilhamento de tela.',
      'Terror psicológico afirmando que a conta está "sendo invadida agora".',
    ],
    explanation:
      'O Golpe da Mão Fantasma é um dos mais sofisticados do país. O fraudador não precisa hackear o banco: ele convence a própria vítima a instalar uma ferramenta que entrega o celular de bandeja aos criminosos.',
    realWorldTip:
      'NENHUM banco pede para instalar aplicativos de suporte para fazer varredura no celular. Se algum suposto atendente pedir para baixar AnyDesk, TeamViewer ou qualquer programa de suporte, DESLIGUE NA HORA.',
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
    clues: [
      {
        id: 'clue-8-sender-domain',
        name: 'Investigação do E-mail do Remetente',
        buttonLabel: '📧 Inspecionar E-mail do Remetente',
        category: 'whois',
        question: 'Quem realmente enviou esse e-mail?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'E-mail enviado por servidor falso e não pela operadora!',
          details: 'O e-mail veio de "cobranca@operadora-aviso.com". O domínio oficial da operadora é claro.com.br ou vivo.com.br. O remetente é um domínio pirata criado para disparar spam.',
          forensicFact: 'Boletos falsos são enviados após vazamentos de dados cadastrais, onde os criminosos sabem exatamente qual operadora ou serviço você contrata.',
        },
      },
      {
        id: 'clue-8-beneficiary',
        name: 'Checagem do Beneficiário Final na Tela do Banco',
        buttonLabel: '🏦 Simular Leitura do Boleto no App do Banco',
        category: 'pix',
        question: 'Quem é o favorecido que vai receber o dinheiro do boleto?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Beneficiário final é "PAGAMENTOS DIGITAIS LTDA" e não a operadora!',
          details: 'No boleto impresso há o logotipo da operadora, mas ao ler o código de barras no banco, o destinatário do pagamento é uma empresa de fachada com conta em banco digital.',
          forensicFact: 'A linha digitável do boleto possui campos que definem o banco e a conta de destino. Criminosos alteram esses números para desviar o dinheiro para suas contas.',
        },
      },
      {
        id: 'clue-8-bank-code',
        name: 'Conferência do Código do Banco Emissor',
        buttonLabel: '🔍 Checar os Primeiros Dígitos da Linha',
        category: 'system',
        question: 'Os primeiros 3 dígitos da linha digitável coincidem com o banco do boleto?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Incoerência entre o banco do logotipo e o código de compensação!',
          details: 'O logotipo do boleto exibe Banco do Brasil (código 001), mas a linha digitável começa com 237 (Bradesco) e liquida em conta de pagamento.',
          forensicFact: 'Os 3 primeiros dígitos de qualquer boleto bancário representam o código oficial do banco na Câmara de Compensação (001: BB, 237: Bradesco, 104: Caixa, 033: Santander, 341: Itaú).',
        },
      },
    ],
    isScam: true,
    redFlags: [
      'E-mail do remetente com domínio falso.',
      'Beneficiário na tela de pagamento é diferente da empresa contratada.',
      'Divergência entre o código do banco na linha digitável e o logotipo.',
    ],
    explanation:
      'Golpe do boleto adulterado (mais de 13 mil ocorrências). Os golpistas forjam faturas com logos de grandes empresas de telecomunicações ou condomínios, alterando o código de barras para que o valor seja creditado na conta da quadrilha.',
    realWorldTip:
      'Ao pagar qualquer boleto no aplicativo do banco, NUNCA confirme a transação sem ler com atenção a tela final de comprovante. Confira se o nome e o CNPJ do beneficiário são exatamente os da empresa prestadora do serviço.',
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
    clues: [
      {
        id: 'clue-9-central-bank-api',
        name: 'Arquitetura e Segurança do Sistema Pix (Banco Central)',
        buttonLabel: '🏛️ Checar Como Funciona o Sistema do Pix',
        category: 'system',
        question: 'É tecnicamente possível existir um "bug" que multiplica dinheiro no Pix?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Impossibilidade matemática e bancária total!',
          details: 'O Sistema de Pagamentos Instantâneos (SPI) do Banco Central é auditado e funciona por balanço contábil estrito: cada R$ 1 que sai de uma conta é exatamente R$ 1 que entra na outra. Não há geração espontânea de saldo.',
          forensicFact: 'Toda transação no Pix possui rastreabilidade fim a fim com IDs criptográficos únicos (E2E ID). Não existem "chaves de teste que devolvem em dobro".',
        },
      },
      {
        id: 'clue-9-pix-key-owner',
        name: 'Investigação da Chave de Destino',
        buttonLabel: '💳 Consultar Quem é o Dono da Chave',
        category: 'pix',
        question: 'Quem recebe o dinheiro enviado para falha-bc-estorno@pix-central.me?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Chave Pix registrada em nome de pessoa física comum!',
          details: 'A chave de e-mail está vinculada a uma conta corrente de pessoa física ("Thiago Henrique...") em uma instituição financeira. O dinheiro cai direto no bolso do fraudador.',
          forensicFact: 'Os golpistas usam e-mails que contêm palavras como "bc", "pix", "central" para enganar leigos, mas a conta é de um indivíduo comum.',
        },
      },
      {
        id: 'clue-9-social-proof',
        name: 'Análise dos Vídeos e Provas de "Sucesso"',
        buttonLabel: '🎬 Inspecionar Provas e Prints do Vídeo',
        category: 'behavior',
        question: 'Os prints mostrando o saldo aumentando são reais?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Vídeos com saldo editado por ferramentas de edição gráfica!',
          details: 'Os vídeos são montagens onde o golpista edita o HTML da página do banco ou usa contas simuladas em aplicativos falsos para fingir que o saldo multiplicou.',
          forensicFact: 'Essa técnica de falsificação de prova social é usada há décadas, desde o "bilhete premiado" até o "robô do Pix" moderno.',
        },
      },
    ],
    isScam: true,
    redFlags: [
      'Promessa de retorno financeiro milagroso e multiplicação de saldo.',
      'Alegação absurda de "bug ou falha de homologação no Banco Central".',
      'Chave Pix pertencente a um estelionatário.',
    ],
    explanation:
      'O Golpe do Bug do Pix explora a ingenuidade e a ganância. O usuário transfere o valor acreditando em um suposto erro do sistema bancário, mas o Pix vai diretamente para a conta da quadrilha e nunca retorna.',
    realWorldTip:
      'Dinheiro fácil não existe na internet. Transferências via Pix são imediatas e definitivas. Qualquer promessa de "multiplicação de dinheiro", "robô do Pix" ou "bug de estorno" é 100% golpe.',
  },
];
