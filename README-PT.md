<div align="center">
  <h1>SimplAuth</h1>
  <p><em>Um sistema de autenticação completo dividido em microsserviços dentro de um monorepo.</em></p>

  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
  [![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)
</div>

<hr/>

## Visão geral

O projeto é um monorepo (usando npm workspaces) focado em garantir que o frontend e o backend não percam o sincronismo. Toda a definição das rotas e esquemas de dados fica em um pacote compartilhado, garantindo a mesma tipagem de ponta a ponta.

A aplicação é dividida em 3 partes principais: **autenticação, gestão de usuários e recursos de admin (RBAC)**.

O frontend é razoavelmente simples, pois a maior parte da lógica de validação e autenticação é feita pelo backend. O sistema de autenticação e autorização foi criado para ser seguro, evitando interferência de usuários maliciosos e evitando o vazamento de dados. As sessões são baseadas em tokens JWT (Json Web Tokens):
- **Access Token:** fica exposto no front porém armazenado em memória (para evitar ataques XSS). Possui vida curta e só pode ser criado no backend, através do refresh token.
- **Refresh Token:** É o token principal e o mais seguro, pois fica armazenado em um Cookie HttpOnly e SameSite=Strict (para evitar ataques XSS e CSRF). Possui vida longa e é um token exclusivo do backend que é "queimado" a cada vez que um usuário revalida o Access Token, impossibilitando que usuários maliciosos possam reutilizá-lo.

---

## O que foi implementado

O código inclui os seguintes fluxos principais:

- **Autenticação:** login, cadastro, logout e renovação de sessão usando refresh tokens.
- **Usuários:** tela de perfil (`/me`), edição de dados e exclusão lógica da conta (soft delete).
- **Admin:** painel capaz de gerenciar permissões (membro vs admin) e restaurar usuários que foram excluídos.
- **Frontend:** landing page, home para usuários logados, telas de login e registro, e páginas de erro (not found) usando React e Tailwind CSS.

---

## Rotas da API e documentação

O backend não utiliza *strings* fixas (hardcoded) para definir as rotas. Em vez disso, as rotas são construídas dinamicamente a partir dos objetos no pacote compartilhado (como `routesMetadataV1`). Isso garante que o frontend e o backend sempre apontem para as URLs corretas sem risco de erro de digitação.

**Documentação interativa:**
Ao iniciar o backend, a documentação gerada automaticamente via Scalar (baseada nos schemas do Zod) fica disponível na rota de documentação:
- **[http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)**

Lá você consegue visualizar os contratos, payloads esperados e testar as chamadas direto pelo navegador.

---

## Decisões arquiteturais

Algumas escolhas que direcionaram o desenvolvimento:

### 1. RBAC (Role-Based Access Control) e permissões
A aplicação implementa um controle de acesso baseado em papéis (RBAC). O modelo de usuário no banco conta com uma tabela de permissões (ex: `MEMBER` e `ADMIN`). A API protege as rotas verificando o nível de permissão do usuário de forma escalável, isolando as funcionalidades administrativas (como restauração de contas) apenas para quem tem o papel correto, evitando intervenções mal intencionadas.

### 2. Autenticação e sessão
O fluxo utiliza Access Tokens e Refresh Tokens. Isso permite renovar a sessão do usuário sem obrigá-lo a logar de novo com frequência (renovação silenciosa), além de dar controle para revogar acessos remotamente, caso necessário.

### 3. Single Source of Truth (SSoT)
Para evitar dessincronização, os contratos das rotas e schemas ficam no pacote compartilhado (`shared/src/routes/v1.metadata.ts`). Toda a validação das chamadas é feita via Zod. Qualquer mudança de rotas na API vai fazer o front, o back e a documentação atualizarem ao mesmo tempo.

### 4. Documentação automática
Aproveitando os schemas do Zod no pacote compartilhado, a documentação da API é gerada automaticamente usando o Scalar (`scalar.config.ts`). Com isso, a documentação reflete de forma exata o que o código faz, sem risco de ficar defasada.

### 5. Engenharia de plataforma
O workspace **shared** é tratado como uma biblioteca interna chamada "**@simplauth/shared**", que é buildada durante o processo de desenvolvimento, evitando erros de tipagem do typescript.
O projeto é um monorepo autêntico. Na prática, isso significa que os node_modules estão centralizados no root e cada workspace **(shared, simplauth-api, simplauth-web)** possui apenas um package.json que indica as dependências, além de aliases enxutos feitos para evitar excesso de caminhos relativos *(relative import hell)*

### 6. Integração contínua (CI)
Existe um pipeline no GitHub Actions (`build.yaml`) configurado para rodar a cada push ou PR. Ele roda testes unitários (Vitest) e de integração (Supertest) para barrar problemas antes de chegar na branch principal. Todas as rotas são testadas.

### 7. Versionamento de API
Desde o início, a API foi pensada com versionamento explícito (ex: `/api/v1`). Isso garante que, se houverem mudanças estruturais (breaking changes) no futuro, será possível subir uma `v2` sem quebrar os clientes que ainda consomem a versão anterior. Cada versão possui seus metadados (ex: `/api/v1/v1.metadata.ts`)

---

## Estrutura de pastas

```text
simplauth/
│
├── shared/                # Pacote compartilhado
│   └── src/
│       └── routes/        # v1.metadata.ts e validações Zod
│
├── simplauth-api/         # Backend (Express + Prisma)
│   ├── prisma/            # Schemas do banco (PostgreSQL)
│   ├── src/               
│   │   ├── modules/       # auth/, users/, admin/
│   │   └── config/        # Configuração inicial e Scalar
│   └── tests/             # Testes usando Vitest
│
├── simplauth-web/         # Frontend (React + Vite + Tailwind)
│   └── src/               
│       ├── pages/         # Telas (Login, Register, Profile, etc)
│       └── components/    # Componentes de interface
│
├── .github/workflows/     # Arquivos do GitHub Actions
├── docker-compose.yml     # Configuração do Docker
└── package.json           # Definição dos workspaces e scripts globais
```

---

## Tecnologias utilizadas

- **Linguagem:** TypeScript
- **Backend:** Node.js, Express, Prisma ORM
- **Banco de dados:** PostgreSQL
- **Validação:** Zod
- **Frontend:** React 19, Vite, Tailwind CSS v4, Axios
- **Testes:** Vitest (unitários), Supertest (integração), GitHub Actions (ci)
- **Infraestrutura:** Docker, Docker Compose, NPM Workspaces

---

# ▶️ Como rodar o projeto

Graças ao Docker Compose, você não precisa dar `npm install` localmente para iniciar a aplicação .

Na raiz do projeto (root), execute:

```bash
npm run build
```

Esse script cria os arquivos `.env` copiando o conteúdo dos exemplos e levanta todos os containers (banco, backend e frontend).

> Observação: se as imagens do Docker já estiverem montadas e os ambientes configurados, basta rodar `npm run dev` da próxima vez.

**URLs:**
- Web (Frontend): [http://localhost:5173](http://localhost:5173)
- API (Backend): [http://localhost:3000](http://localhost:3000)
- API (Docs): [http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)

---

## Scripts da raiz do projeto

Esses são os principais atalhos configurados no `package.json` raiz:

- `npm run build`: prepara as envs e sobe os serviços no Docker do zero.
- `npm run dev`: sobe os serviços no Docker Compose (use após o primeiro build).
- `npm run dev:web`: levanta só o servidor do frontend no terminal local.
- `npm run test:unit`: roda os testes unitários do backend.
- `npm run test:integration:local`: executa os testes de integração da API baseado no banco de dados atual.
- `npm run actions`: atalho rápido para fazer stage de tudo, com push forçado.
