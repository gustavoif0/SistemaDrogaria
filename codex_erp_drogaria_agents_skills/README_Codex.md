# Kit Codex — ERP de Drogaria/Farmácia

Este pacote foi criado a partir do protótipo `PharmaERP.dc.html` gerado pelo Claude Design.
Ele serve para orientar o Codex durante o desenvolvimento do projeto acadêmico, separando:

1. Instruções globais do repositório em `AGENTS.md`.
2. Agentes especializados em `docs/agents/`.
3. Skills reutilizáveis em `.agents/skills/<nome>/SKILL.md`.
4. Prompts prontos para iniciar tarefas no Codex em `PROMPTS_Codex.md`.
5. Blueprint funcional em `docs/PROJECT_BLUEPRINT.md`.

## Como usar

1. Copie a pasta inteira para a raiz do repositório do projeto.
2. Inicie o Codex na raiz do repositório.
3. Use o arquivo `AGENTS.md` como instrução automática do projeto.
4. Use as skills chamando pelo nome, por exemplo:
   - `$prototype-to-react`
   - `$postgres-domain-model`
   - `$pdv-sales-flow`
   - `$inventory-xml-lot-expiry`
   - `$sngpc-compliance-flow`
5. Para tarefas grandes, use os prompts de `PROMPTS_Codex.md` e peça ao Codex para criar subagentes conforme `docs/AGENT_ORCHESTRATION.md`.

## Observação importante

Este projeto é acadêmico. Integrações fiscais, SNGPC, Farmácia Popular, PBM, Pix e XML devem ser tratadas inicialmente com dados mockados, interfaces abstratas e validações simuladas. Não implementar envio real para serviços públicos, Anvisa, SEFAZ, operadoras ou instituições financeiras sem credenciais, homologação e orientação técnica adequada.
