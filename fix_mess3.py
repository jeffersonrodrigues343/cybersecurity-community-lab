import re
with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'const levelFinishedCount = levelCases\.filter\(\(c\) => answers\[c\.id\]\?\.answered\)\.length;\s*', '', content)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
