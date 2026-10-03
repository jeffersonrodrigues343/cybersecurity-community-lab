import re

with open('src/index.css', 'r') as f:
    content = f.read()

# Replace font family
content = content.replace(
    'font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;',
    'font-family: "Space Grotesk", sans-serif;'
)

# Apply Bebas Neue to headers
content = content.replace(
    '@layer base {',
    '''@layer base {
  h1, h2, h3, h4, h5, h6, .font-black {
    font-family: "Bebas Neue", cursive;
    letter-spacing: 0.05em;
  }'''
)

# Add scanlines
content += '''
/* Anti-AI Grunge / CRT Scanline */
.crt-lines::before {
  content: " ";
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  z-index: 9999;
  background-size: 100% 4px, 6px 100%;
  pointer-events: none;
}
'''

with open('src/index.css', 'w') as f:
    f.write(content)
