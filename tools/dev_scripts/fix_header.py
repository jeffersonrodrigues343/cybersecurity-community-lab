import re
with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#bf5af2] via-[#2997ff] to-[#30d158] text-white rounded-full font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(41,151,255,0.4)] flex items-center gap-1.5 sm:gap-2 hover:shadow-[0_0_25px_rgba(41,151,255,0.7)] transition-all animate-float"',
    'className="px-4 sm:px-5 py-2 sm:py-2.5 dopamine-bg text-white rounded-full font-black text-sm sm:text-base shadow-[0_0_20px_rgba(255,0,255,0.8)] flex items-center gap-2 dopamine-heartbeat border-2 border-white"'
)
with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
