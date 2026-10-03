import re

def apply_post_void():
    with open('src/index.css', 'r') as f:
        content = f.read()

    # Post Void: Absolute Black background, Extreme Neon elements
    content = re.sub(r'background-color:\s*#[0-9a-fA-F]+;', 'background-color: #000000;', content)
    content = re.sub(r'color:\s*#[0-9a-fA-F]+;', 'color: #ffffff;', content)
    
    # Fonts - Impact, italicized for speed
    content = re.sub(r'font-family:\s*.*?;', 'font-family: "Impact", sans-serif; font-style: italic;', content)
    
    # Containers - High contrast white and pink
    content = content.replace('border: 8px solid #ff00ff; background-color: #0000ff;', 'border: 6px solid #ffffff; background-color: #000000;')
    content = content.replace('box-shadow: 10px 10px 0px #ffff00;', 'box-shadow: 15px 15px 0px #ff0055;')
    
    # Buttons
    # Red button becomes hyper bright pink/magenta
    content = content.replace('background-color: #ff0055;', 'background-color: #ff0055; border-color: #ffffff;')
    
    # Cyan button becomes pure white with black text
    content = content.replace('background-color: #00ffff;', 'background-color: #ffffff; color: #000000;')
    content = content.replace('border: 4px solid #ff0000;', 'border: 6px solid #000000;')
    
    # Yellow button becomes lime neon
    content = content.replace('background-color: #ffff00;', 'background-color: #00ff00;')
    content = content.replace('border: 4px dotted #0000ff;', 'border: 6px solid #ffffff;')
    
    with open('src/index.css', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    apply_post_void()
