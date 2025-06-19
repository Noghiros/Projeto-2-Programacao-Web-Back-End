# Projeto 2 - Programação Web Back-End

## Descrição

Este projeto é uma aplicação web desenvolvida com **Node.js** e **Express.js**, baseada na temática escolhida no Projeto 1 (exemplo: mensagens instantâneas estilo WhatsApp). O sistema implementa as principais regras de negócio, autenticação de usuários via sessões, rotas protegidas e validação de dados, retornando respostas em formato JSON (API REST).

---

## Funcionalidades

- Cadastro e login de usuários
- Criação, listagem e exclusão de grupos
- Envio, listagem e exclusão de mensagens
- Autenticação de usuários com sessões (express-session)
- Rotas protegidas por middleware de autenticação
- Validação de campos obrigatórios e mensagens de erro claras
- Respostas em formato JSON

---

## Tecnologias Utilizadas

- Node.js
- Express.js
- express-session
- connect-redis (opcional, para produção)
- MongoDB
- formidable (para parsing de formulários)

---

## Como Executar

1. Instale as dependências:
   ```
   npm install
   ```

2. (Opcional) Configure o Redis para armazenamento de sessões em produção.

3. Inicie o servidor:
   ```
   npm start
   ```

4. Acesse as rotas via Postman, Insomnia ou outro cliente HTTP.

---

## Estrutura das Rotas

- **Usuários**
  - `POST /register` — Cadastro de usuário
  - `POST /login` — Login de usuário
  - `POST /logout` — Logout de usuário
  - `DELETE /user/delete/:id` — Exclusão de usuário (protegida)

- **Grupos**
  - `POST /groups` — Criação de grupo (protegida)
  - `GET /groups` — Listagem de grupos
  - `DELETE /groups/:id` — Exclusão de grupo (protegida)

- **Mensagens**
  - `POST /chat` — Envio de mensagem (protegida)
  - `GET /chat` — Listagem de mensagens (protegida)
  - `DELETE /chat/delete/:id` — Exclusão de mensagem (protegida)

---

## Segurança

- Rotas sensíveis são protegidas por middleware de autenticação (`requireAuth`).
- Sessões são usadas para garantir a autenticidade dos usuários.
- Campos obrigatórios são validados em todas as rotas de entrada de dados.
- Mensagens de erro são claras e usam status HTTP apropriados.

---

## Observações

- O projeto pode ser utilizado como API REST (sem interface visual).
- Para produção, recomenda-se usar Redis ou outro session store persistente.
- Consulte os controllers para detalhes de validação e tratamento de erros.

---

## Autores

- [Stefano Calheiros Stringhini]
- [Victor Ribeiro Calado]
