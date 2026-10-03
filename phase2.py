import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Determine if Basico is finished:
# Add a const: const isBasicoFinished = totalFinishedCount >= 3;
content = re.sub(
    r'const currentLevel = currentCase\.difficulty;',
    r'const currentLevel = currentCase.difficulty;\n  const totalFinishedCount = Object.keys(answers).length;\n  const isBasicoFinished = totalFinishedCount >= 3;',
    content
)

# Patente: already removed in F1? Wait, Patente on the top row was removed, but what about the header?
# Combo: {streak > 1 && ( ... )} -> {isBasicoFinished && streak > 1 && ( ... )}
content = re.sub(
    r'\{streak > 1 && \(',
    r'{isBasicoFinished && streak > 1 && (',
    content
)

# Conquistas button:
content = re.sub(
    r'<button\s*onClick=\{\(\) => \{\s*sound\.playBlip\(\);\s*setIsBadgesModalOpen\(true\);\s*\}\}\s*className="flex items-center space-x-1\.5 px-3 py-1\.5 rounded-full bg-white/\[0\.06\] hover:bg-white/\[0\.1\] text-white text-xs font-medium transition cursor-pointer"\s*>\s*<Trophy className="w-3\.5 h-3\.5 text-\[#ff9f0a\]" />\s*<span className="hidden sm:inline">Conquistas</span>\s*<span className="text-\[10px\] text-\[#86868b\]">\s*\(\{unlockedBadgeIds\.length\}/\{BADGES\.length\}\)\s*</span>\s*</button>',
    r'{isBasicoFinished && (<button onClick={() => { sound.playBlip(); setIsBadgesModalOpen(true); }} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-medium transition cursor-pointer"><Trophy className="w-3.5 h-3.5 text-[#ff9f0a]" /><span className="hidden sm:inline">Conquistas</span><span className="text-[10px] text-[#86868b]">({unlockedBadgeIds.length}/{BADGES.length})</span></button>)}',
    content,
    flags=re.MULTILINE
)

# Cartilha button:
content = re.sub(
    r'<button\s*onClick=\{\(\) => \{\s*sound\.playBlip\(\);\s*setIsFamilyGuideOpen\(true\);\s*\}\}\s*className="flex items-center space-x-1\.5 px-3 py-1\.5 rounded-full bg-white/\[0\.06\] hover:bg-white/\[0\.1\] text-\[#2997ff\] text-xs font-medium transition cursor-pointer"\s*>\s*<BookOpen className="w-3\.5 h-3\.5" />\s*<span className="hidden sm:inline">Cartilha</span>\s*</button>',
    r'{isBasicoFinished && (<button onClick={() => { sound.playBlip(); setIsFamilyGuideOpen(true); }} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-[#2997ff] text-xs font-medium transition cursor-pointer"><BookOpen className="w-3.5 h-3.5" /><span className="hidden sm:inline">Cartilha</span></button>)}',
    content,
    flags=re.MULTILINE
)

# Pressão button:
content = re.sub(
    r'<button\s*onClick=\{\(\) => setIsPressureMode\(!isPressureMode\)\}\s*className={`flex items-center space-x-1\.5 px-3 py-1\.5 rounded-full text-xs font-medium transition cursor-pointer \$\{\s*isPressureMode\s*\?\s*\'bg-\[#ff3b30\]/15 text-\[#ff453a\] border-\[#ff3b30\]/35 shadow-sm shadow-red-500/10\'\s*:\s*\'bg-white/\[0\.04\] text-\[#86868b\] border-white/\[0\.08\] hover:text-white\'\s*\}\`\}\s*title="Alternar Modo Sob Pressão \(Cronômetro Tático\)"\s*>\s*<Clock className=\{\`w-3\.5 h-3\.5 \$\{isPressureMode \? \'text-\[#ff453a\] animate-pulse\' : \'\'\}\`\} />\s*<span className="hidden sm:inline">\{isPressureMode \? \'⏱️ Sob Pressão\' : \'🧘 Modo Calmo\'\}</span>\s*</button>',
    r'{isBasicoFinished && (<button onClick={() => setIsPressureMode(!isPressureMode)} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${isPressureMode ? \'bg-[#ff3b30]/15 text-[#ff453a] border-[#ff3b30]/35 shadow-sm shadow-red-500/10\' : \'bg-white/[0.04] text-[#86868b] border-white/[0.08] hover:text-white\'}`} title="Alternar Modo Sob Pressão (Cronômetro Tático)"><Clock className={`w-3.5 h-3.5 ${isPressureMode ? \'text-[#ff453a] animate-pulse\' : \'\'}`} /><span className="hidden sm:inline">{isPressureMode ? \'⏱️ Sob Pressão\' : \'🧘 Modo Calmo\'}</span></button>)}',
    content,
    flags=re.MULTILINE
)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
