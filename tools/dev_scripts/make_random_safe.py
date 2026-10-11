import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Replace the whole left side of the top bar (Modes and Levels) with just a title
pattern_to_remove = r'<div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-center lg:justify-start">.*?</div>\s*</div>\s*\{/\* Patente Atual'
replacement = '''<div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-center lg:justify-start">
            <div className="flex items-center space-x-1 p-1 rounded-full bg-black/60 border border-white/[0.08]">
              <div className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 bg-gradient-to-r from-[#bf5af2] to-[#2997ff] text-white shadow-md shadow-purple-500/20">
                <Sparkles className="w-3.5 h-3.5 text-[#ff9f0a]" />
                <span>Simulador Aleatório</span>
              </div>
            </div>
          </div>
          {/* Patente Atual'''
content = re.sub(pattern_to_remove, replacement, content, flags=re.DOTALL)

# Replace currentCase logic
content = content.replace(
    '''  const currentCase: ScamCase =
    gameMode === 'dynamic' ? dynamicCase : (levelCases[currentCaseIndex] || levelCases[0]);''',
    '''  const currentCase: ScamCase = dynamicCase;'''
)

# Update handleNextCase to ignore level cases
# Find the whole handleNextCase function
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

# Remove the unused handleSelectLevel and getLevelIcon
content = re.sub(r'const handleSelectLevel = \(level: ScamLevel\) => \{.*?\};\n', '', content, flags=re.DOTALL)
content = re.sub(r'const getLevelIcon = \(level: ScamLevel\) => \{.*?\};\n', '', content, flags=re.DOTALL)

# In handleSelectLevel we used SCAM_CASES and currentLevel and currentCaseIndex which are now unused?
# Let's see if we get TS errors.

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)

