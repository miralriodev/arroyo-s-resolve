import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import RequireAuth from '../supabase/RequireAuth.jsx'
import RequireRole from '../supabase/RequireRole.jsx'
import AppShell from '../templates/AppShell'

const Services = lazy(() => import('../pages/Services'))
const ServiceDetail = lazy(() => import('../pages/ServiceDetail'))
const Accommodations = lazy(() => import('../pages/Accommodations'))
const AccommodationDetail = lazy(() => import('../pages/AccommodationDetail'))
const HostDashboard = lazy(() => import('../pages/HostDashboard'))
const Profile = lazy(() => import('../pages/Profile'))
const Admin = lazy(() => import('../pages/Admin'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const Privacy = lazy(() => import('../pages/Privacy'))
const DeleteAccount = lazy(() => import('../pages/DeleteAccount'))

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<div>Cargando…</div>}>
            <Accommodations />
          </Suspense>
        ),
      },
      {
        path: '/servicios',
        element: (
          <Suspense fallback={<div>Cargando…</div>}>
            <Services />
          </Suspense>
        ),
      },
      {
        path: '/alojamientos',
        element: (
          <Suspense fallback={<div>Cargando…</div>}>
            <Accommodations />
          </Suspense>
        ),
      },
      {
        path: '/alojamientos/:id',
        element: (
          <Suspense fallback={<div>Cargando…</div>}>
            <AccommodationDetail />
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
      {
        path: '/host',
        element: (
          <Suspense fallback={<div>Cargando…</div>}>
            <RequireRole allowed={["host", "admin"]}>
              <HostDashboard />
            </RequireRole>
          </Suspense>
        ),
      },
      {
        path: '/privacidad',
        element: (
          <Suspense fallback={<div>Cargando…</div>}>
            <Privacy />
          </Suspense>
        ),
      },
      {
        path: '/privacidad/eliminar-cuenta',
        element: (
          <Suspense fallback={<div>Cargando…</div>}>
            <DeleteAccount />
          </Suspense>
        ),
      },
    ],
  },
])