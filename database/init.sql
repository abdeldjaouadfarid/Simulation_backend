-- -- Run this file once to set up your database.
-- -- Command: psql -U postgres -d animal_tracker -f database/init.sql

-- -- Enable PostGIS (gives us GPS / location features)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- -- Table: geofences (the safe zone polygon)
-- CREATE TABLE IF NOT EXISTS geofences (
--   id         SERIAL PRIMARY KEY,
--   name       VARCHAR(100),
--   zone       GEOMETRY(Polygon, 4326)   -- a polygon using GPS coordinates
-- );

-- -- Table: animals
-- CREATE TABLE IF NOT EXISTS animals (
--   id               SERIAL PRIMARY KEY,
--   name             VARCHAR(100),
--   species          VARCHAR(100),
--   current_location GEOMETRY(Point, 4326),  -- a GPS point
--   speed            NUMERIC DEFAULT 0.0001,
--   status           VARCHAR(20) DEFAULT 'safe',  -- 'safe', 'alert', or 'stolen'
--   is_panic         BOOLEAN DEFAULT false,
--   panic_direction  JSONB   -- stores { dx, dy } when panic mode is on
-- );

-- -- Add a sample safe zone 
-- INSERT INTO geofences (name, zone) VALUES (
--   'M''sila Pasture',
--   ST_GeomFromText('POLYGON((4.4100 35.6500, 4.4500 35.6500, 4.4500 35.6800, 4.4100 35.6800, 4.4100 35.6500))',
--   4326)
-- );

-- -- Add 5 sample animals (all inside the safe zone to start)
-- INSERT INTO animals (name, species, current_location) VALUES
--   ('Leo',   'Sheep',  ST_SetSRID(ST_MakePoint(4.4200, 35.6600), 4326)),
--   ('Nala',  'Cow',    ST_SetSRID(ST_MakePoint(4.4300, 35.6650), 4326)),
--   ('Simba', 'Goat',   ST_SetSRID(ST_MakePoint(4.4400, 35.6700), 4326)),
--   ('Dumbo', 'Camel',  ST_SetSRID(ST_MakePoint(4.4150, 35.6550), 4326)),
--   ('Zara',  'Horse',  ST_SetSRID(ST_MakePoint(4.4350, 35.6750), 4326));






DROP TABLE IF EXISTS animals;
DROP TABLE IF EXISTS geofences;
s
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE geofences (
  id      SERIAL PRIMARY KEY,
  name    VARCHAR(100),
  zone    GEOMETRY(Polygon, 4326)
);

CREATE TABLE animals (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(100),
  species          VARCHAR(100),
  current_location GEOMETRY(Point, 4326),
  speed            NUMERIC DEFAULT 0.0001, 
  status           VARCHAR(20) DEFAULT 'safe',
  is_panic         BOOLEAN DEFAULT false,
  panic_direction  JSONB
);

INSERT INTO geofences (name, zone) VALUES (
  'M''sila Pasture',
  ST_GeomFromText('POLYGON((4.4100 35.6500, 4.4500 35.6500, 4.4500 35.6800, 4.4100 35.6800, 4.4100 35.6500))', 4326)
);

INSERT INTO animals (name, species, current_location) VALUES
  ('Leo',   'Sheep',  ST_SetSRID(ST_MakePoint(4.4200, 35.6600), 4326)),
  ('Nala',  'Cow',    ST_SetSRID(ST_MakePoint(4.4300, 35.6650), 4326)),
  ('Simba', 'Goat',   ST_SetSRID(ST_MakePoint(4.4400, 35.6700), 4326)),
  ('Dumbo', 'Camel',  ST_SetSRID(ST_MakePoint(4.4150, 35.6550), 4326)),
  ('Zara',  'Horse',  ST_SetSRID(ST_MakePoint(4.4350, 35.6750), 4326));