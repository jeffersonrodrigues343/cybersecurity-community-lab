import os
import re

intern_map = {
    r'// Registro de respostas e laudos periciais': '// salva o que o usuario respondeu',
    r'// Pistas investigadas no caso atual': '// dicas clicadas',
    r'// Seleções ativas da Bancada Pericial': '// o que ta selecionado agora',
    r'// Treino de Reforço em caso de erro': '// se errar vai pra ca',
    r'// Gamificação pedagógica': '// sisteminha de xp e level',
    r'// Sistema de Medalhas / Conquistas': '// badges',
    r'// Casos do nível atual ou Caso Dinâmico': '// pega o caso atual',
    r'// Modo Sob Pressão \(Cronômetro Tático\)': '// modo rapido',
    r'// Reinicia cronômetro quando o caso muda': '// reseta o timer',
    r'// Contagem regressiva do Modo Sob Pressão': '// diminui o tempo',
    r'// Pistas coletadas no caso atual': '// dicas q ele achou',
    r'// Métricas gerais de pontuação e progresso': '// pontos totais',
    r'// Jogador clica para investigar uma pista específica': '// click na dica',
    r'// Veredito e Julgamento do Caso pelo Detetive': '// funcao de submit do form',
    r'// Bônus de 10 XP por cada pista investigada antes do laudo': '// da ponto pelas dicas',
    r'// Bônus de Pressão Tática \(\+20 XP se acertou com louvor dentro do tempo\)': '// bonus tempo',
    r'// Efeito festivo de confetes Apple': '// joga os confetes',
    r'// Conquistas de Desafio e Dificuldade': '// libera os emblemas hardcore',
    r'// Veredito correto, mas prova incorreta \(acerto parcial\)': '// acertou mas errou a prova',
    r'// Força o scroll pro topo absoluto assim que o caso novo for montado no DOM': '// gambiarra pro scroll ir pro topo',
    r'// Utilitários de Sorteio': '// funcoes random',
    r'// Gerador Procedural de Casos Hipotéticos Dinâmicos': '// gera os casos dinamicamente',
    r'// DDA: Dynamic Difficulty Adjustment': '// ajusta a dificuldade baseado nos acertos',
    r'// Base scam prob is 30% \(tende a ser verídico\). Aumenta 10% a cada acerto na streak. Max 80%.': '// se ta acertando muito, manda mais golpe',
    r'// COMPONENTE PRINCIPAL DO CENÁRIO 2D': '// componente pai',
    r'// Grade de fundo cibernética suave': '// grid do fundo',
    r'// Header do Cenário 2D': '// topo',
    r'// Palco Principal e Animações': '// svg do meio',
    r'// BLOCO 1: CENTRAL DE PROGRESSÃO & SELEÇÃO DE NÍVEIS \(BENTO\)': '// bloco de nav do topo',
    r'// CONSOLE PRINCIPAL DESKTOP \(Split View: Inspeção \+ Auditoria\)': '// container principal',
    r'// COLUNA ESQUERDA: Cartão Bento do Incidente sob Investigação \(7 colunas\)': '// esquerda',
    r'// Header do Cartão Bento': '// titulo do cartao',
    r'// Conteúdo do Incidente': '// corpo da msg',
    r'// BLOCO 2: FERRAMENTAS DE INVESTIGAÇÃO VISUAL \(3 PISTAS\)': '// coluna da direita (ferramentas)',
    r'// BLOCO 3: BANCADA DE VINCULAÇÃO DE EVIDÊNCIAS \(Veredito\)': '// botoes de veredito',
    r'// FLUXO A: Se ACERTOU EM CHEIO, exibe Debriefing de Silas & Clara': '// deu bom',
    r'// FLUXO B: Se ERROU ou ACERTOU PARCIAL, aciona o TREINO DE REFORÇO FORENSE': '// deu ruim',
    r'// Modal de Conquistas': '// modal badges',
    r'// Modal de Cartilha de Prevenção': '// modal pdf'
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove the big block lines // ========================
    content = re.sub(r'// =+\n', '', content)
    
    # Remove block comments like {/* ========================== */}
    content = re.sub(r'\{/\* =+ \*/\}\n', '', content)

    for old, new in intern_map.items():
        content = re.sub(old, new, content)

    # Some remaining comments formatting like {/* BLOCO X: Title */}
    content = re.sub(r'\{/\*\s*BLOCO \d+:\s*(.*?)\s*\*/\}', lambda m: f'{{/* {m.group(1).lower()} */}}', content)

    # "Apple Style" comments
    content = re.sub(r'\{/\*\s*Apple Style\s*\*/\}', '{/* modalzinho */}', content)
    content = re.sub(r'// Apple fluid curve \(easeOutExpo\)', '// math de animacao que peguei no codepen', content)

    # Replace pedagogical texts
    content = content.replace('Gamificação pedagógica', 'Gamificacao')
    content = content.replace('telemetria pericial coletada', 'dados do click')
    content = content.replace('Bancada Pericial', 'botoes')

    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            process_file(os.path.join(root, file))

print("Comments processed.")
