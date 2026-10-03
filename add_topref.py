import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">',
    '<div ref={topRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">'
)

# And wait, the other issue could be that setTimeout 50ms might be too fast or too slow. Let's make it 200ms.
content = content.replace(
    "setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);",
    "setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);"
)
# And the other ones are 150ms. Let's make sure they are 200ms just in case.
content = content.replace(
    'setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);',
    'setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);'
)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
