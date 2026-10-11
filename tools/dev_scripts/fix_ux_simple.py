import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Replace button
old_btn = "onClick={handleFinalizeInvestigation}\n                    className=\"w-full py-6 bg-[#ff007f] text-black border-4 border-white shadow-[6px_6px_0_0_#00ffff] scale-[1.02] active:translate-y-2 active:shadow-none text-xl tracking-widest uppercase font-black -skew-x-3 cursor-pointer\"\n                  >\n                    <span>Bater o Martelo</span>"

new_btn = """onClick={handleFinalizeInvestigation}
                    disabled={Object.keys(investigatedClues).length === 0}
                    className={`w-full py-6 border-4 scale-[1.02] active:translate-y-2 text-xl tracking-widest uppercase font-black -skew-x-3 transition-all ${
                      Object.keys(investigatedClues).length === 0 
                        ? 'bg-[#333] text-gray-500 border-gray-600 cursor-not-allowed opacity-50' 
                        : 'bg-[#ff007f] text-black border-white shadow-[6px_6px_0_0_#00ffff] cursor-pointer active:shadow-none dopamine-heartbeat'
                    }`}
                  >
                    <span>
                      {Object.keys(investigatedClues).length === 0 
                        ? 'Investigue 1 pista antes' 
                        : 'Bater o Martelo'}
                    </span>"""

content = content.replace(old_btn, new_btn)

# Replace clues
old_clue = "className={`w-full text-left rounded-none border-b-4 border-r-4 transition-all duration-75 relative"
new_clue = "className={`w-full text-left rounded-none border-b-4 border-r-4 transition-all duration-75 relative ${Object.keys(investigatedClues).length === 0 ? 'animate-pulse' : ''}"

content = content.replace(old_clue, new_clue)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
