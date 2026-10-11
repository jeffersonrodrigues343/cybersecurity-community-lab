import re

with open('src/data/dynamicScamsGenerator.ts', 'r') as f:
    content = f.read()

# Add a legitimate case type
# "legitimo"
replacement = """  const type = pick(['urgencia', 'falsacentral', 'legitimo']);

  if (type === 'legitimo') {
    const caseUid = generateId();
    const store = pick(['Amazon', 'Mercado Livre', 'Banco do Brasil', 'Nubank', 'Receita Federal']);
    const isBank = store == 'Nubank' or store == 'Banco do Brasil';
    const amount = `R$ ${randomInt(50, 900)},00`;
    
    return {
      id: caseUid,
      level: 'avancado',
      levelTitle: 'Cenário Dinâmico • Comunicado Oficial',
      xpReward: 150,
      category: 'Comunicado Legítimo',
      title: `Aviso de Segurança: ${store}`,
      dilemma: `Você recebeu um aviso de que uma nova tentativa de acesso foi bloqueada na sua conta e você precisa acessar o app oficial para confirmar.`,
      sender: store,
      channel: isBank ? 'push' : 'email',
      time: `${randomInt(8, 20)}:${randomInt(10, 59)}`,
      preview: `Um novo acesso foi identificado...`,
      messageContent: `Olá, identificamos uma tentativa de login suspeita na sua conta. Por segurança, bloqueamos o acesso temporariamente.\\n\\nNÃO clique em links se não solicitou. Para confirmar sua identidade, abra o aplicativo oficial do ${store} instalado no seu celular e siga as instruções na tela inicial.`,
      clues: [
        {
          id: `clue-${caseUid}-1`,
          name: 'Análise de Link e Ação',
          buttonLabel: 'Checar Destino da Ação',
          category: 'system',
          question: 'Para onde a mensagem direciona o usuário?',
          inspection: {
            type: 'system',
            badge: 'Análise de Fluxo de Acesso',
            field1Label: 'Vetor de Redirecionamento',
            field1Value: 'Ausente (Sem links clicáveis)',
            field2Label: 'Ação Exigida',
            field2Value: 'Acesso orgânico pelo aplicativo oficial já instalado',
            field3Label: 'Risco de Phishing',
            field3Value: 'Baixíssimo / Nulo',
            observation: 'A mensagem instrui expressamente o usuário a usar o canal oficial e seguro, sem fornecer atalhos suspeitos.',
          },
          evidenceResult: {
            status: 'safe',
            headline: 'Comportamento Seguro e Orgânico!',
            details: 'Instituições reais não enviam links para redefinição de senha ou verificação se você não pediu.',
            forensicFact: 'A ausência de links clicáveis e a orientação de usar o App oficial são sinais fortes de legitimidade.',
          },
        },
        {
          id: `clue-${caseUid}-2`,
          name: 'Remetente e Canal',
          buttonLabel: 'Inspecionar Origem da Notificação',
          category: 'official',
          question: 'O canal de origem bate com os registros oficiais?',
          inspection: {
            type: 'official',
            badge: 'Telemetria do Dispositivo',
            field1Label: 'Canal de Disparo',
            field1Value: isBank ? 'Notificação Push do Sistema OS' : 'Servidor SMTP Autenticado',
            field2Label: 'Assinatura Digital (DKIM/Certificado)',
            field2Value: 'Válida e Emitida pela CA raiz oficial',
            field3Label: 'Domínio de Origem',
            field3Value: `Validado e pertencente a ${store}`,
            observation: 'O certificado digital e os registros de domínio batem integralmente com a instituição oficial.',
          },
          evidenceResult: {
            status: 'safe',
            headline: 'Origem Confirmada e Criptografada!',
            details: 'A comunicação originou-se dos servidores criptografados reais da empresa.',
            forensicFact: 'O canal utilizado não pode ser forjado facilmente por golpistas sem comprometer a CA.',
          },
        }
      ],
      isScam: false,
      evidenceHypotheses: [
        'A mensagem não possui links maliciosos e instrui o uso do aplicativo oficial seguro para resolução do problema.',
        'O remetente solicitou atualização cadastral urgente mediante formulário anexo.',
        'A notificação exige pagamento imediato de tarifa para desbloqueio da conta.',
        'A mensagem contém erros grotescos de português e senso de urgência falso.'
      ],
      correctEvidenceIndex: 0,
      keyEvidenceReason: 'Mensagens legítimas de segurança instruem o usuário a usar o app oficial e não fornecem links suspeitos para clique imediato.',
      redFlags: [],
      explanation: 'Este é um alerta real de segurança. Ao orientar o cliente a fechar a mensagem e abrir o app oficial, a instituição impede qualquer ataque de phishing.',
      realWorldTip: 'Quando receber alertas no celular, NUNCA clique em links. Abra você mesmo o app da loja ou banco para checar os avisos oficiais.',
      pedagogy: {
        emotionalTrigger: 'Alerta Genuíno Sem Gatilho',
        kidsAnalogy: 'É como a escola mandando recado na agenda: você não dá dinheiro pro mensageiro, você lê e resolve no lugar certo.',
        parentsGuide: 'Diga: sempre abra o aplicativo do banco com seu dedo, nunca clique no botão que aparece na tela.',
        adultRemedy: 'Acesse seu banco ou loja orgânicamente. Se o alerta for real, estará na central de notificações lá.',
        goldenRule: 'Na dúvida, não clique. Acesse o aplicativo oficial pelo seu celular.',
      },
      reinforcementDrill: {
        title: 'Treino de Reação: O Alerta Oficial',
        question: 'Você recebe um aviso de fraude que manda você abrir seu aplicativo do banco, sem enviar link. Como proceder?',
        context: 'Golpistas facilitam tudo com links falsos. O caminho oficial dá mais trabalho, mas é o único seguro.',
        options: [
          {
            id: 'drill-legit-1',
            text: 'Abrir o aplicativo do banco pelo menu do celular e checar os avisos oficiais por lá.',
            isCorrect: true,
            feedback: 'Exatamente! O caminho orgânico pelo App oficial corta qualquer chance de phishing.',
          },
          {
            id: 'drill-legit-2',
            text: 'Ligar para a polícia e bloquear os cartões.',
            isCorrect: false,
            feedback: 'Ação precipitada. Verifique primeiro dentro do App oficial se o alerta confere.',
          },
          {
            id: 'drill-legit-3',
            text: 'Pesquisar o número de telefone no Google para checar se é verdade.',
            isCorrect: false,
            feedback: 'Muitos números falsos são patrocinados no Google. Vá no aplicativo oficial.',
          },
        ],
      },
    };
  }
"""

content = content.replace("const type = pick(['urgencia', 'falsacentral']);", replacement)

# Because we added python logic in TS, wait I already wrote it as TS.
# Just need to make sure the syntax is correct. `isBank = store == 'Nubank' || store == 'Banco do Brasil'`
content = content.replace("const isBank = store == 'Nubank' or store == 'Banco do Brasil';", "const isBank = store === 'Nubank' || store === 'Banco do Brasil';")

with open('src/data/dynamicScamsGenerator.ts', 'w') as f:
    f.write(content)
