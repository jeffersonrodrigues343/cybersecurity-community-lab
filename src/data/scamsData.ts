export type ScamLevel = 'basico' | 'medio' | 'avancado';

export interface VisualClueInspection {
  type: 'pix' | 'link' | 'contact' | 'security' | 'official' | 'behavior';
  badge: string;
  field1Label: string;
  field1Value: string;
  field2Label: string;
  field2Value: string;
  field3Label?: string;
  field3Value?: string;
  observation: string;
}

export interface InvestigativeClue {
  id: string;
  name: string;
  buttonLabel: string;
  category: 'whois' | 'pix' | 'phone' | 'behavior' | 'system' | 'official';
  question: string;
  inspection: VisualClueInspection;
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
  // NIVEL 1: BASICO (Pistas Visuais e Erros Claros)
  // ==========================================
  {
    id: 'case-1-whatsapp',
    level: 'basico',
    levelTitle: 'Nível 1 • Básico',
    xpReward: 60,
    category: 'WhatsApp & Família',
    title: 'Filho com Celular Quebrado Pedindo Pix',
    dilemma: 'Um número desconhecido manda mensagem com a foto da sua filha dizendo que o celular quebrou e precisa de um Pix urgente de R$ 480 para a faculdade.',
    sender: 'Filha (Número Desconhecido)',
    channel: 'whatsapp',
    time: '14:22',
    preview: 'Oi mãe, anota meu número novo! O celular quebrou...',
    messageContent:
      'Oi mãe! Salva meu número novo aí, por favor. O meu celular antigo caiu no chão e quebrou a tela. Tô usando esse provisório.\n\nPreciso muito de um favor urgente: tenho que pagar uma conta da faculdade até às 15h e meu app do banco ainda não autorizou nesse aparelho. Consegue me transferir um Pix de R$ 480 agora? Te devolvo assim que chegar em casa!\n\nChave Pix: 489.120.392-80',
    clues: [
      {
        id: 'clue-1-ddd',
        name: 'Ficha do Número',
        buttonLabel: 'Ver Detalhes do Contato',
        category: 'phone',
        question: 'De onde é esse número e há quanto tempo foi ativado?',
        inspection: {
          type: 'contact',
          badge: 'Operadora de Telefonia',
          field1Label: 'Número',
          field1Value: '+55 (85) 98124-9912 (DDD 85 - Fortaleza/CE)',
          field2Label: 'Tipo de Linha',
          field2Value: 'Chip Pré-Pago ativado ontem',
          field3Label: 'Sua Família Mora Em',
          field3Value: 'São Paulo/SP (DDD 11)',
          observation: 'O DDD é do Ceará (85), enquanto a família toda mora em São Paulo (11).',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'DDD incompatível e chip comprado ontem!',
          details: 'A linha é do DDD 85 (Ceará), enquanto a família mora em São Paulo (11). O chip foi cadastrado ontem.',
          forensicFact: 'Golpistas compram chips descartáveis de outros estados para aplicar o golpe do parente com número novo.',
        },
      },
      {
        id: 'clue-1-pix',
        name: 'Raio-X da Chave Pix',
        buttonLabel: 'Simular Transferência Pix',
        category: 'pix',
        question: 'Quem vai receber o dinheiro se você transferir?',
        inspection: {
          type: 'pix',
          badge: 'Comprovante do Banco',
          field1Label: 'Titular da Conta',
          field1Value: 'Valdir dos Santos (Pessoa Física)',
          field2Label: 'Banco',
          field2Value: 'Nu Pagamentos S.A. (Conta Digital)',
          field3Label: 'Finalidade Declarada',
          field3Value: 'Mensalidade de Faculdade',
          observation: 'O dinheiro vai para a conta pessoal de um estranho chamado Valdir, e não para uma instituição de ensino.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'A conta pertence a um estranho (laranja)!',
          details: 'A filha diz que é para a faculdade, mas a conta Pix está em nome de um desconhecido chamado Valdir dos Santos.',
          forensicFact: 'Faculdades e empresas cobram por CNPJ oficial ou boleto registrado, nunca por Pix pessoal de terceiros.',
        },
      },
      {
        id: 'clue-1-behavior',
        name: 'Teste da Ligação / Voz',
        buttonLabel: 'Pedir Áudio ou Fazer Chamada',
        category: 'behavior',
        question: 'O contato aceita chamada de voz ou manda mensagem de áudio?',
        inspection: {
          type: 'security',
          badge: 'Comportamento no Chat',
          field1Label: 'Chamada de Voz',
          field1Value: 'Recusada imediatamente ("Tô na aula, não posso atender!")',
          field2Label: 'Mensagem de Áudio',
          field2Value: 'Não enviada ("Microfone do celular provisório tá quebrado")',
          field3Label: 'Pressão Emocional',
          field3Value: '"Preciso pagar até às 15h senão perco a matrícula!"',
          observation: 'O contato se recusa a falar por voz e usa desculpas para manter a conversa apenas por texto.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Recusa sistemática de falar por voz!',
          details: 'O golpista inventa desculpas para não mandar áudio nem atender ligações.',
          forensicFact: 'A regra de ouro da família contra golpes é: nunca transfira sem ouvir a voz real do parente no número antigo.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'O Pix vai para a conta pessoal de um estranho (Valdir) e o DDD é de outro estado.',
      'A faculdade não aceita Pix em feriados municipais.',
      'O WhatsApp foi instalado em um celular sem proteção de tela.',
    ],
    correctEvidenceIndex: 0,
    keyEvidenceReason: 'A conta de destino pertence a um terceiro desconhecido (Valdir dos Santos) com DDD do Ceará, incompatível com a faculdade e com a família.',
    redFlags: [
      'Número desconhecido dizendo ser filho/parente',
      'Desculpa de celular quebrado para justificar número novo',
      'Urgência para transferir dinheiro imediatamente',
      'Conta Pix em nome de pessoa física desconhecida',
    ],
    explanation: 'Este é o clássico golpe do "novo número" no WhatsApp. Os golpistas pegam fotos públicas das redes sociais, compram um chip descartável e inventam que o celular quebrou para pedir dinheiro urgente antes que você consiga checar.',
    realWorldTip: 'Nunca transfira dinheiro para um parente com número novo sem antes ligar para o número ANTIGO dele ou confirmar pessoalmente por voz!',
    pedagogy: {
      emotionalTrigger: 'Urgência e Afeto Familiar (medo de prejudicar os estudos da filha)',
      kidsAnalogy: 'É como alguém na escola colocar a máscara do seu melhor amigo e te pedir seu lanche correndo.',
      parentsGuide: 'Combine uma palavra-chave secreta com seus filhos que só a família sabe.',
      adultRemedy: 'Se transferiu, acione o botão "Contestar Pix / MED" no app do banco nos primeiros 30 minutos.',
      goldenRule: 'Número novo pedindo dinheiro? Ligue no número antigo e fale por voz!',
    },
  },
  {
    id: 'case-2-correios',
    level: 'basico',
    levelTitle: 'Nível 1 • Básico',
    xpReward: 60,
    category: 'SMS & Encomendas',
    title: 'SMS dos Correios: Encomenda Retida na Alfândega',
    dilemma: 'Você recebe um SMS dizendo que uma encomenda sua foi taxada em R$ 27,90 e será devolvida se você não pagar hoje pelo link.',
    sender: '+55 11 98842-1092',
    channel: 'sms',
    time: '11:05',
    preview: 'Correios: Encomenda retida na fiscalizacao. Pague a taxa...',
    messageContent:
      'CORREIOS AVISO: Seu pacote com codigo NL8392019BR foi retido na fiscalizacao aduaneira. Ha uma taxa de importacao pendente de R$ 27,90. Evite a devolucao pagando hoje no link oficial: https://correios-taxas-alfandega.online/pagar',
    clues: [
      {
        id: 'clue-2-url',
        name: 'Raio-X do Link',
        buttonLabel: 'Inspecionar Endereço do Site',
        category: 'whois',
        question: 'O link pertence realmente aos Correios?',
        inspection: {
          type: 'link',
          badge: 'Inspetor de Links',
          field1Label: 'Link Enviado no SMS',
          field1Value: 'correios-taxas-alfandega.online',
          field2Label: 'Site Oficial dos Correios',
          field2Value: 'correios.com.br (sempre termina em .com.br)',
          field3Label: 'Idade do Endereço',
          field3Value: 'Criado há 3 dias na Rússia',
          observation: 'O site termina em .online e foi registrado há apenas 3 dias, fora do Brasil.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Site falso registrado há 3 dias!',
          details: 'O link enviado termina em .online e foi criado há 3 dias. O site oficial dos Correios é apenas correios.com.br.',
          forensicFact: 'Empresas públicas brasileiras sempre usam domínios oficiais terminados em .com.br ou .gov.br.',
        },
      },
      {
        id: 'clue-2-rastreio',
        name: 'Consulta de Rastreio Oficial',
        buttonLabel: 'Verificar Código no App dos Correios',
        category: 'system',
        question: 'Esse código de pacote existe no sistema dos Correios?',
        inspection: {
          type: 'official',
          badge: 'Banco de Dados dos Correios',
          field1Label: 'Código Informado',
          field1Value: 'NL8392019BR',
          field2Label: 'Resultado no App Oficial',
          field2Value: 'Objeto não encontrado na base de dados',
          field3Label: 'Forma Correta de Pagamento',
          field3Value: 'Portal oficial "Minhas Importações" no correios.com.br',
          observation: 'O código de rastreio é inventado e não existe no sistema oficial dos Correios.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Código de rastreio falso!',
          details: 'Ao buscar o código no aplicativo oficial dos Correios, o pacote simplesmente não existe.',
          forensicFact: 'Taxas de importação legítimas só podem ser pagas logando com Gov.br no portal Minhas Importações dos Correios.',
        },
      },
      {
        id: 'clue-2-remetente',
        name: 'Número do Remetente',
        buttonLabel: 'Checar Origem do SMS',
        category: 'phone',
        question: 'Quem mandou esse SMS?',
        inspection: {
          type: 'contact',
          badge: 'Canal de Mensagem',
          field1Label: 'Número Remetente',
          field1Value: '+55 (11) 98842-1092 (Celular Comum)',
          field2Label: 'Canal Oficial dos Correios',
          field2Value: 'Número curto de 5 dígitos (ex: 28588)',
          field3Label: 'Cobrança por SMS',
          field3Value: 'Correios nunca enviam link direto de Pix por SMS',
          observation: 'Mensagem enviada por um celular comum, e não pelo canal corporativo oficial.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Enviado por celular comum em vez de número corporativo!',
          details: 'Empresas oficiais usam códigos curtos (shortcodes) de 5 dígitos, nunca celulares pré-pagos comuns.',
          forensicFact: 'Golpistas compram pacotes de disparo de SMS em massa usando números de telefone celular descartáveis.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'O link termina em .online (site pirata falso) e o código de rastreio não existe no app oficial.',
      'O valor de R$ 27,90 é muito barato para taxas de importação federais.',
      'O SMS chegou durante o horário comercial dos Correios.',
    ],
    correctEvidenceIndex: 0,
    keyEvidenceReason: 'O link enviado no SMS leva a um site falso (correios-taxas-alfandega.online) e o código de rastreio sequer existe no sistema oficial.',
    redFlags: [
      'Link com final estranho (.online em vez de correios.com.br)',
      'SMS enviado por celular comum de 9 dígitos',
      'Urgência para pagar taxa no mesmo dia',
      'Cobrança direta de Pix em página não oficial',
    ],
    explanation: 'Golpe do Smishing dos Correios. Os criminosos disparam milhões de SMS aleatórios torcendo para que alguém que comprou online recentemente se assuste e pague a suposta taxa.',
    realWorldTip: 'Nunca clique em links de SMS sobre encomendas. Abra o site correios.com.br você mesmo e digite o código no rastreamento oficial!',
    pedagogy: {
      emotionalTrigger: 'Curiosidade e Medo de Perder a Encomenda',
      kidsAnalogy: 'É como receber uma cartinha na caixa de correio com letra de estranho dizendo que sua figurinha rara foi confiscada.',
      parentsGuide: 'Ensine a família a nunca clicar em links de SMS. Sempre consulte pelo aplicativo oficial.',
      adultRemedy: 'Se pagou o Pix falso, tire prints da tela e abra contestação MED imediata no app do seu banco.',
      goldenRule: 'Correios nunca mandam link de Pix por SMS!',
    },
  },
  {
    id: 'case-3-compra-aprovada',
    level: 'basico',
    levelTitle: 'Nível 1 • Básico',
    xpReward: 60,
    category: 'Segurança & Cartão',
    title: 'Notificação do App do Banco: Compra no Cartão',
    dilemma: 'Seu celular vibra com uma notificação do aplicativo oficial do seu banco informando uma compra de R$ 34,90 em uma padaria do seu bairro.',
    sender: 'App Nubank (Notificação Oficial)',
    channel: 'sms',
    time: '08:45',
    preview: 'Compra aprovada de R$ 34,90 em Padaria Estrela...',
    messageContent:
      'Compra aprovada no seu Cartão de Débito:\nValor: R$ 34,90\nEstabelecimento: Padaria Estrela\nHoje às 08:44\n\nSe você não reconhece esta transação, toque aqui para abrir o app oficial e bloquear seu cartão temporariamente.',
    clues: [
      {
        id: 'clue-3-canal',
        name: 'Origem da Notificação',
        buttonLabel: 'Verificar Canal do Aviso',
        category: 'system',
        question: 'De onde veio essa notificação?',
        inspection: {
          type: 'official',
          badge: 'Sistema Operacional',
          field1Label: 'Aplicativo Emissor',
          field1Value: 'Nubank (Instalado da Google Play / App Store)',
          field2Label: 'Tipo de Notificação',
          field2Value: 'Push Notification Oficial do App',
          field3Label: 'Presença de Links Externos',
          field3Value: 'Nenhum link para site de internet',
          observation: 'A notificação foi gerada pelo próprio aplicativo do banco instalado no seu celular, sem links externos.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Notificação legítima do próprio app oficial!',
          details: 'A mensagem foi gerada internamente pelo aplicativo oficial do banco já instalado.',
          forensicFact: 'Notificações push autênticas de aplicativos instalados não contêm links para navegadores web desconhecidos.',
        },
      },
      {
        id: 'clue-3-dados',
        name: 'Solicitação de Dados',
        buttonLabel: 'Checar se Pede Senhas ou Pix',
        category: 'behavior',
        question: 'A mensagem pede para você fazer transferência ou digitar senhas?',
        inspection: {
          type: 'security',
          badge: 'Auditoria de Segurança',
          field1Label: 'Pede Senha?',
          field1Value: 'Não',
          field2Label: 'Pede para Fazer Pix?',
          field2Value: 'Não',
          field3Label: 'Ação Recomendada',
          field3Value: 'Apenas verificar no app se reconhece a compra',
          observation: 'A notificação apenas informa a compra e não pede nenhuma ação financeira perigosa.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Nenhuma solicitação de senha ou dinheiro!',
          details: 'O banco não pede para ligar em números suspeitos nem pede transferências.',
          forensicFact: 'Comunicações de segurança legítimas apenas alertam o cliente e não exigem transferências de emergência.',
        },
      },
      {
        id: 'clue-3-fatura',
        name: 'Extrato da Conta',
        buttonLabel: 'Consultar Extrato Oficial',
        category: 'pix',
        question: 'A compra realmente aparece na sua conta?',
        inspection: {
          type: 'official',
          badge: 'Extrato em Tempo Real',
          field1Label: 'Lançamento',
          field1Value: 'R$ 34,90 - Padaria Estrela',
          field2Label: 'Horário',
          field2Value: 'Há 1 minuto (quando você comprou o café da manhã)',
          field3Label: 'Cartão Utilizado',
          field3Value: 'Cartão Físico com aproximação',
          observation: 'A transação corresponde exatamente ao pão de queijo e café que você acabou de pagar na padaria.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Transação real feita por você mesmo!',
          details: 'O valor e o local correspondem à sua compra recente na padaria.',
          forensicFact: 'Muitos usuários se assustam por engano com notificações normais de compras feitas por aproximação.',
        },
      },
    ],
    isScam: false,
    evidenceHypotheses: [
      'A notificação é um push legítimo do app oficial confirmando uma compra real feita por você.',
      'O banco foi clonado porque enviou o nome da padaria sem pedir CPF.',
      'A mensagem é falsa porque compras legítimas só chegam por carta registrada.',
    ],
    correctEvidenceIndex: 0,
    keyEvidenceReason: 'A notificação é uma confirmação autêntica em tempo real emitida pelo app oficial do banco referente à sua compra recente.',
    redFlags: [],
    explanation: 'Esta notificação é 100% LEGÍTIMA. Aplicativos bancários modernos notificam toda compra para proteger você. É importante saber diferenciar alertas normais de golpes reais para não entrar em pânico.',
    realWorldTip: 'Mantenha as notificações do seu app de banco ativadas! Elas te avisam na hora se alguém clonar seu cartão.',
    pedagogy: {
      emotionalTrigger: 'Alerta Natural de Vigilância Financeira',
      kidsAnalogy: 'É como a campainha da sua casa que toca quando sua mãe chega com as compras.',
      parentsGuide: 'Ensine seus filhos a conferirem o extrato do banco toda vez que usarem o cartão por aproximação.',
      adultRemedy: 'Se realmente não reconhecer a compra no app, use a função "Bloquear Cartão" direto no aplicativo oficial.',
      goldenRule: 'Notificação do app oficial sem link externo é proteção, não golpe!',
    },
  },

  // ==========================================
  // NIVEL 2: MEDIO (Engenharia Social e Spoofing)
  // ==========================================
  {
    id: 'case-4-falsa-central',
    level: 'medio',
    levelTitle: 'Nível 2 • Médio',
    xpReward: 100,
    category: 'Ligação & Falsa Central',
    title: 'Ligação do "Banco": 0800 com BINA Falsificada',
    dilemma: 'Você recebe uma ligação onde o visor do celular exibe exatamente o número 0800 oficial do seu banco. Uma voz profissional diz que sua conta foi invadida e pede que você transfira para a conta segura.',
    sender: '0800 729 0001 (Visor do Banco)',
    channel: 'call',
    time: '16:40',
    preview: 'Chamada de voz: Detectamos tentativa de compra de R$ 2.800...',
    messageContent:
      'LIGAÇÃO TELEFÔNICA RECEBIDA:\n\nAtendente: "Olá, falo com o titular? Aqui é da Central de Prevenção a Fraudes do Banco. Identificamos uma tentativa de transferência Pix suspeita de R$ 2.800 para Lucas Almeida em São Paulo. O senhor confirma essa operação?"\n\nVocê: "Não, não fui eu!"\n\nAtendente: "Perfeito, senhor. Para cancelar essa transação e proteger seu saldo antes que seja debitado, o senhor precisa abrir seu app agora e transferir o valor disponível para nossa Conta Cofre de Segurança Provisória do Banco Central. Eu vou te passar a chave Pix de segurança..."',
    clues: [
      {
        id: 'clue-4-pix-seguro',
        name: 'O Pedido do Atendente',
        buttonLabel: 'Analisar Procedimento Solicitado',
        category: 'behavior',
        question: 'Bancos pedem Pix para cancelar compras ou estornar dinheiro?',
        inspection: {
          type: 'security',
          badge: 'Regra Oficial do Banco Central',
          field1Label: 'Procedimento do Golpista',
          field1Value: 'Fazer um Pix para uma "Conta Cofre Provisória"',
          field2Label: 'Procedimento Real do Banco',
          field2Value: 'O banco cancela a fraude internamente no sistema',
          field3Label: 'Regra de Ouro Bancária',
          field3Value: 'BANCO NUNCA PEDE PIX PARA CANCELAR TRANSAÇÃO',
          observation: 'Nenhum banco ou funcionário do Banco Central jamais solicita transferência para proteger ou estornar dinheiro.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'O banco NUNCA pede Pix para cancelar compras!',
          details: 'Quando há uma fraude real, o banco bloqueia a transação internamente. Pedir Pix para "conta de segurança" é golpe garantido.',
          forensicFact: 'O "Golpe da Falsa Central" é responsável por mais de 40% das perdas financeiras de idosos e adultos no Brasil.',
        },
      },
      {
        id: 'clue-4-bina',
        name: 'Raio-X do Número no Visor',
        buttonLabel: 'Checar como o 0800 Aparece no Visor',
        category: 'phone',
        question: 'O número 0800 na tela do celular garante que é o banco?',
        inspection: {
          type: 'contact',
          badge: 'Tecnologia de Telefonia',
          field1Label: 'Número Exibido na Tela',
          field1Value: '0800 729 0001 (Igual ao do verso do cartão)',
          field2Label: 'Técnica Utilizada',
          field2Value: 'BINA Spoofing (Mascaramento de chamada via internet)',
          field3Label: 'Como Funciona',
          field3Value: 'Softwares ilegais permitem digitar qualquer número na tela de quem recebe',
          observation: 'Criminosos conseguem programar centrais voip para exibir o 0800 real do banco no visor do seu celular.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Número mascarado por tecnologia de falsificação (Spoofing)!',
          details: 'O criminoso usa tecnologia de telefonia via internet para alterar o número que aparece no visor do seu telefone.',
          forensicFact: 'Centrais 0800 de bancos são configuradas apenas para RECEBER ligações, quase nunca para fazer chamadas ativas para clientes.',
        },
      },
      {
        id: 'clue-4-chave-pix',
        name: 'A "Chave de Segurança"',
        buttonLabel: 'Verificar Titular da Chave Informada',
        category: 'pix',
        question: 'Quem é o dono da conta que o atendente passou?',
        inspection: {
          type: 'pix',
          badge: 'Consulta de Chave Pix',
          field1Label: 'Nome Fantasia Dito',
          field1Value: '"Cofre de Segurança do Banco Central"',
          field2Label: 'Titular Real no Banco',
          field2Value: 'Marcos Vinicius da Silva (Conta Física)',
          field3Label: 'Tipo de Conta',
          field3Value: 'Conta em banco digital aberta recentemente',
          observation: 'A suposta conta de segurança é na verdade a conta de um "laranja" comparsa dos golpistas.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'A conta de segurança é a conta de um comparsa!',
          details: 'Se você fizer o Pix, o dinheiro vai direto para a conta de uma pessoa física e some em segundos.',
          forensicFact: 'Não existe "conta cofre", "chave de segurança" ou "conta garantidora" no sistema financeiro nacional.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'O atendente pediu para fazer um Pix para uma "conta de segurança" (bancos nunca pedem Pix para cancelar transações).',
      'A ligação durou mais de 5 minutos, o que não é permitido pela Anatel.',
      'O atendente falou com sotaque de outro estado brasileiro.',
    ],
    correctEvidenceIndex: 0,
    keyEvidenceReason: 'Nenhuma instituição financeira solicita que o cliente realize um Pix para estornar transações ou proteger saldo.',
    redFlags: [
      'Ligação dizendo que a conta foi invadida',
      'Pressão psicológica para agir rápido sem desligar',
      'Pedido para fazer Pix para "conta segura" ou "estorno"',
      'Uso de simulação do número oficial no visor (spoofing)',
    ],
    explanation: 'Este é o temido "Golpe da Falsa Central Telefônica". Os golpistas usam vozes treinadas, efeitos de fundo de call center e mascaram o número no visor do celular para parecer o número oficial do banco.',
    realWorldTip: 'Recebeu ligação do banco falando de compra suspeita? DESLIGUE NA HORA! Pegue seu cartão físico e ligue você mesmo para o número do verso.',
    pedagogy: {
      emotionalTrigger: 'Pânico Financeiro (medo de perder todas as economias da conta)',
      kidsAnalogy: 'É como alguém fingir que é o diretor da escola no interfone dizendo para você entregar sua mochila.',
      parentsGuide: 'Avise pais e avós: o banco NUNCA liga pedindo para fazer Pix ou transferir saldo.',
      adultRemedy: 'Desligue e espere 5 minutos (para limpar a linha telefônica) antes de discar para o número oficial.',
      goldenRule: 'O banco NUNCA liga pedindo para você fazer um Pix!',
    },
  },
  {
    id: 'case-5-loja-falsa-promocao',
    level: 'medio',
    levelTitle: 'Nível 2 • Médio',
    xpReward: 100,
    category: 'Comércio & Redes Sociais',
    title: 'Anúncio no Instagram: Air Fryer com 85% de Desconto',
    dilemma: 'Um anúncio patrocinado no Instagram mostra uma famosa rede varejista liquidando Air Fryers Philips Walita de R$ 699 por apenas R$ 119 no Pix por tempo limitado.',
    sender: 'Magazine Luiza Ofertas (Anúncio Patrocinado)',
    channel: 'social',
    time: '20:15',
    preview: 'Mega Queima de Estoque! Air Fryer por apenas R$ 119...',
    messageContent:
      'MEGA QUEIMA DE ESTOQUE EXCLUSIVA!\n\nAir Fryer Philips Walita Série 3000 de R$ 699,00 por apenas R$ 119,90 no Pix!\n\nÚltimas 14 unidades no depósito por motivo de renovação de estoque. Frete Grátis para todo o Brasil!\n\nCompre agora pelo site oficial da promoção: https://magazineluiza-queima-estoque.shop/produto/airfryer',
    clues: [
      {
        id: 'clue-5-link',
        name: 'Raio-X do Link da Loja',
        buttonLabel: 'Verificar Endereço Web',
        category: 'whois',
        question: 'O link é realmente do Magazine Luiza?',
        inspection: {
          type: 'link',
          badge: 'Verificador de Domínio',
          field1Label: 'Link do Anúncio',
          field1Value: 'magazineluiza-queima-estoque.shop',
          field2Label: 'Site Oficial Verdadeiro',
          field2Value: 'magazineluiza.com.br (sempre magazineluiza.com.br)',
          field3Label: 'Final do Domínio',
          field3Value: '.shop (domínio barato usado em fraudes)',
          observation: 'O site adicionou palavras extras ("-queima-estoque") e termina em .shop, não é o site oficial.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Domínio falso mascarado com nome da loja!',
          details: 'Grandes varejistas brasileiras sempre usam seus domínios principais (.com.br), nunca finais como .shop ou .top criados para golpes.',
          forensicFact: 'Criminosos clonam o design exato das lojas em minutos usando templates pirateados.',
        },
      },
      {
        id: 'clue-5-pagamento',
        name: 'Forma de Pagamento no Carrinho',
        buttonLabel: 'Testar Meios de Pagamento',
        category: 'pix',
        question: 'O site aceita cartão de crédito normal?',
        inspection: {
          type: 'security',
          badge: 'Simulação de Checkout',
          field1Label: 'Cartão de Crédito',
          field1Value: 'Dá "Erro no sistema de cartões, tente Pix"',
          field2Label: 'Boleto Bancário',
          field2Value: 'Desativado "temporariamente"',
          field3Label: 'Única Opção que Funciona',
          field3Value: 'Pix com QR Code imediato com 10 minutos para pagar',
          observation: 'A loja força o cliente a pagar exclusivamente por Pix, pois Pix não pode ser cancelado facilmente.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Força o pagamento exclusivo por Pix!',
          details: 'Lojas falsas desativam propositalmente o cartão de crédito porque compras com cartão podem ser canceladas via chargeback.',
          forensicFact: 'Lojas falsas só aceitam Pix porque o dinheiro cai imediatamente na conta dos criminosos.',
        },
      },
      {
        id: 'clue-5-preco',
        name: 'Preço Praticado no Mercado',
        buttonLabel: 'Comparar Preço em Lojas Reais',
        category: 'behavior',
        question: 'Esse preço é plausível no comércio real?',
        inspection: {
          type: 'official',
          badge: 'Comparador de Preços',
          field1Label: 'Preço no Anúncio',
          field1Value: 'R$ 119,90 (Desconto de 83%)',
          field2Label: 'Preço Médio nas Lojas Concorrentes',
          field2Value: 'R$ 580,00 a R$ 680,00',
          field3Label: 'Preço de Custo de Fábrica',
          field3Value: 'Aproximadamente R$ 380,00',
          observation: 'O produto está sendo vendido por um terço do valor de custo de fabricação. Preço milagroso não existe.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Preço milagroso totalmente fora da realidade!',
          details: 'Nenhuma loja vende mercadorias de alta demanda abaixo do custo de fábrica.',
          forensicFact: 'O gatilho da ganância e da oportunidade imperdível é o mais explorado em golpes de comércio eletrônico nas redes sociais.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'O endereço é falso (magazineluiza-queima-estoque.shop), o site só aceita Pix e o desconto de 85% é irreal.',
      'O anúncio foi publicado à noite, horário em que as lojas físicas estão fechadas.',
      'A marca Philips Walita não fabrica eletrodomésticos para o mercado brasileiro.',
    ],
    correctEvidenceIndex: 0,
    keyEvidenceReason: 'O link leva a um site clonado (.shop) que força o pagamento via Pix e pratica preço incompatível com a realidade de mercado.',
    redFlags: [
      'Desconto absurdo de mais de 80% em produto desejado',
      'Endereço do site estranho (.shop com traços no meio)',
      'Forçamento de pagamento somente por Pix',
      'Anúncio em rede social com urgência artificial',
    ],
    explanation: 'Golpe da Loja Falsa / Clonada no Instagram. Os golpistas pagam anúncios patrocinados que direcionam para um site clone idêntico ao original. Quem paga o Pix nunca recebe o produto.',
    realWorldTip: 'Viu uma promoção incrível em rede social? Não clique no link do anúncio! Abra seu navegador, digite o site oficial da loja ou abra o aplicativo oficial e procure pelo produto.',
    pedagogy: {
      emotionalTrigger: 'Ganância e Oportunismo ("Se eu não comprar agora, vou perder")',
      kidsAnalogy: 'É como um anúncio na internet prometendo 10.000 Robux de graça se você pagar R$ 10 no Pix.',
      parentsGuide: 'Ensine que "quando a esmola é demais, o santo desconfia". Descontos acima de 50% em eletrônicos famosos são quase sempre golpes.',
      adultRemedy: 'Denuncie o anúncio no Instagram e nunca faça Pix para compras em sites desconhecidos.',
      goldenRule: 'Promoção boa demais? Entre no site oficial digitando pelo navegador!',
    },
  },
  {
    id: 'case-6-sms-seguranca-real',
    level: 'medio',
    levelTitle: 'Nível 2 • Médio',
    xpReward: 100,
    category: 'Segurança & 2FA',
    title: 'SMS com Código de 2 Fatores Solicitado por Você',
    dilemma: 'Você acabou de digitar seu login no site do banco pelo seu computador e, 3 segundos depois, recebe um SMS com um código de segurança.',
    sender: 'Banco do Brasil (28588)',
    channel: 'sms',
    time: '15:10',
    preview: 'BB: Seu codigo de autorizacao e 739102. NUNCA informe...',
    messageContent:
      'BB: Seu codigo de acesso para login no computador e: 739102.\n\nValido por 5 minutos.\n\nATENCAO: O Banco do Brasil NUNCA liga pedindo este codigo. Nao compartilhe com ninguem, nem mesmo com funcionarios do banco.',
    clues: [
      {
        id: 'clue-6-contexto',
        name: 'Contexto da Solicitação',
        buttonLabel: 'Verificar Ação Recente',
        category: 'system',
        question: 'Você acabou de fazer alguma ação que justificasse esse SMS?',
        inspection: {
          type: 'official',
          badge: 'Sessão de Acesso',
          field1Label: 'Sua Ação',
          field1Value: 'Você acabou de digitar senha no computador oficial',
          field2Label: 'Intervalo de Tempo',
          field2Value: 'Recebido 3 segundos após você clicar em "Entrar"',
          field3Label: 'Pedido Inesperado?',
          field3Value: 'Não! Foi uma solicitação direta sua',
          observation: 'O código chegou em resposta imediata a uma ação voluntária sua de login.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Envio imediato em resposta direta ao seu login!',
          details: 'O SMS foi gerado exatamente no instante em que você solicitou acesso no computador.',
          forensicFact: 'Autenticação de dois fatores legítima ocorre em sincronia direta com a ação voluntária do usuário.',
        },
      },
      {
        id: 'clue-6-numero',
        name: 'Shortcode do Remetente',
        buttonLabel: 'Checar Número do Remetente',
        category: 'phone',
        question: 'O SMS veio de um número corporativo oficial?',
        inspection: {
          type: 'contact',
          badge: 'Operadora de Mensageria',
          field1Label: 'Número Remetente',
          field1Value: '28588 (Código Curto / Shortcode Homologado)',
          field2Label: 'Proprietário do Código',
          field2Value: 'Banco do Brasil S.A. (Homologado na Anatel)',
          field3Label: 'Contém Links de Internet?',
          field3Value: 'Nenhum link! Apenas o código numérico',
          observation: 'O SMS veio do shortcode oficial de 5 dígitos do Banco do Brasil, sem links perigosos.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Canal oficial de shortcode bancário de 5 dígitos!',
          details: 'O número 28588 é o canal de mensageria oficial registrado do Banco do Brasil.',
          forensicFact: 'Shortcodes de 5 dígitos são rigorosamente auditados pelas operadoras de telefonia e custam caro para serem mantidos.',
        },
      },
      {
        id: 'clue-6-aviso',
        name: 'Texto de Orientação de Segurança',
        buttonLabel: 'Ler Instruções de Segurança do Texto',
        category: 'behavior',
        question: 'O que o próprio banco avisa dentro da mensagem?',
        inspection: {
          type: 'security',
          badge: 'Alerta Antifraude',
          field1Label: 'Aviso Explícito',
          field1Value: '"O Banco do Brasil NUNCA liga pedindo este código"',
          field2Label: 'Pede para Clicar em Algum Lugar?',
          field2Value: 'Não! Nenhum link presente',
          field3Label: 'Pede para Ligar para Algum Número?',
          field3Value: 'Não!',
          observation: 'A mensagem reforça ativamente que funcionários nunca pedirão esse código.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Alerta antifraude explícito na mensagem!',
          details: 'A mensagem cumpre todas as boas práticas de segurança: sem links, sem pedidos de ligação e alertando contra golpistas.',
          forensicFact: 'Golpistas tentam roubar esses códigos legítimos ligando para você e pedindo para "confirmar o código para cancelar a fraude".',
        },
      },
    ],
    isScam: false,
    evidenceHypotheses: [
      'É um código de segurança legítimo (2FA) solicitado por você mesmo para entrar no seu banco.',
      'É golpe porque qualquer mensagem com código de 6 dígitos é vírus no celular.',
      'O Banco do Brasil foi invadido porque o SMS não veio assinado com carimbo físico.',
    ],
    correctEvidenceIndex: 0,
    keyEvidenceReason: 'O SMS foi gerado por solicitação direta do usuário, enviado por canal oficial homologado (28588) e contém código de autenticação legítimo sem links.',
    redFlags: [],
    explanation: 'Mensagem 100% LEGÍTIMA. Trata-se da Autenticação em Duas Etapas (2FA). O perigo acontece se alguém te ligar pedindo esse código — NUNCA passe esse número para ninguém que te ligar!',
    realWorldTip: 'Códigos recebidos por SMS são como a chave da sua casa: use você mesmo na tela onde você pediu, mas NUNCA leia nem envie para ninguém que te pedir por telefone ou WhatsApp!',
    pedagogy: {
      emotionalTrigger: 'Dúvida Saudável sobre Códigos de Acesso',
      kidsAnalogy: 'É como a senha do cofrinho que você usa para abrir, mas se alguém pedir para você contar, você não conta.',
      parentsGuide: 'Explique que códigos de SMS servem apenas para a própria pessoa digitar onde ela mesma abriu.',
      adultRemedy: 'Se alguém te ligar pedindo o código recebido, desligue imediatamente.',
      goldenRule: 'Código de SMS é pessoal: nunca passe para ninguém por telefone!',
    },
  },

  // ==========================================
  // NIVEL 3: AVANCADO (Golpes Modernos & Risco Real)
  // ==========================================
  {
    id: 'case-7-vaga-tarefas',
    level: 'avancado',
    levelTitle: 'Nível 3 • Avançado',
    xpReward: 150,
    category: 'Emprego & Vagas Falsas',
    title: 'Vaga de Trabalho Remoto: R$ 350/dia para Curtir Vídeos',
    dilemma: 'Uma recrutadora te chama no WhatsApp oferecendo trabalho flexível de meio período para avaliar marcas e curtir vídeos no YouTube. No primeiro dia você ganha R$ 20 de verdade no Pix, mas no segundo pedem um depósito de R$ 100 para liberar tarefas VIP.',
    sender: 'Larissa - RH Shopee Brasil',
    channel: 'whatsapp',
    time: '09:30',
    preview: 'Ola! Vaga home office disponivel. Ganhe de R$ 100 a R$ 500...',
    messageContent:
      'Olá! Sou a Larissa, recrutadora de talentos da Shopee Brasil. Selecionamos seu perfil para nossa equipe de otimização de e-commerce.\n\nTrabalho 100% online pelo celular, dedicando apenas 30 minutos por dia para curtir produtos e avaliar lojas. Pagamento diário via Pix entre R$ 150 e R$ 500.\n\nPara começar e fazer o teste remunerado de R$ 20 agora, entre no nosso grupo de trabalho do Telegram: https://t.me/shopee_tarefas_vip',
    clues: [
      {
        id: 'clue-7-mecanica',
        name: 'Mecânica das Tarefas Remuneradas',
        buttonLabel: 'Analisar Dinâmica do Trabalho',
        category: 'behavior',
        question: 'Como funciona esse suposto emprego?',
        inspection: {
          type: 'security',
          badge: 'Investigação Trabalhista',
          field1Label: 'Primeira Tarefa',
          field1Value: 'Curtir 3 vídeos no YouTube e mandar print',
          field2Label: 'O que Acontece a Seguir',
          field2Value: 'Eles realmente te mandam R$ 20 no Pix (Isca para ganhar confiança!)',
          field3Label: 'O Golpe Real (Dia Seguinte)',
          field3Value: 'Exigem que você deposite R$ 100 ou R$ 500 para "liberar tarefas que pagam o dobro"',
          observation: 'O modelo é o clássico "Golpe da Tarefa / Pirâmide": pagam trocados no início para depois roubar depósitos de milhares de reais.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Golpe da Tarefa: Isca inicial para roubar depósitos maiores!',
          details: 'Os criminosos pagam um valor simbólico no primeiro dia para a vítima achar que é sério. Depois exigem depósitos crescentes para liberar o dinheiro.',
          forensicFact: 'A Polícia Civil já registrou vítimas que perderam mais de R$ 50.000 no golpe das tarefas no Telegram tentando recuperar o dinheiro investido.',
        },
      },
      {
        id: 'clue-7-canal-rh',
        name: 'Canal Oficial de Recrutamento',
        buttonLabel: 'Consultar Políticas da Empresa Citada',
        category: 'system',
        question: 'A Shopee ou grandes empresas contratam por grupos do Telegram?',
        inspection: {
          type: 'official',
          badge: 'Políticas Oficiais da Shopee',
          field1Label: 'Como a Shopee Contrata',
          field1Value: 'Apenas pelo site oficial (careers.shopee.com.br) ou LinkedIn verificado',
          field2Label: 'Uso de Telegram para Tarefas',
          field2Value: 'TOTALMENTE PROIBIDO e classificado como fraude oficial',
          field3Label: 'Exigência de Pagamento para Trabalhar',
          field3Value: 'EMPRESA NENHUMA COBRA DINHEIRO PARA CONTRATAR FUNCIONÁRIO',
          observation: 'Nenhum emprego legítimo exige que você pague dinheiro para ter o direito de trabalhar.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Empresas reais nunca cobram para você trabalhar!',
          details: 'A Shopee não contrata por grupos de Telegram nem solicita pagamentos prévios de candidatos.',
          forensicFact: 'Se você precisa pagar para receber seu salário, você não é funcionário: é a vítima de um esquema de pirâmide financeira.',
        },
      },
      {
        id: 'clue-7-proposta',
        name: 'Proporção Salarial',
        buttonLabel: 'Comparar Rendimento Prometido',
        category: 'pix',
        question: 'R$ 500 por dia para curtir vídeos faz sentido econômico?',
        inspection: {
          type: 'security',
          badge: 'Análise de Mercado de Trabalho',
          field1Label: 'Rendimento Prometido',
          field1Value: 'R$ 350 a R$ 500 por dia (R$ 10.000 a R$ 15.000/mês)',
          field2Label: 'Exigência de Qualificação',
          field2Value: 'Nenhuma (apenas dar cliques no celular)',
          field3Label: 'Salário Médio de Profissionais com Ensino Superior',
          field3Value: 'R$ 3.500 a R$ 5.000/mês',
          observation: 'Promessa de salário de diretor de empresa para dar likes em vídeos é matematicamente impossível.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Promessa salarial irreal para tarefas sem qualificação!',
          details: 'Nenhum negócio do mundo paga R$ 500 por dia para uma pessoa curtir vídeos de 30 segundos.',
          forensicFact: 'Criminosos exploram a vulnerabilidade de pessoas desempregadas ou que buscam renda extra rápida.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'É o golpe das tarefas: prometem dinheiro fácil por likes, pagam um trocado de isca e depois exigem depósitos para liberar saques.',
      'A vaga é verdadeira, mas o salário sofre desconto do INSS e IRPF na fonte.',
      'A Shopee só contrata pessoas que já possuem carteira assinada há mais de 10 anos.',
    ],
    correctEvidenceIndex: 0,
    keyEvidenceReason: 'Trata-se do Golpe das Tarefas no Telegram: promessa de ganhos astronômicos com cliques, que logo evolui para a exigência de depósitos em dinheiro da vítima.',
    redFlags: [
      'Contato inesperado de RH no WhatsApp',
      'Migração da conversa para grupos fechados do Telegram',
      'Promessa de até R$ 500/dia para tarefas simplórias como curtidas',
      'Exigência de "depósito de garantia" para liberar saques',
    ],
    explanation: 'O "Golpe da Renda Extra / Tarefas do Telegram" é uma das fraudes mais prejudiciais da atualidade. A vítima recebe pequenas quantias no começo para confiar, mas quando deposita R$ 500 ou R$ 2.000 para a "tarefa VIP", os golpistas bloqueiam a conta e somem.',
    realWorldTip: 'REGRA DE OURO DO TRABALHO: Se uma vaga de emprego exige que você PAGUE qualquer valor antes de receber, é golpe 100% de certeza!',
    pedagogy: {
      emotionalTrigger: 'Necessidade de Renda Extra e Esperança de Trabalho Fácil',
      kidsAnalogy: 'É como alguém prometer que vai trocar sua moeda de R$ 1 por uma nota de R$ 100, mas só se você der R$ 50 primeiro.',
      parentsGuide: 'Adolescentes e universitários são o alvo favorito desse golpe. Converse abertamente sobre como funciona o mercado de trabalho real.',
      adultRemedy: 'Nunca transfira dinheiro de "garantia de tarefa". Se já transferiu, registre boletim de ocorrência e acione o MED no banco.',
      goldenRule: 'Trabalho de verdade NUNCA pede para você pagar para ser contratado!',
    },
  },
  {
    id: 'case-8-receita-ecac',
    level: 'avancado',
    levelTitle: 'Nível 3 • Avançado',
    xpReward: 150,
    category: 'Governo & Impostos',
    title: 'Mensagem na Caixa Postal Oficial do Portal Gov.br / e-CAC',
    dilemma: 'Você entra no portal oficial cav.receita.fazenda.gov.br digitando sua senha do Gov.br. Na sua Caixa Postal oficial há uma notificação de malha fina do Imposto de Renda com prazo de 30 dias para retificar declaração médica.',
    sender: 'Receita Federal do Brasil (Portal e-CAC Oficial)',
    channel: 'document',
    time: '10:00',
    preview: 'Termo de Intimacao Fiscal: Divergencia na Declaracao do IRPF...',
    messageContent:
      'RECEITA FEDERAL DO BRASIL - MINISTÉRIO DA FAZENDA\nPortal e-CAC - Centro Virtual de Atendimento ao Contribuinte\n\nTermo de Notificação de Lançamento / Malha Fiscal:\nContribuinte: CPF ***.392.108-**\nExercício: 2025 (Ano-calendário 2024)\n\nPrezado(a) Contribuinte,\nIdentificamos inconsistência nas deduções de despesas médicas declaradas no valor de R$ 4.200,00 com o profissional Dr. Carlos Eduardo CRM/SP 89201.\n\nOrientações:\nAcesse a aba "Meu Imposto de Renda" > "Pendências de Malha" neste mesmo portal para apresentar os recibos médicos ou retificar a declaração no prazo de 30 dias.\n\nNÃO É NECESSÁRIO COMPARECER A UMA UNIDADE FÍSICA. ESTE PROCEDIMENTO É TOTALMENTE REALIZADO PELO PORTAL GOV.BR.',
    clues: [
      {
        id: 'clue-8-ambiente',
        name: 'Ambiente de Acesso',
        buttonLabel: 'Checar Onde a Mensagem Foi Lida',
        category: 'whois',
        question: 'Como você acessou essa mensagem?',
        inspection: {
          type: 'official',
          badge: 'Endereço Governamental',
          field1Label: 'Portal Acessado',
          field1Value: 'cav.receita.fazenda.gov.br (Domínio Federal Oficial)',
          field2Label: 'Tipo de Acesso',
          field2Value: 'Login Oficial Gov.br com biometria facial e nível Ouro',
          field3Label: 'Local da Mensagem',
          field3Value: 'Caixa Postal interna restrita do contribuinte',
          observation: 'A mensagem foi lida diretamente dentro do portal oficial do governo federal, e não por links suspeitos recebidos por e-mail.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Mensagem lida dentro da área interna autenticada do Governo Federal!',
          details: 'O contribuinte acessou voluntariamente o domínio oficial .gov.br com autenticação forte Gov.br.',
          forensicFact: 'Criminosos não conseguem injetar mensagens dentro da caixa postal do portal e-CAC governamental oficial.',
        },
      },
      {
        id: 'clue-8-cobranca',
        name: 'Forma de Regularização',
        buttonLabel: 'Verificar se Pede Pagamento Imediato',
        category: 'pix',
        question: 'O comunicado pede para pagar algum Pix urgente?',
        inspection: {
          type: 'security',
          badge: 'Análise de Pedido',
          field1Label: 'Pede Pix?',
          field1Value: 'NÃO! Não existe chave Pix nem código de barras',
          field2Label: 'O que o Documento Pede',
          field2Value: 'Apenas anexar recibos médicos ou retificar a declaração',
          field3Label: 'Prazo Concedido',
          field3Value: '30 dias úteis (amplo prazo legal para defesa)',
          observation: 'A notificação apenas solicita documentos comprobatórios ou correção pelo próprio portal, sem cobrança de dinheiro.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Sem pedidos de Pix ou transferências imediatas!',
          details: 'Golpes da Receita inventam boletos ou chaves Pix com ameaça de prisão no mesmo dia. Notificações reais dão prazo legal para envio de recibos.',
          forensicFact: 'A Receita Federal nunca cobra multas ou tributos via Pix de pessoas físicas em mensagens instantâneas.',
        },
      },
      {
        id: 'clue-8-detalhes',
        name: 'Consistência das Informações',
        buttonLabel: 'Checar Dados da Declaração',
        category: 'behavior',
        question: 'Os dados citados batem com o que você declarou?',
        inspection: {
          type: 'official',
          badge: 'Auditoria de Dados',
          field1Label: 'Médico Citado',
          field1Value: 'Dr. Carlos Eduardo (Seu médico dermatologista real)',
          field2Label: 'Valor Declarado',
          field2Value: 'R$ 4.200,00 (Exatamente o valor da sua cirurgia de pele)',
          field3Label: 'Motivo Real da Malha Fina',
          field3Value: 'O médico ainda não declarou a emissão da nota fiscal dele',
          observation: 'Os dados são precisos e correspondem a uma consulta real que você declarou no IRPF deste ano.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Dados perfeitamente consistentes com sua declaração real!',
          details: 'O valor, o nome do profissional e o ano batem exatamente com o que você declarou.',
          forensicFact: 'Muitos brasileiros caem no erro de achar que toda notificação fiscal é golpe, perdem o prazo legal e acabam tendo o CPF bloqueado.',
        },
      },
    ],
    isScam: false,
    evidenceHypotheses: [
      'É uma intimação fiscal 100% autêntica dentro do e-CAC oficial (Gov.br) solicitando comprovação de recibos médicos.',
      'É golpe porque a Receita Federal é proibida pela Constituição de fiscalizar médicos.',
      'É vírus porque o governo brasileiro só se comunica por telefone fixo residencial.',
    ],
    correctEvidenceIndex: 0,
    keyEvidenceReason: 'A notificação está dentro da Caixa Postal do portal oficial da Receita (e-CAC / Gov.br), não cobra Pix e oferece prazo legal de 30 dias para regularização.',
    redFlags: [],
    explanation: 'Comunicação 100% LEGÍTIMA E OFICIAL. No nível avançado, o detetive deve ter maturidade para não entrar em paranoia: se você acessar o portal Gov.br oficial digitando o endereço e encontrar uma notificação na sua caixa postal, ela é real e deve ser atendida para não bloquear seu CPF!',
    realWorldTip: 'Acesse o e-CAC no portal Gov.br pelo menos uma vez por ano após declarar o Imposto de Renda para checar se sua declaração não caiu em malha fina!',
    pedagogy: {
      emotionalTrigger: 'Medo Burocrático e Risco de Paranoia Injustificada',
      kidsAnalogy: 'É como a professora deixar um bilhete na sua agenda de verdade pedindo para trazer o trabalho que você esqueceu.',
      parentsGuide: 'Ensine que o portal Gov.br digitado diretamente no navegador é seguro e é o canal oficial de cidadania.',
      adultRemedy: 'Basta entrar na aba "Meu Imposto de Renda" no e-CAC e anexar a foto da nota fiscal do médico.',
      goldenRule: 'Dentro do portal oficial Gov.br, a notificação é real: não ignore prazos!',
    },
  },
  {
    id: 'case-9-mao-fantasma-suporte',
    level: 'avancado',
    levelTitle: 'Nível 3 • Avançado',
    xpReward: 150,
    category: 'Golpe do Acesso Remoto',
    title: 'Ligação do "Suporte": Baixe o Aplicativo de Segurança',
    dilemma: 'Um suposto engenheiro de segurança do banco liga dizendo que seu celular está infectado por um vírus que está tentando transferir seu dinheiro. Ele insiste que você baixe um app de "suporte e varredura" para proteger sua conta.',
    sender: 'Central de Segurança Bancária',
    channel: 'call',
    time: '18:20',
    preview: 'Alerta urgente: Celular com malware ativo tentando compras...',
    messageContent:
      'LIGAÇÃO TELEFÔNICA:\n\n"Senhor(a), aqui é do Centro de Resposta a Incidentes Digitais do seu Banco. Nosso firewall detectou que um malware de controle remoto foi instalado no seu aparelho através de um link malicioso.\n\nPara que possamos realizar a desinfecção do seu aplicativo bancário antes que seus limites sejam drenados, o senhor precisa ir agora na Play Store e instalar nossa ferramenta de suporte homologada: pesquise por AnyDesk (ou TeamViewer) e me informe o código de 9 dígitos que aparecer na tela para que nossa equipe técnica assuma a limpeza..."',
    clues: [
      {
        id: 'clue-9-app',
        name: 'O Aplicativo Solicitado',
        buttonLabel: 'Verificar o que é o "AnyDesk / TeamViewer"',
        category: 'system',
        question: 'O AnyDesk ou TeamViewer são ferramentas antivírus de banco?',
        inspection: {
          type: 'security',
          badge: 'Auditoria de Aplicativos',
          field1Label: 'O que o Atendente Disse que É',
          field1Value: '"Ferramenta de suporte e limpeza de vírus do banco"',
          field2Label: 'O que o Aplicativo Realmente É',
          field2Value: 'Software de Acesso Remoto Total (Controle da Tela do Celular)',
          field3Label: 'O que Acontece se Você Passar o Código',
          field3Value: 'O golpista mexe no seu celular de longe, abre seu banco e faz Pix',
          observation: 'O golpista está tentando fazer você instalar um aplicativo que entrega o controle total do seu celular nas mãos dele.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'O aplicativo dá controle remoto total do seu celular ao criminoso!',
          details: 'AnyDesk, TeamViewer e RustDesk são softwares de acesso remoto. Se você instalar e passar o código, o golpista mexe no seu celular como se estivesse com ele na mão.',
          forensicFact: 'Este é o chamado "Golpe da Mão Fantasma": a tela do celular do usuário apaga e o criminoso faz transferências em segundo plano.',
        },
      },
      {
        id: 'clue-9-pressao',
        name: 'Tática Psicológica de Isolamento',
        buttonLabel: 'Analisar Comportamento do Atendente',
        category: 'behavior',
        question: 'Por que o atendente não deixa você desligar nem ir à agência?',
        inspection: {
          type: 'behavior',
          badge: 'Técnica de Engenharia Social',
          field1Label: 'Reação se Você Disser que Vai à Agência',
          field1Value: '"Não dá tempo! O vírus vai zerar sua conta nos próximos 10 minutos!"',
          field2Label: 'Reação se Você Falar que Vai Desligar',
          field2Value: '"Se desligar, o banco cancelará seu seguro e não devolverá o dinheiro!"',
          field3Label: 'Objetivo do Golpista',
          field3Value: 'Impedir que você raciocine ou consulte um parente',
          observation: 'O golpista usa ameaças e terror psicológico para impedir que você desligue o telefone.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Terror psicológico para forçar a obediência cega!',
          details: 'O criminoso ameaça perda de seguro e bloqueio de conta para fazer a vítima instalar o app no desespero.',
          forensicFact: 'Profissionais de segurança reais nunca proíbem um cliente de desligar a ligação ou de comparecer à agência física.',
        },
      },
      {
        id: 'clue-9-procedimento-bancario',
        name: 'Diretriz de Segurança da Febraban',
        buttonLabel: 'Consultar Norma de Segurança Bancária',
        category: 'official',
        question: 'Bancos mandam clientes instalarem aplicativos de suporte?',
        inspection: {
          type: 'official',
          badge: 'Diretriz Oficial Febraban',
          field1Label: 'Norma da Federação dos Bancos (Febraban)',
          field1Value: 'NENHUM BANCO JAMAIS SOLICITA INSTALAÇÃO DE APPS EXTERNOS',
          field2Label: 'Como o Banco Age em Caso de Suspeita',
          field2Value: 'Bloqueia temporariamente o app pelo próprio servidor do banco',
          field3Label: 'Acesso Remoto Permitido',
          field3Value: 'Totalmente proibido em atendimento telefônico a correntistas',
          observation: 'A recomendação de instalar qualquer app por ligação telefônica viola todas as normas bancárias nacionais.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Violação frontal das diretrizes de segurança bancária!',
          details: 'A Federação Brasileira de Bancos (Febraban) alerta repetidamente: nenhum banco pede instalação de ferramentas de suporte.',
          forensicFact: 'Mais de 100 mil contas foram invadidas no Brasil por meio do Golpe da Mão Fantasma nos últimos dois anos.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'É o Golpe da Mão Fantasma: o golpista pede para você instalar um aplicativo de controle remoto (AnyDesk/TeamViewer) para invadir seu celular.',
      'O atendente é do banco, mas a ligação foi interceptada por cabos submarinos.',
      'O aplicativo AnyDesk foi criado pelo governo para vacinar celulares contra vírus.',
    ],
    correctEvidenceIndex: 0,
    keyEvidenceReason: 'Nenhum banco solicita a instalação de aplicativos de acesso remoto (AnyDesk, TeamViewer) para "remover vírus" ou proteger contas.',
    redFlags: [
      'Ligação dizendo que o celular está com vírus',
      'Ordem para instalar aplicativos como AnyDesk, TeamViewer ou QuickSupport',
      'Terror psicológico dizendo que a conta será zerada se você desligar',
      'Pedido para passar códigos numéricos de autorização de tela',
    ],
    explanation: 'O "Golpe da Mão Fantasma / Acesso Remoto" é extremamente perigoso. O criminoso convence a vítima a instalar um aplicativo legítimo de controle remoto. Assim que a vítima passa o código, o golpista assume o celular, abre os aplicativos de banco e realiza transferências sem que a vítima consiga impedir.',
    realWorldTip: 'NUNCA, em hipótese alguma, instale aplicativos a pedido de pessoas que te ligaram por telefone, não importa o quão convincentes elas pareçam!',
    pedagogy: {
      emotionalTrigger: 'Terror Tecnológico (medo de vírus e de perder o controle do dinheiro)',
      kidsAnalogy: 'É como um estranho na rua dizer que tem um monstro na sua casa e pedir a chave do portão para ele entrar e tirar o monstro.',
      parentsGuide: 'Ajude seus familiares a desinstalarem aplicativos como AnyDesk ou TeamViewer se eles não usam profissionalmente.',
      adultRemedy: 'Se instalou e passou o código, desligue o Wi-Fi e os dados móveis do celular imediatamente ou desligue o aparelho na tomada/botão.',
      goldenRule: 'Nunca instale aplicativos no seu celular a pedido de quem te ligou!',
    },
  },
];

export const BADGES: Badge[] = [
  {
    id: 'badge-first-clue',
    title: 'Olho Clínico',
    description: 'Inspecionou sua primeira pista com ferramenta de detetive.',
    icon: '🔍',
    category: 'detective',
    rarity: 'bronze',
    unlockedHint: 'Investigue qualquer pista de um caso para desbloquear.',
  },
  {
    id: 'badge-whois-master',
    title: 'Rastreador de Links',
    description: 'Desmascarou um site falso usando o Raio-X de Links.',
    icon: '🌐',
    category: 'detective',
    rarity: 'prata',
    unlockedHint: 'Inspecione a pista de link de um golpe da internet.',
  },
  {
    id: 'badge-pix-guard',
    title: 'Escudo do Pix',
    description: 'Evitou uma transferência fraudulenta checando o nome do titular.',
    icon: '🛡️',
    category: 'financial',
    rarity: 'prata',
    unlockedHint: 'Resolva com louvor o caso do WhatsApp ou da Falsa Central.',
  },
  {
    id: 'badge-family-shield',
    title: 'Protetor da Família',
    description: 'Desmascarou o golpe do parente com número novo.',
    icon: '👨‍👩‍👧‍👦',
    category: 'family',
    rarity: 'bronze',
    unlockedHint: 'Acerte o primeiro caso do WhatsApp com a evidência correta.',
  },
  {
    id: 'badge-streak-fire',
    title: 'Faro de Sherlock',
    description: 'Acertou 3 casos seguidos com fundamentação pericial perfeita.',
    icon: '🔥',
    category: 'streak',
    rarity: 'ouro',
    unlockedHint: 'Mantenha um combo de 3 acertos perfeitos consecutivos.',
  },
  {
    id: 'badge-central-bank-expert',
    title: 'Muralha Bancária',
    description: 'Identificou o Golpe da Falsa Central Telefônica 0800.',
    icon: '🏦',
    category: 'financial',
    rarity: 'ouro',
    unlockedHint: 'Resolva com sucesso o caso da Falsa Central ou da Receita Federal.',
  },
  {
    id: 'badge-anti-ghost',
    title: 'Caçador de Fantasmas',
    description: 'Impediu o Golpe da Mão Fantasma e protegeu o aparelho.',
    icon: '👻',
    category: 'detective',
    rarity: 'platina',
    unlockedHint: 'Vença o caso do Acesso Remoto no Nível Avançado.',
  },
  {
    id: 'badge-grand-master',
    title: 'Delegado Digital de Elite',
    description: 'Concluiu com êxito todas as 9 investigações do simulador.',
    icon: '👑',
    category: 'detective',
    rarity: 'platina',
    unlockedHint: 'Finalize todos os casos dos três níveis de dificuldade.',
  },
];

export const PLAYER_RANKS: PlayerRank[] = [
  {
    id: 'rank-novice',
    name: 'Estagiário da Investigação',
    minXp: 0,
    icon: '🌱',
    color: '#86868b',
    pedagogicalTitle: 'Iniciante Curioso',
    summary: 'Começando a treinar a observação de detalhes e checagem de mensagens suspeitas.',
  },
  {
    id: 'rank-scout',
    name: 'Detetive Comunitário',
    minXp: 120,
    icon: '🔎',
    color: '#30d158',
    pedagogicalTitle: 'Observador Atento',
    summary: 'Já consegue checar links e sabe que banco nunca pede transferência por telefone.',
  },
  {
    id: 'rank-investigator',
    name: 'Perito Antifraude',
    minXp: 300,
    icon: '🛡️',
    color: '#0071e3',
    pedagogicalTitle: 'Inspetor Experiente',
    summary: 'Reconhece táticas de urgência emocional, clonagem de perfis e lojas falsas.',
  },
  {
    id: 'rank-master',
    name: 'Delegado Digital de Elite',
    minXp: 600,
    icon: '⭐',
    color: '#ff9f0a',
    pedagogicalTitle: 'Especialista em Cibersegurança',
    summary: 'Mestre em desmascarar ameaças modernas, falsas centrais e proteger a família.',
  },
  {
    id: 'rank-legend',
    name: 'Muralha Cibernética Nacional',
    minXp: 950,
    icon: '👑',
    color: '#bf5af2',
    pedagogicalTitle: 'Lenda da Segurança Digital',
    summary: 'Nenhum golpista passa pela sua vigilância. Você é a referência de segurança da sua família.',
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

export const FAMILY_GOLDEN_RULES: FamilyRule[] = [
  {
    id: 'rule-family-code',
    target: 'all',
    targetLabel: 'Toda a Família',
    title: 'A Palavra Secreta da Família',
    rule: 'Crie uma palavra ou código secreto que só você e seus parentes próximos sabem.',
    practicalAction: 'Se alguém ligar ou mandar mensagem pedindo Pix com número novo, peça a palavra secreta. Golpistas nunca saberão!',
    icon: '🔑',
  },
  {
    id: 'rule-never-transfer-without-voice',
    target: 'parents',
    targetLabel: 'Pais e Mães',
    title: 'Nunca transfira sem ouvir a voz',
    rule: 'Filho ou parente pediu dinheiro urgente por texto no WhatsApp?',
    practicalAction: 'Ligue na hora para o número ANTIGO dele ou faça chamada de vídeo antes de fazer qualquer transferência.',
    icon: '🗣️',
  },
  {
    id: 'rule-bank-never-calls',
    target: 'elderly',
    targetLabel: 'Idosos e Adultos',
    title: 'Banco nunca liga pedindo Pix',
    rule: 'Nenhuma central bancária liga pedindo para você fazer Pix para "proteger" ou "cancelar" compras.',
    practicalAction: 'Se receber essa ligação, desligue imediatamente e use o número que está atrás do seu cartão de crédito.',
    icon: '☎️',
  },
  {
    id: 'rule-no-pay-to-work',
    target: 'kids',
    targetLabel: 'Jovens e Adolescentes',
    title: 'Emprego de verdade não cobra dinheiro',
    rule: 'Nenhuma empresa honesta pede depósito para você começar a trabalhar ou curtir vídeos.',
    practicalAction: 'Se pedirem depósito para "liberar tarefas" ou "vaga VIP", bloqueie e denuncie na hora!',
    icon: '💼',
  },
];

export const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: 'Phishing',
    pronunciation: 'Fí-xin-gui',
    simpleMeaning: 'Pescaria digital: mensagens e e-mails falsos que tentam "pescar" suas senhas ou seu dinheiro.',
    realWorldExample: 'E-mail falso dizendo que sua conta vai ser bloqueada se não clicar no link.',
    pedagogicalTip: 'A isca é a curiosidade ou o susto; o anzol é o link malicioso.',
  },
  {
    term: 'Smishing',
    pronunciation: 'Smi-xin-gui',
    simpleMeaning: 'Golpe enviado por mensagem de texto SMS.',
    realWorldExample: 'SMS falso dos Correios dizendo que sua encomenda foi taxada.',
    pedagogicalTip: 'Desconfie de qualquer SMS que mande links para você pagar coisas.',
  },
  {
    term: 'BINA Spoofing',
    pronunciation: 'Bina Spú-fin-gui',
    simpleMeaning: 'Truque que faz aparecer o número 0800 do banco no visor do seu celular mesmo a ligação vindo de um golpista.',
    realWorldExample: 'O golpista liga e na tela do seu celular aparece exatamente o nome ou número do seu banco.',
    pedagogicalTip: 'Nunca confie só no número que aparece na tela: desligue e ligue você mesmo pelo verso do cartão.',
  },
  {
    term: 'Golpe da Mão Fantasma',
    pronunciation: 'Mão Fantasma (Acesso Remoto)',
    simpleMeaning: 'Quando o golpista te convence a baixar um aplicativo que permite a ele controlar a tela do seu celular à distância.',
    realWorldExample: 'O falso suporte do banco pede para você baixar o AnyDesk ou TeamViewer para "remover vírus".',
    pedagogicalTip: 'Nunca instale aplicativos no celular a pedido de quem te ligou por telefone!',
  },
  {
    term: 'Mecanismo Especial de Devolução (MED)',
    pronunciation: 'Médi do Pix',
    simpleMeaning: 'Ferramenta oficial do Banco Central que permite tentar travar e recuperar dinheiro transferido em golpes no Pix.',
    realWorldExample: 'Você percebe que caiu em um golpe e aciona o MED no próprio app do banco nos primeiros minutos.',
    pedagogicalTip: 'Quanto mais rápido você acionar o MED após a transferência, maior a chance do dinheiro ainda estar na conta do golpista.',
  },
];
