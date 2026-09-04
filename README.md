# SL Disaster Relief Connect

A web platform connecting disaster relief efforts in Sri Lanka, built with React, Vite, and Firebase.

## Tech Stack

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) 8
- [Firebase](https://firebase.google.com/) (Analytics, and additional SDKs as needed)
- [oxlint](https://oxc.rs/docs/guide/usage/linter.html) for linting

## Getting Started

### Prerequisites

- Node.js and npm installed

### Install dependencies

```bash
npm install
```

### Run the dev server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
  App.jsx        # Root component
  main.jsx       # App entry point
  firebase.js    # Firebase configuration and initialization
  assets/        # Images and static assets
  features/      # Feature modules
    admin/       # Admin module
    user/        # User module
    news/        # News module
    relief/      # Relief module
public/          # Static files served as-is
```
