import re

def apply_prodeus():
    with open('src/index.css', 'r') as f:
        content = f.read()

    # Prodeus: Dark metallic grey, high-fidelity bloom, bright orange & blue
    content = re.sub(r'background-color:\s*#[0-9a-fA-F]+;', 'background-color: #0d1114;', content) # Dark blue/grey space
    content = re.sub(r'color:\s*#[0-9a-fA-F]+;', 'color: #e0e6ed;', content) # Crisp modern white-grey text
    
    # Fonts - Clean, thick, modern sans-serif (Prodeus mixes chunky pixels with crystal clear text)
    content = re.sub(r'font-family:\s*.*?;', 'font-family: "Teko", "Arial Black", sans-serif; font-style: normal; font-size: 16px;', content)
    
    # Container - Sleek metallic panel with glowing accents
    content = content.replace('border: 1px solid #111111; background-color: #000000;', 'border: 2px solid #202b33; background-color: #141c21; border-top: 4px solid #f97316;')
    content = content.replace('box-shadow: 0 0 50px #ff0000;', 'box-shadow: 0 15px 35px rgba(0,0,0,0.8), 0 0 15px rgba(249, 115, 22, 0.2);')
    
    # Buttons - Prodeus uses glowing UI
    # Red button becomes hyper-glowing red/orange (Doom/Prodeus style)
    content = content.replace('background-color: #110000; border: 1px solid #ff0000; color: #ff0000;', 'background-color: #dc2626; border: 1px solid #f87171; color: #ffffff; box-shadow: 0 0 15px rgba(220, 38, 38, 0.5);')
    
    # Cyan button becomes bright energy blue
    content = content.replace('background-color: #111111; color: #ffffff;', 'background-color: #0284c7; color: #ffffff;')
    content = content.replace('border: 1px solid #555555;', 'border: 1px solid #38bdf8; box-shadow: 0 0 15px rgba(2, 132, 199, 0.5);')
    
    # Yellow button becomes metallic dark blue-grey with orange glow
    content = content.replace('background-color: #000000;', 'background-color: #1e293b;')
    content = content.replace('border: 1px dashed #444444;', 'border: 1px solid #475569;')
    
    # Update global container borders
    content = content.replace('border-[#330000]', 'border-[#334155]')
    content = content.replace('border-[#333333]', 'border-[#334155]')
    
    with open('src/index.css', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    apply_prodeus()
