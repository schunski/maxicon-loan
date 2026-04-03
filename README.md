# Maxicon — Empréstimos (Node + Express + PostgreSQL + Docker)
Uma aplicação simples para gerenciamento e cálculo de empréstimos, com integração em tempo real às cotações do Banco Central do Brasil (BCB).

## Tecnologia e Requisitos

| Ferramenta | Versão | Uso |
|--------------|-----|-----|
| [Docker](https://docs.docker.com/get-docker/) | Latest | Orquestração da aplicação e banco de dados |
| Node.js | **≥ 18** | Ambiente de execução para desenvolvimento local |
| PostgreSQL | **15+** | Armazenamento de dados relacionais |


## Execução via Docker (Recomendado)
A maneira mais rápida de subir o projeto é utilizando o Docker Compose. O serviço da aplicação possui um healthcheck que garante que ela só inicie após o banco de dados estar pronto para conexões.

No terminal, na raiz do projeto, execute:

```bash
docker compose up --build
```

Abra **http://localhost:3000**. O serviço `app` só inicia depois que o Postgres estiver saudável (`healthcheck`).

- Front-end: porta `3000`
- PostgreSQL: porta `5432` — usuário `admin`, senha `Maxicon123@`, banco `maxicon`

Para encerrar os serviços: `Ctrl+C` ou `docker compose down`.

## Desenvolvimento local (Node na máquina + Postgres no Docker)

```bash
docker compose up -d postgres
copy .env.test .env
npm install
npm run dev
```

Use o `DATABASE_URL` do `.env.test` (localhost). Na URL, o `@` da senha deve ir codificado como `%40`.

## Testes

```bash
npm test
```

## Estrutura do projeto

```
schema.sql
src/
  index.js
  app.js
  database.js
  async-handler.js
  calculations.js
  exchange-rates.js
  loan-presenter.js
  public/            # estáticos (CSS, IMG, etc.)
  views/             # templates EJS
  routes/
    customers.js
    loans.js
    quotes.js
tests/               # testes automatizados
```

Tabelas no PostgreSQL: `customers` (`id`, `name`), `loans` (`customer_id`, `loan_date`, `currency`, `amount`, `brl_rate`, `due_date`, `annual_interest_rate_percent`, `quote_reference_date`, …).

## Dados abertos — BCB

Moedas e cotações PTAX via serviço Olinda do Banco Central (`olinda.bcb.gov.br`).
