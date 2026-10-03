import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'const totalScore = Math\.max\(0, Object\.entries\(answers\)\.reduce\(\(acc, \[caseId, data\]\) => \{\n\s*if \(\!data\.isCorrect\) \{\n\s*return acc - \(data\.penaltyXp \|\| 0\);\n\s*\}\n\s*const found = SCAM_CASES\.find\(\(c\) => c\.id === caseId\);\n\s*const baseReward = data\.hypothesisCorrect !== false \? \(found\?\.xpReward \|\| 0\) : Math\.round\(\(found\?\.xpReward \|\| 0\) \* 0\.5\);\n\s*return acc \+ baseReward \+ \(data\.pressureBonus \|\| 0\) \+ \(data\.streakBonus \|\| 0\);\n\s*\}, 0\)\);',
    '',
    content,
    flags=re.MULTILINE
)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)

print("Done App 3")
