-- Migração v5: status de execução dos treinos
-- Executar no SQL Editor do Supabase

-- 1. Coluna status em workouts
ALTER TABLE workouts
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'in_progress', 'completed'));

-- 2. Aluno autenticado pode atualizar o status do seu próprio treino
DROP POLICY IF EXISTS "aluno_atualiza_status_treino" ON workouts;
CREATE POLICY "aluno_atualiza_status_treino" ON workouts
  FOR UPDATE
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()))
  WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- Correção: política mais simples para aluno atualizar status
-- (a anterior dependia de auth.uid() que pode não existir no link público)
DROP POLICY IF EXISTS "aluno_atualiza_status_treino" ON workouts;
DROP POLICY IF EXISTS "public_update_workout_status" ON workouts;
CREATE POLICY "public_update_workout_status" ON workouts
  FOR UPDATE
  USING (is_active = true)
  WITH CHECK (is_active = true);
