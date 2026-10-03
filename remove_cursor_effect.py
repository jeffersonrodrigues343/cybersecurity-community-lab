import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove cursorRef declaration
content = re.sub(r'const cursorRef = useRef<HTMLDivElement>\(null\);\n', '', content)

# Remove the useEffect that handles the mouse movement
pattern = r'// GSAP: Ambient Glow Cursor Follower\n  useEffect\(\(\) => \{.*?\}, \[\]\);\n'
content = re.sub(pattern, '', content, flags=re.DOTALL)

# Remove the ref={cursorRef} from the div
content = content.replace('ref={cursorRef}', '')

with open('src/App.tsx', 'w') as f:
    f.write(content)

