with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Replace Bloco 2 Tools
content = content.replace(
    '''{/* BLOCO 2: FERRAMENTAS DE INVESTIGAÇÃO VISUAL (3 PISTAS)   */}
          {/* ======================================================== */}
          <div className="bg-[#161617] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-lg">''',
    '''{/* BLOCO 2: FERRAMENTAS DE INVESTIGAÇÃO VISUAL (3 PISTAS)   */}
          {/* ======================================================== */}
          <div className={`bg-[#161617] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-lg transition-all duration-500 ${currentAnswerData?.answered ? 'opacity-40 blur-[2px] grayscale pointer-events-none' : ''}`}>'''
)

# Replace Bloco 3 Verdict
content = content.replace(
    '''{/* BLOCO 3: DECISÃO DO DETETIVE (VEREDITO) */}
          {/* ======================================================== */}
          <div className="bg-[#161617] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-lg">''',
    '''{/* BLOCO 3: DECISÃO DO DETETIVE (VEREDITO) */}
          {/* ======================================================== */}
          <div className={`bg-[#161617] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-lg transition-all duration-500 ${!currentAnswerData?.answered && currentCaseDiscovered.length === 0 ? 'opacity-50 blur-[2px] grayscale pointer-events-none' : ''}`}>'''
)

# Replace Text Box (left column)
content = content.replace(
    '''{/* Caixa de Texto do Incidente (Autêntica, Ampla e Sem Poluição) */}
            <div className="bg-[#0c0c0d] border border-white/[0.08] rounded-2xl p-6 shadow-inner space-y-2">''',
    '''{/* Caixa de Texto do Incidente (Autêntica, Ampla e Sem Poluição) */}
            <div className={`bg-[#0c0c0d] border border-white/[0.08] rounded-2xl p-6 shadow-inner space-y-2 transition-all duration-500 ${expandedClueId !== null || currentAnswerData?.answered ? 'opacity-50 blur-[2px]' : ''}`}>'''
)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)

