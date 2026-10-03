import re

def apply_cruelty_squad():
    with open('src/index.css', 'r') as f:
        content = f.read()

    # Cruelty Squad is toxically bright and mismatched
    content = re.sub(r'background-color:\s*#[0-9a-fA-F]+;', 'background-color: #33ff00;', content) # Toxic Sludge Green
    content = re.sub(r'color:\s*#[0-9a-fA-F]+;', 'color: #ff00ff;', content) # Magenta
    
    # Fonts - basic system fonts but ugly, or Arial
    content = re.sub(r'font-family:\s*.*?;', 'font-family: "Impact", "Arial Black", sans-serif;', content)
    
    # Container
    content = content.replace('border: 2px solid #5a4133;', 'border: 8px solid #ff00ff; background-color: #0000ff;')
    content = content.replace('box-shadow: inset 0 0 20px #000000;', 'box-shadow: 10px 10px 0px #ffff00;')
    
    # Red button becomes hot pink / toxic
    content = content.replace('background-color: #3b1410;', 'background-color: #ff0055;')
    
    # Green button becomes cyan
    content = content.replace('background-color: #2b331f;', 'background-color: #00ffff;')
    content = content.replace('border: 2px solid #55663d;', 'border: 4px solid #ff0000;')
    content = content.replace('color: #778855;', 'color: #000000;')

    # Blue button becomes yellow
    content = content.replace('background-color: #2b3136;', 'background-color: #ffff00;')
    content = content.replace('border: 2px solid #48525b;', 'border: 4px dotted #0000ff;')
    content = content.replace('color: #6b7a87;', 'color: #ff0000;')
    
    with open('src/index.css', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    apply_cruelty_squad()
