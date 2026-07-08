# AGENTS.md — PharmaERP / ERP de Drogaria

## Contexto do projeto

Este repositório implementa um ERP acadêmico para drogarias e farmácias, baseado no protótipo visual `PharmaERP.dc.html` criado no Claude Design.

O sistema deve evoluir de protótipo visual para aplicação real, mantendo o foco em:

- Dashboard gerencial.
- Cadastro de produtos farmacêuticos.
- Atendimento ao balcão e pré-venda.
- PDV / Frente de caixa.
- Entrada de estoque por XML de NF-e.
- Controle de lote, vencimento e venda fracionada.
- Financeiro.
- Fiscal/NFC-e mockado.
- SNGPC e medicamentos controlados em modo acadêmico/mockado.
- Farmácia Popular / PBM em modo acadêmico/mockado.
- Relatórios e BI.
- Configurações, permissões, multiempresa e integrações.

## Prioridade do MVP

Priorize na seguinte ordem:

1. Estrutura base do projeto.
2. Layout principal com menu lateral, topbar e rotas.
3. Cadastro de produtos.
4. Atendimento balcão.
5. PDV / caixa.
6. Estoque / entrada XML mockada.
7. Financeiro básico.
8. Dashboard com indicadores mockados ou derivados do banco.
9. SNGPC mockado.
10. Relatórios/BI.

## Stack preferencial

Quando for necessário criar ou refatorar o projeto, use por padrão:

- Frontend: React + TypeScript.
- Build: Vite, salvo se o repositório já estiver em Next.js.
- Estilo: Tailwind CSS ou CSS Modules, mantendo o visual do protótipo.
- Estado: React hooks e contextos simples no MVP.
- Backend: Node.js/NestJS ou FastAPI. Se já existir backend, seguir a stack existente.
- Banco: PostgreSQL.
- ORM: Prisma, SQLAlchemy ou equivalente conforme a stack existente.
- Testes frontend: Vitest + React Testing Library.
- Testes e2e: Playwright.
- Lint/format: ESLint + Prettier, se aplicável.

Não trocar a stack existente sem justificar no plano antes de editar.

## Convenções de UI

Manter a identidade do protótipo:

- Sistema desktop web, denso e empresarial.
- Tema claro.
- Verde farmacêutico como cor principal.
- Azul para ações principais e informativas.
- Vermelho para erro, cancelamento, vencido e rejeitado.
- Amarelo/laranja para atenção, pendência, estoque baixo e vencimento próximo.
- Cinza claro para fundos, bordas e separadores.
- Layout com menu lateral fixo e topbar.
- Tabelas com filtros e ações por linha.
- Cards de indicadores no dashboard.
- Abas em telas complexas.
- Modais para pesquisa de produto, lote e confirmações.

## Regras funcionais essenciais

- Uma pré-venda criada no atendimento balcão deve poder ser recuperada no PDV.
- Finalização no PDV deve baixar estoque e gerar movimentação financeira.
- Produto com controle de lote/vencimento deve exigir lote antes de vender.
- Produto vencido não deve ser vendido.
- Produto próximo do vencimento deve exibir alerta.
- Produto com venda fracionada deve permitir unidade derivada, como caixa, cartela ou comprimido.
- Produto sem venda fracionada deve vender apenas na unidade configurada.
- Produto com desconto máximo deve impedir desconto acima do limite.
- Entrada XML mockada deve associar itens da nota aos produtos internos.
- Entrada de estoque deve atualizar custo, saldo, lote e vencimento.
- SNGPC deve ser implementado como controle acadêmico/mockado, sem transmissão real.
- Farmácia Popular/PBM devem ser implementados como fluxo acadêmico/mockado, sem integração real.
- Fiscal/NFC-e deve ser mockado no MVP, com status como autorizada, rejeitada e processando.

## Modelo de domínio mínimo

Criar ou preservar entidades equivalentes a:

- Empresa.
- Loja/Filial.
- Usuário.
- Perfil/Permissão.
- Cliente.
- Fornecedor.
- Produto.
- Categoria.
- Fabricante.
- Estoque.
- Lote.
- Preço.
- Promoção.
- Pré-venda.
- Venda.
- Item de venda.
- Pagamento.
- Movimento de estoque.
- Entrada de nota.
- Item de entrada.
- Conta a pagar.
- Conta a receber.
- Movimento de caixa.
- Documento fiscal mockado.
- Receita controlada.
- Transmissão SNGPC mockada.
- Integração externa mockada.

## Diretrizes de implementação

Antes de alterar código:

1. Leia a estrutura do repositório.
2. Identifique se o projeto ainda é protótipo HTML ou já tem framework.
3. Faça um plano curto com arquivos a alterar.
4. Preserve o máximo possível do visual e dos dados do protótipo.
5. Não remover telas já existentes sem substituir por equivalente melhor.
6. Não adicionar dependências grandes sem necessidade.
7. Não implementar integrações reais em serviços regulados; criar interfaces e mocks.
8. Não armazenar credenciais em código.
9. Usar dados fictícios realistas.
10. Criar testes para regras críticas quando houver estrutura de testes.

## Critério de pronto

Uma tarefa só deve ser considerada pronta quando:

- A tela/fluxo compila sem erro.
- O layout permanece coerente com o protótipo.
- Estados vazios, carregando, erro e sucesso foram considerados quando aplicável.
- As regras funcionais afetadas foram preservadas.
- Testes relevantes foram criados ou atualizados, se o projeto já possuir testes.
- O Codex informou claramente o que foi alterado, como validar e limitações restantes.
