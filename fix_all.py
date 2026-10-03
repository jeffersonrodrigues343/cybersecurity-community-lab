import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Remove totalScore computation if it's unused
content = re.sub(
    r'const totalScore = Math\.max\(0, Object\.entries\(answers\)\.reduce\(\(acc, \[caseId, data\]\) => \{\s*const caseData = scamsData\.find\(s => s\.id === caseId\);\s*if \(!caseData\) return acc;\s*return acc \+ data\.xpEarned;\s*\}, 0\)\);',
    '',
    content,
    flags=re.MULTILINE
)

# Remove calculatePlayerRank import
content = re.sub(
    r'\bcalculatePlayerRank,\s*',
    '',
    content,
    flags=re.MULTILINE
)

# Remove totalFinishedCount
content = re.sub(
    r'const totalFinishedCount = Object\.keys\(answers\)\.length;\s*',
    '',
    content,
    flags=re.MULTILINE
)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)

with open('src/App.tsx', 'r') as f:
    content2 = f.read()

content2 = re.sub(
    r'<Header[^>]+>',
    r'<Header score={totalScore} onOpenInstructions={() => setIsInstructionsOpen(true)} />',
    content2
)

with open('src/App.tsx', 'w') as f:
    f.write(content2)

print("Done")
