# Orquestração de agentes no Codex

Use este arquivo quando quiser dividir uma tarefa grande em subagentes especializados.

## Quando usar subagentes

Use subagentes quando a tarefa envolver mais de uma camada do projeto, por exemplo:

- Migrar o protótipo HTML para React.
- Criar backend e banco ao mesmo tempo.
- Revisar segurança, domínio fiscal/farmacêutico e testes.
- Implementar um fluxo completo, como Atendimento Balcão → PDV → Estoque → Financeiro.

## Prompt-base de orquestração

```text
Quero desenvolver a próxima etapa do ERP de Drogaria.
Leia AGENTS.md e docs/PROJECT_BLUEPRINT.md.
Crie subagentes para analisar em paralelo:

1. Produto/negócio: requisitos e regras do fluxo.
2. Frontend/UI: telas, componentes e estados.
3. Backend/API: endpoints, validações e serviços.
4. Banco de dados: entidades, relacionamentos e migrações.
5. QA: testes unitários, integração e e2e.
6. Segurança/compliance: dados sensíveis, integrações mockadas e permissões.

Espere todos retornarem, consolide o plano e só depois implemente.
Não implemente integrações reais com SNGPC, SEFAZ, Pix, PBM ou Farmácia Popular; use mocks e interfaces.
```

## Agentes recomendados

1. Product Owner ERP Farmacêutico.
2. Frontend/UI Engineer.
3. Backend/API Engineer.
4. Database/Data Modeler.
5. Fiscal/SNGPC Domain Reviewer.
6. QA/Security Reviewer.
7. DevOps/Delivery Engineer.

Cada agente está descrito em `docs/agents/`.
