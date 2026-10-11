import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Remove state
content = re.sub(r'const \[isPressureMode, setIsPressureMode\] = useState<boolean>.*?\n  \}\);\n', '', content, flags=re.DOTALL)
content = re.sub(r'const \[timeLeft, setTimeLeft\] = useState<number>\(\(\) => getMaxTimeForCase\(currentCase\)\);\n', '', content)
content = re.sub(r'const \[isTimedOut, setIsTimedOut\] = useState<boolean>\(false\);\n', '', content)

# Remove useEffect for timer reset
content = re.sub(r'useEffect\(\(\) => \{\n    setIsTimedOut\(false\);\n    setTimeLeft\(getMaxTimeForCase\(currentCase\)\);\n  \}, \[currentCase\.id\]\);\n', '', content)

# Remove useEffect for countdown
content = re.sub(r'useEffect\(\(\) => \{\n    if \(!isPressureMode \|\| answers\[currentCase\.id\]\?\.answered \|\| isTimedOut\) return;\n.*?\}, \[isPressureMode, timeLeft, isTimedOut, currentCase\.id, answers\]\);\n', '', content, flags=re.DOTALL)

# Remove pressureBonus
content = content.replace('const pressureBonus = (isCorrect && hypothesisCorrect && isPressureMode && timeLeft > 0) ? 20 : 0;', 'const pressureBonus = 0;')

# Remove UI button for toggle
content = re.sub(r'\{/\* Toggle Modo Sob Pressão \(Cronômetro Tático\) \*/\}.*?</button>\n\s*\)\}', '', content, flags=re.DOTALL)

# Remove UI for timer display
content = re.sub(r'\{isPressureMode && \(.*?</motion\.div>\n\s*\)\}', '', content, flags=re.DOTALL)

# Remove UI for timed out message
content = re.sub(r'\{isPressureMode && isTimedOut && !currentAnswerData\?\.answered && \(.*?</motion\.div>\n\s*\)\}', '', content, flags=re.DOTALL)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
