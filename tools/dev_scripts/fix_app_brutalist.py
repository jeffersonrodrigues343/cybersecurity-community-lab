import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Make the background a stark black and white halftone/grid
content = content.replace(
    'className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#30d15815_0%,#2997ff15_30%,transparent_70%)] opacity-80"',
    'className="fixed inset-0 pointer-events-none bg-[url(\'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIyIiBmaWxsPSIjMjIyIi8+PC9zdmc+\')] opacity-50"'
)

# Replace the dopamine glow with a harsh neon pink slash
content = content.replace(
    'className="fixed top-0 left-0 w-[40rem] h-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#bf5af2]/10 to-[#2997ff]/10 blur-[100px] pointer-events-none z-0 dopamine-glow"',
    'className="fixed top-20 -left-20 w-[150%] h-[200px] bg-[#ff007f] opacity-20 -rotate-12 pointer-events-none z-0"'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
