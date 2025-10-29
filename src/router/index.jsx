import { createBrowserRouter } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import AppShell from '../templates/AppShell'
import RequireAuth from '../supabase/RequireAuth.jsx'
import RequireRole from '../supabase/RequireRole.jsx'

const Services = lazy(() => import('../pages/Services'))
const ServiceDetail = lazy(() => import('../pages/ServiceDetail'))
const Reservations = lazy(() => import('../pages/Reservations'))
const Profile = lazy(() => import('../pages/Profile'))
const Admin = lazy(() => import('../pages/Admin'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<div>Cargando…</div>}>
            <Services />
          </Suspense>
        ),
      },
      {
        path: '/login',
        element: (
          <Suspense fallback={<div>Cargando…</div>}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: '/registro',
        element: (
          <Suspense fallback={<div>Cargando…</div>}>
            <Register />
          </Suspense>
        ),
      },
      {
        path: '/servicios/:id',
        element: (
          <Suspense fallback={<div>Cargando…</div>}>
            <ServiceDetail />
          </Suspense>
        ),
      },
      {
        path: '/reservas',
        element: (
          <Suspense fallback={<div>Cargando…</div>}>
            <Reservations />
          </Suspense>
        ),
      },
      {
        path: '/perfil',
        element: (
          <Suspense fallback={<div>Cargando…</div>}>
            <RequireAuth>
              <Profile />
            </RequireAuth>
          </Suspense>
        ),
      },
      {
        path: '/admin',
        element: (
          <Suspense fallback={<div>Cargando…</div>}>
            <RequireRole allowed={["admin"]}>
              <Admin />
            </RequireRole>
          </Suspense>
        ),
      },
    ],
  },
])