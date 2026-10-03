import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Disable verdict buttons if no clue is discovered
# We look for "grid grid-cols-2 gap-3 pt-1" which contains the buttons
# Then we add a disabled state to those buttons.
# Or simpler: we can just hide the entire verdict block or overlay a "locked" message.

# Let's find:
# {/* Etapa 1: Veredito Principal em 2 Botões Grandes */}
#                 <div className="grid grid-cols-2 gap-3 pt-1">

overlay_locked = """{/* Etapa 1: Veredito Principal em 2 Botões Grandes */}
                {currentCaseDiscovered.length === 0 ? (
                  <div className="p-4 rounded-xl border border-[#ff007f] bg-black/50 text-center animate-pulse">
                    <p className="text-[#ff007f] font-black uppercase text-sm tracking-wider">
                      🔒 Você precisa investigar pelo menos 1 pista (Ferramentas de Investigação acima) antes de dar o Veredito!
                    </p>
                  </div>
                ) : (
                <div className="grid grid-cols-2 gap-3 pt-1">"""

content = content.replace('{/* Etapa 1: Veredito Principal em 2 Botões Grandes */}\n                <div className="grid grid-cols-2 gap-3 pt-1">', overlay_locked)

# And we need to close the `)` we opened with the ternary operator.
# The grid-cols-2 div ends just before:
# {/* Etapa 2: Abre a gaveta de evidências para sustentar o relatório */}
close_ternary = """                </div>
                )}

                {/* Etapa 2: Abre a gaveta de evidências para sustentar o relatório */}"""
content = content.replace('                </div>\n\n                {/* Etapa 2: Abre a gaveta de evidências para sustentar o relatório */}', close_ternary)


# Pulse the Clues (Ferramentas) if 0 discovered
old_clue_container = "className={`bg-[#161617] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-lg transition-all duration-500 ${currentAnswerData?.answered ? 'opacity-40 blur-[2px] grayscale pointer-events-none' : ''}`}"
new_clue_container = "className={`bg-[#161617] border-2 rounded-none p-5 space-y-4 shadow-[4px_4px_0_0_#ff007f] transition-all duration-500 ${currentAnswerData?.answered ? 'opacity-40 blur-[2px] grayscale pointer-events-none' : ''} ${currentCaseDiscovered.length === 0 ? 'border-[#ff007f] dopamine-heartbeat' : 'border-white'}`}"

content = content.replace(old_clue_container, new_clue_container)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)

