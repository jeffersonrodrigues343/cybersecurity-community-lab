import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# 1. Main background and padding changes for Apple Arcade style
content = content.replace(
    'className="lg:col-span-7 bg-[#0a0a0c] max-w-2xl mx-auto border-4 border-[#ff007f] rounded-none overflow-hidden shadow-[8px_8px_0_0_#00ffff] space-y-0 relative"',
    'className="lg:col-span-12 bg-[#1c1c1e] max-w-xl mx-auto rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/[0.05] space-y-0 relative"'
)

# Hide right column
content = content.replace(
    '        {/* COLUNA DIREITA: Dicas Rápidas & Decisão do Detetive (5 colunas) */}\n        <div className="lg:col-span-5 space-y-6">',
    '        {/* COLUNA DIREITA: Escondida */}\n        <div className="hidden">'
)

# Remove bg grid
content = content.replace(
    "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwYTBhMGMiLz48Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMSIgZmlsbD0iIzIyMiIvPjwvc3ZnPg==')]",
    "bg-[#1c1c1e]"
)

# Inject massive minimalist buttons
# Let's inject them RIGHT AFTER the ScenarioAnimation2D tag
# We can find the EXACT string:
# />
# 
# </div>
# </motion.div>
# 
# {/* COLUNA DIREITA

injection_target = "            />\n\n          </div>\n        </motion.div>\n\n        {/* COLUNA DIREITA"

arcade_buttons = """            />

            {/* BOTOES GIGANTES APPLE ARCADE */}
            {!currentAnswerData?.answered ? (
              <div className="p-8 pt-0 flex flex-col space-y-4">
                <button
                  onClick={() => handleClueInvestigate(currentCase.clues[0].id)}
                  className={`w-full py-5 rounded-[24px] font-bold text-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
                    investigatedClues[currentCase.clues[0].id] 
                      ? 'bg-[#2c2c2e] text-white/70 cursor-default'
                      : 'bg-[#ff9f0a] text-black shadow-[0_8px_24px_rgba(255,159,10,0.3)] hover:scale-[1.02]'
                  }`}
                >
                  <Search className="w-6 h-6" />
                  <span>
                    {investigatedClues[currentCase.clues[0].id] 
                      ? currentCase.clues[0].inspection.observation 
                      : 'ME DÁ UMA DICA'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => handleVerdictSelect(true)}
                    className="py-6 rounded-[24px] bg-[#ff3b30] text-white shadow-[0_8px_24px_rgba(255,59,48,0.3)] hover:scale-[1.02] active:scale-[0.96] transition-all flex flex-col items-center justify-center space-y-2"
                  >
                    <ShieldAlert className="w-10 h-10" />
                    <span className="font-bold text-xl tracking-tight">GOLPE!</span>
                  </button>
                  <button
                    onClick={() => handleVerdictSelect(false)}
                    className="py-6 rounded-[24px] bg-[#34c759] text-white shadow-[0_8px_24px_rgba(52,199,89,0.3)] hover:scale-[1.02] active:scale-[0.96] transition-all flex flex-col items-center justify-center space-y-2"
                  >
                    <ShieldCheck className="w-10 h-10" />
                    <span className="font-bold text-xl tracking-tight">SEGURO!</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 pt-0 space-y-6">
                 <div className={`p-6 rounded-[32px] text-white shadow-2xl ${
                      currentAnswerData.isCorrect ? 'bg-[#34c759]' : 'bg-[#ff3b30]'
                    }`}>
                      <h2 className="font-bold text-3xl mb-2 flex items-center gap-2">
                        {currentAnswerData.isCorrect ? '🎯 Mandou Bem!' : '💀 Caiu na Pegadinha!'}
                      </h2>
                      <p className="font-medium text-lg mb-4 opacity-90">
                        {currentCase.explanation}
                      </p>
                      
                      <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-md">
                        <p className="font-bold text-sm mb-1 opacity-80">Regra de Ouro:</p>
                        <p className="font-bold text-lg">{currentCase.realWorldTip}</p>
                      </div>
                  </div>

                  <button
                    onClick={handleNextCase}
                    className="w-full py-6 bg-[#007aff] text-white rounded-[24px] shadow-[0_8px_24px_rgba(0,122,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                  >
                    <span className="font-bold text-2xl tracking-tight">PRÓXIMO CASO</span>
                    <ChevronRight className="w-8 h-8" />
                  </button>
              </div>
            )}

          </div>
        </motion.div>

        {/* COLUNA DIREITA"""

content = content.replace(injection_target, arcade_buttons)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
