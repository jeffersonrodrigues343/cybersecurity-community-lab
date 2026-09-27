# HackLearn - Laboratório Prático de Cibersegurança

Projeto prático de extensão universitária desenvolvido para o curso de **Análise e Desenvolvimento de Sistemas (ADS)**.

O objetivo do projeto é oferecer uma experiência interativa e gamificada para quem está começando na área de tecnologia e segurança da informação, ensinando conceitos essenciais de forma direta no navegador:

1. **Engenharia Social & Phishing:** como analisar e diferenciar URLs verdadeiras de links maliciosos.
2. **Força e Entropia de Senhas:** laboratório interativo para testar resistência a ataques de dicionário e força bruta (baseado nas diretrizes do CERT.br e NIST).
3. **Web CTF (Capture The Flag):** noções de segurança no front-end e inspeção de elementos no DevTools (F12).
4. **Terminal Simulado:** terminal interativo para praticar comandos básicos de linha de comando (`ls`, `cat`, `nmap`, etc.).

---

## Tecnologias Utilizadas

- **Front-end:** React 19, TypeScript, Vite, Tailwind CSS, Three.js (canvas 3D) e Lucide React.
- **Back-end:** C# ASP.NET Core (.NET 8 Minimal API).
- **Banco de Dados:** SQLite local (via Entity Framework Core 8) com sincronização em nuvem via Supabase.

---

## Como Executar Localmente

### 1. Pré-requisitos
- Node.js (v18+)
- .NET SDK 8.0

### 2. Rodando o Front-end
```bash
# Entrar na pasta e instalar as dependencias
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```
Acesse `http://localhost:5173`.

### 3. Rodando o Back-end (C#)
```bash
cd backend
dotnet run
```
A API iniciará em `http://localhost:5100` com documentação interativa no Swagger: `http://localhost:5100/swagger`.

---

## Estrutura do Projeto

```text
├── backend/                  # API em C# .NET 8 e banco SQLite
│   ├── Program.cs            # Endpoints, CORS e regras de validacao
│   ├── cyberlab.db           # Banco SQLite local gerado na execucao
│   └── appsettings.json      # Configuracoes da aplicacao
├── src/                      # Codigo fonte do Front-end (React + TS)
│   ├── components/           # Componentes dos desafios e telas
│   ├── services/             # Integracao com a API e servicos
│   └── App.tsx               # Componente principal
└── README.md
```

---

*Projeto desenvolvido com fins educacionais e de extensão comunitária.*
