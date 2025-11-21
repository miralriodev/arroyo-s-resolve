## Principios de diseño
- Minimalista, aireado y profesional: espacios generosos, jerarquía clara, sombras sutiles.
- Paleta neutra (tipo shadcn/zinc) con acentos discretos; eliminar colores llamativos por defecto.
- Componentes consistentes con estados (hover/focus/disabled) accesibles y previsibles.
- Inspiración Apple/Airbnb: tipografía limpia, bordes suaves, micro-interacciones delicadas.

## Actualizar tokens del tema
- `src/design-system/theme.js:1`:
  - Colores: reemplazar `primary/secondary` saturados por una escala neutra (`background`, `surface`, `surfaceAlt`, `border`, `muted`, `accent`, `danger`, `warn`, `success`). Añadir `surfaceAlt` (faltante, usado en `AppShell`).
  - Radios: `sm: 8px`, `md: 12px`, `lg: 16px`.
  - Sombras: reducir intensidad (`sm: 0 1px 2px rgba(0,0,0,0.05)`, `md: 0 4px 12px rgba(0,0,0,0.06)`, `lg: 0 10px 24px rgba(0,0,0,0.08)`).
  - Spacing: mantener escala pero revisar densidad para más aire.
  - Tipografía: consolidar tamaños; mantener `Inter` (ya definido) y ajustar pesos.
- `src/design-system/GlobalStyle.js:3`:
  - Enlaces con subrayado al foco/hover y color más sobrio.
  - Fondo general ligeramente cálido (`background`) y texto en `#1f2937`.

## Refactor de átomos
- Botón `src/components/atoms/Button.jsx:3`:
  - Variantes: `default`, `primary`, `outline`, `ghost`, `destructive` y tamaños `sm/md/lg`.
  - Por defecto neutro (blanco/surface con borde `border`), acento solo en `primary`.
  - Quitar sombras llamativas; hover: elevación mínima y cambio de borde; focus: ring suave tipo shadcn (`box-shadow: 0 0 0 3px rgba(0,0,0,0.08)`).
- Inputs/Select/Textarea:
  - `src/components/atoms/Input.jsx:3`, `Select.jsx:3`, `Textarea.jsx:3`.
  - Bordes suaves, fondo `#fff`, placeholder `muted`, hover/focus con ring tenue y sin salto de sombra.
  - Mantener `$bare` para uso en `PillFields`, pero con foco claramente visible.
- Badge `src/components/atoms/Badge.jsx:3`:
  - Simplificar a fondo `surface` + texto `muted`; usar dot de color por variante, sin caja interior exagerada.
- Card `src/components/atoms/Card.jsx:3`:
  - Fondo `#fff`, borde `border`, sombra `sm`; menos contraste, más padding en `Header/Content/Footer`.
- Heading `src/components/atoms/Heading.jsx:1`:
  - Ajustar tamaños/pesos a estilo editorial (Apple/Airbnb): `h1 2.125rem`, `h2 1.5rem`, `h3 1.25rem` con `letter-spacing` sutil.

## Ajustes en moléculas y organismos
- PillFields `src/components/molecules/PillFields.jsx:1`:
  - Reducir borde a `1px`, eliminar box-shadow, mantener `:focus-within` con ring sutil.
- ServiceCard `src/components/molecules/ServiceCard.jsx:1`:
  - Sombras discretas, imagen con `radius` solo arriba, tipografía y meta más sobria; usar `aria-label` con nombre y precio.
- Navbar `src/components/organisms/Navbar.jsx:211`:
  - Marca y navegación minimal: resaltar activo con subrayado sutil, quitar fondos sólidos en botones.
  - Drawer móvil con fondo `surface` y blur ligero; iconografía `currentColor`.
- Footer `src/components/organisms/Footer.jsx:1`:
  - Reducir contraste, usar `muted` y paddings más generosos.
- AppShell `src/templates/AppShell.jsx:36`:
  - Corregir `surfaceAlt` (añadido al tema); back button `outline`.

## Radix UI (accesibilidad) sin Tailwind
- Añadir primitivas Radix: `@radix-ui/react-select`, `@radix-ui/react-dialog`, `@radix-ui/react-tooltip`.
- Envolver con styled-components para estilos minimalistas coherentes con el tema.
- Sustituir usos críticos de `<select>` por `Radix Select` en filtros donde se necesite mejor UX; mantener nativo donde convenga simplicidad.

## Páginas clave a pulir
- Alojamientos `src/pages/Accommodations.jsx:59`:
  - Hero sin degradado; texto de bienvenida limpio; grid con más aire y cards consistentes.
  - Botón “Buscar” variante `outline` alineado a la derecha; loading con skeleton simple.
- Listados (Mis reservas, HostDashboard, Admin):
  - Tablas con líneas tenues, badges compactos; acciones con `ghost`/`outline`.

## Accesibilidad y micro-detalles
- Estados de foco visibles en todos los interactivos; contraste AA mínimo.
- `aria-label`/roles en Navbar Drawer y menús (ya presentes) revisados.
- Mejorar `Link` perceptible: audit “Links have a discernible name”.

## Verificación
- Revisar Lighthouse y axe: accesibilidad, CLS y color-contrast.
- Pruebas visuales en móvil/desktop; comprobar responsivo en `sm/md/lg` breakpoints.

## Entregables
- Tema actualizado, átomos y moléculas refactorizados, Navbar/Footer pulidos.
- Integración opcional de Radix en Select/Dialog/Tooltip con estilos del tema.

## Rollout
1) Actualizar `theme.js` y `GlobalStyle`.
2) Refactor de átomos (Button/Input/Select/Textarea/Badge/Card/Heading).
3) Ajustes de moléculas (PillFields/ServiceCard) y organismos (Navbar/Footer/AppShell).
4) Pulir páginas (Alojamientos y listados).
5) Integrar Radix en componentes críticos.
6) Verificación con Lighthouse/axe y ajustes finales.

¿Confirmas este plan para proceder con la implementación?