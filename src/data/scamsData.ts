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
    id: 'case-5-alerta-google',
    level: 'medio',
    levelTitle: 'Nível Médio',
    xpReward: 100,
    category: 'Segurança & Identidade Digital',
    title: 'Alerta Oficial de Tentativa de Acesso em Novo Dispositivo',
    dilemma: 'Notificação crítica informando login bloqueado em Campinas/SP com orientações de segurança. Mensagem alarmista de phishing ou alerta autêntico do seu provedor de e-mail?',
    sender: 'Google Segurança (no-reply@accounts.google.com)',
    channel: 'document',
    time: '19:05',
    preview: 'Alerta Crítico: Tentativa de login bloqueada em novo dispositivo...',
    messageContent:
      'ALERTA DE SEGURANÇA CRÍTICO\n\nDetectamos uma tentativa de login com a sua senha em um novo dispositivo:\n• Dispositivo: Windows NT 10.0 (Chrome 124)\n• Local aproximado: Campinas, SP, Brasil\n• Horário: Hoje às 19:05\n\nA tentativa foi bloqueada preventivamente porque esse dispositivo nunca se conectou à sua conta antes. Se foi você, ignore este e-mail. Se não foi você, acesse o painel de segurança para desconectar todos os aparelhos e alterar sua senha:\nhttps://myaccount.google.com/notifications',
    clues: [
      {
        id: 'clue-5-dmarc',
        name: 'Autenticação Criptográfica de Origem (DMARC / SPF / DKIM)',
        buttonLabel: '📧 Inspecionar Cabeçalhos Criptográficos',
        category: 'whois',
        question: 'O e-mail foi realmente transmitido pelos servidores oficiais do Google?',
        evidenceResult: {
          status: 'clean',
          headline: 'Protocolos SPF, DKIM e DMARC 100% Aprovados (PASS)!',
          details: 'A chave criptográfica DKIM pertence ao domínio "@google.com" e o IP de envio pertence ao bloco oficial da Google LLC. É matematicamente impossível forjar essa assinatura sem possuir as chaves privadas do servidor do Google.',
          forensicFact: 'DMARC com política de rejeição ("p=reject") impede que servidores falsos usem o domínio corporativo legítimo. Quando todos passam com status PASS, o remetente é genuíno.',
        },
      },
      {
        id: 'clue-5-url',
        name: 'Auditoria do Link e Certificado Digital',
        buttonLabel: '🌐 Auditar Destino do Link',
        category: 'system',
        question: 'O link direciona para o portal seguro da empresa ou para página clonada?',
        evidenceResult: {
          status: 'clean',
          headline: 'Link oficial estrito para "myaccount.google.com"!',
          details: 'O link direciona diretamente para "myaccount.google.com/notifications" com certificado TLS emitido pela Google Trust Services. Não há formulários externos nem solicitações para digitar senha por e-mail.',
          forensicFact: 'Golpes de phishing sempre usam links como "google-seguranca-login.com" ou encurtadores. Notificações oficiais apontam estritamente para o domínio raiz do serviço.',
        },
      },
      {
        id: 'clue-5-activity',
        name: 'Conferência no Histórico do Próprio Aparelho',
        buttonLabel: '📱 Checar Evento nas Configurações do Celular',
        category: 'behavior',
        question: 'Essa mesma notificação consta na central de segurança do seu celular?',
        evidenceResult: {
          status: 'clean',
          headline: 'Tentativa bloqueada confirmada no painel de segurança do aparelho!',
          details: 'Ao abrir as Configurações do telefone > Conta > Segurança > Atividade Recente, o mesmo evento de bloqueio em Campinas/SP consta registrado no log do sistema operacional.',
          forensicFact: 'A confirmação cruzada em um dispositivo já confiável é a regra máxima de auditoria: se o evento existe dentro das configurações do aparelho, a notificação é real.',
        },
      },
    ],
    isScam: false,
    redFlags: [],
    explanation:
      'Esta é uma notificação legítima de proteção de conta. Muitas pessoas erram acreditando que todo alerta urgente é golpe, mas empresas de tecnologia realmente enviam avisos quando senhas vazadas na internet são testadas por invasores em locais incomuns.',
    realWorldTip:
      'Mesmo em notificações legítimas, a melhor prática de segurança é nunca clicar direto no link do e-mail: abra uma nova aba do navegador, entre você mesmo no site oficial (ex: myaccount.google.com) e confira os alertas.',
    pedagogy: {
      emotionalTrigger: 'Alarme e Dúvida (o usuário tende a achar que tudo é golpe ou ignorar alertas genuínos de segurança por medo de clicar).',
      kidsAnalogy: 'É como o porteiro do prédio ligando no interfone para avisar que uma pessoa estranha tentou entrar dizendo seu nome e foi barrada na portaria.',
      parentsGuide: 'Ensine que alertas legítimos de segurança JAMAIS pedem para você responder o e-mail com sua senha nem pedem Pix para desbloquear conta.',
      adultRemedy: 'Como a tentativa de login usou sua senha antiga, acerte o veredito como seguro, acesse o painel oficial e troque sua senha imediatamente ativando verificação em duas etapas.',
      goldenRule: 'Alertas de segurança reais direcionam para o domínio raiz oficial do serviço e são confirmados na aba de segurança do seu próprio aparelho.',
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
  // NIVEL 3: AVANCADO (Perícia Forense / Punycode / ICP-Brasil / AiTM)
  // ==========================================
  {
    id: 'case-7-punycode-homografo',
    level: 'avancado',
    levelTitle: 'Nível Avançado',
    xpReward: 150,
    category: 'Engenharia Criptográfica & DNS',
    title: 'Ataque de Homógrafo Punycode no Checkout',
    dilemma: 'O link recebido exibe visualmente "mercadopago.com.br" com cadeado SSL verde ativo. O design é idêntico ao oficial. Portal legítimo ou ataque de caracteres homógrafos cirílicos?',
    sender: 'Notificações Mercado Pago (no-reply@mercadopago.com.br)',
    channel: 'document',
    time: '11:15',
    preview: 'URGENTE: Sua conta comercial requer recadastramento de chave Pix...',
    messageContent:
      'AVISO DE CONFORMIDADE BANCÁRIA\n\nIdentificamos que sua chave Pix comercial está pendente de validação periódica conforme a Resolução BCB nº 1/2020. Para manter o limite operacional da sua conta ativo, acesse o link de validação segura com criptografia ponta a ponta:\n\nhttps://www.mеrcadopago.com.br/validacao-segura\n\nObservação: Conexão protegida por certificado digital TLS 1.3 de 256 bits.',
    clues: [
      {
        id: 'clue-7-ssl-punycode',
        name: 'Inspeção do Certificado TLS e Código Punycode',
        buttonLabel: '🔒 Inspecionar Certificado Digital TLS',
        category: 'whois',
        question: 'Qual é o nome exato registrado no Certificado SSL da página?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Punycode detectado! O domínio real é "xn--mrcadopago-k8a.com.br"!',
          details: 'Apesar de parecer "mercadopago.com.br" a olho nu, a letra "e" é o caractere cirílico "е" (código Unicode U+0435). O certificado foi emitido gratuitamente pela Let\'s Encrypt para o domínio punycode "xn--mrcadopago-k8a.com.br".',
          forensicFact: 'Este é o temido "Ataque Homógrafo de IDN (Internationalized Domain Names)". Criminosos usam alfabetos cirílicos ou gregos que possuem letras visualmente idênticas ao alfabeto latino para clonar domínios de bancos.',
        },
      },
      {
        id: 'clue-7-asn-routing',
        name: 'Rastreamento de IP e Roteamento de Rede (BGP / ASN)',
        buttonLabel: '🌐 Mapear Provedor de Hospedagem (ASN)',
        category: 'system',
        question: 'Onde o servidor da página está fisicamente hospedado?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Servidor alocado em hospedagem "Bulletproof" no Caribe!',
          details: 'O Mercado Pago legítimo opera sob AS262453 próprio com infraestrutura no Brasil. Este servidor opera sob AS48512 em um provedor offshore no Caribe que ignora denúncias e decisões judiciais.',
          forensicFact: 'Provedores "bulletproof hosting" são estruturas corporativas no exterior especializadas em acolher servidores de cibercriminosos sem cooperar com a polícia internacional.',
        },
      },
      {
        id: 'clue-7-js-webhook',
        name: 'Análise de Código Fonte e Requisições (DevTools)',
        buttonLabel: '💻 Auditar Código JavaScript do Formulário',
        category: 'behavior',
        question: 'Para onde os dados digitados na tela são enviados?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Exfiltração de credenciais via Webhook do Telegram!',
          details: 'O botão "Confirmar Dados" executa um script malicioso que captura o CPF, senha e token digitados e dispara uma requisição POST direta para a API de um bot clandestino do Telegram.',
          forensicFact: 'Hackers modernos abandonaram painéis PHP antigos em favor de Webhooks de mensageria (Telegram/Discord) para receber dados roubados no celular em menos de 1 segundo.',
        },
      },
    ],
    isScam: true,
    redFlags: [
      'Domínio real em Punycode (xn--mrcadopago-k8a.com.br) usando caractere cirílico U+0435.',
      'Certificado SSL gratuito (Let\'s Encrypt) em vez de certificado corporativo EV (Extended Validation).',
      'Hospedagem offshore em provedor bulletproof.',
      'Script de envio de dados para webhook externo do Telegram.',
    ],
    explanation:
      'Golpe de Phishing de Alta Precisão via Ataque de Homógrafo (Punycode). O atacante registrou um domínio com caractere cirílico idêntico ao "e" latino e ativou SSL para passar falsa sensação de segurança aos navegadores.',
    realWorldTip:
      'Cadeado SSL só garante criptografia, NUNCA honestidade. Ao navegar em sites financeiros, verifique se o navegador exibe prefixos "xn--" e sempre acerte o endereço digitando manualmente na barra ou usando favoritos salvos.',
    pedagogy: {
      emotionalTrigger: 'Falsa Segurança Técnica (a vítima confia no cadeado verde e no visual idêntico do site sem desconfiar da fraude tipográfica).',
      kidsAnalogy: 'É como um impostor que colocou uma lente de contato colorida idêntica à do seu amigo para fingir que é ele: de longe parece a mesma pessoa, mas na certidão de nascimento é outro.',
      parentsGuide: 'Atenção redobrada: ensine que o cadeado fechado do navegador significa apenas que a conexão é fechada, mas o outro lado da linha pode ser um criminoso.',
      adultRemedy: 'Se digitou senhas em sites com Punycode, altere a senha imediatamente do aplicativo oficial no celular e desconecte todas as sessões ativas.',
      goldenRule: 'Cadeado verde no site NÃO significa que o site é seguro. Confira se há caracteres homógrafos ou abra o app oficial.',
    },
  },

  {
    id: 'case-8-receita-ecac',
    level: 'avancado',
    levelTitle: 'Nível Avançado',
    xpReward: 150,
    category: 'Segurança Governamental & Fiscal',
    title: 'Intimação Fiscal com Aviso de Pendência na DIRPF',
    dilemma: 'Notificação formal com brasão da República comunicando pendência grave na Declaração do Imposto de Renda e risco de bloqueio de CPF. Ameaça de golpe de extorsão ou comunicação fiscal oficial autêntica?',
    sender: 'Receita Federal do Brasil (Gov.br)',
    channel: 'document',
    time: '08:40',
    preview: 'COMUNICADO OFICIAL: Divergência apurada na DIRPF 2026...',
    messageContent:
      'COMUNICADO OFICIAL - RECEITA FEDERAL DO BRASIL\n\nIdentificamos divergências nos rendimentos tributáveis informados na sua Declaração de Ajuste Anual (DIRPF 2026, exercício 2025), código de retenção 0588. Sua declaração foi retida em Malha Fiscal.\n\nPara consultar o demonstrativo detalhado de inconsistências e apresentar a declaração retificadora, acesse exclusivamente o portal e-CAC através do link oficial com autenticação Gov.br:\nhttps://cav.receita.fazenda.gov.br/autenticacao/login\n\nATENÇÃO: A Receita Federal NUNCA solicita senhas bancárias, chaves Pix ou pagamentos de multas por e-mail ou mensagens instantâneas. O acesso exige certificado digital ou credenciais Gov.br níveis Prata ou Ouro.',
    clues: [
      {
        id: 'clue-8-icp-signature',
        name: 'Validação da Assinatura Digital ICP-Brasil',
        buttonLabel: '🏛️ Checar Assinatura Digital do Documento',
        category: 'system',
        question: 'O documento possui assinatura digital válida da ICP-Brasil?',
        evidenceResult: {
          status: 'clean',
          headline: 'Assinatura Digital ICP-Brasil V8 plenamente válida e auditável!',
          details: 'O documento possui carimbo do tempo e assinatura digital emitida pela Autoridade Certificadora SERPRO (Governo Federal), em conformidade com a MP 2.200-2/2001. A cadeia criptográfica foi validada pelo ITI.',
          forensicFact: 'A Infraestrutura de Chaves Públicas Brasileira (ICP-Brasil) confere validade jurídica inquestionável aos documentos oficiais, impossível de ser falsificada por cibercriminosos.',
        },
      },
      {
        id: 'clue-8-gov-domain',
        name: 'Auditoria do Domínio e Segurança da Rota DNS',
        buttonLabel: '🌐 Auditar o Domínio ".gov.br"',
        category: 'whois',
        question: 'O link pertence aos servidores governamentais da Receita Federal?',
        evidenceResult: {
          status: 'clean',
          headline: 'Domínio governamental restrito e oficial (.gov.br)!',
          details: 'O link aponta estritamente para "cav.receita.fazenda.gov.br". No Brasil, o domínio ".gov.br" é estritamente controlado pelo NIC.br e reservado exclusivamente a órgãos do Estado mediante convênio oficial.',
          forensicFact: 'Golpes se passando pela Receita utilizam domínios como "receita-regulariza.net" ou mandam anexos perigosos (".zip", ".pdf.exe"). Esta notificação direciona ao portal e-CAC oficial sem anexos suspeitos.',
        },
      },
      {
        id: 'clue-8-cross-verification',
        name: 'Acesso Direto Independente ao Portal Gov.br',
        buttonLabel: '📑 Conferir Caixa Postal no App Meu Imposto de Renda',
        category: 'behavior',
        question: 'A mesma notificação consta na caixa postal oficial da Receita Federal?',
        evidenceResult: {
          status: 'clean',
          headline: 'A notificação está confirmada na Caixa Postal do e-CAC!',
          details: 'Ao abrir o navegador independentemente e fazer login no portal "gov.br", a mesma pendência da malha fina e o mesmo código 0588 constam no demonstrativo oficial da declaração.',
          forensicFact: 'A regra de ouro da cibersegurança: quando receber uma notificação alarmista, acesse o serviço oficial por iniciativa própria sem usar os links da mensagem. Se o comunicado existir lá dentro, é 100% legítimo.',
        },
      },
    ],
    isScam: false,
    redFlags: [],
    explanation:
      'Esta é uma notificação autêntica da Receita Federal do Brasil. Muitos brasileiros caem no erro de achar que qualquer aviso de malha fina ou pendência tributária é golpe, perdendo prazos legais importantes. A assinatura digital ICP-Brasil e o domínio cav.receita.fazenda.gov.br comprovam a legitimidade absoluta do aviso.',
    realWorldTip:
      'A Receita Federal nunca manda boletos ou chaves Pix para pagar multas em e-mails. Toda regularização de pendência fiscal é resolvida exclusivamente dentro do portal autenticado e-CAC com sua conta Gov.br.',
    pedagogy: {
      emotionalTrigger: 'Medo de Sanções Governamentais e Bloqueio de Documentos (a reação instintiva da pessoa é entrar em pânico ou presumir fraude antes de verificar as assinaturas oficiais).',
      kidsAnalogy: 'É como receber uma carta oficial da diretoria da escola assinada e carimbada pelo diretor: se você for na secretaria e perguntar, eles vão confirmar que a carta é verdadeira.',
      parentsGuide: 'Ensine a família: documentos com assinatura digital ICP-Brasil e domínios .gov.br autênticos são legítimos. Para tirar a dúvida, sempre entre direto no site gov.br pelo celular.',
      adultRemedy: 'Acesse o e-CAC pelo portal oficial gov.br, envie a declaração retificadora corrigindo o informe de rendimentos e acompanhe o processamento.',
      goldenRule: 'Comunicação oficial do governo direciona para o portal .gov.br autenticado com Gov.br e NUNCA pede senhas por e-mail ou Pix direto.',
    },
  },

  {
    id: 'case-9-aitm-proxy',
    level: 'avancado',
    levelTitle: 'Nível Avançado',
    xpReward: 150,
    category: 'Ataques Adversary-in-the-Middle (AiTM)',
    title: 'Envelope DocuSign com Ataque de Proxy Reverso AiTM',
    dilemma: 'Envelope corporativo com termo aditivo urgente para assinatura digital. Ao abrir, a tela de login solicita usuário, senha e o código 2FA de SMS real do celular. Documento de trabalho legítimo ou ataque AiTM com roubo de sessão?',
    sender: 'DocuSign Notificações (docusign@service-contracts.net)',
    channel: 'document',
    time: '20:00',
    preview: 'DocuSign: Documento confidencial para assinatura digital urgente...',
    messageContent:
      'DOCUSIGN: Você recebeu um documento confidencial ("Acordo_Societario_Aditivo_2026.pdf") para assinatura digital urgente.\n\nRemetente: Diretoria Jurídica & Compliance\nPrazo de Validade: 4 horas\n\nPara visualizar o documento e assinar digitalmente com autenticação federada da sua organização, conecte-se com sua conta corporativa Microsoft 365:\nhttps://login.microsoftonline.com.secure-auth-gateway.org/oauth2/authorize\n\nAmbiente Seguro com Autenticação Multifator (MFA) Obrigatória.',
    clues: [
      {
        id: 'clue-9-fqdn-domain',
        name: 'Decomposição Estrutural da URL (FQDN)',
        buttonLabel: '🌐 Analisar Estrutura do Domínio Raiz',
        category: 'whois',
        question: 'Qual é o verdadeiro domínio registrado que receberá os dados?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Técnica de Subdomínio Profundo: o domínio real é "secure-auth-gateway.org"!',
          details: 'A URL começa com o texto "login.microsoftonline.com", mas isso é apenas um subdomínio falso. O domínio raiz registrado é "secure-auth-gateway.org", registrado há menos de 72 horas por atacantes.',
          forensicFact: 'Ataques AiTM enganam os olhos colocando a URL oficial no início do subdomínio para que em telas menores o usuário não veja o final do endereço.',
        },
      },
      {
        id: 'clue-9-reverse-proxy',
        name: 'Inspeção de Rede e Tráfego de Sessão (Evilginx)',
        buttonLabel: '📡 Auditar Tráfego de Rede (Proxy Reverso)',
        category: 'system',
        question: 'Como o servidor malicioso lida com o código de 2FA legítimo?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Proxy Reverso em tempo real interceptando o Cookie de Sessão!',
          details: 'O servidor intermediário repassa suas credenciais ao servidor verdadeiro da Microsoft, solicita seu código 2FA real e intercepta o Cookie de Sessão ("ESTSAuthCookie"), assumindo sua conta sem precisar da sua senha novamente!',
          forensicFact: 'Ataques AiTM (como os orquestrados pelo Evilginx2) conseguem burlar até mesmo o 2FA via SMS/App tradicional, pois roubam o token de sessão já autenticado. Apenas chaves FIDO2/Passkeys físicas barram essa técnica.',
        },
      },
      {
        id: 'clue-9-docusign-dashboard',
        name: 'Verificação Direta na Conta DocuSign Oficial',
        buttonLabel: '📑 Consultar Painel Oficial da DocuSign',
        category: 'behavior',
        question: 'Consta algum documento pendente no aplicativo oficial da DocuSign?',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Nenhum documento pendente na sua conta da DocuSign!',
          details: 'Ao abrir o aplicativo da DocuSign ou logar diretamente em docusign.com, não há nenhum documento ou solicitação pendente de assinatura para seu CPF/e-mail.',
          forensicFact: 'Toda plataforma de assinatura eletrônica armazena os envelopes na caixa de entrada do usuário cadastrado. Se não está no painel oficial, o e-mail é uma armadilha.',
        },
      },
    ],
    isScam: true,
    redFlags: [
      'Subdomínio profundo enganoso (login.microsoftonline.com.secure-auth-gateway.org).',
      'Presença de proxy reverso interceptando cookies de autenticação (AiTM).',
      'Inexistência de envelopes pendentes no aplicativo oficial da DocuSign.',
      'Prazo curto de urgência (4 horas) para impedir reflexão do colaborador.',
    ],
    explanation:
      'Ataque de Adversary-in-the-Middle (AiTM), uma das técnicas de ciberataque corporativo mais perigosas do mundo atualmente. O servidor intermediário do atacante se coloca entre a vítima e o servidor real da Microsoft, capturando senhas e o cookie de sessão autenticado para contornar a autenticação em duas etapas (MFA).',
    realWorldTip:
      'Sempre observe o domínio raiz imediatamente antes da primeira barra ("/"). Para se proteger contra ataques AiTM, utilize autenticação sem senha baseada em chaves físicas FIDO2 ou Passkeys criptográficas resistentes a phishing.',
    pedagogy: {
      emotionalTrigger: 'Pressão Corporativa e Senso de Dever (o medo de atrasar a assinatura de um contrato importante da empresa).',
      kidsAnalogy: 'É como um mensageiro desonesto que fica no meio do caminho entre você e seu amigo: ele repassa as mensagens de vocês dois, mas abre todas as cartas e copia os segredos antes de entregar.',
      parentsGuide: 'Alerte que mesmo com autenticação em duas etapas por SMS ativada, clicar em links falsos pode permitir que invasores assumam contas corporativas e e-mails.',
      adultRemedy: 'Se digitou credenciais em um proxy AiTM: revogue imediatamente todas as sessões ativas no painel da Microsoft 365, altere a senha e registre incidente de segurança com a equipe de TI.',
      goldenRule: 'Analise o domínio raiz da URL (antes da primeira barra "/"). Autenticação corporativa só deve ser feita em domínios oficiais.',
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
    title: 'Perito em Ataques de Homógrafo',
    description: 'Desmascarou a técnica de homógrafo Punycode cirílico e barrou a exfiltração de dados.',
    icon: '🛡️',
    category: 'detective',
    rarity: 'ouro',
    unlockedHint: 'Acerte o caso do Ataque de Homógrafo Punycode (Nível Avançado).',
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
    title: 'Auditor Governamental & Institucional',
    description: 'Validou a assinatura digital ICP-Brasil e desmascarou o BINA spoofing na falsa central.',
    icon: '🏛️',
    category: 'financial',
    rarity: 'ouro',
    unlockedHint: 'Acerte os casos da Falsa Central 0800 e da Intimação da Receita Federal.',
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
