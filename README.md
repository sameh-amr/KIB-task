# KIB Movies API

A clean-architecture NestJS service for movie data, ratings, and favorites, powered by TMDB and PostgreSQL. Ships with API docs, caching, unit tests, and Docker Compose.

---

## How to Run

### 1. Setup Environment
Copy the example environment file and add your TMDB keys:
```sh
cp .env.example .env
# Edit .env and add TMDB_API_KEY and TMDB_READ_TOKEN
```

### 2. Run with Docker (Recommended)
```sh
docker-compose up --build
```
- API: [http://localhost:8080/api](http://localhost:8080/api)
- Swagger UI: [http://localhost:8080/api/docs](http://localhost:8080/api/docs)
- Scalar UI: [http://localhost:8080/api/reference](http://localhost:8080/api/reference)

### 3. Local Development (without Docker)
Prerequisites: Node 20, PostgreSQL, `.env` configured.
```sh
npm ci --legacy-peer-deps
npm run start:dev
```

---

## How to Test

- Run all tests:
  ```sh
  npm test
  ```
- Watch mode:
  ```sh
  npm run test:watch
  ```
- Coverage report:
  ```sh
  npm run test:cov
  ```
  Open coverage HTML: `coverage/unit/lcov-report/index.html`

---

## API Endpoints

### Movies
- **List movies:**  
  `GET /api/movies?page=1&limit=10&q=batman&genreId=28`
- **Get movie:**  
  `GET /api/movies/:id`
- **Rate movie:**  
  `POST /api/movies/:id/ratings`  
  Body: `{ "userId": "u1", "rating": 5 }`
- **Add favorite:**  
  `POST /api/movies/:id/favorite`  
  Body: `{ "userId": "u1" }`
- **Remove favorite:**  
  `DELETE /api/movies/:id/favorite`  
  Body: `{ "userId": "u1" }`

### Genres
- **List genres:**  
  `GET /api/genres`

### Favorites
- **List favorites:**  
  `GET /api/favorites?userId=u1&page=1&limit=10`

Explore endpoints interactively in Swagger or Scalar UI.

---

## Architecture & Features

- **Clean Architecture:**  
  Four layers (Domain, Application, Infrastructure, Interface) with CQRS and Repository patterns.
- **Tech Stack:**  
  Node 20, NestJS 9, PostgreSQL 15, TypeORM, Axios, Swagger, Scalar, cache-manager, Jest, Docker.
- **Caching:**  
  In-memory cache for fast queries, selective updates after ratings/favorites.
- **TMDB Sync:**  
  On boot, syncs genres and popular movies from TMDB.
- **Testing:**  
  Jest-based unit tests, coverage gate configurable.
- **Docker Compose:**  
  One command to start API and database.

---

## Troubleshooting

- **Migrations not running:**  
  Ensure `data-source.ts` compiles and migrations run before API starts.
- **Swagger/Scalar 404:**  
  Use `/api/docs` and `/api/reference` URLs.
- **Reset DB:**  
  ```sh
  docker-compose down -v
  docker-compose up --build
  ```

---

## Scripts

Common commands:
- `npm run start:dev` – Start in watch mode
- `npm run test` – Run tests
- `npm run test:cov` – Coverage report
- `npm run migration:run` – Run migrations
- `npm run db:ensure` – Ensure DB exists

---