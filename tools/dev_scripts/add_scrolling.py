import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Add useRef to import if not there
if 'useRef' not in content[:200]:
    content = content.replace('useState', 'useState, useRef', 1)

# Add Refs
refs_code = '''  const topRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLButtonElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const cluesRef = useRef<HTMLDivElement>(null);
'''

# Find where to insert refs: inside ScamSimulatorGame component
content = re.sub(
    r'(const \[currentCaseIndex, setCurrentCaseIndex\] = useState\(0\);)',
    r'\1\n' + refs_code,
    content
)

# In handleNextCase
content = content.replace(
    'setCurrentCaseIndex(currentCaseIndex + 1);',
    'setCurrentCaseIndex(currentCaseIndex + 1);\n    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);'
)

# In handleSelectLevel
content = content.replace(
    "setCurrentCaseIndex(0);",
    'setCurrentCaseIndex(0);\n    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);'
)

# In handleProtocolReport
content = content.replace(
    'sound.playSuccess();',
    'sound.playSuccess();\n      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);'
)
content = content.replace(
    'sound.playError();',
    'sound.playError();\n      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);'
)

# In the Hypothesis selection button:
# onClick={() => { sound.playBlip(); setSelectedHypothesis(idx); }}
content = content.replace(
    'setSelectedHypothesis(idx);',
    'setSelectedHypothesis(idx);\n                                setTimeout(() => verdictRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);'
)

# In handleInspectClue (scroll down slightly so they see the clue content)
content = content.replace(
    'setExpandedClueId((prev) => (prev === clue.id ? null : clue.id));',
    'setExpandedClueId((prev) => (prev === clue.id ? null : clue.id));\n    if (expandedClueId !== clue.id) {\n      setTimeout(() => cluesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);\n    }'
)

# Add ref to the top element (Cartão Bento header)
content = content.replace(
    '<div className="lg:col-span-7 bg-[#161617] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl space-y-0">',
    '<div ref={topRef} className="lg:col-span-7 bg-[#161617] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl space-y-0">'
)

# Add ref to Ferramentas block
content = content.replace(
    '''{/* BLOCO 2: FERRAMENTAS DE INVESTIGAÇÃO VISUAL (3 PISTAS)   */}
          {/* ======================================================== */}
          <div className={`bg-[#161617] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-lg transition-all duration-500 ${currentAnswerData?.answered ? 'opacity-40 blur-[2px] grayscale pointer-events-none' : ''}`}>''',
    '''{/* BLOCO 2: FERRAMENTAS DE INVESTIGAÇÃO VISUAL (3 PISTAS)   */}
          {/* ======================================================== */}
          <div ref={cluesRef} className={`bg-[#161617] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-lg transition-all duration-500 ${currentAnswerData?.answered ? 'opacity-40 blur-[2px] grayscale pointer-events-none' : ''}`}>'''
)

# Add ref to the Verdict button (Bater o Martelo)
# The button has onClick={handleProtocolReport}
content = content.replace(
    'onClick={handleProtocolReport}',
    'ref={verdictRef}\n                    onClick={handleProtocolReport}'
)

# Add ref to the Result Block
# <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
content = content.replace(
    'className="space-y-4"\n              >',
    'className="space-y-4"\n                ref={resultRef}\n              >'
)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
