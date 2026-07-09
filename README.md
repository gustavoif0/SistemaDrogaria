# PharmaERP - ERP academico para drogarias

Primeira base funcional do ERP web para drogarias/farmacias, criada a partir do blueprint do prototipo `PharmaERP.dc.html`.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router.
- Estado do MVP: React Context + hooks, com dados mockados realistas.
- Backend planejado: Node.js + Express/Fastify + TypeScript.
- Banco planejado: PostgreSQL + Prisma ORM.
- Testes planejados: Playwright para fluxos e unitarios onde fizer sentido.

## Como rodar

### 1. Conferir ferramentas

Antes de instalar as dependencias, confira as versoes no PowerShell:

```powershell
node -v
npm.cmd -v
where.exe node
where.exe npm
```

Versoes necessarias para este projeto:

- Node.js 18 ou superior.
- npm 8 ou superior.

Padrao recomendado para manter igual ao PC antigo:

- Node.js `v24.16.0`.
- npm instalado junto com o Node 24, executado no PowerShell como `npm.cmd`.

Se o comando `npm -v` falhar com erro de `npm.ps1` bloqueado, use `npm.cmd -v`. Isso e esperado quando a politica de execucao do PowerShell bloqueia scripts `.ps1`.

Se aparecer Node `v10.x` ou npm `6.x`, atualize o Node antes de continuar. O Vite usado no frontend nao funciona com Node 10.

### 2. Instalar dependencias

Na raiz do projeto:

```bash
npm.cmd install
```

Tambem funciona com `npm install` se o PowerShell da maquina permitir executar `npm.ps1`.

### 3. Rodar em desenvolvimento

Na raiz do projeto:

```bash
npm.cmd run dev
```

Importante: rode apenas `npm.cmd run dev` ou `npm run dev`. Nao acrescente `@pharmaerp/web` depois do comando.

O frontend abre em:

```text
http://127.0.0.1:5173
```

Build de producao:

```bash
npm.cmd run build
```

### Solucao rapida para PC novo

Se o PC novo estiver com Node `v10.24.1` e npm `6.14.12`, instale o Node `v24.16.0` para Windows, feche e abra o PowerShell, e confira novamente:

```powershell
node -v
npm.cmd -v
```

## Rotas entregues

- `/dashboard`
- `/produtos`
- `/balcao`
- `/pdv`
- `/estoque/entrada`
- `/financeiro`
- `/sngpc`
- `/relatorios`
- `/configuracoes`

Tambem existem rotas de apoio para preservar a navegacao do prototipo: `/fiscal`, `/pbm`, `/integracoes` e `/multiempresa`.

## Fluxo MVP

1. Abra o Dashboard.
2. Cadastre ou consulte produtos em Produtos.
3. Abra Atendimento ao Balcao.
4. Pesquise um produto, selecione lote quando necessario e informe quantidade/desconto.
5. Envie a pre-venda para o caixa.
6. Abra PDV / Caixa.
7. Recupere a pre-venda, selecione pagamento e finalize.
8. O sistema baixa estoque, registra venda e gera movimento financeiro mockado.
9. Dashboard, Financeiro e Relatorios passam a refletir a operacao.

## Regras implementadas no MVP

- Produto inativo nao pode ser vendido.
- Produto sem venda fracionada exige quantidade inteira.
- Estoque negativo e bloqueado.
- Desconto acima do limite do produto e bloqueado.
- Produto sem desconto bloqueia desconto.
- Produto com lote exige lote selecionado.
- Lote vencido bloqueia venda.
- Produto controlado exige receita informada no fluxo SNGPC mockado.
- Venda finalizada baixa estoque e gera financeiro.
- Documento fiscal e registrado como mockado/autorizado.

## Estrutura

```text
apps/
  web/
    src/
      components/
      lib/
      mocks/
      modules/
      store/
      types/
  api/
    prisma/
docs/
  diagnostico-tecnico.md
codex_erp_drogaria_agents_skills/
```

## Decisoes importantes

- O HTML original `PharmaERP.dc.html` nao esta presente nesta worktree. A interface foi reconstruida a partir do blueprint, AGENTS e skills locais.
- Fiscal, SNGPC, Farmacia Popular, PBM, Pix e XML permanecem mockados, sem integracao real.
- O frontend foi criado com separacao por modulos para facilitar a migracao futura para API REST.
- O schema Prisma inicial em `apps/api/prisma/schema.prisma` documenta a direcao do modelo PostgreSQL, mas a persistencia real fica para a proxima etapa.
