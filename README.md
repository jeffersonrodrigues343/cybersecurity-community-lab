# 🛡️ HackLearn - Laboratório Comunitário de Cibersegurança
### Simulador Interativo de Golpes Digitais em Smartphone (Point & Click)

Projeto de Extensão Universitária vinculado ao **Programa de Contexto à Comunidade** do curso de **CST em Análise e Desenvolvimento de Sistemas (ADS)** — **Universidade Pitágoras Unopar / Anhanguera**.

* **Autor:** Jefferson Rodrigues Leite
* **RA:** `3816612105`
* **Curso:** CST em Análise e Desenvolvimento de Sistemas (5º Semestre)
* **Objetivos de Desenvolvimento Sustentável (ONU):** ODS 4 (Educação de Qualidade - Meta 4.4) e ODS 9 (Indústria, Inovação e Infraestrutura - Meta 9.c).

---

## 📱 Visão Geral do Projeto

O **HackLearn** é uma aplicação web gamificada e de código aberto criada para capacitar jovens, adultos e idosos na detecção e prevenção de golpes virtuais e ataques de engenharia social comuns no Brasil.

Ao invés de cartilhas teóricas que geram baixa retenção, o usuário vivencia a simulação realista de um **smartphone point & click**, recebendo mensagens suspeitas diretamente na tela do aparelho e utilizando ferramentas forenses do cotidiano para tomar a decisão correta.

---

## 🎮 Principais Funcionalidades

1. **Simulação Realista de Smartphone:**
   - **Tela de Bloqueio com Chegada ao Vivo:** O caso começa com o celular em repouso. Em poucos instantes, o aparelho vibra, toca o som característico e exibe um banner deslizante da notificação.
   - **Transição Point & Click:** O usuário toca no banner para desbloquear o telefone e entrar diretamente no aplicativo (WhatsApp, SMS, Ligação Telefônica ou Push Bancário).
2. **Investigação Forense no Aparelho:**
   - **Mini-Navegador Seguro:** Permite abrir e auditar links suspeitos dentro do próprio celular para verificar redirecionamentos fraudulentos e legitimidade de domínios.
   - **Simulação de Pix (Detecção de Contas Laranjas):** O usuário confere quem é o titular real da chave antes de realizar transferências.
   - **Verificação de SAC Físico vs. BINA Spoofing:** Aprenda por que nunca se deve confiar no número 0800 que liga para você e como conferir o SAC no verso do cartão.
   - **Diálogo Interativo em Tempo Real:** Envie respostas rápidas para o suspeito e observe a reação do golpista.
3. **Decisão Imediata e Aprendizado Contínuo:**
   - **Botões de Veredito:** Decisão rápida entre **"É GOLPE!"** e **"É SEGURO!"** posicionados logo abaixo do aparelho.
   - **Carimbo na Tela e Regra de Ouro:** Feedback visual imediato com carimbo cravado na tela e explicação direta da regra de segurança recomendada pelo CERT.br e Procon.
4. **Gamificação e Recompensas:**
   - Pontuação por XP e multiplicadores de Combo.
   - Árvore de Conquistas e Badges pedagógicos (*Protetor da Família*, *Mestre do Whois*, *Guardião do Pix*, etc.).
   - Emissão de **Certificado de Cidadão Blindado** ao concluir a jornada de casos.

---

## 🛠️ Tecnologias Utilizadas

* **Front-end:** React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide React, Canvas Confetti.
* **Áudio:** Web Audio API com sintetizador procedural nativo (vibração, toques, carimbos e notificações sem dependências pesadas externas).
* **Deploy:** Vercel e túnel reverso via SSH (Pinggy).

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
* Node.js (versão 18 ou superior)
* npm (versão 9 ou superior)

### 2. Instalação e Execução
```bash
# Clone o repositório
git clone https://github.com/jeffersonrodrigues343/cybersecurity-community-lab.git

# Acesse o diretório
cd cybersecurity-community-lab

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse no navegador: `http://localhost:5173`

---

## 📦 Deploy na Vercel

O projeto foi configurado com suporte nativo para Single-Page Applications (SPA) via `vercel.json`. Para publicar seu próprio deploy:

```bash
npx vercel
```

---

## 📄 Licença e Uso Educacional

Este projeto é disponibilizado sob a licença **MIT** com foco estritamente educacional e comunitário.
