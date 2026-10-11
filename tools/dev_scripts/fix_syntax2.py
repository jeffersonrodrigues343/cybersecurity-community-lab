with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

content = content.replace('<span>🎲 Sortear Novo Cenário 2D</span>\n              </button>\n            )}', '<span>🎲 Sortear Novo Cenário 2D</span>\n              </button>')

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
