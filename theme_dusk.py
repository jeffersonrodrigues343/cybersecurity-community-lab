import re

def apply_dusk_theme():
    with open('src/index.css', 'r') as f:
        content = f.read()

    # Change basic colors for DUSK (Rust, Brown, Blood Red, Dark Olive)
    content = re.sub(r'background-color:\s*#[0-9a-fA-F]+;', 'background-color: #0c0a08;', content) # Muddy dark brown
    content = re.sub(r'color:\s*#[0-9a-fA-F]+;', 'color: #a82216;', content) # Dried blood red
    
    # CRT effect adjustments (make it look more like a dirty, rusty CRT rather than toxic Ultrakill)
    content = re.sub(r'text-shadow:.*?;', 'text-shadow: 1px 1px 0px rgba(0, 0, 0, 1);', content)
    
    # Modify uk-container to dusk-container (just changing values inside existing blocks for simplicity)
    content = re.sub(r'\.uk-container\s*{([^}]*)}', r'.uk-container {\1}', content)
    content = content.replace('border: 4px solid #ff2a2a;', 'border: 2px solid #5a4133;')
    content = content.replace('box-shadow: 8px 8px 0px #440000;', 'box-shadow: inset 0 0 20px #000000;')
    
    content = content.replace('background-color: #880000;', 'background-color: #3b1410;')
    content = content.replace('background-color: #ff2a2a;', 'background-color: #7a1f16;')
    
    # Green becomes olive/dirty green
    content = content.replace('background-color: #005500;', 'background-color: #2b331f;')
    content = content.replace('border: 4px solid #00ff00;', 'border: 2px solid #55663d;')
    content = content.replace('color: #00ff00;', 'color: #778855;')

    # Blue becomes a dirty steel/grey
    content = content.replace('background-color: #005588;', 'background-color: #2b3136;')
    content = content.replace('border: 4px solid #00ffff;', 'border: 2px solid #48525b;')
    content = content.replace('color: #00ffff;', 'color: #6b7a87;')
    
    with open('src/index.css', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    apply_dusk_theme()
