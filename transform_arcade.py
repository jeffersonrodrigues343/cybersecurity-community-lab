import re
import sys

def transform_file():
    with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
        content = f.read()

    # 1. Fix the main card class
    content = re.sub(
        r'className="lg:col-span-12[^"]*max-w-2xl mx-auto[^"]*border-4 border-\[#ff007f\].*?"',
        'className="lg:col-span-12 bg-[#f5f5f7] max-w-2xl mx-auto rounded-[40px] overflow-hidden shadow-2xl border border-gray-200 space-y-0 relative"',
        content
    )

    # 2. Fix the nested inner bg to be clean
    content = re.sub(
        r'bg-\[#1c1c1e\]',
        'bg-white',
        content
    )
    content = re.sub(
        r'bg-\[#0c0c0d\]',
        'bg-gray-50',
        content
    )
    
    # 3. Add the big buttons to the left column
    left_col_end = """            {/* Orientação ao Investigador (Sem Spoilers) */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs text-[#007AFF]">
              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2">
                <Search className="w-4 h-4 text-[#2997ff] flex-shrink-0" />
                <span className="leading-relaxed">
                  Use as <strong className="text-black">Dicas Rápidas</strong> ao lado para auditar dados, titulares e canais antes de emitir seu veredito.
                </span>
              </div>
            </div>
          </div>
        </motion.div>"""
        
    buttons_html = """            {/* BOTOES GIGANTES APPLE ARCADE STYLE */}
            {!currentAnswerData?.answered ? (
              <div className="p-6 pt-2 flex flex-col space-y-4">
                <button
                  onClick={() => handleInspectClue(currentCase.clues[0])}
                  className={`w-full py-5 rounded-[24px] font-bold text-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
                    currentCaseDiscovered.includes(currentCase.clues[0].id)
                      ? 'bg-gray-200 text-gray-500 cursor-default'
                      : 'bg-[#ff9f0a] text-white shadow-[0_8px_24px_rgba(255,159,10,0.3)] hover:scale-[1.02]'
                  }`}
                >
                  <Search className="w-6 h-6" />
                  <span>
                    {currentCaseDiscovered.includes(currentCase.clues[0].id)
                      ? currentCase.clues[0].inspection.observation 
                      : '🔍 ME DÁ UMA DICA'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => {
                        setSelectedVerdict(true);
                        setSelectedHypothesis(0); // auto select first to bypass logic
                        setTimeout(() => document.getElementById("hidden-submit")?.click(), 50);
                    }}
                    className="py-6 rounded-[24px] bg-[#ff3b30] text-white shadow-[0_8px_24px_rgba(255,59,48,0.3)] hover:scale-[1.02] active:scale-[0.96] transition-all flex flex-col items-center justify-center space-y-2"
                  >
                    <ShieldAlert className="w-10 h-10" />
                    <span className="font-bold text-xl tracking-tight">É GOLPE!</span>
                  </button>
                  <button
                    onClick={() => {
                        setSelectedVerdict(false);
                        setSelectedHypothesis(0); // auto select first
                        setTimeout(() => document.getElementById("hidden-submit")?.click(), 50);
                    }}
                    className="py-6 rounded-[24px] bg-[#34c759] text-white shadow-[0_8px_24px_rgba(52,199,89,0.3)] hover:scale-[1.02] active:scale-[0.96] transition-all flex flex-col items-center justify-center space-y-2"
                  >
                    <ShieldCheck className="w-10 h-10" />
                    <span className="font-bold text-xl tracking-tight">TÁ SEGURO!</span>
                  </button>
                  <button id="hidden-submit" onClick={handleProtocolReport} className="hidden">Submit</button>
                </div>
              </div>
            ) : (
              <div className="p-6 pt-2 space-y-6">
                 <div className={`p-6 rounded-[32px] text-white shadow-xl ${
                      currentAnswerData.isCorrect ? 'bg-[#34c759]' : 'bg-[#ff3b30]'
                    }`}>
                      <h2 className="font-bold text-3xl mb-2 flex items-center gap-2">
                        {currentAnswerData.isCorrect ? '🎯 Mandou Bem!' : '💀 Caiu na Pegadinha!'}
                      </h2>
                      <p className="font-medium text-lg mb-4 opacity-90">
                        {currentCase.explanation}
                      </p>
                      
                      <div className="bg-black/10 p-4 rounded-2xl backdrop-blur-md">
                        <p className="font-bold text-sm mb-1 opacity-80">Avisa os coroas (Regra de Ouro):</p>
                        <p className="font-bold text-lg">{currentCase.pedagogy.goldenRule}</p>
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
        </motion.div>"""

    if left_col_end in content:
        content = content.replace(left_col_end, buttons_html)
        print("Replaced left col end with big buttons.")
    else:
        print("Warning: left col end not found! Attempting regex...")
        # fallback
        content = re.sub(
            r'\{\/\* Orientação ao Investigador.*?(?=<\/motion\.div>).*?<\/motion\.div>',
            buttons_html,
            content,
            flags=re.DOTALL
        )

    with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
        f.write(content)
        
    print("Done transforming.")

if __name__ == '__main__':
    transform_file()
