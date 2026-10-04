import type { ScamCase, InvestigativeClue } from './scamsData';

// funcoes utilitarias
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

// embaralha alternativas garantindo resposta correta variada
function shuffleHypotheses(correct: string, distractors: string[]): { hypotheses: string[]; correctIndex: number } {
  const all = [correct, ...distractors];
  // Fisher-Yates
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
  // Ajusta a probabilidade com base na sequencia: alterna entre golpes e casos legitimos para testar a atencao
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
      const amount = pick(['R$ 420,00', 'R$ 540,00', 'R$ 680,00', 'R$ 790,00']);
      const reasons = [
        'meu carro furou o pneu voltando da faculdade e o borracheiro só aceita Pix imediato',
        'preciso pagar a taxa urgente de rematrícula até as 16h e meu app do banco bloqueou o aparelho novo',
        'estou na farmácia comprando um remédio urgente e meu cartão deu chip não lido',
      ];
      const reason = pick(reasons);
      const strangeDDD = pick(['85', '98', '62', '71', '81', '91']);
      const orangeName = pick(['Valter dos Santos', 'Cleiton Mendes', 'Renata Albuquerque', 'Marcio Souza']);
      const phoneNum = `+55 (${strangeDDD}) 9${randomInt(8100, 9999)}-${randomInt(1000, 9999)}`;
      const pixKey = `${randomInt(100, 999)}.${randomInt(100, 999)}.${randomInt(100, 999)}-${randomInt(10, 99)}`;

      const clues: InvestigativeClue[] = [
        {
          id: `clue-${caseUid}-1`,
          name: 'Registro da Linha Telefônica',
          buttonLabel: 'Consultar Prefixo & Cadastro de Linha',
          category: 'phone',
          question: 'De qual região é esse prefixo telefônico e há quanto tempo a linha foi ativada?',
          inspection: {
            type: 'contact',
            badge: 'Registro de Linha Telefônica',
            field1Label: 'Número Remetente',
            field1Value: phoneNum,
            field2Label: 'Prefixo Regional (DDD)',
            field2Value: `DDD ${strangeDDD} (Nordeste / Centro-Oeste)`,
            field3Label: 'Histórico de Ativação do Chip',
            field3Value: 'Ativado há 1 dia (Plano Pré-Pago Descartável)',
            observation: `O número utiliza o DDD ${strangeDDD} e foi registrado ontem. A família reside em região com DDD 11 (São Paulo).`,
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'DDD incompatível e linha pré-paga recém-ativada',
            details: `A linha telefônica foi cadastrada ontem sob o DDD ${strangeDDD}, divergindo do histórico familiar.`,
            fato: 'Criminosos compram chips pré-pagos descartáveis de outros estados para aplicar golpes de falsa identidade.',
          },
        },
        {
          id: `clue-${caseUid}-2`,
          name: 'Consulta ao DICT do Banco Central',
          buttonLabel: 'Raio-X do Titular da Chave Pix',
          category: 'pix',
          question: 'Quem é o titular registrado no Banco Central para receber os fundos?',
          inspection: {
            type: 'pix',
            badge: 'Consulta DICT (Banco Central)',
            field1Label: 'Chave Pix Informada',
            field1Value: pixKey,
            field2Label: 'Titular Registrado no Bacen',
            field2Value: orangeName,
            field3Label: 'Instituição de Pagamento',
            field3Value: 'Instituição de Pagamento Digital (Fintech)',
            observation: `A chave informada está registrada sob o nome de "${orangeName}", pessoa física sem parentesco ou vínculo com a família.`,
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Conta de destino em nome de terceiro desconhecido',
            details: `O valor do Pix seria creditado em favor de ${orangeName}, e não de ${relative}.`,
            fato: 'Golpistas utilizam contas bancárias de "laranjas" para receber valores e pulverizar imediatamente o saldo.',
          },
        },
        {
          id: `clue-${caseUid}-3`,
          name: 'Canal de Comunicação & Áudio',
          buttonLabel: 'Checar Aceitação de Chamada de Voz',
          category: 'behavior',
          question: 'O remetente aceita comunicação por voz ou chamada em tempo real?',
          inspection: {
            type: 'security',
            badge: 'Verificação Telefônica Direta',
            field1Label: 'Chamada de Voz Realizada',
            field1Value: 'Chamada rejeitada imediatamente no primeiro toque',
            field2Label: 'Resposta no Chat',
            field2Value: '"Tô sem áudio e com pressa, manda só texto por favor"',
            field3Label: 'Canal Aceito pelo Contato',
            field3Value: 'Exclusivamente mensagens de texto',
            observation: 'O remetente recusa ligações de voz e solicita que todo o contato ocorra unicamente por mensagens de texto.',
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Recusa deliberada de confirmação por voz',
            details: 'O interlocutor esquiva-se de qualquer verificação por voz que revelaria que não é o familiar.',
            fato: 'Telefonar para o número antigo do parente ou exigir conversa por voz ao vivo desarticula o golpe em segundos.',
          },
        },
      ];

      const correctHypo = `O titular registrado da chave Pix no Banco Central é uma pessoa física sem parentesco (${orangeName}), combinado com a recusa sistemática de validação por voz.`;
      const distractors = [
        'A mensagem é uma fraude porque o aviso de "criptografia de ponta-a-ponta" do WhatsApp indica que a conversa foi interceptada na rede móvel.',
        'A transferência é inválida porque o sistema Pix proíbe repasses de qualquer quantia para contas abertas em bancos digitais ou fintechs.',
        'O pedido é suspeito porque o regulamento do Banco Central exige que pedidos de dinheiro entre familiares tenham autorização prévia por e-mail.',
      ];

      const { hypotheses, correctIndex } = shuffleHypotheses(correctHypo, distractors);

      return {
        id: caseUid,
        level: 'medio',
        levelTitle: 'Cenário Dinâmico • Engenharia Social',
        xpReward: 90,
        category: 'WhatsApp & Família',
        title: `Pedido de Pix Urgente via Número Novo (${relative})`,
        dilemma: `Um contato desconhecido usando a foto de ${relative} afirma que o celular quebrou e solicita um Pix urgente de ${amount} para cobrir um imprevisto.`,
        sender: `${relative} (Número Não Salvo)`,
        channel: 'whatsapp',
        time: `${randomInt(10, 18)}:${randomInt(10, 59)}`,
        preview: `Oi! Anota meu número novo aí... Meu celular antigo quebrou...`,
        messageContent: `Oi! Por favor salva meu número provisório na sua agenda. O meu celular antigo caiu no chão e parou de funcionar.\n\nPreciso te pedir um favorzinho urgente: ${reason}. Consegue me mandar um Pix de ${amount} agora? Prometo que te devolvo assim que chegar em casa!\n\nChave Pix: ${pixKey}`,
        clues,
        isScam: true,
        interactiveActions: [
          {
            id: 'act-wa-1',
            label: 'Exigir áudio de 5 segundos falando seu nome para ouvir a voz',
            actionType: 'investigation',
            playerMessage: `Filho(a), manda um áudio de 5 segundos falando meu nome agora antes de qualquer Pix.`,
            replyMessage: `Mãe, meu microfone queimou quando o celular caiu! Não dá pra mandar áudio agora, para de desconfiar de mim e me ajuda!`,
            evidenceDiscovered: {
              id: 'ev-audio-refusal',
              title: 'Recusa de Verificação por Voz',
              description: 'O contato esquiva-se de qualquer confirmação vocal e apela para pressão emocional para induzir a transferência.',
              status: 'suspicious',
              forensicFact: 'Golpistas não conseguem simular voz real em chamada direta e inventam que o microfone está quebrado.',
            },
          },
          {
            id: 'act-wa-2',
            label: 'Fazer pergunta pessoal secreta de família (Ex: nome do pet)',
            actionType: 'investigation',
            playerMessage: `Qual é o nome do vira-lata que a gente adotou no sítio ano passado?`,
            replyMessage: `Ai que pergunta boba agora?! Tô no meio da rua desesperado e você fazendo joguinho?! Me manda o Pix logo!`,
            evidenceDiscovered: {
              id: 'ev-secret-question',
              title: 'Falha em Validação Pessoal Familiar',
              description: 'O contato desconhece fatos básicos do cotidiano familiar e reage com irritação e pressa.',
              status: 'suspicious',
              forensicFact: 'Perguntas pessoais sobre detalhes íntimos da rotina são infalíveis contra criminosos usando fotos públicas.',
            },
          },
          {
            id: 'act-wa-3',
            label: 'Transferir R$ 50 de sinal para ajudar rápido sem conferir',
            actionType: 'risk_decision',
            playerMessage: `Tô te mandando R$ 50 de sinal agora no Pix informado pra te adiantar enquanto resolvo o resto!`,
            replyMessage: `Obrigado!! O Pix caiu aqui, mas a pessoa tá exigindo o restante (${amount}) em 5 minutos ou cancela tudo, manda rápido!!`,
            evidenceDiscovered: {
              id: 'ev-risk-transfer',
              title: 'Conduta de Risco: Pagamento Precipitado',
              description: 'Você enviou dinheiro sem validação prévia. O interlocutor imediatamente intensificou a pressão por valores adicionais.',
              status: 'risk_taken',
              forensicFact: 'Pagar qualquer valor como teste transfere dinheiro real para contas de laranjas criminosos.',
            },
          },
        ],
        evidenceHypotheses: hypotheses,
        correctEvidenceIndex: correctIndex,
        keyEvidenceReason: `O titular da chave Pix informada é uma pessoa física estranha (${orangeName}) e o prefixo DDD ${strangeDDD} é inconsistente com a residência familiar.`,
        redFlags: ['Número novo não salvo', 'Urgência financeira imediata', 'Conta Pix em nome de terceiro desconhecido', 'Recusa de chamada de voz'],
        explanation: 'Golpe do Novo Número / Perfil Clonado. Criminosos obtêm fotos públicas de redes sociais e números de familiares em vazamentos para induzir transferências imediatas sob o pretexto de emergência.',
        realWorldTip: 'Nunca transfira dinheiro para parentes com número novo sem antes telefonar no número antigo tradicional ou confirmar por chamada de vídeo.',
        pedagogy: {
          emotionalTrigger: 'Urgência Afetiva Familiar',
          kidsAnalogy: 'É como alguém colocar uma máscara de papel com a foto do seu parente e bater na sua porta pedindo a mesada.',
          parentsGuide: 'Combine com seus filhos uma palavra-chave secreta que só a família conhece para casos de emergência real.',
          adultRemedy: 'Se realizou a transferência, contate imediatamente o seu banco e solicite a abertura de MED (Mecanismo Especial de Devolução).',
          goldenRule: 'Parente pediu Pix no número novo? Ligue no número antigo e escute a voz real!',
        },
        reinforcementDrill: {
          title: 'Treino de Olho: O Contato com Celular Quebrado',
          question: `Se alguém te manda mensagem dizendo ser ${relative} com número novo pedindo Pix, qual atitude garante 100% de segurança?`,
          context: 'O medo de ver o parente em apuros causa respostas precipitadas na vida real.',
          options: [
            {
              id: 'dyn-1',
              text: 'Ligar no número tradicional antigo ou exigir conversa ao vivo para ouvir a voz real.',
              isCorrect: true,
              feedback: 'Correto! A voz viva no canal habitual desmascara o estelionatário em menos de 5 segundos.',
            },
            {
              id: 'dyn-2',
              text: 'Fazer um Pix simbólico de R$ 10 para ver se o nome do parente aparece no comprovante.',
              isCorrect: false,
              feedback: 'Perigoso! Golpistas usam contas de intermediários (laranjas) e você confirma que seu número está ativo.',
            },
            {
              id: 'dyn-3',
              text: 'Pedir que o contato envie uma foto da identidade pelo próprio chat novo.',
              isCorrect: false,
              feedback: 'Ineficaz! Criminosos compram fotos de documentos vazados na internet para enviar pelo WhatsApp.',
            },
          ],
        },
      };
    }

    // ==========================================
    // CENÁRIO 2: SMS DOS CORREIOS (TAXA ADUANEIRA)
    // ==========================================
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
          name: 'Whois & DNS do Domínio Web',
          buttonLabel: 'Inspecionar Registro do Domínio no Whois',
          category: 'whois',
          question: 'Onde e quando esse endereço da internet foi registrado e sob qual autoridade?',
          inspection: {
            type: 'link',
            badge: 'Registro Whois Internacional',
            field1Label: 'Endereço Web Consultado',
            field1Value: `https://${fakeDomain}/taxas`,
            field2Label: 'Data de Criação do Domínio',
            field2Value: 'Registrado há 2 dias',
            field3Label: 'Servidor & País de Hospedagem',
            field3Value: `IP em servidor estrangeiro (${ipCountry})`,
            observation: `O domínio termina na extensão ".${fakeDomain.split('.').pop()}" e foi criado há 48 horas no exterior. O portal oficial dos Correios opera exclusivamente sob "correios.com.br".`,
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Domínio descartável registrado no exterior',
            details: `O site indicado no SMS foi criado há apenas 2 dias fora do Brasil.`,
            fato: 'Empresas públicas e órgãos federais utilizam estritamente o sufixo oficial .com.br ou .gov.br.',
          },
        },
        {
          id: `clue-${caseUid}-2`,
          name: 'Base Nacional de Rastreamento',
          buttonLabel: 'Consultar Código no Sistema dos Correios',
          category: 'system',
          question: 'Esse código de pacote existe na base de dados nacional de encomendas?',
          inspection: {
            type: 'official',
            badge: 'Banco de Dados dos Correios',
            field1Label: 'Código Informado no SMS',
            field1Value: code,
            field2Label: 'Status no Banco Nacional',
            field2Value: 'Objeto não localizado na base dos Correios',
            field3Label: 'Ambiente Homologado de Tributos',
            field3Value: 'Portal "Minhas Importações" via Gov.br',
            observation: `A consulta oficial retorna objeto inexistente. Tributos aduaneiros legais são pagos exclusivamente pelo portal Gov.br.`,
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Código de encomenda forjado e inexistente',
            details: 'A busca no sistema oficial dos Correios não encontra nenhum pacote com esse código.',
            fato: 'Criminosos geram códigos aleatórios torcendo para que a vítima tenha feito compras online recentemente.',
          },
        },
        {
          id: `clue-${caseUid}-3`,
          name: 'Origem da Mensagem Telefônica',
          buttonLabel: 'Auditar Linha Remetente do SMS',
          category: 'phone',
          question: 'O SMS partiu de um código homologado (shortcode) ou celular comum?',
          inspection: {
            type: 'contact',
            badge: 'Telefonia & Roteamento SMS',
            field1Label: 'Número Remetente do SMS',
            field1Value: `+55 (11) 9${randomInt(7000, 9999)}-${randomInt(1000, 9999)}`,
            field2Label: 'Padrão Regulamentar Institucional',
            field2Value: 'Shortcode de 5 a 6 dígitos (ex: 28588)',
            field3Label: 'Categoria da Linha Emissora',
            field3Value: 'Linha Celular Móvel Pessoal (Pré-Pago)',
            observation: 'O SMS foi enviado por um número de celular comum de 9 dígitos, violando as normas de mensageria corporativa da Anatel.',
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Envio por linha celular comum em vez de shortcode',
            details: 'Instituições homologadas utilizam números curtos de 5 dígitos (shortcodes) auditados pela Anatel.',
            fato: 'Linhas celulares comuns são empregadas em disparos ilegais de smishing para burlar bloqueios de operadoras.',
          },
        },
      ];

      const correctHypo = `O link conduz a um domínio descartável não oficial (${fakeDomain}) e o código ${code} não existe no rastreamento oficial dos Correios.`;
      const distractors = [
        'O site é garantidamente seguro e oficial porque exibe o ícone de cadeado e opera sob protocolo criptográfico HTTPS com certificado SSL válido.',
        'A mensagem é fraudulenta porque encomendas internacionais abaixo de R$ 500 possuem isenção constitucional contra qualquer taxa postal.',
        'O SMS deve ser rejeitado porque os Correios são proibidos de notificar destinatários por canais digitais sem intimação postal física prévia.',
      ];

      const { hypotheses, correctIndex } = shuffleHypotheses(correctHypo, distractors);

      return {
        id: caseUid,
        level: 'basico',
        levelTitle: 'Cenário Dinâmico • Smishing & Phishing',
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
            label: 'Consultar o código no portal oficial correios.com.br',
            actionType: 'investigation',
            playerMessage: `Abrindo o portal oficial correios.com.br e consultando o código ${code}...`,
            replyMessage: `Resultado oficial dos Correios: "Código de rastreamento não encontrado na base de dados nacional."`,
            evidenceDiscovered: {
              id: 'ev-invalid-code',
              title: 'Código Forjado Inexistente',
              description: 'O código é uma sequência aleatória criada por estelionatários para induzir vítimas de compras online ao erro.',
              status: 'suspicious',
              forensicFact: 'Se o código não existe na base oficial correios.com.br, a notificação é 100% falsa.',
            },
          },
          {
            id: 'act-sms-2',
            label: 'Auditar o domínio no simulador de navegador seguro',
            actionType: 'investigation',
            playerMessage: `Inspecionando os registros DNS do endereço https://${fakeDomain}/taxas...`,
            replyMessage: `Navegador seguro: O domínio termina em ".${fakeDomain.split('.').pop()}", registrado recentemente e não pertencente aos Correios.`,
            evidenceDiscovered: {
              id: 'ev-fake-domain',
              title: 'Domínio Descartável Fora do Padrão Oficial',
              description: 'Sites governamentais e de empresas públicas utilizam rigorosamente a terminação .gov.br ou .com.br.',
              status: 'suspicious',
              forensicFact: 'Qualquer site de encomenda com terminação .site, .online, .top ou .shop é tentativa de golpe.',
            },
          },
          {
            id: 'act-sms-3',
            label: 'Acessar o link do SMS e pagar os R$ 24,90 para liberar logo',
            actionType: 'risk_decision',
            playerMessage: `Clicando no link do SMS e preenchendo os dados do cartão para liberar a encomenda...`,
            replyMessage: `Simulador de risco: Tela clonada dos Correios captura dados do cartão de crédito, código de segurança e CPF.`,
            evidenceDiscovered: {
              id: 'ev-risk-phishing',
              title: 'Conduta de Risco: Exposição a Phishing',
              description: 'Você inseriu dados em uma página clonada. Na vida real, seus dados de cartão seriam clonados imediatamente.',
              status: 'risk_taken',
              forensicFact: 'Nunca clique em links enviados por SMS sobre encomendas; digite o portal oficial no navegador.',
            },
          },
        ],
        evidenceHypotheses: hypotheses,
        correctEvidenceIndex: correctIndex,
        keyEvidenceReason: `O domínio indicado no SMS (${fakeDomain}) não pertence aos Correios e o código sequer existe no sistema oficial de rastreamento.`,
        redFlags: ['Link com terminação não oficial (.online, .site, .top)', 'SMS emitido por número celular comum de 9 dígitos', 'Ameaça de devolução imediata no mesmo dia'],
        explanation: 'Golpe de Smishing (Phishing via SMS). Criminosos realizam disparos em massa automáticos simulando mensagens de rastreamento com páginas de pagamento clonadas.',
        realWorldTip: 'Nunca clique em links de SMS sobre encomendas. Abra o navegador por conta própria, digite correios.com.br e consulte seu pacote lá.',
        pedagogy: {
          emotionalTrigger: 'Medo de Perder a Encomenda',
          kidsAnalogy: 'É como receber um bilhete anônimo dizendo que seu brinquedo vai ser jogado fora se você não der dinheiro para um estranho.',
          parentsGuide: 'Ensine que taxas de importação reais só são pagas logando com Gov.br no portal "Minhas Importações".',
          adultRemedy: 'Se digitou dados do cartão, ligue imediatamente para o banco e solicite o cancelamento do cartão e emissão de nova via.',
          goldenRule: 'Aviso de encomenda no SMS? Acesse correios.com.br digitando direto no navegador!',
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
              text: 'Clicar no link para conferir se exibe o logotipo oficial amarelo e azul dos Correios.',
              isCorrect: false,
              feedback: 'Cuidado! Páginas falsas copiam 100% da identidade visual de órgãos públicos em poucos minutos.',
            },
            {
              id: 'drill-c-3',
              text: 'Pagar a taxa pelo link do SMS porque o valor é baixo e evita que o pacote volte.',
              isCorrect: false,
              feedback: 'Erro grave! Além de perder o dinheiro, você entrega seus dados bancários aos criminosos.',
            },
          ],
        },
      };
    }

    // ==========================================
    // CENÁRIO 3: COMPRA LEGÍTIMA (ALERTA NATIVO)
    // ==========================================
    case 'compra_legitima': {
      const establishments = ['Drogaria São Paulo', 'Supermercado Pão de Açúcar', 'Posto Ipiranga', 'Padaria Bella Paulista'];
      const store = pick(establishments);
      const amount = pick(['R$ 28,50', 'R$ 45,90', 'R$ 62,00', 'R$ 89,30']);

      const clues: InvestigativeClue[] = [
        {
          id: `clue-${caseUid}-1`,
          name: 'Origem da Notificação no Aparelho',
          buttonLabel: 'Verificar Canal do Comunicado',
          category: 'system',
          question: 'Como a notificação chegou ao aparelho e qual é o seu formato?',
          inspection: {
            type: 'official',
            badge: 'Sistema Operacional & App Bancário',
            field1Label: 'Canal de Emissão',
            field1Value: 'Notificação Push nativa do aplicativo do banco instalado',
            field2Label: 'Links Externos Contidos',
            field2Value: 'Inexistente (mensagem puramente informativa)',
            field3Label: 'Exigência de Senhas ou Ações',
            field3Value: 'Nenhuma ação exigida (apenas comunicado de débito)',
            observation: 'A notificação foi emitida pelo próprio aplicativo bancário instalado no aparelho, sem links para páginas externas ou números para ligar.',
          },
          evidenceResult: {
            status: 'clean',
            headline: 'Notificação push nativa e informativa',
            details: 'O aviso não solicita senhas, dados de segurança nem transferências adicionais.',
            fato: 'Notificações push nativas configuram mecanismos de segurança e auditoria transparente para o correntista.',
          },
        },
        {
          id: `clue-${caseUid}-2`,
          name: 'Auditoria de Solicitações do Comunicado',
          buttonLabel: 'Inspecionar Exigências da Mensagem',
          category: 'behavior',
          question: 'O aviso exige senhas, códigos de validação ou transferências de saldo?',
          inspection: {
            type: 'security',
            badge: 'Auditoria de Mensagem',
            field1Label: 'Solicitação de Senha / PIN',
            field1Value: 'Não solicitada',
            field2Label: 'Exigência de Pix ou Pagamento',
            field2Value: 'Não exigida',
            field3Label: 'Ação Recomendada pelo App',
            field3Value: 'Verificar o extrato no app apenas se não reconhecer a transação',
            observation: 'O comunicado não induz o usuário a realizar transferências nem solicita informações confidenciais.',
          },
          evidenceResult: {
            status: 'clean',
            headline: 'Comunicação oficial legítima sem indução fraudulenta',
            details: 'Não há indução a links, chamadas telefônicas ou fornecimento de senhas.',
            fato: 'Alertas reais de bancos nunca enviam links externos para cancelar compras.',
          },
        },
        {
          id: `clue-${caseUid}-3`,
          name: 'Conferência no Extrato Oficial',
          buttonLabel: 'Consultar Extrato da Conta no Aplicativo',
          category: 'pix',
          question: 'O lançamento consta no extrato bancário oficial do titular?',
          inspection: {
            type: 'official',
            badge: 'Histórico Financeiro do Cartão',
            field1Label: 'Lançamento Registrado no Extrato',
            field1Value: `${amount} - ${store}`,
            field2Label: 'Horário do Registro',
            field2Value: 'Há 1 minuto',
            field3Label: 'Método de Pagamento Utilizado',
            field3Value: 'Cartão de Débito Físico por Aproximação (Contactless)',
            observation: `O débito no extrato coincide perfeitamente com a compra presencial recente realizada pelo usuário em ${store}.`,
          },
          evidenceResult: {
            status: 'clean',
            headline: 'Compra presencial recente confirmada no extrato',
            details: 'O valor e o estabelecimento correspondem à despesa recém-efetuada pelo usuário.',
            fato: 'Muitos usuários confundem notificações rotineiras de aproximação com tentativas de fraude por falta de atenção ao extrato.',
          },
        },
      ];

      const correctHypo = 'A notificação é um aviso nativo do app bancário sobre compra presencial recente, sem links externos nem exigência de senhas ou transferências.';
      const distractors = [
        'A notificação é uma tentativa de golpe porque transações financeiras por aproximação (contactless) sem digitação de senha são proibidas no Brasil.',
        'O aviso representa um vírus no sistema operacional, pois instituições financeiras são proibidas de emitir notificações fora da rede Wi-Fi residencial.',
        'O alerta é suspeito porque compras legítimas exigem que o banco envie previamente um SMS com código de confirmação biométrica.',
      ];

      const { hypotheses, correctIndex } = shuffleHypotheses(correctHypo, distractors);

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
            label: 'Abrir o extrato no app do banco e auditar os lançamentos',
            actionType: 'investigation',
            playerMessage: `Consultando o extrato detalhado da conta corrente no app oficial...`,
            replyMessage: `Extrato oficial: Débito de ${amount} efetuado em ${store} há 1 minuto via aproximação do cartão físico.`,
            evidenceDiscovered: {
              id: 'ev-legit-receipt',
              title: 'Transação Confirmada no Extrato Oficial',
              description: 'O débito no extrato oficial reflete a compra presencial que você mesmo acabou de realizar no estabelecimento.',
              status: 'clean',
              forensicFact: 'Sempre confira o extrato do seu aplicativo bancário antes de suspeitar de cobranças duplicadas.',
            },
          },
          {
            id: 'act-legit-2',
            label: 'Inspecionar a estrutura do alerta (links, pedidos de dados)',
            actionType: 'verification',
            playerMessage: `Analisando a mensagem em busca de links ou solicitações suspeitas...`,
            replyMessage: `Auditoria: Comunicado puramente informativo emitido pelo sistema operacional, sem nenhum link ou exigência de senhas.`,
            evidenceDiscovered: {
              id: 'ev-no-external-links',
              title: 'Comunicação Oficial Informativa',
              description: 'O banco não pede para clicar em links nem solicita transferências ou senhas.',
              status: 'clean',
              forensicFact: 'Notificações push informativas sem links externos são mecanismos de segurança e transparência.',
            },
          },
          {
            id: 'act-legit-3',
            label: 'Bloquear o cartão imediatamente no app por desconfiança',
            actionType: 'risk_decision',
            playerMessage: `Toquei em bloquear o cartão na hora achando que fui clonado!`,
            replyMessage: `App bancário: Cartão bloqueado preventivamente. Verificando extrato: a compra foi presencial na loja onde você estava.`,
            evidenceDiscovered: {
              id: 'ev-panic-block',
              title: 'Conduta de Pânico: Bloqueio Precipitado',
              description: 'Você bloqueou seu cartão por impulso antes de verificar que o lançamento era a sua própria despesa de minutos atrás.',
              status: 'neutral',
              forensicFact: 'O pânico leva à tomada de decisões precipitadas; sempre verifique o extrato com calma.',
            },
          },
        ],
        evidenceHypotheses: hypotheses,
        correctEvidenceIndex: correctIndex,
        keyEvidenceReason: 'Trata-se de uma notificação legítima do próprio aplicativo bancário informando compra presencial recente, sem links externos nem pedidos de senhas.',
        redFlags: [],
        explanation: 'Comunicação 100% LEGÍTIMA. Aplicativos modernos notificam compras em tempo real. O perigo real ocorre quando golpistas mandam SMS com links falsos fingindo ser essa notificação.',
        realWorldTip: 'Mantenha as notificações ativas no app do banco para saber na hora se seu cartão for clonado.',
        pedagogy: {
          emotionalTrigger: 'Vigilância Financeira sem Pânico',
          kidsAnalogy: 'É como a luz da geladeira acendendo quando você abre a porta: ela avisa o que acabou de acontecer.',
          parentsGuide: 'Ensine seus filhos a sempre conferirem o extrato do aplicativo após usar o cartão para evitar sobressaltos.',
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

    // ==========================================
    // CENÁRIO 4: FALSA CENTRAL TELEFÔNICA (LIGAÇÃO 0800)
    // ==========================================
    default: {
      const fakeOfficer = pick(['Juliana Costa', 'Rodrigo Fagundes', 'Aline Siqueira']);
      const bogusAmount = pick(['R$ 2.450,00', 'R$ 3.200,00', 'R$ 4.100,00']);
      const targetName = pick(['Marcos Vinicius', 'Lucas Albuquerque', 'Edson Pereira']);

      const clues: InvestigativeClue[] = [
        {
          id: `clue-${caseUid}-1`,
          name: 'Procedimento Exigido pelo Atendente',
          buttonLabel: 'Analisar Procedimento Exigido na Chamada',
          category: 'behavior',
          question: 'Bancos exigem transferências de clientes para "proteger saldo" ou cancelar fraudes?',
          inspection: {
            type: 'security',
            badge: 'Normativa do Banco Central',
            field1Label: 'Procedimento Exigido na Ligação',
            field1Value: 'Transferência Pix para "Conta Cofre / Chave Provisória"',
            field2Label: 'Protocolo Regulamentar em Fraudes',
            field2Value: 'Bloqueio administrativo interno pelo sistema da instituição',
            field3Label: 'Resolução Bacen nº 1/2020',
            field3Value: 'Expressamente vedada a solicitação de repasse de saldo de clientes para estorno',
            observation: 'O atendente exige transferência de saldo pelo próprio cliente, procedimento categoricamente proibido pelas regras do Banco Central.',
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Banco NUNCA pede Pix para cancelar compras ou proteger conta',
            details: 'Transações fraudulentas são bloqueadas internamente pelo sistema antifraude do banco.',
            fato: 'A solicitação de Pix para "conta segura", "conta cofre" ou "estorno" é a assinatura do Golpe da Falsa Central.',
          },
        },
        {
          id: `clue-${caseUid}-2`,
          name: 'Identificação no Visor (BINA) & Telefonia',
          buttonLabel: 'Checar Sentido da Chamada & Prefixo 0800',
          category: 'phone',
          question: 'O número 0800 na tela do celular garante a autenticidade da ligação?',
          inspection: {
            type: 'official',
            badge: 'Regulamentação Anatel de Linhas 0800',
            field1Label: 'Identificação no Visor do Telefone',
            field1Value: '0800 729 0001 (Número Oficial do Banco)',
            field2Label: 'Sentido da Chamada Telefônica',
            field2Value: 'Chamada Recebida (Ativa)',
            field3Label: 'Regulamentação Anatel para Linhas 0800',
            field3Value: 'Canais exclusivos para recebimento gratuito (não realizam chamadas ativas)',
            observation: 'Linhas 0800 servem exclusivamente para o cliente ligar para a empresa. Golpistas utilizam tecnologia VoIP com spoofing de BINA para forjar o número que aparece na tela.',
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Identificador no visor fraudado via Spoofing de BINA',
            details: 'Criminosos utilizam internet (VoIP) para falsificar o número que aparece no visor da vítima.',
            fato: '0800 de banco serve para VOCÊ ligar para eles, nunca para eles realizarem ligações ativas para clientes.',
          },
        },
        {
          id: `clue-${caseUid}-3`,
          name: 'Titular Registrado da Chave de Segurança',
          buttonLabel: 'Consultar Favorecido da Chave no Bacen',
          category: 'pix',
          question: 'Quem receberá os fundos se a transferência for realizada?',
          inspection: {
            type: 'pix',
            badge: 'Consulta DICT (Banco Central)',
            field1Label: 'Chave Informada na Ligação',
            field1Value: 'seguranca.bcb@banco-digital.com',
            field2Label: 'Titular Registrado no Bacen',
            field2Value: targetName,
            field3Label: 'Natureza da Titularidade',
            field3Value: 'Pessoa Física - Banco Digital S.A.',
            observation: `A suposta "chave de segurança do Banco Central" pertence à conta de pessoa física individual de "${targetName}".`,
          },
          evidenceResult: {
            status: 'suspicious',
            headline: 'Conta de destino pertence a um terceiro (laranja)',
            details: `A conta bancária de destino pertence a um indivíduo chamado ${targetName}.`,
            fato: 'Não existe "conta cofre", "conta garantidora" ou "chave de segurança" no sistema financeiro nacional.',
          },
        },
      ];

      const correctHypo = 'Bancos nunca solicitam que clientes façam transferências Pix para "contas de segurança", e números 0800 não realizam chamadas ativas (spoofing de BINA).';
      const distractors = [
        'A chamada é garantida como 100% autêntica porque o identificador no visor do celular confirmou o mesmo número 0800 que consta atrás do cartão.',
        'A ligação é fraudulenta porque centrais de atendimento ao cliente são proibidas por lei de ligar fora do horário de expediente bancário (10h às 16h).',
        'O procedimento é inválido porque chamadas de segurança precisam obrigatoriamente ser confirmadas por chamada de vídeo com dois gerentes.',
      ];

      const { hypotheses, correctIndex } = shuffleHypotheses(correctHypo, distractors);

      return {
        id: caseUid,
        level: 'medio',
        levelTitle: 'Cenário Dinâmico • Falsa Central',
        xpReward: 110,
        category: 'Falsa Central Telefônica',
        title: `Ligação do "Suporte Bancário": Cancelar Pix de ${bogusAmount}`,
        dilemma: `Um atendente liga dizendo ser do setor de segurança do seu banco. O visor mostra o 0800 oficial, ele alerta sobre uma fraude de ${bogusAmount} e manda você transferir seu saldo para uma "Conta Cofre de Proteção".`,
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
            label: 'Dizer: "Vou desligar e ligar no telefone impresso atrás do meu cartão"',
            actionType: 'investigation',
            playerMessage: `Estou achando esse procedimento estranho. Vou desligar e ligar no SAC que está no verso do meu cartão físico.`,
            replyMessage: `Atendente (alterado): "Senhor, não desligue de jeito nenhum! Se desligar agora o sistema debitará a fraude compulsoriamente em 60 segundos e seu nome irá para o Serasa!"`,
            evidenceDiscovered: {
              id: 'ev-urgent-threat',
              title: 'Coerção & Terror Psicológico',
              description: 'O interlocutor ameaça prejuízo imediato e restrição de crédito para impedir que a vítima desligue e cheque os canais oficiais.',
              status: 'suspicious',
              forensicFact: 'Bancos reais nunca ameaçam clientes nem tentam impedi-los de desligar a chamada.',
            },
          },
          {
            id: 'act-call-2',
            label: 'Questionar: "Linhas 0800 não realizam chamadas ativas pela Anatel. Como estão me ligando?"',
            actionType: 'investigation',
            playerMessage: `Linhas 0800 são apenas para receber chamadas pela regulamentação da Anatel. Como vocês estão me ligando?`,
            replyMessage: `Atendente (hesitando): "É... nós somos da central de transbordo prioritário antifraude do sistema integrado nacional..."`,
            evidenceDiscovered: {
              id: 'ev-bina-spoofing',
              title: 'Spoofing de Identificador Telefônico (BINA Falsa)',
              description: 'Criminosos utilizam tecnologia de telefonia IP para forjar o número que aparece na tela do telefone da vítima.',
              status: 'suspicious',
              forensicFact: 'O número que aparece no visor pode ser facilmente manipulado por centrais VoIP clandestinas.',
            },
          },
          {
            id: 'act-call-3',
            label: 'Autorizar e fazer o Pix para a "Conta Cofre" para salvar o dinheiro',
            actionType: 'risk_decision',
            playerMessage: `Vou fazer o Pix de ${bogusAmount} para a conta de segurança agora para não perder meu dinheiro!`,
            replyMessage: `Atendente: "Perfeito, senhor! Identificamos o crédito da garantia. Aguarde na linha enquanto finalizamos..." (A ligação é encerrada em seguida).`,
            evidenceDiscovered: {
              id: 'ev-risk-pix-sent',
              title: 'Conduta de Risco: Transferência Voluntária para Golpistas',
              description: 'Você realizou a transferência voluntariamente para o estelionatário. Na vida real, o saldo seria pulverizado em segundos.',
              status: 'risk_taken',
              forensicFact: 'Nenhum banco pede transferência de dinheiro para cancelar compras ou proteger contas.',
            },
          },
        ],
        evidenceHypotheses: hypotheses,
        correctEvidenceIndex: correctIndex,
        keyEvidenceReason: 'Nenhum banco solicita Pix para devolver dinheiro ou proteger contas, e linhas 0800 não realizam chamadas ativas.',
        redFlags: ['Ligação alarmante dizendo que a conta foi invadida', 'Pedido de Pix para "conta de segurança"', '0800 fazendo chamada ativa (spoofing)'],
        explanation: 'Golpe da Falsa Central com BINA mascarada. Os golpistas forjam o identificador de chamadas para exibir o 0800 do banco, utilizam terror psicológico e induzem a vítima a transferir o próprio saldo.',
        realWorldTip: 'Desligue imediatamente! Em caso de dúvida, pegue o seu cartão físico e telefone para o número impresso no verso.',
        pedagogy: {
          emotionalTrigger: 'Medo de Perder o Saldo da Conta',
          kidsAnalogy: 'É como alguém bater na sua porta dizendo que é policial e pedir para guardar todo o seu dinheiro na casa dele para não ser roubado.',
          parentsGuide: 'Oriente idosos e parentes: desligue na hora e ligue para o telefone impresso no cartão de crédito.',
          adultRemedy: 'Nunca faça Pix em ligações. Se fez, abra imediatamente o aplicativo do banco e acione o MED (Mecanismo Especial de Devolução).',
          goldenRule: 'O Banco NUNCA vai te ligar pedindo Pix para cancelar compras!',
        },
        reinforcementDrill: {
          title: 'Treino de Reação: A Ligação da Falsa Central',
          question: 'Alguém liga dizendo ser da segurança do banco e manda transferir para uma conta segura. O que você faz?',
          context: 'Eles fazem pressão e botam pressa para você nem ter tempo de raciocinar.',
          options: [
            {
              id: 'drill-fc-1',
              text: 'Desligar na cara imediatamente. Banco nunca pede Pix para proteger saldo.',
              isCorrect: true,
              feedback: 'Correto! Desligar e ligar no número do cartão é a conduta que anula 100% do golpe.',
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
