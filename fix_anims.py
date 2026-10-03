import re

with open('src/components/ScenarioAnimation2D.tsx', 'r') as f:
    content = f.read()

# Fix isCase3, isCase4, isCase6
content = content.replace(
    "const isCase3 = caseId === 'case-3-compra-aprovada';",
    "const isCase3 = caseId === 'case-3-compra-aprovada' || (scenarioType === 'banco' && caseId.includes('compra'));"
)
content = content.replace(
    "const isCase4 = caseId === 'case-4-falsa-central';",
    "const isCase4 = caseId === 'case-4-falsa-central' || (scenarioType === 'banco' && !caseId.includes('compra'));"
)
content = content.replace(
    "const isCase6 = caseId === 'case-6-sms-seguranca-real';",
    "const isCase6 = caseId === 'case-6-sms-seguranca-real' || scenarioType === 'oficial';"
)
content = content.replace(
    "const isCase8 = caseId === 'case-8-receita-ecac' || scenarioType === 'oficial';",
    "const isCase8 = caseId === 'case-8-receita-ecac' || (scenarioType === 'oficial' && caseId.includes('receita'));"
)

# Wait, if scenarioType == 'oficial', which one should it be? isCase6 or isCase8?
# isCase6 is "Usuário no PC". isCase8 is "Contribuinte com lupa". 
# The new legitimo is `Aviso de Segurança`, so maybe `isCase6` (Usuário no PC) makes sense. Let's map legitimo to `oficial` and let it be isCase6.

with open('src/components/ScenarioAnimation2D.tsx', 'w') as f:
    f.write(content)
