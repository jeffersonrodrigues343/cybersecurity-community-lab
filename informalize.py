import os
import re

def informal(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Onboarding
    content = content.replace('Você analisará mensagens reais', 'Você vai encarar mensagens reais')
    content = content.replace('Siga apenas estes 3 passos:', 'O jogo é simples:')
    content = content.replace('Examine o texto recebido, o remetente e o canal', 'Leia a mensagem com calma e veja de quem veio.')
    content = content.replace('Clique para auditar o registro do site', 'Clique nas pistas para abrir a base de dados')
    content = content.replace('urgência psicológica', 'falsidade do autor')
    content = content.replace('Emita seu Veredito', 'Bata o Martelo')
    content = content.replace('Suba de patente e libere seu certificado!', 'Faça pontos e não caia em papo furado!')
    content = content.replace('Inicializando Estação de Análise...', 'Carregando os dados da treta...')
    content = content.replace('Guia Rápido • Entenda em 1 Minuto', 'Como Jogar')
    
    # ReportModal
    content = content.replace('Relatório', 'Info')
    content = content.replace('Este projeto é uma iniciativa', 'Isso aqui nasceu como um projeto')
    content = content.replace('O objetivo é educar', 'A ideia é treinar a galera')
    content = content.replace('através da gamificação', 'no formato de jogo')

    with open(filepath, 'w') as f:
        f.write(content)

informal('src/components/OnboardingModal.tsx')
informal('src/components/ReportModal.tsx')
