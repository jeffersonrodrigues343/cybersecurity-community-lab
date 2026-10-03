import re
with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Completely rewrite handleNextCase
pattern = r'const handleNextCase = \(\) => \{.*?\n  \};\n\n  // Jogador clica'
replacement = '''const handleNextCase = () => {
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

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
