---
name: postgres-domain-model
description: Use para criar ou revisar o modelo de dados PostgreSQL/ORM do ERP de drogaria, incluindo produtos, estoque, lotes, vendas, financeiro, fiscal mockado e SNGPC acadêmico.
---

# Skill — PostgreSQL domain model

## Objetivo

Criar um modelo relacional confiável para o ERP.

## Entidades mínimas

1. `companies`.
2. `stores`.
3. `users`.
4. `roles`.
5. `permissions`.
6. `customers`.
7. `suppliers`.
8. `categories`.
9. `manufacturers`.
10. `products`.
11. `product_prices`.
12. `stock_balances`.
13. `batches`.
14. `stock_movements`.
15. `pre_sales`.
16. `pre_sale_items`.
17. `sales`.
18. `sale_items`.
19. `payments`.
20. `cash_movements`.
21. `accounts_payable`.
22. `accounts_receivable`.
23. `invoice_entries`.
24. `invoice_entry_items`.
25. `fiscal_documents_mock`.
26. `controlled_prescriptions`.
27. `sngpc_movements_mock`.
28. `external_integrations_mock`.

## Regras de modelagem

- Estoque deve ser por loja e produto.
- Lote deve estar vinculado a produto, loja e vencimento.
- Venda deve guardar snapshot de preço, desconto e produto no item.
- Movimentação de estoque deve registrar origem: venda, entrada, ajuste, transferência ou cancelamento.
- Não sobrescrever histórico financeiro.
- Documentos fiscais e SNGPC devem ser mockados no MVP.
- Usar chaves estrangeiras e índices nas buscas frequentes.

## Saída esperada

- Schema ORM ou SQL.
- Migrations.
- Seeds fictícios.
- Diagrama textual dos relacionamentos.
- Observações de integridade.
