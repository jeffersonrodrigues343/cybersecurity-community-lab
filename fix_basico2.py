import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '  const currentAnswerData = answers[currentCase.id];',
    '  const currentAnswerData = answers[currentCase.id];\n  const totalFinishedCount = Object.keys(answers).length;\n  const isBasicoFinished = totalFinishedCount >= 3;'
)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
