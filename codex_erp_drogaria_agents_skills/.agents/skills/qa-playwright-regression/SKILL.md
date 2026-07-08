---
name: qa-playwright-regression
description: Use para criar ou revisar testes de regressão do ERP de drogaria com foco em telas, fluxos críticos, regras de estoque, venda, financeiro e SNGPC mockado.
---

# Skill — QA Playwright regression

## Objetivo

Garantir que o ERP continue funcionando após mudanças.

## Procedimento

1. Identifique framework de testes existente.
2. Se não existir, sugira configuração mínima antes de criar muitos testes.
3. Priorize testes e2e para:
   - Dashboard carrega.
   - Cadastro de Produto abre e salva mock.
   - Atendimento Balcão adiciona produto.
   - Pré-venda é enviada ao PDV.
   - PDV finaliza venda.
   - Estoque é atualizado.
   - Entrada XML mockada associa produto.
   - Financeiro lista lançamento.
4. Criar testes unitários para regras de negócio puras.
5. Não depender de serviços externos reais.

## Saída esperada

- Arquivos de teste.
- Comandos para rodar.
- Resultado dos testes.
- Lacunas não cobertas.
