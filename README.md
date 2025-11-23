# Lego Batman CRUD

Aplicação temática do Lego Batman com:

- Front-end em React
- Back-end em Node, Express e SQLite
- Autenticação com JWT e token salvo em cookie
- CRUD completo de personagens do Lego Batman
- Cadastro de usuário com email e senha

## Estrutura de pastas

```text
lego-batman-crud/
  package.json
  /public
    index.html
  /src
    App.js
    index.js
    index.css
    /services
      api.js
    /utils
      auth.js
    /components
      /Layout
        Navbar.js
      /Auth
        Login.js
        Logout.js
        Register.js
      /Items
        ItemList.js
        ItemDetail.js
        ItemForm.js
  /backend
    package.json
    server.js
    lego-batman.db
```

## Como rodar o back-end

```bash
cd backend
npm install
npm start
```

Servidor em: http://localhost:3001

Usuário padrão criado automaticamente:

- email: batman@lego.com
- senha: batcaverna

## Como rodar o front-end

Em  terminal separado:

```bash
cd lego-batman-crud
npm install
npm install axios js-cookie react-router-dom@5
npm start
```

Aplicação em: http://localhost:3000

## Fluxo de autenticação e cadastro

### Login

1. Acessar /login e enviar email e senha.
2. O front faz POST http://localhost:3001/api/login com JSON.
3. O back valida no SQLite e devolve 200 com { "token": "..." }.
4. O token é salvo em cookie (authToken).
5. Axios adiciona Authorization: Bearer <token> em todas as requisições.
6. O back protege todas as rotas /api/characters com JWT.

### Cadastro

1. Acessar /register.
2. Preencher email, senha e confirmação de senha.
3. O front faz POST http://localhost:3001/api/register com JSON.
4. O back cria o usuário no SQLite e devolve 201 com { "token": "..." }.
5. O token é salvo em cookie e o usuário é redirecionado para o inventário.

Se o email já estiver cadastrado, o backend devolve 409 e o frontend exibe a mensagem adequada.

## Endpoints da API

Autenticação:

- POST /api/login
- POST /api/register

Personagens:

- GET /api/characters
- GET /api/characters/:id
- POST /api/characters
- PUT /api/characters/:id
- DELETE /api/characters/:id

Códigos de resposta utilizados:

- 200: sucesso em consultas e atualização
- 201: criação de recurso (usuário ou personagem)
- 204: remoção de personagem
- 400: requisição inválida
- 401: autenticação inválida ou não enviada
- 404: não encontrado
- 409: conflito (email já cadastrado)
- 500: erro interno
