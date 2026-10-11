import re
import sys

def apply_premium():
    with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
        content = f.read()

    # Apply the Apple glass and card effects to the main wrapper
    content = re.sub(
        r'className="lg:col-span-12[^"]*max-w-2xl mx-auto[^"]*border-4 border-\[#ff007f\].*?"',
        'className="lg:col-span-12 apple-card max-w-xl mx-auto overflow-hidden relative apple-interactive-card"',
        content
    )

    # Change the inner incident container to clear glass
    content = re.sub(
        r'className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-\[#1c1c1e\]"',
        'className="p-6 sm:p-8 space-y-6 bg-transparent"',
        content
    )
    
    # Change the original text box to frosted glass
    content = re.sub(
        r'bg-\[#0c0c0d\] border border-black/\[0\.05\]',
        'apple-glass border-0',
        content
    )

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
        
    premium_buttons_html = """            {/* PREMIUM APPLE ARCADE CONTROLS */}
            {!currentAnswerData?.answered ? (
              <div className="p-8 pt-2 flex flex-col space-y-4">
                <button
                  onClick={() => handleInspectClue(currentCase.clues[0])}
                  className={`w-full py-4 rounded-[20px] font-bold text-[15px] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
                    currentCaseDiscovered.includes(currentCase.clues[0].id)
                      ? 'bg-white/[0.08] text-white/50 cursor-default'
                      : 'apple-sheen-box bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <Search className="w-5 h-5" />
                  <span>
                    {currentCaseDiscovered.includes(currentCase.clues[0].id)
                      ? currentCase.clues[0].inspection.observation 
                      : '🔍 ME DÁ UMA DICA'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                        setSelectedVerdict(true);
                        setSelectedHypothesis(0); // auto select
                        setTimeout(() => document.getElementById("hidden-submit")?.click(), 50);
                    }}
                    className="apple-btn-red flex flex-col items-center justify-center space-y-1.5 h-28 apple-interactive-card rounded-[24px]"
                  >
                    <ShieldAlert className="w-8 h-8" />
                    <span className="font-bold text-lg tracking-tight">É GOLPE!</span>
                  </button>
                  
                  <button
                    onClick={() => {
                        setSelectedVerdict(false);
                        setSelectedHypothesis(0); // auto select
                        setTimeout(() => document.getElementById("hidden-submit")?.click(), 50);
                    }}
                    className="bg-[#30d158] text-white flex flex-col items-center justify-center space-y-1.5 h-28 apple-interactive-card rounded-[24px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_6px_18px_rgba(48,209,88,0.35)]"
                  >
                    <ShieldCheck className="w-8 h-8" />
                    <span className="font-bold text-lg tracking-tight">TÁ SEGURO!</span>
                  </button>
                  <button id="hidden-submit" onClick={handleProtocolReport} className="hidden">Submit</button>
                </div>
              </div>
            ) : (
              <div className="p-8 pt-0 space-y-6">
                 <div className={`p-6 rounded-[28px] text-white apple-interactive-card border border-white/20 ${
                      currentAnswerData.isCorrect ? 'bg-[#30d158]/20 apple-glass' : 'bg-[#ff3b30]/20 apple-glass'
                    }`}>
                      <h2 className="font-bold text-2xl mb-2 flex items-center gap-2 text-white">
                        {currentAnswerData.isCorrect ? '🎯 Mandou Bem!' : '💀 Caiu na Pegadinha!'}
                      </h2>
                      <p className="font-medium text-[15px] mb-4 opacity-90 text-white/90">
                        {currentCase.explanation}
                      </p>
                      
                      <div className="bg-black/30 p-4 rounded-2xl border border-white/10">
                        <p className="font-bold text-xs mb-1 opacity-70 uppercase tracking-wider text-white">Regra de Ouro:</p>
                        <p className="font-bold text-base text-white">{currentCase.pedagogy.goldenRule}</p>
                      </div>
                  </div>

                  <button
                    onClick={handleNextCase}
                    className="w-full py-4 apple-btn-blue text-white rounded-full flex items-center justify-center space-x-2"
                  >
                    <span className="font-bold text-lg tracking-tight">PRÓXIMO CASO</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
              </div>
            )}
          </div>
        </motion.div>"""

    if left_col_end in content:
        content = content.replace(left_col_end, premium_buttons_html)
    else:
        # regex fallback
        content = re.sub(
            r'\{\/\* Orientação ao Investigador.*?(?=<\/motion\.div>).*?<\/motion\.div>',
            premium_buttons_html,
            content,
            flags=re.DOTALL
        )
        
    with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    apply_premium()
