with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "initial={{ width: 0 }}" in line:
        skip = True
    if skip and "</div>" in line:
        pass
    if skip and "{/* CONSOLE PRINCIPAL DESKTOP" in line:
        skip = False
        new_lines.append(line)
        continue
    if not skip:
        new_lines.append(line)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.writelines(new_lines)

