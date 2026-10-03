import re
with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

content = content.replace('setTimeLeft(getMaxTimeForCase(currentCase));', '')
content = content.replace('setIsTimedOut(false);', '')
content = re.sub(r'if \(isPressureMode && timeLeft > 0\) \{.*?\}', '', content, flags=re.DOTALL)
content = content.replace('Clock, ', '')

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
