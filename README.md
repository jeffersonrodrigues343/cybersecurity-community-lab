# HackLearn

Simulador de golpes de WhatsApp para treinar adultos a reconhecer fraude antes de cair nela.

Projeto de extensão do curso de Análise e Desenvolvimento de Sistemas (Unopar / Anhanguera), programa Contexto à Comunidade.

**Jogar:** https://cybersecurity-community-lab.vercel.app

## Como funciona

A tela imita um celular. Chega uma mensagem ou ligação de WhatsApp e você decide se é golpe ou não. Antes de decidir, dá para investigar do mesmo jeito que faria na vida real:

- tocar no contato e ver o número, o nome do perfil e se a conta é verificada;
- simular o Pix no app do banco e ver em nome de quem está a chave;
- pedir um áudio ou ligar de volta;
- pesquisar no Google e abrir os resultados (alguns são sites falsos);
- anotar o que encontrou.

Na hora de decidir, além de dizer "golpe" ou "seguro", você escolhe a pista que te convenceu. No final do caso o jogo explica o que entregava a fraude.

Os casos são baseados nos golpes mais comuns no Brasil: falso parente com número novo, taxa falsa dos Correios, falsa central do banco, promoção falsa, vaga de "tarefas" e app de acesso remoto. Cada trilha também tem uma mensagem verdadeira, para ninguém sair achando que tudo é golpe.

## De onde vêm os casos

Os casos foram montados a partir de alertas e materiais públicos. No fim de cada caso, o jogo mostra as fontes daquele golpe.

- CERT.br – Cartilha "Phishing e Outros Golpes" (2022): https://busca.acervo.nic.br/vufind/Record/oai:bibliotecadigital.acervo.nic.br:123456789-2155/Details
- Banco Central do Brasil – Golpes: https://www.bcb.gov.br/acessoinformacao/golpes
- Febraban – Golpes: https://portal.febraban.org.br/pagina/3267/1076/pt-br/golpes
- Aos Fatos – golpe da encomenda retida nos Correios: https://www.aosfatos.org/noticias/e-golpe-alerta-que-exige-pagamento-para-liberar-encomenda-retida-pelos-correios/
- Mercado & Consumo – Correios alertam sobre golpe na alfândega (2024): https://mercadoeconsumo.com.br/31/07/2024/economia/correios-alertam-sobre-golpe-de-encomendas-presas-na-alfandega/
- Itatiaia – lista de sites a evitar do Procon (2023): https://www.itatiaia.com.br/brasil/black-friday-2023-procon-lista-78-sites-para-consumidor-evitar-em-compras
- Receita Federal – portal oficial: https://www.gov.br/receitafederal/pt-br
- SBT News – golpe do falso emprego: https://sbtnews.sbt.com.br/noticia/tecnologia/261784-alerta-golpe-do-falso-emprego-atinge-desempregados-no-brasil

Nomes, números e valores dentro do jogo são fictícios.

## Dificuldade por idade

| Faixa | Chances de erro | Ritmo das mensagens | Dicas quando você trava |
|---|---|---|---|
| 20 a 34 | 1 | mais rápido | 1 |
| 35 a 49 | 2 | normal | 2 |
| 50+ | 3 | mais calmo, letra maior | 3 |

As dicas dizem onde olhar, nunca a resposta. O jogador também escolhe como quer ser tratado (mãe/pai, senhora/senhor), e as falas mudam de acordo.

## Resultados

Cada decisão é registrada sem dados pessoais (só faixa de idade, caso, acerto e quantas pistas foram abertas). A página `/painel` mostra a taxa de acerto por faixa.

## Tecnologias

React 19, TypeScript, Vite, Tailwind CSS, Motion, Supabase (PostgreSQL) e um backend opcional em C# (.NET). Os sons são gerados com a Web Audio API.

## Rodar localmente

Precisa de Node.js 18 ou mais novo.

```bash
git clone https://github.com/jeffersonrodrigues343/cybersecurity-community-lab.git
cd cybersecurity-community-lab
npm install
npm run dev
```

Abre em `http://localhost:5173`.

Para gravar os resultados no Supabase, crie a tabela com `docs/supabase_game_results.sql` e defina `VITE_SUPABASE_ANON_KEY`.

## ODS (ONU)

- 4.4 – habilidades digitais para jovens e adultos
- 10.2 – inclusão digital independente da idade
- 16.4 – combate a fluxos financeiros ilegais

## Autor

Jefferson Rodrigues Leite — CST em Análise e Desenvolvimento de Sistemas

## Licença

MIT
