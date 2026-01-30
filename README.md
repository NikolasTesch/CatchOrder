<div align="center">

# 🍽️ Sistema de Comandas para Restaurantes

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-5.9.3-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Express-5.2.1-lightgrey.svg" alt="Express">
  <img src="https://img.shields.io/badge/SQLite-3-blue.svg" alt="SQLite">
  <img src="https://img.shields.io/badge/Jest-30.2.0-red.svg" alt="Jest">
</p>

Sistema completo de gestão de comandas para restaurantes, desenvolvido com Node.js, TypeScript e arquitetura modular. Controle eficiente de mesas, pedidos, produtos, usuários e muito mais em uma aplicação robusta e escalável.

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Como Usar](#-como-usar)
- [Executando Testes](#-executando-testes)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Banco de Dados](#-banco-de-dados)
- [Contribuindo](#-contribuindo)
- [Autores](#-autores)
- [Licença](#-licença)

---

## 📖 Sobre o Projeto

O **Sistema de Comandas para Restaurantes** é uma aplicação completa desenvolvida para otimizar o gerenciamento de operações em estabelecimentos gastronômicos. Com um banco de dados SQLite enxuto e eficiente, o sistema oferece todas as funcionalidades necessárias para controlar:

- 👥 **Usuários** - Gerenciamento de funcionários e permissões
- 🪑 **Mesas** - Controle de ocupação e status
- 📋 **Pedidos** - Registro e acompanhamento de comandas
- 🍔 **Produtos** - Catálogo completo do cardápio
- 💰 **Pagamentos** - Processamento e histórico financeiro

Ideal para restaurantes, bares, cafeterias e food trucks que buscam modernizar sua gestão operacional.

---

## ✨ Funcionalidades

### 🔐 Autenticação e Autorização
- [x] Sistema de login com JWT
- [x] Hash de senhas com bcrypt
- [x] Controle de permissões por função

### 👥 Gestão de Usuários
- [x] Criar, visualizar, atualizar e deletar usuários
- [x] Perfis: Admin, Garçom, Cozinha, Caixa

### 🪑 Controle de Mesas
- [x] Cadastro e gestão de mesas
- [x] Status: Livre, Ocupada, Reservada
- [x] Associação com pedidos

### 📋 Gerenciamento de Pedidos
- [x] Criar pedidos associados a mesas
- [x] Adicionar/remover itens do pedido
- [x] Status: Pendente, Em Preparo, Pronto, Entregue
- [x] Cálculo automático de totais

### 🍔 Catálogo de Produtos
- [x] CRUD completo de produtos
- [x] Categorização (Bebidas, Pratos, Sobremesas, etc)
- [x] Controle de preços e disponibilidade

### 💳 Sistema de Pagamentos
- [x] Fechamento de contas
- [x] Múltiplas formas de pagamento
- [x] Histórico de transações

---

## 🛠️ Tecnologias

Este projeto foi construído com as seguintes tecnologias:

### Backend
- **[Node.js](https://nodejs.org/)** - Ambiente de execução JavaScript
- **[TypeScript](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática
- **[Express](https://expressjs.com/)** - Framework web minimalista e flexível
- **[SQLite3](https://www.sqlite.org/)** - Banco de dados SQL embutido

### Segurança
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Hash de senhas
- **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)** - Autenticação JWT
- **[cors](https://www.npmjs.com/package/cors)** - Controle de Cross-Origin Resource Sharing
- **[cookie-parser](https://www.npmjs.com/package/cookie-parser)** - Parse de cookies

### Desenvolvimento
- **[Jest](https://jestjs.io/)** - Framework de testes
- **[ts-jest](https://kulshekhar.github.io/ts-jest/)** - Preset Jest para TypeScript
- **[ts-node-dev](https://www.npmjs.com/package/ts-node-dev)** - Hot reload para desenvolvimento

### Outros
- **[dotenv](https://www.npmjs.com/package/dotenv)** - Variáveis de ambiente
- **[uuid](https://www.npmjs.com/package/uuid)** - Gerador de IDs únicos

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 18 ou superior)
- **npm** (geralmente vem com Node.js) ou **yarn**
- **Git** (para clonar o repositório)

Para verificar se já possui instalado:

```bash
node --version
npm --version
git --version
```

---

## 🔧 Instalação

Siga estas etapas para configurar o projeto em sua máquina local:

### 1. Clone o repositório

```bash
git clone https://github.com/NikolasTesch/DesafioRestaurante.git
cd DesafioRestaurante
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Configure as variáveis necessárias:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados
DB_PATH=./database/restaurante.db

# JWT
JWT_SECRET=seu_secret_super_secreto_aqui
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Execute as migrations do banco de dados

```bash
npm run migrate
```

### 5. (Opcional) Popule o banco com dados de teste

```bash
npm run seed
```

---

## 🚀 Como Usar

### Modo Desenvolvimento

Inicia o servidor com hot reload (reinicia automaticamente ao detectar mudanças):

```bash
npm run dev
```

O servidor estará disponível em: `http://localhost:3000`

### Modo Produção

Compile o projeto TypeScript para JavaScript:

```bash
npm run build
```

Inicie o servidor compilado:

```bash
npm start
```

---

## ⚙️ Executando Testes

### Executar todos os testes

```bash
npm test
```

### Executar testes em modo watch

Útil durante desenvolvimento - reexecuta testes automaticamente:

```bash
npm run test:watch
```

### Gerar relatório de cobertura

```bash
npm run test:coverage
```

O relatório será gerado em `coverage/lcov-report/index.html`

### 🔩 Testes Implementados

- ✅ **Testes Unitários** - Controllers e Services isolados
- ✅ **Testes de Integração** - Fluxos completos da API
- ✅ **Mocks** - Request/Response do Express

**Exemplo de saída:**
```
Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        0.588 s
```

---

## 📁 Estrutura do Projeto

```
DesafioRestaurante/
├── 📂 database/              # Banco de dados e migrations
│   ├── migrations/           # Scripts de criação de tabelas
│   └── seeds/                # Dados iniciais para popular BD
├── 📂 public/                # Arquivos estáticos (frontend)
│   ├── css/                  # Estilos
│   ├── img/                  # Imagens
│   └── uploads/              # Upload de arquivos
├── 📂 src/
│   ├── 📂 backend/           # Código do servidor
│   │   ├── app.ts            # Configuração Express
│   │   ├── server.ts         # Inicialização do servidor
│   │   ├── 📂 config/        # Configurações (BD, Auth, etc)
│   │   ├── 📂 controllers/   # Controladores (lógica das rotas)
│   │   ├── 📂 middlewares/   # Middlewares (auth, validation, etc)
│   │   ├── 📂 models/        # Modelos de dados (entidades)
│   │   ├── 📂 routes/        # Definição de rotas da API
│   │   ├── 📂 services/      # Lógica de negócio
│   │   └── 📂 utils/         # Funções utilitárias
│   ├── 📂 frontend/          # Interface do usuário
│   │   ├── 📂 components/    # Componentes reutilizáveis
│   │   ├── 📂 pages/         # Páginas da aplicação
│   │   ├── 📂 services/      # Requisições API
│   │   └── 📂 utils/         # Helpers frontend
│   └── 📂 shared/            # Código compartilhado
│       ├── 📂 dtos/          # Data Transfer Objects
│       └── 📂 types/         # Definições de tipos TypeScript
├── 📂 tests/                 # Testes automatizados
│   ├── 📂 integration/       # Testes de integração
│   └── 📂 unit/              # Testes unitários
├── .env                      # Variáveis de ambiente (não versionado)
├── .gitignore                # Arquivos ignorados pelo Git
├── jest.config.js            # Configuração Jest
├── package.json              # Dependências e scripts
├── tsconfig.json             # Configuração TypeScript
└── README.md                 # Este arquivo
```

---

## 🌐 API Endpoints

### 🔐 Autenticação

| Método | Endpoint        | Descrição           |
|--------|-----------------|---------------------|
| POST   | `/auth/login`   | Login de usuário    |
| POST   | `/auth/logout`  | Logout de usuário   |
| GET    | `/auth/me`      | Dados do usuário    |

### 👥 Usuários

| Método | Endpoint         | Descrição                 |
|--------|------------------|---------------------------|
| GET    | `/users`         | Lista todos os usuários   |
| GET    | `/users/:id`     | Busca usuário específico  |
| POST   | `/users`         | Cria novo usuário         |
| PUT    | `/users/:id`     | Atualiza usuário          |
| DELETE | `/users/:id`     | Remove usuário            |

### 🪑 Mesas

| Método | Endpoint         | Descrição                 |
|--------|------------------|---------------------------|
| GET    | `/tables`        | Lista todas as mesas      |
| GET    | `/tables/:id`    | Busca mesa específica     |
| POST   | `/tables`        | Cria nova mesa            |
| PUT    | `/tables/:id`    | Atualiza mesa             |
| DELETE | `/tables/:id`    | Remove mesa               |

### 📋 Pedidos

| Método | Endpoint              | Descrição                     |
|--------|-----------------------|-------------------------------|
| GET    | `/orders`             | Lista todos os pedidos        |
| GET    | `/orders/:id`         | Busca pedido específico       |
| POST   | `/orders`             | Cria novo pedido              |
| PUT    | `/orders/:id`         | Atualiza pedido               |
| DELETE | `/orders/:id`         | Cancela pedido                |
| POST   | `/orders/:id/items`   | Adiciona item ao pedido       |
| DELETE | `/orders/:id/items/:itemId` | Remove item do pedido  |

### 🍔 Produtos

| Método | Endpoint          | Descrição                   |
|--------|-------------------|-----------------------------|
| GET    | `/products`       | Lista todos os produtos     |
| GET    | `/products/:id`   | Busca produto específico    |
| POST   | `/products`       | Cria novo produto           |
| PUT    | `/products/:id`   | Atualiza produto            |
| DELETE | `/products/:id`   | Remove produto              |

---

## 🗄️ Banco de Dados

### SQLite Schema

O projeto utiliza **SQLite** como banco de dados, ideal para:
- ✅ Desenvolvimento rápido
- ✅ Sem necessidade de servidor de BD
- ✅ Portabilidade total
- ✅ Zero configuração

### Principais Tabelas

```sql
-- Usuários do sistema
users (
  id, name, email, password_hash, role, created_at, updated_at
)

-- Mesas do restaurante
tables (
  id, number, capacity, status, created_at, updated_at
)

-- Pedidos/Comandas
orders (
  id, table_id, user_id, status, total, created_at, updated_at
)

-- Itens dos pedidos
order_items (
  id, order_id, product_id, quantity, unit_price, subtotal
)

-- Produtos do cardápio
products (
  id, name, description, category, price, available, created_at, updated_at
)
```

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Este projeto segue o fluxo de trabalho Git Flow.

### Como contribuir:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature
   ```bash
   git checkout -b feature/MinhaNovaFeature
   ```
3. **Commit** suas mudanças
   ```bash
   git commit -m 'feat: Adiciona nova funcionalidade X'
   ```
4. **Push** para a branch
   ```bash
   git push origin feature/MinhaNovaFeature
   ```
5. Abra um **Pull Request**

### Padrões de Commit

Seguimos o [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

---

## ✒️ Autores

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/NikolasTesch">
        <img src="https://github.com/NikolasTesch.png" width="100px;" alt="Nikolas Tesch"/><br>
        <sub>
          <b>Nikolas Tesch</b>
        </sub>
      </a>
    </td>
  </tr>
</table>

Veja também a lista de [colaboradores](https://github.com/NikolasTesch/DesafioRestaurante/contributors) que participaram deste projeto.

---

## 📄 Licença

Este projeto está sob a licença **ISC**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🎁 Agradecimentos

- 🎓 **Alpha EdTech** - Pela formação e desafio proposto
- 💡 Comunidade Node.js e TypeScript
- 📚 Todos os contribuidores do projeto

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

Desenvolvido com 💙 por [Nikolas Tesch](https://github.com/NikolasTesch)

</div>