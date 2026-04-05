-- ============================================================
-- TreinoZap — Schema Update v2
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. students: adiciona user_id e torna trainer_id opcional
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE students
  ALTER COLUMN trainer_id DROP NOT NULL;

-- 2. trainers: adiciona perfil público e código de conexão
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS specialty TEXT[],
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;

-- 3. tabela de solicitações aluno → personal
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

-- 4. RLS na tabela trainer_requests
ALTER TABLE trainer_requests ENABLE ROW LEVEL SECURITY;

-- Personal vê solicitações destinadas a ele
CREATE POLICY "trainer_ve_suas_solicitacoes"
  ON trainer_requests FOR SELECT
  USING (
    trainer_id IN (
      SELECT id FROM trainers WHERE user_id = auth.uid()
    )
  );

-- Personal aceita/rejeita
CREATE POLICY "trainer_atualiza_solicitacoes"
  ON trainer_requests FOR UPDATE
  USING (
    trainer_id IN (
      SELECT id FROM trainers WHERE user_id = auth.uid()
    )
  );

-- Aluno cria solicitação
CREATE POLICY "aluno_cria_solicitacao"
  ON trainer_requests FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

-- 5. Policy para aluno ler o próprio registro (login com email)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'students' AND policyname = 'aluno_le_proprio_registro'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "aluno_le_proprio_registro"
        ON students FOR SELECT
        USING (
          user_id = auth.uid()
          OR email = auth.email()
        )
    $policy$;
  END IF;
END $$;

-- 6. Policy: aluno pode ler trainer pelo code (para buscar personal)
CREATE POLICY IF NOT EXISTS "busca_trainer_por_code"
  ON trainers FOR SELECT
  USING (true);  -- trainers são públicos para leitura (apenas name, bio, specialty, code)
