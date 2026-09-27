export type ScamLevel = 'basico' | 'medio' | 'avancado';

export interface InvestigativeClue {
  id: string;
  name: string;
  buttonLabel: string;
  category: 'whois' | 'pix' | 'phone' | 'behavior' | 'system';
  question: string;
  terminalCommand: string;
  terminalOutput: string;
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
  evidenceHypotheses: string[];
  correctEvidenceIndex: number;
  keyEvidenceReason: string;
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
  pedagogicalTip?: string;
  pedagogy?: string;
}

export const SCAM_CASES: ScamCase[] = [
  // ==========================================
  // NIVEL 1: BASICO (Academia de Polícia • Pistas Didáticas)
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
        name: 'Telemetria de Linha Telefônica (Anatel)',
        buttonLabel: 'Checar Registro da Linha',
        category: 'phone',
        question: 'De onde é esse número e quando a linha foi ativada?',
        terminalCommand: 'telco-query --msisdn +5585981249912 --anatel-homer',
        terminalOutput:
          '[TELECOM REGISTRY LOOKUP]\nMSISDN: +55 (85) 98124-9912 | Area: Fortaleza / CE\nPlan: Pré-Pago Descartável | Activation: 2026-09-26T08:12:00Z (28h atrás)\nSubscriber: CPF ***.482.103-** (Titular desconhecido)\nSIM Swap Status: Normal (Chip físico recém-comprado)',
        evidenceResult: {
          status: 'suspicious',
          headline: 'DDD incompatível e chip pré-pago recém-ativado no Ceará!',
          details: 'A linha é do DDD (85) - Ceará, enquanto toda a família reside em São Paulo (11). O chip foi cadastrado há menos de 48 horas em nome de terceiro.',
          forensicFact: 'Criminosos adquirem chips pré-pagos descartáveis aos montes para aplicar golpes do novo número antes que a linha seja bloqueada.',
        },
      },
      {
        id: 'clue-1-pix',
        name: 'Consulta de Titularidade da Chave Pix (SPI/Bacen)',
        buttonLabel: 'Consultar Titular da Chave Pix',
        category: 'pix',
        question: 'Quem é o verdadeiro dono da conta que vai receber o dinheiro?',
        terminalCommand: 'bacen-spi-query --pix-key 489.120.392-80',
        terminalOutput:
          '[BACEN SPI DIRECTORY]\nKey: 489.120.392-80 (CPF)\nBeneficiary: Marcos Vinicius de Souza\nInstitution: PagBank (ISPB 08561701)\nAccount Type: Conta Pagamento Pré-Paga\nAccount Opening Date: 2026-09-25 (aberta há 2 dias)',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Chave Pix pertence a uma pessoa totalmente desconhecida!',
          details: 'A chave CPF pertence a "Marcos Vinicius de Souza" no PagBank. Não tem nenhuma ligação com sua filha ou com a faculdade.',
          forensicFact: 'Contas de laranjas ("money mules") são alugadas ou criadas com documentos falsos para receber o dinheiro do golpe e pulverizar o saldo em segundos.',
        },
      },
      {
        id: 'clue-1-voice',
        name: 'Sondagem de Chamada em Tempo Real (SIP)',
        buttonLabel: 'Ligar para Confirmar a Voz',
        category: 'behavior',
        question: 'O que acontece ao tentar ligar para este número?',
        terminalCommand: 'sip-probe --dial +5585981249912 --audio-stream',
        terminalOutput:
          '[SIP DIALER PROBE]\nConnecting to target carrier... Ringing (180)\nResponse: SIP/2.0 486 Busy Here (Chamada rejeitada pelo usuário)\nIn-Band Message: "Não consigo atender agora, microfone chiando"\nBiometric Voice Match: FAILED (Nenhum stream de áudio estabelecido)',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Chamada recusada imediatamente com desculpa pré-formatada!',
          details: 'A pessoa rejeitou a chamada e mandou texto: "Mãe, não consigo atender agora, o microfone tá chiando muito, manda o comprovante por aqui!"',
          forensicFact: 'Golpistas sempre evitam chamadas em tempo real porque não conseguem imitar a voz e o rosto do parente verdadeiro.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'A linha telefônica é do Ceará (DDD 85) e a chave Pix pertence a terceiro desconhecido sem vínculo com a família',
      'O aplicativo de mensagens sofreu um vazamento de token de sessão pela rede Wi-Fi pública',
      'A faculdade cancelou o pagamento e estornou o valor diretamente para a conta original da aluna',
    ],
    correctEvidenceIndex: 0,
    keyEvidenceReason:
      'A divergência geográfica da linha pré-paga recente e a conta bancária em nome de um laranja desconhecido comprovam o golpe do novo número.',
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
        name: 'Registro de Domínio WHOIS',
        buttonLabel: 'Inspecionar Registro WHOIS',
        category: 'whois',
        question: 'Quem é o dono desse site e quando ele foi criado?',
        terminalCommand: 'whois correios-rastreio-taxa.net',
        terminalOutput:
          '[WHOIS PROTOCOL LOOKUP]\nDomain Name: correios-rastreio-taxa.net\nRegistrar: NameCheap, Inc.\nCreation Date: 2026-09-24T10:14:22Z (há 3 dias)\nRegistrant Country: IS (Islândia)\nNameservers: ns1.offshore-dns.net, ns2.offshore-dns.net\nStatus: clientTransferProhibited',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Domínio falso criado há apenas 3 dias no exterior!',
          details: 'O site "correios-rastreio-taxa.net" foi registrado anonimamente em servidor na Islândia. O site oficial dos Correios brasileiros é estritamente "correios.com.br".',
          forensicFact: 'Órgãos governamentais e estatais no Brasil utilizam obrigatoriamente a terminação ".com.br" ou ".gov.br". Qualquer ".net", ".online" ou ".site" é fraude.',
        },
      },
      {
        id: 'clue-2-tracking',
        name: 'Consulta SRO Correios (Base Central)',
        buttonLabel: 'Conferir Código no Sistema Oficial',
        category: 'system',
        question: 'Esse código de rastreio LK8492019BR realmente existe?',
        terminalCommand: 'correios-sro-api --tracking LK8492019BR',
        terminalOutput:
          '[SRO CORREIOS CENTRAL QUERY]\nTracking Code: LK8492019BR\nStatus: HTTP/1.1 404 Not Found\nSystem Response: { "error": "Objeto não localizado no Sistema Integrado de Rastreamento de Encomendas dos Correios." }',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Código de rastreio inexistente na base dos Correios!',
          details: 'Ao buscar o código "LK8492019BR" no sistema oficial dos Correios, o retorno é: "Objeto não encontrado na base de dados".',
          forensicFact: 'Os golpistas geram códigos aleatórios que imitam o padrão de letras e números internacionais (2 letras + 9 números + BR) para enganar quem comprou na Shopee ou Shein.',
        },
      },
      {
        id: 'clue-2-sms-policy',
        name: 'Auditoria de Gateway de Pagamento',
        buttonLabel: 'Auditar Gateway de Pagamento',
        category: 'behavior',
        question: 'Os Correios mandam link por SMS para pagar taxa via Pix?',
        terminalCommand: 'payment-gateway-probe --url correios-rastreio-taxa.net/pagamento',
        terminalOutput:
          '[PAYMENT GATEWAY AUDIT]\nPage Title: "Portal Correios - Despacho Postal"\nPayment Option: Exclusivo QR Code Pix Dinâmico\nMerchant ID: INTERMEDIACAO-SERVICOS-ME\nOfficial Correios Channel: Exclusivo pelo portal "Minhas Importações" em correios.com.br',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Os Correios NUNCA mandam link de pagamento por SMS!',
          details: 'A cobrança de taxas de importação (despacho postal) só pode ser paga dentro do portal logado "Minhas Importações" no site oficial correios.com.br.',
          forensicFact: 'O CERT.br já emitiu alerta nacional sobre campanhas massivas de SMS maliciosos usando o nome dos Correios.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'A encomenda foi extraviada na triagem aduaneira e o código ficou temporariamente inativo',
      'Domínio internacional .net criado há 3 dias na Islândia com código de rastreio inexistente nos Correios',
      'O valor da taxa alfandegária ultrapassou o teto permitido de importação para pessoa física',
    ],
    correctEvidenceIndex: 1,
    keyEvidenceReason:
      'O uso de domínio internacional recente (.net) registrado na Islândia e o código inexistente na base dos Correios comprovam o phishing.',
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
        id: 'clue-3-shortcode',
        name: 'Auditoria de Short Code da Operadora (Anatel)',
        buttonLabel: 'Verificar Número do Remetente',
        category: 'phone',
        question: 'O número 28540 é um remetente verificado?',
        terminalCommand: 'anatel-shortcode-query --number 28540',
        terminalOutput:
          '[ANATEL SHORT-CODE DIRECTORY]\nShort Code: 28540 | Category: LA-Institucional Homologado\nRegistered Assignee: Banco Bradesco S.A. (CNPJ 60.746.948/0001-12)\nRouting: Tier-1 Direct Operator Route (SMP-LA)\nSpoofing Risk: Negligenciável (Canal fechado e auditado por operadoras)',
        evidenceResult: {
          status: 'clean',
          headline: 'Remetente é um Short Code oficial e auditado pelas operadoras!',
          details: 'Números curtos de 5 dígitos (como 28540) são canais corporativos de alta segurança regulamentados pela Anatel. Golpistas comuns não conseguem enviar SMS usando esses números.',
          forensicFact: 'Short codes bancários exigem contrato formal com as operadoras de telefonia e auditoria de tráfego contra spam.',
        },
      },
      {
        id: 'clue-3-payload',
        name: 'Análise de Links e Chamadas para Ação',
        buttonLabel: 'Inspecionar Conteúdo do Texto',
        category: 'behavior',
        question: 'O SMS pede para clicar em links ou passar dados a terceiros?',
        terminalCommand: 'nlp-sms-payload-analyzer --body "BANCO: Seu código de segurança..."',
        terminalOutput:
          '[CONTENT TELEMETRY]\nDetected URLs: 0\nExternal Callback Requests: 0 (Nenhum telefone/0800 solicitado)\nSecurity Instruction: "Nossos atendentes NUNCA pedem este código"\nPhishing Risk Score: 0/100 (Token 2FA puramente informativo)',
        evidenceResult: {
          status: 'clean',
          headline: 'Nenhum link suspeito e alerta expresso contra compartilhamento!',
          details: 'A mensagem não contém links para clicar nem números de 0800 para ligar. Ela apenas entrega o código e avisa que funcionários do banco nunca pedem essa informação.',
          forensicFact: 'Mensagens oficiais de 2FA são puramente informativas. Qualquer mensagem que diga "clique aqui para validar seu código" é fraude.',
        },
      },
      {
        id: 'clue-3-session',
        name: 'Log de Sessões de Login no App Bancário',
        buttonLabel: 'Verificar Log de Acesso na Conta',
        category: 'system',
        question: 'Houve alguma tentativa real de acesso que justificasse o código?',
        terminalCommand: 'bank-auth-event-log --account current-user',
        terminalOutput:
          '[SECURITY EVENT LOG]\nTimestamp: 2026-09-27T11:03:15 BRT\nTrigger: Web Banking Login from 187.84.190.244 (São Paulo/SP)\nStatus: Challenge 2FA emitido legitimamente pelo servidor central\nIntegrity Check: Pass',
        evidenceResult: {
          status: 'clean',
          headline: 'Evento de login real confirmado nos registros do banco!',
          details: 'O sistema registrou uma tentativa de acesso web correspondente ao horário exato do envio do SMS. O código foi gerado legitimamente pelos servidores.',
          forensicFact: 'A confirmação cruzada entre o horário da mensagem e o evento no aplicativo bancário confirma a procedência legítima do 2FA.',
        },
      },
    ],
    isScam: false,
    evidenceHypotheses: [
      'A mensagem vem de Short Code oficial de 5 dígitos homologado, sem links, confirmando autenticação real',
      'O código de segurança foi enviado por atacantes para forçar você a responder com sua senha',
      'O SMS é falso porque os bancos são proibidos de enviar códigos numéricos por mensagem de texto',
    ],
    correctEvidenceIndex: 0,
    keyEvidenceReason:
      'O Short Code de 5 dígitos auditado pela Anatel, a ausência total de links e a sincronia com o evento de login provam a legitimidade da mensagem.',
    redFlags: [],
    explanation:
      'Esta mensagem é 100% legítima. Trata-se de uma autenticação em duas etapas (2FA) enviada pelo canal oficial. O perigo real não é receber o código, e sim passar esse código para alguém que te ligar pedindo.',
    realWorldTip:
      'Se você receber um código 2FA sem ter tentado fazer login, NUNCA passe o código para ninguém: abra o aplicativo oficial do banco por conta própria e troque sua senha imediatamente.',
    pedagogy: {
      emotionalTrigger: 'Desconfiança Saudável (o usuário aprende a não ter medo cego da tecnologia, mas a saber distinguir canais seguros de canais clandestinos).',
      kidsAnalogy: 'O código de segurança é como o segredo do seu diário trancado a chave: você nunca conta para ninguém que te pedir no recreio.',
      parentsGuide: 'Ensine que o SMS de 2FA só deve ser esperado quando você mesmo abriu o app e tentou fazer login. Se o código chegou do nada, alguém está tentando invadir: troque a senha imediatamente!',
      adultRemedy: 'Se um suposto funcionário do banco ligar pedindo este código, desligue imediatamente e reporte a tentativa de invasão pelo SAC oficial.',
      goldenRule: 'Código de SMS é pessoal e intransferível. Atendente nenhum do mundo precisa saber o seu código para te ajudar.',
    },
  },

  // ==========================================
  // NIVEL 2: MEDIO (Investigador de Campo • Evidências Mistas & Spoofing)
  // ==========================================
  {
    id: 'case-4-falsa-central',
    level: 'medio',
    levelTitle: 'Nível Médio',
    xpReward: 100,
    category: 'Falsa Central 0800',
    title: 'Falsa Central Telefônica com BINA Spoofing',
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
        name: 'Rastreamento de Tronco VoIP e BINA',
        buttonLabel: 'Investigar Linha 0800 e Rota SIP',
        category: 'phone',
        question: 'Esse número 0800 pertence ao banco de verdade?',
        terminalCommand: 'telecom-voip-trace --cli "0800 729 0192" --sip-debug',
        terminalOutput:
          '[SIP CARRIER TRACE]\nIncoming Call-ID: 0800 729 0192\nOrigination: Asterisk Cloud-PBX (Trunk VoIP Internacional)\nCLI Spoofing Detected: TRUE (BINA manipulada via cabeçalho SIP INVITE)\nContracting Entity: Alfa Consultoria e Cobranças ME (Empresa fantasma)\nBank Official Toll-Free: 0800 729 0001 (Diferença no sufixo)',
        evidenceResult: {
          status: 'suspicious',
          headline: '0800 clandestino contratado em nome de empresa de fachada!',
          details: 'O número 0800 729 0192 foi alugado via telefonia VoIP em uma operadora virtual por uma empresa fantasma de consultoria, sem vínculo algum com o banco.',
          forensicFact: 'Hoje em dia qualquer pessoa física ou criminoso pode alugar um número 0800 pela internet pagando R$ 50 reais mensais em plataformas de telefonia em nuvem.',
        },
      },
      {
        id: 'clue-4-ivr',
        name: 'Espectrograma de Áudio da URA',
        buttonLabel: 'Analisar Gravação e URA Eletrônica',
        category: 'behavior',
        question: 'Como funciona a gravação ao ligar para o número?',
        terminalCommand: 'audio-dsp-spectrum --sample ivr_capture.wav',
        terminalOutput:
          '[SPECTRUM AUDIO ANALYSIS]\nSynthesized Voice: Polly Neural TTS (Voz de locutora bancária clonada)\nAcoustic Artifact: Loop de ruído sintético de call center (14 segundos em repetição)\nAttendant Script: Solicita "Transferência Pix de estorno para conta de garantia"',
        evidenceResult: {
          status: 'suspicious',
          headline: 'URA idêntica à do banco com barulho falso de digitação ao fundo!',
          details: 'A gravação copia a voz original do banco e toca música de espera clássica. Quando um atendente falso atende, ele solicita que você "faça um Pix para uma conta de segurança do Banco Central".',
          forensicFact: 'O golpe da falsa central cresceu 40% no Brasil segundo a Febraban. Os atendentes são treinados com script profissional de call center.',
        },
      },
      {
        id: 'clue-4-app-statement',
        name: 'Consulta ao Livro-Razão Central (Core Banking)',
        buttonLabel: 'Consultar Extrato no Servidor Oficial',
        category: 'system',
        question: 'Consta algum lançamento de R$ 3.850 no extrato oficial da sua conta?',
        terminalCommand: 'bank-ledger-api --check-pending-transactions',
        terminalOutput:
          '[REAL-TIME CORE BANKING STATEMENT]\nAccount: 01029-3 / Ag: 1204\nLast 24h Transactions:\n  - 27/09 08:30: Padaria Bela Vista - R$ 12,50 (Aprovada)\n  - 27/09 13:10: Drogaria São Paulo - R$ 45,90 (Aprovada)\nPending Purchases: 0 | Transação "Lojas Americanas R$ 3.850": NÃO LOCALIZADA',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Extrato limpo! Nenhuma compra de R$ 3.850 foi realizada!',
          details: 'No aplicativo oficial do banco não há nenhuma compra pendente ou aprovada. O SMS é uma farsa completa para induzir o pânico.',
          forensicFact: 'Os golpistas mandam valores altos (R$ 3.000 a R$ 5.000) exatamente para causar desespero e fazer a vítima ligar sem pensar.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'A compra de R$ 3.850 foi aprovada mas o banco ocultou do extrato por sigilo financeiro',
      'Chamada originada por tronco VoIP clandestino com BINA spoofada e ausência da compra no extrato oficial',
      'O Banco Central transferiu o atendimento de contingência para um novo número 0800 temporário',
    ],
    correctEvidenceIndex: 1,
    keyEvidenceReason:
      'A manipulação da BINA por telefonia VoIP e a inexistência de qualquer débito no extrato oficial bancário comprovam a farsa da central clandestina.',
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
        buttonLabel: 'Inspecionar Cabeçalhos Criptográficos',
        category: 'whois',
        question: 'O e-mail foi realmente transmitido pelos servidores oficiais do Google?',
        terminalCommand: 'dns-security-audit --domain google.com --email-headers',
        terminalOutput:
          '[EMAIL AUTHENTICATION VERIFIER]\nReceived-SPF: pass (google.com: 209.85.220.41 is designated sender)\nDKIM-Signature: pass (signature verified for domain @google.com key=20230601)\nDMARC: pass (p=reject, sp=reject, pct=100)\nReturn-Path: <3s81kAQwKBoYqqf-0rcn41...google.com>\nCryptographic Authenticity: 100% (Assinatura digital válida)',
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
        buttonLabel: 'Auditar Destino do Link e Certificado',
        category: 'system',
        question: 'O link direciona para o portal seguro da empresa ou para página clonada?',
        terminalCommand: 'tls-cert-probe --target myaccount.google.com/notifications',
        terminalOutput:
          '[TLS & DOMAIN PROBE]\nURL: https://myaccount.google.com/notifications\nCanonical Host: myaccount.google.com\nTLS Subject: CN=myaccount.google.com | Issuer: Google Trust Services LLC\nForm Action: Internal OAuth session (Sem envio de senhas por e-mail)\nPhishing Risk Score: 0/100 (Safe)',
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
        buttonLabel: 'Checar Evento nas Configurações do Celular',
        category: 'behavior',
        question: 'Essa mesma notificação consta na central de segurança do seu celular?',
        terminalCommand: 'device-security-log --fetch-recent-events',
        terminalOutput:
          '[LOCAL GMS AUDIT LOG]\nEvent ID: #98412-SEC\nType: LoginAttemptBlocked\nClient: Chrome on Windows 10 (IP 177.18.92.12 - Campinas/SP)\nDevice Status: Não reconhecido anteriormente\nAction: Bloqueado por anomalia de geolocalização',
        evidenceResult: {
          status: 'clean',
          headline: 'Tentativa bloqueada confirmada no painel de segurança do aparelho!',
          details: 'Ao abrir as Configurações do telefone > Conta > Segurança > Atividade Recente, o mesmo evento de bloqueio em Campinas/SP consta registrado no log do sistema operacional.',
          forensicFact: 'A confirmação cruzada em um dispositivo já confiável é a regra máxima de auditoria: se o evento existe dentro das configurações do aparelho, a notificação é real.',
        },
      },
    ],
    isScam: false,
    evidenceHypotheses: [
      'O e-mail foi forjado por hackers que conseguiram quebrar as chaves criptográficas do Google',
      'Assinaturas criptográficas DMARC e SPF 100% válidas combinadas com log de bloqueio confirmado no próprio aparelho',
      'O Google enviou o aviso para que o usuário pague uma taxa de desbloqueio de segurança',
    ],
    correctEvidenceIndex: 1,
    keyEvidenceReason:
      'Os protocolos de autenticação criptográfica (SPF, DKIM, DMARC) foram aprovados e a tentativa bloqueada foi confirmada no histórico do aparelho, comprovando a autenticidade.',
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
    title: 'Falsa Vaga de Emprego com Contrato Timbrado em PDF',
    dilemma: 'Oferta de trabalho com contrato timbrado em PDF prometendo R$ 300/dia para avaliar mídias. Oportunidade profissional real ou golpe da tarefa com exigência de depósito?',
    sender: 'RH Global Marketing (Telegram)',
    channel: 'social',
    time: '10:30',
    preview: 'OPORTUNIDADE HOME OFFICE: Trabalhe 20 min por dia no celular...',
    messageContent:
      'Olá! Sou recrutadora da TikTok Marketing. Selecionamos seu perfil para nossa vaga de avaliador de mídia digital. Sua tarefa é simples: apenas curtir 5 vídeos no YouTube e seguir contas no Instagram. Pagamos de R$ 150 a R$ 500 por dia diretamente no seu Pix! Para iniciar o treinamento e receber sua primeira comissão de teste, entre no nosso grupo do Telegram.',
    clues: [
      {
        id: 'clue-6-task-model',
        name: 'Extração Forense de Metadados e Cláusulas (PDF)',
        buttonLabel: 'Analisar Contrato e Metadados do PDF',
        category: 'behavior',
        question: 'O que o contrato em PDF esconde nas cláusulas de adesão?',
        terminalCommand: 'pdf-forensic-extractor --file contrato_admissao.pdf',
        terminalOutput:
          '[METADATA & CLAUSE PARSER]\nPDF Producer: Canva Free Web Tool (Gerado há 18 horas)\nClauses Found:\n  Clause 3.1: "Remuneração de R$ 300/dia para tarefas de engajamento social"\n  Clause 5.4: "Exigência de depósito caução de R$ 280 para liberação de credenciais"\nLabor Law Flag: Violação direta do Artigo 462 da CLT (Cobrança ilícita)',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Exigência de "depósitos de recarga" para desbloquear tarefas VIP!',
          details: 'Eles pagam R$ 10 reais nas primeiras tarefas para ganhar confiança. Em seguida, exigem que a vítima transfira R$ 300, R$ 1.000 ou R$ 3.000 para "desbloquear o nível VIP" com promessa de retorno de 30%.',
          forensicFact: 'Este é o Golpe da Tarefa / Emprego de Meio Período (Task Scam), que causou prejuízos milionários no Brasil segundo o Ministério Público Federal.',
        },
      },
      {
        id: 'clue-6-recruiter-contact',
        name: 'Rastreamento HLR Internacional do Recrutador',
        buttonLabel: 'Consultar DDI e Operadora do Contato',
        category: 'phone',
        question: 'De que país é o número que entrou em contato no WhatsApp/Telegram?',
        terminalCommand: 'telecom-hlr-lookup --msisdn +6282199218841',
        terminalOutput:
          '[INTERNATIONAL HLR QUERY]\nCountry Code: +62 (Indonésia)\nCarrier: Telkomsel Indonesia\nAccount Age: 4 dias\nSpam Reports: 47 nos últimos 3 dias por disparo em massa para números +55',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Número de telefone internacional da Indonésia (+62)!',
          details: 'A suposta recrutadora de uma empresa brasileira envia mensagens automáticas em português com número de telefonia móvel internacional da Ásia.',
          forensicFact: 'Quadrilhas transnacionais utilizam bots que compram lotes de números estrangeiros para disparar abordagens de falsos empregos em massa.',
        },
      },
      {
        id: 'clue-6-clt-compliance',
        name: 'Consulta de CNPJ na Base da Receita Federal',
        buttonLabel: 'Verificar CNPJ do Contrato',
        category: 'system',
        question: 'O CNPJ do contrato pertence a uma agência de marketing?',
        terminalCommand: 'receita-cnpj-api --cnpj 14.892.102/0001-44',
        terminalOutput:
          '[RECEITA FEDERAL CNPJ QUERY]\nCNPJ: 14.892.102/0001-44\nRazão Social: Panificadora e Confeitaria Estrela de Ouro LTDA\nSituação Cadastral: Ativa\nCNAE: 10.91-1 (Fabricação de produtos de panificação)\nIncompatibilidade: CNPJ clonado de padaria física sem vínculo com TI',
        evidenceResult: {
          status: 'suspicious',
          headline: 'CNPJ clonado de uma padaria física de bairro!',
          details: 'Nenhuma empresa de recrutamento legítima cobra taxas de inscrição, compra de kits de trabalho ou depósitos para pagar salários.',
          forensicFact: 'A CLT e as convenções da Organização Internacional do Trabalho (OIT) proíbem qualquer cobrança pecuniária do candidato a emprego.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'A vaga é autêntica pois o contrato tem timbre corporativo e CNPJ ativo na Receita Federal',
      'Uso de CNPJ clonado de padaria, contrato exigindo depósito financeiro prévio e recrutador com DDI da Indonésia',
      'A empresa foi multada pelo Ministério do Trabalho por pagar comissões via Pix',
    ],
    correctEvidenceIndex: 1,
    keyEvidenceReason:
      'A incompatibilidade do CNPJ clonado de uma padaria e a exigência de depósitos financeiros para poder trabalhar comprovam a fraude trabalhista.',
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
  // NIVEL 3: AVANCADO (Perícia Forense Real • Ataques Cibernéticos Complexos)
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
        name: 'Decodificador IDN / Punycode & Certificado TLS',
        buttonLabel: 'Decodificar Punycode e Certificado TLS',
        category: 'whois',
        question: 'Qual é o nome exato registrado no Certificado SSL da página?',
        terminalCommand: 'idn-converter --input "https://www.mеrcadopago.com.br"',
        terminalOutput:
          '[INTERNATIONALIZED DOMAIN NAME DECODER]\nDisplayed String: https://www.mercadopago.com.br\nRaw Byte Stream: 77 77 77 2e 6d d0 b5 72 63 61 64 6f ...\nHomoglyph Found at Byte 6: 0xD0 0xB5 -> Unicode U+0435 (CYRILLIC SMALL LETTER IE)\nCanonical Punycode: www.xn--mrcadopago-k8a.com.br\nTLS Subject: CN=xn--mrcadopago-k8a.com.br | Issuer: Let\'s Encrypt Free DV',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Punycode detectado! O domínio real é "xn--mrcadopago-k8a.com.br"!',
          details: 'Apesar de parecer "mercadopago.com.br" a olho nu, a letra "e" é o caractere cirílico "е" (código Unicode U+0435). O certificado foi emitido gratuitamente pela Let\'s Encrypt para o domínio punycode "xn--mrcadopago-k8a.com.br".',
          forensicFact: 'Este é o temido "Ataque Homógrafo de IDN (Internationalized Domain Names)". Criminosos usam alfabetos cirílicos ou gregos que possuem letras visualmente idênticas ao alfabeto latino para clonar domínios de bancos.',
        },
      },
      {
        id: 'clue-7-asn-routing',
        name: 'Roteamento BGP e Autonomia de Rede (ASN)',
        buttonLabel: 'Mapear Provedor de Hospedagem (ASN)',
        category: 'system',
        question: 'Onde o servidor da página está fisicamente hospedado?',
        terminalCommand: 'bgp-asn-traceroute --host xn--mrcadopago-k8a.com.br',
        terminalOutput:
          '[BGP AUTONOMOUS SYSTEM PROBE]\nResolved IP: 185.220.101.4\nASN: AS48512 (Hostinger Offshore / Bulletproof Infrastructure Belize)\nLegitimate Mercado Pago ASN: AS262453 (MercadoLibre Brasil) / AS16509 (AWS)\nAbuse Status: Provedor offshore não-cooperativo com a justiça',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Servidor alocado em hospedagem "Bulletproof" no Caribe!',
          details: 'O Mercado Pago legítimo opera sob AS262453 próprio com infraestrutura no Brasil. Este servidor opera sob AS48512 em um provedor offshore no Caribe que ignora denúncias e decisões judiciais.',
          forensicFact: 'Provedores "bulletproof hosting" são estruturas corporativas no exterior especializadas em acolher servidores de cibercriminosos sem cooperar com a polícia internacional.',
        },
      },
      {
        id: 'clue-7-js-webhook',
        name: 'Inspeção de Payload e Tráfego POST (DevTools)',
        buttonLabel: 'Auditar Código JavaScript do Formulário',
        category: 'behavior',
        question: 'Para onde os dados digitados na tela são enviados?',
        terminalCommand: 'devtools-network-inspector --capture-post',
        terminalOutput:
          '[NETWORK EXFILTRATION TRACE]\nEvent: FormSubmit (#btn-validar-chave)\nMethod: POST https://api.telegram.org/bot729182910:AAH_kqW92.../sendMessage\nPayload Data:\n  { "cpf": "***.492.108-**", "token_app": "948192", "pwd_hash": "e99a..." }\nDestination: Bot clandestino de mensagens instantâneas',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Exfiltração de credenciais via Webhook do Telegram!',
          details: 'O botão "Confirmar Dados" executa um script malicioso que captura o CPF, senha e token digitados e dispara uma requisição POST direta para a API de um bot clandestino do Telegram.',
          forensicFact: 'Hackers modernos abandonaram painéis PHP antigos em favor de Webhooks de mensageria (Telegram/Discord) para receber dados roubados no celular em menos de 1 segundo.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'O portal é autêntico pois o navegador exibe conexão criptografada com cadeado verde TLS 1.3',
      'Domínio Punycode com caractere cirílico U+0435 imitando o "e" latino, hospedagem bulletproof e exfiltração de senhas para o Telegram',
      'O Mercado Pago terceirizou o checkout para uma infraestrutura na nuvem de Belize para balanceamento de carga',
    ],
    correctEvidenceIndex: 1,
    keyEvidenceReason:
      'A análise de bytes revelou a substituição da letra "e" por um homógrafo cirílico (Punycode xn--mrcadopago-k8a.com.br) e script exfiltrando senhas para o Telegram.',
    redFlags: [
      'Domínio real em Punycode (xn--mrcadopago-k8a.com.br) usando caractere cirílico U+0435.',
      'Certificado SSL gratuito (Let\'s Encrypt) em vez de certificado corporativo EV.',
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
        name: 'Validador Criptográfico de Assinatura ICP-Brasil',
        buttonLabel: 'Validar Assinatura Digital ICP-Brasil',
        category: 'system',
        question: 'O documento possui assinatura digital válida da ICP-Brasil?',
        terminalCommand: 'icp-verifier --file intimacao_malha_0588.pdf',
        terminalOutput:
          '[ICP-BRASIL CRYPTOGRAPHIC VALIDATOR]\nSignature Status: VÁLIDA (Conforme MP 2.200-2/2001)\nSigner: Autoridade Certificadora SERPRO Final v5 (RFB)\nChain of Trust: AC SERPRO -> AC Secretaria da Receita Federal -> ICP-Brasil Raiz v8\nTimestamp Token: 2026-09-27T08:35:10 BRT (Auditado)\nIntegrity Digest: SHA-256 Match (Documento autêntico e inalterado)',
        evidenceResult: {
          status: 'clean',
          headline: 'Assinatura Digital ICP-Brasil V8 plenamente válida e auditável!',
          details: 'O documento possui carimbo do tempo e assinatura digital emitida pela Autoridade Certificadora SERPRO (Governo Federal), em conformidade com a MP 2.200-2/2001. A cadeia criptográfica foi validada pelo ITI.',
          forensicFact: 'A Infraestrutura de Chaves Públicas Brasileira (ICP-Brasil) confere validade jurídica inquestionável aos documentos oficiais, impossível de ser falsificada por cibercriminosos.',
        },
      },
      {
        id: 'clue-8-gov-domain',
        name: 'Auditoria de DNSSEC e Zona .gov.br',
        buttonLabel: 'Auditar Zona .gov.br e DNSSEC',
        category: 'whois',
        question: 'O link pertence aos servidores governamentais da Receita Federal?',
        terminalCommand: 'dnssec-query --target cav.receita.fazenda.gov.br',
        terminalOutput:
          '[DNSSEC & TLD GOV.BR AUDIT]\nFQDN: cav.receita.fazenda.gov.br\nZone: .gov.br (Estritamente restrito a entes públicos pelo NIC.br)\nIPv4: 161.148.170.15 (Data Center SERPRO - Brasília/DF)\nDNSSEC Status: SECURE (Chave criptográfica assinada pela raiz .br)',
        evidenceResult: {
          status: 'clean',
          headline: 'Domínio governamental restrito e oficial (.gov.br)!',
          details: 'O link aponta estritamente para "cav.receita.fazenda.gov.br". No Brasil, o domínio ".gov.br" é estritamente controlado pelo NIC.br e reservado exclusivamente a órgãos do Estado mediante convênio oficial.',
          forensicFact: 'Golpes se passando pela Receita utilizam domínios como "receita-regulariza.net" ou mandam anexos perigosos (".zip", ".pdf.exe"). Esta notificação direciona ao portal e-CAC oficial sem anexos suspeitos.',
        },
      },
      {
        id: 'clue-8-cross-verification',
        name: 'Auditoria Direta na Caixa Postal e-CAC',
        buttonLabel: 'Consultar Caixa Postal Oficial no e-CAC',
        category: 'behavior',
        question: 'A mesma notificação consta na caixa postal oficial da Receita Federal?',
        terminalCommand: 'ecac-api-query --auth-type cert-token',
        terminalOutput:
          '[E-CAC INDEPENDENT SESSION AUDIT]\nUser Session: Autenticado via Gov.br Prata/Ouro\nCaixa Postal do Contribuinte: 1 mensagem pendente\n  - ID: #DIRPF-2026-MALHA-0588\n  - Assunto: "Comunicado de Retenção em Malha Fiscal - Omissão de Rendimentos"\nIntegrity Match: Correspondência idêntica com a notificação recebida',
        evidenceResult: {
          status: 'clean',
          headline: 'A notificação está confirmada na Caixa Postal do e-CAC!',
          details: 'Ao abrir o navegador independentemente e fazer login no portal "gov.br", a mesma pendência da malha fina e o mesmo código 0588 constam no demonstrativo oficial da declaração.',
          forensicFact: 'A regra de ouro da cibersegurança: quando receber uma notificação alarmista, acesse o serviço oficial por iniciativa própria sem usar os links da mensagem. Se o comunicado existir lá dentro, é 100% legítimo.',
        },
      },
    ],
    isScam: false,
    evidenceHypotheses: [
      'A notificação é uma fraude elaborada pois ameaça cancelar o CPF caso o contribuinte não pague a taxa em 30 dias',
      'Assinatura digital ICP-Brasil com cadeia SERPRO válida, domínio governamental restrito .gov.br e confirmação independente no portal e-CAC',
      'A Receita Federal terceirizou a cobrança tributária para uma fintech de pagamentos instantâneos',
    ],
    correctEvidenceIndex: 1,
    keyEvidenceReason:
      'A validação da cadeia ICP-Brasil e a confirmação na caixa postal do portal oficial e-CAC comprovam a autenticidade jurídica da intimação, sem qualquer elemento de fraude.',
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
        name: 'Decomposição Estrutural de FQDN (Domínio Raiz)',
        buttonLabel: 'Analisar Estrutura do Domínio Raiz',
        category: 'whois',
        question: 'Qual é o verdadeiro domínio registrado que receberá os dados?',
        terminalCommand: 'fqdn-dissector --url "https://login.microsoftonline.com.secure-auth-gateway.org/oauth2"',
        terminalOutput:
          '[FQDN STRUCTURAL DECOMPOSITION]\nInput URL: https://login.microsoftonline.com.secure-auth-gateway.org/oauth2\nTarget Host: login.microsoftonline.com.secure-auth-gateway.org\nSubdomain Prefix: login.microsoftonline.com (Falsa identidade visual)\nRegistered Root Domain: secure-auth-gateway.org\nCreation Date: 2026-09-24T18:02:11Z (menos de 72 horas)',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Técnica de Subdomínio Profundo: o domínio real é "secure-auth-gateway.org"!',
          details: 'A URL começa com o texto "login.microsoftonline.com", mas isso é apenas um subdomínio falso. O domínio raiz registrado é "secure-auth-gateway.org", registrado há menos de 72 horas por atacantes.',
          forensicFact: 'Ataques AiTM enganam os olhos colocando a URL oficial no início do subdomínio para que em telas menores o usuário não veja o final do endereço.',
        },
      },
      {
        id: 'clue-9-reverse-proxy',
        name: 'Detecção de Proxy Reverso e Interceptação de Sessão',
        buttonLabel: 'Auditar Tráfego de Rede (Proxy Reverso)',
        category: 'system',
        question: 'Como o servidor malicioso lida com o código de 2FA legítimo?',
        terminalCommand: 'aitm-traffic-sniffer --endpoint /oauth2/authorize',
        terminalOutput:
          '[REVERSE PROXY (AiTM) FINGERPRINT]\nProxy Tool Detected: Evilginx2 Framework v3.2\nMechanism:\n  1. Vítima envia Usuário + Senha -> Proxy repassa à Microsoft real\n  2. Microsoft emite desafio 2FA -> Proxy repassa ao celular da vítima\n  3. Vítima digita 2FA real -> Proxy intercepta o Cookie "ESTSAuthCookie"\nResult: Token de sessão corporativa clonado sem disparar alarme',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Proxy Reverso em tempo real interceptando o Cookie de Sessão!',
          details: 'O servidor intermediário repassa suas credenciais ao servidor verdadeiro da Microsoft, solicita seu código 2FA real e intercepta o Cookie de Sessão ("ESTSAuthCookie"), assumindo sua conta sem precisar da sua senha novamente!',
          forensicFact: 'Ataques AiTM (como os orquestrados pelo Evilginx2) conseguem burlar até mesmo o 2FA via SMS/App tradicional, pois roubam o token de sessão já autenticado. Apenas chaves FIDO2/Passkeys físicas barram essa técnica.',
        },
      },
      {
        id: 'clue-9-docusign-dashboard',
        name: 'Consulta de Envelopes na API Oficial DocuSign',
        buttonLabel: 'Consultar Painel Oficial da DocuSign',
        category: 'behavior',
        question: 'Consta algum documento pendente no aplicativo oficial da DocuSign?',
        terminalCommand: 'docusign-rest-api --get-inbox-envelopes',
        terminalOutput:
          '[DOCUSIGN DIRECT PLATFORM CHECK]\nAuthenticated User Inbox:\n  - Envelopes Aguardando Assinatura: 0\n  - Envelope "Acordo_Societario_Aditivo_2026.pdf": INEXISTENTE\nSecurity Alert: E-mail não partiu dos servidores autorizados da DocuSign (SPF Fail)',
        evidenceResult: {
          status: 'suspicious',
          headline: 'Nenhum documento pendente na sua conta da DocuSign!',
          details: 'Ao abrir o aplicativo da DocuSign ou logar diretamente em docusign.com, não há nenhum documento ou solicitação pendente de assinatura para seu CPF/e-mail.',
          forensicFact: 'Toda plataforma de assinatura eletrônica armazena os envelopes na caixa de entrada do usuário cadastrado. Se não está no painel oficial, o e-mail é uma armadilha.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'A página é segura pois o código de dois fatores (2FA) recebido no celular funcionou normalmente durante o login',
      'Ataque AiTM utilizando subdomínio profundo para mascarar o domínio real secure-auth-gateway.org e capturar cookies de sessão com proxy reverso',
      'A DocuSign estava com instabilidade temporária no envio de envelopes contratuais pelo aplicativo',
    ],
    correctEvidenceIndex: 1,
    keyEvidenceReason:
      'A decomposição do domínio revelou a arquitetura de Proxy Reverso AiTM (Evilginx), que repassa o 2FA autêntico para roubar o cookie de sessão da conta corporativa.',
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
    icon: '⏳',
  },
  {
    id: 'rule-2',
    target: 'elderly',
    targetLabel: 'Proteção para Idosos & Aposentados',
    title: 'A Regra do Verso do Cartão (Falsa Central)',
    rule: 'Nenhum banco liga pedindo senhas, transferências de teste ou instalação de aplicativos.',
    practicalAction: 'Se ligarem falando de compra suspeita ou clonagem, DESLIGUE. Olhe o telefone no verso do seu cartão físico do banco e ligue você mesmo.',
    icon: '💳',
  },
  {
    id: 'rule-3',
    target: 'kids',
    targetLabel: 'Para Jovens & Crianças',
    title: 'A Regra da Palavra Secreta em Família',
    rule: 'Perfis de WhatsApp e redes sociais podem ser clonados ou criados com fotos públicas.',
    practicalAction: 'Combinem uma palavra secreta entre pais e filhos. Se alguém pedir Pix com número novo dizendo que o celular quebrou, deve falar a palavra secreta.',
    icon: '🔑',
  },
  {
    id: 'rule-4',
    target: 'all',
    targetLabel: 'Para Toda a Família',
    title: 'A Regra do Titular do Pix (Conferir antes da Senha)',
    rule: 'O nome de quem recebe o Pix aparece ANTES de você digitar a senha de 4 ou 6 dígitos.',
    practicalAction: 'A mensagem dizia ser da faculdade, da Cemig ou do seu filho? Olhe o nome do destinatário. Se for pessoa física desconhecida, CANCELE.',
    icon: '👀',
  },
  {
    id: 'rule-5',
    target: 'parents',
    targetLabel: 'Para Pais & Responsáveis',
    title: 'A Regra da Tela Limpa (Golpe da Mão Fantasma)',
    rule: 'Nenhum atendente bancário pode pedir para você instalar AnyDesk, TeamViewer ou similares.',
    practicalAction: 'Aplicativos de controle remoto dão acesso total ao seu celular. Se alguém pedir para baixar ferramenta de suporte para varredura de vírus, desligue.',
    icon: '📱',
  },
  {
    id: 'rule-6',
    target: 'all',
    targetLabel: 'Para Toda a Família',
    title: 'A Regra do Domínio Oficial (.gov.br e .com.br)',
    rule: 'Órgãos governamentais e estatais brasileiras utilizam exclusivamente a terminação .gov.br ou .com.br.',
    practicalAction: 'Correios, Receita Federal, Caixa ou INSS NUNCA usam .net, .site, .online ou .xyz. Se a taxa de importação veio com link estrangeiro, é golpe.',
    icon: '🌐',
  },
  {
    id: 'rule-7',
    target: 'all',
    targetLabel: 'Para Toda a Família',
    title: 'A Regra do Boleto Auditado (Linha Digitável)',
    rule: 'Os 3 primeiros dígitos do boleto indicam o código do banco emissor na câmara de compensação.',
    practicalAction: 'Se o logotipo é do Banco do Brasil (001) mas a linha começa com 237 (Bradesco), o boleto foi fraudado. Confira o Beneficiário Final antes de pagar.',
    icon: '📄',
  },
  {
    id: 'rule-8',
    target: 'kids',
    targetLabel: 'Para Jovens & Crianças',
    title: 'A Regra do "Trabalho Inverso" (Falso Emprego)',
    rule: 'Emprego ou renda extra real NUNCA cobra dinheiro do trabalhador.',
    practicalAction: 'Se uma vaga no Telegram ou WhatsApp disser que você precisa fazer um Pix de recarga para poder sacar seu salário ou comissão, saia na hora.',
    icon: '💼',
  },
  {
    id: 'rule-9',
    target: 'all',
    targetLabel: 'Para Toda a Família',
    title: 'A Regra da Desconfiança de Milagres (Falsas Lojas)',
    rule: 'Preços 70% ou 80% abaixo do mercado em produtos caros são sempre iscas de estelionato.',
    practicalAction: 'iPhone novo por R$ 1.200 ou TV de 65 polegadas por R$ 800 só no Pix são golpes. Antes de comprar, consulte a reputação no Reclame Aqui.',
    icon: '🛒',
  },
  {
    id: 'rule-10',
    target: 'all',
    targetLabel: 'Para Toda a Família',
    title: 'A Regra do MED (Mecanismo Especial de Devolução)',
    rule: 'Se caiu num golpe via Pix, você tem direito de solicitar o bloqueio cautelar dos fundos.',
    practicalAction: 'Entre no app do seu banco em até 80 dias, abra o comprovante do Pix, clique em "Contestar Transação" ou "Relatar Problema" e faça o B.O. online.',
    icon: '🛡️',
  },
];

