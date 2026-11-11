# DRS

Sistema de gerenciamento de pilotos de Fórmula 1, com cadastro, busca e uma interface inspirada na identidade visual das corridas.

## Funcionalidades

- Cadastro, edição, visualização e exclusão de pilotos
- Busca por nome ou equipe, com paginação
- Busca de piloto implementada com o padrão Factory
- Validação centralizada em Form Request
- Interface em português, com tema escuro em vermelho e roxo

## Tecnologias

- PHP 8.2 e Laravel 12
- Blade e Bootstrap 5.3
- SQLite por padrão, compatível com MySQL e PostgreSQL via `.env`

## Estrutura

```
app/
  DesignPatterns/Factory/   Piloto e PilotoFactory
  Http/Controllers/         PilotoController
  Http/Requests/            PilotoRequest
  Models/                   Piloto
resources/views/pilotos/    listagem, cadastro, edição, detalhes e busca Factory
```

## Como rodar

Pré-requisitos: PHP 8.2+ e Composer.

```bash
git clone https://github.com/mtepeaceful/DRS.git
cd DRS
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan serve
```

A aplicação fica disponível em `http://localhost:8000`.

## Próximos passos

A versão 2 está em planejamento, com API em Node.js e TypeScript, PostgreSQL e interface em React.
