---
name: finance-fiscal-flow
description: Use para implementar ou revisar financeiro, contas a pagar/receber, caixa, DRE e documentos fiscais mockados/NFC-e simulada no ERP de drogaria.
---

# Skill — Finance and fiscal mock flow

## Objetivo

Implementar financeiro e fiscal em modo MVP acadêmico.

## Financeiro mínimo

1. Contas a pagar.
2. Contas a receber.
3. Caixa.
4. Sangria.
5. Suprimento.
6. Fechamento de caixa.
7. Lançamentos por venda.
8. Baixa de títulos.
9. DRE simplificada.

## Fiscal mockado

1. Documento fiscal da venda deve ser simulado.
2. Status possíveis:
   - Processando.
   - Autorizada.
   - Rejeitada.
   - Cancelada.
3. Guardar chave mockada, número, série, valor, status e mensagem.
4. Nunca transmitir para SEFAZ no MVP.

## Testes mínimos

- Venda gera lançamento financeiro.
- Cancelamento reverte financeiro quando permitido.
- Fechamento de caixa soma formas de pagamento.
- NFC-e mockada recebe status e mensagem.
