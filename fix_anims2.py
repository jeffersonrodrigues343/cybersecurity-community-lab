import re

with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

# Update getScenarioType
pattern = r'const getScenarioType = \(c: ScamCase\).*?return \'banco\';\n  \};'
replacement = '''const getScenarioType = (c: ScamCase): 'whatsapp' | 'correios' | 'banco' | 'loja' | 'tarefas' | 'remoto' | 'oficial' | 'geral' => {
    const cat = (c.category || '').toLowerCase();
    const id = (c.id || '').toLowerCase();
    const title = (c.title || '').toLowerCase();

    if (id.includes('whatsapp') || cat.includes('whatsapp') || cat.includes('família')) return 'whatsapp';
    if (id.includes('correios') || cat.includes('encomenda') || cat.includes('sms')) return 'correios';
    if (id.includes('central') || id.includes('0800') || c.channel === 'call' || cat.includes('central') || cat.includes('falsa') || cat.includes('urgência')) return 'banco';
    if (id.includes('loja') || cat.includes('comércio') || cat.includes('loja') || title.includes('desconto')) return 'loja';
    if (id.includes('tarefa') || cat.includes('vagas') || cat.includes('trabalho')) return 'tarefas';
    if (id.includes('fantasma') || cat.includes('remoto') || title.includes('anydesk')) return 'remoto';
    if (id.includes('ecac') || id.includes('receita') || cat.includes('cidadania') || cat.includes('legítimo') || cat.includes('oficial')) return 'oficial';
    return 'banco';
  };'''

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
