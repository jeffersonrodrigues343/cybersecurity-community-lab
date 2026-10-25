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
    title: 'Filho com Celular Quebrado Pedindo Pix',
    dilemma: 'Um número desconhecido manda mensagem com a foto da sua filha dizendo que o celular quebrou e precisa de um Pix urgente de R$ 480 para a faculdade.',
    sender: 'Filha (Número Desconhecido)',
    channel: 'whatsapp',
    time: '14:22',
    preview: 'Oi mãe, anota meu número novo! O celular quebrou...',
    messageContent:
      'Oi mãe! Tudo bem? Salva meu número novo aí na agenda, por favor.\n\nO meu celular antigo caiu no chão hoje cedo e trincou a tela toda. Tô usando esse número provisório enquanto tá no conserto.\n\nPreciso muito de um favor urgente: tenho que pagar uma taxa da faculdade até às 15h e meu aplicativo do banco ainda não liberou nesse aparelho novo. Você consegue fazer um Pix de R$ 480 pra mim agora? Te devolvo assim que chegar em casa!\n\nChave Pix (CPF): 489.120.392-80',
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
      question: "Seu filho ou mãe te mandou mensagem de um número novo dizendo que quebrou o celular e precisa de R$ 900 com urgência. Qual é a ÚNICA atitude correta?",
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
    category: 'SMS & Encomendas',
    title: 'SMS dos Correios: Encomenda Retida na Alfândega',
    dilemma: 'Você recebe um SMS dizendo que uma encomenda sua foi taxada em R$ 27,90 e será devolvida se você não pagar hoje pelo link.',
    sender: '+55 11 98842-1092',
    channel: 'sms',
    time: '11:05',
    preview: 'Correios: Encomenda retida na fiscalizacao. Pague a taxa...',
    messageContent:
      'CORREIOS AVISO: Seu pacote internacional com codigo NL8392019BR foi retido na fiscalizacao aduaneira.\n\nMotivo: Pendencia de regularizacao da Taxa de Despacho Postal no valor de R$ 27,90.\n\nPrazo final hoje para evitar devolucao ao remetente. Pague via Pix no link: https://correios-taxas-alfandega.online/pagar',
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
        name: 'Número do Remetente',
        buttonLabel: 'Checar Origem do SMS',
        category: 'phone',
        question: 'Quem mandou esse SMS?',
        inspection: {
          type: 'contact',
          badge: 'Telefonia & Rastreamento',
          field1Label: 'Remetente do SMS',
          field1Value: '+55 (11) 98842-1092 (Telefonia Móvel Comum)',
          field2Label: 'Canal de SMS dos Correios',
          field2Value: 'Shortcode corporativo de 5 dígitos (ex: 28588)',
          field3Label: 'Consulta de Rastreio NL8392019BR',
          field3Value: 'Código não localizado no Sistema Nacional de Rastreamento',
          observation: 'O SMS veio de um celular pessoal comum de 9 dígitos e o código de objeto não existe na base nacional dos Correios.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Enviado por celular comum em vez de número corporativo!',
          details: 'Empresas oficiais usam códigos curtos (shortcodes) de 5 dígitos, nunca celulares pré-pagos comuns.',
          fato: 'Golpistas compram pacotes de disparo de SMS em massa usando números de telefone celular descartáveis.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'O link leva para um site falso (.online) criado há 3 dias e o código de rastreio não existe nos Correios.',
      'A mensagem veio de um celular comum de 9 dígitos e não do número curto oficial de 5 dígitos.',
      'O valor da taxa de R$ 27,90 é muito baixo, pois taxas de importação federais são sempre acima de R$ 100.',
      'O site dos Correios nunca pode usar a cor amarela em links enviados pelo celular.',
    ],
    correctEvidenceIndex: 0,
    circumstantialHintIndex: 1,
    circumstantialHintFeedback: 'Receber SMS de um celular comum é um sinal forte de desconfiança, mas fornecedores e transportadoras terceirizadas por vezes usam rotas variadas. A prova irrefutável e técnica é o link falso (.online criado há 3 dias) e o código que nem sequer existe nos Correios!',
    keyEvidenceReason: 'O link leva para um site falso (.online) hospedado no exterior e o código de rastreio informado sequer existe no banco de dados dos Correios.',
    redFlags: [
      'Endereço do site estranho (termina em .online em vez de correios.com.br)',
      'SMS enviado por celular comum de 9 dígitos',
      'Pressa para pagar uma taxa no mesmo dia',
      'Cobrança direta de Pix em página não oficial',
    ],
    explanation: 'Golpe do SMS falso dos Correios. Criminosos mandam mensagens automáticas para milhares de celulares torcendo para que alguém que comprou pela internet se assuste e pague a taxa falsa.',
    realWorldTip: 'Nunca clique em links de SMS sobre entregas. Abra o site correios.com.br você mesmo e consulte o rastreamento.',
    pedagogy: {
      emotionalTrigger: 'Medo de Perder a Encomenda: o golpista quer que você clique no link por impulso achando que seu pacote vai ser cancelado.',
      kidsAnalogy: 'É como receber um bilhete anônimo dizendo que seu brinquedo foi preso e cobrando dinheiro para soltar.',
      parentsGuide: 'Ensine a família a nunca clicar em links de SMS. Sempre consulte pelo aplicativo ou site oficial.',
      adultRemedy: 'Se pagou o Pix falso, tire prints da tela e conteste a transferência no app do banco.',
      goldenRule: 'Os Correios nunca mandam link de cobrança por Pix via SMS!',
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
          badge: 'Sistema Operacional & App',
          field1Label: 'Origem da Notificação',
          field1Value: 'Push Notification nativo do aplicativo Nubank instalado',
          field2Label: 'Links ou Endereços Web',
          field2Value: 'Nenhum link externo contido no aviso',
          field3Label: 'Solicitação de Dados Cadastrais',
          field3Value: 'Nenhuma senha, código ou dado solicitado',
          observation: 'A notificação é gerada localmente pelo próprio aplicativo do banco, sem links externos nem pedidos de senha.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Notificação legítima do próprio app oficial!',
          details: 'A mensagem foi gerada internamente pelo aplicativo oficial do banco já instalado.',
          fato: 'Notificações push autênticas de aplicativos instalados não contêm links para navegadores web desconhecidos.',
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
      'É um aviso comum do próprio app do banco sobre uma compra real que você acabou de fazer, sem links e sem pedir Pix.',
    ],
    correctEvidenceIndex: 3,
    keyEvidenceReason: 'O próprio aplicativo do banco enviou um aviso normal sobre a sua compra recente, sem pedir senhas, dados ou transferências.',
    redFlags: [],
    explanation: 'Esta notificação é 100% VERDADEIRA. Aplicativos de banco avisam cada compra na hora para proteger você. É importante saber reconhecer avisos normais para não entrar em pânico sem motivo.',
    realWorldTip: 'Mantenha os avisos do seu app de banco ativados! Eles te avisam na mesma hora se alguém usar seu cartão.',
    pedagogy: {
      emotionalTrigger: 'Susto com Notificação: ver um aviso de compra no celular pode assustar, mas conferir o extrato no app mostra que foi uma compra sua.',
      kidsAnalogy: 'É como a campainha da casa tocando quando alguém da sua família chega com as compras.',
      parentsGuide: 'Ensine a conferir o extrato do banco no aplicativo sempre que fizer uma compra.',
      adultRemedy: 'Se não reconhecer uma compra no app, use a opção "Bloquear Cartão" direto no aplicativo oficial.',
      goldenRule: 'Aviso do app oficial sem link externo é proteção para você, não golpe!',
    },
    reinforcementDrill: {
      title: "Treino de Vigilância: Notificação Real vs Golpe",
      question: "Como você diferencia um aviso legítimo do seu banco de uma notificação forjada por golpistas?",
      context: "Muitas pessoas entram em pânico com notificações de compras e acabam caindo em armadilhas de falsas centrais.",
      options: [
            {
                  id: "opt-3-a",
                  text: "Avisos reais do app apenas informam a compra e NUNCA incluem links de internet nem pedem para fazer Pix.",
                  isCorrect: true,
                  feedback: "Perfeito! Bancos usam o push para transparência. Golpistas sempre colocam um link ou um número para você ligar no desespero."
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
    category: 'SMS & Falsa Central',
    title: 'SMS de Falsa Compra de R$ 3.890 no Magazine Luiza com 0800',
    dilemma: 'Você recebe um SMS alarmante de compra de R$ 3.890 no Magazine Luiza com um 0800 pedindo para ligar urgente se desconhecer a transação.',
    sender: '0800 729 0001 (Magalu)',
    channel: 'sms',
    time: '15:42',
    preview: 'MAGALU: Compra aprovada de R$ 3.890,00 no Cartão Virtual...',
    messageContent:
      'MAGALU ALERTA: Compra aprovada no valor de R$ 3.890,00 no seu Cartão Virtual.\n\nEstabelecimento: Magazine Luiza S/A (Hoje às 15:42).\n\nCaso você NÃO reconheça esta transação, ligue imediatamente para nossa Central de Prevenção a Fraudes: 0800 729 0001.',
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
          details: 'No aplicativo do banco não existe nenhuma cobrança de R$ 3.890. O SMS é uma isca falsa para criar desespero.',
          fato: 'Golpistas inventam compras de alto valor por SMS para induzir a vítima a ligar para o 0800 no susto.',
        },
      },
      {
        id: 'clue-3-central-0800',
        name: 'Gravação da Central 0800',
        buttonLabel: 'Ligar para o 0800 do SMS',
        category: 'phone',
        question: 'O que o atendente do 0800 pede para você fazer?',
        inspection: {
          type: 'security',
          badge: 'Atendimento Telefônico 0800',
          field1Label: 'Atendimento do 0800',
          field1Value: 'Falso atendente atende fingindo ser da Central de Fraudes do Banco',
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
        question: 'O que as notícias alertam sobre SMS com 0800 de compra aprovada?',
        inspection: {
          type: 'link',
          badge: 'Pesquisa no Google Brasil',
          field1Label: 'Termo Pesquisado',
          field1Value: '"SMS compra aprovada 0800 Magazine Luiza"',
          field2Label: 'Alerta Antifraude Localizado',
          field2Value: 'Notícia de Segurança: "Golpe do 0800 falso usa SMS de compras inventadas para roubar Pix"',
          field3Label: 'Orientação Oficial dos Bancos',
          field3Value: 'Nunca ligue para números informados em SMS. Consulte seu extrato no app oficial.',
          observation: 'A pesquisa no Google confirma que criminosos contratam números 0800 para fingir que são centrais antifraude de lojas e bancos.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Alerta nacional: Golpe clássico do 0800 falso!',
          details: 'Criminosos mandam SMS em massa sobre compras falsas de lojas famosas com números 0800 controlados por eles.',
          fato: 'Para falar com seu banco de verdade, use apenas o telefone oficial impresso no verso do seu cartão físico.',
        },
      },
    ],
    isScam: true,
    evidenceHypotheses: [
      'O Magazine Luiza não vende produtos com valores quebrados sem centavos.',
      'No app do banco não há nenhuma compra no extrato e o atendente do 0800 exige Pix para cancelamento.',
      'O SMS veio com um número 0800 pedindo para você ligar com urgência se não reconhece a compra.',
      'Ligações para 0800 são proibidas aos sábados e domingos segundo o Procon.',
    ],
    correctEvidenceIndex: 1,
    circumstantialHintIndex: 2,
    circumstantialHintFeedback: 'Receber um SMS com número 0800 pedindo para ligar gera desconfiança, mas bancos às vezes informam canais de suporte. A prova definitiva do golpe é o extrato do seu banco estar ZERADO (a compra nunca existiu) e o atendente pedir um Pix para cancelar!',
    keyEvidenceReason: 'O extrato oficial no aplicativo do banco está totalmente limpo (a compra de R$ 3.890 nunca existiu) e o atendente do 0800 exige que a vítima faça um Pix para estorno.',
    redFlags: [
      'SMS alarmando sobre compra de alto valor que você não fez',
      'Instrução para ligar urgentemente em um número 0800',
      'Extrato da conta limpo sem nenhuma cobrança real',
      'Atendente pedindo transferência Pix para "proteger o saldo"',
    ],
    explanation: 'Golpe do SMS de Compra Aprovada com Falsa Central 0800. Os golpistas inventam uma compra alta no Magazine Luiza para assustar você. Ao ligar no 0800 deles, falsos atendentes dizem que para cancelar a compra você tem que fazer um Pix para uma conta de segurança.',
    realWorldTip: 'Recebeu SMS de compra estranha? NUNCA ligue no número do SMS. Abra seu aplicativo de banco e confira o extrato. Se não tiver nada lá, apague a mensagem!',
    pedagogy: {
      emotionalTrigger: 'Susto e Pânico Financeiro: a mensagem de compra de quase 4 mil reais induz a vítima a ligar para o 0800 sem checar o extrato antes.',
      kidsAnalogy: 'É como alguém passar na rua gritando que pegou sua bicicleta para você correr até o esconderijo deles.',
      parentsGuide: 'Ensine a nunca ligar para telefones que vêm dentro de SMS. O canal seguro é sempre o telefone do verso do cartão.',
      adultRemedy: 'Desligue imediatamente qualquer ligação que peça transferências Pix para estornar compras.',
      goldenRule: 'O extrato do banco é a única verdade: se não tá no extrato, a compra não existe!',
    },
    reinforcementDrill: {
      title: "Treino de Reação: SMS de Compra no Cartão",
      question: "Você recebe SMS dizendo que uma compra de R$ 3.890 foi aprovada e pede para ligar no 0800 caso desconheça. Qual o primeiro passo?",
      options: [
        {
          id: "opt-fc-1",
          text: "Abrir o aplicativo do seu banco por conta própria e olhar o extrato real da conta.",
          isCorrect: true,
          feedback: "Exato! O extrato oficial do banco revela a verdade na hora: se não houver lançamento, é tentativa de golpe.",
        },
        {
          id: "opt-fc-2",
          text: "Ligar correndo para o 0800 indicado no SMS para cancelar antes que debitem.",
          isCorrect: false,
          feedback: "Perigo! O 0800 do SMS é controlado pelos próprios golpistas.",
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
          badge: 'Normativa Operacional do Banco Central',
          field1Label: 'Procedimento Solicitado na Chamada',
          field1Value: 'Transferência Pix para "Conta Cofre Provisória"',
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
        name: 'Raio-X do Número no Visor',
        buttonLabel: 'Checar como o 0800 Aparece no Visor',
        category: 'phone',
        question: 'O número 0800 na tela do celular garante que é o banco?',
        inspection: {
          type: 'official',
          badge: 'Telefonia & Roteamento',
          field1Label: 'Identificação no Visor do Celular',
          field1Value: '0800 729 0001',
          field2Label: 'Sentido do Tráfego Telefônico',
          field2Value: 'Chamada Externa Ativa (Outbound)',
          field3Label: 'Regulamentação Anatel para Linhas 0800',
          field3Value: 'Configuração exclusiva para tráfego receptivo (Inbound)',
          observation: 'O visor mostra 0800 em uma ligação recebida (chamada ativa), violando a arquitetura técnica regulamentar da Anatel.',
        },
        evidenceResult: {
          status: 'suspicious',
          headline: 'Número mascarado por tecnologia de falsificação (Spoofing)!',
          details: 'O criminoso usa tecnologia de telefonia via internet para alterar o número que aparece no visor do seu telefone.',
          fato: 'Centrais 0800 de bancos são configuradas apenas para RECEBER ligações, quase nunca para fazer chamadas ativas para clientes.',
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
      'A ligação é verdadeira porque o número que apareceu na tela começa com 0800.',
      'O atendente mandou fazer um Pix para uma "conta de segurança", o que nenhum banco jamais pede.',
      'O número 0800 é falso porque não está escrito no verso do cartão físico.',
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
        replyMessage: 'Atendente (nervoso e autoritário): "Senhor, se você desligar agora, o sistema entenderá que você confirmou o Pix de R$ 2.800! A responsabilidade civil pelo débito será sua! Permaneça na linha e faça o Pix de segurança agora!"',
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
        label: 'Questionar BINA: "Por que um 0800 está ME ligando se 0800 só recebe chamadas?"',
        actionType: 'investigation',
        playerMessage: '0800 é canal exclusivo para receber ligações de clientes. Como é que o banco está ME ligando de um 0800?',
        replyMessage: 'Atendente (hesitando): "Senhor... nós somos da divisão especial integrada de inteligência... o sistema faz a rotação de prefixo automatizada..."',
        evidenceDiscovered: {
          id: 'ev-c4-spoofing',
          title: 'Hesitação e Farsa do 0800',
          description: 'O criminoso gaguejou. Números 0800 não realizam chamadas ativas na telefonia brasileira.',
          status: 'suspicious',
          forensicFact: 'O BINA Spoofing mascara a chamada para parecer um canal oficial.',
        },
      },
      {
        id: 'act-c4-3',
        label: 'Hesitar: "Mas por que EU tenho que fazer um Pix para estornar uma compra?"',
        actionType: 'investigation',
        playerMessage: 'Se o banco é quem cuida da minha conta, por que EU preciso transferir um Pix para cancelar uma transação?',
        replyMessage: 'Atendente (pressionando): "É o protocolo de compensação do Banco Central, senhor! O cofre precisa do espelhamento do saldo para validar o bloqueio! Faltam apenas 40 segundos, faça a transferência!"',
        evidenceDiscovered: {
          id: 'ev-c4-protocolo-falso',
          title: 'Invenção de Protocolo Falso',
          description: 'O Banco Central não possui "cofre de espelhamento". Todo estorno bancário é feito pelo sistema interno do banco.',
          status: 'suspicious',
          forensicFact: 'Banco nenhum pede dinheiro de volta para cancelar transação não reconhecida.',
        },
      },
    ],
    redFlags: [
      'Ligação dizendo que sua conta foi invadida',
      'Pressão para agir rápido e não desligar o telefone',
      'Pedido para fazer Pix para "proteger" o dinheiro',
      'Golpista fingindo usar o número oficial do banco no visor do celular',
    ],
    explanation: 'Este é o Golpe da Falsa Central Telefônica. Os criminosos simulam o som de call center e fingem que são do banco para você se desesperar e transferir seu dinheiro para eles.',
    realWorldTip: 'Recebeu ligação do banco falando de compra suspeita? DESLIGUE NA HORA! Pegue seu cartão e ligue para o número do verso.',
    pedagogy: {
      emotionalTrigger: 'Medo de Perder o Dinheiro: o golpista diz que sua conta foi invadida para você não ter tempo de desligar e conferir.',
      kidsAnalogy: 'É como alguém fingir que é o diretor da escola no telefone dizendo que você precisa pagar para não ser expulso.',
      parentsGuide: 'Oriente idosos e parentes: bancos nunca ligam pedindo para transferir dinheiro para cancelar compras.',
      adultRemedy: 'Desligue imediatamente e ligue para o número que está impresso no verso do seu cartão.',
      goldenRule: 'O banco nunca pede Pix para estornar ou cancelar compras!',
    },
    reinforcementDrill: {
      title: "Treino de Reação: A Ligação da Falsa Central",
      question: "Uma gravação profissional te liga dizendo que uma compra de R$ 3.800 foi aprovada no seu cartão e transfere para um atendente. O que você faz?",
      context: "Golpistas conseguem mascarar o número no visor do celular para parecer o 0800 do banco (BINA Spoofing).",
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
          badge: 'Whois & Registro de Domínio',
          field1Label: 'URL do Anúncio',
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
          field1Label: 'Preço no Anúncio',
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
      'O anúncio no Instagram não tem o selo azul de verificação ao lado do nome.',
      'A loja oferece frete grátis para todo o Brasil sem calcular taxa de entrega.',
    ],
    correctEvidenceIndex: 0,
    keyEvidenceReason: 'O site é clonado (.shop), cobra um preço bom demais para ser verdade e só aceita Pix para não ter como estornar.',
    redFlags: [
      'Desconto absurdo de mais de 80% em produto caro',
      'Endereço de site estranho (termina em .shop)',
      'O site só aceita pagamento por Pix',
      'Anúncio com relógio de contagem regressiva para comprar rápido',
    ],
    explanation: 'Golpe da Loja Falsa na internet. Os golpistas criam um site falso quase idêntico ao de uma loja famosa, cobram metade do preço e pegam o Pix de quem tenta comprar.',
    realWorldTip: 'Viu uma promoção incrível em rede social? Não clique no link do anúncio! Abra o navegador, digite o site oficial da loja e procure o produto por lá.',
    pedagogy: {
      emotionalTrigger: 'Pressa de Aproveitar a Oferta: a promessa de um super desconto faz a pessoa querer comprar correndo sem olhar o endereço do site.',
      kidsAnalogy: 'É como alguém na internet prometer diamantes no jogo por um preço quase de graça, mas só se pagar adiantado.',
      parentsGuide: 'Ensine que quando o preço é bom demais, quase sempre é golpe. Descontos de 80% em celulares não existem.',
      adultRemedy: 'Denuncie o anúncio na rede social e nunca faça Pix para sites que você não conhece.',
      goldenRule: 'Desconto milagroso? Entre no site oficial digitando pelo navegador!',
    },
    reinforcementDrill: {
      title: "Treino de Compras: Descontos Miraculosos na Internet",
      question: "Você vê um anúncio nas redes sociais com um smartphone top de linha por R$ 399 no Pix (preço normal R$ 3.500). Qual é a conclusão de análise?",
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
          badge: 'Registro de Sessão no Navegador',
          field1Label: 'Ação Realizada pelo Usuário',
          field1Value: 'Inserção de agência e conta no site bb.com.br pelo computador',
          field2Label: 'Horário do Login no Navegador',
          field2Value: '15:10:00',
          field3Label: 'Horário de Recebimento do SMS',
          field3Value: '15:10:03 (Intervalo de 3 segundos)',
          observation: 'O SMS foi disparado 3 segundos após uma tentativa voluntária de login realizada pelo próprio usuário.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Envio imediato em resposta direta ao seu login!',
          details: 'O SMS foi gerado exatamente no instante em que você solicitou acesso no computador.',
          fato: 'Autenticação de dois fatores legítima ocorre em sincronia direta com a ação voluntária do usuário.',
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
          fato: 'Shortcodes de 5 dígitos são rigorosamente auditados pelas operadoras de telefonia e custam caro para serem mantidos.',
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
    keyEvidenceReason: 'O SMS foi pedido por você mesmo para entrar no banco, veio do canal oficial (número de 5 dígitos) e não tem links suspeitos.',
    redFlags: [],
    explanation: 'Mensagem 100% VERDADEIRA. É o código de confirmação (2 etapas) que o banco manda para saber se é você mesmo. O único perigo é se alguém te ligar pedindo esse código — NUNCA passe esse número para ninguém!',
    realWorldTip: 'Códigos por SMS são como a chave da sua casa: use você mesmo onde você pediu, mas NUNCA leia nem passe para ninguém por telefone!',
    pedagogy: {
      emotionalTrigger: 'Dúvida sobre Códigos: desconfiar é normal, mas basta lembrar se foi você mesmo quem tentou acessar a conta no computador.',
      kidsAnalogy: 'É como a senha do seu cofre que você usa para abrir, mas se alguém estranho pedir para você contar, você não conta.',
      parentsGuide: 'Explique que códigos de SMS servem apenas para a própria pessoa digitar onde ela mesma abriu.',
      adultRemedy: 'Se alguém te ligar pedindo o código recebido, desligue na hora.',
      goldenRule: 'Código de SMS é pessoal: nunca passe para ninguém por telefone!',
    },
    reinforcementDrill: {
      title: "Treino de Autenticação: O Código de 2 Fatores (2FA)",
      question: "Você recebe um SMS do seu banco com o texto: \"Seu codigo de acesso: 829104. Nao informe a ninguem\". Em seguida, alguém te liga pedindo esse código. O que fazer?",
      context: "O golpista já tem sua senha inicial e precisa apenas do código do SMS para esvaziar sua conta.",
      options: [
            {
                  id: "opt-6-a",
                  text: "NUNCA ditar nem enviar o código para ninguém: códigos de SMS são de uso exclusivo e pessoal.",
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
    title: 'Vaga de Trabalho Remoto: R$ 350/dia para Curtir Vídeos',
    dilemma: 'Uma recrutadora te chama no WhatsApp oferecendo trabalho flexível de meio período para avaliar marcas e curtir vídeos no YouTube. No primeiro dia você ganha R$ 20 de verdade no Pix, mas no segundo pedem um depósito de R$ 100 para liberar tarefas VIP.',
    sender: 'Larissa - RH Shopee Brasil',
    channel: 'whatsapp',
    time: '09:30',
    preview: 'Ola! Vaga home office disponivel. Ganhe de R$ 100 a R$ 500...',
    messageContent:
      'Olá! Tudo bem? Sou a Larissa, recrutadora de talentos da Shopee Brasil. Selecionamos seu perfil para nossa equipe de avaliação de produtos.\n\nO trabalho é 100% online pelo celular, dedicando apenas 30 minutos por dia para curtir itens e avaliar lojas. Pagamento diário via Pix entre R$ 150 e R$ 500!\n\nNo primeiro teste você ganha R$ 20 na hora, e na etapa seguinte basta depositar a cota de R$ 100 via Pix para liberar os saques das Tarefas VIP.\n\nPara começar agora, entre no nosso grupo de trabalho do Telegram: https://t.me/shopee_tarefas_vip',
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
      'Promessa de até R$ 350 por dia só para dar curtidas em vídeos',
      'Pedido para você depositar dinheiro para poder sacar seus ganhos',
    ],
    explanation: 'Golpe das Tarefas no Telegram. O golpista paga R$ 20 no primeiro dia como isca para fazer você confiar. Quando você deposita R$ 500 para a "tarefa VIP", eles bloqueiam você e somem com o dinheiro.',
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
          badge: 'Cadeia de Custódia Digital',
          field1Label: 'Endereço do Portal Acessado',
          field1Value: 'https://cav.receita.fazenda.gov.br',
          field2Label: 'Método de Autenticação Utilizado',
          field2Value: 'Login Gov.br com Biometria Facial (Nível Ouro)',
          field3Label: 'Origem do Documento',
          field3Value: 'Caixa Postal interna autenticada do contribuinte',
          observation: 'O documento foi acessado diretamente dentro do portal oficial .gov.br mediante autenticação forte Gov.br.',
        },
        evidenceResult: {
          status: 'clean',
          headline: 'Mensagem lida dentro da área interna autenticada do Governo Federal!',
          details: 'O contribuinte acessou voluntariamente o domínio oficial .gov.br com autenticação forte Gov.br.',
          fato: 'Criminosos não conseguem injetar mensagens dentro da caixa postal do portal e-CAC governamental oficial.',
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
      'A notificação está dentro do site oficial do governo (Gov.br), não pede Pix e dá 30 dias para você responder com calma.',
      'O documento é verdadeiro apenas porque tem o desenho do brasão da República no cabeçalho.',
      'A cobrança é real porque a Receita só pode pedir recibos de médicos nos primeiros meses do ano.',
      'O aviso é falso porque notificações sobre impostos só podem ser entregues pessoalmente por policiais.',
    ],
    correctEvidenceIndex: 0,
    keyEvidenceReason: 'A mensagem está na caixa postal do site oficial Gov.br acessado por você mesmo, não cobra Pix e dá 30 dias de prazo para responder.',
    redFlags: [],
    explanation: 'Mensagem 100% VERDADEIRA E OFICIAL. Quando você mesmo entra no site oficial Gov.br e vê um aviso na sua caixa postal, ele é real e você tem tempo para resolver sem desespero.',
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
      context: "Golpistas mandam e-mails falsos com boletos. A Receita Federal oficial atua exclusivamente pela Caixa Postal do Gov.br.",
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
          badge: 'Gravação da Chamada Telefônica',
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
      'Ligação dizendo que o celular está com vírus',
      'Ordem para instalar aplicativos como AnyDesk ou TeamViewer',
      'Pressão psicológica dizendo que seu dinheiro vai sumir se você desligar',
      'Pedido para passar códigos numéricos que aparecem na tela',
    ],
    explanation: 'Golpe da Mão Fantasma (Acesso Remoto). O criminoso convence a pessoa a instalar um aplicativo de controle de tela. Ao passar o código, o golpista assume o controle do celular e faz transferências sem você conseguir impedir.',
    realWorldTip: 'NUNCA instale aplicativos no celular a pedido de pessoas que te ligaram por telefone, por mais convincentes que pareçam!',
    pedagogy: {
      emotionalTrigger: 'Medo de Vírus e Invasão: o golpista finge que seu celular está infectado para fazer você se assustar e entregar o controle do aparelho.',
      kidsAnalogy: 'É como alguém na rua dizer que tem um monstro na sua casa e pedir a chave do portão para entrar e tirar o monstro.',
      parentsGuide: 'Ajude idosos e parentes a desinstalarem aplicativos como AnyDesk ou TeamViewer se eles não usam no dia a dia.',
      adultRemedy: 'Se instalou e passou o código, desligue o Wi-Fi e os dados móveis na mesma hora ou desligue o celular.',
      goldenRule: 'Nenhum banco pede para você instalar aplicativos de suporte no celular!',
    },
    reinforcementDrill: {
      title: "Treino de Dispositivos: O Golpe do Acesso Remoto (Mão Fantasma)",
      question: "Um atendente telefônico diz que seu celular tem um vírus perigoso e ordena que você instale o app \"AnyDesk\" ou \"TeamViewer\" para limpeza. Por que isso é um golpe?",
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

// 4 Fases Canônicas dos Golpes Mais Comuns no Smartphone Brasileiro
export const CANONICAL_CASES: ScamCase[] = [
  SCAM_CASES.find((c) => c.id === 'case-1-whatsapp') || SCAM_CASES[0],
  SCAM_CASES.find((c) => c.id === 'case-2-correios') || SCAM_CASES[1],
  SCAM_CASES.find((c) => c.id === 'case-3-falsa-central-sms') || SCAM_CASES[2],
  SCAM_CASES.find((c) => c.id === 'case-7-vaga-tarefas') || SCAM_CASES[3],
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
    description: 'Acertou 3 casos seguidos com fundamentação de análise perfeita.',
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
