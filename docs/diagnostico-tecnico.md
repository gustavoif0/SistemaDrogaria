# Diagnostico tecnico inicial

## 1. Estrutura atual do projeto

A raiz continha um repositorio Git sem commits e uma pasta de referencia chamada `codex_erp_drogaria_agents_skills`.

Dentro dela havia:

- `README_Codex.md`
- `AGENTS.md`
- `PROMPTS_Codex.md`
- `MANIFESTO_ARQUIVOS.md`
- `docs/PROJECT_BLUEPRINT.md`
- `docs/AGENT_ORCHESTRATION.md`
- `docs/agents/*`
- `.agents/skills/*`

Nao havia `package.json`, `src/`, backend, banco, app React, `PharmaERP.dc.html` ou `support.js` na worktree.

## 2. Arquivos apenas prototipo/referencia

Todo o conteudo inicial era material de orientacao:

- O pacote `codex_erp_drogaria_agents_skills`.
- Os documentos de agentes.
- O blueprint funcional.
- As skills locais.
- Os prompts de execucao.

Eles nao formavam uma aplicacao executavel.

## 3. Partes reaproveitaveis

Foram reaproveitados:

- Prioridade do MVP.
- Identidade visual: sidebar, topbar, cards, tabelas, formularios, abas e modais.
- Fluxo Balcao -> Pre-venda -> PDV -> Venda.
- Regras de desconto, estoque, lote, vencimento e SNGPC mockado.
- Lista de entidades minimas para o banco futuro.
- Diretriz de manter fiscal, PBM, Farmacia Popular, Pix, XML e SNGPC sem integracao real no MVP.

## 4. Stack recomendada

Como nao havia stack definida, a base foi criada com:

- React + TypeScript.
- Vite.
- Tailwind CSS.
- React Router.
- React Context para estado local do MVP.

Para evolucao:

- Node.js + Express ou Fastify + TypeScript.
- PostgreSQL.
- Prisma ORM.
- Playwright para testes de fluxo.

## 5. Arquitetura inicial

A primeira entrega usa monorepo leve:

- `apps/web`: frontend funcional.
- `apps/api`: area preparada para API e Prisma.
- `docs`: diagnostico e documentacao.
- `codex_erp_drogaria_agents_skills`: referencias preservadas.

No frontend:

- `components`: layout e UI reutilizavel.
- `modules`: telas por dominio.
- `mocks`: dados ficticios realistas.
- `store`: contexto e operacoes do MVP.
- `lib`: regras e formatadores.
- `types`: entidades de dominio.

## 6. Modulos priorizados no MVP

Prioridade aplicada:

1. Layout base.
2. Dashboard.
3. Cadastro de Produtos.
4. Atendimento ao Balcao.
5. PDV / Caixa.
6. Financeiro derivado de vendas.
7. Entrada XML mockada.
8. SNGPC mockado.
9. Relatorios iniciais.

## 7. Riscos e lacunas

- O HTML visual original `PharmaERP.dc.html` nao estava disponivel.
- O prototipo documentado nao continha codigo executavel.
- Regras fiscais, SNGPC, Farmacia Popular e PBM exigem homologacao e nao podem ser reais no MVP.
- Ainda nao existe persistencia em banco.
- Ainda faltam testes automatizados.
- Controle de permissao, multiempresa e auditoria ainda estao planejados.

## 8. Plano de implementacao em etapas

Etapa 1, entregue agora:

- Criar base Vite React/TS.
- Montar layout principal.
- Criar rotas principais.
- Criar componentes reutilizaveis.
- Criar mocks e regras.
- Implementar Dashboard, Produtos, Balcao e PDV.
- Documentar README e diagnostico.

Etapa 2:

- Criar API REST.
- Ativar Prisma e PostgreSQL.
- Migrar mocks para seeds.
- Persistir produtos, pre-vendas, vendas, estoque e financeiro.

Etapa 3:

- Implementar entrada XML mockada com confirmacao real no banco.
- Melhorar lote, vencimento, custo medio e movimentos de estoque.

Etapa 4:

- Expandir SNGPC academico.
- Adicionar fiscal, PBM e Farmacia Popular mockados.
- Criar permissoes e multiempresa.

Etapa 5:

- Criar testes Playwright do fluxo principal.
- Adicionar testes unitarios para regras criticas.
- Preparar demonstracao academica.
