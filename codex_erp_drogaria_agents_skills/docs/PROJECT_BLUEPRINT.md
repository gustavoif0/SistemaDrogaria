# Blueprint funcional — ERP de Drogaria/Farmácia

## Origem analisada

Arquivo base analisado: `PharmaERP.dc.html`, gerado pelo Claude Design.

O protótipo contém uma aplicação visual de ERP chamada `PharmaERP`, com:

- Sidebar fixa.
- Topbar com empresa, usuário, data/hora, notificações, suporte e sair.
- Dashboard inicial.
- Telas detalhadas para produtos, balcão, PDV, compras/entrada XML, financeiro, SNGPC e relatórios/BI.
- Telas de apoio para vendas, estoque, fiscal, Farmácia Popular/PBM, configurações, integrações e multiempresa.

## Telas identificadas no protótipo

1. Dashboard.
2. Cadastro de Produtos.
3. Atendimento Balcão.
4. PDV / Caixa.
5. Entrada de Estoque / XML.
6. Financeiro.
7. SNGPC.
8. Relatórios / BI.
9. Vendas.
10. Estoque.
11. Fiscal.
12. Farmácia Popular / PBM.
13. Configurações.
14. Integrações.
15. Multiempresa.

## Fluxo operacional principal

1. Dashboard abre visão geral da empresa.
2. Atendente acessa Atendimento Balcão.
3. Atendente pesquisa produto por nome, código interno, código de barras ou referência.
4. Sistema mostra estoque, preço, lote e vencimento.
5. Atendente informa quantidade e desconto.
6. Sistema valida estoque, lote, vencimento e desconto máximo.
7. Atendente salva e envia pré-venda ao caixa.
8. Caixa abre PDV e recupera pré-venda.
9. Caixa seleciona forma de pagamento.
10. Sistema finaliza venda, emite documento fiscal mockado, baixa estoque e gera financeiro.

## Fluxo de entrada de estoque

1. Usuário acessa Entrada de Estoque / XML.
2. Importa ou simula XML de NF-e.
3. Sistema lista itens da nota.
4. Usuário associa produto da nota ao cadastro interno.
5. Usuário revisa custo, lote, vencimento e preço sugerido.
6. Sistema confirma entrada.
7. Estoque, custo, preço e lote são atualizados.

## Fluxo SNGPC acadêmico/mockado

1. Produto marcado como controlado aparece em SNGPC.
2. Venda de medicamento controlado exige dados da receita.
3. Sistema registra saída do lote.
4. Farmacêutico acompanha pendências.
5. Sistema gera relatório mockado e histórico de transmissão.

## Telas prioritárias para desenvolvimento

### MVP 1

- Layout base.
- Dashboard.
- Cadastro de Produtos.
- Atendimento Balcão.
- PDV.

### MVP 2

- Estoque e Entrada XML mockada.
- Financeiro básico.
- Relatórios iniciais.

### MVP 3

- SNGPC mockado.
- Farmácia Popular/PBM mockado.
- Fiscal/NFC-e mockado.
- Permissões e multiempresa.

## Campos principais do Produto

- Código interno.
- Código.
- Referência.
- Código de barras.
- Nome.
- Descrição.
- Unidade.
- Tipo.
- Categoria.
- Subcategoria.
- Fabricante.
- Fornecedor.
- Princípio ativo.
- Apresentação.
- Registro Ministério da Saúde.
- Produto ativo.
- Permite desconto.
- Permite venda fracionada.
- Controla lote.
- Controla vencimento.
- Permite comissão.
- Participa de PBM.
- Participa do Farmácia Popular.
- Grupo tributário.
- CST.
- CFOP.
- Origem.
- NCM.
- CEST.
- ICMS.
- PIS.
- COFINS.
- IPI.
- Preço de compra.
- Custo.
- Custo médio.
- Preço sugerido.
- Preço de venda.
- Preços alternativos.
- Desconto máximo.
- Estoque mínimo.
- Estoque máximo.
- Lote.
- Vencimento.
- Localização.

## Regras críticas

- Não vender produto vencido.
- Alertar produto próximo do vencimento.
- Bloquear desconto acima do máximo permitido.
- Exigir lote para produto com controle de lote.
- Exigir dados de receita para produto controlado.
- Baixar estoque ao finalizar venda.
- Gerar financeiro ao finalizar venda.
- Marcar documento fiscal como mockado no MVP.
- Registrar movimentações de estoque com usuário, data e origem.
