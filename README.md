# DRS

Sistema de gerenciamento de pilotos de Fórmula 1, com cadastro, busca e uma interface inspirada na identidade visual das corridas.

O nome vem do Drag Reduction System, a asa traseira móvel que abre na reta. No logo, o flap da asa abre sempre que a aplicação busca dados.

## Funcionalidades

- Grid de pilotos com busca ao vivo por piloto ou equipe, filtro por equipe e paginação
- Cadastro e edição de pilotos com prévia do cartão em tempo real
- Bandeira do país de cada piloto
- Equipes com cores próprias e emblema, com cores clássicas sugeridas no cadastro
- Validação compartilhada entre API e interface, com mensagens em português

## Tecnologias

- **API:** Node.js, TypeScript, Fastify, Drizzle ORM, PostgreSQL
- **Interface:** React, Vite, React Router, TanStack Query, React Hook Form
- **Compartilhado:** schemas Zod usados pelos dois lados
- **Qualidade:** Vitest, ESLint, Prettier

## Arquitetura

Monorepo com pnpm workspaces:

```
apps/
  api/                Fastify
    src/domain/       entidades e erros de negócio, sem dependência de framework
    src/application/  casos de uso e portas (interfaces de repositório)
    src/infra/        PostgreSQL com Drizzle e rotas HTTP
  web/                React
    src/features/     telas organizadas por funcionalidade
    src/shared/       componentes, cliente HTTP e utilitários
packages/
  contracts/          schemas Zod compartilhados entre API e interface
```

A regra de dependência entre as camadas da API é verificada pelo ESLint: o domínio não importa a aplicação nem a infraestrutura, e a aplicação não importa a infraestrutura.

## Como rodar

Pré-requisitos: Node.js 24, pnpm (via `corepack enable`) e Docker.

```bash
git clone https://github.com/mtepeaceful/DRS.git
cd DRS
pnpm install
cp .env.example .env
cp apps/api/.env.example apps/api/.env
pnpm db:up
pnpm --filter @drs/api db:migrate
pnpm dev
```

Use a mesma senha em `.env` e em `apps/api/.env`. A interface fica em `http://localhost:5173` e a API em `http://localhost:3333`.

## Testes

```bash
pnpm test
pnpm test:integracao
```

Os testes de integração rodam contra o banco `drs_test`, criado automaticamente pelo Docker Compose.

## Versão 1

A primeira versão, em Laravel, está preservada na tag [`v1.0.0`](https://github.com/mtepeaceful/DRS/tree/v1.0.0).
