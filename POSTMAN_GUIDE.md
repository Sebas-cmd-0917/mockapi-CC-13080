# Siigo Mock API — Guía de Testing en Postman

**Base URL:** `http://localhost:4000`  
**Arrancar servidor:** `pnpm dev`

---

## Configuración inicial de Postman

### Environment: `Siigo Mock Local`

| Variable   | Initial Value             | Current Value |
|------------|---------------------------|---------------|
| `base_url` | `http://localhost:4000`   | *(igual)*     |
| `token`    | *(vacío)*                 | *(se llena automáticamente)* |

> Selecciona este environment antes de ejecutar cualquier request.

---

## Orden de ejecución recomendado (Happy Path)

```
1. Health Check
2. Auth → Login          ← guarda el token automáticamente
3. POST /customers       ← crea el cliente
4. POST /products (x2)   ← crea los productos
5. POST /invoices        ← crea la factura
```

---

## 1. Health Check

| Campo   | Valor                      |
|---------|----------------------------|
| Método  | `GET`                      |
| URL     | `{{base_url}}/health`      |
| Headers | *(ninguno)*                |
| Body    | *(ninguno)*                |

**Respuesta esperada `200 OK`:**
```json
{
  "status": "ok",
  "environment": "development"
}
```

---

## 2. Auth

### POST /auth — Login

| Campo       | Valor                  |
|-------------|------------------------|
| Método      | `POST`                 |
| URL         | `{{base_url}}/auth`    |
| Headers     | `Content-Type: application/json` |

**Body (raw JSON):**
```json
{
  "username": "siigo_user",
  "access_key": "cualquier_valor"
}
```

