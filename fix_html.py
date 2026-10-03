import re

with open('index.html', 'r') as f:
    content = f.read()

# Replace fonts
content = content.replace(
    '<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">'
)
content = content.replace(
    '<link href="https://fonts.cdnfonts.com/css/sf-pro-display" rel="stylesheet">',
    ''
)
content = content.replace(
    'class="bg-black text-[#f5f5f7] antialiased selection:bg-[#0071e3] selection:text-white"',
    'class="bg-black text-[#f5f5f7] antialiased selection:bg-[#ff007f] selection:text-black crt-lines"'
)

with open('index.html', 'w') as f:
    f.write(content)
