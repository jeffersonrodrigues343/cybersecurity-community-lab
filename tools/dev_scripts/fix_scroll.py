import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Replace the topRef scroll with window.scrollTo
content = content.replace(
    "setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);",
    "setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);"
)

# And in handleProtocolReport
content = content.replace(
    'setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 200);',
    'setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 200);'
)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
