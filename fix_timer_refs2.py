import re
with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'const getMaxTimeForCase = \(c: ScamCase\): number => \{.*?\};\n', '', content, flags=re.DOTALL)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
