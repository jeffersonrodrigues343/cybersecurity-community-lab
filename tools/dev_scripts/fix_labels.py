import re
with open('src/components/ScamSimulatorGame.tsx', 'r') as f:
    content = f.read()

content = content.replace('Gatilho Forense:', 'Como eles te fisgam:')
content = content.replace('Lição Didática:', 'Pra explicar pra criança:')
content = content.replace('Para os Pais:', 'Pra falar com seus avós:')
content = content.replace('Dica de Ouro:', 'Regra nº 1:')
content = content.replace('Remédio Legal:', 'O que fazer se cair:')
content = content.replace('Cenário de Autópsia:', 'Resumo da Ópera:')

# Change some button texts too
content = content.replace('Ver Conclusão da Investigação', 'Ver o Fim da Treta')
content = content.replace('Próximo Caso da Investigação', 'Bora pro próximo caso')
content = content.replace('Conceito Dominado! Avançar para o Próximo Caso', 'Entendi! Manda o próximo')
content = content.replace('Treino de Reação', 'Teste Rápido')

with open('src/components/ScamSimulatorGame.tsx', 'w') as f:
    f.write(content)