**Respuesta esperada `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

> **Script "Tests" — pegar en la pestaña Tests del request para guardar el token:**
> ```javascript
> const res = pm.response.json();
> pm.environment.set("token", res.access_token);
> console.log("Token guardado:", res.access_token.substring(0, 20) + "...");
> ```

**Error `400` — campos faltantes:**
```json
{
  "username": "siigo_user"
}
```
```json
{
  "error": "validation_error",
  "details": ["username and access_key are required"]
}
```

---

## 3. Customers (Clientes)

> Todos los requests de aquí en adelante requieren:
> `Authorization: Bearer {{token}}`

### POST /customers — Crear cliente

| Campo   | Valor                          |
|---------|--------------------------------|
| Método  | `POST`                         |
| URL     | `{{base_url}}/customers`       |
| Headers | `Authorization: Bearer {{token}}` · `Content-Type: application/json` |

**Body (raw JSON):**
```json
{
  "nit": "900123456",
  "name": "Empresa Demo S.A.S",
  "phone": "3001234567"
}
```

**Respuesta esperada `201 Created`:**
```json
{
  "id": "uuid-generado",
  "nit": "900123456",
  "name": "Empresa Demo S.A.S",
  "phone": "3001234567",
  "created_at": "2026-06-24T..."
}
```

---

### POST /customers — Error: NIT duplicado

```json
{
  "nit": "900123456",
  "name": "Empresa clon"
}
```

**Respuesta esperada `400 Bad Request`:**
```json
{
  "error": "Customer with this NIT already exists"
}
```

---

### POST /customers — Error: campos requeridos faltantes

```json
{
  "phone": "3001234567"
}
```

**Respuesta esperada `400 Bad Request`:**
```json
{
  "error": "validation_error",
  "details": ["nit and name are required"]
}
```

---

### POST /customers — Error: sin token

*(Omitir el header Authorization)*

**Respuesta esperada `401 Unauthorized`:**
```json
{
  "error": "Unauthorized: Missing or invalid token"
}
```

---

### GET /customers/:nit — Obtener cliente

| Campo   | Valor                                  |
|---------|----------------------------------------|
| Método  | `GET`                                  |
| URL     | `{{base_url}}/customers/900123456`     |
| Headers | `Authorization: Bearer {{token}}`      |

**Respuesta esperada `200 OK`:**
```json
{
  "id": "uuid",
  "nit": "900123456",
  "name": "Empresa Demo S.A.S",
  "phone": "3001234567",
  "created_at": "2026-06-24T..."
}
```

---

### GET /customers/:nit — Error: no encontrado

| URL | `{{base_url}}/customers/999999999` |
|---|---|

**Respuesta esperada `404 Not Found`:**
```json
{
  "error": "Customer not found"
}
```

---

## 4. Products (Productos)

### GET /products — Listar productos

| Campo   | Valor                     |
|---------|---------------------------|
| Método  | `GET`                     |
| URL     | `{{base_url}}/products`   |
| Headers | `Authorization: Bearer {{token}}` |

**Respuesta esperada `200 OK`:**
```json
[
  {
    "id": "uuid",
    "code": "PROD-001",
    "name": "Laptop Dell XPS 15",
    "price": 4500000,
    "tax": 19,
    "created_at": "2026-06-24T..."
  }
]
```

---

### POST /products — Crear producto 1

| Campo   | Valor                     |
|---------|---------------------------|
| Método  | `POST`                    |
| URL     | `{{base_url}}/products`   |
| Headers | `Authorization: Bearer {{token}}` · `Content-Type: application/json` |

**Body (raw JSON):**
```json
{
  "code": "PROD-001",
  "name": "Laptop Dell XPS 15",
  "price": 4500000,
  "tax": 19
}
```

**Respuesta esperada `201 Created`:**
```json
{
  "id": "uuid",
  "code": "PROD-001",
  "name": "Laptop Dell XPS 15",
  "price": 4500000,
  "tax": 19,
  "created_at": "2026-06-24T..."
}
```

---

### POST /products — Crear producto 2

```json
{
  "code": "PROD-002",
  "name": "Mouse Inalámbrico",
  "price": 85000,
  "tax": 19
}
```

**Respuesta esperada `201 Created`:**
```json
{
  "id": "uuid",
  "code": "PROD-002",
  "name": "Mouse Inalámbrico",
  "price": 85000,
  "tax": 19,
  "created_at": "2026-06-24T..."
}
```

---

### POST /products — Error: código duplicado

```json
{
  "code": "PROD-001",
  "name": "Producto clon",
  "price": 100000,
  "tax": 0
}
```

**Respuesta esperada `400 Bad Request`:**
```json
{
  "error": {
    "code": "DUPLICATE_CODE",
    "details": ["Product with code 'PROD-001' already exists"]
  }
}
```

---

### POST /products — Error: validación Zod (precio negativo)

```json
{
  "code": "PROD-003",
  "name": "Producto roto",
  "price": -500,
  "tax": 0
}
```

**Respuesta esperada `400 Bad Request`:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "details": ["price must be greater than 0"]
  }
}
```

---

### POST /products — Error: validación Zod (campos faltantes)

```json
{
  "name": "Sin código ni precio"
}
```

**Respuesta esperada `400 Bad Request`:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      "code is required",
      "price must be greater than 0",
      "tax must be >= 0"
    ]
  }
}
```

---

### GET /products/:code — Obtener producto

| Campo | Valor                             |
|-------|-----------------------------------|
| Método | `GET`                            |
| URL   | `{{base_url}}/products/PROD-001`  |
| Headers | `Authorization: Bearer {{token}}` |

**Respuesta esperada `200 OK`:**
```json
{
  "id": "uuid",
  "code": "PROD-001",
  "name": "Laptop Dell XPS 15",
  "price": 4500000,
  "tax": 19,
  "created_at": "2026-06-24T..."
}
```

---

### GET /products/:code — Error: no encontrado

| URL | `{{base_url}}/products/PROD-999` |
|---|---|

**Respuesta esperada `404 Not Found`:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "details": ["Product with code 'PROD-999' not found"]
  }
}
```

---

## 5. Invoices (Facturas)

### POST /invoices — Crear factura (Happy Path)

