-- Siigo Mock API — Schema inicial
-- Este archivo se ejecuta automáticamente cuando Docker crea el contenedor por primera vez.
-- Usar IF NOT EXISTS para que sea seguro en reinicios posteriores.

CREATE TABLE IF NOT EXISTS customers (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  nit        VARCHAR(20)  NOT NULL UNIQUE,
  name       VARCHAR(255) NOT NULL,
  phone      VARCHAR(20),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items (
  id         UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  code       VARCHAR(50)    NOT NULL UNIQUE,
  name       VARCHAR(255)   NOT NULL,
  price      NUMERIC(15, 2) NOT NULL CHECK (price > 0),
  tax        NUMERIC(5, 2)  NOT NULL DEFAULT 0 CHECK (tax >= 0),
  created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  number       VARCHAR(50)    NOT NULL UNIQUE,
  customer_nit VARCHAR(20)    NOT NULL REFERENCES customers(nit),
  total        NUMERIC(15, 2) NOT NULL,
  status       VARCHAR(20)    NOT NULL DEFAULT 'approved',
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id         UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID           NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_code  VARCHAR(50)    NOT NULL REFERENCES items(code),
  quantity   INT            NOT NULL CHECK (quantity > 0),
  price      NUMERIC(15, 2) NOT NULL CHECK (price > 0),
  created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
