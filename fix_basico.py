import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# I will find `const currentLevel = currentCase.difficulty;` and add it before that
if 'const isBasicoFinished = ' not in content:
    content = content.replace(
        'const currentLevel = currentCase.difficulty;',
        'const totalFinishedCount = Object.keys(answers).length;\n  const isBasicoFinished = totalFinishedCount >= 3;\n  const currentLevel = currentCase.difficulty;'
    )

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
