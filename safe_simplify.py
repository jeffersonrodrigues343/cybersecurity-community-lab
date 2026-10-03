import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# 1. Simplify text to be child-friendly
content = content.replace('Ferramentas de Investigação', 'Dicas Rápidas')
content = content.replace('Inspecione a informações técnicas técnica para avaliar a se é real do caso (+10 XP)', 'Se tiver dúvida, clique abaixo para ver uma pista!')
content = content.replace('Veredito do Detetive', 'O que você acha?')
content = content.replace('Qual é o seu julgamento sobre esta mensagem?', 'Isso é um GOLPE ou é SEGURO?')

# 2. Hide hypothesis selection.
# Find `<div className="space-y-3">` under `{/* Etapa 2: Abre a gaveta de evidências para sustentar o relatório */}`
# and add `hidden` to it.
content = content.replace(
    '{/* Etapa 2: Abre a gaveta de evidências para sustentar o relatório */}\n                <div className="space-y-4">',
    '{/* Etapa 2: Escondido para crianças */}\n                <div className="space-y-4 hidden">'
)
# Wait, "Bater o Martelo" is at the bottom of Etapa 2. So if I hide Etapa 2, they can't click "Bater o Martelo"!
# The easiest way to skip the hypothesis is to modify `handleVerdictSelect` to instantly trigger the final verdict!

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
    
    // Auto submit for kids!
    const isCorrect = isScamVerdict === currentCase.isScam;
    setCurrentAnswerData({
      verdict: isScamVerdict,
      hypothesisIndex: currentCase.correctEvidenceIndex, // Force correct hypothesis internally
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

# Hide the manual "Bater o Martelo" button since it auto-submits now.
old_btn = "{/* Botão de Confirmação com Martelo */}"
new_btn = "{/* Botão escondido porque envia automático agora */}\n                <div className=\"hidden\">"
content = content.replace(old_btn, new_btn)

# We must close that hidden div before the AnimatePresence ends? No, let's just add hidden to the button itself.
content = content.replace('<motion.button\n                    initial={{ opacity: 0, y: 5 }}', '<motion.button\n                    className="hidden"\n                    initial={{ opacity: 0, y: 5 }}')

# Simplify clues rendering. Just hide the 3 fields and show the observation.
# In the clue map, there is:
# {/* Dados Técnicos da Pista */}
# <div className="space-y-2 mt-2 pt-2 border-t border-white/[0.08]">
#   <div className="grid grid-cols-2 gap-2"> ... </div>
#   <p className="text-xs text-[#00ffff] font-bold pt-1 leading-relaxed">
#     {clue.inspection.observation}
#   </p>
# </div>

# Let's hide the `grid grid-cols-2 gap-2`
content = content.replace('<div className="grid grid-cols-2 gap-2">', '<div className="hidden">')

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
