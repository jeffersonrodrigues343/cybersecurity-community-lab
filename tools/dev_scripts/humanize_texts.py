import os
import re

def humanize(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Common AI words replacement mapping for Portuguese
    replacements = {
        r'\bMergulhe\b': 'Entenda',
        r'\bmergulhe\b': 'entenda',
        r'\bDesvende\b': 'Resolva',
        r'\bdesvende\b': 'resolva',
        r'\bCrucial\b': 'Muito importante',
        r'\bcrucial\b': 'muito importante',
        r'\bJornada\b': 'Missão',
        r'\bjornada\b': 'missão',
        r'\bEssencial\b': 'Importante',
        r'\bessencial\b': 'importante',
        r'\bTelemetria pericial\b': 'Dados do clique',
        r'\btelemetria pericial\b': 'dados do clique',
        r'\bTelemetria\b': 'Informações técnicas',
        r'\btelemetria\b': 'informações técnicas',
        r'\bAutenticidade\b': 'Veracidade',
        r'\bautenticidade\b': 'se é real',
        r'\bExímio\b': 'Ótimo',
        r'\bexímio\b': 'ótimo',
        r'\bNotável\b': 'Incrível',
        r'\bnotável\b': 'incrível',
        r'\bEm suma\b': 'Resumindo',
        r'\bem suma\b': 'resumindo',
        r'\bLaudo\b': 'Relatório',
        r'\blaudo\b': 'relatório',
        r'\bGamificação pedagógica\b': 'Sistema de pontuação',
        r'\bgamificação pedagógica\b': 'sistema de pontuação',
        r'\bBancada Pericial\b': 'Mesa de Análise',
        r'\bbancada pericial\b': 'mesa de análise',
        r'\bGamificação\b': 'Pontuação',
        r'\bgamificação\b': 'pontuação',
        r'\bpericial\b': 'de análise',
        r'\bPericial\b': 'de Análise',
        r'\bForensicFact\b': 'Fato',
        r'\bforensicFact\b': 'fato',
        r'\bForensic\b': 'Técnico',
        r'\bforensic\b': 'técnico',
        r'\bveredicto\b': 'veredito',
        r'\bVeredicto\b': 'Veredito',
        r'\bPedagógica\b': 'Didática',
        r'\bpedagógica\b': 'didática',
        r'\bInvestigativa\b': 'de Detetive',
        r'\binvestigativa\b': 'de detetive',
        r'Inspecione a telemetria técnica para avaliar a autenticidade do caso': 'Cheque os dados técnicos pra ver se a história bate',
        r'O dilema ético aqui consiste em': 'A pegadinha aqui é'
    }

    original_content = content
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content)

    if original_content != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Humanized {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            humanize(os.path.join(root, file))

