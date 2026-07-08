# PharmaERP API - proxima etapa

Esta pasta reserva a base do backend Node.js + TypeScript.

Stack planejada:

- Express ou Fastify.
- Prisma ORM.
- PostgreSQL.
- API REST.

Primeiros endpoints sugeridos:

- `GET /products`
- `POST /products`
- `POST /pre-sales`
- `GET /pre-sales?status=sent_to_cashier`
- `POST /sales/finalize`
- `GET /finance/movements`
- `GET /stock/alerts`

As integracoes fiscal, SNGPC, Farmacia Popular, PBM, Pix e XML devem continuar mockadas ate existir homologacao apropriada.
