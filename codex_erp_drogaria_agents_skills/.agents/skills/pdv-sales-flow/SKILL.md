---
name: pdv-sales-flow
description: Use para implementar ou revisar o fluxo Atendimento Balcão -> Pré-venda -> PDV -> Pagamento -> Baixa de estoque -> Financeiro. Não use para cadastro de produto isolado.
---

# Skill — PDV sales flow

## Objetivo

Implementar o fluxo principal de venda do ERP.

## Fluxo obrigatório

1. Atendente cria pré-venda no Balcão.
2. Produto é pesquisado por nome, código, código de barras ou referência.
3. Sistema valida produto ativo.
4. Sistema valida estoque disponível.
5. Se produto controlar lote, exigir seleção de lote.
6. Se lote estiver vencido, bloquear venda.
7. Se lote estiver próximo do vencimento, alertar.
8. Aplicar desconto apenas até o máximo permitido.
9. Salvar pré-venda.
10. Enviar pré-venda para o caixa.
11. PDV recupera pré-venda.
12. Caixa seleciona forma de pagamento.
13. Sistema finaliza venda.
14. Sistema baixa estoque.
15. Sistema gera movimentação financeira.
16. Sistema gera documento fiscal mockado.

## Formas de pagamento do MVP

- Dinheiro.
- Pix mockado.
- Crédito.
- Débito.
- Crediário.
- Convênio/PBM mockado.

## Testes mínimos

- Venda simples com estoque suficiente.
- Venda bloqueada por estoque insuficiente.
- Venda bloqueada por lote vencido.
- Desconto acima do limite bloqueado.
- Pré-venda recuperada no PDV.
- Venda finalizada baixa estoque e gera financeiro.
