import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Martelo Button
content = content.replace(
    "'bg-gradient-to-r from-[#bf5af2] via-[#ff29a8] to-[#2997ff] text-white shadow-[0_0_20px_rgba(191,90,242,0.4)] hover:shadow-[0_0_30px_rgba(255,41,168,0.6)] hover:scale-[1.02] active:scale-95'",
    "'dopamine-bg text-white dopamine-border dopamine-heartbeat dopamine-shine scale-[1.05] active:scale-95 text-base sm:text-lg tracking-wider uppercase font-black'"
)

# Floating XP 
content = content.replace(
    'className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#30d158] to-[#28cd41] drop-shadow-[0_0_15px_rgba(48,209,88,0.5)] flex items-center justify-center space-x-1"',
    'className="text-6xl font-black text-transparent bg-clip-text dopamine-bg drop-shadow-[0_0_30px_rgba(255,0,255,0.8)] flex items-center justify-center space-x-1 dopamine-heartbeat"'
)
content = content.replace(
    '<span className="text-3xl text-white drop-shadow-md">+</span>',
    '<span className="text-5xl text-white drop-shadow-md">+</span>'
)
content = content.replace(
    '<span className="text-lg text-[#30d158] ml-1">XP</span>',
    '<span className="text-3xl text-white ml-1">XP</span>'
)

# Tools Hover
content = content.replace(
    "hover:border-[#2997ff]/40 hover:bg-[#1a1a1c] hover:shadow-[0_0_15px_rgba(41,151,255,0.15)]",
    "hover:border-[#ff00ff] hover:bg-[#1a1a1c] hover:shadow-[0_0_25px_rgba(255,0,255,0.6)] hover:scale-[1.03] transition-all duration-200"
)

# "Sortear Novo" / Próximo Caso
content = content.replace(
    'className="w-full py-4 rounded-full bg-gradient-to-r from-[#0071e3] to-[#2997ff] hover:from-[#2997ff] hover:to-[#0071e3] text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(41,151,255,0.4)] hover:shadow-[0_0_30px_rgba(41,151,255,0.6)] hover:scale-[1.02]"',
    'className="w-full py-5 rounded-full dopamine-bg text-white font-black text-base uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer dopamine-border dopamine-shine hover:scale-[1.05]"'
)

# Combo Badge
content = content.replace(
    'className="flex items-center space-x-1 px-3 py-1 rounded-full bg-[#ff9f0a]/15 text-[#ff9f0a] text-xs font-semibold border border-[#ff9f0a]/30 shadow-sm"',
    'className="flex items-center space-x-1 px-4 py-1.5 rounded-full dopamine-bg text-white text-sm font-black border-2 border-white shadow-[0_0_15px_rgba(255,0,255,0.8)] dopamine-heartbeat"'
)
content = content.replace(
    '<Flame className="w-3.5 h-3.5 fill-[#ff9f0a]" />',
    '<Flame className="w-4 h-4 text-white fill-white" />'
)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
