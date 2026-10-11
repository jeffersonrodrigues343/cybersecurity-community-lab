import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# 1. Hide the hypothesis selection. When they click 'Golpe' or 'Seguro', we should jump straight to the validation logic instead of showing hypotheses.
# Actually, the current logic is:
# handleVerdictSelect(true/false) -> sets selectedVerdict.
# Then they select a hypothesis.
# Then they click "Bater o Martelo".
# We need to bypass the hypothesis step. 

# Let's rewrite `handleVerdictSelect` so it instantly finalizes the investigation.
# We will replace the entire `handleVerdictSelect` function.

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
    
    // FOR KIDS: Skip hypothesis selection entirely and auto-submit!
    setTimeout(() => {
      handleFinalizeInvestigationAuto(isScamVerdict);
    }, 150);
  };

  const handleFinalizeInvestigationAuto = (verdict: boolean) => {
    sound.playClick();
    const isCorrect = verdict === currentCase.isScam;
    
    // We treat it as a full success if they got the boolean right (no hypothesis needed)
    setCurrentAnswerData({
      verdict: verdict,
      hypothesisIndex: currentCase.correctEvidenceIndex, // auto-correct hypothesis
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


# 2. Hide the hypothesis UI completely.
# Find the block `{/* Etapa 2: Abre a gaveta de evidências para sustentar o relatório */}` and remove it.
# It is wrapped in `selectedVerdict !== null && (...)`
# We'll just regex remove it.

pattern = r'\{\/\* Etapa 2: Abre a gaveta de evidências.*?\/\* Botão de Confirmação com Martelo \*\/.*?\}\)\}'

content = re.sub(pattern, '', content, flags=re.DOTALL)


# 3. Simplify the Clues (Ferramentas) UI.
# In `currentCase.clues.map`, when a clue is clicked, it shows:
# <div className="space-y-2 mt-2 pt-2 border-t border-white/[0.08]"> ... field1, field2, field3, observation.
# Let's simplify this to just show the `observation` text, large and clear.

clue_body_pattern = r'\{\/\* Dados Técnicos da Pista \*\/.*?<p className="text-xs text-\[\#00ffff\] font-bold pt-1 leading-relaxed\">'
# We replace all the fields with just the observation
new_clue_body = """{/* Dados Técnicos Simples para Crianças */}
                                    <div className="space-y-2 mt-2 pt-2 border-t border-white/[0.08]">
                                      <p className="text-sm text-[#00ffff] font-bold pt-1 leading-relaxed">"""
content = re.sub(clue_body_pattern, new_clue_body, content, flags=re.DOTALL)


# Also remove field1, field2, field3 rendering
remove_fields_pattern = r'\{clue\.inspection\.field1Label.*?\{clue\.inspection\.observation\}'
content = re.sub(remove_fields_pattern, '{clue.inspection.observation}', content, flags=re.DOTALL)


# 4. Simplify the terms in the UI.
content = content.replace('Ferramentas de Investigação', 'Dicas Rápidas')
content = content.replace('Inspecione a informações técnicas técnica para avaliar a se é real do caso (+10 XP)', 'Clique nas dicas abaixo se estiver na dúvida (+10 XP)')
content = content.replace('Veredito do Detetive', 'O que você acha?')
content = content.replace('Qual é o seu julgamento sobre esta mensagem?', 'Essa mensagem é Golpe ou é Segura?')
content = content.replace('GOLPE', 'É GOLPE!')
content = content.replace('SEGURO', 'TÁ SEGURO!')
content = content.replace('Relatório de Análise', 'O que aconteceu?')


with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
