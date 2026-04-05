-- ============================================================
-- TreinoZap — Schema Supabase (PostgreSQL)
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Tabela: trainers (personal trainers)
CREATE TABLE trainers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  phone             TEXT,
  plan              TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: students (alunos)
CREATE TABLE students (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id        UUID REFERENCES trainers(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  phone             TEXT NOT NULL,              -- WhatsApp: 5511999999999
  email             TEXT,
  goal              TEXT,                        -- "perder peso", "ganhar massa"
  monthly_fee       NUMERIC(10,2),              -- valor da mensalidade
  payment_due_day   INTEGER CHECK (payment_due_day BETWEEN 1 AND 31),
  status            TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  last_activity_at  TIMESTAMPTZ,               -- atualizado ao concluir treino
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: workouts (treinos)
CREATE TABLE workouts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id        UUID REFERENCES trainers(id) ON DELETE CASCADE,
  student_id        UUID REFERENCES students(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  public_token      TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT, -- link público
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: exercises (exercícios dentro do treino)
CREATE TABLE exercises (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id        UUID REFERENCES workouts(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  sets              INTEGER CHECK (sets > 0),
  reps              TEXT,                        -- "12-15" ou "falha"
  rest_seconds      INTEGER CHECK (rest_seconds >= 0),
  notes             TEXT,
  order_index       INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: activity_logs (registro de atividade dos alunos)
CREATE TABLE activity_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID REFERENCES students(id) ON DELETE SET NULL,
  workout_id        UUID REFERENCES workouts(id) ON DELETE SET NULL,
  event             TEXT NOT NULL,              -- 'viewed_workout' | 'completed_workout'
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE trainers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE students       ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises      ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs  ENABLE ROW LEVEL SECURITY;

-- Trainer: acessa somente os próprios dados
CREATE POLICY "trainer_own"
  ON trainers FOR ALL
  USING (user_id = auth.uid());

-- Students: trainer acessa somente seus alunos
CREATE POLICY "trainer_students"
  ON students FOR ALL
  USING (trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

-- Workouts: trainer acessa somente seus treinos
CREATE POLICY "trainer_workouts"
  ON workouts FOR ALL
  USING (trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

-- Exercises: acessível via treino do trainer
CREATE POLICY "trainer_exercises"
  ON exercises FOR ALL
  USING (
    workout_id IN (
      SELECT id FROM workouts
      WHERE trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid())
    )
  );

-- Treino público: qualquer um pode ler (para a página /t/:token)
CREATE POLICY "public_workout_read"
  ON workouts FOR SELECT
  USING (is_active = true);

-- Exercícios públicos: leitura pública (aluno vê o treino)
CREATE POLICY "public_exercises_read"
  ON exercises FOR SELECT
  USING (true);

-- Activity log: inserção pública (aluno marca conclusão sem login)
CREATE POLICY "public_log_insert"
  ON activity_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- Índices para performance
-- ============================================================

CREATE INDEX idx_students_trainer_id ON students (trainer_id);
CREATE INDEX idx_students_status ON students (status);
CREATE INDEX idx_students_last_activity ON students (last_activity_at);
CREATE INDEX idx_workouts_trainer_id ON workouts (trainer_id);
CREATE INDEX idx_workouts_student_id ON workouts (student_id);
CREATE INDEX idx_workouts_public_token ON workouts (public_token);
CREATE INDEX idx_exercises_workout_id ON exercises (workout_id, order_index);
CREATE INDEX idx_activity_logs_student_id ON activity_logs (student_id);
CREATE INDEX idx_activity_logs_workout_id ON activity_logs (workout_id);

-- ============================================================
-- Dados de exemplo (opcional — para testar)
-- ============================================================

-- Inserir após criar conta via Supabase Auth e substituir o user_id:
-- INSERT INTO trainers (user_id, name, phone, plan)
-- VALUES ('SEU-USER-ID-AQUI', 'João Personal', '11999999999', 'free');
