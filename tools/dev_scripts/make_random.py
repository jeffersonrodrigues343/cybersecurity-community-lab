with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Replace the whole top section where modes/levels are selected with nothing or just the title.
import re

content = re.sub(
    r'\{/\* BLOCO 1: CENTRAL DE PROGRESSÃO & SELEÇÃO DE NÍVEIS \(BENTO\) \*/\}.*?\{/\* CONSOLE PRINCIPAL DESKTOP',
    r'{/* CONSOLE PRINCIPAL DESKTOP',
    content,
    flags=re.DOTALL
)

# Replace currentCase logic
content = content.replace(
    '''  const currentCase: ScamCase =
    gameMode === 'dynamic' ? dynamicCase : (levelCases[currentCaseIndex] || levelCases[0]);''',
    '''  const currentCase: ScamCase = dynamicCase;'''
)

# Ensure handleNextCase creates a new dynamic case
content = re.sub(
    r'const handleNextCase = \(\) => \{.*?if \(isLevelFinished\) \{',
    r'''const handleNextCase = () => {
    sound.playBlip();
    setDynamicCase(generateDynamicScamCase());
    setExpandedClueId(null);
    setFloatingXp(null);
    setSelectedVerdict(null);
    setSelectedHypothesis(null);
    setDrillSelectedOptionId(null);
    setDrillSuccess(false);
    setDrillBonusAwarded(false);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    if (false) {''',
    content,
    flags=re.DOTALL
)
# Note: we kept `if (false) {` to make the rest of the old function safely ignored or we can just replace the whole function.

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
