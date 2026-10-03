with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('totalScore={totalScore}', '')
content = content.replace('completedCount={completedCount}', '')
content = content.replace('onOpenReportModal={() => setIsReportOpen(true)}', '')
content = content.replace('onOpenInstructions={() => setIsOnboardingOpen(true)}', 'onOpenInstructions={() => setIsOnboardingOpen(true)}')

with open('src/App.tsx', 'w') as f:
    f.write(content)
