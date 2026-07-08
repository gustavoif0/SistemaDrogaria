---
name: inventory-xml-lot-expiry
description: Use para implementar ou revisar entrada de estoque por XML mockado, associação de produtos, lote, vencimento, custo, preço sugerido e movimentação de estoque.
---

# Skill — Inventory XML, lot and expiry

## Objetivo

Criar fluxo de entrada de estoque com importação/simulação de XML.

## Fluxo obrigatório

1. Usuário abre Entrada de Estoque / XML.
2. Usuário importa XML ou carrega exemplo mockado.
3. Sistema mostra cabeçalho da nota:
   - Fornecedor.
   - CNPJ.
   - Número.
   - Série.
   - Chave.
   - Datas.
4. Sistema lista itens da nota.
5. Cada item deve ser associado a um produto interno.
6. Usuário informa ou confirma:
   - Quantidade.
   - Valor unitário.
   - Custo.
   - Lote.
   - Vencimento.
   - Preço sugerido.
7. Sistema valida itens pendentes.
8. Confirmar entrada atualiza estoque e lotes.
9. Gerar movimentação de estoque.

## Estados visuais

- Verde: associado/OK.
- Amarelo: vencimento próximo/divergência.
- Vermelho: não associado/erro/vencido.

## Testes mínimos

- Item associado atualiza estoque.
- Item sem associação impede confirmação.
- Lote com vencimento inválido mostra erro.
- Entrada altera custo quando permitido.
