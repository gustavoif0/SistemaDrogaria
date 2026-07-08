---
name: sngpc-compliance-flow
description: Use para implementar ou revisar o módulo SNGPC acadêmico/mockado, medicamentos controlados, receitas, lote, inventário e transmissões simuladas. Não use para integração real com Anvisa.
---

# Skill — SNGPC compliance flow mockado

## Objetivo

Implementar controle acadêmico de medicamentos controlados sem transmissão real.

## Regras obrigatórias

1. Produto controlado deve estar marcado no cadastro.
2. Produto controlado deve ter RMS quando disponível.
3. Venda de controlado deve exigir receita mockada.
4. Receita deve conter dados fictícios mínimos:
   - Número.
   - Tipo de receita.
   - Prescritor.
   - Conselho/UF.
   - Paciente.
   - Data.
5. Saída deve estar vinculada a lote.
6. Inventário deve mostrar saldo por lote.
7. Transmissão deve ser apenas simulada.
8. Relatórios devem ser mockados e marcados como acadêmicos.

## Não fazer

- Não implementar envio real à Anvisa.
- Não buscar bases reais.
- Não validar prescrição real.
- Não orientar uso de medicamentos.

## Testes mínimos

- Produto controlado exige receita.
- Produto não controlado não exige receita.
- Saída reduz lote correto.
- Transmissão mockada muda status para transmitida.
