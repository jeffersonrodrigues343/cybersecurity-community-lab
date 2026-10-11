import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Pass streak to handleNextCase
content = content.replace('setDynamicCase(generateDynamicScamCase());', 'setDynamicCase(generateDynamicScamCase(streak));')

# Remove the sortear button block completely
pattern = r'<button\s*onClick=\{\(\) => \{\s*sound\.playBlip\(\);\s*setDynamicCase\(generateDynamicScamCase\(streak\)\);\s*setExpandedClueId\(null\);\s*setFloatingXp\(null\);\s*setSelectedVerdict\(null\);\s*setSelectedHypothesis\(null\);\s*setDrillSelectedOptionId\(null\);\s*setDrillSuccess\(false\);\s*setDrillBonusAwarded\(false\);\s*\}\}\s*className="px-3 py-1\.5 rounded-full bg-gradient-to-r from-\[#bf5af2\] to-\[#2997ff\] text-white text-xs font-semibold flex items-center gap-1\.5 transition cursor-pointer shadow-md shadow-purple-500/20 hover:opacity-95"\s*>\s*<RotateCcw className="w-3\.5 h-3\.5" />\s*<span>🎲 Sortear Novo Cenário 2D</span>\s*</button>'
content = re.sub(pattern, '', content, flags=re.DOTALL)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
