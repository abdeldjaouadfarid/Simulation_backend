 DROP TABLE IF EXISTS animals;
DROP TABLE IF EXISTS geofences;
-- s

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
  panic_direction  JSONB   -- <--  The path taken by the thief
);

INSERT INTO geofences (name, zone)
VALUES (
  'M''sila Pasture',
  ST_Transform(
    ST_Buffer(
      ST_Transform(
        ST_GeomFromText(
          'POLYGON((4.4100 35.6500, 4.4500 35.6500, 4.4500 35.6800, 4.4100 35.6800, 4.4100 35.6500))',
          4326
        ),
        3857
      ),
      -500
    ),
    4326
  )
);
-- INSERT INTO geofences (name, zone) VALUES (
--   'M''sila Pasture',
--   ST_GeomFromText('POLYGON((4.4100 35.6500, 4.4500 35.6500, 4.4500 35.6800, 4.4100 35.6800, 4.4100 35.6500))', 4326)
-- );

INSERT INTO animals (name, species, current_location) VALUES
  ('Leo',   'Sheep',  ST_SetSRID(ST_MakePoint(4.4200, 35.6600), 4326)),
  ('Nala',  'Cow',    ST_SetSRID(ST_MakePoint(4.4300, 35.6650), 4326)),
  ('Simba', 'Goat',   ST_SetSRID(ST_MakePoint(4.4400, 35.6700), 4326)),
  ('Dumbo', 'Camel',  ST_SetSRID(ST_MakePoint(4.4150, 35.6550), 4326)),
  ('Zara',  'Horse',  ST_SetSRID(ST_MakePoint(4.4350, 35.6750), 4326));