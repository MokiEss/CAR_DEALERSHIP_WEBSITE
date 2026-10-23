CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900),
  mileage INTEGER NOT NULL CHECK (mileage >= 0),
  fuel VARCHAR(40) NOT NULL CHECK (
    fuel IN (
      'Essence',
      'Diesel',
      'Hybride',
      'Hybride rechargeable',
      'Électrique',
      'GPL'
    )
  ),
  transmission VARCHAR(20) NOT NULL CHECK (
    transmission IN ('Manuelle', 'Automatique')
  ),
  status VARCHAR(20) NOT NULL DEFAULT 'Disponible' CHECK (
    status IN ('Disponible', 'Réservé', 'Vendu')
  ),
  price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicle_images (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL
    REFERENCES vehicles(id)
    ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_created_at
  ON vehicles (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id_created_at
  ON vehicle_images (vehicle_id, created_at ASC);