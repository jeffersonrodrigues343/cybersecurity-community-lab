import re

with open('src/data/scamsData.ts', 'r') as f:
    content = f.read()

content = content.replace('Exato!', 'Acertou!')
content = content.replace('Correto!', 'Isso aí!')
content = content.replace('Incorreto!', 'Errou feio.')
content = content.replace('Perigoso!', 'Cuidado!')
content = content.replace('Atenção ao truque!', 'Pegadinha!')
content = content.replace('Armadilha!', 'Cilada!')
content = content.replace('defesa definitiva contra golpistas', 'único jeito de ter certeza')

with open('src/data/scamsData.ts', 'w') as f:
    f.write(content)
