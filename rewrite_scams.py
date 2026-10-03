import re

with open('src/data/scamsData.ts', 'r') as f:
    content = f.read()

content = content.replace('Gamificação', 'Pontuação')
content = content.replace('telemetria pericial', 'dados técnicos')
content = content.replace('O dilema ético aqui consiste em', 'O golpe aqui tenta te convencer que')
content = content.replace('Veredito', 'Veredito')

# Emotional / Pedagogical keys renamed in components, but not in TS interface!
# Wait, I changed "Gatilho Forense:" in ScamSimulatorGame, I don't need to change the data keys, just the data values.
content = content.replace('Urgência e pânico de perder', 'Pânico de perder grana')
content = content.replace('Como dar a chave de casa para um assaltante vestido de policial.', 'É tipo dar a chave de casa pra um bandido vestido de guarda.')
content = content.replace('Diga a eles para sempre usarem', 'Avisa eles pra usarem')
content = content.replace('Não clique. Se for urgente', 'Não clica em nada. Se for urgente')
content = content.replace('O banco nunca envia links de cancelamento', 'Banco não manda link de cancelamento')
content = content.replace('Desespero por não conseguir pagar', 'Medo do nome sujo')
content = content.replace('Ilusão de dinheiro fácil', 'Achar que dinheiro cai do céu')
content = content.replace('É como dar 10 reais para um amigo falso', 'É igual apostar com a banca')
content = content.replace('Ganância e FOMO', 'Olho grande')
content = content.replace('Terrorismo psicológico', 'Terror puro')
content = content.replace('Subversão da autoridade', 'Fingir que é a polícia')
content = content.replace('Conformidade social', 'Ir com as outras')
content = content.replace('Senso de urgência falso', 'Falsa pressa')
content = content.replace('Exímio', 'Ótimo')
content = content.replace('Investigativa', 'de Detetive')

with open('src/data/scamsData.ts', 'w') as f:
    f.write(content)
