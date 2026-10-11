import re

# Remove from index.html
with open('index.html', 'r') as f:
    content = f.read()
content = content.replace(' crt-lines', '')
with open('index.html', 'w') as f:
    f.write(content)

# Remove from index.css
with open('src/index.css', 'r') as f:
    css = f.read()
css = re.sub(r'/\* Anti-AI Grunge / CRT Scanline \*/.*?pointer-events: none;\n}', '', css, flags=re.DOTALL)
with open('src/index.css', 'w') as f:
    f.write(css)

