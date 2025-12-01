--dev
DROP TABLE IF EXISTS favorites, pack_samples, sample_packs, samples, users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE samples (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  source VARCHAR(100) DEFAULT 'user_upload',
  source_url TEXT,
  preview_url TEXT NOT NULL,
  genre VARCHAR(100),
  file_size BIGINT,
  duration NUMERIC(10, 2),
  license VARCHAR(100) DEFAULT 'https://creativecommons.org/licenses/by/4.0/',
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE table sample_packs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorites (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    sample_id INT REFERENCES samples(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, sample_id)
);

CREATE TABLE pack_samples (
    pack_id INT REFERENCES sample_packs(id) ON DELETE CASCADE,
    sample_id INT REFERENCES samples(id) ON DELETE CASCADE,
    PRIMARY KEY (pack_id, sample_id)
);

CREATE TABLE playlist(
  id SERIAL PRIMARY KEY,
  video_id VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL
);

CREATE INDEX idx_samples_genre ON samples(genre);
CREATE INDEX idx_samples_textsearch ON samples USING GIN (to_tsvector('english', title || ' ' || genre));
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_samples_title_trgm ON samples USING GIN (title gin_trgm_ops);
