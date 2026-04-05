import { createBrowserRouter, redirect } from 'react-router-dom'
import { supabase } from '@lib/supabase'

// Layouts
import { AppLayout } from '@pages/Layout/AppLayout'

// Pages
import { LandingPage } from '@pages/Landing'
import { LoginPage } from '@pages/Auth/Login'
import { SignupPage } from '@pages/Auth/Signup'
import { SignupTrainerPage } from '@pages/Auth/Signup/Trainer'
import { SignupAlunoPage } from '@pages/Auth/Signup/Aluno'
import { DashboardPage } from '@pages/Dashboard'
import { StudentsListPage } from '@pages/Students/List'
import { StudentNewPage } from '@pages/Students/New'
import { StudentDetailPage } from '@pages/Students/Detail'
import { WorkoutsListPage } from '@pages/Workouts/List'
import { WorkoutNewPage } from '@pages/Workouts/New'
import { PublicWorkoutPage } from '@pages/Workouts/Public'
import { AlunoPage } from '@pages/Aluno'
import { AlunoLoginPage } from '@pages/Aluno/Login'
import { AlunoDefinirSenhaPage } from '@pages/Aluno/DefinirSenha'
import { ConectarPersonalPage } from '@pages/ConectarPersonal'
import { ProfessoresPage } from '@pages/Professores'

async function requireAuth() {
  const { data } = await supabase.auth.getSession()
  if (!data.session) throw redirect('/login')
  return null
}

async function redirectIfAuth() {
  const { data } = await supabase.auth.getSession()
  if (!data.session) return null
  // Redireciona baseado no role
  const role = data.session.user.user_metadata?.role
  if (role === 'student') {
    const { data: student } = await supabase
      .from('students')
      .select('student_token')
      .eq('user_id', data.session.user.id)
      .single()
    throw redirect(student?.student_token ? `/aluno/${student.student_token}` : '/conectar-personal')
  }
  throw redirect('/dashboard')
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    loader: redirectIfAuth,
  },
  {
    path: '/login',
    element: <LoginPage />,
    loader: redirectIfAuth,
  },
  {
    path: '/signup',
    element: <SignupPage />,
    loader: redirectIfAuth,
  },
  {
    path: '/signup/personal',
    element: <SignupTrainerPage />,
    loader: redirectIfAuth,
  },
  {
    path: '/signup/aluno',
    element: <SignupAlunoPage />,
    loader: redirectIfAuth,
  },
  {
    path: '/',
    element: <AppLayout />,
    loader: requireAuth,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'students', element: <StudentsListPage /> },
      { path: 'students/new', element: <StudentNewPage /> },
      { path: 'students/:id', element: <StudentDetailPage /> },
      { path: 'workouts', element: <WorkoutsListPage /> },
      { path: 'workouts/new', element: <WorkoutNewPage /> },
    ],
  },
  {
    path: '/conectar-personal',
    element: <ConectarPersonalPage />,
  },
  {
    path: '/professores',
    element: <ProfessoresPage />,
  },
  {
    path: '/t/:token',
    element: <PublicWorkoutPage />,
  },
  {
    path: '/aluno/login',
    element: <AlunoLoginPage />,
  },
  {
    path: '/aluno/definir-senha',
    element: <AlunoDefinirSenhaPage />,
  },
  {
    path: '/aluno/:token',
    element: <AlunoPage />,
  },
])
