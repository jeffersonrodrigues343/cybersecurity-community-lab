import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# We will replace the entire render block of the case investigation.
# We need to find the start of the `<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative">`
# and replace it.

start_marker = '<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative">'
end_marker = '{/* MODAL 1: Sala de Conquistas (Desktop Modal)              */}'

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    new_layout = """<div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center space-y-8 min-h-[60vh] py-10">
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentCase.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="w-full flex flex-col items-center space-y-6"
            >
              
              {/* O CELULAR / A MENSAGEM (Foco Único) */}
              <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0_0_#ff007f] border-4 border-black text-black">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b-2 border-black/10">
                  <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-xl uppercase leading-none">{currentCase.sender}</h2>
                    <p className="text-sm font-bold text-gray-500 uppercase">{currentCase.channel} • {currentCase.time}</p>
                  </div>
                </div>
                
                <div className="whitespace-pre-wrap font-bold text-lg sm:text-xl leading-relaxed font-sans">
                  {currentCase.messageContent}
                </div>
              </div>

              {/* DICA ÚNICA (Caso o usuário precise) */}
              {!currentAnswerData?.answered && (
                <button
                  onClick={() => handleClueInvestigate(currentCase.clues[0].id)}
                  className={`w-full max-w-md py-4 rounded-full border-4 border-black font-black uppercase tracking-widest text-lg transition-all ${
                    investigatedClues[currentCase.clues[0].id] 
                      ? 'bg-yellow-300 text-black translate-y-1 shadow-none'
                      : 'bg-yellow-400 text-black shadow-[4px_4px_0_0_#ff007f] hover:-translate-y-1 active:translate-y-1 active:shadow-none animate-pulse'
                  }`}
                >
                  {investigatedClues[currentCase.clues[0].id] 
                    ? currentCase.clues[0].inspection.observation 
                    : '🔍 PEDIR UMA DICA'}
                </button>
              )}

              {/* BOTÕES GIGANTES DE RESPOSTA */}
              <div className="w-full grid grid-cols-2 gap-4">
                {!currentAnswerData?.answered ? (
                  <>
                    <button
                      onClick={() => handleVerdictSelect(true)}
                      className="py-8 bg-red-500 text-white border-4 border-black shadow-[6px_6px_0_0_black] hover:-translate-y-2 active:translate-y-2 active:shadow-none transition-all rounded-2xl flex flex-col items-center justify-center space-y-2"
                    >
                      <ShieldAlert className="w-12 h-12" />
                      <span className="font-black text-2xl uppercase">É GOLPE!</span>
                    </button>
                    
                    <button
                      onClick={() => handleVerdictSelect(false)}
                      className="py-8 bg-green-500 text-white border-4 border-black shadow-[6px_6px_0_0_black] hover:-translate-y-2 active:translate-y-2 active:shadow-none transition-all rounded-2xl flex flex-col items-center justify-center space-y-2"
                    >
                      <ShieldCheck className="w-12 h-12" />
                      <span className="font-black text-2xl uppercase">É SEGURO!</span>
                    </button>
                  </>
                ) : (
                  <div className="col-span-2 space-y-6">
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
                      <span className="font-black text-2xl uppercase tracking-widest">PRÓXIMO CASO</span>
                      <ChevronRight className="w-8 h-8 font-black" />
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          </AnimatePresence>

        </div>

      """
    
    new_content = content[:start_idx] + new_layout + content[end_idx:]
    
    # We also need to add 'User' icon from lucide-react if not present
    if 'User,' not in new_content and 'User ' not in new_content:
        new_content = new_content.replace('import { Search, ', 'import { User, Search, ')
        
    with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
        f.write(new_content)
