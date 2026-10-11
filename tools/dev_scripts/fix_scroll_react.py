import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Add a useEffect to force scroll to top on case change
insertion = '''  useEffect(() => {
    // Força o scroll pro topo absoluto assim que o caso novo for montado no DOM
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  }, [currentCase.id]);
  
  // Registro de respostas e laudos periciais'''

content = content.replace('  // Registro de respostas e laudos periciais', insertion)

# Remove the old setTimeout from handleNextCase to avoid conflicts
content = content.replace("setTimeout(() => window.scrollTo({ top: 0, behavior: \"smooth\" }), 50);", "")

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
