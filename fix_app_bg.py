import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Enhance the background
content = content.replace(
    'className="min-h-screen flex flex-col bg-black text-[#f5f5f7] apple-radial-glow relative overflow-x-hidden"',
    'className="min-h-screen flex flex-col bg-[#050507] text-[#f5f5f7] relative overflow-x-hidden"'
)

# Enhance the cursor follower / glow
content = content.replace(
    'className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,#2997ff20_0%,transparent_60%)]"',
    'className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#30d15815_0%,#2997ff15_30%,transparent_70%)] opacity-80"'
)

# And add a dopamine floating orb
content = content.replace(
    'className="fixed top-0 left-0 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.035] blur-3xl pointer-events-none z-0"',
    'className="fixed top-0 left-0 w-[40rem] h-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#bf5af2]/10 to-[#2997ff]/10 blur-[100px] pointer-events-none z-0 dopamine-glow"'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
