# AGENTS.md - PharmaERP

## Contexto

Este repositorio implementa um ERP academico para drogarias e farmacias.

O MVP deve manter a identidade do prototipo original:

- Layout web desktop com sidebar fixa e topbar.
- Tema claro.
- Verde farmaceutico como cor principal.
- Azul para informacao/acoes auxiliares.
- Amarelo para pendencias, vencimento proximo e estoque baixo.
- Vermelho para erro, rejeicao, vencido e cancelamento.
- Tabelas densas, cards, formularios, abas e modais.

## Prioridade

1. Produtos.
2. Atendimento ao Balcao.
3. PDV / Caixa.
4. Baixa de estoque.
5. Financeiro.
6. Entrada XML mockada.
7. SNGPC mockado.
8. Dashboard e BI.

## Regras essenciais

- Pre-venda enviada no Balcao deve ser recuperada no PDV.
- Venda finalizada baixa estoque e gera financeiro.
- Produto inativo nao pode ser vendido.
- Produto com desconto maximo bloqueia desconto acima do limite.
- Produto com lote exige lote selecionado.
- Lote vencido bloqueia venda.
- Produto controlado exige receita no fluxo SNGPC mockado.
- Fiscal, SNGPC, Farmacia Popular, PBM, Pix e XML permanecem mockados no MVP.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router.
- Estado inicial: React Context/hooks.
- Backend futuro: Node.js + Express/Fastify + TypeScript.
- Banco futuro: PostgreSQL + Prisma.
- Testes futuros: Playwright e testes unitarios para regras criticas.
