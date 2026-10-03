import re

def fix_css():
    with open('src/index.css', 'r') as f:
        content = f.read()

    # Make it light theme
    content = re.sub(r'--apple-bg: #000000;', '--apple-bg: #f5f5f7;', content)
    content = re.sub(r'--apple-surface: #161617;', '--apple-surface: #ffffff;', content)
    content = re.sub(r'--apple-card: #1c1c1e;', '--apple-card: #ffffff;', content)
    content = re.sub(r'--apple-text-primary: #f5f5f7;', '--apple-text-primary: #1d1d1f;', content)
    
    # Body
    body_regex = r'body\s*\{[^}]*\}'
    new_body = '''body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: #f5f5f7;
    color: #1d1d1f;
    overflow-x: hidden;
    letter-spacing: -0.014em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }'''
    content = re.sub(body_regex, new_body, content)
    
    # Remove Bebas Neue
    content = re.sub(
        r'font-family:\s*"Bebas Neue",\s*cursive;',
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n    font-weight: 700;',
        content
    )

    with open('src/index.css', 'w') as f:
        f.write(content)

def fix_tsx():
    with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
        content = f.read()

    # Reset main card
    content = re.sub(
        r'className="lg:col-span-12[^"]*"',
        'className="lg:col-span-12 bg-white max-w-2xl mx-auto rounded-[40px] shadow-[0_24px_48px_rgba(0,0,0,0.06)] border border-black/[0.04] overflow-hidden space-y-0 relative"',
        content,
        count=1
    )

    # Change inner backgrounds to light theme
    content = content.replace('bg-[#1c1c1e]', 'bg-white')
    content = content.replace('bg-gray-50 border-b border-white/[0.06]', 'bg-[#f5f5f7] border-b border-black/[0.04]')
    content = content.replace('text-black', 'text-[#1d1d1f]')
    
    # Dilemma box
    content = content.replace('bg-gradient-to-r from-[#ff9f0a]/10 to-[#ff9f0a]/5', 'bg-[#ff9f0a]/10')
    content = content.replace('border-[#ff9f0a]/25', 'border-0')

    # Original Text Box (frosted / clean)
    content = content.replace('bg-[#0c0c0d] border border-black/[0.05]', 'bg-[#f5f5f7] border-0')
    
    # Replace premium Apple buttons HTML with super clean light UI ones
    buttons_start = content.find('{/* PREMIUM APPLE ARCADE CONTROLS */}')
    buttons_end = content.find('</motion.div>', buttons_start)
    
    if buttons_start != -1 and buttons_end != -1:
        new_buttons = """{/* CLEAN APPLE APP STORE CONTROLS */}
            {!currentAnswerData?.answered ? (
              <div className="p-8 pt-4 flex flex-col space-y-4">
                <button
                  onClick={() => handleInspectClue(currentCase.clues[0])}
                  className={`w-full py-5 rounded-[24px] font-bold text-[17px] tracking-tight flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
                    currentCaseDiscovered.includes(currentCase.clues[0].id)
                      ? 'bg-[#f5f5f7] text-[#86868b] cursor-default'
                      : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                  }`}
                >
                  <Search className="w-5 h-5" />
                  <span>
                    {currentCaseDiscovered.includes(currentCase.clues[0].id)
                      ? currentCase.clues[0].inspection.observation 
                      : '🔍 ME DÁ UMA DICA'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/[0.04]">
                  <button
                    onClick={() => {
                        setSelectedVerdict(true);
                        setSelectedHypothesis(0); // auto select
                        setTimeout(() => document.getElementById("hidden-submit")?.click(), 50);
                    }}
                    className="bg-[#ff3b30] text-white flex flex-col items-center justify-center space-y-1.5 h-28 rounded-[24px] shadow-[0_8px_16px_rgba(255,59,48,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
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
                    className="bg-[#34c759] text-white flex flex-col items-center justify-center space-y-1.5 h-28 rounded-[24px] shadow-[0_8px_16px_rgba(52,199,89,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    <ShieldCheck className="w-8 h-8" />
                    <span className="font-bold text-lg tracking-tight">TÁ SEGURO!</span>
                  </button>
                  <button id="hidden-submit" onClick={handleProtocolReport} className="hidden">Submit</button>
                </div>
              </div>
            ) : (
              <div className="p-8 pt-0 space-y-6">
                 <div className={`p-8 rounded-[32px] text-white shadow-xl ${
                      currentAnswerData.isCorrect ? 'bg-[#34c759]' : 'bg-[#ff3b30]'
                    }`}>
                      <h2 className="font-bold text-2xl mb-2 flex items-center gap-2 text-white">
                        {currentAnswerData.isCorrect ? '🎯 Mandou Bem!' : '💀 Caiu na Pegadinha!'}
                      </h2>
                      <p className="font-medium text-[16px] mb-6 opacity-95 text-white/95">
                        {currentCase.explanation}
                      </p>
                      
                      <div className="bg-white/20 p-5 rounded-2xl backdrop-blur-md border border-white/20">
                        <p className="font-bold text-xs mb-1 opacity-90 uppercase tracking-wider text-white">Regra de Ouro:</p>
                        <p className="font-bold text-lg text-white">{currentCase.pedagogy.goldenRule}</p>
                      </div>
                  </div>

                  <button
                    onClick={handleNextCase}
                    className="w-full py-5 bg-[#007aff] text-white rounded-full flex items-center justify-center space-x-2 font-bold text-[17px] shadow-[0_8px_16px_rgba(0,122,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    <span>PRÓXIMO CASO</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
              </div>
            )}
          </div>
"""
        content = content[:buttons_start] + new_buttons + content[buttons_end:]

    with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    fix_css()
    fix_tsx()
