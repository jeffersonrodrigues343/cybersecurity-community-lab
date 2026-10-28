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
    fato: string;
  };
}

export interface CasePedagogy {
  emotionalTrigger: string;
  kidsAnalogy: string;
  parentsGuide: string;
  adultRemedy: string;
  goldenRule: string;
}

export interface ReinforcementOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface ReinforcementDrill {
  title: string;
  question: string;
  context?: string;
  options: ReinforcementOption[];
}

export interface InteractiveAction {
  id: string;
  label: string;
  actionType?: 'investigation' | 'risk_decision' | 'verification';
  playerMessage: string;
  replyMessage: string;
  evidenceDiscovered: {
    id: string;
    title: string;
    description: string;
    status: 'suspicious' | 'clean' | 'neutral' | 'risk_taken';
    forensicFact?: string;
  };
}

// Identidade do contato como o WhatsApp mostra de verdade: sem rótulos do jogo
export interface WhatsAppContact {
  number: string;
  // Nome salvo na agenda do jogador (contato conhecido); ausente = número desconhecido
  savedName?: string;
  // Nome que o próprio remetente escolheu no perfil, exibido como "~Nome"
  pushName?: string;
  // Conta comercial: 'verified' tem selo oficial da Meta; 'unverified' qualquer um cria
  business?: 'verified' | 'unverified';
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
  channel: 'whatsapp' | 'sms' | 'call' | 'social' | 'document' | 'push';
  whatsapp?: WhatsAppContact;
  time: string;
  preview: string;
  messageContent: string;
  clues: InvestigativeClue[];
  isScam: boolean;
  evidenceHypotheses: string[];
  correctEvidenceIndex: number;
  circumstantialHintIndex?: number;
  circumstantialHintFeedback?: string;
  keyEvidenceReason: string;
  redFlags: string[];
  explanation: string;
  realWorldTip: string;
  pedagogy: CasePedagogy;
  reinforcementDrill: ReinforcementDrill;
  interactiveActions?: InteractiveAction[];
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
    // NIVEL 1: BASICO (Pistas Visuais e Erros Claros)
    {
    id: 'case-1-whatsapp',
    level: 'basico',
    levelTitle: 'Nível 1 • Básico',
    xpReward: 60,
    category: 'WhatsApp & Família',
    title: 'Filha com Celular Quebrado Pedindo Pix',
    dilemma: 'Um número desconhecido te chama no WhatsApp com a foto da sua filha no perfil, dizendo que o celular quebrou e que precisa de um Pix urgente de R$ 480 para a faculdade.',
    sender: '+55 85 98124-9912',
    channel: 'whatsapp',
    whatsapp: { number: '+55 85 98124-9912', pushName: 'Sofia' },
    time: '14:22',
    preview: 'Oi mãe, esse é meu número novo, salva aí pfv',
    messageContent:
      'Oi mãe, tudo bem?\n\nEsse é meu número novo, salva aí pfv\n\nMeu celular caiu hoje cedo e a tela trincou toda, deixei no conserto. Tô usando esse chip provisório\n\nMãe preciso de um favor urgente, tenho que pagar uma taxa da faculdade até as 15h e o app do banco não quer abrir nesse celular novo\n\nVc consegue fazer um pix de 480 pra mim agora? Te devolvo assim que chegar em casa\n\nChave pix (CPF): 489.120.392-80',
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
          field1Label: 'Número Remetente',
          field1Value: '+55 (85) 98124-9912',
          field2Label: 'Origem Geográfica do Prefixo (DDD)',
          field2Value: 'DDD 85 - Região Metropolitana de Fortaleza/CE',
          field3Label: 'Data de Ativação do Chip',
          field3Value: 'Ativado há 1 dia (Plano Pré-Pago)',
          observation: 'O DDD é 85 (Ceará) e a linha foi ativada ontem, enquanto a família reside em São Paulo (DDD 11).',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'DDD incompatível e chip comprado ontem!',
          details: 'A linha é do DDD 85 (Ceará), enquanto a família mora em São Paulo (11). O chip foi cadastrado ontem.',
          fato: 'Golpistas compram chips descartáveis de outros estados para aplicar o golpe do parente com número novo.',
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
          badge: 'Dono da Conta no Banco Central',
          field1Label: 'Chave Pix Informada',
          field1Value: '489.120.392-80',
          field2Label: 'Dono da Conta Registrado no Bacen',
          field2Value: 'Valdir dos Santos',
          field3Label: 'Tipo de Conta / Banco',
          field3Value: 'Pessoa Física - Nu Pagamentos S.A.',
          observation: 'O favorecido é uma pessoa física individual chamada Valdir dos Santos, e não uma faculdade.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'A conta pertence a um estranho (laranja)!',
          details: 'A filha diz que é para a faculdade, mas a conta Pix está em nome de um desconhecido chamado Valdir dos Santos.',
          fato: 'Faculdades e empresas cobram por CNPJ oficial ou boleto registrado, nunca por Pix pessoal de terceiros.',
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
          badge: 'Tentativa de Contato Telefônico',
          field1Label: 'Chamada de Voz',
          field1Value: 'Chamada recusada ("Estou em aula agora, não posso atender")',
          field2Label: 'Mensagem de Áudio',
          field2Value: 'Nenhum áudio enviado ("Microfone com problema")',
          field3Label: 'Prazo Limite Informado',
          field3Value: 'Até às 15:00 de hoje',
          observation: 'O contato recusa sistematicamente chamadas de voz e áudios, forçando comunicação exclusivamente por texto.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Recusa sistemática de falar por voz!',
          details: 'O golpista inventa desculpas para não mandar áudio nem atender ligações.',
          fato: 'A regra de ouro da família contra golpes é: nunca transfira sem ouvir a voz real do parente no número antigo.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'O valor de R$ 480 é muito alto para a mensalidade de uma faculdade pública.',
      'O Pix está em nome de um desconhecido (Valdir dos Santos) e o número recusa chamadas de voz e áudios.',
      'O DDD do número é 85 (Ceará), diferente do estado onde a família mora.',
      'A mensagem foi enviada às 14:22, horário em que a faculdade não aceita transferências Pix.',
    ],
    correctEvidenceIndex: 1,
    circumstantialHintIndex: 2,
    circumstantialHintFeedback: 'O DDD diferente (85) é um indício suspeito, mas a pessoa poderia estar viajando ou trocado de operadora. A prova definitiva do golpe é o Pix estar no nome de um desconhecido (Valdir) e o contato se recusar a falar por voz!',
    keyEvidenceReason: 'O Pix vai para uma pessoa desconhecida (Valdir dos Santos) e o número recusa chamadas de voz e mensagens de áudio.',
    redFlags: [
      'Número desconhecido dizendo ser parente',
      'Desculpa de celular quebrado para explicar o número novo',
      'Pressa para transferir dinheiro agora',
      'Conta Pix em nome de outra pessoa',
    ],
    explanation: 'Este é o golpe do "número novo" no WhatsApp. O golpista pega a foto do parente na internet, compra um chip qualquer e diz que o celular quebrou para pedir dinheiro urgente antes de você conseguir confirmar.',
    realWorldTip: 'Nunca transfira dinheiro para parente com número novo sem ligar antes para o número antigo dele ou falar por voz!',
    pedagogy: {
      emotionalTrigger: 'Urgência e Preocupação com a Família: o golpista usa o amor pelos filhos para você agir com pressa sem conferir.',
      kidsAnalogy: 'É como alguém na escola usar uma foto do seu amigo para pedir seu lanche dizendo que é ele.',
      parentsGuide: 'Combine uma palavra secreta com seus filhos que só a família conhece.',
      adultRemedy: 'Se transferiu, aperte "Contestar Pix" no app do seu banco imediatamente.',
      goldenRule: 'Número novo pedindo dinheiro? Ligue no número antigo e confirme por voz!',
    },
    reinforcementDrill: {
      title: "Treino de Olho: O Parente com Número Novo",
      question: "Seu filho ou filha te mandou mensagem de um número novo dizendo que quebrou o celular e precisa de R$ 480 com urgência. Qual é a ÚNICA atitude correta?",
      context: "Na vida real, a pressa e o medo de deixar o parente desamparado fazem milhares de pessoas transferirem sem pensar.",
      options: [
            {
                  id: "opt-1-a",
                  text: "Ligar imediatamente para o número ANTIGO dele ou fazer uma chamada de vídeo para ouvir a voz real.",
                  isCorrect: true,
                  feedback: "Acertou! A voz humana em tempo real no contato conhecido é a único jeito de ter certeza."
            },
            {
                  id: "opt-1-b",
                  text: "Pedir uma foto do documento dele pelo próprio chat do WhatsApp novo.",
                  isCorrect: false,
                  feedback: "Cuidado! Golpistas costumam ter fotos de documentos vazados na internet."
            },
            {
                  id: "opt-1-c",
                  text: "Fazer o Pix para a chave indicada, pois a foto do perfil é realmente a dele.",
                  isCorrect: false,
                  feedback: "Cilada! Fotos de perfil do WhatsApp são públicas e qualquer criminoso pode copiar em 5 segundos."
            }
      ]
},
  },
  {
    id: 'case-2-correios',
    level: 'basico',
    levelTitle: 'Nível 1 • Básico',
    xpReward: 60,
    category: 'WhatsApp & Encomendas',
    title: '"Correios" no WhatsApp: Encomenda Retida na Alfândega',
    dilemma: 'Um perfil "Correios Encomendas", com o logo dos Correios, te manda no WhatsApp que uma encomenda sua foi taxada em R$ 27,90 e será devolvida se você não pagar hoje pelo link.',
    sender: '+55 11 98842-1092',
    channel: 'whatsapp',
    whatsapp: { number: '+55 11 98842-1092', pushName: 'Correios Encomendas', business: 'unverified' },
    time: '11:05',
    preview: 'Seu objeto NL8392019BR está retido na fiscalização aduaneira...',
    messageContent:
      'Olá, bom dia! Aqui é da Central de Encomendas dos Correios.\n\nSeu objeto internacional NL8392019BR está retido na fiscalização aduaneira por pendência da Taxa de Despacho Postal, no valor de R$ 27,90.\n\nCaso o pagamento não seja realizado até hoje às 23h59, o objeto será devolvido ao remetente.\n\nPara regularizar via Pix, acesse: https://correios-taxas-alfandega.online/pagar\n\nApós o pagamento, envie o comprovante aqui que liberamos a entrega em até 24h.',
    clues: [
      {
        id: 'clue-2-url',
        name: 'Raio-X do Link',
        buttonLabel: 'Inspecionar Endereço do Site',
        category: 'whois',
        question: 'O link pertence realmente aos Correios?',
        inspection: {
          type: 'link',
          badge: 'Whois & DNS do Domínio',
          field1Label: 'Endereço Web Consultado',
          field1Value: 'https://correios-taxas-alfandega.online',
          field2Label: 'Data de Criação do Domínio',
          field2Value: '24/09/2026 (Registrado há 3 dias)',
          field3Label: 'Servidor de Hospedagem',
          field3Value: 'IP 185.220.101.5 (Reykjavík, Islândia)',
          observation: 'O endereço web termina em .online e foi registrado há 3 dias no exterior, divergindo do domínio correios.com.br.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Site falso registrado há 3 dias!',
          details: 'O link enviado termina em .online e foi criado há 3 dias. O site oficial dos Correios é apenas correios.com.br.',
          fato: 'Empresas públicas brasileiras sempre usam domínios oficiais terminados em .com.br ou .gov.br.',
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
          fato: 'Taxas de importação legítimas só podem ser pagas logando com Gov.br no portal Minhas Importações dos Correios.',
        },
      },
      {
        id: 'clue-2-remetente',
        name: 'Perfil do Remetente',
        buttonLabel: 'Ver Dados do Perfil no WhatsApp',
        category: 'phone',
        question: 'Quem é esse perfil "Correios Encomendas" no WhatsApp?',
        inspection: {
          type: 'contact',
          badge: 'Perfil do WhatsApp',
          field1Label: 'Tipo de Conta',
          field1Value: 'Conta comercial "Correios Encomendas" SEM selo de verificação',
          field2Label: 'Número da Conta',
          field2Value: '+55 (11) 98842-1092 (celular pré-pago comum)',
          field3Label: 'Consulta de Rastreio NL8392019BR',
          field3Value: 'Código não localizado no Sistema Nacional de Rastreamento',
          observation: 'O perfil usa o nome e o logo dos Correios, mas é uma conta comercial sem selo criada num celular comum, e o código de objeto não existe na base dos Correios.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Conta "comercial" sem selo, num celular qualquer!',
          details: 'Qualquer pessoa baixa o WhatsApp Business, coloca o nome "Correios" e o logo copiado. Sem selo de verificação, o nome do perfil não prova nada.',
          fato: 'Golpistas disparam essas mensagens em massa usando chips descartáveis; quando um número é banido, outro entra no lugar no mesmo dia.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'O link leva para um site falso (.online) criado há 3 dias e o código de rastreio não existe nos Correios.',
      'A mensagem veio de uma conta comercial sem selo de verificação, num número de celular comum.',
      'O valor da taxa de R$ 27,90 é muito baixo, pois taxas de importação federais são sempre acima de R$ 100.',
      'O site dos Correios nunca pode usar a cor amarela em links enviados pelo celular.',
    ],
    correctEvidenceIndex: 0,
    circumstantialHintIndex: 1,
    circumstantialHintFeedback: 'Um perfil sem selo num celular comum é um sinal forte de desconfiança, mas transportadoras terceirizadas às vezes mandam mensagem por números comuns. A prova irrefutável é o link falso (.online criado há 3 dias) e o código que nem sequer existe nos Correios!',
    keyEvidenceReason: 'O link leva para um site falso (.online) hospedado no exterior e o código de rastreio informado sequer existe no banco de dados dos Correios.',
    redFlags: [
      'Endereço do site estranho (termina em .online em vez de correios.com.br)',
      'Perfil "Correios" sem selo de verificação, num celular comum',
      'Pressa para pagar uma taxa no mesmo dia',
      'Cobrança direta de Pix em página não oficial',
    ],
    explanation: 'Golpe dos falsos Correios no WhatsApp. Criminosos criam perfis com o logo dos Correios e mandam a mesma mensagem para milhares de pessoas, torcendo para que alguém que comprou pela internet se assuste e pague a taxa falsa.',
    realWorldTip: 'Nunca clique em links de mensagem sobre entregas. Abra o site correios.com.br você mesmo e consulte o rastreamento.',
    pedagogy: {
      emotionalTrigger: 'Medo de Perder a Encomenda: o golpista quer que você clique no link por impulso achando que seu pacote vai ser cancelado.',
      kidsAnalogy: 'É como receber um bilhete anônimo dizendo que seu brinquedo foi preso e cobrando dinheiro para soltar.',
      parentsGuide: 'Ensine a família a nunca clicar em links de cobrança que chegam por WhatsApp ou SMS. Sempre consulte pelo aplicativo ou site oficial.',
      adultRemedy: 'Se pagou o Pix falso, tire prints da tela e conteste a transferência no app do banco.',
      goldenRule: 'Os Correios não cobram taxa por link de Pix no WhatsApp!',
    },
    reinforcementDrill: {
      title: "Treino de Olho: Endereços Oficiais vs Falsos",
      question: "Qual dos links abaixo é o ÚNICO endereço autêntico dos Correios do Brasil para rastrear encomendas?",
      context: "Criminosos compram domínios com finais estranhos (.online, .top, .site) para clonar páginas oficiais.",
      options: [
            {
                  id: "opt-2-a",
                  text: "https://rastreamento.correios.com.br (domínio oficial terminando em .com.br)",
                  isCorrect: true,
                  feedback: "Isso aí! Os Correios do Brasil sempre utilizam o domínio oficial correios.com.br."
            },
            {
                  id: "opt-2-b",
                  text: "https://correios-taxas-alfandega.online/pagar",
                  isCorrect: false,
                  feedback: "Errou feio. Finais como .online ou .site são comprados anonimamente para aplicar golpes."
            },
            {
                  id: "opt-2-c",
                  text: "https://rastreio-correios.com.br.tk/encomenda",
                  isCorrect: false,
                  feedback: "Pegadinha! O domínio real aqui é .tk no final; o correios.com.br é apenas um subdomínio falso."
            }
      ]
},
  },
  {
    id: 'case-3-compra-aprovada',
    level: 'basico',
    levelTitle: 'Nível 1 • Básico',
    xpReward: 60,
    category: 'Segurança & Cartão',
    title: 'WhatsApp Oficial do Banco: Compra no Cartão',
    dilemma: 'Logo depois de pagar o café na padaria, chega no WhatsApp uma mensagem da conta verificada do seu banco avisando uma compra de R$ 34,90 na Padaria Estrela.',
    sender: 'Itaú Unibanco',
    channel: 'whatsapp',
    whatsapp: { number: '+55 11 4004-4828', pushName: 'Itaú Unibanco', business: 'verified' },
    time: '08:45',
    preview: 'Compra aprovada no cartão de débito final 4821: R$ 34,90...',
    messageContent:
      'Itaú informa: compra aprovada no seu cartão de débito final 4821.\n\nValor: R$ 34,90\nLocal: PADARIA ESTRELA\nHoje, 08:44\n\nNão reconhece essa compra? Bloqueie o cartão pelo app Itaú, em Cartões > Bloquear cartão.\n\nO Itaú nunca pede senha, código ou Pix por aqui.',
    clues: [
      {
        id: 'clue-3-canal',
        name: 'Origem da Notificação',
        buttonLabel: 'Verificar Canal do Aviso',
        category: 'system',
        question: 'De onde veio essa notificação?',
        inspection: {
          type: 'official',
          badge: 'Perfil do WhatsApp',
          field1Label: 'Conta Remetente',
          field1Value: 'Itaú Unibanco • conta comercial verificada (selo azul), +55 11 4004-4828',
          field2Label: 'Links ou Endereços Web',
          field2Value: 'Nenhum link: só orienta abrir o app oficial por conta própria',
          field3Label: 'Solicitação de Dados Cadastrais',
          field3Value: 'Nenhuma senha, código ou dado solicitado',
          observation: 'A mensagem veio da conta verificada do banco, no número divulgado no site oficial, sem links e sem pedido de senha.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Aviso legítimo do canal oficial do banco!',
          details: 'Conta com selo de verificação, número oficial e nenhum link: a mensagem só informa e manda você mesmo abrir o app.',
          fato: 'Selo sozinho não basta: o que fecha o caso é o aviso não pedir nada e bater com uma compra que você fez.',
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
          fato: 'Comunicações de segurança legítimas apenas alertam o cliente e não exigem transferências de emergência.',
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
          badge: 'Extrato Financeiro em Tempo Real',
          field1Label: 'Lançamento Registrado',
          field1Value: 'R$ 34,90 - Padaria Estrela',
          field2Label: 'Horário do Registro',
          field2Value: 'Há 1 minuto (08:44)',
          field3Label: 'Modalidade de Pagamento',
          field3Value: 'Cartão de Débito Físico por Aproximação',
          observation: 'O débito no extrato corresponde exatamente a uma despesa recente realizada com o cartão físico do usuário.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Transação real feita por você mesmo!',
          details: 'O valor e o local correspondem à sua compra recente na padaria.',
          fato: 'Muitos usuários se assustam por engano com notificações normais de compras feitas por aproximação.',
        },
      },
    ],
    isScam: false,
    evidenceHypotheses: [
      'A notificação é falsa porque compras no cartão só podem ser avisadas por e-mail no final do mês.',
      'A mensagem é verdadeira só porque está escrita sem nenhum erro de português.',
      'O banco só aprova compras por aproximação se você confirmar no caixa eletrônico.',
      'É um aviso comum do canal oficial do banco sobre uma compra real que você acabou de fazer, sem links e sem pedir Pix.',
    ],
    correctEvidenceIndex: 3,
    keyEvidenceReason: 'A conta verificada do banco enviou um aviso normal sobre a sua compra recente, sem links e sem pedir senhas, dados ou transferências.',
    redFlags: [],
    explanation: 'Esta mensagem é 100% VERDADEIRA. Bancos avisam cada compra na hora, pelo app ou pelo WhatsApp oficial, para proteger você. É importante saber reconhecer avisos normais para não entrar em pânico sem motivo.',
    realWorldTip: 'Mantenha os avisos de compra do seu banco ativados! Eles te avisam na mesma hora se alguém usar seu cartão.',
    pedagogy: {
      emotionalTrigger: 'Susto com Aviso de Compra: ver uma compra no WhatsApp pode assustar, mas conferir o extrato no app mostra que foi uma compra sua.',
      kidsAnalogy: 'É como a campainha da casa tocando quando alguém da sua família chega com as compras.',
      parentsGuide: 'Ensine a conferir o extrato do banco no aplicativo sempre que fizer uma compra.',
      adultRemedy: 'Se não reconhecer uma compra no app, use a opção "Bloquear Cartão" direto no aplicativo oficial.',
      goldenRule: 'Aviso oficial que não tem link e não pede nada é proteção para você, não golpe!',
    },
    reinforcementDrill: {
      title: "Treino de Vigilância: Notificação Real vs Golpe",
      question: "Como você diferencia um aviso legítimo do seu banco de uma notificação forjada por golpistas?",
      context: "Muitas pessoas entram em pânico com notificações de compras e acabam caindo em armadilhas de falsas centrais.",
      options: [
            {
                  id: "opt-3-a",
                  text: "Avisos reais do banco apenas informam a compra e NUNCA incluem links de internet nem pedem para fazer Pix.",
                  isCorrect: true,
                  feedback: "Perfeito! Bancos avisam compras para dar transparência. Golpistas sempre colocam um link ou um número para você ligar no desespero."
            },
            {
                  id: "opt-3-b",
                  text: "Avisos reais exigem que você ligue em até 10 minutos para confirmar seu CPF.",
                  isCorrect: false,
                  feedback: "Errou feio. Impor contagem regressiva para falar com atendente é tática clássica de engenharia social."
            },
            {
                  id: "opt-3-c",
                  text: "Avisos reais cobram uma taxa de cancelamento caso você não reconheça o débito.",
                  isCorrect: false,
                  feedback: "Errou feio. O cancelamento de compras fraudulentas é direito do consumidor garantido sem nenhuma cobrança."
            }
      ]
},
  },
  {
    id: 'case-3-falsa-central-sms',
    level: 'medio',
    levelTitle: 'Nível 3 • Falsa Central Telefônica',
    xpReward: 100,
    category: 'WhatsApp & Falsa Central',
    title: 'Alerta de Compra de R$ 3.890 no Magalu com 0800 para Ligar',
    dilemma: 'Um perfil "Magalu Alertas" te manda no WhatsApp que uma compra de R$ 3.890 foi aprovada no seu cartão e passa um 0800 para você ligar urgente se não reconhecer.',
    sender: '+55 11 97316-4408',
    channel: 'whatsapp',
    whatsapp: { number: '+55 11 97316-4408', pushName: 'Magalu Alertas', business: 'unverified' },
    time: '15:42',
    preview: 'Magalu informa: compra aprovada no valor de R$ 3.890,00...',
    messageContent:
      'Magalu informa: compra aprovada no valor de R$ 3.890,00 no seu cartão virtual.\n\nProduto: iPhone 15 128GB Preto\nData: hoje, 15:42\n\nCaso NÃO reconheça esta compra, entre em contato imediatamente com a nossa Central de Prevenção a Fraudes: 0800 729 0001\n\nAtendimento 24h. Não responda esta mensagem.',
    clues: [
      {
        id: 'clue-3-extrato',
        name: 'Extrato no App Meu Banco',
        buttonLabel: 'Consultar Extrato Oficial do Banco',
        category: 'system',
        question: 'Essa compra de R$ 3.890 realmente existe na sua conta bancária?',
        inspection: {
          type: 'official',
          badge: 'Extrato Financeiro em Tempo Real',
          field1Label: 'Lançamentos de Hoje no Banco',
          field1Value: 'R$ 0,00 (Nenhum débito ou compra realizada hoje)',
          field2Label: 'Status do Cartão Virtual',
          field2Value: 'Nenhuma compra pendente de autorização',
          field3Label: 'Saldo Disponível',
          field3Value: 'R$ 1.250,00 (Saldo Intacto)',
          observation: 'Ao abrir o aplicativo Meu Banco e olhar o extrato, não há nenhuma compra de R$ 3.890 realizada hoje.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'A compra nunca existiu! O extrato está 100% limpo.',
          details: 'No aplicativo do banco não existe nenhuma cobrança de R$ 3.890. A mensagem é uma isca falsa para criar desespero.',
          fato: 'Golpistas inventam compras de alto valor por WhatsApp e SMS para induzir a vítima a ligar para o 0800 no susto.',
        },
      },
      {
        id: 'clue-3-central-0800',
        name: 'Gravação da Central 0800',
        buttonLabel: 'Ligar para o 0800 da Mensagem',
        category: 'phone',
        question: 'O que o atendente do 0800 pede para você fazer?',
        inspection: {
          type: 'security',
          badge: 'Atendimento Telefônico 0800',
          field1Label: 'Atendimento do 0800',
          field1Value: 'Falso atendente atende fingindo ser da "Central de Prevenção a Fraudes" da Magalu',
          field2Label: 'Procedimento Exigido',
          field2Value: 'Exige que você faça um Pix do seu saldo para uma "Conta Segura do Bacen"',
          field3Label: 'Normativa do Banco Central',
          field3Value: 'Nenhum banco ou instituição pede Pix para cancelar compras ou estornar dinheiro',
          observation: 'O atendente do 0800 pressiona você a fazer uma transferência Pix urgente para cancelar a suposta compra.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'O atendente exige Pix para cancelar a compra!',
          details: 'Bancos nunca pedem transferências Pix para cancelar compras. Cancelamentos são feitos internamente no sistema.',
          fato: 'O Golpe da Falsa Central telefônica com 0800 é responsável pela maior parte dos prejuízos por engenharia social.',
        },
      },
      {
        id: 'clue-3-google-pesquisa',
        name: 'Pesquisa no Google',
        buttonLabel: 'Checar Notícias de Segurança no Google',
        category: 'whois',
        question: 'O que as notícias alertam sobre mensagens de compra aprovada com 0800?',
        inspection: {
          type: 'link',
          badge: 'Pesquisa no Google Brasil',
          field1Label: 'Termo Pesquisado',
          field1Value: '"mensagem compra aprovada 0800 Magalu WhatsApp"',
          field2Label: 'Alerta Antifraude Localizado',
          field2Value: 'Notícia de Segurança: "Golpe do 0800 falso usa WhatsApp com compras inventadas para roubar Pix"',
          field3Label: 'Orientação Oficial dos Bancos',
          field3Value: 'Nunca ligue para números informados em mensagens. Consulte seu extrato no app oficial.',
          observation: 'A pesquisa no Google confirma que criminosos contratam números 0800 para fingir que são centrais antifraude de lojas e bancos.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Alerta nacional: Golpe clássico do 0800 falso!',
          details: 'Criminosos disparam mensagens em massa no WhatsApp sobre compras falsas de lojas famosas, com números 0800 controlados por eles.',
          fato: 'Para falar com seu banco de verdade, use apenas o telefone oficial impresso no verso do seu cartão físico.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'O Magazine Luiza não vende produtos com valores quebrados sem centavos.',
      'No app do banco não há nenhuma compra no extrato e o atendente do 0800 exige Pix para cancelamento.',
      'A mensagem trouxe um número 0800 pedindo para você ligar com urgência se não reconhece a compra.',
      'Ligações para 0800 são proibidas aos sábados e domingos segundo o Procon.',
    ],
    correctEvidenceIndex: 1,
    circumstantialHintIndex: 2,
    circumstantialHintFeedback: 'Receber uma mensagem com número 0800 pedindo para ligar gera desconfiança, mas empresas às vezes informam canais de suporte. A prova definitiva do golpe é o extrato do seu banco estar ZERADO (a compra nunca existiu) e o atendente pedir um Pix para cancelar!',
    keyEvidenceReason: 'O extrato oficial no aplicativo do banco está totalmente limpo (a compra de R$ 3.890 nunca existiu) e o atendente do 0800 exige que a vítima faça um Pix para estorno.',
    redFlags: [
      'Mensagem de perfil sem selo alarmando sobre compra de alto valor que você não fez',
      'Instrução para ligar urgentemente em um número 0800',
      'Extrato da conta limpo sem nenhuma cobrança real',
      'Atendente pedindo transferência Pix para "proteger o saldo"',
    ],
    explanation: 'Golpe da Compra Aprovada com Falsa Central 0800. Os golpistas inventam uma compra alta no Magazine Luiza para assustar você. Ao ligar no 0800 deles, falsos atendentes dizem que para cancelar a compra você tem que fazer um Pix para uma conta de segurança.',
    realWorldTip: 'Recebeu mensagem de compra estranha? NUNCA ligue no número que veio nela. Abra seu aplicativo de banco e confira o extrato. Se não tiver nada lá, apague a mensagem!',
    pedagogy: {
      emotionalTrigger: 'Susto e Pânico Financeiro: a mensagem de compra de quase 4 mil reais induz a vítima a ligar para o 0800 sem checar o extrato antes.',
      kidsAnalogy: 'É como alguém passar na rua gritando que pegou sua bicicleta para você correr até o esconderijo deles.',
      parentsGuide: 'Ensine a nunca ligar para telefones que vêm dentro de mensagens. O canal seguro é sempre o telefone do verso do cartão.',
      adultRemedy: 'Desligue imediatamente qualquer ligação que peça transferências Pix para estornar compras.',
      goldenRule: 'O extrato do banco é a única verdade: se não tá no extrato, a compra não existe!',
    },
    reinforcementDrill: {
      title: "Treino de Reação: Mensagem de Compra no Cartão",
      question: "Você recebe no WhatsApp uma mensagem dizendo que uma compra de R$ 3.890 foi aprovada e pede para ligar no 0800 caso desconheça. Qual o primeiro passo?",
      options: [
        {
          id: "opt-fc-1",
          text: "Abrir o aplicativo do seu banco por conta própria e olhar o extrato real da conta.",
          isCorrect: true,
          feedback: "Exato! O extrato oficial do banco revela a verdade na hora: se não houver lançamento, é tentativa de golpe.",
        },
        {
          id: "opt-fc-2",
          text: "Ligar correndo para o 0800 indicado na mensagem para cancelar antes que debitem.",
          isCorrect: false,
          feedback: "Perigo! O 0800 da mensagem é controlado pelos próprios golpistas.",
        },
        {
          id: "opt-fc-3",
          text: "Transferir todo o dinheiro da conta para a poupança para evitar o débito.",
          isCorrect: false,
          feedback: "Desnecessário e perigoso: compras suspeitas não se resolvem fazendo transferências por conta própria.",
        },
      ],
    },
  },

    // NIVEL 2: MEDIO (Engenharia Social e Spoofing)
    {
    id: 'case-4-falsa-central',
    level: 'medio',
    levelTitle: 'Nível 2 • Médio',
    xpReward: 100,
    category: 'Ligação & Falsa Central',
    title: 'Chamada de WhatsApp do "Banco": Central Antifraude',
    dilemma: 'Você recebe uma chamada de voz no WhatsApp de um perfil "Central Antifraude", com o logo do seu banco na foto. Uma voz profissional diz que tentaram fazer um Pix da sua conta e pede que você transfira o saldo para uma conta de segurança.',
    sender: '+55 11 94418-2270',
    channel: 'call',
    whatsapp: { number: '+55 11 94418-2270', pushName: 'Central Antifraude', business: 'unverified' },
    time: '16:40',
    preview: 'Chamada de voz do WhatsApp...',
    messageContent:
      'Atendente: "Boa tarde, falo com o titular da conta? Aqui é o Ricardo, da central antifraude do seu banco. Identificamos agora uma tentativa de Pix de R$ 2.800 para um tal de Lucas Almeida, em São Paulo. O senhor reconhece essa transação?"\n\nVocê: "Não, não fui eu!"\n\nAtendente: "Certo, já vou deixar ela bloqueada. Mas o seu acesso está comprometido, senhor, o golpista ainda tá logado na sua conta. Pra proteger o saldo, o senhor vai abrir o app agora e transferir o valor disponível pra uma conta de segurança. Pode pegar papel e caneta que eu vou te passar a chave..."',
    clues: [
      {
        id: 'clue-4-pix-seguro',
        name: 'O Pedido do Atendente',
        buttonLabel: 'Analisar Procedimento Solicitado',
        category: 'behavior',
        question: 'Bancos pedem Pix para cancelar compras ou estornar dinheiro?',
        inspection: {
          type: 'security',
          badge: 'Normativa Operacional do Banco Central',
          field1Label: 'Procedimento Solicitado na Chamada',
          field1Value: 'Transferência Pix para uma "conta de segurança"',
          field2Label: 'Protocolo Padrão em Fraudes Suspeitas',
          field2Value: 'Bloqueio administrativo interno pelo sistema da instituição',
          field3Label: 'Normativa Bacen Resolução nº 1/2020',
          field3Value: 'Veda exigência de transferências pelo cliente para estorno de fraudes',
          observation: 'Nenhum banco ou funcionário do Banco Central jamais solicita transferência para proteger ou estornar dinheiro.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'O banco NUNCA pede Pix para cancelar compras!',
          details: 'Quando há uma fraude real, o banco bloqueia a transação internamente. Pedir Pix para "conta de segurança" é golpe garantido.',
          fato: 'O "Golpe da Falsa Central" é responsável por mais de 40% das perdas financeiras de idosos e adultos no Brasil.',
        },
      },
      {
        id: 'clue-4-bina',
        name: 'Raio-X de Quem Está Ligando',
        buttonLabel: 'Ver Perfil da Chamada no WhatsApp',
        category: 'phone',
        question: 'Um perfil de WhatsApp com o logo do banco garante que é o banco?',
        inspection: {
          type: 'official',
          badge: 'Perfil do WhatsApp',
          field1Label: 'Nome e Foto do Perfil',
          field1Value: '"Central Antifraude", com o logo do banco copiado',
          field2Label: 'Tipo de Conta',
          field2Value: 'Conta comercial SEM selo de verificação, no celular +55 11 94418-2270',
          field3Label: 'Política dos Bancos',
          field3Value: 'Bancos não fazem ligação de segurança pelo WhatsApp',
          observation: 'Quem liga é um celular comum com WhatsApp Business, sem selo, usando nome e logo escolhidos pelo próprio golpista.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Qualquer um coloca o logo do banco num perfil de WhatsApp!',
          details: 'Nome e foto de perfil são escolhidos por quem cria a conta. Sem selo de verificação, isso não prova nada.',
          fato: 'Banco não liga pelo WhatsApp para tratar de fraude. Se ligou por lá, de uma conta sem selo, desligue.',
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
          badge: 'Consulta no DICT (Banco Central)',
          field1Label: 'Destino Indicado pelo Atendente',
          field1Value: 'Chave Pix: seguranca.bcb@banco-digital.com',
          field2Label: 'Titular Registrado no Bacen',
          field2Value: 'Marcos Vinicius da Silva',
          field3Label: 'Tipo de Titularidade',
          field3Value: 'Pessoa Física - Banco Inter S.A.',
          observation: 'A suposta "conta de segurança" informada pelo atendente é uma conta pessoal de pessoa física (Marcos Vinicius).',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'A conta de segurança é a conta de um comparsa!',
          details: 'Se você fizer o Pix, o dinheiro vai direto para a conta de uma pessoa física e some em segundos.',
          fato: 'Não existe "conta cofre", "chave de segurança" ou "conta garantidora" no sistema financeiro nacional.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'A ligação é verdadeira porque o perfil tem o logo do banco e se chama "Central Antifraude".',
      'O atendente mandou fazer um Pix para uma "conta de segurança", o que nenhum banco jamais pede.',
      'A chamada é falsa porque o número não está escrito no verso do cartão físico.',
      'A compra só poderia ser cancelada se a ligação acontecesse durante o horário comercial.',
    ],
    correctEvidenceIndex: 1,
    keyEvidenceReason: 'Nenhum banco pede para o cliente fazer Pix para cancelar compras ou proteger o dinheiro da conta.',
    interactiveActions: [
      {
        id: 'act-c4-1',
        label: 'Confrontar: "Vou desligar e ligar para o telefone do verso do meu cartão!"',
        actionType: 'investigation',
        playerMessage: 'Essa conversa está muito estranha. Vou desligar a ligação e ligar eu mesmo no número do verso do meu cartão!',
        replyMessage: 'Atendente: "Senhor, se desligar agora o sistema entende que o senhor autorizou o Pix de R$ 2.800, e aí o banco não devolve! Fica na linha comigo que em dois minutinhos a gente resolve."',
        evidenceDiscovered: {
          id: 'ev-c4-threat',
          title: 'Ameaça Desesperada para Não Desligar',
          description: 'O golpista usa terror psicológico porque sabe que desligar destrói a farsa.',
          status: 'suspicious',
          forensicFact: 'Centrais legítimas de banco incentivam o cliente a retornar pelos canais oficiais.',
        },
      },
      {
        id: 'act-c4-2',
        label: 'Questionar: "Desde quando banco liga pelo WhatsApp?"',
        actionType: 'investigation',
        playerMessage: 'Banco não me liga pelo WhatsApp. E esse perfil nem tem selo de verificação. Por que vocês estão me ligando por aqui?',
        replyMessage: 'Atendente: "É que... por segurança a gente tá usando o WhatsApp, senhor, porque a linha normal pode estar sendo monitorada pelo golpista. O importante agora é proteger o seu dinheiro, tá bom? Abre o app aí pra mim."',
        evidenceDiscovered: {
          id: 'ev-c4-spoofing',
          title: 'Desculpa Esfarrapada para o WhatsApp',
          description: 'O golpista improvisou uma justificativa. Bancos não fazem atendimento de fraude por chamada de WhatsApp.',
          status: 'suspicious',
          forensicFact: 'Nome e foto de perfil no WhatsApp são escolhidos por quem criou a conta: qualquer um pode usar o logo do banco.',
        },
      },
      {
        id: 'act-c4-3',
        label: 'Hesitar: "Mas por que EU tenho que fazer um Pix para estornar uma compra?"',
        actionType: 'investigation',
        playerMessage: 'Se o banco é quem cuida da minha conta, por que EU preciso transferir um Pix para cancelar uma transação?',
        replyMessage: 'Atendente: "Senhor, é o procedimento padrão. O dinheiro fica parado nessa conta de segurança e volta pra sua conta em até 24 horas, depois que a gente concluir o bloqueio. Mas tem que ser agora, antes que o golpista faça o Pix!"',
        evidenceDiscovered: {
          id: 'ev-c4-protocolo-falso',
          title: 'Invenção de Procedimento Falso',
          description: 'Não existe "conta de segurança". Todo bloqueio e estorno é feito pelo sistema interno do próprio banco.',
          status: 'suspicious',
          forensicFact: 'Banco nenhum pede dinheiro de volta para cancelar transação não reconhecida.',
        },
      },
    ],
    redFlags: [
      'Ligação dizendo que sua conta foi invadida',
      'Pressão para agir rápido e não desligar o telefone',
      'Pedido para fazer Pix para "proteger" o dinheiro',
      'Perfil de WhatsApp com o logo do banco, sem selo de verificação',
    ],
    explanation: 'Este é o Golpe da Falsa Central, agora pelo WhatsApp. Os criminosos montam um perfil com o logo do banco, simulam o som de call center e fingem que são do banco para você se desesperar e transferir seu dinheiro para eles.',
    realWorldTip: 'Recebeu ligação "do banco" falando de compra suspeita, ainda mais pelo WhatsApp? DESLIGUE NA HORA! Pegue seu cartão e ligue para o número do verso.',
    pedagogy: {
      emotionalTrigger: 'Medo de Perder o Dinheiro: o golpista diz que sua conta foi invadida para você não ter tempo de desligar e conferir.',
      kidsAnalogy: 'É como alguém fingir que é o diretor da escola no telefone dizendo que você precisa pagar para não ser expulso.',
      parentsGuide: 'Oriente idosos e parentes: bancos nunca ligam pedindo para transferir dinheiro para cancelar compras.',
      adultRemedy: 'Desligue imediatamente e ligue para o número que está impresso no verso do seu cartão.',
      goldenRule: 'O banco nunca pede Pix para estornar ou cancelar compras!',
    },
    reinforcementDrill: {
      title: "Treino de Reação: A Ligação da Falsa Central",
      question: "Um perfil com o logo do seu banco te liga pelo WhatsApp dizendo que tentaram fazer um Pix de R$ 2.800 da sua conta. O que você faz?",
      context: "Golpistas criam perfis no WhatsApp com o nome e o logo do banco para parecer atendimento oficial.",
      options: [
            {
                  id: "opt-4-a",
                  text: "Desligar na hora, pegar seu cartão de crédito físico e discar você mesmo para o telefone do verso.",
                  isCorrect: true,
                  feedback: "Ação de mestre! Nunca aceite atendimento de chamada recebida. Desligue e você mesmo inicie a ligação pelo número oficial."
            },
            {
                  id: "opt-4-b",
                  text: "Fazer o Pix para a \"conta segura do Banco Central\" indicada pelo atendente para proteger seu saldo.",
                  isCorrect: false,
                  feedback: "Alerta grave! Não existe \"conta de segurança\" no sistema financeiro. Esse Pix vai direto para o bolso do criminoso."
            },
            {
                  id: "opt-4-c",
                  text: "Passar sua senha de 4 ou 6 dígitos para o atendente bloquear o cartão no sistema.",
                  isCorrect: false,
                  feedback: "Jamais! Funcionários do banco nunca solicitam a senha da sua conta ou cartão por telefone."
            }
      ]
},
  },
  {
    id: 'case-5-loja-falsa-promocao',
    level: 'medio',
    levelTitle: 'Nível 2 • Médio',
    xpReward: 100,
    category: 'Comércio & WhatsApp',
    title: 'Promoção no WhatsApp: Air Fryer com 83% de Desconto',
    dilemma: 'Um perfil "Magalu Ofertas", com o logo da loja, te manda no WhatsApp uma queima de estoque: Air Fryer Philips Walita de R$ 699 por apenas R$ 119,90 no Pix, só até hoje.',
    sender: '+55 21 99734-5180',
    channel: 'whatsapp',
    whatsapp: { number: '+55 21 99734-5180', pushName: 'Magalu Ofertas', business: 'unverified' },
    time: '20:15',
    preview: 'Você foi selecionado(a) para a nossa Queima de Estoque...',
    messageContent:
      'Oi, tudo bem? Você foi selecionado(a) para a nossa Queima de Estoque de aniversário Magalu!\n\nAir Fryer Philips Walita Série 3000 de R$ 699,00 por apenas R$ 119,90 no Pix\n\nRestam só 14 unidades e a promoção acaba hoje à meia-noite. Frete grátis para todo o Brasil!\n\nGaranta a sua pelo link: https://magazineluiza-queima-estoque.shop/produto/airfryer\n\nQualquer dúvida é só chamar aqui que a Lu te atende',
    clues: [
      {
        id: 'clue-5-link',
        name: 'Raio-X do Link da Loja',
        buttonLabel: 'Verificar Endereço Web',
        category: 'whois',
        question: 'O link é realmente do Magazine Luiza?',
        inspection: {
          type: 'link',
          badge: 'Whois & Registro de Domínio',
          field1Label: 'URL Enviada na Mensagem',
          field1Value: 'https://magazineluiza-queima-estoque.shop',
          field2Label: 'Domínio Raiz Registrado',
          field2Value: 'magazineluiza-queima-estoque.shop',
          field3Label: 'Data de Registro',
          field3Value: '22/09/2026 (Registrado há 5 dias)',
          observation: 'O domínio utiliza o TLD .shop e foi criado há 5 dias, diferindo do portal oficial magazineluiza.com.br.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Domínio falso mascarado com nome da loja!',
          details: 'Grandes varejistas brasileiras sempre usam seus domínios principais (.com.br), nunca finais como .shop ou .top criados para golpes.',
          fato: 'Criminosos clonam o design exato das lojas em minutos usando templates pirateados.',
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
          field1Label: 'Opção Cartão de Crédito',
          field1Value: 'Erro HTTP 403 ("Instabilidade no gateway de cartões")',
          field2Label: 'Opção Boleto Bancário',
          field2Value: 'Desabilitada no formulário de compra',
          field3Label: 'Opção Pix',
          field3Value: 'Habilitada com QR Code e contagem regressiva de 10 minutos',
          observation: 'O checkout rejeita intencionalmente pagamentos por cartão para forçar a transferência Pix irreversível.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Força o pagamento exclusivo por Pix!',
          details: 'Lojas falsas desativam propositalmente o cartão de crédito porque compras com cartão podem ser canceladas via chargeback.',
          fato: 'Lojas falsas só aceitam Pix porque o dinheiro cai imediatamente na conta dos criminosos.',
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
          badge: 'Pesquisa de Mercado',
          field1Label: 'Preço na Mensagem',
          field1Value: 'R$ 119,90 (Desconto anunciado de 83%)',
          field2Label: 'Preço Médio Praticado no Varejo',
          field2Value: 'R$ 599,00 a R$ 699,00',
          field3Label: 'Custo de Fabricação Estimado',
          field3Value: 'Aproximadamente R$ 380,00',
          observation: 'O produto é anunciado por um valor significativamente inferior ao custo fabril, incompatível com o mercado formal.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Preço milagroso totalmente fora da realidade!',
          details: 'Nenhuma loja vende mercadorias de alta demanda abaixo do custo de fábrica.',
          fato: 'O gatilho da ganância e da oportunidade imperdível é o mais explorado em golpes de comércio eletrônico nas redes sociais.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'O site é falso (.shop em vez de site oficial), tem preço impossível e obriga o pagamento por Pix.',
      'O site é de confiança porque mostra o selo de "Compra Protegida" e tem cadeado na tela.',
      'O perfil "Magalu Ofertas" no WhatsApp não tem selo de verificação ao lado do nome.',
      'A loja oferece frete grátis para todo o Brasil sem calcular taxa de entrega.',
    ],
    correctEvidenceIndex: 0,
    keyEvidenceReason: 'O site é clonado (.shop), cobra um preço bom demais para ser verdade e só aceita Pix para não ter como estornar.',
    redFlags: [
      'Desconto absurdo de mais de 80% em produto caro',
      'Endereço de site estranho (termina em .shop)',
      'O site só aceita pagamento por Pix',
      'Prazo de "só hoje" e "últimas unidades" para comprar rápido',
      'Perfil com o logo da loja, sem selo de verificação',
    ],
    explanation: 'Golpe da Loja Falsa. Os golpistas criam um perfil de WhatsApp e um site falso quase idênticos aos de uma loja famosa, anunciam um preço impossível e pegam o Pix de quem tenta comprar.',
    realWorldTip: 'Recebeu uma promoção incrível no WhatsApp? Não clique no link da mensagem! Abra o navegador, digite o site oficial da loja e procure o produto por lá.',
    pedagogy: {
      emotionalTrigger: 'Pressa de Aproveitar a Oferta: a promessa de um super desconto faz a pessoa querer comprar correndo sem olhar o endereço do site.',
      kidsAnalogy: 'É como alguém na internet prometer diamantes no jogo por um preço quase de graça, mas só se pagar adiantado.',
      parentsGuide: 'Ensine que quando o preço é bom demais, quase sempre é golpe. Descontos de 80% em eletrodomésticos não existem.',
      adultRemedy: 'Denuncie e bloqueie o contato no WhatsApp e nunca faça Pix para sites que você não conhece.',
      goldenRule: 'Desconto milagroso? Entre no site oficial digitando pelo navegador!',
    },
    reinforcementDrill: {
      title: "Treino de Compras: Descontos Miraculosos na Internet",
      question: "Você recebe no WhatsApp uma oferta de um smartphone top de linha por R$ 399 no Pix (preço normal R$ 3.500). Qual é a conclusão de análise?",
      context: "Preços abaixo do custo de fábrica combinados com exclusividade de Pix imediato são 100% de probabilidade de fraude.",
      options: [
            {
                  id: "opt-5-a",
                  text: "É golpe de engenharia social: produtos de alta demanda não são vendidos por uma fração do preço em sites que só aceitam Pix.",
                  isCorrect: true,
                  feedback: "Exatamente! Nenhuma loja real vende mercadorias com 90% de prejuízo. O objetivo é pegar seu Pix irreversível."
            },
            {
                  id: "opt-5-b",
                  text: "É seguro comprar se o site tiver o logotipo oficial da loja e o selo de frete grátis.",
                  isCorrect: false,
                  feedback: "Cuidado! Criminosos copiam logotipos e designs inteiros de lojas famosas em menos de 10 minutos."
            },
            {
                  id: "opt-5-c",
                  text: "É uma oportunidade real de liquidação de queima de estoque autorizada.",
                  isCorrect: false,
                  feedback: "Ilusão perigosa! Essa é a isca clássica que pega vítimas desavisadas no gatilho da ganância."
            }
      ]
},
  },
  {
    id: 'case-6-sms-seguranca-real',
    level: 'medio',
    levelTitle: 'Nível 2 • Médio',
    xpReward: 100,
    category: 'Segurança & 2FA',
    title: 'Código de Acesso no WhatsApp Oficial Pedido por Você',
    dilemma: 'Você acabou de digitar seu login no site do banco pelo computador e, 3 segundos depois, chega no WhatsApp uma mensagem da conta verificada do banco com um código de acesso.',
    sender: 'Banco do Brasil',
    channel: 'whatsapp',
    whatsapp: { number: '+55 61 4004-0001', pushName: 'Banco do Brasil', business: 'verified' },
    time: '15:10',
    preview: 'BB: seu código de acesso é 739102. Não compartilhe...',
    messageContent:
      'BB: seu código de acesso para liberar o login no computador é 739102.\n\nVálido por 5 minutos.\n\nNão compartilhe este código com ninguém. O Banco do Brasil nunca liga nem manda mensagem pedindo este código.',
    clues: [
      {
        id: 'clue-6-contexto',
        name: 'Contexto da Solicitação',
        buttonLabel: 'Verificar Ação Recente',
        category: 'system',
        question: 'Você acabou de fazer alguma ação que justificasse essa mensagem?',
        inspection: {
          type: 'official',
          badge: 'Registro de Sessão no Navegador',
          field1Label: 'Ação Realizada pelo Usuário',
          field1Value: 'Inserção de agência e conta no site bb.com.br pelo computador',
          field2Label: 'Horário do Login no Navegador',
          field2Value: '15:10:00',
          field3Label: 'Horário de Recebimento da Mensagem',
          field3Value: '15:10:03 (Intervalo de 3 segundos)',
          observation: 'A mensagem foi disparada 3 segundos após uma tentativa voluntária de login realizada pelo próprio usuário.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Envio imediato em resposta direta ao seu login!',
          details: 'O código foi gerado exatamente no instante em que você solicitou acesso no computador.',
          fato: 'Autenticação de dois fatores legítima ocorre em sincronia direta com a ação voluntária do usuário.',
        },
      },
      {
        id: 'clue-6-numero',
        name: 'Perfil do Remetente',
        buttonLabel: 'Checar Conta do Remetente',
        category: 'phone',
        question: 'A mensagem veio da conta oficial e verificada do banco?',
        inspection: {
          type: 'contact',
          badge: 'Perfil do WhatsApp',
          field1Label: 'Conta Remetente',
          field1Value: 'Banco do Brasil • conta comercial verificada (selo azul)',
          field2Label: 'Número da Conta',
          field2Value: '+55 61 4004-0001 (número divulgado no bb.com.br)',
          field3Label: 'Contém Links de Internet?',
          field3Value: 'Nenhum link! Apenas o código numérico',
          observation: 'A mensagem veio da conta verificada do Banco do Brasil, no número oficial divulgado pelo banco, sem links perigosos.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Conta oficial verificada do banco, sem links!',
          details: 'O 4004-0001 é o WhatsApp oficial divulgado pelo próprio Banco do Brasil, e a conta tem o selo de verificação.',
          fato: 'O selo sozinho não basta: o que fecha o caso é o código ter chegado na hora em que você mesmo pediu, sem link e sem pedir nada.',
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
          field1Value: '"O Banco do Brasil nunca liga nem manda mensagem pedindo este código"',
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
          fato: 'Golpistas tentam roubar esses códigos legítimos ligando para você e pedindo para "confirmar o código para cancelar a fraude".',
        },
      },
    ],
    isScam: false,
    evidenceHypotheses: [
      'É golpe porque qualquer mensagem com números é uma tentativa de colocar vírus no celular.',
      'O banco mandou um código falso porque avisos de segurança precisam ter letras e símbolos.',
      'É um código de segurança comum enviado pelo banco porque você mesmo tentou entrar na sua conta no computador.',
      'A mensagem é falsa porque códigos bancários só podem ser liberados pessoalmente na agência.',
    ],
    correctEvidenceIndex: 2,
    keyEvidenceReason: 'O código foi pedido por você mesmo para entrar no banco, veio da conta verificada oficial do banco e não tem links suspeitos.',
    redFlags: [],
    explanation: 'Mensagem 100% VERDADEIRA. É o código de confirmação (2 etapas) que o banco manda para saber se é você mesmo. O único perigo é se alguém te ligar pedindo esse código — NUNCA passe esse número para ninguém!',
    realWorldTip: 'Códigos de acesso (por SMS ou WhatsApp) são como a chave da sua casa: use você mesmo onde você pediu, mas NUNCA leia nem passe para ninguém por telefone!',
    pedagogy: {
      emotionalTrigger: 'Dúvida sobre Códigos: desconfiar é normal, mas basta lembrar se foi você mesmo quem tentou acessar a conta no computador.',
      kidsAnalogy: 'É como a senha do seu cofre que você usa para abrir, mas se alguém estranho pedir para você contar, você não conta.',
      parentsGuide: 'Explique que códigos de acesso servem apenas para a própria pessoa digitar onde ela mesma abriu.',
      adultRemedy: 'Se alguém te ligar pedindo o código recebido, desligue na hora.',
      goldenRule: 'Código de acesso é pessoal: nunca passe para ninguém, nem por ligação nem por mensagem!',
    },
    reinforcementDrill: {
      title: "Treino de Autenticação: O Código de 2 Fatores (2FA)",
      question: "Você recebe do seu banco a mensagem: \"Seu código de acesso: 829104. Não informe a ninguém\". Em seguida, alguém te liga pedindo esse código. O que fazer?",
      context: "O golpista já tem sua senha inicial e precisa apenas do código para esvaziar sua conta.",
      options: [
            {
                  id: "opt-6-a",
                  text: "NUNCA ditar nem enviar o código para ninguém: códigos de acesso são de uso exclusivo e pessoal.",
                  isCorrect: true,
                  feedback: "Isso aí! Códigos de 2FA são como chaves físicas da sua casa: se você entregar pelo telefone, o invasor entra."
            },
            {
                  id: "opt-6-b",
                  text: "Informar o código apenas se a pessoa souber seu nome completo e CPF.",
                  isCorrect: false,
                  feedback: "Perigo! Seus dados cadastrais básicos já vazaram na internet há anos. Isso não prova que a pessoa é do banco."
            },
            {
                  id: "opt-6-c",
                  text: "Digitar o código no teclado numérico da chamada telefônica.",
                  isCorrect: false,
                  feedback: "Errou feio. Teclados de telefone emitem tons DTMF que gravam o código digitado com facilidade."
            }
      ]
},
  },

    // NIVEL 3: AVANCADO (Golpes Modernos & Risco Real)
    {
    id: 'case-7-vaga-tarefas',
    level: 'avancado',
    levelTitle: 'Nível 3 • Avançado',
    xpReward: 150,
    category: 'Emprego & Vagas Falsas',
    title: 'Vaga de Trabalho Remoto: Até R$ 500/dia para Curtir Vídeos',
    dilemma: 'Uma recrutadora te chama no WhatsApp oferecendo trabalho flexível de meio período para avaliar marcas e curtir vídeos no YouTube. No primeiro dia você ganha R$ 20 de verdade no Pix, mas no segundo pedem um depósito de R$ 100 para liberar tarefas VIP.',
    sender: '+62 821-4920-1823',
    channel: 'whatsapp',
    whatsapp: { number: '+62 821-4920-1823', pushName: 'Larissa | RH Shopee', business: 'unverified' },
    time: '09:30',
    preview: 'Olá, bom dia! Tudo bem? Me chamo Larissa, sou do RH da Shopee...',
    messageContent:
      'Olá, bom dia! Tudo bem?\n\nMe chamo Larissa, sou do RH da Shopee Brasil. Seu perfil foi selecionado para uma vaga de avaliador(a) de produtos, home office\n\nÉ bem simples: uns 30 minutinhos por dia curtindo vídeos e avaliando lojas pelo celular. O pagamento é diário via Pix, de R$ 150 a R$ 500\n\nNa primeira tarefa você já recebe R$ 20 na hora, pra conhecer. Depois, pra liberar as Tarefas VIP, é só fazer uma recarga de R$ 100 que volta com o lucro no mesmo dia\n\nTem interesse? Entra no nosso grupo de treinamento no Telegram que a mentora te explica tudo: https://t.me/shopee_tarefas_vip',
    clues: [
      {
        id: 'clue-7-mecanica',
        name: 'Mecânica das Tarefas Remuneradas',
        buttonLabel: 'Analisar Dinâmica do Trabalho',
        category: 'behavior',
        question: 'Como funciona esse suposto emprego?',
        inspection: {
          type: 'security',
          badge: 'Regulamento do Grupo de Trabalho',
          field1Label: 'Etapa Inicial',
          field1Value: 'Curtir 3 vídeos no YouTube (Crédito de R$ 20 recebido)',
          field2Label: 'Condição para o Segundo Dia',
          field2Value: 'Depósito prévio de R$ 100 via Pix para "Tarefas VIP"',
          field3Label: 'Regra de Saque dos Rendimentos',
          field3Value: 'Saques condicionados à conclusão de novas rodadas de depósito',
          observation: 'A liberação de pagamentos maiores exige que o próprio trabalhador deposite recursos financeiros com antecedência.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Golpe da Tarefa: Isca inicial para roubar depósitos maiores!',
          details: 'Os criminosos pagam um valor simbólico no primeiro dia para a vítima achar que é sério. Depois exigem depósitos crescentes para liberar o dinheiro.',
          fato: 'A Polícia Civil já registrou vítimas que perderam mais de R$ 50.000 no golpe das tarefas no Telegram tentando recuperar o dinheiro investido.',
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
          badge: 'Canal de Recrutamento',
          field1Label: 'Canal Oficial da Shopee Brasil',
          field1Value: 'careers.shopee.com.br / Perfil verificado no LinkedIn',
          field2Label: 'Canal Utilizado na Proposta',
          field2Value: 'Grupo fechado no Telegram (t.me/shopee_tarefas_vip)',
          field3Label: 'Uso de Telegram para Recrutamento Formal',
          field3Value: 'Inexistente nas diretrizes corporativas de contratação da empresa',
          observation: 'O recrutamento é conduzido via grupo de Telegram, canal não utilizado pela Shopee para seleção formal.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Empresas reais nunca cobram para você trabalhar!',
          details: 'A Shopee não contrata por grupos de Telegram nem solicita pagamentos prévios de candidatos.',
          fato: 'Se você precisa pagar para receber seu salário, você não é funcionário: é a vítima de um esquema de pirâmide financeira.',
        },
      },
      {
        id: 'clue-7-ddi',
        name: 'Auditoria do Número (+62)',
        buttonLabel: 'Checar Origem do Número',
        category: 'phone',
        question: 'De onde é esse número de WhatsApp que te contatou?',
        inspection: {
          type: 'contact',
          badge: 'Operadora Internacional',
          field1Label: 'Número Remetente',
          field1Value: '+62 821-4920-1823',
          field2Label: 'Origem Geográfica do Prefixo (DDI)',
          field2Value: 'DDI +62 - República da Indonésia',
          field3Label: 'Sede Anunciada pela Recrutadora',
          field3Value: 'Afirma ser da sede em São Paulo (Brasil)',
          observation: 'A recrutadora afirma ser da sede no Brasil, mas utiliza um número estrangeiro da Indonésia (+62).',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Prefixo internacional estrangeiro (+62)!',
          details: 'A golpista usa número virtual da Indonésia (+62) fingindo ser funcionária de RH brasileira.',
          fato: 'Criminosos compram números virtuais estrangeiros descartáveis na internet para despistar autoridades brasileiras.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'A vaga é falsa porque nenhuma empresa pode contratar funcionários sem carteira de trabalho física assinada.',
      'A vaga exige que você transfira dinheiro do seu próprio bolso (Pix) para poder liberar os saques das tarefas.',
      'O número de contato possui prefixo internacional (+62) fingindo ser uma recrutadora no Brasil.',
      'O horário da mensagem (09:30) é antes da abertura oficial das agências de RH no Brasil.',
    ],
    correctEvidenceIndex: 1,
    circumstantialHintIndex: 2,
    circumstantialHintFeedback: 'O número estrangeiro com DDI +62 é uma bandeira vermelha evidente, mas golpistas também compram chips brasileiros. A prova material absoluta do golpe é a exigência de que o trabalhador pague do próprio bolso (Pix) para poder receber comissões!',
    keyEvidenceReason: 'Emprego legítimo remunera o trabalhador; exigir depósito financeiro ou Pix antecipado para liberar tarefas ou comissões é a prova cabal do golpe de pirâmide.',
    redFlags: [
      'Mensagem inesperada de contratação no WhatsApp',
      'Convite para ir para grupos fechados do Telegram',
      'Promessa de até R$ 500 por dia só para dar curtidas em vídeos',
      'Pedido para você depositar dinheiro para poder sacar seus ganhos',
    ],
    explanation: 'Golpe das Tarefas no Telegram. O golpista paga R$ 20 no primeiro dia como isca para fazer você confiar. Quando você deposita R$ 100 (e depois mais) para a "tarefa VIP", eles bloqueiam você e somem com o dinheiro.',
    realWorldTip: 'REGRA DO TRABALHO: Se uma vaga de emprego exige que você PAGUE qualquer valor antes de receber, é golpe com certeza!',
    pedagogy: {
      emotionalTrigger: 'Esperança de Dinheiro Fácil: o golpista paga um valor pequeno no início para você achar que é verdade e transferir quantias maiores depois.',
      kidsAnalogy: 'É como alguém prometer trocar sua moeda de R$ 1 por uma nota de R$ 100, mas só se você der R$ 50 primeiro.',
      parentsGuide: 'Adolescentes e jovens são o maior alvo desse golpe. Converse sobre como funciona o mercado de trabalho real.',
      adultRemedy: 'Nunca deposite dinheiro de "garantia de tarefa". Se já transferiu, conteste o Pix no app do banco.',
      goldenRule: 'Trabalho de verdade NUNCA pede para você pagar para receber salário!',
    },
    reinforcementDrill: {
      title: "Treino Trabalhista: A Oferta de Renda Extra Fácil",
      question: "Uma suposta empresa te contrata para dar curtidas em vídeos no YouTube e promete R$ 300 por dia, mas exige um \"depósito de garantia de R$ 150\" para liberar pagamentos. O que isso significa?",
      context: "O golpe da tarefa paga R$ 20 no primeiro dia como isca para induzir a vítima a transferir milhares de reais depois.",
      options: [
            {
                  id: "opt-7-a",
                  text: "É um golpe de pirâmide financeira: trabalho honesto NUNCA cobra dinheiro do trabalhador para poder trabalhar.",
                  isCorrect: true,
                  feedback: "Regra de ouro! Se você precisa pagar para receber seu salário, você não é funcionário: é a vítima."
            },
            {
                  id: "opt-7-b",
                  text: "É uma taxa de treinamento comum em plataformas de contratação remota.",
                  isCorrect: false,
                  feedback: "Falso! Nenhuma empresa séria cobra taxa de treinamento ou garantia financeira de candidatos."
            },
            {
                  id: "opt-7-c",
                  text: "É seguro pagar os R$ 150 se eles tiverem cumprido o primeiro pagamento de R$ 20.",
                  isCorrect: false,
                  feedback: "Cilada! Os primeiros R$ 20 são exatamente a isca usada para fazer você confiar e perder quantias muito maiores."
            }
      ]
},
  },
  {
    id: 'case-8-receita-ecac',
    level: 'avancado',
    levelTitle: 'Nível 3 • Avançado',
    xpReward: 150,
    category: 'Governo & Impostos',
    title: 'Contador Avisa: Pendência de Malha na Caixa Postal do e-CAC',
    dilemma: 'O Marcos, contador que faz seu Imposto de Renda há anos, te chama no WhatsApp: caiu uma pendência de malha fina na sua Caixa Postal do e-CAC. Ele não manda link nem cobra nada, só pede que você confira e separe os recibos médicos.',
    sender: 'Marcos Contador',
    channel: 'whatsapp',
    whatsapp: { number: '+55 11 99218-4530', savedName: 'Marcos Contador', pushName: 'Marcos Ribeiro' },
    time: '10:00',
    preview: 'Bom dia! Caiu uma mensagem na sua caixa postal do e-CAC...',
    messageContent:
      'Bom dia! Tudo certo?\n\nOlha, entrei no e-CAC com a procuração que vc me deu e caiu uma mensagem na sua caixa postal da Receita. Sua declaração de 2025 ficou retida na malha por causa das despesas médicas\n\nÉ aquele valor de R$ 4.200,00 do Dr. Carlos Eduardo (CRM/SP 89201)\n\nNada grave, tem prazo de 30 dias. A gente só precisa mandar os recibos pela própria aba de pendências de malha, lá no portal\n\nNão precisa pagar nada nem clicar em link nenhum, tá? Se quiser conferir, entra vc mesmo no gov.br > e-CAC > Caixa Postal que tá lá. Depois me manda foto dos recibos',
    clues: [
      {
        id: 'clue-8-ambiente',
        name: 'Conferência no e-CAC',
        buttonLabel: 'Conferir no e-CAC por Conta Própria',
        category: 'whois',
        question: 'A pendência que o contador avisou existe mesmo no portal oficial?',
        inspection: {
          type: 'official',
          badge: 'Cadeia de Custódia Digital',
          field1Label: 'Endereço que Você Digitou',
          field1Value: 'https://cav.receita.fazenda.gov.br',
          field2Label: 'Método de Autenticação Utilizado',
          field2Value: 'Login Gov.br com Biometria Facial (Nível Ouro)',
          field3Label: 'O que Está na Caixa Postal',
          field3Value: 'Termo de Intimação de malha fina, igual ao que o contador descreveu',
          observation: 'Você mesmo digitou o endereço oficial, entrou com sua conta Gov.br e encontrou a mesma pendência que o contador avisou.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'A pendência está mesmo na sua Caixa Postal oficial!',
          details: 'Você não clicou em link nenhum: entrou sozinho no portal .gov.br e confirmou o aviso do contador.',
          fato: 'A Receita Federal não manda mensagem nem cobrança por WhatsApp. Comunicados oficiais ficam na Caixa Postal do e-CAC.',
        },
      },
      {
        id: 'clue-8-cobranca',
        name: 'Forma de Regularização',
        buttonLabel: 'Verificar se Pede Pagamento Imediato',
        category: 'pix',
        question: 'O aviso pede para pagar algum Pix ou clicar em algum link?',
        inspection: {
          type: 'security',
          badge: 'Instruções Processuais',
          field1Label: 'Solicitação de Transferência Pix',
          field1Value: 'Inexistente (nenhuma chave Pix ou conta indicada)',
          field2Label: 'Exigência Documental',
          field2Value: 'Apresentação de recibos médicos na aba "Pendências de Malha"',
          field3Label: 'Prazo Processual Concedido',
          field3Value: '30 dias para regularização ou envio de retificadora',
          observation: 'A notificação estabelece prazo legal de 30 dias para envio de recibos no próprio portal, sem cobrança de Pix.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Sem pedidos de Pix ou transferências imediatas!',
          details: 'Golpes da Receita inventam boletos ou chaves Pix com ameaça de prisão no mesmo dia. Notificações reais dão prazo legal para envio de recibos.',
          fato: 'A Receita Federal nunca cobra multas ou tributos via Pix de pessoas físicas em mensagens instantâneas.',
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
          badge: 'Conferência de Dados da Declaração',
          field1Label: 'Profissional de Saúde Citado',
          field1Value: 'Dr. Carlos Eduardo (CRM/SP 89201)',
          field2Label: 'Valor da Despesa Fiscalizada',
          field2Value: 'R$ 4.200,00',
          field3Label: 'Exercício Fiscal',
          field3Value: '2025 (Ano-calendário 2024)',
          observation: 'Os dados informados conferem com a declaração de Imposto de Renda entregue pelo próprio contribuinte.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Dados perfeitamente consistentes com sua declaração real!',
          details: 'O valor, o nome do profissional e o ano batem exatamente com o que você declarou.',
          fato: 'Muitos brasileiros caem no erro de achar que toda notificação fiscal é golpe, perdem o prazo legal e acabam tendo o CPF bloqueado.',
        },
      },
    ],
    isScam: false,
    evidenceHypotheses: [
      'O aviso veio de um contato conhecido, a pendência aparece no e-CAC que você mesmo acessou, não pede Pix e dá 30 dias para responder.',
      'O documento é verdadeiro apenas porque tem o desenho do brasão da República no cabeçalho.',
      'A cobrança é real porque a Receita só pode pedir recibos de médicos nos primeiros meses do ano.',
      'O aviso é falso porque notificações sobre impostos só podem ser entregues pessoalmente por policiais.',
    ],
    correctEvidenceIndex: 0,
    keyEvidenceReason: 'O aviso do contador não tem link nem cobrança, e a pendência está na caixa postal do e-CAC que você mesmo acessou, com 30 dias de prazo para responder.',
    redFlags: [],
    explanation: 'Aviso 100% VERDADEIRO. Quem mandou foi o seu contador, de um número que você já tem salvo, e a pendência existe mesmo: você confirmou entrando sozinho no Gov.br. A Receita em si não manda WhatsApp; o caminho seguro é sempre conferir no e-CAC.',
    realWorldTip: 'Acesse o portal Gov.br pelo menos uma vez por ano após declarar o Imposto de Renda para checar se está tudo em ordem!',
    pedagogy: {
      emotionalTrigger: 'Medo de Problemas com Impostos: avisos verdadeiros do governo não cobram Pix na hora nem ameaçam prisão; eles dão prazo para você conferir com calma.',
      kidsAnalogy: 'É como a professora deixar um bilhete na sua agenda de verdade pedindo para trazer o dever de casa que faltou.',
      parentsGuide: 'Ensine que o portal Gov.br acessado direto no navegador é seguro e é o canal oficial do governo.',
      adultRemedy: 'Basta entrar na aba do Imposto de Renda no portal Gov.br e enviar o comprovante pedido.',
      goldenRule: 'Dentro do portal oficial Gov.br, a notificação é real: não ignore os prazos!',
    },
    reinforcementDrill: {
      title: "Treino de Cidadania: Como Auditar Intimações Governamentais",
      question: "Você quer verificar se uma suposta notificação de malha fina do Imposto de Renda é verdadeira. Como proceder sem risco?",
      context: "Golpistas mandam e-mails e mensagens de WhatsApp falsos \"da Receita\" com boletos. A Receita Federal oficial se comunica pela Caixa Postal do e-CAC.",
      options: [
            {
                  id: "opt-8-a",
                  text: "Abrir seu navegador, digitar cav.receita.fazenda.gov.br e entrar com seu Gov.br nível Prata ou Ouro para checar a Caixa Postal interna.",
                  isCorrect: true,
                  feedback: "Perfeito! Essa é a cadeia de custódia oficial. O portal Gov.br acessado voluntariamente é imune a phishing externo."
            },
            {
                  id: "opt-8-b",
                  text: "Clicar no link recebido no e-mail que diz \"Acesse aqui sua guia DARF com desconto de 50%\".",
                  isCorrect: false,
                  feedback: "Golpe perigoso! A Receita Federal nunca envia boletos ou cobranças tributárias diretas por e-mail."
            },
            {
                  id: "opt-8-c",
                  text: "Ignorar qualquer notificação fiscal porque a Receita só tem autoridade se intimar pessoalmente por viatura policial.",
                  isCorrect: false,
                  feedback: "Erro grave! Ignorar intimações legítimas dentro do e-CAC causa cancelamento de CPF e retenção de restituição."
            }
      ]
},
  },
  {
    id: 'case-9-mao-fantasma-suporte',
    level: 'avancado',
    levelTitle: 'Nível 3 • Avançado',
    xpReward: 150,
    category: 'Golpe do Acesso Remoto',
    title: 'Chamada de WhatsApp do "Suporte": Instale o App de Segurança',
    dilemma: 'Um perfil "Suporte Segurança Digital", com o logo do seu banco, te liga pelo WhatsApp dizendo que seu celular pegou um vírus que está tentando mexer no seu dinheiro. A pessoa insiste que você baixe um app de "suporte" para limpar o aparelho.',
    sender: '+55 21 97052-3318',
    channel: 'call',
    whatsapp: { number: '+55 21 97052-3318', pushName: 'Suporte Segurança Digital', business: 'unverified' },
    time: '18:20',
    preview: 'Chamada de voz do WhatsApp...',
    messageContent:
      'Atendente: "Boa noite, falo com o titular? Aqui é do setor de segurança digital do seu banco. Detectamos que entrou um vírus no seu celular por um link que o senhor abriu, e ele tá tentando fazer compras na sua conta agora."\n\nAtendente: "Pra gente limpar isso antes que levem seu dinheiro, o senhor vai abrir a Play Store e baixar o nosso app de suporte. Pesquisa aí AnyDesk, é o ícone vermelho."\n\nAtendente: "Abriu? Vai aparecer um número de 9 dígitos na tela. Me fala esse número que a nossa equipe técnica faz a limpeza daqui, o senhor não precisa mexer em nada."',
    clues: [
      {
        id: 'clue-9-app',
        name: 'O Aplicativo Solicitado',
        buttonLabel: 'Verificar o que é o "AnyDesk / TeamViewer"',
        category: 'system',
        question: 'O AnyDesk ou TeamViewer são ferramentas antivírus de banco?',
        inspection: {
          type: 'security',
          badge: 'Ficha Técnica do Aplicativo (Play Store)',
          field1Label: 'Nome do Pacote Solicitado',
          field1Value: 'com.anydesk.anydeskandroid (AnyDesk Remote Desktop)',
          field2Label: 'Categoria na Loja de Aplicativos',
          field2Value: 'Acesso Remoto e Compartilhamento de Tela',
          field3Label: 'Permissões do Sistema Exigidas',
          field3Value: 'Serviço de Acessibilidade (leitura de tela e controle de toques)',
          observation: 'O software solicitado é uma ferramenta de controle remoto de tela, não um aplicativo de antivírus bancário.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'O aplicativo dá controle remoto total do seu celular ao criminoso!',
          details: 'AnyDesk, TeamViewer e RustDesk são softwares de acesso remoto. Se você instalar e passar o código, o golpista mexe no seu celular como se estivesse com ele na mão.',
          fato: 'Este é o chamado "Golpe da Mão Fantasma": a tela do celular do usuário apaga e o criminoso faz transferências em segundo plano.',
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
          badge: 'Gravação da Chamada de WhatsApp',
          field1Label: 'Instrução do Atendente sobre Desligar',
          field1Value: '"Não desligue a chamada sob risco de bloqueio definitivo"',
          field2Label: 'Solicitação de Comparecimento à Agência',
          field2Value: '"Não há tempo para ir à agência física"',
          field3Label: 'Dado Solicitado ao Cliente',
          field3Value: 'Código numérico de 9 dígitos gerado na tela do AnyDesk',
          observation: 'O interlocutor pressiona contra o encerramento da chamada e solicita o código de controle da tela.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Terror psicológico para forçar a obediência cega!',
          details: 'O criminoso ameaça perda de seguro e bloqueio de conta para fazer a vítima instalar o app no desespero.',
          fato: 'Profissionais de segurança reais nunca proíbem um cliente de desligar a ligação ou de comparecer à agência física.',
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
          badge: 'Normativa de Segurança Febraban',
          field1Label: 'Diretriz da Febraban para Atendimento',
          field1Value: 'Instituições financeiras não solicitam instalação de softwares terceiros',
          field2Label: 'Protocolo Operacional em Fraudes Suspeitas',
          field2Value: 'Bloqueio preventivo pelo servidor central da instituição',
          field3Label: 'Uso de Acesso Remoto a Dispositivos de Clientes',
          field3Value: 'Não homologado para atendimento a pessoas físicas',
          observation: 'A recomendação de instalar softwares de controle remoto em aparelhos de clientes é contrária às normas bancárias.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Violação frontal das diretrizes de segurança bancária!',
          details: 'A Federação Brasileira de Bancos (Febraban) alerta repetidamente: nenhum banco pede instalação de ferramentas de suporte.',
          fato: 'Mais de 100 mil contas foram invadidas no Brasil por meio do Golpe da Mão Fantasma nos últimos dois anos.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'A ligação é de confiança porque quem ligou sabia o seu nome e os últimos números do seu cartão.',
      'O sistema do banco bloqueia qualquer vírus sozinho sem precisar de ajuda de quem está ligando.',
      'A pessoa mandou baixar um aplicativo de controle remoto (como AnyDesk), o que nenhum banco jamais pede.',
      'A ligação é falsa apenas porque o AnyDesk é um aplicativo proibido na Play Store.',
    ],
    correctEvidenceIndex: 2,
    keyEvidenceReason: 'Nenhum banco pede para você baixar aplicativos de controle remoto (como AnyDesk ou TeamViewer) para limpar o celular ou proteger a conta.',
    redFlags: [
      'Chamada de WhatsApp de perfil sem selo dizendo que o celular está com vírus',
      'Ordem para instalar aplicativos como AnyDesk ou TeamViewer',
      'Pressão psicológica dizendo que seu dinheiro vai sumir se você desligar',
      'Pedido para passar códigos numéricos que aparecem na tela',
    ],
    explanation: 'Golpe da Mão Fantasma (Acesso Remoto). O criminoso convence a pessoa a instalar um aplicativo de controle de tela. Ao passar o código, o golpista assume o controle do celular e faz transferências sem você conseguir impedir.',
    realWorldTip: 'NUNCA instale aplicativos no celular a pedido de quem te ligou, por telefone ou WhatsApp, por mais convincente que pareça!',
    pedagogy: {
      emotionalTrigger: 'Medo de Vírus e Invasão: o golpista finge que seu celular está infectado para fazer você se assustar e entregar o controle do aparelho.',
      kidsAnalogy: 'É como alguém na rua dizer que tem um monstro na sua casa e pedir a chave do portão para entrar e tirar o monstro.',
      parentsGuide: 'Ajude idosos e parentes a desinstalarem aplicativos como AnyDesk ou TeamViewer se eles não usam no dia a dia.',
      adultRemedy: 'Se instalou e passou o código, desligue o Wi-Fi e os dados móveis na mesma hora ou desligue o celular.',
      goldenRule: 'Nenhum banco pede para você instalar aplicativos de suporte no celular!',
    },
    reinforcementDrill: {
      title: "Treino de Dispositivos: O Golpe do Acesso Remoto (Mão Fantasma)",
      question: "Alguém te liga pelo WhatsApp dizendo que seu celular tem um vírus perigoso e ordena que você instale o app \"AnyDesk\" ou \"TeamViewer\" para limpeza. Por que isso é um golpe?",
      context: "Esses aplicativos concedem permissão de espelhamento e controle remoto da tela, permitindo ao criminoso operar seu app bancário.",
      options: [
            {
                  id: "opt-9-a",
                  text: "Esses apps são softwares de controle remoto total: se você instalar e passar o código, o criminoso mexe no seu celular e faz Pix de longe.",
                  isCorrect: true,
                  feedback: "Na mosca! Nenhum banco do Brasil jamais pede para clientes instalarem aplicativos de controle remoto."
            },
            {
                  id: "opt-9-b",
                  text: "O golpe ocorre apenas porque o AnyDesk é um vírus ilegal proibido na Google Play Store.",
                  isCorrect: false,
                  feedback: "Errou feio. O AnyDesk é um software legítimo para profissionais de TI, mas criminosos o usam como ferramenta de invasão em leigos."
            },
            {
                  id: "opt-9-c",
                  text: "Não há perigo se você mantiver o celular virado para baixo durante a ligação.",
                  isCorrect: false,
                  feedback: "Mito! O controle remoto funciona pela internet. Virar o aparelho não impede transferências em segundo plano."
            }
      ]
},
  },
];

export type AgeGroup = 'young' | 'adult' | 'senior';

// Trilhas Geracionais Dinâmicas: dificuldade nunca desce (básico → avançado) e cada
// trilha tem 1 caso legítimo numa posição diferente, para "é golpe" não ser resposta automática
const AGE_TRACKS: Record<AgeGroup, string[]> = {
  // Jovem (20 a 34): legítimo na fase 3
  young: ['case-2-correios', 'case-5-loja-falsa-promocao', 'case-6-sms-seguranca-real', 'case-7-vaga-tarefas'],
  // Adulto (35 a 49): legítimo na fase 4
  adult: ['case-1-whatsapp', 'case-3-falsa-central-sms', 'case-4-falsa-central', 'case-8-receita-ecac'],
  // Sênior (50+): curva mais suave (2 básicos), legítimo na fase 2
  senior: ['case-1-whatsapp', 'case-3-compra-aprovada', 'case-4-falsa-central', 'case-9-mao-fantasma-suporte'],
};

export const getCampaignCasesForAge = (ageGroup: AgeGroup = 'adult'): ScamCase[] =>
  AGE_TRACKS[ageGroup].map((id) => {
    const found = SCAM_CASES.find((c) => c.id === id);
    if (!found) throw new Error(`Caso da trilha ${ageGroup} não existe: ${id}`);
    return found;
  });

// 4 Fases Canônicas Padrão (compatibilidade retroativa)
export const CANONICAL_CASES: ScamCase[] = getCampaignCasesForAge('adult');

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
    unlockedHint: 'Confira no app do banco o titular da chave Pix de um golpe e acerte o caso.',
  },
  {
    id: 'badge-family-shield',
    title: 'Protetor da Família',
    description: 'Desmascarou o golpe do parente com número novo.',
    icon: '👨‍👩‍👧‍👦',
    category: 'family',
    rarity: 'bronze',
    unlockedHint: 'Desmascare o golpe do parente com número novo no WhatsApp.',
  },
  {
    id: 'badge-streak-fire',
    title: 'Faro de Sherlock',
    description: 'Acertou 3 casos seguidos com fundamentação de análise perfeita.',
    icon: '🔥',
    category: 'streak',
    rarity: 'ouro',
    unlockedHint: 'Mantenha um combo de 3 acertos perfeitos consecutivos.',
  },
  {
    id: 'badge-central-bank-expert',
    title: 'Muralha Bancária',
    description: 'Identificou o Golpe da Falsa Central Telefônica.',
    icon: '🏦',
    category: 'financial',
    rarity: 'ouro',
    unlockedHint: 'Desmascare um golpe da Falsa Central.',
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
    id: 'badge-ice-cold',
    title: 'Mente Fria Sob Pressão',
    description: 'Solucionou um caso complexo com relatório perfeito sob o cronômetro tático de emergência.',
    icon: '⏱️',
    category: 'detective',
    rarity: 'ouro',
    unlockedHint: 'Acerte o veredito e a fundamentação com o Modo Sob Pressão ativado.',
  },
  {
    id: 'badge-surgical-mind',
    title: 'Dedução Cirúrgica',
    description: 'Desvendou o caso com precisão de elite inspecionando exatamente as pistas decisivas.',
    icon: '🎯',
    category: 'detective',
    rarity: 'platina',
    unlockedHint: 'Acerte na primeira tentativa usando a perícia técnica correta.',
  },
  {
    id: 'badge-grand-master',
    title: 'Delegado Digital de Elite',
    description: 'Concluiu com êxito as 4 fases da sua trilha de investigação.',
    icon: '👑',
    category: 'detective',
    rarity: 'platina',
    unlockedHint: 'Finalize as 4 fases da sua trilha.',
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
