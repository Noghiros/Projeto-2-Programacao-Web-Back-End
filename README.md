# Projeto 2 - Programação Web Back-End

## Descrição

Este projeto é uma API RESTful desenvolvida com **Node.js** e **Express.js**, baseada na temática do Projeto 1 (exemplo: mensagens instantâneas estilo WhatsApp). O sistema implementa regras de negócio essenciais, autenticação de usuários via sessões, rotas protegidas, validação de dados e respostas em formato JSON.

---

## Funcionalidades

- Cadastro e login de usuários
- Criação, listagem e exclusão de grupos
- Envio, listagem e exclusão de mensagens
- Autenticação de usuários com sessões (`express-session`)
- Rotas protegidas por middleware de autenticação
- Validação de campos obrigatórios e mensagens de erro claras
- Respostas em formato JSON

---

## Tecnologias Utilizadas

- Node.js
- Express.js
- express-session
- connect-redis (opcional, para produção)
- MongoDB (armazenamento dos dados)
- formidable (para parsing de formulários)

---

## Como Executar

1. **Clone o repositório:**
   ```
   git clone <URL_DO_REPOSITORIO>
   cd Projeto-2-Programacao-Web-Back-End-main
   ```

2. **Instale as dependências:**
   ```
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   - Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
     ```
     MONGODB_URI=mongodb://localhost:27017/nome_do_banco
     SESSION_SECRET=sua_chave_secreta
     ```
   - (Opcional) Configure o Redis para armazenamento de sessões em produção.

4. **Inicie o servidor:**
   ```
   npm start
   ```

5. **Acesse as rotas via Postman, Insomnia ou outro cliente HTTP.**

---

## Estrutura das Rotas

### Usuários
- `POST /register` — Cadastro de usuário
- `POST /login` — Login de usuário
- `POST /logout` — Logout de usuário
- `DELETE /user/delete/:id` — Exclusão de usuário (protegida)

### Grupos
- `POST /groups` — Criação de grupo (protegida)
- `GET /groups` — Listagem de grupos
- `DELETE /groups/:id` — Exclusão de grupo (protegida)

### Mensagens
- `POST /chat` — Envio de mensagem (protegida)
- `GET /chat` — Listagem de mensagens (protegida)
- `DELETE /chat/delete/:id` — Exclusão de mensagem (protegida)

---

## Segurança

- Rotas sensíveis protegidas por middleware de autenticação (`requireAuth`)
- Sessões garantem a autenticidade dos usuários
- Validação de campos obrigatórios em todas as rotas
- Mensagens de erro claras e status HTTP apropriados

---

## Observações

- O projeto funciona como API REST (sem interface visual).
- Para produção, recomenda-se usar Redis ou outro session store persistente.
- Consulte os controllers para detalhes de validação e tratamento de erros.

---

## Autores

- Stefano Calheiros Stringhini
- Victor Ribeiro Calado
