import re

def purge_soft_ui():
    with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
        content = f.read()

    # Kill all rounded corners
    content = re.sub(r'rounded-\[?\w+\]?', 'rounded-none', content)
    content = content.replace('rounded-none', 'rounded-none') # no-op just in case
    
    # Kill all soft shadows and replace with brutalist flat shadows
    content = re.sub(r'shadow-\[.*?\]', 'shadow-[4px_4px_0_0_#000]', content)
    content = re.sub(r'shadow-\w+', 'shadow-[4px_4px_0_0_#000]', content)
    
    # Kill all Apple-like background colors
    content = re.sub(r'bg-white/\[.*?\]', 'bg-black/40', content)
    content = re.sub(r'bg-gray-\d+', 'bg-[#111]', content)
    content = content.replace('bg-white', 'bg-black')
    
    # Text colors
    content = content.replace('text-black', 'text-[#d9d9d9]')
    content = content.replace('text-[#007AFF]', 'text-[#8c2318]')
    content = content.replace('text-[#2997ff]', 'text-[#8c2318]')
    content = content.replace('text-[#30d158]', 'text-[#55663d]')
    
    # Borders
    content = re.sub(r'border-black/\[.*?\]', 'border-[#8c2318]', content)
    content = re.sub(r'border-white/\[.*?\]', 'border-[#8c2318]', content)
    
    with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    purge_soft_ui()
