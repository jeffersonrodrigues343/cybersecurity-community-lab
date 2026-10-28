import type { ScamCase, InvestigativeClue } from './scamsData';

// funcoes utilitarias
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

// embaralha alternativas garantindo resposta correta variada
function shuffleHypotheses(correct: string, distractors: string[]): { hypotheses: string[]; correctIndex: number } {
  const all = [correct, ...distractors];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return {
    hypotheses: all,
    correctIndex: all.indexOf(correct),
  };
}

export function generateDynamicScamCase(streak: number = 0): ScamCase {
  const scamProb = streak % 3 === 2 ? 0.2 : 0.75;
  const isGeneratingScam = Math.random() < scamProb;

  const scamTypes = ['whatsapp_parente', 'correios_sms', 'falsa_central'];
  const legitTypes = ['compra_legitima'];

  const selectedScenario = isGeneratingScam ? pick(scamTypes) : pick(legitTypes);
  const caseUid = `dynamic-${Date.now()}-${randomInt(100, 999)}`;

  switch (selectedScenario) {
    // ==========================================
    // CENÁRIO 1: WHATSAPP DO PARENTE (NÚMERO NOVO)
    // ==========================================
    case 'whatsapp_parente': {
      const names = ['Camila', 'Beatriz', 'Lucas', 'Matheus', 'Gabriel', 'Sofia'];
      const relative = pick(names);
      const isDaughter = ['Camila', 'Beatriz', 'Sofia'].includes(relative);
      const filhoX = isDaughter ? 'Filha' : 'Filho';
      const desesperadoX = isDaughter ? 'desesperada' : 'desesperado';
      const amount = pick(['R$ 420,00', 'R$ 540,00', 'R$ 680,00', 'R$ 790,00']);
      const reasons = [
        'meu carro furou o pneu voltando da faculdade e o borracheiro só aceita Pix imediato',
        'preciso pagar a taxa da rematrícula até às 16h e meu banco bloqueou o aparelho novo',
        'estou na farmácia comprando um remédio urgente e meu cartão deu chip não lido',
      ];
      const reason = pick(reasons);
      const strangeDDD = pick(['85', '98', '62', '71', '81', '91']);
      const orangeName = pick(['Valter dos Santos', 'Cleiton Mendes', 'Renata Albuquerque', 'Marcio Souza']);
      const relativeNumber = `+55 ${strangeDDD} 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;
      const pixKey = `${randomInt(100, 999)}.${randomInt(100, 999)}.${randomInt(100, 999)}-${randomInt(10, 99)}`;

      const clues: InvestigativeClue[] = [
        {
          id: `clue-${caseUid}-1`,
          name: 'Tela de Confirmação do Pix no seu Banco',
          buttonLabel: 'Simular Pix no seu App Bancário',
          category: 'pix',
          question: 'Qual nome e CPF aparecem na tela do seu banco antes de você digitar a senha?',
          inspection: {
            type: 'pix',
            badge: 'Tela do Aplicativo Bancário Real',
            field1Label: 'Como você confere na vida real',
            field1Value: 'Coloca a chave no app do seu banco e olha o nome na tela antes de pagar',
            field2Label: 'Parente que pediu o dinheiro',
            field2Value: `${relative} (Filho/Parente)`,
            field3Label: 'Nome que apareceu no seu banco',
            field3Value: `${orangeName} (Pessoa física totalmente desconhecida)`,
            observation: `Antes de digitar a senha, o app do seu banco mostra que o dinheiro vai cair na conta de "${orangeName}". Não tem nada a ver com ${relative}.`,
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'O Pix vai para uma pessoa estranha (conta de laranja)',
            details: `A tela do banco avisa claramente que o dinheiro vai para ${orangeName}.`,
            fato: 'Golpistas usam contas de pessoas terceiras ("laranjas") para receber o Pix e sacar na hora.',
          },
        },
        {
          id: `clue-${caseUid}-2`,
          name: 'Ligar para o Contato Antigo na sua Agenda',
          buttonLabel: 'Discar no Número Antigo Tradicional',
          category: 'phone',
          question: 'O que acontece quando você liga no número habitual que já estava salvo no seu celular?',
          inspection: {
            type: 'contact',
            badge: 'Ligação Telefônica Comum',
            field1Label: 'Como você confere na vida real',
            field1Value: 'Abre a agenda do telefone e liga no número de sempre do parente',
            field2Label: 'O que aconteceu na ligação',
            field2Value: `${relative} atendeu no número de sempre dizendo que o celular NÃO quebrou`,
            field3Label: 'DDD do número que mandou mensagem',
            field3Value: `Mensagem veio de ${relativeNumber} (DDD ${strangeDDD} fora do estado)`,
            observation: `Você ligou no número antigo e ${relative} atendeu normalmente! Ela disse que está tudo bem e que nunca pediu dinheiro nenhum.`,
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'O parente real atendeu no número de sempre',
            details: 'O celular do parente está funcionando e ele não pediu dinheiro.',
            fato: 'Basta uma ligação rápida de 10 segundos no número antigo para desmascarar o golpe na hora.',
          },
        },
        {
          id: `clue-${caseUid}-3`,
          name: 'Pedir Áudio ou Chamada de Vídeo',
          buttonLabel: 'Pedir Prova de Voz no WhatsApp',
          category: 'behavior',
          question: 'O que o contato faz quando você pede para ele mandar um áudio falando seu nome?',
          inspection: {
            type: 'security',
            badge: 'Teste Prático no Chat',
            field1Label: 'Como você confere na vida real',
            field1Value: `Pede um áudio de 5 segundos: "${filhoX}, manda um áudio falando meu nome"`,
            field2Label: 'Desculpa do golpista',
            field2Value: '"Tô com o microfone estragado / na sala de aula, só fala por texto!"',
            field3Label: 'Chamada de vídeo',
            field3Value: 'Recusa imediatamente e desliga na hora',
            observation: 'O contato arruma qualquer desculpa esfarrapada para não mandar áudio e insiste para você fazer o Pix logo.',
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Recusa de áudio e desculpas para fugir da voz',
            details: 'O golpista não tem a voz do seu parente, então só consegue conversar por texto.',
            fato: 'Nunca faça Pix para quem diz ser parente em número novo sem escutar a voz real dele antes.',
          },
        },
      ];

      const correctHypo = `O app do banco mostra que o Pix vai para um desconhecido (${orangeName}), e o contato foge de mandar áudio ou atender chamada de voz.`;
      const distractors = [
        'A mensagem é garantida como verdadeira se o contato estiver usando a mesma foto de perfil que o parente usa nas redes sociais.',
        'O aviso amarelo de "criptografia de ponta-a-ponta" que o WhatsApp mostra na tela significa que a conversa foi grampeada por bandidos.',
        'O banco proíbe automaticamente qualquer transferência Pix feita para contatos que não estejam salvos na sua agenda há mais de 1 mês.',
      ];

      const { hypotheses, correctIndex } = shuffleHypotheses(correctHypo, distractors);

      return {
        id: caseUid,
        level: 'avancado',
        levelTitle: 'Cenário Prático • Golpe do Parente no WhatsApp',
        xpReward: 90,
        category: 'WhatsApp & Família',
        title: `Pedido de Pix Urgente com Foto de ${relative}`,
        dilemma: `Um número que você não tem salvo mandou mensagem com a foto de ${relative}, dizendo que o celular quebrou e pedindo um Pix de ${amount} para uma emergência.`,
        sender: relativeNumber,
        channel: 'whatsapp',
        whatsapp: { number: relativeNumber, pushName: relative },
        time: `${randomInt(10, 18)}:${randomInt(10, 59)}`,
        preview: `Oi! Anota meu número novo aí... Meu celular antigo quebrou...`,
        messageContent: `Oi! Por favor salva meu número provisório na sua agenda. O meu celular antigo caiu no chão e parou de funcionar.\n\nPreciso te pedir um favorzinho urgente: ${reason}. Consegue me mandar um Pix de ${amount} agora? Prometo que te devolvo assim que chegar em casa!\n\nChave Pix: ${pixKey}`,
        clues,
        isScam: true,
        interactiveActions: [
          {
            id: 'act-wa-1',
            label: 'Pedir áudio de 5 segundos falando seu nome para ouvir a voz',
            actionType: 'investigation',
            playerMessage: `${filhoX}, manda um áudio de 5 segundos falando meu nome agora antes de eu fazer o Pix.`,
            replyMessage: `Mãe, meu microfone queimou quando o celular caiu! Não dá pra mandar áudio agora, para de desconfiar de mim e me ajuda rápido!`,
            evidenceDiscovered: {
              id: 'ev-audio-refusal',
              title: 'Desculpa para Fugir do Áudio de Voz',
              description: 'O contato inventou que o microfone quebrou e apelou para drama emocional para forçar o Pix.',
              status: 'suspicious',
              forensicFact: 'Golpistas usam fotos roubadas da internet, mas não têm a voz da pessoa. Por isso sempre inventam que o microfone quebrou.',
            },
          },
          {
            id: 'act-wa-2',
            label: 'Fazer uma pergunta que só a família sabe (ex: nome do pet)',
            actionType: 'investigation',
            playerMessage: `Qual é o nome do cachorro que a gente adotou no sítio ano passado?`,
            replyMessage: `Ai que pergunta sem noção agora?! Tô no meio da rua ${desesperadoX} e você me testando?! Me manda o Pix logo!`,
            evidenceDiscovered: {
              id: 'ev-secret-question',
              title: 'Errou / Desconversou Pergunta de Família',
              description: 'O contato não soube responder um detalhe íntimo da família e ficou irritado.',
              status: 'suspicious',
              forensicFact: 'Perguntar algo simples do dia a dia da família (nome do pet, comida preferida) desmascara qualquer golpista.',
            },
          },
          {
            id: 'act-wa-3',
            label: 'Mandar R$ 50 de adiantamento logo sem checar nada',
            actionType: 'risk_decision',
            playerMessage: `Tô te mandando R$ 50 de adiantamento agora no Pix informado pra te socorrer logo!`,
            replyMessage: `Obrigado!! O Pix caiu aqui, mas a pessoa tá exigindo o restante (${amount}) em 5 minutos ou cancela tudo, manda rápido!!`,
            evidenceDiscovered: {
              id: 'ev-risk-transfer',
              title: 'Mancada: Mandou Dinheiro sem Conferir',
              description: 'Você mandou dinheiro sem checar quem era. O golpista embolsou e imediatamente pediu mais.',
              status: 'risk_taken',
              forensicFact: 'Mandar Pix de teste transfere dinheiro real para a conta de criminosos que você nunca mais vai recuperar.',
            },
          },
        ],
        evidenceHypotheses: hypotheses,
        correctEvidenceIndex: correctIndex,
        keyEvidenceReason: `Na tela do banco o dinheiro vai para outra pessoa (${orangeName}), e quando você liga no número antigo o parente atende normalmente.`,
        redFlags: ['Número novo que não estava salvo', 'Pressão e pressa de dinheiro', 'Pix no nome de uma pessoa estranha', 'Desculpa para não mandar áudio de voz'],
        explanation: 'Golpe do Novo Número. Criminosos pegam fotos públicas de redes sociais e compram dados vazados para pedir dinheiro fingindo ser parentes em apuros.',
        realWorldTip: 'Parente pediu Pix no número novo? Ligue na mesma hora para o número ANTIGO dele ou faça chamada de vídeo!',
        pedagogy: {
          emotionalTrigger: 'Pressa e Medo de Ver Parente Sofrendo',
          kidsAnalogy: 'É como alguém colocar uma máscara com a foto do seu parente e bater na sua porta pedindo seu dinheiro.',
          parentsGuide: 'Combine com sua família: antes de fazer Pix pra quem trocou de número, tem que escutar a voz ao vivo!',
          adultRemedy: 'Se caiu no golpe, ligue para o seu banco nos primeiros minutos e peça o MED (Mecanismo Especial de Devolução).',
          goldenRule: 'Número novo pedindo Pix? Ligue para o número antigo!',
        },
        reinforcementDrill: {
          title: 'Treino Prático: Pedido de Socorro no WhatsApp',
          question: `Se alguém manda mensagem com a foto de ${relative} pedindo Pix urgente em número novo, o que você faz?`,
          context: 'O desespero de ajudar quem a gente ama faz muita gente agir por impulso.',
          options: [
            {
              id: 'dyn-1',
              text: 'Ligar para o número antigo que já estava salvo na sua agenda para escutar a voz real.',
              isCorrect: true,
              feedback: 'Perfeito! Uma ligação no número de sempre mata a charada em 5 segundos.',
            },
            {
              id: 'dyn-2',
              text: 'Mandar R$ 10 primeiro para ver se cai na conta certa.',
              isCorrect: false,
              feedback: 'Cuidado! Qualquer valor transferido vai para a mão do estelionatário.',
            },
            {
              id: 'dyn-3',
              text: 'Pedir para ele mandar uma foto da carteira de motorista pelo próprio chat novo.',
              isCorrect: false,
              feedback: 'Não resolve! Golpistas compram fotos de documentos vazados na internet para enganar as vítimas.',
            },
          ],
        },
      };
    }

    // ==========================================
    // CENÁRIO 2: FALSO CORREIOS NO WHATSAPP (TAXA ADUANEIRA)
    // ==========================================
    case 'correios_sms': {
      const code = `NL${randomInt(1000000, 9999999)}BR`;
      const correiosNumber = `+55 11 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;
      const fee = pick(['R$ 24,90', 'R$ 29,80', 'R$ 34,50', 'R$ 41,20']);
      const fakeDomain = pick([
        'correios-rastreio-alfandega.online',
        'rastreamento-encomenda-aduana.site',
        'correios-taxa-liberacao.top',
        'portal-alfandega-express.shop',
      ]);

      const clues: InvestigativeClue[] = [
        {
          id: `clue-${caseUid}-1`,
          name: 'Olhar o Final do Endereço do Site (Link)',
          buttonLabel: 'Ver o Endereço Completo do Link',
          category: 'whois',
          question: 'Para qual endereço de internet o link da mensagem realmente está te mandando?',
          inspection: {
            type: 'link',
            badge: 'Barra de Endereço do Navegador',
            field1Label: 'Como você confere na vida real',
            field1Value: 'Olha o final do link na mensagem antes de clicar',
            field2Label: 'Site oficial dos Correios no Brasil',
            field2Value: 'correios.com.br (sempre termina em .com.br)',
            field3Label: 'Final do link enviado na mensagem',
            field3Value: `https://${fakeDomain}/taxas (termina em .${fakeDomain.split('.').pop()})`,
            observation: `O site termina em ".${fakeDomain.split('.').pop()}". Os Correios e órgãos do governo brasileiro usam estritamente "correios.com.br" ou ".gov.br".`,
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'O link não é do site oficial dos Correios',
            details: `O endereço termina em .${fakeDomain.split('.').pop()}, uma extensão que golpistas compram por R$ 5 na internet.`,
            fato: 'Nenhum órgão público ou Correios usa sites terminados em .site, .online, .top ou .shop.',
          },
        },
        {
          id: `clue-${caseUid}-2`,
          name: 'Checar no App Oficial dos Correios no Celular',
          buttonLabel: 'Buscar Código no App dos Correios',
          category: 'system',
          question: 'O que o aplicativo oficial dos Correios diz sobre esse código de pacote?',
          inspection: {
            type: 'official',
            badge: 'Aplicativo Oficial dos Correios',
            field1Label: 'Como você confere na vida real',
            field1Value: 'Abre o aplicativo oficial dos Correios e cola o código do pacote',
            field2Label: 'Código informado na mensagem',
            field2Value: code,
            field3Label: 'Resposta do sistema oficial',
            field3Value: '"Objeto não encontrado na base de dados dos Correios"',
            observation: `O código de rastreamento nem existe no sistema oficial dos Correios! Foi inventado aleatoriamente para te assustar.`,
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Código de pacote falso que não existe',
            details: 'A busca no sistema oficial retorna que o pacote não existe.',
            fato: 'Golpistas mandam milhões de mensagens com códigos falsos esperando que alguém que comprou na internet caia no susto.',
          },
        },
        {
          id: `clue-${caseUid}-3`,
          name: 'Como as Taxas dos Correios São Pagas de Verdade',
          buttonLabel: 'Ver Regra Oficial de Pagamento de Taxa',
          category: 'phone',
          question: 'Os Correios cobram taxa mandando link com Pix por mensagem no WhatsApp?',
          inspection: {
            type: 'contact',
            badge: 'Regra Oficial da Alfândega e Correios',
            field1Label: 'Como funciona na vida real',
            field1Value: 'Taxa de importação só se paga no portal Gov.br entrando em "Minhas Importações"',
            field2Label: 'Forma que a mensagem está cobrando',
            field2Value: 'Link direto pedindo Pix ou cartão em página desconhecida',
            field3Label: 'Número que enviou a mensagem',
            field3Value: 'Número de celular comum de 9 dígitos (empresas usam número curto de 5 dígitos)',
            observation: 'Os Correios nunca mandam link direto para pagar taxa por Pix via WhatsApp. Tributos reais só aparecem logando no Gov.br.',
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Correios não cobram taxa com link de Pix no WhatsApp',
            details: 'Taxas aduaneiras reais só existem dentro do portal oficial Minhas Importações com login Gov.br.',
            fato: 'Mensagens alarmistas de taxa com link de pagamento direto são 100% golpe por mensagem.',
          },
        },
      ];

      const correctHypo = `O link termina em extensão estranha (${fakeDomain}) em vez de correios.com.br, e o código nem existe no app oficial dos Correios.`;
      const distractors = [
        'O site com certeza é oficial dos Correios se tiver o cadeadinho verde (HTTPS) aparecendo na barra do navegador.',
        'Se a mensagem não for pago em até 2 horas, a lei brasileira autoriza a Receita Federal a leiloar a encomenda imediatamente.',
        'Toda mensagem que tiver o logotipo amarelo e azul dos Correios é garantida como verdadeira pelas operadoras de telefonia.',
      ];

      const { hypotheses, correctIndex } = shuffleHypotheses(correctHypo, distractors);

      return {
        id: caseUid,
        level: 'avancado',
        levelTitle: 'Cenário Prático • Falso Correios no WhatsApp',
        xpReward: 80,
        category: 'WhatsApp & Encomendas',
        title: `Correios no WhatsApp: Taxa de ${fee} para Liberar Pacote`,
        dilemma: `Chegou no WhatsApp uma mensagem alarmante dizendo que seu pacote ${code} está preso na alfândega e será devolvido hoje se você não pagar uma taxa de ${fee} no link indicado.`,
        sender: correiosNumber,
        channel: 'whatsapp',
        whatsapp: { number: correiosNumber, pushName: 'Correios Encomendas', business: 'unverified' },
        time: `${randomInt(8, 20)}:${randomInt(10, 59)}`,
        preview: `CORREIOS: Pacote ${code} retido na fiscalizacao...`,
        messageContent: `CORREIOS INFORMA: Sua encomenda ${code} foi retida na fiscalizacao aduaneira. Ha uma taxa pendente de ${fee}. Evite devolucao imediata pagando hoje no link oficial: https://${fakeDomain}/taxas`,
        clues,
        isScam: true,
        interactiveActions: [
          {
            id: 'act-sms-1',
            label: 'Abrir o app dos Correios e digitar o código manualmente',
            actionType: 'investigation',
            playerMessage: `Abrindo o app oficial dos Correios e buscando o código ${code}...`,
            replyMessage: `Resultado oficial no app dos Correios: "Código não encontrado na base de dados nacional."`,
            evidenceDiscovered: {
              id: 'ev-invalid-code',
              title: 'Código Forjado Inexistente',
              description: 'O código de rastreamento é falso e não existe no sistema oficial dos Correios.',
              status: 'suspicious',
              forensicFact: 'Se o pacote não aparece no app oficial dos Correios, a mensagem é 100% golpe.',
            },
          },
          {
            id: 'act-sms-2',
            label: 'Olhar o final do endereço do link com atenção',
            actionType: 'investigation',
            playerMessage: `Olhando para onde o link https://${fakeDomain}/taxas aponta...`,
            replyMessage: `Navegador: O endereço termina em ".${fakeDomain.split('.').pop()}", fora do site oficial correios.com.br.`,
            evidenceDiscovered: {
              id: 'ev-fake-domain',
              title: 'Endereço de Site Falso',
              description: 'O site não termina em .com.br nem pertence aos Correios oficiais.',
              status: 'suspicious',
              forensicFact: 'Sites oficiais do governo e dos Correios terminam em .com.br ou .gov.br. Desconfie de .site, .top, .online e .shop.',
            },
          },
          {
            id: 'act-sms-3',
            label: `Clicar no link da mensagem e pagar os ${fee} para não arriscar`,
            actionType: 'risk_decision',
            playerMessage: `Clicando no link da mensagem e digitando os dados do cartão de crédito para liberar logo...`,
            replyMessage: `Simulador: Você caiu numa página falsa que roubou os dados do seu cartão de crédito!`,
            evidenceDiscovered: {
              id: 'ev-risk-phishing',
              title: 'Mancada: Entregou os Dados do Cartão',
              description: 'Você preencheu o formulário do site falso. Os golpistas clonaram o seu cartão de crédito.',
              status: 'risk_taken',
              forensicFact: 'Nunca clique em links enviados por WhatsApp sobre encomendas. Abra o navegador e acesse correios.com.br você mesmo.',
            },
          },
        ],
        evidenceHypotheses: hypotheses,
        correctEvidenceIndex: correctIndex,
        keyEvidenceReason: `O endereço do link não termina em correios.com.br e o código sequer existe no aplicativo oficial de rastreamento.`,
        redFlags: ['Link com terminação estranha (.online, .site, .top)', 'Mensagem ameaçando devolver o pacote no mesmo dia', 'Código inexistente no app oficial'],
        explanation: 'Golpe da Falsa Taxa dos Correios. Os golpistas mandam mensagens de WhatsApp em massa torcendo para assustar pessoas que compram na internet.',
        realWorldTip: 'Recebeu mensagem sobre pacote? Nunca clique no link. Abra o app oficial dos Correios ou digite correios.com.br no Google.',
        pedagogy: {
          emotionalTrigger: 'Medo de Perder a Mercadoria Comprada',
          kidsAnalogy: 'É como receber uma cartinha anônima dizendo que vão jogar seu brinquedo fora se você não der dinheiro para um estranho.',
          parentsGuide: 'Ensine a todos em casa: taxa de encomenda só se paga entrando no Gov.br com a sua senha.',
          adultRemedy: 'Se digitou os dados do cartão no link, abra o app do banco na mesma hora e bloqueie o cartão!',
          goldenRule: 'Aviso de encomenda na mensagem? Acesse correios.com.br digitando direto no navegador!',
        },
        reinforcementDrill: {
          title: 'Treino de Olho: Links Suspeitos no WhatsApp',
          question: 'O que você deve fazer ao receber uma mensagem no WhatsApp dizendo que seu pacote vai ser devolvido se não pagar taxa agora?',
          context: 'Links no WhatsApp são a maior armadilha de roubo de cartão no Brasil.',
          options: [
            {
              id: 'drill-c-1',
              text: 'Ignorar o link da mensagem e consultar o pacote direto no app oficial dos Correios.',
              isCorrect: true,
              feedback: 'Exato! Acessar o canal oficial por conta própria é a melhor defesa.',
            },
            {
              id: 'drill-c-2',
              text: 'Clicar no link para ver se a página tem o logo azul e amarelo dos Correios.',
              isCorrect: false,
              feedback: 'Cuidado! Páginas falsas copiam a cara dos Correios perfeitamente.',
            },
            {
              id: 'drill-c-3',
              text: 'Pagar logo porque R$ 25 é pouquinho e não vale a pena perder o pacote.',
              isCorrect: false,
              feedback: 'Erro grave! Além de perder o dinheiro, você entrega os dados do seu cartão para criminosos.',
            },
          ],
        },
      };
    }

    // ==========================================
    // CENÁRIO 3: COMPRA LEGÍTIMA (NOTIFICAÇÃO DO APP)
    // ==========================================
    case 'compra_legitima': {
      const establishments = ['Drogaria São Paulo', 'Supermercado Pão de Açúcar', 'Posto Ipiranga', 'Padaria Bella Paulista'];
      const store = pick(establishments);
      const amount = pick(['R$ 28,50', 'R$ 45,90', 'R$ 62,00', 'R$ 89,30']);

      const clues: InvestigativeClue[] = [
        {
          id: `clue-${caseUid}-1`,
          name: 'Conferir o Extrato no App do seu Banco',
          buttonLabel: 'Abrir Extrato no App Bancário',
          category: 'system',
          question: 'Essa compra aparece no extrato oficial do seu aplicativo do banco?',
          inspection: {
            type: 'official',
            badge: 'Extrato do Aplicativo Bancário',
            field1Label: 'Como você confere na vida real',
            field1Value: 'Abre o app do seu banco com a digital e vai na aba Extrato',
            field2Label: 'O que está registrado no extrato',
            field2Value: `${amount} - ${store} (Débito por aproximação)`,
            field3Label: 'Horário da compra',
            field3Value: 'Há 1 minuto (exatamente quando você passou no caixa da loja)',
            observation: `O valor de ${amount} bate certinho com a compra que você acabou de fazer presencialmente em ${store}.`,
          },
          evidenceResult: {
            status: 'clean',
            headline: 'A compra bate com o que você acabou de pagar',
            details: 'O débito no extrato é a compra presencial que você mesmo fez.',
            fato: 'Aplicativos de banco avisam em tempo real quando você passa o cartão na maquininha.',
          },
        },
        {
          id: `clue-${caseUid}-2`,
          name: 'Ver se a Mensagem Pede Senha ou Tem Links',
          buttonLabel: 'Checar Texto do Aviso',
          category: 'system',
          question: 'O comunicado está te forçando a ligar para algum lugar ou pedindo sua senha?',
          inspection: {
            type: 'security',
            badge: 'Texto da Notificação',
            field1Label: 'Como você confere na vida real',
            field1Value: 'Lê a mensagem para ver se ela pede senha, Pix ou se tem link esquisito',
            field2Label: 'Links contidos na mensagem',
            field2Value: 'Nenhum link para clicar',
            field3Label: 'Pedido de senha ou transferência',
            field3Value: 'Nenhum pedido de senha ou dinheiro (apenas aviso)',
            observation: 'O banco não pede para clicar em links nem solicita que você faça transferências. É apenas um aviso de que seu cartão foi usado.',
          },
          evidenceResult: {
            status: 'clean',
            headline: 'Aviso normal de segurança sem pegadinhas',
            details: 'O comunicado não tenta te induzir a fornecer senhas nem transferir nada.',
            fato: 'Notificações reais de bancos apenas informam o que aconteceu e orientam bloquear pelo próprio app se você não reconhecer.',
          },
        },
        {
          id: `clue-${caseUid}-3`,
          name: 'De Onde Veio o Aviso (Canal Oficial)',
          buttonLabel: 'Verificar Como Chegou a Notificação',
          category: 'behavior',
          question: 'O aviso chegou pelo perfil oficial verificado do banco ou por um número desconhecido?',
          inspection: {
            type: 'behavior',
            badge: 'Canal do Smartphone',
            field1Label: 'Como você confere na vida real',
            field1Value: 'Olha se a notificação é do próprio ícone do app do banco instalado no seu celular',
            field2Label: 'Canal de envio',
            field2Value: 'Notificação do próprio app do banco instalado',
            field3Label: 'Orientação caso não reconheça',
            field3Value: 'Acessar o app oficial por conta própria e tocar em Bloquear Cartão',
            observation: 'A notificação veio de dentro do próprio aplicativo que você já tem no telefone, sem intermediários.',
          },
          evidenceResult: {
            status: 'clean',
            headline: 'Alerta emitido pelo app oficial',
            details: 'Não é um número aleatório nem ligação; é o perfil verificado do seu banco te avisando.',
            fato: 'Notificações de compras no app ajudam você a saber na hora se seu cartão for usado indevidamente.',
          },
        },
      ];

      const correctHypo = 'A notificação veio do próprio aplicativo do banco sobre a compra que você acabou de fazer na loja, sem links nem pedidos de senha.';
      const distractors = [
        'Toda notificação que apita no celular falando de dinheiro debitado é tentativa de golpe ou vírus no aparelho.',
        'Compras por aproximação na maquininha sem digitar senha foram proibidas por lei e são sempre anuladas.',
        'Se você receber aviso de compra no cartão, tem obrigação de ligar correndo para o número que vier na mensagem.',
      ];

      const { hypotheses, correctIndex } = shuffleHypotheses(correctHypo, distractors);

      return {
        id: caseUid,
        level: 'avancado',
        levelTitle: 'Cenário Prático • Notificação Real do Banco',
        xpReward: 80,
        category: 'Notificações Bancárias',
        title: `Notificação do Cartão: Compra em ${store}`,
        dilemma: `Você acabou de sair do caixa de ${store} e apitou no celular: "Compra aprovada de ${amount}". Você deve entrar em pânico?`,
        sender: 'Itaú Unibanco',
        channel: 'whatsapp',
        whatsapp: { number: '+55 11 4004-4828', pushName: 'Itaú Unibanco', business: 'verified' },
        time: `${randomInt(8, 20)}:${randomInt(10, 59)}`,
        preview: `Compra de ${amount} aprovada em ${store}...`,
        messageContent: `COMPRA APROVADA: Compra no valor de ${amount} realizada no seu Cartão de Débito em ${store}.\n\nSe você reconhece essa transação, nenhuma ação é necessária. Caso não reconheça, abra o aplicativo oficial e toque em Bloquear Cartão.`,
        clues,
        isScam: false,
        interactiveActions: [
          {
            id: 'act-legit-1',
            label: 'Abrir o extrato no app do banco e conferir com o cupom fiscal',
            actionType: 'investigation',
            playerMessage: `Olhando o extrato do cartão no app do banco para bater com o comprovante...`,
            replyMessage: `Extrato oficial: Débito de ${amount} efetuado em ${store} há 1 minuto pelo cartão de débito.`,
            evidenceDiscovered: {
              id: 'ev-legit-receipt',
              title: 'Compra Confirmada no seu Extrato',
              description: 'O débito no extrato é a compra presencial que você mesmo acabou de pagar no caixa.',
              status: 'clean',
              forensicFact: 'Sempre confira o extrato do seu próprio banco antes de achar que clonaram seu cartão.',
            },
          },
          {
            id: 'act-legit-2',
            label: 'Ver se a mensagem pede senhas ou tem links suspeitos',
            actionType: 'verification',
            playerMessage: `Lendo a mensagem com calma para ver se tem links estranhos ou pedidos de dados...`,
            replyMessage: `Aviso puramente informativo emitido pelo seu próprio app do banco, sem links externos nem pedidos de senha.`,
            evidenceDiscovered: {
              id: 'ev-no-external-links',
              title: 'Aviso Informativo Oficial',
              description: 'O banco não pede para clicar em links nem solicita que você faça transferências.',
              status: 'clean',
              forensicFact: 'Notificações reais do banco são informativas e não têm links externos de emergência.',
            },
          },
          {
            id: 'act-legit-3',
            label: 'Bloquear o cartão imediatamente no susto sem nem olhar o extrato',
            actionType: 'risk_decision',
            playerMessage: `Bloqueei meu cartão correndo no app achando que tinham me roubado!`,
            replyMessage: `App do banco: Cartão bloqueado preventivamente. Olhando o extrato com calma: era a sua própria compra de minutos atrás.`,
            evidenceDiscovered: {
              id: 'ev-panic-block',
              title: 'Mancada de Pânico: Bloqueou o Cartão por Impulso',
              description: 'Você bloqueou seu próprio cartão por susto antes de conferir que era a sua própria compra.',
              status: 'neutral',
              forensicFact: 'O pânico faz as pessoas tomarem decisões precipitadas. Sempre respire fundo e confira o extrato com calma.',
            },
          },
        ],
        evidenceHypotheses: hypotheses,
        correctEvidenceIndex: correctIndex,
        keyEvidenceReason: 'A notificação é do próprio app instalado informando a compra que você acabou de fazer na loja, sem links suspeitos nem pedidos de dados.',
        redFlags: [],
        explanation: 'Comunicação 100% LEGÍTIMA. Aplicativos modernos de banco apitam na hora avisando compras no cartão. O perigo real acontece quando golpistas mandam mensagem falsa dizendo que foi clonado para você ligar para eles.',
        realWorldTip: 'Mantenha as notificações ativas no app do banco: assim você sabe na hora qualquer coisa que passar no seu cartão.',
        pedagogy: {
          emotionalTrigger: 'Susto Financeiro sem Necessidade',
          kidsAnalogy: 'É como a luz da geladeira acendendo quando você abre a porta: ela só tá mostrando o que você acabou de fazer.',
          parentsGuide: 'Ensine a todos em casa: primeiro olha o extrato com calma antes de entrar em desespero.',
          adultRemedy: 'Se realmente não reconhecer a compra, use o botão "Bloquear Cartão" no próprio app.',
          goldenRule: 'Aviso no app oficial do banco sem link externo é proteção, não golpe!',
        },
        reinforcementDrill: {
          title: 'Treino de Calma: Alertas Reais vs Falsos',
          question: 'O que diferencia uma notificação real de compra do banco de uma mensagem de golpistas?',
          context: 'Golpistas tentam criar alarme para induzir ligações para falsas centrais.',
          options: [
            {
              id: 'drill-b-1',
              text: 'O banco real apenas avisa dentro do app e nunca coloca links ou números de telefone pedindo para cancelar.',
              isCorrect: true,
              feedback: 'Perfeito! O banco oficial nunca te manda clicar em links de emergência.',
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

    // ==========================================
    // CENÁRIO 4: FALSA CENTRAL TELEFÔNICA (CHAMADA DE WHATSAPP)
    // ==========================================
    default: {
      const fakeOfficer = pick(['Juliana Costa', 'Rodrigo Fagundes', 'Aline Siqueira']);
      const centralNumber = `+55 11 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;
      const bogusAmount = pick(['R$ 2.450,00', 'R$ 3.200,00', 'R$ 4.100,00']);
      const targetName = pick(['Marcos Vinicius', 'Lucas Albuquerque', 'Edson Pereira']);

      const clues: InvestigativeClue[] = [
        {
          id: `clue-${caseUid}-1`,
          name: 'A Regra de Ouro dos Bancos sobre Pix',
          buttonLabel: 'Ver Procedimento de Estorno de Bancos',
          category: 'behavior',
          question: 'Algum banco no Brasil pede para o cliente fazer Pix para "cancelar compra" ou "proteger conta"?',
          inspection: {
            type: 'security',
            badge: 'Regra Prática de Todos os Bancos',
            field1Label: 'O que o atendente na linha tá exigindo',
            field1Value: 'Fazer um Pix do seu saldo para uma "Conta Cofre / Chave de Segurança"',
            field2Label: 'Como o banco cancela fraudes de verdade',
            field2Value: 'O próprio sistema do banco bloqueia a transação internamente',
            field3Label: 'Regra de ouro que todo brasileiro deve saber',
            field3Value: 'BANCO NUNCA PEDE PIX PARA CANCELAR FRAUDE OU DEVOLVER DINHEIRO',
            observation: 'O atendente na ligação está mandando você transferir o seu próprio dinheiro para uma chave Pix para "cancelar a compra". Isso NUNCA existe em nenhum banco!',
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Banco NUNCA pede Pix para cancelar compra',
            details: 'Cancelamento de compras é feito internamente pelo sistema do banco, sem você mandar 1 centavo.',
            fato: 'Se alguém ligar mandando você transferir dinheiro para "proteger seu saldo", é 100% golpe.',
          },
        },
        {
          id: `clue-${caseUid}-2`,
          name: 'Olhar o Telefone Impresso no Verso do seu Cartão',
          buttonLabel: 'Conferir o SAC no Verso do Cartão Físico',
          category: 'phone',
          question: 'O que o atendimento real diz quando você desliga e liga no número que está no seu cartão?',
          inspection: {
            type: 'official',
            badge: 'SAC no Verso do seu Cartão Físico',
            field1Label: 'Como você confere na vida real',
            field1Value: 'Pega seu cartão físico na carteira, olha o telefone do SAC impresso no verso e liga',
            field2Label: 'O que a central oficial do banco informou',
            field2Value: `"O senhor pode ficar tranquilo: o banco nunca te ligou e não existe nenhuma transação de ${bogusAmount} pendente"`,
            field3Label: 'O número que te ligou no WhatsApp',
            field3Value: 'Um celular comum (+55 11 9...) sem selo de verificação, só com o nome "Central Antifraude" no perfil',
            observation: 'Você desligou, pegou o cartão físico e ligou no SAC: o banco confirmou que NUNCA te ligou e que a sua conta está totalmente segura!',
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'O SAC oficial do cartão confirmou que nunca te ligou',
            details: 'Qualquer pessoa coloca "Central Antifraude" como nome de perfil num celular comum.',
            fato: 'Banco não liga por chamada de WhatsApp de celular comum pedindo Pix. Quem liga para o banco é VOCÊ, no número do cartão.',
          },
        },
        {
          id: `clue-${caseUid}-3`,
          name: 'Nome do Favorecido da "Chave de Segurança"',
          buttonLabel: 'Ver no Nome de Quem Está a Chave Pix',
          category: 'pix',
          question: 'Se você colocasse a chave Pix no app, no nome de quem o dinheiro iria cair?',
          inspection: {
            type: 'pix',
            badge: 'Tela do Aplicativo do Banco',
            field1Label: 'O que o atendente mentiu',
            field1Value: 'Disse que a chave era da "Conta Garantidora do Banco Central"',
            field2Label: 'Nome real do titular que apareceu na tela',
            field2Value: `${targetName} (Conta de pessoa física comum)`,
            field3Label: 'Existe "conta cofre" ou "chave de segurança"?',
            field3Value: 'NÃO EXISTE. Isso é história inventada por criminosos.',
            observation: `A tal "conta de proteção" na verdade é a conta pessoal de um CPF qualquer (${targetName}). Se você mandasse o Pix, o golpista pegaria todo o seu dinheiro.`,
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'A conta de segurança é a conta de um bandido',
            details: `O dinheiro iria para a conta pessoal de ${targetName}.`,
            fato: 'Não existe "conta cofre", "conta garantidora" ou "estorno por Pix" no Banco Central.',
          },
        },
      ];

      const correctHypo = 'Nenhum banco pede para o cliente fazer Pix para cancelar compras, e a chamada veio de um celular comum sem verificação, só com o nome "Central Antifraude".';
      const distractors = [
        'A ligação é garantida como 100% verdadeira porque o perfil do WhatsApp se chama "Central Antifraude" e o atendente sabia o nome do banco.',
        'Se uma compra fraudulenta foi feita no seu cartão, a lei manda passar sua senha de 4 dígitos para o atendente bloquear.',
        'O procedimento de transferir saldo para a conta cofre do Banco Central é obrigatório para quem tem conta em banco digital.',
      ];

      const { hypotheses, correctIndex } = shuffleHypotheses(correctHypo, distractors);

      return {
        id: caseUid,
        level: 'avancado',
        levelTitle: 'Cenário Prático • Golpe da Falsa Central Bancária',
        xpReward: 110,
        category: 'Falsa Central Telefônica',
        title: `Ligação do "Suporte do Banco": Cancelar Fraude de ${bogusAmount}`,
        dilemma: `Um atendente liga dizendo ser do setor de segurança do seu banco. A chamada de WhatsApp vem de um celular com o nome "Central Antifraude", ele alerta sobre uma fraude de ${bogusAmount} e manda você transferir seu saldo para uma "Conta Cofre de Proteção".`,
        sender: centralNumber,
        channel: 'call',
        whatsapp: { number: centralNumber, pushName: 'Central Antifraude', business: 'unverified' },
        time: `${randomInt(14, 19)}:${randomInt(10, 59)}`,
        preview: `Chamada: Tentativa de transferencia suspeita de ${bogusAmount}...`,
        messageContent: `LIGAÇÃO TELEFÔNICA RECEBIDA:\n\nAtendente (${fakeOfficer}): "Identificamos uma tentativa de transferência Pix suspeita de ${bogusAmount} na sua conta. O senhor confirma essa operação?"\n\nVocê: "Não autorizei nada disso!"\n\nAtendente: "Perfeito, senhor. Para cancelar essa transação antes da compensação, o senhor precisa transferir seu saldo disponível agora para a Conta Cofre Provisória do Banco Central. Vou te passar a chave Pix de segurança..."`,
        clues,
        isScam: true,
        interactiveActions: [
          {
            id: 'act-call-1',
            label: 'Dizer: "Vou desligar e ligar no telefone de trás do meu cartão"',
            actionType: 'investigation',
            playerMessage: `Estou achando isso estranho. Vou desligar a chamada e ligar no número que está no verso do meu cartão físico.`,
            replyMessage: `Atendente (desesperado): "Senhor, não desligue de jeito nenhum! Se desligar a ligação o valor será debitado imediatamente e seu nome vai pro Serasa em 2 minutos!"`,
            evidenceDiscovered: {
              id: 'ev-urgent-threat',
              title: 'Desespero e Terror para Você Não Desligar',
              description: 'O golpista fez ameaças de prejuízo imediato porque sabe que, se você ligar no número do cartão, o golpe é descoberto.',
              status: 'suspicious',
              forensicFact: 'Bancos reais NUNCA te impedem de desligar a chamada e checar nos canais oficiais.',
            },
          },
          {
            id: 'act-call-2',
            label: 'Questionar: "Por que o banco me liga por WhatsApp de um celular comum?"',
            actionType: 'investigation',
            playerMessage: `Banco não liga por chamada de WhatsApp de um celular comum. Que número é esse?`,
            replyMessage: `Atendente (gaguejando): "É... nós somos da central especial de emergência integrada do sistema nacional..."`,
            evidenceDiscovered: {
              id: 'ev-bina-spoofing',
              title: 'Celular Comum se Passando por Central',
              description: 'O atendente gaguejou ao ser confrontado. Criminosos só trocam o nome do perfil para parecer uma central.',
              status: 'suspicious',
              forensicFact: 'Nunca confie no número que te liga; confie apenas no número que VOCÊ disca.',
            },
          },
          {
            id: 'act-call-3',
            label: 'Fazer o Pix correndo para a "Conta Cofre" para salvar o dinheiro',
            actionType: 'risk_decision',
            playerMessage: `Vou transferir os ${bogusAmount} para a conta cofre agora para não perder meu dinheiro!`,
            replyMessage: `Atendente: "Perfeito, senhor! Identificamos o crédito da garantia. Aguarde na linha..." (A ligação caiu e o dinheiro sumiu).`,
            evidenceDiscovered: {
              id: 'ev-risk-pix-sent',
              title: 'Mancada: Mandou seu Dinheiro para o Golpista',
              description: 'Você transferiu voluntariamente todo o seu saldo para a conta do estelionatário.',
              status: 'risk_taken',
              forensicFact: 'Nenhum banco pede Pix para proteger saldo. Quando você faz esse Pix, perde o dinheiro na hora.',
            },
          },
        ],
        evidenceHypotheses: hypotheses,
        correctEvidenceIndex: correctIndex,
        keyEvidenceReason: 'Nenhum banco pede Pix para cancelar compra ou proteger conta, e a chamada veio de um celular comum, sem selo de verificação.',
        redFlags: ['Ligação alarmante dizendo que a conta foi invadida', 'Pedido de Pix para "conta segura"', 'Atendente desesperado impedindo você de desligar'],
        explanation: 'Golpe da Falsa Central Telefônica. Os criminosos ligam pelo WhatsApp com o nome "Central Antifraude" no perfil, tocam terror psicológico e fazem a própria vítima esvaziar a conta.',
        realWorldTip: 'Desligue na hora! Se ficar com a pulga atrás da orelha, pegue o seu cartão físico e ligue para o número do SAC impresso no verso.',
        pedagogy: {
          emotionalTrigger: 'Terror de Ver a Conta Bancária Zerada',
          kidsAnalogy: 'É como alguém bater na sua porta dizendo que é bombeiro e mandar você jogar todos os seus brinquedos pela janela para não queimar.',
          parentsGuide: 'Ensine seus pais e avós: recebeu ligação do banco falando de dinheiro? DESLIGA NA CARA e liga no número do cartão.',
          adultRemedy: 'Se fez o Pix, abra o app do banco na mesma hora e acione o MED (Mecanismo Especial de Devolução).',
          goldenRule: 'O Banco NUNCA vai te ligar pedindo Pix para cancelar compras!',
        },
        reinforcementDrill: {
          title: 'Treino de Reação: A Ligação da Falsa Central',
          question: 'Alguém liga dizendo ser da segurança do seu banco e manda fazer Pix para proteger a conta. O que você faz?',
          context: 'Eles fazem terror e botam pressa para você nem ter tempo de pensar.',
          options: [
            {
              id: 'drill-fc-1',
              text: 'Desligar na cara imediatamente. Banco nunca pede Pix para proteger saldo.',
              isCorrect: true,
              feedback: 'Perfeito! Desligar e ligar no número do cartão é a conduta que anula 100% do golpe.',
            },
            {
              id: 'drill-fc-2',
              text: 'Fazer o Pix correndo para não perder o dinheiro e depois pedir estorno.',
              isCorrect: false,
              feedback: 'Caiu no golpe! É exatamente nesse Pix voluntário que os estelionatários levam o seu saldo.',
            },
            {
              id: 'drill-fc-3',
              text: 'Passar a senha de 4 dígitos para o atendente bloquear o cartão.',
              isCorrect: false,
              feedback: 'Perigo extremo! Nunca se informa senhas ou códigos bancários por telefone.',
            },
          ],
        },
      };
    }
  }
}
