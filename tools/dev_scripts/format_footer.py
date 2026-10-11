import re

with open('src/components/Footer.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'Plataforma pública e sem fins lucrativos desenvolvida para conscientização de famílias, jovens e adultos contra golpes virtuais.',
    'Feito de graça pra ajudar o pessoal de casa a não cair em conto do vigário na internet.'
)
content = content.replace(
    'Simulador Educativo de Defesa Digital',
    'Simulador de Defesa Digital'
)

with open('src/components/Footer.tsx', 'w') as f:
    f.write(content)
