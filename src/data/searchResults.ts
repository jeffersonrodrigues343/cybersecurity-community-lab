// Resultados de busca simulados por caso: uma notícia, uma fonte oficial e, quando faz
// sentido, um resultado enganoso — o jogador treina a escolher em quem confiar.
export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  body: string[];
  // true = site falso/enganoso que aparece na busca (o jogo sinaliza no fim do artigo)
  suspicious?: boolean;
}

const OFFICIAL_BANK_TIP: SearchResult = {
  url: 'febraban.org.br › seguranca › golpes',
  title: 'Golpes financeiros: o que o banco nunca faz',
  snippet: 'O banco não liga nem manda mensagem pedindo senha, código, Pix para "conta segura" ou instalação de aplicativo.',
  body: [
    'Os bancos não pedem senha, código recebido por mensagem nem token por telefone ou WhatsApp.',
    'Nenhum banco pede para transferir dinheiro para uma "conta segura" ou "conta do Banco Central" para proteger o seu saldo.',
    'Em caso de dúvida, desligue e ligue você mesmo para o número que está no verso do seu cartão ou no aplicativo oficial.',
  ],
};

export const SEARCH_RESULTS: Record<string, SearchResult[]> = {
  'case-1-whatsapp': [
    {
      url: 'g1.globo.com › tecnologia › golpe-do-numero-novo',
      title: 'Golpe do "número novo": criminosos se passam por filhos e pedem Pix',
      snippet: 'Golpistas usam a foto de um parente, dizem que trocaram de número e pedem dinheiro com urgência.',
      body: [
        'O golpe começa com "oi mãe, esse é meu número novo". A foto do perfil é copiada das redes sociais do parente.',
        'Logo em seguida vem o pedido urgente: uma conta para pagar hoje e o aplicativo do banco que "não abre no celular novo".',
        'A chave Pix quase sempre está no nome de outra pessoa. O golpista também evita mandar áudio ou atender ligação.',
        'Como se proteger: ligue para o número antigo do parente ou peça um áudio falando o seu nome antes de qualquer transferência.',
      ],
    },
    {
      url: 'gov.br › anatel › chip-pre-pago',
      title: 'Chip pré-pago: como funciona a ativação de linhas',
      snippet: 'Linhas pré-pagas podem ser ativadas em minutos e com DDD de qualquer estado.',
      body: [
        'Um chip pré-pago pode ser ativado no mesmo dia, com DDD de qualquer região do país.',
        'Por isso, um número com DDD de outro estado, ativado há pouco tempo, merece atenção quando pede dinheiro.',
      ],
    },
    {
      url: 'ajuda-pix-familia.online › liberar',
      title: 'Pix emergencial para familiares — libere em 1 minuto',
      snippet: 'Envie o Pix agora pela nossa central e evite o bloqueio da matrícula.',
      body: ['Esta página pede para você fazer um Pix por fora do aplicativo do seu banco.'],
      suspicious: true,
    },
  ],
  'case-2-correios': [
    {
      url: 'correios.com.br › receber › minhas-importacoes',
      title: 'Minhas Importações — Correios',
      snippet: 'Encomendas internacionais tributadas são consultadas e pagas somente no site oficial ou no app dos Correios.',
      body: [
        'Os Correios não cobram taxas por WhatsApp, SMS ou e-mail com link de pagamento.',
        'Para saber se existe alguma taxa, acesse correios.com.br, entre em "Minhas Importações" com o seu CPF e confira o código de rastreio.',
      ],
    },
    {
      url: 'g1.globo.com › economia › golpe-falsa-taxa-correios',
      title: 'Falsa taxa dos Correios: golpe usa código de rastreio inventado',
      snippet: 'Mensagens dizem que a encomenda está retida e mandam link para pagar via Pix.',
      body: [
        'A mensagem traz um código de rastreio, um valor baixo e um prazo curto para pagar.',
        'O link leva para um site com endereço diferente de correios.com.br, muitas vezes terminado em .online ou .tk.',
        'Se você não esperava nenhuma encomenda internacional, a mensagem é golpe.',
      ],
    },
    {
      url: 'correios-taxas-alfandega.online › pagar',
      title: 'Correios Taxas — Regularize sua encomenda',
      snippet: 'Pague a taxa alfandegária via Pix e receba hoje.',
      body: ['Este site não pertence aos Correios. O endereço oficial é apenas correios.com.br.'],
      suspicious: true,
    },
  ],
  'case-3-compra-aprovada': [
    {
      url: 'itau.com.br › seguranca › canais-oficiais',
      title: 'Canais oficiais de atendimento do Itaú',
      snippet: 'Avisos de compra pelo WhatsApp oficial têm selo verificado e nunca pedem senha, código ou Pix.',
      body: [
        'O WhatsApp oficial do banco aparece com o selo de conta verificada.',
        'Avisos de compra só informam a transação. Eles não trazem link nem pedem que você ligue para outro número.',
        'Para confirmar, abra o aplicativo do banco e confira o extrato.',
      ],
    },
    OFFICIAL_BANK_TIP,
  ],
  'case-3-falsa-central-sms': [
    {
      url: 'g1.globo.com › economia › golpe-compra-falsa-0800',
      title: 'Golpe da compra falsa: mensagem pede para ligar num 0800',
      snippet: 'Criminosos inventam uma compra alta e mandam ligar para uma "central" que pede Pix para cancelar.',
      body: [
        'A mensagem avisa uma compra que você não fez, com valor alto, e dá um número para ligar com urgência.',
        'Quem atende se diz da central de segurança e pede um Pix para "cancelar" ou "estornar" a compra.',
        'Compra não se cancela com Pix. Confira o extrato no aplicativo do banco antes de qualquer coisa.',
      ],
    },
    OFFICIAL_BANK_TIP,
    {
      url: 'magalu-cancelamento-compra.online',
      title: 'Central de Cancelamento — Compras não reconhecidas',
      snippet: 'Ligue 0800 729 0001 e cancele em até 10 minutos.',
      body: ['Esta página não é do Magazine Luiza. Canais oficiais ficam em magazineluiza.com.br.'],
      suspicious: true,
    },
  ],
  'case-4-falsa-central': [
    OFFICIAL_BANK_TIP,
    {
      url: 'bcb.gov.br › cidadania › golpes',
      title: 'Banco Central: não existe "conta segura"',
      snippet: 'O Banco Central não liga para clientes nem tem conta para guardar o dinheiro de ninguém.',
      body: [
        'O Banco Central não mantém contas de pessoas e não entra em contato pedindo transferências.',
        'Ligação dizendo que sua conta foi invadida e que é preciso mover o dinheiro é golpe da falsa central.',
      ],
    },
  ],
  'case-5-loja-falsa-promocao': [
    {
      url: 'procon.sp.gov.br › evite-sites',
      title: 'Lista de sites a evitar — Procon-SP',
      snippet: 'Antes de comprar, consulte se a loja está na lista de sites denunciados por não entregar produtos.',
      body: [
        'Desconfie de descontos muito grandes, pagamento só por Pix e lojas sem CNPJ e endereço.',
        'Consulte a lista de sites a evitar do Procon e a reputação da loja antes de pagar.',
      ],
    },
    {
      url: 'g1.globo.com › economia › promocao-falsa-whatsapp',
      title: 'Promoções falsas no WhatsApp imitam grandes lojas',
      snippet: 'Produtos com até 80% de desconto e pagamento só via Pix são o principal sinal de golpe.',
      body: [
        'Os golpistas copiam a marca de lojas conhecidas e mandam ofertas por WhatsApp para muita gente ao mesmo tempo.',
        'O link leva para uma página parecida com a loja, mas o endereço é diferente e só aceita Pix.',
      ],
    },
    {
      url: 'magalu-ofertas-queima.shop',
      title: 'Queima de Estoque Oficial — Air Fryer por R$ 89,90',
      snippet: 'Últimas unidades! Pagamento exclusivo via Pix.',
      body: ['Este site não pertence à loja. O endereço oficial é magazineluiza.com.br.'],
      suspicious: true,
    },
  ],
  'case-6-sms-seguranca-real': [
    {
      url: 'bb.com.br › seguranca › codigo-de-acesso',
      title: 'Código de acesso do BB: use só você',
      snippet: 'O código chega quando você mesmo pede acesso. O banco nunca liga pedindo esse número.',
      body: [
        'O código de acesso chega quando você mesmo tenta entrar na sua conta ou cadastrar um aparelho.',
        'Se foi você quem pediu, use o código no aplicativo. Nunca passe esse número para ninguém, nem para quem diz ser do banco.',
      ],
    },
    OFFICIAL_BANK_TIP,
  ],
  'case-7-vaga-tarefas': [
    {
      url: 'g1.globo.com › trabalho-e-carreira › golpe-das-tarefas',
      title: 'Golpe das tarefas: pagam pouco no início e depois cobram "taxa"',
      snippet: 'Vagas para curtir vídeos ou avaliar produtos pagam R$ 20 no começo e depois exigem depósitos.',
      body: [
        'A conversa começa com uma recrutadora oferecendo trabalho fácil em casa, com pagamento diário.',
        'Nas primeiras tarefas você recebe valores pequenos, para ganhar confiança.',
        'Depois aparecem as "tarefas VIP", que exigem depósito via Pix. O dinheiro nunca volta.',
        'Regra simples: trabalho de verdade não cobra para você trabalhar.',
      ],
    },
    {
      url: 'gov.br › trabalho › empregos-falsos',
      title: 'Como identificar ofertas de emprego falsas',
      snippet: 'Empresas sérias não pedem pagamento para contratar nem recrutam por número estrangeiro.',
      body: [
        'Desconfie de recrutamento por número estrangeiro, promessa de ganho alto por tarefas simples e pedido de depósito.',
        'Confira o CNPJ da empresa e procure a vaga no site oficial dela.',
      ],
    },
  ],
  'case-8-receita-ecac': [
    {
      url: 'gov.br › receitafederal › e-cac',
      title: 'e-CAC — Centro Virtual de Atendimento',
      snippet: 'Acesse com sua conta gov.br para consultar pendências e mensagens na Caixa Postal.',
      body: [
        'Pendências da declaração e mensagens da Receita ficam na Caixa Postal do e-CAC.',
        'Entre digitando o endereço gov.br/receitafederal no navegador e use sua conta gov.br.',
        'A Receita não manda link para pagar nem pede dados por WhatsApp.',
      ],
    },
    {
      url: 'g1.globo.com › economia › imposto-de-renda › malha-fina',
      title: 'Caiu na malha fina? Veja como consultar e corrigir',
      snippet: 'A consulta é feita no e-CAC; é possível enviar uma declaração retificadora.',
      body: [
        'Quem caiu na malha pode consultar o motivo no e-CAC e corrigir enviando uma declaração retificadora.',
        'Um contador pode ajudar, mas a consulta deve ser feita sempre no site oficial.',
      ],
    },
  ],
  'case-9-mao-fantasma-suporte': [
    {
      url: 'g1.globo.com › tecnologia › golpe-da-mao-fantasma',
      title: 'Golpe da "mão fantasma": falso suporte pede para instalar app',
      snippet: 'Criminosos ligam dizendo que o celular tem vírus e pedem para instalar um app de acesso remoto.',
      body: [
        'O falso atendente diz que seu celular foi invadido e pede para você instalar um aplicativo de "suporte".',
        'Esses aplicativos dão controle total do aparelho. Com o código que você passa, o criminoso abre o app do banco e faz transferências.',
        'Banco nenhum pede para instalar aplicativo durante uma ligação.',
      ],
    },
    OFFICIAL_BANK_TIP,
  ],
};

// Casos sem lista própria (fases geradas depois da 4): resultados gerais
export const FALLBACK_RESULTS: SearchResult[] = [
  {
    url: 'g1.globo.com › economia › seguranca-digital',
    title: 'Como funcionam os golpes de urgência por WhatsApp no Brasil',
    snippet: 'Bancos, Correios e grandes empresas nunca enviam links de pagamento nem pedem Pix para pessoas físicas.',
    body: [
      'Os golpes usam pressa e medo: prazo curto, ameaça de bloqueio ou pedido de ajuda de um parente.',
      'Antes de pagar ou clicar, confira o número, o endereço do site e o nome de quem recebe o Pix.',
    ],
  },
  OFFICIAL_BANK_TIP,
];
