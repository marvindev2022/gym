-- Migração v7: campos de biometria em students
-- Executar no SQL Editor do Supabase

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS body_fat      NUMERIC(4,1),   -- % gordura corporal
  ADD COLUMN IF NOT EXISTS muscle_mass   NUMERIC(4,1),   -- % massa muscular
  ADD COLUMN IF NOT EXISTS waist         NUMERIC(5,1),   -- cintura (cm)
  ADD COLUMN IF NOT EXISTS hip           NUMERIC(5,1),   -- quadril (cm)
  ADD COLUMN IF NOT EXISTS goal_weight   NUMERIC(5,2);   -- peso objetivo (kg)
