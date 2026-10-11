import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# 1. Blur Ferramentas when case is answered
# Find BLOCO 2
content = content.replace(
    '<div className="bg-[#161617] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-lg">',
    '<div className={`bg-[#161617] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-lg transition-all duration-500 ${currentAnswerData?.answered ? \'opacity-40 blur-sm grayscale pointer-events-none\' : \'\'}`}>'
)

# 2. Blur Cartão Bento text when a tool is expanded OR case is answered
# Wait, Cartão Bento has the header and the text.
# The text box is: <div className="bg-[#0c0c0d] border border-white/[0.08] rounded-2xl p-6 shadow-inner space-y-2">
content = content.replace(
    '<div className="bg-[#0c0c0d] border border-white/[0.08] rounded-2xl p-6 shadow-inner space-y-2">',
    '<div className={`bg-[#0c0c0d] border border-white/[0.08] rounded-2xl p-6 shadow-inner space-y-2 transition-all duration-500 ${expandedClueId !== null || currentAnswerData?.answered ? \'opacity-50 blur-sm\' : \'\'}`}>'
)

# 3. Blur Veredito when no clues inspected? (optional, but good for focus)
content = content.replace(
    '<div className="bg-[#161617] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-lg">',
    '<div className={`bg-[#161617] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-lg transition-all duration-500 ${!currentAnswerData?.answered && currentCaseDiscovered.length === 0 ? \'opacity-50 blur-[2px] pointer-events-none\' : \'\'}`}>'
)
# Wait, the replace string for 3 is actually for BLOCO 3.
# Let's use regex for BLOCO 3.
bloco3_pattern = r'\{\/\* BLOCO 3: DECISÃO DO DETETIVE \(VEREDITO\) \*\/\}\s*\{\/\* ======================================================== \*\/\}\s*<div className="bg-\[#161617\] border border-white/\[0\.08\] rounded-2xl p-5 space-y-4 shadow-lg">'
content = re.sub(
    bloco3_pattern,
    r'{/* BLOCO 3: DECISÃO DO DETETIVE (VEREDITO) */}\n          {/* ======================================================== */}\n          <div className={`bg-[#161617] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-lg transition-all duration-500 ${!currentAnswerData?.answered && currentCaseDiscovered.length === 0 ? \'opacity-60 blur-[2px]\' : \'\'}`}>',
    content
)


with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)

