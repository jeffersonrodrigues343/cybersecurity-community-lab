import re
with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Replace the bolinhas block
pattern = r'\{gameMode === \'campaign\' \? \(.*?\) : \('
replacement = r'('
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
