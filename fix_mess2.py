import re
with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

content = content.replace('TrendingUp,', '')
content = re.sub(r'const levelProgressPercentage = Math\.round\(\(levelFinishedCount / levelCases\.length\) \* 100\);\s*', '', content)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
