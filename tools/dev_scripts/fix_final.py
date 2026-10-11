with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    lines = f.readlines()

out = []
skip = False
for line in lines:
    if 'import { SCAM_CASES, BADGES, ScamLevel' in line:
        line = line.replace('SCAM_CASES, ', '').replace('ScamLevel', '')
        # maybe we need BADGES
    
    if '<div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-center lg:justify-start">' in line:
        skip = True
        out.append(line)
        out.append('            <span className="text-white font-bold text-sm flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[#bf5af2]" /> Simulador Aleatório</span>\n')
        continue
    
    if skip and '{/* Patente Atual do Jogador, Combo Streak & Modo Sob Pressão */}' in line:
        skip = False
        out.append('          </div>\n\n')
        out.append(line)
        continue
    
    if skip:
        continue
        
    out.append(line)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.writelines(out)
