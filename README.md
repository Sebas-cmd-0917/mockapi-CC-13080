# Siigo Mock API

API REST que simula el comportamiento de Siigo para desarrollo y pruebas de integraciones sin consumir la API real.

Implementa autenticación JWT, gestión de clientes, productos y facturación con persistencia en PostgreSQL.

---

## Requisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | 20+            |
| pnpm        | 11+            |
| Docker      | 24+            |

---

## Instalación y arranque

### 1. Variables de entorno

```bash
cp .env.example .env
```

Editar `.env` si se necesitan valores distintos a los por defecto.

### 2. Base de datos (Docker)

```bash
docker compose up -d
```

Esto levanta PostgreSQL en `localhost:5432` y ejecuta el schema inicial automáticamente desde `src/db/init.sql`.

### 3. Dependencias

```bash
pnpm install
```

### 4. Servidor en modo desarrollo

```bash
pnpm dev
```

La API queda disponible en `http://localhost:4000`.

---

## Endpoints

| Módulo    | Método | Ruta                  | Auth | Descripción               |
|-----------|--------|-----------------------|------|---------------------------|
| Health    | GET    | `/health`             | No   | Estado del servidor       |
| Auth      | POST   | `/auth`               | No   | Login → obtiene JWT       |
| Customers | POST   | `/customers`          | Sí   | Crear cliente             |
| Customers | GET    | `/customers/:nit`     | Sí   | Buscar cliente por NIT    |
| Items     | POST   | `/items`              | Sí   | Crear producto            |
| Items     | GET    | `/items/:code`        | Sí   | Buscar producto por código |
| Invoices  | POST   | `/invoices`           | Sí   | Crear factura             |

Todos los endpoints protegidos requieren el header:

```
Authorization: Bearer <token>
```

El token se obtiene haciendo `POST /auth`.

---

## Autenticación

```http
POST /auth
Content-Type: application/json

{
  "username": "siigo_user",
  "access_key": "cualquier_valor"
}
```

Respuesta `200 OK`:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

---

## Base de datos

### Schema

```sql
-- Clientes
CREATE TABLE customers (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  nit        VARCHAR(20)  NOT NULL UNIQUE,
  name       VARCHAR(255) NOT NULL,
  phone      VARCHAR(20),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Productos
CREATE TABLE items (
  id         UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  code       VARCHAR(50)    NOT NULL UNIQUE,
  name       VARCHAR(255)   NOT NULL,
  price      NUMERIC(15, 2) NOT NULL CHECK (price > 0),
  tax        NUMERIC(5, 2)  NOT NULL DEFAULT 0 CHECK (tax >= 0),
  created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Facturas
CREATE TABLE invoices (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  number       VARCHAR(50)    NOT NULL UNIQUE,
  customer_nit VARCHAR(20)    NOT NULL REFERENCES customers(nit),
  total        NUMERIC(15, 2) NOT NULL,
  status       VARCHAR(20)    NOT NULL DEFAULT 'approved',
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Líneas de factura
CREATE TABLE invoice_items (
  id         UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID           NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_code  VARCHAR(50)    NOT NULL REFERENCES items(code),
  quantity   INT            NOT NULL CHECK (quantity > 0),
  price      NUMERIC(15, 2) NOT NULL CHECK (price > 0),
  created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
```

El schema se aplica automáticamente al crear el contenedor Docker. Si se necesita aplicar manualmente:

```bash
docker exec -i siigo-mock-db psql -U siigo_user -d siigo_mock < src/db/init.sql
```

### Conexión directa

```bash
docker exec -it siigo-mock-db psql -U siigo_user -d siigo_mock
```

---

## Comportamiento simulado

- **Delay de red**: cada respuesta introduce un retardo aleatorio de 200–1200 ms (header `X-Simulated-Delay-Ms` visible en Postman).
- **Total de factura**: calculado en el backend con los precios almacenados en la BD; el cliente nunca envía el total.
- **Transacciones**: la creación de facturas es atómica — si falla cualquier línea, se hace rollback completo.

---

## Variables de entorno

| Variable               | Default                          | Descripción                        |
|------------------------|----------------------------------|------------------------------------|
| `PORT`                 | `4000`                           | Puerto del servidor                |
| `NODE_ENV`             | `development`                    | Entorno                            |
| `JWT_SECRET`           | `super_secret_mock_key_2026`     | Clave de firma JWT                 |
| `DB_HOST`              | `localhost`                      | Host de PostgreSQL                 |
| `DB_PORT`              | `5432`                           | Puerto de PostgreSQL               |
| `DB_NAME`              | `siigo_mock`                     | Nombre de la base de datos         |
| `DB_USER`              | `siigo_user`                     | Usuario de PostgreSQL              |
| `DB_PASSWORD`          | `siigo_pass_2026`                | Contraseña de PostgreSQL           |
| `N8N_LOCAL_WEBHOOK_URL`| —                                | URL del webhook de n8n (opcional)  |

---

## Testing con Postman

Ver [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md) para la guía completa con ejemplos de requests, respuestas esperadas y casos de error.

---

## Scripts disponibles

```bash
pnpm dev      # Servidor en modo desarrollo con hot-reload
pnpm build    # Compilar TypeScript a dist/
pnpm start    # Iniciar desde dist/ (producción)
```
