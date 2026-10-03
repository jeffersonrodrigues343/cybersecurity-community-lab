import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Bento Card Container -> Neo Brutalist
content = content.replace(
    'className="lg:col-span-7 bg-gradient-to-b from-[#1c1c1e] to-[#121213] border border-white/[0.1] rounded-3xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] space-y-0 relative"',
    'className="lg:col-span-7 bg-[#0a0a0c] border-4 border-[#ff007f] rounded-none overflow-hidden shadow-[8px_8px_0_0_#00ffff] space-y-0 relative"'
)

# Header of Bento Card
content = content.replace(
    'className="p-4 sm:p-6 bg-[#1c1c1e] border-b border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"',
    'className="p-4 sm:p-6 bg-[#ff007f] border-b-4 border-white flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden text-black"'
)
content = content.replace(
    '<h2 className="text-xl font-bold text-white tracking-tight relative z-10">{currentCase.title}</h2>',
    '<h2 className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-[2px_2px_0_#000] relative z-10">{currentCase.title}</h2>'
)
# Make text inside header black or white appropriately
content = content.replace('text-[#86868b]', 'text-[#00ffff]') # High contrast cyan instead of gray
content = content.replace('text-[#d2d2d7]', 'text-white font-bold')

# Clues / Ferramentas block
content = content.replace(
    'className="p-4 sm:p-6 space-y-4 sm:space-y-5"',
    'className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-[url(\'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwYTBhMGMiLz48Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMSIgZmlsbD0iIzIyMiIvPjwvc3ZnPg==\')]"'
)

# Clue Buttons
content = content.replace(
    "hover:border-[#ff00ff] hover:bg-[#1a1a1c] hover:shadow-[0_0_25px_rgba(255,0,255,0.6)] hover:scale-[1.03] transition-all duration-200",
    "hover:bg-[#00ffff] hover:text-black hover:scale-[1.02] hover:-skew-x-2 transition-all duration-75 border-b-4 border-r-4 border-white active:translate-y-1 active:border-b-0 active:border-r-0"
)
content = content.replace(
    "border-white/[0.06] bg-[#121213]",
    "border-2 border-[#ff007f] bg-black"
)
content = content.replace(
    "border-white/[0.12] bg-[#161617]",
    "border-2 border-[#00ffff] bg-[#002222]"
)

# The Martelo Button
content = content.replace(
    "'dopamine-bg text-white dopamine-border dopamine-heartbeat dopamine-shine scale-[1.05] active:scale-95 text-base sm:text-lg tracking-wider uppercase font-black'",
    "'bg-[#ff007f] text-black border-4 border-white shadow-[6px_6px_0_0_#00ffff] scale-[1.02] active:translate-y-2 active:shadow-none text-xl tracking-widest uppercase font-black py-6 -skew-x-3'"
)

# Hypothesis options
content = content.replace(
    "'bg-gradient-to-r from-[#bf5af2]/20 to-[#2997ff]/20 border-[#bf5af2] text-white shadow-[0_0_15px_rgba(191,90,242,0.2)] scale-[1.01]'",
    "'bg-[#00ffff] border-4 border-white text-black shadow-[4px_4px_0_0_#ff007f] scale-[1.02] -skew-x-2 font-bold'"
)
content = content.replace(
    "'bg-white/[0.03] border-white/[0.08] text-white font-bold hover:border-white/[0.2] hover:text-white'",
    "'bg-black border-2 border-white text-white font-bold hover:bg-[#ff007f] hover:text-black hover:border-white hover:-skew-x-2 transition-all'"
)

# "Próximo Caso" button
content = content.replace(
    'className="w-full py-5 rounded-full dopamine-bg text-white font-black text-base uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer dopamine-border dopamine-shine hover:scale-[1.05]"',
    'className="w-full py-5 bg-[#00ffff] text-black font-black text-xl uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer border-4 border-black shadow-[8px_8px_0_0_#ff007f] hover:-translate-y-1 active:translate-y-2 active:shadow-none -skew-x-3"'
)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
