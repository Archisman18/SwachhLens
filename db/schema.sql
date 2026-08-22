-- SwachhLens DB schema (Postgres + PostGIS, e.g. Supabase)
-- Run this against your Supabase project SQL Editor.

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables/types if re-running (clean slate)
DROP TABLE IF EXISTS complaints CASCADE;
DROP TYPE IF EXISTS waste_type CASCADE;
DROP TYPE IF EXISTS volume_bucket CASCADE;
DROP TYPE IF EXISTS complaint_status CASCADE;
DROP TYPE IF EXISTS urgency_level CASCADE;

CREATE TYPE waste_type AS ENUM (
    'overflowing_bin', 'illegal_dump', 'plastic_waste', 'construction_debris',
    'organic_waste', 'e_waste', 'hazardous_waste', 'drain_blockage', 'other'
);

CREATE TYPE volume_bucket AS ENUM ('small', 'medium', 'large', 'very_large');

CREATE TYPE complaint_status AS ENUM ('reported', 'assigned', 'cleaned', 'verified', 'duplicate');

CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE complaints (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_url       TEXT NOT NULL,
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    location        GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
                        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
                    ) STORED,
    comment         TEXT,
    waste_type      waste_type,
    volume_bucket   volume_bucket,
    priority_score  NUMERIC(5, 2) DEFAULT 0,
    status          complaint_status NOT NULL DEFAULT 'reported',
    urgency         urgency_level,
    assigned_team   TEXT,
    assigned_vehicle TEXT,
    duplicate_of    UUID REFERENCES complaints(id),
    resolution_photo_url TEXT,
    reported_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX complaints_location_gix ON complaints USING GIST (location);
CREATE INDEX complaints_status_idx ON complaints (status);
CREATE INDEX complaints_priority_idx ON complaints (priority_score DESC);
CREATE INDEX complaints_reported_at_idx ON complaints (reported_at DESC);

-- Keep updated_at fresh on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complaints_set_updated_at
BEFORE UPDATE ON complaints
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Example duplicate-candidate query (GPS proximity + time window):
-- SELECT id FROM complaints
-- WHERE status != 'duplicate'
--   AND waste_type = :new_waste_type
--   AND reported_at > now() - interval '48 hours'
--   AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, 50) -- 50 meters
-- ORDER BY reported_at DESC;
