# 🛡️ Cybersecurity Community Lab (HackLearn)
> **Projeto de Extensão Universitária I (Programa de Contexto à Comunidade)**  
> **Curso:** CST em Análise e Desenvolvimento de Sistemas (ADS) — Anhanguera  
> **Aluno:** Jefferson Rodrigues | **Alinhamento:** ODS 4 e ODS 9 (ONU)

---

## 📌 Sobre o Projeto

O **Cybersecurity Community Lab (HackLearn)** é uma plataforma web gamificada e de código aberto, inspirada no modelo do *TryHackMe*, desenvolvida com o objetivo de promover o **letramento digital e a capacitação em cibersegurança** para estudantes iniciantes e membros da comunidade.

Diante do avanço expressivo de golpes virtuais (engenharia social, phishing, roubo de senhas e clonagem de contas), o projeto traduz conceitos fundamentais de segurança da informação e computação em **desafios práticos e interativos**, democratizando o saber técnico por meio de redes de internet.

---

## 🚀 Tecnologias Utilizadas

A aplicação foi construída utilizando uma stack moderna de engenharia front-end:

- **React 19 & TypeScript:** Estruturação de componentes reutilizáveis e tipagem estática rigorosa.
- **Three.js (`threejs.org`):** Núcleo criptográfico 3D interativo holográfico em WebGL com LERP tracking e anéis orbitais.
- **GSAP & ScrollTrigger:** Transições de página com animações de rolagem escalonadas (*stagger*), timelines e ambient cursor follower.
- **Motion Dev (`motion/react`):** Micro-interações, barra de entropia física em tempo real, gavetas expansíveis e modais dinâmicos.
- **Web Audio API:** Sintetizador sonoro algorítmico procedural para feedbacks acústicos em ações e comandos sem dependência de assets externos.
- **Tailwind CSS v4:** Design responsivo com estética *cyberpunk / dark mode* de alto contraste.
- **Canvas Confetti:** Efeito comemorativo ao completar 100% da sala de desafios.

---

## 🎯 As Missões Práticas

| Missão | Tema Técnico | Mecânica Gamificada |
| :--- | :--- | :--- |
| **01. Engenharia Social** | Detecção de Phishing & Typosquatting | Análise de URLs forjadas vs oficiais de bancos com feedback analítico. |
| **02. Higiene de Senhas** | Ataques de Força Bruta & Entropia | Laboratório dinâmico com medição de entropia e tempo de quebra via *hashcat*. |
| **03. Web CTF & DOM** | Segurança Client-Side | Desafio estilo *Capture The Flag* usando DevTools (F12) para inspecionar segredos no front-end. |
| **Bônus: AttackBox** | Terminal Linux Kali Emulado | Console web interativo capaz de rodar comandos de rede (`nmap`, `cat`, `ls`, `whoami`). |

---

## 🏆 Certificação & Validação Comunitária

Ao concluir as três missões da sala (atingindo 300 XP), a plataforma emite instantaneamente um **Certificado de Extensão Universitária** personalizado e disponibiliza um canal de registro de depoimentos para os usuários beneficiários.

---

## 📦 Como Rodar o Projeto Localmente

```bash
# 1. Clone o repositório
git clone git@github.com:jeffersonrodrigues343/cybersecurity-community-lab.git

# 2. Acesse a pasta
cd cybersecurity-community-lab

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:5173/](http://localhost:5173/) no seu navegador.

---

## 🎓 Alinhamento com os ODS da ONU

- **ODS 4 (Educação de Qualidade) — Meta 4.4:** Desenvolvimento de competências técnicas essenciais para o mercado de tecnologia.
- **ODS 9 (Indústria, Inovação e Infraestrutura) — Meta 9.c:** Acesso seguro e consciente às tecnologias de informação e comunicação.

---

*Licença: MIT — Projeto de Extensão Comunitária Acadêmica.*
