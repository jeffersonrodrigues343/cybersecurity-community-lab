import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

old_debrief = r'<div className="grid grid-cols-1 sm:grid-cols-2 gap-2\.5 pt-1">\s*<div className="p-3 rounded-xl bg-white/\[0\.02\] border border-\[#2997ff\]/20 space-y-1">\s*<span className="text-\[11px\] font-bold text-\[#2997ff\] flex items-center gap-1">\s*🕵️‍♂️ Silas \(Forense\):\s*</span>\s*<p className="text-\[11px\] text-\[#d2d2d7\] leading-relaxed">\s*Gatilho desarmado: <strong>\{currentCase\.pedagogy\.emotionalTrigger\}</strong>\.\s*</p>\s*</div>\s*<div className="p-3 rounded-xl bg-white/\[0\.02\] border border-\[#30d158\]/20 space-y-1">\s*<span className="text-\[11px\] font-bold text-\[#30d158\] flex items-center gap-1">\s*👩‍🏫 Clara \(Pedagoga\):\s*</span>\s*<p className="text-\[11px\] text-\[#d2d2d7\] leading-relaxed">\s*\{currentCase\.pedagogy\.kidsAnalogy\}\s*</p>\s*</div>\s*</div>'

new_debrief = '''<details className="pt-1 group">
                            <summary className="text-[11px] text-[#86868b] cursor-pointer hover:text-white transition flex items-center gap-1 list-none outline-none">
                              <span>🕵️‍♂️ Silas & 👩‍🏫 Clara: Análise Detalhada</span>
                              <span className="text-[9px] bg-white/[0.06] px-1.5 rounded-full">Ver mais</span>
                            </summary>
                            <div className="mt-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                              <p className="text-[11px] text-[#d2d2d7] leading-relaxed">
                                <span className="font-bold text-[#2997ff]">Gatilho Forense:</span> {currentCase.pedagogy.emotionalTrigger}
                              </p>
                              <p className="text-[11px] text-[#d2d2d7] leading-relaxed">
                                <span className="font-bold text-[#30d158]">Lição Pedagógica:</span> {currentCase.pedagogy.kidsAnalogy}
                              </p>
                            </div>
                          </details>'''

content = re.sub(old_debrief, new_debrief, content, flags=re.MULTILINE)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)

print("Done debrief")
