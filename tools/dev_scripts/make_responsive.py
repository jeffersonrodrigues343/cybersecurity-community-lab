import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Make the Bento Card padding responsive
content = content.replace('className="p-6 space-y-5"', 'className="p-4 sm:p-6 space-y-4 sm:space-y-5"')
content = content.replace('className="p-5 sm:p-6 space-y-5"', 'className="p-4 sm:p-6 space-y-4 sm:space-y-5"')

# Make tool badges flex-wrap
content = content.replace('className="text-xs font-semibold text-white flex items-center gap-2"', 'className="text-xs font-semibold text-white flex flex-wrap items-center gap-2"')
content = content.replace('className="flex items-center space-x-3"', 'className="flex items-center gap-3 w-full"')

# Debrief text might need break-words
content = content.replace('className="text-xs font-medium text-[#d2d2d7] leading-relaxed flex-1"', 'className="text-xs font-medium text-[#d2d2d7] leading-relaxed flex-1 break-words"')
content = content.replace('className="text-sm text-white leading-relaxed whitespace-pre-wrap"', 'className="text-sm sm:text-base text-white leading-relaxed whitespace-pre-wrap break-words"')

# Results box padding
content = content.replace('className="p-4 rounded-2xl bg-[#1c1c1e] border border-[#ff9f0a]/30 space-y-3.5 shadow-xl"', 'className="p-4 sm:p-5 rounded-2xl bg-[#1c1c1e] border border-[#ff9f0a]/30 space-y-3.5 shadow-xl"')
content = content.replace('className="p-4 rounded-2xl bg-[#1c1c1e] border border-[#30d158]/30 space-y-3.5 shadow-xl"', 'className="p-4 sm:p-5 rounded-2xl bg-[#1c1c1e] border border-[#30d158]/30 space-y-3.5 shadow-xl"')

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
