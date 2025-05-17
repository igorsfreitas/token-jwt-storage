# Master class - Qual lugar correto para armazenar tokens JWT?

[https://www.youtube.com/watch?v=ku3yPGnfNuA](https://www.youtube.com/watch?v=ku3yPGnfNuA)

## Sobre o conteúdo do projeto

Nesta aula exploramos as melhores práticas para armazenamento de tokens JWT em aplicações web. O projeto demonstra diferentes abordagens de armazenamento usando cookies HTTP com proteção CSRF, destacando aspectos de segurança essenciais como HttpOnly, Secure e Same-Site cookies.

## Pré-requisitos

- Node.js (versão 23 ou superior)
- NPM ou Yarn

## Instruções para rodar

1. Clone o repositório
2. Instale as dependências:
   ```bash
   cd jwt-app
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npx nodemon src/session-local-storage/app.ts # exemplo com session e local storage
   npx nodemon src/cookie/app.ts # exemplo com cookie de sessão

   ```
5. Para rodar o cliente frontend:
   ```bash
   cd spa-frontend
   npm install
   npm run dev
   ```

### Conheça nossas formações

Acesse nosso site https://fullcycle.com.br para conhecer nossas formações
