import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'const totalScore = 900;\s*', '', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content2 = f.read()

content2 = re.sub(
    r'const totalScore = Math\.max\(0, Object\.entries\(answers\)\.reduce\(\(acc, \[caseId, data\]\) => \{\s*const caseData = scamsData\.find\(s => s\.id === caseId\);\s*if \(!caseData\) return acc;\s*return acc \+ data\.xpEarned;\s*\}, 0\)\);',
    '',
    content2,
    flags=re.MULTILINE
)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content2)

print("Done App 2")
