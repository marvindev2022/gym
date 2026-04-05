-- ============================================================
-- TreinoZap — Schema Update v3 (inclui v2)
-- Execute no SQL Editor do Supabase
-- ============================================================

-- ============================================================
-- PARTE 1: mudanças do v2 (idempotentes)
-- ============================================================

-- students: user_id e trainer_id opcional
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE students
  ALTER COLUMN trainer_id DROP NOT NULL;

-- trainers: perfil público e código de conexão
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS specialty TEXT[],
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;

-- tabela de solicitações aluno → personal
CREATE TABLE IF NOT EXISTS trainer_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  trainer_id  UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'accepted', 'rejected')),
  message     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (student_id, trainer_id)
);

ALTER TABLE trainer_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "trainer_ve_suas_solicitacoes" ON trainer_requests;
CREATE POLICY "trainer_ve_suas_solicitacoes"
  ON trainer_requests FOR SELECT
  USING (trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "trainer_atualiza_solicitacoes" ON trainer_requests;
CREATE POLICY "trainer_atualiza_solicitacoes"
  ON trainer_requests FOR UPDATE
  USING (trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "aluno_cria_solicitacao" ON trainer_requests;
CREATE POLICY "aluno_cria_solicitacao"
  ON trainer_requests FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- ============================================================
-- PARTE 2: student_token
-- ============================================================

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS student_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT;

UPDATE students SET student_token = gen_random_uuid()::TEXT WHERE student_token IS NULL;

CREATE INDEX IF NOT EXISTS idx_students_student_token ON students (student_token);

-- ============================================================
-- PARTE 3: RLS corrigida para students
-- ============================================================

DROP POLICY IF EXISTS "trainer_students" ON students;
DROP POLICY IF EXISTS "trainer_acessa_seus_alunos" ON students;
DROP POLICY IF EXISTS "aluno_le_proprio_registro" ON students;
DROP POLICY IF EXISTS "leitura_publica_por_student_token" ON students;

CREATE POLICY "trainer_acessa_seus_alunos"
  ON students FOR ALL
  USING (trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

CREATE POLICY "aluno_le_proprio_registro"
  ON students FOR SELECT
  USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "leitura_publica_por_student_token"
  ON students FOR SELECT
  USING (student_token IS NOT NULL);

-- ============================================================
-- PARTE 4: RLS trainers — leitura pública
-- ============================================================

DROP POLICY IF EXISTS "busca_trainer_por_code" ON trainers;
CREATE POLICY "busca_trainer_por_code"
  ON trainers FOR SELECT
  USING (true);

-- ============================================================
-- PARTE 5: RLS workouts — leitura pública de treinos ativos
-- ============================================================

DROP POLICY IF EXISTS "public_workout_read" ON workouts;
CREATE POLICY "public_workout_read"
  ON workouts FOR SELECT
  USING (is_active = true);

-- ============================================================
-- PARTE 6: RLS activity_logs — aluno autenticado lê seus logs
-- ============================================================

DROP POLICY IF EXISTS "aluno_le_seus_logs" ON activity_logs;
CREATE POLICY "aluno_le_seus_logs"
  ON activity_logs FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );
