import { createBrowserRouter, redirect } from 'react-router-dom'
import { supabase } from '@lib/supabase'

// Layouts
import { AppLayout } from '@pages/Layout/AppLayout'

// Pages
import { LandingPage } from '@pages/Landing'
import { LoginPage } from '@pages/Auth/Login'
import { SignupPage } from '@pages/Auth/Signup'
import { DashboardPage } from '@pages/Dashboard'
import { StudentsListPage } from '@pages/Students/List'
import { StudentNewPage } from '@pages/Students/New'
import { StudentDetailPage } from '@pages/Students/Detail'
import { WorkoutsListPage } from '@pages/Workouts/List'
import { WorkoutNewPage } from '@pages/Workouts/New'
import { PublicWorkoutPage } from '@pages/Workouts/Public'
import { AlunoPage } from '@pages/Aluno'

async function requireAuth() {
  const { data } = await supabase.auth.getSession()
  if (!data.session) throw redirect('/login')
  return null
}

async function redirectIfAuth() {
  const { data } = await supabase.auth.getSession()
  if (data.session) throw redirect('/dashboard')
  return null
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
    path: '/t/:token',
    element: <PublicWorkoutPage />,
  },
  {
    path: '/aluno/:token',
    element: <AlunoPage />,
  },
])
