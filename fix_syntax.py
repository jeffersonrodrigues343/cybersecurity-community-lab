import re
with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

content = content.replace('<span>🎲 Sortear Novo Cenário 2D</span>\n              </button>\n            )}', '<span>🎲 Sortear Novo Cenário 2D</span>\n              </button>')

# Also, there's `(` from my previous replacement:
# replacement = r'('
# I replaced `{gameMode === 'campaign' ? ( ... ) : (` with `(` ? No, I need to remove that `(` too. Let's see what is above the button.