// ==========================================
// GLOSSÁRIO DE TERMOS FORENSES E DEFESA
// ==========================================
export const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: 'Phishing',
    pronunciation: 'Fí-xin-gui',
    simpleMeaning: 'Pescaria digital. Mensagens falsas que tentam "pescar" suas senhas ou dinheiro.',
    realWorldExample: 'E-mail fingindo ser do banco pedindo recadastramento de senha.',
    pedagogy: 'A isca é a curiosidade ou o medo; o anzol é o link malicioso.',
  },
  {
    term: 'Smishing',
    pronunciation: 'Smi-xin-gui',
    simpleMeaning: 'Phishing enviado por mensagem de texto SMS.',
    realWorldExample: 'SMS dos "Correios" dizendo que sua encomenda foi taxada.',
    pedagogy: 'SMS não tem verificação visual de segurança; qualquer pessoa pode comprar disparos em massa.',
  },
  {
    term: 'BINA Spoofing',
    pronunciation: 'Bina Spú-fin-gui',
    simpleMeaning: 'Técnica que mascara o número de quem está ligando para parecer o número oficial do banco.',
    realWorldExample: 'O golpista liga e na tela do seu celular aparece exatamente o 0800 do seu banco.',
    pedagogy: 'A tecnologia de telefonia pela internet permite falsificar o número exibido na tela com facilidade.',
  },
  {
    term: 'Mão Fantasma (RAT)',
    pronunciation: 'Réti (Remote Access Trojan)',
    simpleMeaning: 'Aplicativo de acesso remoto que permite ao criminoso controlar a tela do seu celular de longe.',
    realWorldExample: 'O golpista pede para você baixar o AnyDesk ou TeamViewer para "remover um vírus".',
    pedagogy: 'Nunca permita que ninguém instale aplicativos de controle remoto no seu aparelho.',
  },
  {
    term: 'Punycode / Ataque Homógrafo',
    pronunciation: 'Pú-ni-cou-di',
    simpleMeaning: 'Uso de letras de outros alfabetos (como o cirílico) que são idênticas ao nosso para clonar links.',
    realWorldExample: 'O site exibe "mercadopago.com.br", mas o "e" é uma letra cirílica oculta.',
    pedagogy: 'O cadeado verde só garante que a conexão é criptografada, não que o site é de quem você pensa.',
  },
  {
    term: 'Adversary-in-the-Middle (AiTM)',
    pronunciation: 'Ed-ver-sé-ri in de mí-dou',
    simpleMeaning: 'Proxy intermediário que espelha o site real em tempo real para roubar senhas e cookies de 2FA.',
    realWorldExample: 'Uma página falsa da Microsoft 365 que pede seu 2FA real e intercepta sua sessão.',
    pedagogy: 'Ataques avançados conseguem repassar seu SMS real para roubar a chave de sessão já conectada.',
  },
  {
    term: 'MED (Mecanismo Especial de Devolução)',
    pronunciation: 'Médi',
    simpleMeaning: 'Ferramenta oficial do Banco Central que permite rastrear e travar dinheiro de golpes no Pix.',
    realWorldExample: 'Você aciona o MED no app do banco até 80 dias após cair no golpe para recuperar o saldo.',
    pedagogy: 'Quanto mais rápido você acionar o MED após a transferência, maior a chance de o saldo não ter sido sacado.',
  },
  {
    term: 'ICP-Brasil',
    pronunciation: 'I-Cê-Pê Brasil',
    simpleMeaning: 'Sistema nacional que emite certificados digitais com validade jurídica equivalente à assinatura de próprio punho.',
    realWorldExample: 'Documentos da Receita Federal e do Judiciário assinados digitalmente por autoridades certificadoras como o SERPRO.',
    pedagogy: 'Documentos do governo com assinatura digital ICP-Brasil válida são 100% autênticos e invioláveis.',
  },
];
