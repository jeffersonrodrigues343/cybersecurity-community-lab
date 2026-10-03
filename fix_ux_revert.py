import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Revert Clue Box Pulse
old_clue_container = "className={`bg-[#161617] border-2 rounded-none p-5 space-y-4 shadow-[4px_4px_0_0_#ff007f] transition-all duration-500 ${currentAnswerData?.answered ? 'opacity-40 blur-[2px] grayscale pointer-events-none' : ''} ${currentCaseDiscovered.length === 0 ? 'border-[#ff007f] dopamine-heartbeat' : 'border-white'}`}"
new_clue_container = "className={`bg-[#161617] border-2 border-white rounded-none p-5 space-y-4 shadow-[4px_4px_0_0_#ff007f] transition-all duration-500 ${currentAnswerData?.answered ? 'opacity-40 blur-[2px] grayscale pointer-events-none' : ''}`}"
content = content.replace(old_clue_container, new_clue_container)

# Revert Verdict Lock
# We want to remove the locked overlay and the ternary operator.
# Search for the block starting with:
# {/* Etapa 1: Veredito Principal em 2 Botões Grandes */}
#                 {currentCaseDiscovered.length === 0 ? (
# ... ) : ( <div className="grid grid-cols-2 gap-3 pt-1">

overlay_locked = """{/* Etapa 1: Veredito Principal em 2 Botões Grandes */}
                {currentCaseDiscovered.length === 0 ? (
                  <div className="p-4 rounded-xl border border-[#ff007f] bg-black/50 text-center animate-pulse">
                    <p className="text-[#ff007f] font-black uppercase text-sm tracking-wider">
                      🔒 Você precisa investigar pelo menos 1 pista (Ferramentas de Investigação acima) antes de dar o Veredito!
                    </p>
                  </div>
                ) : (
                <div className="grid grid-cols-2 gap-3 pt-1">"""

unlocked_block = """{/* Etapa 1: Veredito Principal em 2 Botões Grandes */}
                <div className="grid grid-cols-2 gap-3 pt-1">"""

content = content.replace(overlay_locked, unlocked_block)

# And remove the closing brace of the ternary operator
close_ternary = """                </div>
                )}

                {/* Etapa 2: Abre a gaveta de evidências para sustentar o relatório */}"""
                
open_ternary = """                </div>

                {/* Etapa 2: Abre a gaveta de evidências para sustentar o relatório */}"""

content = content.replace(close_ternary, open_ternary)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
