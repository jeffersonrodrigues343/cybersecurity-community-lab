import type { ScamCase, InvestigativeClue } from './scamsData';

// funcoes random
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

// gera os casos dinamicamente
export function generateDynamicScamCase(streak: number = 0): ScamCase {
  // ajusta a dificuldade baseado nos acertos
  // se ta acertando muito, manda mais golpe
  const scamProb = Math.min(0.8, 0.3 + (streak * 0.1));
  const isGeneratingScam = Math.random() < scamProb;

  const scamTypes = ['whatsapp_parente', 'correios_sms', 'falsa_central'];
  const legitTypes = ['compra_legitima'];

  const selectedScenario = isGeneratingScam ? pick(scamTypes) : pick(legitTypes);
  const caseUid = `dynamic-${Date.now()}-${randomInt(100, 999)}`;

  switch (selectedScenario) {
    case 'whatsapp_parente': {
      const names = ['Camila', 'Beatriz', 'Lucas', 'Matheus', 'Gabriel', 'Sofia'];
      const relative = pick(names);
      const amount = pick(['R$ 420', 'R$ 540', 'R$ 680', 'R$ 790']);
      const reasons = [
        'tenho que pagar uma taxa urgente da matrícula da faculdade até às 15h',
        'meu carro/moto furou o pneu voltando do estágio e o mecânico só aceita Pix',
        'preciso pagar um remédio urgente na farmácia e meu app do banco desautorizou',
      ];
      const reason = pick(reasons);
      const strangeDDD = pick(['85', '98', '62', '71', '81', '91']);
      const orangeName = pick(['Valter dos Santos', 'Cleiton Mendes', 'Renata Albuquerque', 'Marcio Souza']);
      const phoneNum = `+55 (${strangeDDD}) 9${randomInt(8100, 9999)}-${randomInt(1000, 9999)}`;
      const pixKey = `${randomInt(100, 999)}.${randomInt(100, 999)}.${randomInt(100, 999)}-${randomInt(10, 99)}`;

      const clues: InvestigativeClue[] = [
        {
          id: `clue-${caseUid}-1`,
          name: 'Ficha do Número Remetente',
          buttonLabel: 'Ver Detalhes do Contato',
          category: 'phone',
          question: 'De qual região é esse prefixo telefônico e há quanto tempo está ativo?',
          inspection: {
            type: 'contact',
            badge: 'Registro de Operadora Telefônica',
            field1Label: 'Número Remetente',
            field1Value: phoneNum,
            field2Label: 'Origem Geográfica do Prefixo (DDD)',
            field2Value: `DDD ${strangeDDD} (Região Nordeste/Centro-Oeste)`,
            field3Label: 'Data de Ativação do Chip',
            field3Value: 'Ativado há 1 dia (Plano Pré-Pago Descartável)',
            observation: `O número utiliza o DDD ${strangeDDD} e foi ativado ontem, divergindo do DDD habitual da residência familiar.`,
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'DDD incompatível e chip descartável!',
            details: `A linha telefônica foi cadastrada ontem sob o DDD ${strangeDDD}.`,
            fato: 'Criminosos adquirem chips pré-pagos de outros estados para aplicar golpes de falsa identidade.',
          },
        },
        {
          id: `clue-${caseUid}-2`,
          name: 'Raio-X da Chave Pix',
          buttonLabel: 'Consultar Favorecido no DICT',
          category: 'pix',
          question: 'Quem é o titular registrado no Banco Central para receber a quantia?',
          inspection: {
            type: 'pix',
            badge: 'Consulta no DICT (Banco Central)',
            field1Label: 'Chave Pix Informada',
            field1Value: pixKey,
            field2Label: 'Titular Registrado no Bacen',
            field2Value: orangeName,
            field3Label: 'Tipo de Conta / Instituição',
            field3Value: 'Pessoa Física - Instituição de Pagamento Digital',
            observation: `A chave informada destina-se a uma pessoa física estranha (${orangeName}) e não ao familiar.`,
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Conta Pix pertence a terceiro desconhecido!',
            details: `O dinheiro iria para ${orangeName}, sem vínculo com a família.`,
            fato: 'Golpistas utilizam contas bancárias de intermediários ("laranjas") para pulverizar valores transferidos.',
          },
        },
        {
          id: `clue-${caseUid}-3`,
          name: 'Teste de Voz / Chamada',
          buttonLabel: 'Efetuar Chamada de Voz',
          category: 'behavior',
          question: 'O remetente aceita comunicação vocal em tempo real?',
          inspection: {
            type: 'security',
            badge: 'Tentativa de Comunicação Telefônica',
            field1Label: 'Status da Chamada de Voz',
            field1Value: 'Chamada rejeitada imediatamente pelo destinatário',
            field2Label: 'Mensagem de Resposta',
            field2Value: '"Tô no trânsito/sala, microfone quebrou, fala só por texto"',
            field3Label: 'Canal Aceito',
            field3Value: 'Exclusivamente mensagens de texto',
            observation: 'O remetente rejeita ligações e áudios, forçando contato unilateral por texto.',
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Recusa sistemática de verificação por voz!',
            details: 'O interlocutor evita qualquer meio vocal que revele que não é o familiar.',
            fato: 'A confirmação por voz no número habitual é a contraprova infalível contra o golpe do novo número.',
          },
        },
      ];

      const hypotheses = [
        `O titular do Pix é pessoa física desconhecida (${orangeName}) e o prefixo DDD ${strangeDDD} é inconsistente com a família.`,
        'O valor solicitado ultrapassa o limite noturno padrão estabelecido na Resolução do Banco Central.',
        'O envio de foto de perfil sem autenticação biométrica em duas etapas bloqueia transferências automaticamente.',
        'A mensagem utiliza abreviações informais proibidas nas diretrizes de segurança de mensagens instantâneas.',
      ];

      // Sorteia a posição da alternativa correta (A, B, C ou D)
      const correctIdx = pick([0, 1, 2, 3]);
      if (correctIdx !== 0) {
        const temp = hypotheses[0];
        hypotheses[0] = hypotheses[correctIdx];
        hypotheses[correctIdx] = temp;
      }

      return {
        id: caseUid,
        level: 'medio',
        levelTitle: 'Cenário Dinâmico • WhatsApp',
        xpReward: 90,
        category: 'WhatsApp & Família',
        title: `Pedido de Pix Urgente via Número Novo (${relative})`,
        dilemma: `Um número desconhecido com a foto de ${relative} afirma que o celular quebrou e solicita um Pix de ${amount} para cobrir um imprevisto.`,
        sender: `${relative} (Contato Desconhecido)`,
        channel: 'whatsapp',
        time: `${randomInt(10, 18)}:${randomInt(10, 59)}`,
        preview: `Oi! Anota meu número novo aí... Celular quebrou...`,
        messageContent: `Oi! Por favor salva meu número provisório na sua agenda. O meu celular antigo caiu no chão e não tá ligando.\n\nPreciso te pedir um favorzinho urgente: ${reason}. Consegue me mandar um Pix de ${amount} agora? Prometo que te devolvo assim que chegar em casa!\n\nChave Pix: ${pixKey}`,
        clues,
        isScam: true,
        interactiveActions: [
          {
            id: 'act-wa-1',
            label: 'Pedir áudio de 5 segundos pra ouvir a voz',
            playerMessage: 'Filho(a), manda um áudio de 5 segundos falando comigo agora!',
            replyMessage: 'Mãe, tô com o microfone quebrado e na fila do banco! Preciso do Pix agora!',
            evidenceDiscovered: {
              id: 'ev-audio-refusal',
              title: 'Recusa de Áudio e Pressão Emocional',
              description: 'O golpista inventa desculpa técnica para evitar confirmação de voz e apela para urgência.',
              status: 'suspicious',
            },
          },
          {
            id: 'act-wa-2',
            label: 'Fazer pergunta pessoal secreta',
            playerMessage: 'Qual é o nome do cachorro que a gente adotou no sítio?',
            replyMessage: 'Ai que pergunta agora?! Tô sem tempo pra brincadeira, a faculdade vai me multar!',
            evidenceDiscovered: {
              id: 'ev-secret-question',
              title: 'Falha na Validação Pessoal',
              description: 'O interlocutor não sabe responder informações básicas da rotina familiar e reage com irritação.',
              status: 'suspicious',
            },
          },
          {
            id: 'act-wa-3',
            label: 'Conferir titular da chave Pix',
            playerMessage: 'Em nome de quem está essa chave Pix que você passou?',
            replyMessage: 'Tá no nome de um colega (' + orangeName + ') porque o app do banco não autorizou meu celular novo.',
            evidenceDiscovered: {
              id: 'ev-orange-account',
              title: 'Chave Pix de Pessoa Física Desconhecida',
              description: 'A chave Pix pertence a ' + orangeName + ', um laranja sem nenhuma ligação com a família.',
              status: 'suspicious',
            },
          },
        ],
        evidenceHypotheses: hypotheses,
        correctEvidenceIndex: correctIdx,
        keyEvidenceReason: `O DDD do contato (${strangeDDD}) é divergente do núcleo familiar e o titular registrado da chave Pix é uma pessoa física estranha (${orangeName}).`,
        redFlags: ['Número novo desconhecido', 'Urgência financeira imediata', 'Conta Pix em nome de estranho'],
        explanation: 'Golpe clássico da clonagem de foto com número novo. Criminosos obtêm fotos públicas e números de parentes para induzir transferências imediatas sob o pretexto de emergência.',
        realWorldTip: 'Sempre telefone para o número antigo do seu parente ou faça chamada de vídeo antes de qualquer transferência.',
        pedagogy: {
          emotionalTrigger: 'Urgência Afetiva Familiar',
          kidsAnalogy: 'É como alguém colocar uma foto do seu amigo de papelão na frente da porta.',
          parentsGuide: 'Institua uma palavra-código de emergência que só sua família sabe.',
          adultRemedy: 'Acione imediatamente a contestação via Mecanismo Especial de Devolução (MED) no app bancário.',
          goldenRule: 'Número novo pedindo dinheiro? Ligue no número antigo e confirme por voz!',
        },
        reinforcementDrill: {
          title: 'Treino de Olho: O Contato com Celular Quebrado',
          question: `Se alguém te manda mensagem dizendo ser ${relative} com número novo pedindo Pix, qual atitude garante 100% de segurança?`,
          context: 'O medo de ver o parente em apuros causa respostas precipitadas na vida real.',
          options: [
            {
              id: 'dyn-1',
              text: 'Ligar no número tradicional antigo ou falar ao vivo para ouvir a voz real.',
              isCorrect: true,
              feedback: 'Correto! A voz viva no canal habitual desmascara o criminoso em menos de 5 segundos.',
            },
            {
              id: 'dyn-2',
              text: 'Fazer o Pix imediatamente para não prejudicar a emergência.',
              isCorrect: false,
              feedback: 'Perigoso! O dinheiro vai para um estelionatário e raramente é recuperado.',
            },
            {
              id: 'dyn-3',
              text: 'Pedir que o contato envie uma foto da identidade pelo próprio chat novo.',
              isCorrect: false,
              feedback: 'Ineficaz! Criminosos compram fotos de documentos vazados na internet.',
            },
          ],
        },
      };
    }

    case 'correios_sms': {
      const code = `NL${randomInt(1000000, 9999999)}BR`;
      const fee = pick(['R$ 24,90', 'R$ 29,80', 'R$ 34,50', 'R$ 41,20']);
      const fakeDomain = pick([
        'correios-rastreio-alfandega.online',
        'rastreamento-encomenda-aduana.site',
        'correios-taxa-liberacao.top',
        'portal-alfandega-express.shop',
      ]);
      const ipCountry = pick(['Islândia', 'Romênia', 'Rússia', 'Panamá']);

      const clues: InvestigativeClue[] = [
        {
          id: `clue-${caseUid}-1`,
          name: 'Raio-X do Link no Whois',
          buttonLabel: 'Consultar Domínio da Mensagem',
          category: 'whois',
          question: 'Onde e quando esse endereço da internet foi registrado?',
          inspection: {
            type: 'link',
            badge: 'Whois & DNS do Domínio',
            field1Label: 'Endereço Web Consultado',
            field1Value: `https://${fakeDomain}/taxas`,
            field2Label: 'Data de Criação do Domínio',
            field2Value: 'Registrado há 2 dias',
            field3Label: 'Servidor de Hospedagem',
            field3Value: `IP no exterior (${ipCountry})`,
            observation: `O domínio termina em extensão não oficial e foi criado há 2 dias em servidor estrangeiro.`,
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Domínio descartável registrado há 2 dias no exterior!',
            details: `O site oficial dos Correios é exclusivamente correios.com.br.`,
            fato: 'Órgãos e empresas públicas brasileiras utilizam estritamente o sufixo oficial .com.br ou .gov.br.',
          },
        },
        {
          id: `clue-${caseUid}-2`,
          name: 'Consulta ao Sistema Oficial',
          buttonLabel: 'Buscar Código no App dos Correios',
          category: 'system',
          question: 'Esse código de pacote existe na base de dados nacional dos Correios?',
          inspection: {
            type: 'official',
            badge: 'Base Nacional de Rastreamento',
            field1Label: 'Código Informado no SMS',
            field1Value: code,
            field2Label: 'Status no Banco de Dados Oficial',
            field2Value: 'Objeto não localizado na base dos Correios',
            field3Label: 'Ambiente Homologado para Tributos',
            field3Value: 'Portal "Minhas Importações" via Gov.br',
            observation: 'O código de rastreamento não consta na base nacional dos Correios.',
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Código de encomenda inexistente!',
            details: 'A busca no sistema oficial retorna objeto não encontrado.',
            fato: 'Criminosos geram códigos aleatórios para assustar pessoas que costumam comprar pela internet.',
          },
        },
        {
          id: `clue-${caseUid}-3`,
          name: 'Canal do Remetente',
          buttonLabel: 'Auditar Número do SMS',
          category: 'phone',
          question: 'O SMS veio de número corporativo homologado ou celular comum?',
          inspection: {
            type: 'contact',
            badge: 'Telefonia & Rotas de Mensageria',
            field1Label: 'Remetente do SMS',
            field1Value: `+55 (11) 9${randomInt(7000, 9999)}-${randomInt(1000, 9999)}`,
            field2Label: 'Canal Regulamentar dos Correios',
            field2Value: 'Shortcode institucional de 5 dígitos (ex: 28588)',
            field3Label: 'Tipo de Linha Emissora',
            field3Value: 'Linha Móvel Individual (Pré-Pago)',
            observation: 'O SMS foi emitido por linha celular de 9 dígitos, em desacordo com os canais homologados.',
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Enviado por celular comum em vez de shortcode!',
            details: 'Empresas públicas operam através de códigos curtos de 5 dígitos homologados pela Anatel.',
            fato: 'Linhas celulares comuns são empregadas em disparos ilegais de smishing para burlar filtros das operadoras.',
          },
        },
      ];

      const hypotheses = [
        `O link utiliza domínio externo descartável (${fakeDomain}) e o código ${code} não existe no rastreamento oficial.`,
        'O site possui certificado criptográfico HTTPS com cadeado verde, o que comprova se é real estatal.',
        'A alíquota de importação indicada não respeita a margem de isenção de 50 dólares fixada por tratado internacional.',
        'A notificação foi entregue fora do expediente dos centros de distribuição dos Correios.',
      ];

      const correctIdx = pick([0, 1, 2, 3]);
      if (correctIdx !== 0) {
        const temp = hypotheses[0];
        hypotheses[0] = hypotheses[correctIdx];
        hypotheses[correctIdx] = temp;
      }

      return {
        id: caseUid,
        level: 'basico',
        levelTitle: 'Cenário Dinâmico • SMS / Phishing',
        xpReward: 80,
        category: 'SMS & Encomendas',
        title: `SMS dos Correios: Taxa Aduaneira (${code})`,
        dilemma: `Você recebe um SMS alarmante afirmando que seu pacote ${code} está retido na alfândega e será devolvido hoje caso a taxa de ${fee} não seja paga no link indicado.`,
        sender: 'Correios Alerta',
        channel: 'sms',
        time: `${randomInt(8, 20)}:${randomInt(10, 59)}`,
        preview: `CORREIOS: Pacote ${code} retido na fiscalizacao...`,
        messageContent: `CORREIOS INFORMA: Sua encomenda ${code} foi retida na fiscalizacao aduaneira. Ha uma taxa pendente de ${fee}. Evite devolucao imediata pagando hoje no link oficial: https://${fakeDomain}/taxas`,
        clues,
        isScam: true,
        interactiveActions: [
          {
            id: 'act-sms-1',
            label: 'Auditar link no simulador de navegador seguro',
            playerMessage: 'Inspecionar para onde o link https://' + fakeDomain + '/taxas realmente aponta...',
            replyMessage: `Navegador simulado: O domínio termina em ".${fakeDomain.split('.').pop()}", fora dos servidores oficiais correios.com.br.`,
            evidenceDiscovered: {
              id: 'ev-fake-domain',
              title: 'Domínio Falso com Extensão Comercial Estranha',
              description: 'Empresas públicas e sites governamentais brasileiros usam estritamente o final .gov.br ou .com.br.',
              status: 'suspicious',
            },
          },
          {
            id: 'act-sms-2',
            label: 'Consultar código no portal oficial correios.com.br',
            playerMessage: 'Checando rastreamento no site oficial dos Correios...',
            replyMessage: 'Resultado oficial: "Código de rastreamento não encontrado na base de dados dos Correios."',
            evidenceDiscovered: {
              id: 'ev-invalid-code',
              title: 'Código de Rastreamento Falso',
              description: 'O código é forjado aleatoriamente para assustar vítimas que fizeram compras online.',
              status: 'suspicious',
            },
          },
        ],
        evidenceHypotheses: hypotheses,
        correctEvidenceIndex: correctIdx,
        keyEvidenceReason: `O domínio informado no SMS (${fakeDomain}) não pertence aos Correios e o código sequer existe no sistema oficial.`,
        redFlags: ['Link com extensão estranha (.online, .site, .shop)', 'SMS enviado de número celular comum', 'Urgência de devolução no mesmo dia'],
        explanation: 'Golpe de Smishing dos Correios. Os golpistas realizam disparos em massa aleatórios torcendo para que a vítima tenha comprado algo online recentemente.',
        realWorldTip: 'Nunca clique em links de SMS sobre encomendas. Abra o navegador, digite correios.com.br e consulte seu pacote lá.',
        pedagogy: {
          emotionalTrigger: 'Medo de Perder a Encomenda',
          kidsAnalogy: 'É como receber uma carta dizendo que seu brinquedo vai ser jogado fora se você não der seu lanche.',
          parentsGuide: 'Ensine que taxas de importação reais só são pagas logando com Gov.br no portal Minhas Importações.',
          adultRemedy: 'Se pagou, contate seu banco imediatamente para tentar bloquear o repasse do Pix.',
          goldenRule: 'Aviso de encomenda no SMS? Acesse correios.com.br direto pelo navegador!',
        },
        reinforcementDrill: {
          title: 'Treino de Olho: Links Suspeitos em SMS',
          question: 'Como você deve proceder ao receber um SMS dizendo que uma encomenda sua está com taxa pendente?',
          context: 'Links em mensagens SMS são o principal vetor de clonagem de telas de pagamento no Brasil.',
          options: [
            {
              id: 'drill-c-1',
              text: 'Ignorar o link do SMS e abrir o site oficial dos Correios (correios.com.br) para rastrear o pacote.',
              isCorrect: true,
              feedback: 'Exato! Acesso voluntário digitado no navegador é o escudo definitivo contra phishing.',
            },
            {
              id: 'drill-c-2',
              text: 'Clicar no link para conferir se tem o logotipo azul e amarelo dos Correios.',
              isCorrect: false,
              feedback: 'Cuidado! Páginas falsas copiam 100% da identidade visual dos Correios em minutos.',
            },
            {
              id: 'drill-c-3',
              text: 'Pagar a taxa pelo link porque R$ 20 é um valor baixo e não vale a pena arriscar.',
              isCorrect: false,
              feedback: 'Erro grave! Além de perder o dinheiro, você entrega seus dados bancários aos criminosos.',
            },
          ],
        },
      };
    }

    case 'compra_legitima': {
      // CENÁRIO LEGÍTIMO: COMPRA REAL NO CARTÃO POR APROXIMAÇÃO
      const establishments = ['Drogaria São Paulo', 'Supermercado Pão de Açúcar', 'Posto Ipiranga', 'Padaria Bella Paulista'];
      const store = pick(establishments);
      const amount = pick(['R$ 28,50', 'R$ 45,90', 'R$ 62,00', 'R$ 89,30']);

      const clues: InvestigativeClue[] = [
        {
          id: `clue-${caseUid}-1`,
          name: 'Origem da Notificação',
          buttonLabel: 'Verificar Canal do Aviso',
          category: 'system',
          question: 'Como a notificação chegou ao aparelho?',
          inspection: {
            type: 'official',
            badge: 'Sistema Operacional & App Bancário',
            field1Label: 'Canal de Notificação',
            field1Value: 'Push Notification nativo do aplicativo do banco instalado',
            field2Label: 'Links ou Endereços Externos',
            field2Value: 'Inexistente (nenhum link contido na mensagem)',
            field3Label: 'Solicitação de Ação Financeira',
            field3Value: 'Nenhuma ação exigida (apenas comunicado informativo)',
            observation: 'A notificação foi emitida pelo próprio aplicativo bancário instalado, sem links externos.',
          },
          evidenceResult: {
            status: 'clean',
            headline: 'Notificação nativa e informativa do banco!',
            details: 'O aviso não solicita senhas, dados nem pagamentos adicionais.',
            fato: 'Notificações push nativas configuram mecanismos de segurança e auditoria transparente para o usuário.',
          },
        },
        {
          id: `clue-${caseUid}-2`,
          name: 'Auditoria de Solicitações',
          buttonLabel: 'Checar Pedidos de Dados',
          category: 'behavior',
          question: 'O aviso pede senhas, códigos ou transferências?',
          inspection: {
            type: 'security',
            badge: 'Auditoria de Integridade da Mensagem',
            field1Label: 'Solicitação de Senha / PIN',
            field1Value: 'Não solicitada',
            field2Label: 'Exigência de Transferência Pix',
            field2Value: 'Não exigida',
            field3Label: 'Ação Recomendada pelo App',
            field3Value: 'Verificar o extrato no app apenas se não reconhecer a transação',
            observation: 'A mensagem apenas informa a compra e orienta o bloqueio preventivo pelo próprio app se necessário.',
          },
          evidenceResult: {
            status: 'clean',
            headline: 'Comunicação informativa legítima!',
            details: 'Não há indução a links, Pix ou fornecimento de credenciais.',
            fato: 'Alertas reais de bancos nunca enviam links externos para cancelar compras.',
          },
        },
        {
          id: `clue-${caseUid}-3`,
          name: 'Conferência no Extrato',
          buttonLabel: 'Consultar Histórico em Tempo Real',
          category: 'pix',
          question: 'O lançamento consta no extrato oficial do cartão?',
          inspection: {
            type: 'official',
            badge: 'Histórico Financeiro do Cartão',
            field1Label: 'Lançamento Registrado no App',
            field1Value: `${amount} - ${store}`,
            field2Label: 'Horário do Registro',
            field2Value: 'Há 1 minuto',
            field3Label: 'Método de Pagamento Utilizado',
            field3Value: 'Cartão de Débito Físico por Aproximação (Contactless)',
            observation: 'O débito no extrato coincide perfeitamente com a compra presencial recente do titular.',
          },
          evidenceResult: {
            status: 'clean',
            headline: 'Compra recente confirmada no extrato!',
            details: 'O valor e o estabelecimento correspondem à despesa recém-efetuada pelo usuário.',
            fato: 'Muitos usuários confundem notificações rotineiras de aproximação com tentativas de fraude.',
          },
        },
      ];

      const hypotheses = [
        'A notificação é um push nativo do app bancário sobre compra real recente, sem links externos nem pedidos de dados ou Pix.',
        'A notificação é segura porque o banco enviou o código de autenticação criptográfica por SMS no mesmo minuto.',
        'A transação é fraudulenta porque notificações legítimas de cartão não podem ser disparadas por aproximação sem senha.',
        'O aviso é autêntico pois toda transação física abaixo de R$ 100 possui carimbo de liberação compulsória.',
      ];

      const correctIdx = pick([0, 1, 2, 3]);
      if (correctIdx !== 0) {
        const temp = hypotheses[0];
        hypotheses[0] = hypotheses[correctIdx];
        hypotheses[correctIdx] = temp;
      }

      return {
        id: caseUid,
        level: 'basico',
        levelTitle: 'Cenário Dinâmico • Alerta Bancário',
        xpReward: 80,
        category: 'Notificações Bancárias',
        title: `Notificação do Cartão: Compra em ${store}`,
        dilemma: `Você acabou de sair de ${store} e recebe um alerta no celular: "Compra aprovada de ${amount}". Você deve entrar em pânico?`,
        sender: 'Nubank / Notificação do App',
        channel: 'push',
        time: `${randomInt(8, 20)}:${randomInt(10, 59)}`,
        preview: `Compra de ${amount} aprovada em ${store}...`,
        messageContent: `COMPRA APROVADA: Compra no valor de ${amount} realizada no seu Cartão de Débito em ${store}.\n\nSe você reconhece essa transação, nenhuma ação é necessária. Caso não reconheça, abra o aplicativo oficial e toque em Bloquear Cartão.`,
        clues,
        isScam: false,
        interactiveActions: [
          {
            id: 'act-legit-1',
            label: 'Consultar extrato recente no app do banco',
            playerMessage: 'Abrindo o extrato da conta corrente no app oficial...',
            replyMessage: 'Extrato confirma: Transação presencial de débito realizada com chip e senha há poucos minutos no local.',
            evidenceDiscovered: {
              id: 'ev-legit-receipt',
              title: 'Transação Confirmada no Extrato Real',
              description: 'A notificação reflete uma compra física autêntica, sem solicitações adicionais ou links externos.',
              status: 'clean',
            },
          },
          {
            id: 'act-legit-2',
            label: 'Checar se o aviso pede links ou senhas',
            playerMessage: 'Inspecionando corpo do alerta...',
            replyMessage: 'Aviso 100% informativo: Apenas avisa sobre o lançamento e instrui abrir o app oficial se não reconhecer.',
            evidenceDiscovered: {
              id: 'ev-no-external-links',
              title: 'Comunicação Oficial Sem Isca',
              description: 'O banco não pede para clicar em links nem solicita Pix de garantia.',
              status: 'clean',
            },
          },
        ],
        evidenceHypotheses: hypotheses,
        correctEvidenceIndex: correctIdx,
        keyEvidenceReason: 'Trata-se de uma notificação legítima do próprio aplicativo bancário informando compra presencial recente, sem links externos nem pedidos de senhas.',
        redFlags: [],
        explanation: 'Comunicação 100% LEGÍTIMA. Aplicativos modernos notificam compras em tempo real. O perigo real ocorre quando golpistas mandam SMS com links falsos fingindo ser essa notificação.',
        realWorldTip: 'Mantenha as notificações ativas no app do banco para saber na hora se seu cartão for clonado.',
        pedagogy: {
          emotionalTrigger: 'Vigilância Financeira sem Pânico',
          kidsAnalogy: 'É como a luz da geladeira acendendo quando você abre a porta.',
          parentsGuide: 'Ensine seus filhos a sempre conferirem o extrato do aplicativo após usar o cartão.',
          adultRemedy: 'Se realmente não reconhecer a compra, use o botão "Bloquear Cartão" no próprio app.',
          goldenRule: 'Notificação do app oficial sem link externo é proteção, não golpe!',
        },
        reinforcementDrill: {
          title: 'Treino de Calma: Alertas Reais vs Falsos',
          question: 'O que diferencia uma notificação real de compra do banco de uma mensagem de golpistas?',
          context: 'Golpistas tentam criar alarme para induzir ligações para falsas centrais.',
          options: [
            {
              id: 'drill-b-1',
              text: 'O banco real apenas avisa dentro do próprio app e nunca coloca links ou números 0800 para cancelar.',
              isCorrect: true,
              feedback: 'Perfeito! O banco oficial nunca te manda clicar em links ou ligar para números externos.',
            },
            {
              id: 'drill-b-2',
              text: 'Toda mensagem sobre dinheiro deve ser considerada vírus no aparelho.',
              isCorrect: false,
              feedback: 'Incorreto! Notificações oficiais do próprio app instalado são seguras e importantes.',
            },
            {
              id: 'drill-b-3',
              text: 'A mensagem real sempre pede a senha de 4 dígitos para confirmar que foi você.',
              isCorrect: false,
              feedback: 'Perigo extremo! Nenhum banco pede sua senha por mensagem em nenhuma hipótese.',
            },
          ],
        },
      };
    }

    default: {
      // CENÁRIO FALSA CENTRAL BANCÁRIA (LIGAÇÃO 0800)
      const fakeOfficer = pick(['Juliana Costa', 'Rodrigo Fagundes', 'Aline Siqueira']);
      const bogusAmount = pick(['R$ 2.450', 'R$ 3.200', 'R$ 4.100']);
      const targetName = pick(['Marcos Vinicius', 'Lucas Albuquerque', 'Edson Pereira']);

      const clues: InvestigativeClue[] = [
        {
          id: `clue-${caseUid}-1`,
          name: 'Procedimento Exigido pelo Atendente',
          buttonLabel: 'Analisar Protocolo Exigido',
          category: 'behavior',
          question: 'Bancos exigem transferência para "proteger" ou estornar dinheiro?',
          inspection: {
            type: 'security',
            badge: 'Normativa Operacional do Banco Central',
            field1Label: 'Procedimento Exigido na Ligação',
            field1Value: 'Transferência Pix para "Conta Cofre / Chave Provisória"',
            field2Label: 'Protocolo Regulamentar em Fraudes',
            field2Value: 'Bloqueio administrativo interno pelo sistema da instituição',
            field3Label: 'Resolução Bacen nº 1/2020',
            field3Value: 'Vedada a solicitação de repasse de saldo de clientes para estorno',
            observation: 'O atendente exige transferência de saldo pelo cliente, procedimento expressamente vedado pelas normas bancárias.',
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Banco NUNCA pede Pix para cancelar compras!',
            details: 'Transações fraudulentas são bloqueadas internamente pelo sistema do banco.',
            fato: 'A solicitação de Pix para "conta segura" ou "estorno" é a assinatura do Golpe da Falsa Central.',
          },
        },
        {
          id: `clue-${caseUid}-2`,
          name: 'Raio-X da Identificação no Visor',
          buttonLabel: 'Checar Sentido da Chamada (BINA)',
          category: 'phone',
          question: 'O número 0800 na tela do celular garante legitimidade da ligação?',
          inspection: {
            type: 'official',
            badge: 'Registro Anatel',
            field1Label: 'Identificação no Visor do Telefone',
            field1Value: '0800 729 0001 (Número do Banco)',
            field2Label: 'Sentido da Chamada',
            field2Value: 'Chamada Recebida',
            field3Label: 'Regulamentação Anatel para Linhas 0800',
            field3Value: 'Só recebe ligação, não faz',
            observation: 'O 0800 tá te ligando, mas pelas regras da Anatel ele só deveria receber ligações.',
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Eles fraudaram o número na sua tela (Spoofing)!',
            details: 'Os golpistas usam internet (VoIP) pra fingir que estão ligando do banco.',
            fato: '0800 de banco só serve pra VOCÊ ligar pra eles, não o contrário.',
          },
        },
        {
          id: `clue-${caseUid}-3`,
          name: 'Favorecido da Chave de Segurança',
          buttonLabel: 'Consultar Chave no DICT Bacen',
          category: 'pix',
          question: 'Quem receberá os fundos se a transferência for executada?',
          inspection: {
            type: 'pix',
            badge: 'Consulta no DICT (Banco Central)',
            field1Label: 'Destino Indicado na Ligação',
            field1Value: 'seguranca.bcb@banco-digital.com',
            field2Label: 'Titular Registrado no Bacen',
            field2Value: targetName,
            field3Label: 'Natureza da Titularidade',
            field3Value: 'Pessoa Física - Banco Digital S.A.',
            observation: `A tal "conta segura" na verdade é a conta pessoal de um CPF qualquer (${targetName}).`,
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'A conta é de um laranja!',
            details: `A conta de destino pertence a uma pessoa física individual chamada ${targetName}.`,
            fato: 'Não existe "conta cofre", "conta garantidora" ou "chave de segurança" no sistema financeiro nacional.',
          },
        },
      ];

      const hypotheses = [
        'A central telefônica exige transferência Pix para "conta de segurança" (isso não existe no banco).',
        'A ligação parece segura só porque o número 0800 é o mesmo do banco.',
        'O número 0800 da tela é diferente do número que tá no verso do seu cartão.',
        'A notificação da compra falsa chegou num horário que o banco nem funciona direito.',
      ];

      const correctIdx = pick([0, 1, 2, 3]);
      if (correctIdx !== 0) {
        const temp = hypotheses[0];
        hypotheses[0] = hypotheses[correctIdx];
        hypotheses[correctIdx] = temp;
      }

      return {
        id: caseUid,
        level: 'medio',
        levelTitle: 'Cenário Dinâmico • Falsa Central',
        xpReward: 110,
        category: 'Falsa Central Telefônica',
        title: `Ligação do "Suporte Bancário": Cancelar Pix de ${bogusAmount}`,
        dilemma: `Um cara te liga, o visor mostra o 0800 do seu banco, e ele diz que rolou uma fraude de ${bogusAmount} e manda você transferir tudo para uma "Conta Cofre de Proteção".`,
        sender: 'Central de Prevenção a Fraudes',
        channel: 'call',
        time: `${randomInt(14, 19)}:${randomInt(10, 59)}`,
        preview: `Chamada: Tentativa de transferencia suspeita de ${bogusAmount}...`,
        messageContent: `LIGAÇÃO TELEFÔNICA RECEBIDA:\n\nAtendente (${fakeOfficer}): "Identificamos uma tentativa de transferência Pix suspeita de ${bogusAmount} na sua conta. O senhor confirma essa operação?"\n\nVocê: "Não autorizei nada disso!"\n\nAtendente: "Perfeito, senhor. Para cancelar essa transação antes da compensação, o senhor precisa transferir seu saldo disponível agora para a Conta Cofre Provisória do Banco Central. Vou te passar a chave Pix de segurança..."`,
        clues,
        isScam: true,
        interactiveActions: [
          {
            id: 'act-call-1',
            label: 'Responder: "Não autorizei nada disso! Como cancelo?"',
            playerMessage: 'Não fiz essa compra! Como eu cancelo isso agora?',
            replyMessage: 'Para cancelarmos antes da compensação, o senhor deve transferir o saldo para a Conta Garantidora do Bacen.',
            evidenceDiscovered: {
              id: 'ev-cofre-demand',
              title: 'Exigência de Pix para "Conta Cofre"',
              description: 'Golpe clássico: nenhum banco solicita transferência de dinheiro para cancelar fraude.',
              status: 'suspicious',
            },
          },
          {
            id: 'act-call-2',
            label: 'Responder: "Vou desligar e ligar no telefone atrás do cartão"',
            playerMessage: 'Estou achando estranho. Vou desligar e ligar no SAC que está no verso do meu cartão.',
            replyMessage: 'Senhor, se desligar o sistema debitará os R$ 2.450 imediatamente da sua conta em 2 minutos!',
            evidenceDiscovered: {
              id: 'ev-urgent-threat',
              title: 'Ameaça e Pressão de Tempo',
              description: 'Criminosos usam terror psicológico para impedir a vítima de checar pelos canais oficiais.',
              status: 'suspicious',
            },
          },
          {
            id: 'act-call-3',
            label: 'Perguntar: "Por que o 0800 está me fazendo ligação ativa?"',
            playerMessage: 'Números 0800 são apenas para receber chamadas. Como vocês estão me ligando?',
            replyMessage: 'Utilizamos nossa central prioritária de proteção contra fraudes do sistema integrado.',
            evidenceDiscovered: {
              id: 'ev-bina-spoofing',
              title: 'Spoofing de BINA (Identificador Falso)',
              description: 'Golpistas mascaram o número chamador para exibir o 0800 oficial da instituição bancária.',
              status: 'suspicious',
            },
          },
        ],
        evidenceHypotheses: hypotheses,
        correctEvidenceIndex: correctIdx,
        keyEvidenceReason: 'Nenhum banco pede pra você fazer Pix pra devolver dinheiro ou proteger sua conta.',
        redFlags: ['Ligação alarmante dizendo que a conta foi invadida', 'Pedido de Pix para "conta de segurança"', '0800 fazendo chamada ativa (spoofing)'],
        explanation: 'Golpe da Falsa Central com BINA fake. Os golpistas fraudam o identificador de chamadas pra aparecer o 0800 do banco, fazem terror psicológico e te fazem raspar a própria conta.',
        realWorldTip: 'Desliga na cara! Se ficar na dúvida, pega o cartão e liga pro número que tá atrás dele.',
        pedagogy: {
          emotionalTrigger: 'Medo de perder o que tem na conta',
          kidsAnalogy: 'É tipo um cara bater na tua porta dizendo que é policial e pedir pra guardar teu dinheiro na casa dele.',
          parentsGuide: 'Avisa os coroas: desliga na hora e liga pro número que tá impresso no cartão.',
          adultRemedy: 'Nunca faça Pix em ligação. Se fez, corre no app do banco e aciona o Mecanismo Especial de Devolução (MED).',
          goldenRule: 'O Banco NUNCA vai te pedir Pix pra cancelar fraude!',
        },
        reinforcementDrill: {
          title: 'Treino de Reação: A Ligação da Falsa Central',
          question: 'Alguém liga dizendo ser da segurança do banco e manda transferir pra uma conta segura. O que você faz?',
          context: 'Eles fazem pressão e botam pressa pra você nem ter tempo de raciocinar.',
          options: [
            {
              id: 'drill-fc-1',
              text: 'Desliga na cara. Banco não pede Pix pra proteger grana.',
              isCorrect: true,
              feedback: 'Boa! Desligar é a única saída.',
            },
            {
              id: 'drill-fc-2',
              text: 'Fazer o Pix correndo pra não perder o dinheiro.',
              isCorrect: false,
              feedback: 'Caiu no golpe! É exatamente nesse Pix que você perde tudo.',
            },
            {
              id: 'drill-fc-3',
              text: 'Passar a senha pro atendente resolver.',
              isCorrect: false,
              feedback: 'Tá louco? Nunca se passa senha por telefone!',
            },
          ],
        },
      };
    }
  }
}
