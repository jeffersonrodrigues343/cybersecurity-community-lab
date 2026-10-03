import re
import os

# 1. Clean App.tsx background and ambient elements
with open('src/App.tsx', 'r') as f:
    app = f.read()

app = app.replace('bg-[#050507]', 'bg-[#F2F2F7]') # Apple light gray background
app = app.replace('text-[#f5f5f7]', 'text-[#1C1C1E]') # Dark text
# Remove the weird glowing slash
app = re.sub(r'\{/\* Apple Subtle Ambient Glow Follower \*/\}.*?/>', '', app, flags=re.DOTALL)
with open('src/App.tsx', 'w') as f:
    f.write(app)


# 2. Clean Hero.tsx
with open('src/components/Hero.tsx', 'r') as f:
    hero = f.read()

hero = hero.replace('bg-black border-b-4 border-white pb-6 pt-12 shadow-[0_4px_0_0_#ff007f]', 'bg-white rounded-[40px] shadow-sm py-12 mb-8 text-center flex flex-col items-center justify-center border-none')
hero = hero.replace('text-white font-black text-6xl uppercase tracking-widest -skew-x-6', 'text-black font-extrabold text-5xl tracking-tight')
hero = hero.replace('text-[#00ffff] font-bold text-xl uppercase tracking-wider mt-4 px-4 bg-[#ff007f] inline-block -skew-x-3', 'text-gray-500 font-medium text-xl mt-4 px-4 max-w-2xl mx-auto')
with open('src/components/Hero.tsx', 'w') as f:
    f.write(hero)


# 3. Clean index.css (Remove fonts)
with open('src/index.css', 'r') as f:
    css = f.read()
# Remove all @import url for fonts
css = re.sub(r'@import url.*?;', '', css)
css = css.replace("font-family: 'Space Grotesk', sans-serif;", "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;")
css = css.replace("font-family: 'Bebas Neue', cursive;", "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;")
css = css.replace("bg-black text-white", "bg-[#F2F2F7] text-black")
with open('src/index.css', 'w') as f:
    f.write(css)

# 4. ScamSimulatorGame.tsx (Fix the layout to look good on desktop too)
with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    game = f.read()

# Make left col max-w-4xl instead of xl, change background to white
game = game.replace('className="lg:col-span-12 bg-[#1c1c1e] max-w-xl mx-auto rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/[0.05] space-y-0 relative"', 'className="lg:col-span-12 bg-white max-w-4xl w-full mx-auto rounded-[40px] shadow-sm border border-black/[0.05] space-y-0 relative"')

# Text colors inside the game
game = game.replace('text-white', 'text-black')
game = game.replace('text-[#00ffff]', 'text-[#007AFF]')
game = game.replace('text-[#f5f5f7]', 'text-gray-700')
game = game.replace('border-white/[0.08]', 'border-black/[0.05]')
game = game.replace('bg-white/[0.02]', 'bg-gray-50')
game = game.replace('bg-[#0a0a0c]', 'bg-white')
game = game.replace('text-[#f5f5f7]', 'text-gray-700')

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(game)

