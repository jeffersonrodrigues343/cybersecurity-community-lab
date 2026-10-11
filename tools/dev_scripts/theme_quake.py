import re

def apply_quake():
    with open('src/index.css', 'r') as f:
        content = f.read()

    # Quake 1 is famous for muddy browns, greys, rusty metal, and dim lighting
    content = re.sub(r'background-color:\s*#[0-9a-fA-F]+;', 'background-color: #1a1613;', content) # Dark dim brown/grey
    content = re.sub(r'color:\s*#[0-9a-fA-F]+;', 'color: #c9b191;', content) # Beige/rust text
    
    # Fonts - Blocky sans or monospace, no italics
    content = re.sub(r'font-family:\s*.*?;', 'font-family: "Courier New", Courier, monospace; font-style: normal;', content)
    
    # Container - Metal grey with dark brown border
    content = content.replace('border: 6px solid #ffffff; background-color: #000000;', 'border: 4px ridge #4a3c31; background-color: #2b2520;')
    content = content.replace('box-shadow: 15px 15px 0px #ff0055;', 'box-shadow: inset 0 0 30px #000000;')
    
    # Buttons
    # Red button becomes deep rust red
    content = content.replace('background-color: #ff0055; border-color: #ffffff;', 'background-color: #5c2018; border-color: #2a110d;')
    
    # Cyan button becomes muddy greyish green
    content = content.replace('background-color: #ffffff; color: #000000;', 'background-color: #384234; color: #c9b191;')
    content = content.replace('border: 6px solid #000000;', 'border: 4px ridge #1e261b;')
    
    # Yellow button becomes dirty brown
    content = content.replace('background-color: #00ff00;', 'background-color: #3b2a1a;')
    content = content.replace('border: 6px solid #ffffff;', 'border: 4px ridge #1c140d;')
    
    with open('src/index.css', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    apply_quake()
