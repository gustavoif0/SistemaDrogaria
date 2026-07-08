# Prompts prontos para usar no Codex

## 1. Diagnóstico inicial do projeto

```text
Leia AGENTS.md e docs/PROJECT_BLUEPRINT.md.
Analise a estrutura atual do repositório.
Identifique se o projeto ainda é apenas protótipo HTML ou se já existe app React/backend.
Crie um diagnóstico com:
1. Stack encontrada.
2. Arquivos principais.
3. Riscos.
4. Melhor plano para transformar o protótipo em MVP funcional.
Não edite arquivos ainda.
```

## 2. Migrar protótipo para React

```text
Use a skill $prototype-to-react.
Transforme o protótipo PharmaERP.dc.html em uma aplicação React + TypeScript.
Mantenha o visual, telas, menus, cards, tabelas, modais e dados fictícios.
Separe componentes reutilizáveis e dados mockados.
Critério de pronto: app rodando localmente, navegação entre telas funcionando e layout semelhante ao protótipo.
```

## 3. Criar modelo de banco

```text
Use a skill $postgres-domain-model.
Com base em AGENTS.md e docs/PROJECT_BLUEPRINT.md, crie o modelo de dados do MVP.
Inclua produtos, estoque, lotes, pré-vendas, vendas, pagamentos, financeiro, entrada XML mockada, SNGPC mockado e usuários/permissões.
Gere migrations/seeds se a stack do projeto já permitir.
```

## 4. Implementar Atendimento Balcão → PDV

```text
Use as skills $pdv-sales-flow e $pharma-ui-system.
Implemente o fluxo Atendimento Balcão → Enviar para Caixa → PDV recupera pré-venda → Finalizar venda.
Validar estoque, lote, vencimento e desconto máximo.
Ao finalizar, baixar estoque e gerar movimentação financeira mockada.
Criar testes para as regras críticas.
```

## 5. Implementar entrada XML mockada

```text
Use a skill $inventory-xml-lot-expiry.
Implemente a tela de Entrada de Estoque / XML usando dados mockados.
Permitir importar ou carregar exemplo de XML, associar produto interno, informar lote/vencimento, revisar custo/preço e confirmar entrada.
Atualizar estoque e histórico de movimentação.
```

## 6. Implementar SNGPC acadêmico

```text
Use a skill $sngpc-compliance-flow.
Implemente o módulo SNGPC em modo acadêmico/mockado.
Não criar transmissão real.
Criar controle de produto controlado, receita, saída de lote, pendências e relatório mockado.
```

## 7. Revisão antes da entrega

```text
Use a skill $qa-playwright-regression.
Revise o projeto antes da entrega acadêmica.
Crie ou atualize testes para Dashboard, Produto, Atendimento Balcão, PDV, Estoque e Financeiro.
Rode os checks disponíveis.
Informe o que passou, o que falhou e o que precisa ser corrigido.
```
