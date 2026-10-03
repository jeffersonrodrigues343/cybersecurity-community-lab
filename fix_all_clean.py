import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'const handleScoreUpdate = \(newXp: number, count: number, isFinished: boolean\) => \{.*?\}',
    r'const handleScoreUpdate = (newXp: number, count: number, isFinished: boolean) => {\n    setScore(newXp);\n    if (isFinished) {\n      setAllCompleted(true);\n    }\n  };',
    content,
    flags=re.DOTALL
)

content = re.sub(r'isOpen=\{allCompleted \|\| completedCount >= 6\}', 'isOpen={allCompleted}', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'import \{ AnimatedCounter \} from \'./AnimatedCounter\';\s*', '', content)
content = re.sub(r'const playerRank = calculatePlayerRank\(totalScore\);\s*', '', content)
content = re.sub(r'const totalProgressPercentage = Math\.round\(\(totalFinishedCount / totalCases\) \* 100\);\s*', '', content)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
