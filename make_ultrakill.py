import re

def apply_ultrakill():
    with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
        content = f.read()

    # Apply the main container styles
    content = re.sub(
        r'className="lg:col-span-12[^"]*"',
        'className="lg:col-span-12 uk-container max-w-2xl mx-auto space-y-0 relative"',
        content,
        count=1
    )
    
    # Header of the card
    content = content.replace('bg-gray-50 border-b border-white/[0.06]', 'uk-panel border-b-4 border-[#ff2a2a]')
    
    # Message content bg
    content = content.replace('bg-[#1c1c1e]', 'bg-[#111] uk-panel border-4 border-[#ff2a2a]')
    
    # Original text box
    content = content.replace('bg-[#0c0c0d] border border-black/[0.05]', 'bg-[#000] border-2 border-dashed border-[#ff2a2a] text-[#ff2a2a]')
    
    # Dilemma
    content = content.replace('bg-gradient-to-r from-[#ff9f0a]/10 to-[#ff9f0a]/5', 'bg-[#440000]')
    content = content.replace('border-[#ff9f0a]/25', 'border-2 border-[#ff2a2a]')
    content = content.replace('text-[#ff9f0a]', 'text-[#ff2a2a]')
    
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
        
    uk_buttons_html = """            {/* ULTRAKILL BUTTONS */}
            {!currentAnswerData?.answered ? (
              <div className="p-6 pt-2 flex flex-col space-y-6">
                <button
                  onClick={() => handleInspectClue(currentCase.clues[0])}
                  className={`w-full py-4 text-2xl font-bold flex items-center justify-center space-x-2 ${
                    currentCaseDiscovered.includes(currentCase.clues[0].id)
                      ? 'uk-panel cursor-default opacity-50'
                      : 'uk-btn-blue'
                  }`}
                >
                  <Search className="w-6 h-6" />
                  <span>
                    {currentCaseDiscovered.includes(currentCase.clues[0].id)
                      ? currentCase.clues[0].inspection.observation 
                      : 'SCAN FOR WEAKNESS'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-6 pt-2 border-t-4 border-[#ff2a2a]">
                  <button
                    onClick={() => {
                        setSelectedVerdict(true);
                        setSelectedHypothesis(0); // auto select
                        setTimeout(() => document.getElementById("hidden-submit")?.click(), 50);
                    }}
                    className="uk-btn-red flex flex-col items-center justify-center space-y-2 py-6"
                  >
                    <ShieldAlert className="w-12 h-12" />
                    <span className="font-bold text-3xl tracking-widest">SCAM!</span>
                  </button>
                  
                  <button
                    onClick={() => {
                        setSelectedVerdict(false);
                        setSelectedHypothesis(0); // auto select
                        setTimeout(() => document.getElementById("hidden-submit")?.click(), 50);
                    }}
                    className="uk-btn-green flex flex-col items-center justify-center space-y-2 py-6"
                  >
                    <ShieldCheck className="w-12 h-12" />
                    <span className="font-bold text-3xl tracking-widest">SAFE!</span>
                  </button>
                  <button id="hidden-submit" onClick={handleProtocolReport} className="hidden">Submit</button>
                </div>
              </div>
            ) : (
              <div className="p-6 pt-2 space-y-6">
                 <div className={`p-6 border-4 ${
                      currentAnswerData.isCorrect ? 'uk-panel border-[#00ff00]' : 'uk-panel border-[#ff2a2a]'
                    }`}>
                      <h2 className={`font-bold text-4xl mb-2 flex items-center gap-2 ${currentAnswerData.isCorrect ? 'text-[#00ff00]' : 'text-[#ff2a2a]'}`}>
                        {currentAnswerData.isCorrect ? 'BLOOD GAINED!' : 'FATAL ERROR!'}
                      </h2>
                      <p className="font-medium text-xl mb-4 text-[#ccc]">
                        {currentCase.explanation}
                      </p>
                      
                      <div className="bg-[#111] p-4 border-2 border-dashed border-[#ff2a2a]">
                        <p className="font-bold text-sm mb-1 text-[#ff2a2a]">TERMINAL DATA:</p>
                        <p className="font-bold text-xl text-[#ccc]">{currentCase.pedagogy.goldenRule}</p>
                      </div>
                  </div>

                  <button
                    onClick={handleNextCase}
                    className="w-full py-4 uk-btn-red text-white flex items-center justify-center space-x-2 font-bold text-3xl"
                  >
                    <span>NEXT TARGET</span>
                    <ChevronRight className="w-8 h-8" />
                  </button>
              </div>
            )}
          </div>
        </motion.div>"""

    if left_col_end in content:
        content = content.replace(left_col_end, uk_buttons_html)
    else:
        # regex fallback
        content = re.sub(
            r'\{\/\* Orientação ao Investigador.*?(?=<\/motion\.div>).*?<\/motion\.div>',
            uk_buttons_html,
            content,
            flags=re.DOTALL
        )
        
    with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    apply_ultrakill()
