# api-topaz

Encurtador de URLs — desafio técnico com backend Java (Spring Boot / WildFly) e frontend React.

> Projeto desenvolvido no contexto da **[Topaz Evolution](https://www.topazevolution.com/)** — plataforma full banking especializada em soluções digitais para o setor financeiro (parte do Grupo Stefanini).

## O que o projeto faz

O **api-topaz** encurta URLs longas em links curtos e redireciona visitantes para o destino original.

### Fluxo do usuário (frontend)

1. **Login** em `/login` com credenciais validadas no backend (`admin` / `admin` por padrão).
2. **Encurtar URL** em `/shorten` — informa URL original e alias opcional.
3. **Gerenciar links** em `/urls` — lista, edita ou exclui URLs salvas.
4. **Compartilhar** — copia ou abre o link encurtado (`http://localhost:8080/{codigo}`).
5. **Visitante** acessa `/{codigo}` no navegador e recebe **HTTP 302** para a URL original.

### Fluxo técnico

```
Frontend (React)  --Basic Auth-->  API /api/urls  -->  Service  -->  Port  -->  JPA/H2
Visitante         --sem auth-->    GET /{codigo}  -->  redirect 302
```

---

## Escopo do desafio (core vs extras)

O desafio foi pensado para **~6 horas de esforço essencial**. Este repositório entrega o mínimo exigido e inclui itens opcionais que pontuam no critério de avaliação. A tabela abaixo deixa explícito o que é **obrigatório (core)** e o que foi **adicionado além do essencial (extras)** — para o avaliador não interpretar over-engineering sem contexto.

| Item | Classificação | Observação |
|------|---------------|------------|
| Backend Java + API REST | **Core** | Requisito mínimo |
| `synchronized create()` (1 req por vez) | **Core** | Requisito mínimo explícito |
| Persistência (H2 + Flyway) | **Core** | Requisito mínimo (persistência opcional, implementada) |
| Redirect `GET /{codigo}` → 302 | **Core** | Fluxo principal do desafio |
| Encurtar com alias opcional + Base62 | **Core** | Fluxo principal do desafio |
| README (rodar, design, trade-offs) | **Core** | Requisito mínimo |
| Frontend React (encurtar + copiar) | **Extra opcional** | Pontua no desafio; entregue além do mínimo |
| Login + página separada | **Extra** | Não exigido; protege `/api/**` e melhora UX |
| CRUD (listar, editar, excluir URLs) | **Extra** | Não exigido; evolução pedida durante o desenvolvimento |
| Swagger OpenAPI 3.0 | **Extra** | Documentação viva da API; facilita avaliação |
| Spring Security (Basic Auth) | **Extra** | Segurança da API administrativa |
| Testes automatizados (backend + frontend) | **Extra opcional** | Pontua no desafio |
| Docker Compose + CI/CD | **Extra opcional** | Pontua no desafio; Fase 3 |
| Deploy e teste em WildFly 10 | **Fora do escopo** | WAR preparado (`jboss-web.xml`); **não será testado nesta entrega** |

**Por que os extras não atrapalham:** o fluxo mínimo do desafio (digitar URL → gerar → copiar → redirect) funciona sem depender de login, lista ou Swagger. Login e CRUD são camadas administrativas sobre a mesma API; Swagger substitui pasta `docs/` separada.

**O que faria se tivesse só 6h:** backend completo (create + redirect + persistência + testes essenciais) + frontend de uma página (formulário de encurtar + resultado), sem login separado, sem listagem/edição e sem Docker.

---

## Arquitetura

Monorepo com separação clara entre backend, frontend e documentação viva da API.

```
api-topaz/
├── backend/                 # API REST — Spring Boot 2.7 (WAR para WildFly 10)
│   └── src/main/java/com/topaz/shortener/
│       ├── controller/        # UrlController (CRUD) + RedirectController (público)
│       ├── service/           # Regras de negócio (create sincronizado, Base62, alias)
│       ├── port/              # UrlPersistencePort (contrato de persistência)
│       ├── infrastructure/    # UrlPersistenceJpaAdapter + JpaRepository
│       ├── domain/            # UrlMapping (entidade JPA)
│       ├── dto/               # Request/Response da API
│       ├── config/            # Security, CORS, OpenAPI, Actuator
│       ├── exception/         # Tratamento global de erros
│       └── util/              # AliasValidator, Base62, paths reservados
│   └── src/main/webapp/WEB-INF/   # Config WildFly (só usada no deploy WAR)
│       ├── jboss-web.xml          # Context root /api-topaz
│       └── jboss-deployment-structure.xml
├── frontend/                  # SPA React + TypeScript + Tailwind + React Router
│   └── src/
│       ├── pages/             # LoginPage, ShortenerPage, UrlListPage
│       ├── components/        # UrlForm, EditUrlModal, AppLayout
│       ├── contexts/          # AuthContext (sessão + validação no backend)
│       ├── services/          # urlApi, auth
│       └── utils/             # Validação de URL e alias (alinhada ao backend)
├── README.md
├── docker-compose.yml
└── scripts/ci-local.ps1
```

### Padrão Port/Adapter (backend)

| Camada | Responsabilidade |
|--------|------------------|
| **Controller** | HTTP — recebe requisição, devolve status/body |
| **Service** | Regras de negócio — validação de alias, geração Base62, `synchronized create()` |
| **Port** | Interface `UrlPersistencePort` — desacopla domínio da tecnologia de banco |
| **Adapter** | `UrlPersistenceJpaAdapter` — implementa o port com Spring Data JPA |

Um único adapter JPA atende H2 (dev) e PostgreSQL (produção) via profile Spring — sem adapter por banco.

### Duas controllers, dois propósitos

| Controller | Rotas | Autenticação | Uso |
|------------|-------|--------------|-----|
| `UrlController` | `/api/urls` | Basic Auth | CRUD administrativo (frontend) |
| `RedirectController` | `/{shortCode}` | Pública | Redirecionamento estilo goo.gl |

### Frontend

| Página | Rota | Função |
|--------|------|--------|
| Login | `/login` | Autenticação validada contra `GET /api/urls` |
| Encurtar | `/shorten` | Criar link encurtado |
| URLs salvas | `/urls` | Listar, editar, excluir |

Layout com menu lateral após login. Credenciais persistidas em `sessionStorage`.

### Trade-off documentado

O desafio sugere stack JAX-RS/CDI/JDBC no WildFly. Este projeto usa **Spring Boot empacotado como WAR** para WildFly 10, priorizando produtividade, testes e ecossistema Spring, mantendo compatibilidade estrutural com o application server exigido.

**Validação em runtime:** o backend foi desenvolvido e testado com **Tomcat embedded** (`mvn spring-boot:run`) e via **Docker** (profile Spring `postgres` no Compose). O artefato WAR (`api-topaz.war`), o `ServletInitializer` e os arquivos em `src/main/webapp/WEB-INF/` estão **preparados** para WildFly 10, mas **o deploy em WildFly real não faz parte desta entrega e não será executado** — decisão consciente para priorizar o fluxo funcional, testes automatizados e avaliação via Docker/dev local.

---

## API REST

Documentação interativa: **http://localhost:8080/swagger-ui.html**

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| `GET` | `/api/urls` | Sim | Lista URLs salvas |
| `POST` | `/api/urls` | Sim | Cria URL encurtada |
| `PUT` | `/api/urls/{id}` | Sim | Atualiza URL original e/ou alias |
| `DELETE` | `/api/urls/{id}` | Sim | Exclui URL |
| `GET` | `/{shortCode}` | Não | Redireciona para URL original (302) |
| `GET` | `/actuator/health` | Não | Health check |
| `GET` | `/v3/api-docs` | Não | OpenAPI 3.0 JSON |

### Credenciais padrão

Configuradas em `backend/src/main/resources/application.yml`:

```yaml
app:
  security:
    username: admin
    password: admin
```

### Formato do link encurtado

```
{base-url}/{codigo}
```

Exemplos:
- Com alias: `http://localhost:8080/minha-alura`
- Auto (Base62): `http://localhost:8080/a`

Em produção, configure `app.base-url` com um domínio curto dedicado (ex.: `https://go.topazevolution.com` ou subdomínio definido pela Topaz).

### Regras de alias e redirect

| Regra | Onde |
|-------|------|
| Alias customizado: 3–20 caracteres (`a-z`, `0-9`, `-`) | `AliasValidator` + formulários React |
| Aliases reservados bloqueados (`api`, `login`, `actuator`, etc.) | `ReservedPathValidator` no create/update e no redirect |
| Código auto-gerado (Base62) pode ter 1+ caracteres | `UrlShortenerServiceImpl` |
| `create()` e `update()` sincronizados | Requisito do desafio + evita corrida de alias na JVM |
| Contador de acessos incrementado atomicamente no banco | `incrementAccessCount` no redirect |
| Sessão expirada (401) faz logout automático no frontend | `ShortenerPage` e `UrlListPage` |

---

## Pré-requisitos

| Ferramenta | Versão |
|------------|--------|
| Java | 8+ (projeto target Java 8) |
| Maven | 3.6+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Como buildar

### Backend

```powershell
cd backend
mvn clean verify
```

Gera o WAR em `backend/target/api-topaz.war` e executa testes unitários + integração.

### Frontend

```powershell
cd frontend
npm install
npm run build
```

Gera os arquivos estáticos em `frontend/dist/`.

---

## Como executar (desenvolvimento)

### 1. Backend

```powershell
cd backend
mvn spring-boot:run
```

- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/actuator/health
- Banco H2 em arquivo: `backend/data/topaz` (profile `h2` — padrão)

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

- UI: http://localhost:5173
- API configurada em `frontend/.env` → `VITE_API_URL=http://localhost:8080`

### 3. Testar o fluxo completo

1. Acesse http://localhost:5173/login → `admin` / `admin`
2. Encurte uma URL em **Encurtar URL**
3. Veja a lista em **URLs salvas**
4. Abra o link encurtado em nova aba → deve redirecionar

---

## Como testar

```powershell
# Backend (unit + integração)
cd backend
mvn clean verify

# Frontend
cd frontend
npm test
```

---

## WildFly 10 (preparado, sem teste nesta entrega)

O projeto gera um **WAR** compatível com WildFly 10, mas **não instalei nem testei o deploy em WildFly** neste desafio. A validação funcional foi feita em Tomcat embedded e Docker.

A pasta `backend/src/main/webapp/` faz parte do empacotamento WAR e contém apenas configuração do **WildFly/JBoss**. No `mvn spring-boot:run` e no Docker (Tomcat embedded), esses XMLs são ignorados; no deploy real no WildFly, definem o context root e evitam conflito de logging.

O que existe no código para um deploy futuro:

1. `ServletInitializer` — bootstrap do Spring Boot dentro do application server
2. Build: `mvn clean package` em `backend/` → `backend/target/api-topaz.war`
3. Context root: `/api-topaz` (`webapp/WEB-INF/jboss-web.xml`)
4. Exclusões de logging JBoss (`jboss-deployment-structure.xml`)
5. Em produção, ajustar `app.base-url` com o contexto, ex.: `https://servidor/api-topaz`

### Ambientes validados

| Ambiente | Como roda | Testado nesta entrega? |
|----------|-----------|------------------------|
| Dev local | `mvn spring-boot:run` (Tomcat embedded) | **Sim** |
| Docker | `docker compose up` (Tomcat embedded, profile `postgres`) | **Sim** |
| WildFly 10 | Deploy do WAR em `standalone/deployments/` | **Não** — fora do escopo |

---

## Profile PostgreSQL (opcional)

```powershell
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

Requer PostgreSQL em `localhost:5432` com database `topaz`, user/senha `topaz`. Configuração em `application-postgres.yml`.

---

## Docker (ambiente containerizado)

### Subir tudo com um comando

```powershell
docker compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger-ui.html |
| PostgreSQL | localhost:5432 (user/senha/db: `topaz`) |

### Parar

```powershell
docker compose down
```

### CI local (replica o pipeline antes do push)

```powershell
.\scripts\ci-local.ps1
```

Antes do push, rode `.\scripts\ci-local.ps1` para validar testes backend, frontend e build das imagens Docker localmente.

> **Nota:** O WAR permanece compatível com WildFly 10 em termos de empacotamento. Nesta entrega, **não há teste em WildFly** — Docker e `spring-boot:run` cobrem a avaliação funcional sem exigir instalação do application server.

---

## O que faria diferente com mais tempo

| Área | Evolução |
|------|----------|
| **WildFly nativo** | Instalar WildFly 10 e validar deploy do WAR ao vivo (fora do escopo desta entrega) |
| **Stack JAX-RS** | Migrar controllers para JAX-RS + CDI puro, alinhando 100% à stack Topaz |
| **Geração de código** | Trocar `synchronized` por sequência no banco ou Redis para escala horizontal |
| **Rate limiting** | Proteger redirect público contra abuso |
| **Métricas** | Expor métricas de acessos por link no Actuator |
| **Testes E2E** | Playwright cobrindo login → encurtar → redirect |
| **Domínio curto** | Configurar `go.topazevolution.com` com TLS em produção |

> Sobre **core vs extras**, ver seção [Escopo do desafio](#escopo-do-desafio-core-vs-extras) no início deste README.

## Status do projeto

| Fase | Entrega | Status |
|------|---------|--------|
| **1** | Backend — API, CRUD, redirect, H2, Flyway, Security, Actuator, Swagger | Concluída |
| **2** | Frontend — login, encurtar, listar/editar/excluir, testes | Concluída |
| **3** | Docker Compose + script CI local | Concluída |

---

## Autor — [Marcelo Hernandes da Silva](https://www.linkedin.com/in/marcelo-hernandes-da-silva-351a7159/)

Projeto desenvolvido para fins de desafio técnico.
