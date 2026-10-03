import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

pattern = r'''  const handleNextCase = \(\) => \{
    sound\.playBlip\(\);
    setExpandedClueId\(null\);
    setFloatingXp\(null\);
    setSelectedVerdict\(null\);
    setSelectedHypothesis\(null\);
    setDrillSelectedOptionId\(null\);
    setDrillSuccess\(false\);
    setDrillBonusAwarded\(false\);

    if \(gameMode === 'dynamic'\) \{
      setDynamicCase\(generateDynamicScamCase\(streak\)\);
      return;
    \}

    if \(currentCaseIndex < levelCases\.length - 1\) \{
      setCurrentCaseIndex\(\(prev\) => prev \+ 1\);
    \} else \{
      if \(currentLevel === 'basico'\) \{
        setCurrentLevel\('medio'\);
        setCurrentCaseIndex\(0\);
      \} else if \(currentLevel === 'medio'\) \{
        setCurrentLevel\('avancado'\);
        setCurrentCaseIndex\(0\);
      \}
    \}
  \};'''

replacement = '''  const handleNextCase = () => {
    sound.playBlip();
    setExpandedClueId(null);
    setFloatingXp(null);
    setSelectedVerdict(null);
    setSelectedHypothesis(null);
    setDrillSelectedOptionId(null);
    setDrillSuccess(false);
    setDrillBonusAwarded(false);
    
    // Auto-scroll to top smoothly when starting a new case
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);

    setDynamicCase(generateDynamicScamCase(streak));
  };'''

content = re.sub(pattern, replacement, content)

# Clean up button text which checks levelCases.length
pattern_btn = r'''\{currentCaseIndex < levelCases\.length - 1\s*\?\s*'Próximo Caso da Investigação'\s*:\s*currentLevel !== 'avancado'\s*\?\s*'Avançar para o Próximo Nível'\s*:\s*'Ver Conclusão da Investigação'\}'''
replacement_btn = r"'Próximo Caso da Investigação'"
content = re.sub(pattern_btn, replacement_btn, content)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
