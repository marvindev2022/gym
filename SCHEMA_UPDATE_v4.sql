-- Adiciona campos de localização em students e trainers
ALTER TABLE students ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS state CHAR(2);
ALTER TABLE students ADD COLUMN IF NOT EXISTS neighborhood TEXT;

ALTER TABLE trainers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS state CHAR(2);
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS attendance_mode TEXT DEFAULT 'ambos'
  CHECK (attendance_mode IN ('online', 'presencial', 'ambos'));

-- Permite aluno autenticado editar seu próprio registro
DROP POLICY IF EXISTS "aluno_atualiza_proprio_registro" ON students;
CREATE POLICY "aluno_atualiza_proprio_registro" ON students
  FOR UPDATE USING (auth.uid() = user_id);
