import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'<Header\s+score=\{score\}\s+totalScore=\{totalScore\}\s+completedCount=\{completedCount\}\s+onOpenReportModal=\{[^\}]+\}\s+onOpenInstructions=\{[^\}]+\}\s*/>',
    r'<Header score={score} onOpenInstructions={() => setIsOnboardingOpen(true)} />',
    content,
    flags=re.MULTILINE
)
content = re.sub(r'const totalScore = 900;\s*', '', content)
content = re.sub(r'const \[completedCount, setCompletedCount\] = useState\(0\);\s*', '', content)
content = re.sub(r'setCompletedCount\(count\);\s*', '', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

