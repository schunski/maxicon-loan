CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS loans (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers (id) ON DELETE RESTRICT,
  loan_date DATE NOT NULL,
  currency TEXT NOT NULL,
  amount NUMERIC(18, 4) NOT NULL CHECK (amount > 0),
  brl_rate NUMERIC(18, 6) NOT NULL CHECK (brl_rate > 0),
  due_date DATE NOT NULL,
  annual_interest_rate_percent NUMERIC(10, 4) NOT NULL CHECK (annual_interest_rate_percent >= 0),
  quote_reference_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loans_customer_id ON loans (customer_id);
