with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

content = content.replace('Zap,', '')
content = content.replace("const [gameMode, setGameMode] = useState<'campaign' | 'dynamic'>('campaign');", "const gameMode = 'dynamic';")

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
