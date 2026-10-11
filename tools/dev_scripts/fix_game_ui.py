import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Make the Bater o Martelo button pulse when enabled
content = content.replace(
    '''onClick={handleProtocolReport}
                    className={`w-full py-3.5 px-4 rounded-full font-bold text-xs flex items-center justify-center space-x-2 transition ${
                      selectedHypothesis !== null
                        ? 'bg-gradient-to-r from-[#bf5af2] to-[#2997ff] text-white shadow-lg shadow-purple-500/25 hover:opacity-90'
                        : 'bg-white/[0.05] text-[#86868b] cursor-not-allowed border border-white/[0.05]'
                    }`}''',
    '''onClick={handleProtocolReport}
                    className={`w-full py-4 px-4 rounded-full font-bold text-sm flex items-center justify-center space-x-2 transition-all duration-300 ${
                      selectedHypothesis !== null
                        ? 'bg-gradient-to-r from-[#bf5af2] via-[#ff29a8] to-[#2997ff] text-white shadow-[0_0_20px_rgba(191,90,242,0.4)] hover:shadow-[0_0_30px_rgba(255,41,168,0.6)] hover:scale-[1.02] active:scale-95'
                        : 'bg-white/[0.05] text-[#86868b] cursor-not-allowed border border-white/[0.05]'
                    }`}'''
)

# Make the tools blocks look more tactile
content = content.replace(
    "hover:border-white/[0.16]",
    "hover:border-[#2997ff]/40 hover:bg-[#1a1a1c] hover:shadow-[0_0_15px_rgba(41,151,255,0.15)]"
)

# Make the Hypothesis blocks juicier
content = content.replace(
    "'bg-[#bf5af2]/15 border-[#bf5af2] text-white shadow-md shadow-purple-500/10'",
    "'bg-gradient-to-r from-[#bf5af2]/20 to-[#2997ff]/20 border-[#bf5af2] text-white shadow-[0_0_15px_rgba(191,90,242,0.2)] scale-[1.01]'"
)

# Make "Sortear Novo" / Próximo caso button juicy
content = content.replace(
    'className="w-full py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg shadow-blue-500/25"',
    'className="w-full py-4 rounded-full bg-gradient-to-r from-[#0071e3] to-[#2997ff] hover:from-[#2997ff] hover:to-[#0071e3] text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(41,151,255,0.4)] hover:shadow-[0_0_30px_rgba(41,151,255,0.6)] hover:scale-[1.02]"'
)

# Improve Bento Card styling
content = content.replace(
    'className="lg:col-span-7 bg-[#161617] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl space-y-0"',
    'className="lg:col-span-7 bg-gradient-to-b from-[#1c1c1e] to-[#121213] border border-white/[0.1] rounded-3xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] space-y-0 relative"'
)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
