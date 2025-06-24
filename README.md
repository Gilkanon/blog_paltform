# 🧠 Blog API Backend

A modern backend API built with **NestJS**, **Prisma**, and **MySQL** to support user authentication, role-based access, subscriptions, and more.

---

## 🚀 Features

- ✍️ **Posts Module** - Create and manage user posts
- 🔒 **Authentication** - JWT and Google OAuth 2.0
- 🧑‍🤝‍🧑 **Subscriptions** - Subscribe to users or posts
- 👮 **Role-Based Access Control** - Admin / Moderator / User roles
- 🔁 **Refresh Tokens** - Secure token renewal
- 📦 **Prisma ORM** - Schema-first MySQL integration
- 🧪 **Unit Testing** - Coverage with Jest
- 🌐 **Swagger** - Auto-generated API documentation

---

## 🛠️ Tech Stack

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type safety across the app
- **Prisma** - ORM for MySQL
- **Passport.js** - Auth strategies (JWT, Google OAuth)
- **Jest** - Unit testing
- **Swagger** - OpenAPI docs

---

## 📦 Installation

```bash
# 1. Clone the repository
git clone https://github.com/Gilkanon/blog_platform.git
cd blog_platform

# 2. Install dependencies
yarn install

# 3. Setup environment variables
cp .env.example .env

# 4. Run database in docker
docker-compose up -d

# 5. Run database migrations
npx prisma migrate dev

# 6. Seed database
npx prisma db seed

# 7. Unit tests
yarn test

# 8. Start the development server
yarn start:dev
```

---

## 🗂️ Project structure

```sh
src/
│
├── auth/ # JWT & Google OAuth logic
├── users/ # User logic & role handling
├── posts/ # Post CRUD operations
├── subscriptions/ # User/Post follow system
├── common/ # Shared decorators, guards, utils
├── prisma/ # Prisma client and config
├── main.ts # App bootstrap
└── app.module.ts # App main module
```

---

## 📚 API Documentation

```markdown
http://localhost:3000/api
```

---

## 🔐 Authentication Flow

- Register or login with username/password
- Or sign in via Google OAuth (/auth/google)
- Backend issues accessToken + refreshToken
- Use accessToken in protected routes (Authorization: Bearer)
