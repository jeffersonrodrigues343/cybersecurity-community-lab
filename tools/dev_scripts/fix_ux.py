import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Add lock mechanism to "Bater o Martelo"
# Search for:
# onClick={handleFinalizeInvestigation}
# className="w-full py-6 bg-[#ff007f] text-black border-4 border-white shadow-[6px_6px_0_0_#00ffff] scale-[1.02] active:translate-y-2 active:shadow-none text-xl tracking-widest uppercase font-black -skew-x-3 cursor-pointer"
# (or similar)

# Replace the Bater o Martelo button logic
button_pattern = r'(<button[^>]*onClick=\{handleFinalizeInvestigation\}[^>]*>.*?</button>)'
def replace_button(match):
    original = match.group(1)
    
    # We want to disable it if Object.keys(investigatedClues).length === 0
    # and change the styling.
    
    new_button = '''<button
                    onClick={handleFinalizeInvestigation}
                    disabled={Object.keys(investigatedClues).length === 0}
                    className={`w-full py-6 border-4 scale-[1.02] active:translate-y-2 text-xl tracking-widest uppercase font-black -skew-x-3 transition-all ${
                      Object.keys(investigatedClues).length === 0 
                        ? 'bg-[#333] text-gray-500 border-gray-600 cursor-not-allowed opacity-50' 
                        : 'bg-[#ff007f] text-black border-white shadow-[6px_6px_0_0_#00ffff] cursor-pointer active:shadow-none dopamine-heartbeat'
                    }`}
                  >
                    <span>
                      {Object.keys(investigatedClues).length === 0 
                        ? 'Investigue as pistas 1º' 
                        : 'Bater o Martelo'}
                    </span>
                  </button>'''
    return new_button

content = re.sub(button_pattern, replace_button, content, flags=re.DOTALL)

# Add pulsing effect to the clues if none are investigated
clue_button_pattern = r'className=\{\`w-full text-left rounded-none border-b-4 border-r-4.*?\}\`\}'
def replace_clue(match):
    original = match.group(0)
    # add a pulse effect if no clues are investigated
    new_class = original.replace('}`}', ' ${Object.keys(investigatedClues).length === 0 ? "animate-pulse" : ""}`}')
    return new_class

content = re.sub(clue_button_pattern, replace_clue, content, flags=re.DOTALL)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)

