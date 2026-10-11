import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

content = content.replace('Ferramentas de Investigação', 'Dicas Rápidas')
content = content.replace('Inspecione a informações técnicas técnica para avaliar a se é real do caso (+10 XP)', 'Se bater a dúvida, clique nas pistas pra ver o que tá rolando!')
content = content.replace('Veredito do Detetive', 'O que você acha?')
content = content.replace('Qual é o seu julgamento sobre esta mensagem?', 'Aperte e bata o martelo: É Golpe ou Tá Seguro?')

old_handle = """  const handleVerdictSelect = (isScamVerdict: boolean) => {
    sound.playClick();
    setSelectedVerdict(isScamVerdict);
    setSelectedHypothesis(null);
    
    setTimeout(() => {
      hypothesisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };"""

new_handle = """  const handleVerdictSelect = (isScamVerdict: boolean) => {
    sound.playClick();
    setSelectedVerdict(isScamVerdict);
    
    // Auto-submete direto para a tela de resposta sem pedir pra ler as hipóteses!
    const isCorrect = isScamVerdict === currentCase.isScam;
    setCurrentAnswerData({
      verdict: isScamVerdict,
      hypothesisIndex: currentCase.correctEvidenceIndex,
      isCorrect: isCorrect,
      isPartial: false,
      investigatedCluesCount: Object.keys(investigatedClues).length,
    });

    if (isCorrect) {
      sound.playSuccess();
      const cluesBonus = Object.keys(investigatedClues).length * 10;
      onScoreUpdate(score + currentCase.xpReward + cluesBonus, completedCount + 1, false);
      triggerConfetti();
      setStreak((prev) => prev + 1);
    } else {
      sound.playError();
      setStreak(0);
    }
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };"""

content = content.replace(old_handle, new_handle)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
