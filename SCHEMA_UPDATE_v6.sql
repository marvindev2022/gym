-- Migração v6: campos de histórico médico em students + RLS corrigida
-- Executar no SQL Editor do Supabase

-- 1. Campos médicos
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS weight NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS height NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS health_conditions TEXT,
  ADD COLUMN IF NOT EXISTS medications TEXT,
  ADD COLUMN IF NOT EXISTS injuries TEXT,
  ADD COLUMN IF NOT EXISTS fitness_level TEXT CHECK (fitness_level IN ('sedentary','beginner','intermediate','advanced')),
  ADD COLUMN IF NOT EXISTS weekly_availability INTEGER;

-- 2. RLS UPDATE com WITH CHECK (garante que aluno só edita próprio registro)
DROP POLICY IF EXISTS "aluno_atualiza_proprio_registro" ON students;
CREATE POLICY "aluno_atualiza_proprio_registro" ON students
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Política de UPDATE para workouts (status do treino — se ainda não criada)
DROP POLICY IF EXISTS "aluno_atualiza_status_treino" ON workouts;
DROP POLICY IF EXISTS "public_update_workout_status" ON workouts;
CREATE POLICY "public_update_workout_status" ON workouts
  FOR UPDATE
  USING (is_active = true)
  WITH CHECK (is_active = true);
