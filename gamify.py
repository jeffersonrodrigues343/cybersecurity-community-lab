import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Corte 1: ScamSimulatorGame.tsx barra superior (pílula de patente duplicada)
content = re.sub(
    r'<div className="flex items-center space-x-1\.5 px-3 py-1 rounded-full bg-white/\[0\.06\] border border-white/\[0\.08\] text-xs text-white shadow-sm">\s*<span>\{playerRank\.icon\}</span>\s*<span className="font-medium text-\[#f5f5f7\]">\{playerRank\.name\}</span>\s*<span className="text-\[#86868b\]">•</span>\s*<AnimatedCounter value=\{totalScore\} className="font-semibold text-\[#2997ff\]" suffix=" XP" />\s*</div>',
    '',
    content,
    flags=re.MULTILINE
)

# Corte 2: ScamSimulatorGame.tsx barra superior (linha "x/y no nível (%) • Trilha Geral…")
content = re.sub(
    r'\{levelFinishedCount\}/\{levelCases\.length\} no nível \(\{levelProgressPercentage\}%\) • Trilha Geral: \{totalFinishedCount\}/\{totalCases\} \(\{totalProgressPercentage\}%\)',
    '',
    content,
    flags=re.MULTILINE
)

# Corte 3: ScamSimulatorGame.tsx cartão do caso (chip "+XP Base")
content = re.sub(
    r'<span className="text-xs font-semibold text-\[#30d158\] bg-\[#30d158\]/10 px-3 py-1 rounded-full border border-\[#30d158\]/20 flex items-center gap-1">\s*<Sparkles className="w-3 h-3 text-\[#30d158\]" />\s*\+\{currentCase\.xpReward\} XP Base\s*</span>',
    '',
    content,
    flags=re.MULTILINE
)

# Corte 4: ScamSimulatorGame.tsx caixa "Use as Ferramentas de Investigação ao lado…"
content = re.sub(
    r'<div className="bg-\[#2997ff\]/10 border border-\[#2997ff\]/20 rounded-xl p-3 flex items-start gap-2\.5 text-xs text-\[#d2d2d7\]">\s*<Search className="w-4 h-4 text-\[#2997ff\] flex-shrink-0" />\s*<span className="leading-relaxed">\s*Use as <strong className="text-white">Ferramentas de Investigação</strong> ao lado para auditar dados, titulares e canais antes de emitir seu veredito\.\s*</span>\s*</div>',
    '',
    content,
    flags=re.MULTILINE
)

# Corte 5: ScamSimulatorGame.tsx ferramentas texto repetido "Telemetria pericial extraída…"
content = re.sub(
    r'<span>Telemetria pericial extraída\. Compare estes registros com o teor da mensagem para tirar suas conclusões\.</span>',
    '',
    content,
    flags=re.MULTILINE
)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)

with open('src/components/ScenarioAnimation2D.tsx', 'r') as f:
    content2 = f.read()

# Corte 6: ScenarioAnimation2D.tsx Sai o chip "Toque nos elementos para periciar"
content2 = re.sub(
    r'<span className="text-\[10px\] text-\[#86868b\] bg-white/\[0\.04\] px-2 py-0\.5 rounded-full border border-white/\[0\.06\]">\s*Toque nos elementos para periciar\s*</span>',
    '',
    content2,
    flags=re.MULTILINE
)

# Corte 7: ScenarioAnimation2D.tsx Sai o título "Teatro 2D • …"
content2 = re.sub(
    r'<span>Teatro 2D • Cenário Narrativo do Caso</span>',
    '',
    content2,
    flags=re.MULTILINE
)

with open('src/components/ScenarioAnimation2D.tsx', 'w') as f:
    f.write(content2)

print("Done")
