import re

with open('src/data/dynamicScamsGenerator.ts', 'r') as f:
    content = f.read()

pattern = r'''  const scenarioTypes = \[
    'whatsapp_parente',
    'correios_sms',
    'falsa_central',
    'compra_legitima',
  \];

  const selectedScenario = pick\(scenarioTypes\);'''

replacement = '''  // DDA: Dynamic Difficulty Adjustment
  // Base scam prob is 30% (tende a ser verídico). Aumenta 10% a cada acerto na streak. Max 80%.
  const scamProb = Math.min(0.8, 0.3 + (streak * 0.1));
  const isGeneratingScam = Math.random() < scamProb;

  const scamTypes = ['whatsapp_parente', 'correios_sms', 'falsa_central'];
  const legitTypes = ['compra_legitima'];

  const selectedScenario = isGeneratingScam ? pick(scamTypes) : pick(legitTypes);'''

content = re.sub(pattern, replacement, content)

with open('src/data/dynamicScamsGenerator.ts', 'w') as f:
    f.write(content)
