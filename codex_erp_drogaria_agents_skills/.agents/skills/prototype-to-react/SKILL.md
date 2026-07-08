---
name: prototype-to-react
description: Use para migrar o protótipo PharmaERP.dc.html do Claude Design para React/TypeScript, preservando telas, visual, dados mockados e navegação. Não use para backend.
---

# Skill — Prototype to React

## Objetivo

Transformar `PharmaERP.dc.html` em uma aplicação React + TypeScript manutenível.

## Procedimento

1. Localize o protótipo HTML original.
2. Liste as telas existentes e os componentes recorrentes.
3. Crie estrutura de componentes:
   - `AppShell`.
   - `Sidebar`.
   - `Topbar`.
   - `KpiCard`.
   - `DataTable`.
   - `StatusBadge`.
   - `Tabs`.
   - `Modal`.
   - `FormField`.
4. Crie uma pasta de dados mockados, por exemplo `src/mocks`.
5. Crie navegação por estado ou rotas, conforme o projeto.
6. Mantenha identidade visual:
   - Verde principal.
   - Azul para ação/informação.
   - Vermelho para erro/vencido/cancelado.
   - Amarelo para atenção/pendência.
7. Remova HTML inline gradualmente, substituindo por classes reutilizáveis.
8. Não alterar regra funcional enquanto migra visual.

## Critério de pronto

- Projeto compila.
- Todas as telas principais existem.
- Sidebar navega entre telas.
- Modal de pesquisa de produto funciona.
- Layout fica semelhante ao protótipo.
- Dados mockados ficam separados da UI.
