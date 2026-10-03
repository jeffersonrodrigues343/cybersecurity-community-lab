import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

start_str = "const totalScore = Math.max("
start_idx = content.find(start_str)
if start_idx != -1:
    end_idx = content.find(");", start_idx) + 2
    content = content[:start_idx] + content[end_idx:]

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)

print("Done App 4")