| Campo   | Valor                       |
|---------|-----------------------------|
| Método  | `POST`                      |
| URL     | `{{base_url}}/invoices`     |
| Headers | `Authorization: Bearer {{token}}` · `Content-Type: application/json` |

**Body (raw JSON):**
```json
{
  "number": "FV-0001",
  "customer_nit": "900123456",
  "items": [
    {
      "item_code": "PROD-001",
      "quantity": 2
    },
    {
      "item_code": "PROD-002",
      "quantity": 5
    }
  ]
}
```

**Respuesta esperada `201 Created`:**
```json
{
  "id": "uuid-generado",
  "number": "FV-0001",
  "status": "approved"
}
```

> **Total calculado en el backend:**  
> `(4.500.000 × 2) + (85.000 × 5) = 9.425.000`  
> El frontend **no** envía el total; el backend lo calcula con precios de la BD.

---

### POST /invoices — Error: cliente no existe

```json
{
  "number": "FV-0002",
  "customer_nit": "000000000",
  "items": [
    { "item_code": "PROD-001", "quantity": 1 }
  ]
}
```

**Respuesta esperada `400 Bad Request`:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "details": ["Customer not found"]
  }
}
```

---

### POST /invoices — Error: producto no existe

```json
{
  "number": "FV-0002",
  "customer_nit": "900123456",
  "items": [
    { "item_code": "PROD-FAKE", "quantity": 1 }
  ]
}
```

**Respuesta esperada `400 Bad Request`:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "details": ["Items not found: PROD-FAKE"]
  }
}
```

---

### POST /invoices — Error: número de factura duplicado

```json
{
  "number": "FV-0001",
  "customer_nit": "900123456",
  "items": [
    { "item_code": "PROD-001", "quantity": 1 }
  ]
}
```

**Respuesta esperada `400 Bad Request`:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "details": ["Invoice number 'FV-0001' already exists"]
  }
}
```

---

### POST /invoices — Error: validación Zod (quantity inválida)

```json
{
  "number": "FV-0003",
  "customer_nit": "900123456",
  "items": [
    { "item_code": "PROD-001", "quantity": 0 }
  ]
}
```

**Respuesta esperada `400 Bad Request`:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "details": ["quantity must be > 0"]
  }
}
```

---

### POST /invoices — Error: sin items

```json
{
  "number": "FV-0003",
  "customer_nit": "900123456",
  "items": []
}
```

**Respuesta esperada `400 Bad Request`:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "details": ["At least one item is required"]
  }
}
```

---

### POST /invoices — Error: múltiples errores simultáneos

```json
{
  "number": "FV-0001",
  "customer_nit": "000000000",
  "items": [
    { "item_code": "PROD-FAKE", "quantity": 1 },
    { "item_code": "PROD-001", "quantity": 3 }
  ]
}
```

**Respuesta esperada `400 Bad Request`:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      "Customer not found",
      "Invoice number 'FV-0001' already exists",
      "Items not found: PROD-FAKE"
    ]
  }
}
```

---

## Resumen de endpoints

| Módulo    | Método | Ruta                     | Auth | Descripción              |
|-----------|--------|--------------------------|------|--------------------------|
| Health    | GET    | `/health`                | No   | Estado del servidor      |
| Auth      | POST   | `/auth`                  | No   | Login → obtiene JWT      |
| Customers | POST   | `/customers`             | Sí   | Crear cliente            |
| Customers | GET    | `/customers/:nit`        | Sí   | Buscar cliente por NIT   |
| Products  | GET    | `/products`              | Sí   | Listar productos         |
| Products  | POST   | `/products`              | Sí   | Crear producto            |
| Products  | GET    | `/products/:code`        | Sí   | Buscar producto por código |
| Invoices  | POST   | `/invoices`              | Sí   | Crear factura            |

> **Header de autenticación requerido en todos los endpoints marcados con "Sí":**  
> `Authorization: Bearer {{token}}`
