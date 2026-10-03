import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Make the left column take the full width instead of 7 cols
content = content.replace('className="lg:col-span-7 bg-[#0a0a0c]', 'className="lg:col-span-12 bg-[#0a0a0c] max-w-2xl mx-auto')

# Hide the title / header of the Bento card to reduce info
content = content.replace('className="p-4 sm:p-6 bg-[#ff007f] border-b-4 border-white flex flex-col', 'className="hidden p-4 sm:p-6 bg-[#ff007f] border-b-4 border-white flex flex-col')

# Hide the little category chips (Dilema, etc.)
content = content.replace('<div className="flex flex-wrap gap-2 pt-2">', '<div className="hidden">')

# Hide the right column entirely (Ferramentas, etc.)
# Find `{/* COLUNA DIREITA:`
content = content.replace('{/* COLUNA DIREITA: Ferramentas de Investigação & Decisão do Detetive (5 colunas) */}', '{/* COLUNA DIREITA: Escondida para simplificar */}\n        <div className="hidden">')
# This will hide everything inside that column, including the Bater o Martelo!

# So we must add the giant buttons directly inside the Left Column, just below the message.
new_buttons = """
            </div>

            {/* BOTOES GIGANTES PRA IDIOTA VER */}
            {!currentAnswerData?.answered ? (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleVerdictSelect(true)}
                  className="w-full py-8 bg-red-500 text-white border-4 border-black shadow-[6px_6px_0_0_black] hover:-translate-y-2 active:translate-y-2 active:shadow-none transition-all rounded-2xl flex flex-col items-center justify-center space-y-2"
                >
                  <ShieldAlert className="w-10 h-10" />
                  <span className="font-black text-3xl uppercase tracking-widest">É GOLPE!</span>
                </button>
                <button
                  onClick={() => handleVerdictSelect(false)}
                  className="w-full py-8 bg-green-500 text-white border-4 border-black shadow-[6px_6px_0_0_black] hover:-translate-y-2 active:translate-y-2 active:shadow-none transition-all rounded-2xl flex flex-col items-center justify-center space-y-2"
                >
                  <ShieldCheck className="w-10 h-10" />
                  <span className="font-black text-3xl uppercase tracking-widest">TÁ SEGURO!</span>
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-6 bg-[#1a1a1c]">
                 <div className={`p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0_0_black] text-black ${
                      currentAnswerData.isCorrect ? 'bg-green-400' : 'bg-red-400'
                    }`}>
                      <h2 className="font-black text-3xl uppercase mb-2">
                        {currentAnswerData.isCorrect ? '🎯 ACERTOU EM CHEIO!' : '💀 CAIU NO GOLPE!'}
                      </h2>
                      <p className="font-bold text-xl mb-4">
                        {currentCase.explanation}
                      </p>
                      
                      <div className="bg-black/10 p-4 rounded-xl border-2 border-black">
                        <p className="font-black uppercase text-sm mb-1">Regra Número 1:</p>
                        <p className="font-bold text-lg">{currentCase.realWorldTip}</p>
                      </div>
                  </div>

                  <button
                    onClick={handleNextCase}
                    className="w-full py-6 bg-[#00ffff] text-black border-4 border-black shadow-[6px_6px_0_0_#ff007f] hover:-translate-y-2 active:translate-y-2 active:shadow-none transition-all rounded-full flex items-center justify-center space-x-2"
                  >
                    <span className="font-black text-2xl uppercase tracking-widest">BORA PRO PRÓXIMO</span>
                  </button>
              </div>
            )}
          </div>
"""

# Replace the closing of the Bento Card with our new buttons.
# The bento card closes with `</div>\n          </motion.div>\n\n        {/* COLUNA DIREITA:`
content = content.replace('</div>\n          </motion.div>\n\n        {/* COLUNA DIREITA: Escondida', new_buttons + '\n          </motion.div>\n\n        {/* COLUNA DIREITA: Escondida')

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)

