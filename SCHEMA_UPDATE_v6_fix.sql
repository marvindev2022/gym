-- Fix: constraint student_level_check incompatível com os valores do front
-- Executar no SQL Editor do Supabase

-- Remove constraint antiga (nome gerado automaticamente pelo Postgres)
ALTER TABLE students DROP CONSTRAINT IF EXISTS student_level_check;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_fitness_level_check;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_fitness_level_check1;

-- Recria com os valores corretos usados pelo front
ALTER TABLE students
  ADD CONSTRAINT students_fitness_level_check
  CHECK (fitness_level IN ('sedentary', 'beginner', 'intermediate', 'advanced'));
