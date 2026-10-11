import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Replace currentCase logic
content = content.replace(
    '''  const currentCase: ScamCase =
    gameMode === 'campaign' ? (levelCases[currentCaseIndex] || levelCases[0]) : dynamicCase;''',
    '''  const currentCase: ScamCase = dynamicCase;'''
)
content = content.replace(
    '''  const currentCase: ScamCase =
    gameMode === 'dynamic' ? dynamicCase : (levelCases[currentCaseIndex] || levelCases[0]);''',
    '''  const currentCase: ScamCase = dynamicCase;'''
)

# Replace handleNextCase
pattern_next = r'const handleNextCase = \(\) => \{.*?\n  \};\n\n  // Jogador clica'
replacement_next = '''const handleNextCase = () => {
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
  };

  // Jogador clica'''
content = re.sub(pattern_next, replacement_next, content, flags=re.DOTALL)

content = re.sub(r'const handleSelectLevel = \(level: .*?\) => \{.*?\};\n', '', content, flags=re.DOTALL)
content = re.sub(r'const getLevelIcon = \(level: .*?\) => \{.*?\};\n', '', content, flags=re.DOTALL)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
