import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'<button\s*onClick=\{\(\) => setIsPressureMode\(!isPressureMode\)\}.*?</button>',
    r'{isBasicoFinished && (<button onClick={() => setIsPressureMode(!isPressureMode)} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${isPressureMode ? \'bg-[#ff3b30]/15 text-[#ff453a] border-[#ff3b30]/35 shadow-sm shadow-red-500/10\' : \'bg-white/[0.04] text-[#86868b] border-white/[0.08] hover:text-white\'}`} title="Alternar Modo Sob Pressão (Cronômetro Tático)"><Clock className={`w-3.5 h-3.5 ${isPressureMode ? \'text-[#ff453a] animate-pulse\' : \'\'}`} /><span className="hidden sm:inline">{isPressureMode ? \'⏱️ Sob Pressão\' : \'🧘 Modo Calmo\'}</span></button>)}',
    content,
    flags=re.DOTALL
)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
