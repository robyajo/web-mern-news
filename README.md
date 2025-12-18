# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Menjalankan dengan PM2 (Production, 1 Server dengan API)

Misal backend `api-news` berjalan di port `4000`, dan frontend `web-news` di port `3000` via React Router serve.

1. Build aplikasi:

```bash
npm run build
```

2. Buat file `ecosystem.config.js` di root monorepo (sejajar dengan folder `api-news` dan `web-news`):

```js
module.exports = {
  apps: [
    {
      name: "api-news",
      cwd: "./api-news",
      script: "dist/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
    {
      name: "web-news",
      cwd: "./web-news",
      script: "node_modules/.bin/react-router-serve",
      args: "./build/server/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

3. Jalankan dengan PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Frontend akan tersedia di `http://localhost:3000` (bisa diarahkan melalui Nginx), dan backend di `http://localhost:4000`.

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
