##  Table of Contents

- [ Overview](#-overview)
- [ Features](#-features)
- [ Project Structure](#-project-structure)
- [ Getting Started](#-getting-started)
  - [ Prerequisites](#-prerequisites-for-docker-build)
  - [ Prerequisites in dev](#-+-prerequisites-for-dev-mode-with-a-database-in-docker)
  - [ Installation](#-install-repository)
  - [ Testing](#-testing)

---

##  Overview

### **Weather Forecast API** is a NestJS micro-service that:

- fetches real-time weather data for any city (WeatherAPI.com integration);  
- lets users subscribe for e-mail updates with *hourly* or *daily* frequency;
- delivers scheduled weather digests via a background CRON worker;
- is fully containerised (Docker + Docker Compose);
- has a fully functioning swagger deployment -> [view deployment](https://genesis-test-assignment-production.up.railway.app/api/).
- and a minimalist page to demonstrate the functionality -> [view deployment](https://genesis-test-assignment-production.up.railway.app/).

---

##  Features

❯ ✉️  **Subscription workflow**  
   — `POST /subscribe` (form-data: *email*, *city*, *frequency*)  
   — `GET  /confirm/{token}` → confirm subscription  
   — `GET  /unsubscribe/{token}` → instant opt-out

❯ ☀️  **Weather endpoint**  
   — `GET /weather?city=Kyiv` returns `{ temperature, humidity, description }`  

❯ 🗓  **Scheduler**  
   — CRON `0 * * * *`  → sends *hourly* e-mails  
   — CRON `0 9 * * *`  → sends *daily* e-mails at 09:00 UTC+0  
   — Batched by city: only one WeatherAPI call per unique location

❯ 🛠  **Developer-friendly**  
   — Hot reload in dev (`pnpm start:dev`)  
   — `pnpm test` / `test:watch` / `test:e2e` targets  
   — ESLint + Prettier
   
---

##  Project Structure

```sh
└── genesis-test-assignment/
    ├── Dockerfile
    ├── README.md
    ├── docker-compose.yml
    ├── nest-cli.json
    ├── package.json
    ├── pnpm-lock.yaml
    ├── public
    │   ├── pages
    ├── src
    │   ├── common
    │   ├── config
    │   ├── email
    │   ├── migrations
    │   ├── scheduler
    │   ├── subscription
    │   ├── weather
    │   ├── app.module.ts
    │   ├── data-source.ts
    │   └── main.ts
    ├── test
    │   ├── app.e2e-spec.ts
    │   └── jest-e2e.json
    ├── tsconfig.build.json
    └── tsconfig.json
```

---
##  Getting Started

###  Prerequisites for docker build

Before getting started with genesis-test-assignment, ensure your runtime environment meets the following requirements:

- **Node.js:** [version 22 LTS](https://nodejs.org/en)
- **Container Runtime:** [Docker](https://www.docker.com/)

###  + Prerequisites for dev mode with a database in docker
- **Nest cli:**
```sh
❯ npm install -g @nestjs/cli
```
- **Package Manager:** Pnpm
```sh
❯ npm install -g pnpm
```


###  Install repository
**Build from source:**

1. Clone the genesis-test-assignment repository:
```sh
❯ git clone https://github.com/Kyryloloshka/genesis-test-assignment
```

2. Navigate to the project directory:
```sh
❯ cd genesis-test-assignment
```
3. Build docker container
```sh
❯ docker compose up --build
```
4. Open localhost:5000/api/
   &nbsp;
5. Or if you wish to start in dev mode also:
 
**Install dependencies using `pnpm`** 
```sh
❯ pnpm i
```

**Start project in dev mode `pnpm`** 
```sh
❯ pnpm start:dev
```
**And after open localhost:3000/api/**

###  Testing
Run the test suite using the following command:
**Using `pnpm`** &nbsp;

```sh
❯ pnpm test
```

---
