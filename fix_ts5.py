with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "const totalScore = Math.max(0, Object.entries(answers).reduce" in line:
        skip = True
    if skip and line.strip() == "}, 0));":
        skip = False
        continue
    if not skip:
        new_lines.append(line)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.writelines(new_lines)

print("Done App 5")
