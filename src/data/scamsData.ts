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

export interface CasePedagogy {
  emotionalTrigger: string;
  kidsAnalogy: string;
  parentsGuide: string;
  adultRemedy: string;
  goldenRule: string;
}

export interface ScamCase {
  id: string;
  level: ScamLevel;
  levelTitle: string;
  xpReward: number;
  category: string;
  title: string;
  dilemma: string;
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
  pedagogy: CasePedagogy;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'detective' | 'family' | 'financial' | 'streak';
  rarity: 'bronze' | 'prata' | 'ouro' | 'platina';
  unlockedHint: string;
}

export interface PlayerRank {
  id: string;
  name: string;
  minXp: number;
  icon: string;
  color: string;
  pedagogicalTitle: string;
  summary: string;
}

export interface FamilyRule {
  id: string;
  target: 'kids' | 'parents' | 'elderly' | 'all';
  targetLabel: string;
  title: string;
  rule: string;
  practicalAction: string;
  icon: string;
}

export interface GlossaryItem {
  term: string;
  pronunciation?: string;
  simpleMeaning: string;
  realWorldExample: string;
  pedagogicalTip: string;
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
    dilemma: 'O contato diz ser seu filho com celular quebrado precisando de R$ 480 urgente para a faculdade. Emergência familiar real ou perfil falso com foto clonada?',
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
    pedagogy: {
      emotionalTrigger: 'Afeto Familiar e Pressão de Tempo (explora a preocupação instantânea de um pai/mãe ou avô querendo socorrer o filho em apuros).',
      kidsAnalogy: 'É como se um estranho colocasse uma máscara de papel com a foto do seu irmão, batesse no portão da escola e pedisse seu lanche dizendo que ele mandou buscar.',
      parentsGuide: 'Conversem em família e criem uma "Palavra-Passe Secreta da Casa" (ex: o nome do primeiro pet da família). Se alguém pedir dinheiro com número novo, deve falar a palavra secreta!',
      adultRemedy: 'Se transferiu: Acione imediatamente o MED (Mecanismo Especial de Devolução) no app do seu banco em até 80 dias, registre B.O. eletrônico e avise a família.',
      goldenRule: 'Parente pediu Pix por número novo? LIGUE IMEDIATAMENTE no número antigo dele antes de transferir qualquer centavo.',
    },
  },

  {
    id: 'case-2-correios',
    level: 'basico',
    levelTitle: 'Nível Básico',
    xpReward: 50,
    category: 'SMS & Encomendas',
    title: 'Taxa Alfandegária de Encomenda Retida',
    dilemma: 'Mensagem de taxa alfandegária para liberar encomenda internacional. Você costuma comprar online e o link parece com os Correios. Taxa real ou link de phishing?',
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
    pedagogy: {
      emotionalTrigger: 'Curiosidade e Medo de Perda (o usuário teme que seu pacote comprado online seja devolvido ou confiscado).',
      kidsAnalogy: 'É como um estranho na rua com um crachá falso dizendo que você só vai receber a figurinha que comprou se der R$ 10 reais para ele na mesma hora.',
      parentsGuide: 'Ensine aos filhos e idosos: compras online só são acompanhadas dentro do próprio aplicativo da loja (Shopee, Mercado Livre, Amazon) ou no app oficial dos Correios.',
      adultRemedy: 'Se digitou dados do cartão no link falso, bloqueie o cartão temporariamente no aplicativo do banco e solicite uma nova via física/virtual.',
      goldenRule: 'Correios e governo NUNCA cobram taxas por link direto de SMS. O pagamento é feito exclusivamente dentro do portal oficial correios.com.br.',
    },
  },

  {
    id: 'case-3-legit-2fa',
    level: 'basico',
    levelTitle: 'Nível Básico',
    xpReward: 50,
    category: 'Segurança Real',
    title: 'Notificação Oficial de Código de Verificação (2FA)',
    dilemma: 'SMS com código de 6 dígitos para autenticação bancária. A mensagem tem aviso para não compartilhar e vem de número curto. É tentativa de golpe ou verificação legítima?',
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
        id: 'clue-3-warning',
        name: 'Alerta de Proteção no Próprio Texto',
        buttonLabel: '🛡️ Analisar o Alerta de Segurança',
        category: 'behavior',
        question: 'O que o texto orienta sobre o compartilhamento do código?',
        evidenceResult: {
          status: 'clean',
          headline: 'Aviso explícito para NUNCA repassar o código a ninguém!',
          details: 'O próprio banco reforça que funcionários legítimos jamais solicitam esse código em atendimentos.',
          forensicFact: 'Golpistas tentam roubar tokens pedindo para a vítima ditar o código recebido. O aviso no texto previne exatamente esse ataque.',
        },
      },
      {
        id: 'clue-3-shortcode',
        name: 'Número do Remetente (Shortcode)',
        buttonLabel: '📱 Checar Número Curto (Shortcode)',
        category: 'phone',
        question: 'A mensagem veio de um celular comum de 11 dígitos ou de um número oficial?',
        evidenceResult: {
          status: 'clean',
          headline: 'Enviado por Shortcode oficial de 5 dígitos (28490)!',
          details: 'Grandes instituições bancárias utilizam shortcodes homologados pela ANATEL para disparo de SMS transacionais, e não chips pré-pagos comuns de 9 dígitos.',
          forensicFact: 'Shortcodes são canais auditados de alta confiabilidade contratados diretamente com as operadoras de telefonia brasileiras.',
        },
      },
    ],
    isScam: false,
    redFlags: [],
    explanation:
      'Esta mensagem é LEGÍTIMA. Trata-se de um código de autenticação de dois fatores (2FA) solicitado durante uma tentativa de login. A mensagem não possui links maliciosos e instrui explicitamente a não compartilhar o código com ninguém.',
    realWorldTip:
      'Mesmo em mensagens legítimas: NUNCA passe esse código para quem ligar para você pedindo confirmação. O código só deve ser digitado por você mesmo, diretamente na tela de login do aplicativo.',
    pedagogy: {
      emotionalTrigger: 'Transparência e Autoproteção (uma mensagem limpa, sem desespero nem promessas milagrosas).',
      kidsAnalogy: 'O código de segurança é como o segredo do seu diário trancado a chave: você nunca conta para ninguém que te pedir no recreio.',
      parentsGuide: 'Ensine que o SMS de 2FA só deve ser esperado quando você mesmo abriu o app e tentou fazer login. Se o código chegou do nada, alguém está tentando invadir: troque a senha imediatamente!',
      adultRemedy: 'Se um suposto funcionário do banco ligar pedindo este código, desligue imediatamente e reporte a tentativa de invasão pelo SAC oficial.',
      goldenRule: 'Código de SMS é pessoal e intransferível. Atendente nenhum do mundo precisa saber o seu código para te ajudar.',
    },
  },

  // ==========================================
  // NIVEL 2: MEDIO (Centrais Telefônicas / Redes Sociais)
  // ==========================================
  {
    id: 'case-4-falsa-central',
    level: 'medio',
    levelTitle: 'Nível Médio',
    xpReward: 100,
    category: 'Falsa Central 0800',
    title: 'Falsa Central Telefônica ("Compra Aprovada de R$ 3.850")',
    dilemma: 'O suposto atendente diz que seu cartão sofreu uma compra de R$ 3.850 nas Lojas Americanas e pede para ligar no 0800. Fraude bancária real em andamento ou falsa central telefônica?',
    sender: 'ALERTA_BANCO',
    channel: 'call',
    time: '16:45',
    preview: 'BANCO: Compra aprovada nas Lojas Americanas de R$ 3.850,00...',
    messageContent:
      'NOTIFICACAO BANCARIA: Compra aprovada no valor de R$ 3.850,00 em Lojas Americanas em 27/09 as 16:40. Caso nao reconheca esta transacao, ligue IMEDIATAMENTE para nossa Central de Seguranca: 0800 729 0192.',
    clues: [
      {
        id: 'clue-4-tollfree',
        name: 'Consulta da Titularidade do Número 0800',
        buttonLabel: '📞 Investigar Quem é o Dono do 0800',
        category: 'phone',
        question: 'Esse número 0800 pertence ao banco de verdade?',
        evidenceResult: {
          status: 'suspicious',
          headline: '0800 clandestino contratado em nome de empresa de fachada!',
          details: 'O número 0800 729 0192 foi alugado via telefonia VoIP em uma operadora virtual por uma empresa fantasma de consultoria, sem vínculo algum com o banco.',
          forensicFact: 'Hoje em dia qualquer pessoa física ou criminoso pode alugar um número 0800 pela internet pagando R$ 50 reais mensais em plataformas de telefonia em nuvem.',
        },
      },
      {
        id: 'clue-4-ivr',
        name: 'Teste da URA Eletrônica (Menu de Voz)',
        buttonLabel: '🎧 Escutar Gravação da Central Telefônica',
        category: 'behavior',
        question: 'Como funciona a gravação ao ligar para o número?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'URA idêntica à do banco com barulho falso de digitação ao fundo!',
          details: 'A gravação copia a voz original do banco e toca música de espera clássica. Quando um atendente falso atende, ele solicita que você "faça um Pix para uma conta de segurança do Banco Central".',
          forensicFact: 'O golpe da falsa central cresceu 40% no Brasil segundo a Febraban. Os atendentes são treinados com script profissional de call center.',
        },
      },
      {
        id: 'clue-4-app-statement',
        name: 'Conferência do Extrato no Aplicativo Real do Banco',
        buttonLabel: '📱 Consultar Extrato no App Oficial',
        category: 'system',
        question: 'Consta algum lançamento de R$ 3.850 no extrato oficial da sua conta?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Extrato limpo! Nenhuma compra de R$ 3.850 foi realizada!',
          details: 'No aplicativo oficial do banco não há nenhuma compra pendente ou aprovada. O SMS é uma farsa completa para induzir o pânico.',
          forensicFact: 'Os golpistas mandam valores altos (R$ 3.000 a R$ 5.000) exatamente para causar desespero e fazer a vítima ligar sem pensar.',
        },
      },
    ],
    isScam: true,
    redFlags: [
      'Número 0800 diferente do telefone oficial impresso no verso do cartão.',
      'Nenhuma transação consta no aplicativo oficial do banco.',
      'O atendente solicita transferência Pix para "proteger" ou "estornar" a conta.',
    ],
    explanation:
      'Golpe da Falsa Central de Atendimento (mais de 105 mil vítimas por ano). Os criminosos usam SMS falso com valor alto para forçar a vítima a ligar para uma central clandestina operada pela quadrilha.',
    realWorldTip:
      'NUNCA ligue para o número de telefone que veio escrito em um SMS. Sempre olhe o número de atendimento no VERSO DO SEU CARTÃO FÍSICO ou dentro do app oficial.',
    pedagogy: {
      emotionalTrigger: 'Pânico Financeiro e Urgência (a vítima acredita que sua conta foi esvaziada e corre para cancelar a falsa compra).',
      kidsAnalogy: 'É como alguém tocar um alarme de incêndio de mentira na escola só para todo mundo sair correndo e deixar o estojo aberto na mesa.',
      parentsGuide: 'Converse com seus pais idosos: centrais bancárias oficiais nunca pedem para você ligar num 0800 desconhecido recebido por SMS, nem pedem transferências para "proteger a conta".',
      adultRemedy: 'Se ligou e passou senhas: ligue imediatamente no SAC oficial pelo verso do cartão, bloqueie os cartões, desautorize os acessos e conteste qualquer transação.',
      goldenRule: 'Recebeu SMS de compra suspeita com 0800? DESCONSIDERE. Ligue apenas no número que está escrito atrás do seu cartão físico do banco.',
    },
  },

  {
    id: 'case-5-falsa-loja',
    level: 'medio',
    levelTitle: 'Nível Médio',
    xpReward: 100,
    category: 'Redes Sociais & Comércio',
    title: 'Anúncio Patrocinado com iPhone 85% Abaixo do Preço',
    dilemma: 'Anúncio patrocinado nas redes sociais oferecendo iPhone lacrado por R$ 1.299 no Pix por queima de estoque. Oportunidade imperdível ou loja fantasma?',
    sender: 'Outlet Tech Brasil (Instagram Patrocinado)',
    channel: 'social',
    time: '19:10',
    preview: 'LIQUIDAÇÃO RELÂMPAGO: iPhone 15 Pro Max por R$ 1.299 no Pix...',
    messageContent:
      '🔥 LIQUIDAÇÃO TOTAL DE ESTOQUE! iPhone 15 Pro Max 256GB lacrado por apenas R$ 1.299,00 à vista no Pix! Últimas 7 unidades apreendidas pela Receita Federal. Frete grátis para todo o Brasil. Clique em "Comprar Agora" antes que acabe: https://outlet-tech-brasill.shop/iphone15',
    clues: [
      {
        id: 'clue-5-whois',
        name: 'Checagem do Registro do Domínio (.shop)',
        buttonLabel: '🌐 Inspecionar Criação da Loja Online',
        category: 'whois',
        question: 'Há quanto tempo essa loja online existe na internet?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Loja registrada ontem com terminação internacional descartável (.shop)!',
          details: 'O domínio "outlet-tech-brasill.shop" foi registrado há 26 horas. Lojas reais possuem anos de histórico e utilizam CNPJ cadastrado no Registro.br (.com.br).',
          forensicFact: 'Quadrilhas de comércio eletrônico criam dezenas de lojas falsas por semana em plataformas pré-moldadas como Shopify ou WooCommerce, operando por 3 dias e sumindo com o dinheiro.',
        },
      },
      {
        id: 'clue-5-cnpj',
        name: 'Consulta do CNPJ na Receita Federal',
        buttonLabel: '🏢 Consultar CNPJ Informado no Rodapé',
        category: 'system',
        question: 'O CNPJ informado no rodapé da loja é legítimo e condizente?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'CNPJ roubado de uma padaria de bairro no interior de MG!',
          details: 'O CNPJ exibido na loja online pertence a uma microempresa do ramo de panificação fundada em 2012, totalmente alheia à venda de eletrônicos.',
          forensicFact: 'Criminosos copiam números de CNPJs idôneos da internet para passar uma falsa sensação de idoneidade no rodapé dos sites.',
        },
      },
      {
        id: 'clue-5-payment-options',
        name: 'Simulação do Carrinho de Compras',
        buttonLabel: '🛒 Tentar Comprar com Cartão de Crédito',
        category: 'behavior',
        question: 'O site permite pagar com cartão de crédito ou boleto bancário tradicional?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Cartão de crédito "temporariamente indisponível"! Só aceita Pix!',
          details: 'Ao finalizar o pedido, o site exibe mensagem de que o sistema de cartões está em manutenção e exige pagamento imediato por chave Pix.',
          forensicFact: 'Sites fraudulentos recusam intencionalmente cartões porque as operadoras de cartão estornam o valor (chargeback). No Pix, eles retiram o dinheiro na hora.',
        },
      },
    ],
    isScam: true,
    redFlags: [
      'Preço 85% inferior ao valor de mercado.',
      'Domínio registrado há menos de 48 horas em extensão estrangeira (.shop).',
      'CNPJ clonado de atividade econômica incompatível.',
      'Recusa de pagamento com cartão de crédito, exigindo Pix.',
    ],
    explanation:
      'Golpe da Falsa Loja Virtual (mais de 150 mil casos registrados). Criminosos patrocinam anúncios em redes sociais promovendo produtos caros por preços irrisórios e desaparecem após receber os pagamentos via Pix.',
    realWorldTip:
      'Desconfie de milagres: nenhum produto novo e original é vendido por uma fração do preço oficial. Antes de comprar, consulte a reputação no Reclame Aqui e a data de criação do site.',
    pedagogy: {
      emotionalTrigger: 'Ganância e Oportunismo (a tentação de adquirir um produto de luxo caríssimo pagando quase nada).',
      kidsAnalogy: 'Se alguém no recreio te oferecer um videogame novinho por R$ 5 reais, você acreditaria? Na internet, quando a esmola é demais, é sempre um golpe!',
      parentsGuide: 'Mostre aos filhos e parentes que anúncios no Instagram e TikTok não são garantia de honestidade: qualquer pessoa pode pagar R$ 20 reais para anunciar um golpe.',
      adultRemedy: 'Se pagou no Pix: conteste a transação no seu banco pelo MED e registre ocorrência na Polícia Civil informando o link do anúncio.',
      goldenRule: 'Desconto milagroso não existe. Desconfie de preços 50% abaixo do mercado e confira o CNPJ da loja na Receita Federal antes de comprar.',
    },
  },

  {
    id: 'case-6-falso-emprego',
    level: 'medio',
    levelTitle: 'Nível Médio',
    xpReward: 100,
    category: 'Vagas & Tarefas VIP',
    title: 'Falsa Vaga de Emprego ("Ganhe R$ 300/dia curtindo vídeos")',
    dilemma: 'Oferta de trabalho simples para curtir vídeos no YouTube e ganhar R$ 300 por dia no Telegram. Renda extra legítima de marketing ou golpe da tarefa com depósitos falsos?',
    sender: 'RH Global Marketing (Telegram)',
    channel: 'social',
    time: '10:30',
    preview: 'OPORTUNIDADE HOME OFFICE: Trabalhe 20 min por dia no celular...',
    messageContent:
      'Olá! Sou recrutadora da TikTok Marketing. Selecionamos seu perfil para nossa vaga de avaliador de mídia digital. Sua tarefa é simples: apenas curtir 5 vídeos no YouTube e seguir contas no Instagram. Pagamos de R$ 150 a R$ 500 por dia diretamente no seu Pix! Para iniciar o treinamento e receber sua primeira comissão de teste, entre no nosso grupo do Telegram.',
    clues: [
      {
        id: 'clue-6-task-model',
        name: 'Mecânica do "Treinamento" no Telegram',
        buttonLabel: '📋 Analisar as Tarefas do Grupo',
        category: 'behavior',
        question: 'O que o grupo do Telegram exige para liberar os pagamentos maiores?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Exigência de "depósitos de recarga" para desbloquear tarefas VIP!',
          details: 'Eles pagam R$ 10 reais nas primeiras tarefas para ganhar confiança. Em seguida, exigem que a vítima transfira R$ 300, R$ 1.000 ou R$ 3.000 para "desbloquear o nível VIP" com promessa de retorno de 30%.',
          forensicFact: 'Este é o Golpe da Tarefa / Emprego de Meio Período (Task Scam), que causou prejuízos milionários no Brasil segundo o Ministério Público Federal.',
        },
      },
      {
        id: 'clue-6-recruiter-contact',
        name: 'Origem do Número da Recrutadora',
        buttonLabel: '📱 Consultar DDI e DDD do Contato',
        category: 'phone',
        question: 'De que país é o número que entrou em contato no WhatsApp/Telegram?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Número de telefone internacional da Indonésia (+62)!',
          details: 'A suposta recrutadora de uma empresa brasileira envia mensagens automáticas em português com número de telefonia móvel internacional da Ásia.',
          forensicFact: 'Quadrilhas transnacionais utilizam bots que compram lotes de números estrangeiros para disparar abordagens de falsos empregos em massa.',
        },
      },
      {
        id: 'clue-6-clt-compliance',
        name: 'Regulamentação Trabalhista (CLT / Lei de Estágios)',
        buttonLabel: '⚖️ Verificar Legalidade da Contratação',
        category: 'system',
        question: 'Uma empresa séria pode cobrar taxas ou depósitos para contratar alguém?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Totalmente ilegal! Cobrar dinheiro do trabalhador é crime!',
          details: 'Nenhuma empresa de recrutamento legítima cobra taxas de inscrição, compra de kits de trabalho ou depósitos para pagar salários.',
          forensicFact: 'A CLT e as convenções da Organização Internacional do Trabalho (OIT) proíbem qualquer cobrança pecuniária do candidato a emprego.',
        },
      },
    ],
    isScam: true,
    redFlags: [
      'Promessa de ganhos exorbitantes para tarefas extremamente simples.',
      'Contato inicial não solicitado vindo de número internacional (+62).',
      'Exigência de depósitos em dinheiro para desbloquear novos níveis de comissão.',
    ],
    explanation:
      'Golpe da Tarefa / Falso Emprego no Telegram. Os golpistas pagam pequenas quantias iniciais para convencer a vítima de que o esquema é real e, em seguida, aplicam o golpe exigindo transferências crescentes.',
    realWorldTip:
      'Emprego de verdade nunca exige que você pague ou transfira dinheiro para trabalhar. Se pedirem depósito para liberar salário ou comissão, saia imediatamente e bloqueie o contato.',
    pedagogy: {
      emotionalTrigger: 'Necessidade Financeira e Esperança (aproveita o desemprego ou o desejo de renda extra fácil trabalhando no celular).',
      kidsAnalogy: 'É como um jogo de cartas trapaceado: primeiro deixam você ganhar uma balinha, para depois você apostar todo o seu dinheiro e perder tudo.',
      parentsGuide: 'Muitos adolescentes caem nesse golpe buscando o primeiro emprego ou renda para comprar skins de jogos. Nenhuma empresa séria cobra taxa para contratar funcionários!',
      adultRemedy: 'Se transferiu dinheiro: pare de enviar depósitos imediatamente (eles nunca vão devolver), faça B.O. eletrônico por estelionato e acione o MED no banco.',
      goldenRule: 'Trabalho de verdade NUNCA exige que você pague ou transfira dinheiro para poder receber o seu salário.',
    },
  },

  // ==========================================
  // NIVEL 3: AVANCADO (Mão Fantasma / Boletos / Fraudes Complexas)
  // ==========================================
  {
    id: 'case-7-mao-fantasma',
    level: 'avancado',
    levelTitle: 'Nível Avançado',
    xpReward: 150,
    category: 'Mão Fantasma & Malware',
    title: 'Falso Suporte de TI Solicitando Instalação de AnyDesk',
    dilemma: 'Notificação urgente do banco informando infecção de vírus na conta e exigindo instalação de módulo de proteção. Medida preventiva de segurança ou golpe da mão fantasma?',
    sender: 'Engenharia de Segurança Bancária',
    channel: 'call',
    time: '11:15',
    preview: 'ALERTA CRÍTICO: Dispositivo infectado! Instale nosso módulo...',
    messageContent:
      'LIGACAO EM ANDAMENTO: "Senhor(a), identificamos que seu aplicativo bancário foi comprometido por um vírus espião neste momento. Para proteger suas contas e remover o arquivo malicioso, precisamos que você acesse a Google Play Store agora e baixe nosso aplicativo oficial de diagnóstico: AnyDesk ou TeamViewer QuickSupport."',
    clues: [
      {
        id: 'clue-7-remote-app',
        name: 'Função Real do Aplicativo AnyDesk / QuickSupport',
        buttonLabel: '📱 Analisar o Aplicativo Indicado',
        category: 'system',
        question: 'O que o AnyDesk realmente faz quando instalado no celular?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'É uma ferramenta de controle remoto total da tela e do aparelho!',
          details: 'AnyDesk e TeamViewer são softwares legítimos de suporte técnico remoto. Se instalados, eles permitem que outra pessoa veja tudo o que você digita e controle seus dedos na tela.',
          forensicFact: 'Este é o temido "Golpe da Mão Fantasma". Com o app instalado, o fraudador acessa o banco, autoriza transferências e o dono do celular vê o aparelho mexendo sozinho.',
        },
      },
      {
        id: 'clue-7-accessibility-perm',
        name: 'Permissões do Sistema Operacional Android',
        buttonLabel: '🔒 Checar Permissões Solicitadas',
        category: 'behavior',
        question: 'Por que o atendente insiste para você ativar os "Serviços de Acessibilidade"?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Acesso às permissões que capturam senhas e códigos de segurança!',
          details: 'A permissão de acessibilidade no Android permite ler os textos na tela e digitar senhas automaticamente, quebrando as proteções do teclado virtual.',
          forensicFact: 'Bancos nunca solicitam ativação de acessibilidade para serviços de suporte ou atualização de aplicativos.',
        },
      },
      {
        id: 'clue-7-bank-protocol',
        name: 'Procedimento Oficial dos Bancos em Caso de Invasão',
        buttonLabel: '🏛️ Consultar Protocolo Febraban',
        category: 'behavior',
        question: 'O banco liga para clientes mandando instalar aplicativos externos?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Bancos NUNCA pedem instalação de aplicativos externos de suporte!',
          details: 'Quando há suspeita real de fraude, o próprio sistema do banco bloqueia preventivamente o acesso pelo servidor e orienta o cliente a comparecer à agência.',
          forensicFact: 'A Febraban e todos os bancos do país realizam campanhas contínuas alertando que jamais solicitam download de softwares de controle remoto.',
        },
      },
    ],
    isScam: true,
    redFlags: [
      'Solicitação para baixar softwares de acesso remoto (AnyDesk / TeamViewer).',
      'Pressão para ativar permissões de acessibilidade no sistema operacional.',
      'Alegação de que a conta está infectada e precisa de "varredura imediata".',
    ],
    explanation:
      'Golpe da Mão Fantasma (um dos mais destrutivos no Brasil). Criminosos induzem a vítima a instalar um aplicativo de controle remoto legítimo e utilizam as permissões do celular para transferir todo o saldo da conta e solicitar empréstimos.',
    realWorldTip:
      'Nenhum banco ou instituição financeira pede para você baixar aplicativos como AnyDesk, TeamViewer ou QuickSupport. Se receber essa instrução, desligue o telefone imediatamente.',
    pedagogy: {
      emotionalTrigger: 'Autoridade e Falsa Solução Técnica (o criminoso finge ser um engenheiro de segurança solícito querendo proteger seu aparelho).',
      kidsAnalogy: 'É como convidar um ladrão para entrar no seu quarto e fechar a porta, enquanto você fica esperando do lado de fora.',
      parentsGuide: 'Alerta vermelho para idosos: NUNCA autorize ninguém no telefone a instalar "AnyDesk", "TeamViewer" ou "Módulo de Segurança" no celular. Esses apps dão controle total aos criminosos.',
      adultRemedy: 'Se instalou o app: coloque o celular imediatamente em Modo Avião ou desligue o Wi-Fi, desinstale o app e contate o banco por outro aparelho para bloquear o Internet Banking.',
      goldenRule: 'Nenhum banco pede para instalar aplicativo de suporte remoto. Se pedirem para baixar AnyDesk ou similar, DESLIGUE NA MESMA HORA!',
    },
  },

  {
    id: 'case-8-boleto-falso',
    level: 'avancado',
    levelTitle: 'Nível Avançado',
    xpReward: 150,
    category: 'Boletos & Engenharia Financeira',
    title: 'Fatura Falsa Adulterada de Serviços de Internet e Telefone',
    dilemma: 'Boleto do plano de fibra óptica com 15% de desconto para pagamento imediato recebido por e-mail. Desconto de pontualidade legítimo ou boleto adulterado?',
    sender: 'Cobranca Telecom (E-mail)',
    channel: 'document',
    time: '08:40',
    preview: 'Sua fatura com vencimento hoje está disponível com 15% de desconto...',
    messageContent:
      'Prezado cliente, informamos que sua fatura do plano de Fibra Óptica vence na data de hoje. Aproveite nossa condição especial: pague hoje e ganhe 15% de desconto de pontualidade. Segue a linha digitável do boleto para pagamento rápido no app:\n\nLinha Digitável: 23793.38128 60000.129482 18200.491204 8 98400000015990',
    clues: [
      {
        id: 'clue-8-sender-domain',
        name: 'Análise do E-mail do Remetente',
        buttonLabel: '📧 Inspecionar Cabeçalho do E-mail',
        category: 'whois',
        question: 'O e-mail foi enviado pelos servidores oficiais da operadora?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'E-mail enviado por servidor gratuito compartilhado no exterior!',
          details: 'O remetente exibe o nome da operadora, mas o endereço técnico real é "faturas@cobrancas-seguras-telecom.net", registrado há duas semanas.',
          forensicFact: 'Grandes operadoras utilizam servidores próprios com certificados SPF, DKIM e DMARC rigorosos que garantem a autenticidade do e-mail corporativo.',
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
    pedagogy: {
      emotionalTrigger: 'Rotina e Desatenção (pagar contas correndo no piloto automático sem conferir os detalhes na tela do celular).',
      kidsAnalogy: 'É como colar uma etiqueta falsa por cima do endereço de uma carta para que ela vá parar na casa de outra pessoa sem ninguém perceber.',
      parentsGuide: 'Crie o hábito em casa: antes de apertar "Confirmar Pagamento" de qualquer boleto, leia em voz alta quem é o "Beneficiário Final" na tela do banco.',
      adultRemedy: 'Se pagou o boleto adulterado: contate imediatamente o banco onde fez o pagamento para tentar travar a liquidação e registre B.O. de estelionato.',
      goldenRule: 'Antes de digitar a senha de pagamento, OLHE O NOME DO BENEFICIÁRIO FINAL. Se a conta de luz ou telefone estiver em nome de uma fintech desconhecida, NÃO PAGUE.',
    },
  },

  {
    id: 'case-9-robo-pix',
    level: 'avancado',
    levelTitle: 'Nível Avançado',
    xpReward: 150,
    category: 'Fraudes com Pix & Algoritmos',
    title: 'Falso Bug / Robô de Multiplicação de Saldo no Pix',
    dilemma: 'Publicidade afirmando existir uma brecha no algoritmo do Banco Central que devolve dez vezes o Pix transferido. Falha real do sistema financeiro ou armadilha para roubar seu saldo?',
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
    pedagogy: {
      emotionalTrigger: 'Crença em Atalhos e Ilusão de Lucro Fácil (a fantasia de que existe um truque no sistema que tornará a pessoa rica sem esforço).',
      kidsAnalogy: 'É a história da árvore de moedas de ouro: você enterra suas moedas achando que vai nascer uma árvore cheia de dinheiro, mas quem mandou você enterrar rouba tudo!',
      parentsGuide: 'Ensine aos jovens noções básicas de economia: dinheiro é fruto de trabalho e valor real gerado. Não existem falhas mágicas que criam dinheiro do nada.',
      adultRemedy: 'Acione o MED imediatamente no aplicativo do banco, mas esteja ciente de que o fraudador costuma sacar o valor em segundos para outras contas.',
      goldenRule: 'Multiplicação mágica de dinheiro NÃO EXISTE. Quem pede para você transferir Pix prometendo devolver o dobro ou o triplo é 100% estelionatário.',
    },
  },
];

// ==========================================
// SISTEMA DE MEDALHAS & CONQUISTAS PEDAGÓGICAS
// ==========================================
export const BADGES: Badge[] = [
  {
    id: 'badge-first-clue',
    title: 'Lupa do Investigador',
    description: 'Analisou sua primeira evidência forense usando o Kit do Investigador.',
    icon: '🔍',
    category: 'detective',
    rarity: 'bronze',
    unlockedHint: 'Abra e inspecione uma pista forense em qualquer caso.',
  },
  {
    id: 'badge-family-shield',
    title: 'Escudo Protetor da Família',
    description: 'Desmascarou o golpe do parente falso no WhatsApp e salvou o orçamento da casa.',
    icon: '👨‍👩‍👧‍👦',
    category: 'family',
    rarity: 'prata',
    unlockedHint: 'Acerte o veredito do Caso 1 (WhatsApp Parente Novo).',
  },
  {
    id: 'badge-pix-guard',
    title: 'Sentinela do Pix',
    description: 'Consultou o titular do Pix e bloqueou transferências para contas de laranjas.',
    icon: '💳',
    category: 'financial',
    rarity: 'prata',
    unlockedHint: 'Identifique os golpes que usam chaves Pix fraudulentas.',
  },
  {
    id: 'badge-whois-master',
    title: 'Rastreador de Domínios',
    description: 'Descobriu sites falsos e links de smishing com domínios recém-criados.',
    icon: '🌐',
    category: 'detective',
    rarity: 'prata',
    unlockedHint: 'Inspecione laudos Whois nos casos de Correios ou Lojas Falsas.',
  },
  {
    id: 'badge-anti-ghost',
    title: 'Caçador de Mão Fantasma',
    description: 'Barrou a instalação de aplicativos de acesso remoto (AnyDesk/TeamViewer).',
    icon: '👻',
    category: 'detective',
    rarity: 'ouro',
    unlockedHint: 'Acerte o caso do Suporte Falso / Mão Fantasma.',
  },
  {
    id: 'badge-streak-fire',
    title: 'Mente Blindada (Combo x3)',
    description: 'Manteve uma sequência de 3 vereditos corretos consecutivos!',
    icon: '🔥',
    category: 'streak',
    rarity: 'ouro',
    unlockedHint: 'Acerte 3 casos seguidos sem errar nenhum.',
  },
  {
    id: 'badge-central-bank-expert',
    title: 'Especialista em Defesa do Banco Central',
    description: 'Dominou o funcionamento do SPI/Pix e do Mecanismo Especial de Devolução (MED).',
    icon: '🏛️',
    category: 'financial',
    rarity: 'ouro',
    unlockedHint: 'Desmascare a falsa central 0800 e a farsa do Bug do Pix.',
  },
  {
    id: 'badge-grand-master',
    title: 'Grão-Mestre em Cidadania Digital',
    description: 'Concluiu todos os 9 casos do simulador com rigor pericial exemplar.',
    icon: '👑',
    category: 'detective',
    rarity: 'platina',
    unlockedHint: 'Complete todos os desafios dos 3 níveis de dificuldade.',
  },
];

// ==========================================
// PATENTES DE CIDADANIA DIGITAL DO JOGADOR
// ==========================================
export const PLAYER_RANKS: PlayerRank[] = [
  {
    id: 'rank-1',
    name: 'Detetive Aprendiz',
    minXp: 0,
    icon: '🌱',
    color: 'text-slate-400',
    pedagogicalTitle: 'Iniciante Curioso',
    summary: 'Começando a jornada de investigação digital. Aprendeu a desconfiar de mensagens estranhas.',
  },
  {
    id: 'rank-2',
    name: 'Vigilante Familiar',
    minXp: 180,
    icon: '🔍',
    color: 'text-blue-400',
    pedagogicalTitle: 'Protetor dos Pais e Filhos',
    summary: 'Já sabe verificar remetentes, DDDs e conferir quem é o dono da chave Pix antes de pagar.',
  },
  {
    id: 'rank-3',
    name: 'Inspetor Digital',
    minXp: 400,
    icon: '🛡️',
    color: 'text-amber-400',
    pedagogicalTitle: 'Filtro Anti-Golpes',
    summary: 'Imune à falsa urgência e centrais telefônicas falsas. Investiga pistas com rigor pericial.',
  },
  {
    id: 'rank-4',
    name: 'Guardião Cibernético',
    minXp: 700,
    icon: '⚡',
    color: 'text-emerald-400',
    pedagogicalTitle: 'Especialista em Defesa Digital',
    summary: 'Capaz de identificar fraudes complexas como a Mão Fantasma e boletos adulterados.',
  },
  {
    id: 'rank-5',
    name: 'Mestre da Defesa Nacional',
    minXp: 950,
    icon: '👑',
    color: 'text-purple-400',
    pedagogicalTitle: 'Cidadão Blindado & Educador Digital',
    summary: 'Nível máximo! Pronto para blindar sua família, educar a comunidade e acionar defesas legais.',
  },
];

export function calculatePlayerRank(score: number): PlayerRank {
  for (let i = PLAYER_RANKS.length - 1; i >= 0; i--) {
    if (score >= PLAYER_RANKS[i].minXp) {
      return PLAYER_RANKS[i];
    }
  }
  return PLAYER_RANKS[0];
}

// ==========================================
// CARTILHA PEDAGÓGICA DA FAMÍLIA SEGURA (10 REGRAS DE OURO)
// ==========================================
export const FAMILY_GOLDEN_RULES: FamilyRule[] = [
  {
    id: 'rule-1',
    target: 'all',
    targetLabel: 'Para Toda a Família',
    title: 'A Regra dos 5 Minutos (Respirar antes de Agir)',
    rule: 'Todo golpista usa URGÊNCIA para fazer você agir sem pensar.',
    practicalAction: 'Recebeu mensagem de desespero, bloqueio de conta ou desconto relâmpago? Espere 5 minutos e converse com alguém. 99% dos golpes desmoronam quando a pessoa pensa com calma.',
    icon: '⏱️',
  },
  {
    id: 'rule-2',
    target: 'parents',
    targetLabel: 'Para Pais & Adultos',
    title: 'A Palavra-Passe Secreta da Casa',
    rule: 'Com clonagem de WhatsApp e vozes geradas por IA, só a voz não basta.',
    practicalAction: 'Combine uma palavra secreta com seus filhos e pais (ex: "Biscoito de Polvilho"). Se alguém pedir Pix com número novo alegando ser da família, exija a palavra-passe secreta!',
    icon: '🔐',
  },
  {
    id: 'rule-3',
    target: 'kids',
    targetLabel: 'Para Crianças & Jovens',
    title: 'O Código de Segurança Nunca se Compartilha',
    rule: 'Nunca envie códigos que chegam por SMS para ninguém, mesmo em troca de skins ou moedas em jogos.',
    practicalAction: 'Se um amigo do jogo ou um influenciador pedir o código que chegou no celular da sua mãe, avise seus pais na hora: é uma tentativa de roubar a conta!',
    icon: '📱',
  },
  {
    id: 'rule-4',
    target: 'elderly',
    targetLabel: 'Para Proteger Idosos',
    title: 'O Banco Nunca Manda Motoboy nem Pede Pix',
    rule: 'Bancos nunca ligam pedindo para transferir dinheiro para "proteger" ou "cancelar compra".',
    practicalAction: 'Se alguém ligar dizendo ser do banco e pedir transferência ou senha, desligue o telefone imediatamente. Olhe o número oficial no verso do seu cartão físico e ligue de volta.',
    icon: '📞',
  },
  {
    id: 'rule-5',
    target: 'all',
    targetLabel: 'Para Toda a Família',
    title: 'A Regra da Tela Final do Banco',
    rule: 'O nome que você vê no boleto impresso pode ser falso. O que vale é o nome no app do banco.',
    practicalAction: 'Sempre leia em voz alta o nome do BENEFICIÁRIO FINAL antes de digitar a senha de pagamento. Se não for a empresa contratada, cancele a operação.',
    icon: '🧾',
  },
  {
    id: 'rule-6',
    target: 'parents',
    targetLabel: 'Para Adultos',
    title: 'Como Acionar o MED (Mecanismo Especial de Devolução)',
    rule: 'Caiu num golpe via Pix? O Banco Central garante o direito de contestação.',
    practicalAction: 'Abra a transação no app do seu banco em até 80 dias, clique em "Contestar / Relatar Fraude" e registre Boletim de Ocorrência na Delegacia Eletrônica anexando os comprovantes.',
    icon: '🏛️',
  },
  {
    id: 'rule-7',
    target: 'kids',
    targetLabel: 'Para Crianças & Jovens',
    title: 'Dinheiro Fácil e Bugs Mágicos não Existem',
    rule: 'Nenhum site ou robô multiplica dinheiro ou diamantes de graça.',
    practicalAction: 'Se alguém na internet prometer "envie R$ 50 e receba R$ 500", é sempre um criminoso querendo ficar com os seus R$ 50 reais.',
    icon: '🎮',
  },
];

// ==========================================
// GLOSSÁRIO PEDAGÓGICO ILUSTRADO
// ==========================================
export const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: 'Engenharia Social',
    pronunciation: 'En-ge-nha-ria So-ci-al',
    simpleMeaning: 'A arte dos criminosos de enganar pessoas usando mentiras, fingimento e pressão emocional ao invés de invadir sistemas.',
    realWorldExample: 'Um criminoso fingir que é seu filho com celular quebrado para pedir R$ 500 via Pix.',
    pedagogicalTip: 'O elo mais vulnerável da segurança não é o computador, é o coração humano quando é manipulado.',
  },
  {
    term: 'Phishing (Pescaria Digital)',
    pronunciation: 'Fí-xin-gui',
    simpleMeaning: 'Envio de mensagens falsas com links que "pescam" senhas, cartões de crédito e dados pessoais da vítima.',
    realWorldExample: 'SMS falso dos Correios dizendo que sua encomenda está presa e pedindo para pagar taxa num site falso.',
    pedagogicalTip: 'Assim como na pescaria o anzol tem uma isca gostosa, o link falso oferece um presente ou ameaça um problema.',
  },
  {
    term: 'Mão Fantasma (Acesso Remoto)',
    pronunciation: 'Mão Fan-tas-ma',
    simpleMeaning: 'Golpe onde o fraudador convence você a instalar um aplicativo (como AnyDesk) e controla seu celular à distância.',
    realWorldExample: 'Falso suporte do banco pede para instalar um "módulo de segurança" e esvazia suas contas enquanto a tela fica preta.',
    pedagogicalTip: 'Nunca instale aplicativos de controle remoto por ordem de alguém no telefone.',
  },
  {
    term: 'MED (Mecanismo Especial de Devolução)',
    pronunciation: 'É-mi-ê-dê',
    simpleMeaning: 'Ferramenta oficial do Banco Central criada para rastrear e bloquear dinheiro transferido por Pix para fraudadores.',
    realWorldExample: 'Acionar a contestação de fraude no app do banco logo após fazer um Pix para um estelionatário.',
    pedagogicalTip: 'Quanto mais rápido você acionar o MED no app do banco (de preferência nos primeiros 30 minutos), maior a chance de reaver o valor.',
  },
  {
    term: 'Conta Laranja (Money Mule)',
    pronunciation: 'Laran-ja Fi-nan-cei-ra',
    simpleMeaning: 'Conta bancária alugada ou aberta com documentos roubados para receber dinheiro de crimes e despistar a polícia.',
    realWorldExample: 'A chave Pix para onde o dinheiro foi transferido pertence a um morador de outro estado que nem sabe do golpe.',
    pedagogicalTip: 'Emprestar ou vender conta bancária para terceiros é crime de lavagem de dinheiro previsto no Código Penal.',
  },
  {
    term: '2FA (Segundo Fator de Autenticação)',
    pronunciation: 'Dois Efe-Á',
    simpleMeaning: 'Uma camada extra de proteção além da senha, como um código numérico enviado ao seu celular.',
    realWorldExample: 'Ao entrar no WhatsApp ou e-mail, o sistema pede a senha e também um código de 6 dígitos enviado por SMS.',
    pedagogicalTip: 'É como ter duas fechaduras com chaves diferentes na porta da sua casa.',
  },
];
