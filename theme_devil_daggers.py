import re

def apply_devil_daggers():
    with open('src/index.css', 'r') as f:
        content = f.read()

    # Devil Daggers: Absolute pitch black, stark floating UI
    content = re.sub(r'background-color:\s*#[0-9a-fA-F]+;', 'background-color: #000000;', content) 
    content = re.sub(r'color:\s*#[0-9a-fA-F]+;', 'color: #999999;', content) # Grey/dim white
    
    # Fonts - Blocky sans or monospace, small and crisp
    content = re.sub(r'font-family:\s*.*?;', 'font-family: "Courier New", Courier, monospace; font-style: normal; font-size: 14px;', content)
    
    # Container - Invisible borders, just floating in the void, extreme shadow for depth without borders
    content = content.replace('border: 4px ridge #4a3c31; background-color: #2b2520;', 'border: 1px solid #111111; background-color: #000000;')
    content = content.replace('box-shadow: inset 0 0 30px #000000;', 'box-shadow: 0 0 50px #ff0000;')
    
    # Buttons
    # Red button becomes hyper crimson / almost black with red text
    content = content.replace('background-color: #5c2018; border-color: #2a110d;', 'background-color: #110000; border: 1px solid #ff0000; color: #ff0000;')
    
    # Cyan button becomes dark grey with white text
    content = content.replace('background-color: #384234; color: #c9b191;', 'background-color: #111111; color: #ffffff;')
    content = content.replace('border: 4px ridge #1e261b;', 'border: 1px solid #555555;')
    
    # Yellow button becomes pitch black with grey border
    content = content.replace('background-color: #3b2a1a;', 'background-color: #000000;')
    content = content.replace('border: 4px ridge #1c140d;', 'border: 1px dashed #444444;')
    
    # Update global container borders that were explicitly colored
    content = content.replace('border-[#ff2a2a]', 'border-[#330000]')
    content = content.replace('border-[#00ff00]', 'border-[#333333]')
    
    with open('src/index.css', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    apply_devil_daggers()
