import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Fix the pressure mode button to be wrapped in isBasicoFinished
# We'll just find the start of the button and wrap it.
pattern = r'(<button\s*onClick=\{\(\) => \{\s*sound\.playBlip\(\);\s*const nextVal = !isPressureMode;\s*setIsPressureMode\(nextVal\);\s*try \{\s*localStorage\.setItem\(\'hacklearn_pressure_mode\', JSON\.stringify\(nextVal\)\);\s*\} catch \{\}\s*\}\}\s*className=\{`flex items-center space-x-1\.5 px-3 py-1\.5 rounded-full text-xs font-semibold transition cursor-pointer border \$\{\s*isPressureMode\s*\?\s*\'bg-\[#ff3b30\]/15 text-\[#ff453a\] border-\[#ff3b30\]/35 shadow-sm shadow-red-500/10\'\s*:\s*\'bg-white/\[0\.04\] text-\[#86868b\] border-white/\[0\.08\] hover:text-white\'\s*\}\`\}\s*title="Alternar Modo Sob Pressão \(Cronômetro Tático\)"\s*>\s*<Clock className=\{\`w-3\.5 h-3\.5 \$\{isPressureMode \? \'text-\[#ff453a\] animate-pulse\' : \'\'\}\`\} />\s*<span className="hidden sm:inline">\{isPressureMode \? \'⏱️ Sob Pressão\' : \'🧘 Modo Calmo\'\}</span>\s*</button>)'

if not "{isBasicoFinished && (" in re.search(pattern, content).group(1):
    pass # Wait, this won't work perfectly. Let's do string replacement.

