# Feature: Autenticación con Clerk

## Decisión

Stack de autenticación: **Clerk** (ya tomada por el usuario).

---

## Implementación

### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `src/middleware.ts` | Protege rutas, redirige a sign-in si no hay sesión |
| `src/components/Header.tsx` | Navbar con Sign In / UserButton según estado de auth |
| `src/app/sign-in/[[...sign-in]]/page.tsx` | Página de sign-in ( Clerk UI) |
| `src/app/sign-up/[[...sign-up]]/page.tsx` | Página de sign-up (Clerk UI) |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/app/layout.tsx` | Envuelto con `<ClerkProvider>` |
| `src/app/page.tsx` | Usa `<Header>` en vez de header inline |
| `src/app/builder/page.tsx` | Usa `<Header>` con acciones (historial, nueva spec) |
| `src/app/api/generate/route.ts` | Añadido `auth()` check → 401 si no hay usuario |
| `next.config.ts` | CSP actualizado para permitir recursos de Clerk |

### Dependencias instaladas

```
@clerk/nextjs@7.3.0
@clerk/clerk-react (peer dependency)
```

### Variables de entorno necesarias

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Rutas protegidas

- `/builder` → redirige a `/sign-in` si no autenticado
- `/spec/[id]` → redirige a `/sign-in` si no autenticado
- `/api/generate` → retorna 401 si no autenticado

### Rutas públicas

- `/` (landing)
- `/sign-in`
- `/sign-up`

---

## Detalles técnicos

### Middleware (v7)

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});
```

### Auth en API route

```typescript
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... resto del handler
}
```

### Header component

```typescript
export function Header({ actions }: HeaderProps) {
  const { isSignedIn, user } = useUser();

  return (
    <header>
      {/* Logo + Nav */}
      {!isSignedIn ? (
        <SignInButton><button>Sign In</button></SignInButton>
      ) : (
        <div>
          {user?.fullName && <span>{user.fullName}</span>}
          <UserButton />
        </div>
      )}
    </header>
  );
}
```

---

## CSP (Content Security Policy)

Actualizado en `next.config.ts` para permitir recursos de Clerk:

```
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev blob:
worker-src 'self' blob:
connect-src 'self' https://*.clerk.accounts.dev https://api.minimax.io https://clerk-telemetry.com
img-src 'self' https://img.clerk.com data:
```

---

## Lo que NO cambia

- Historial de specs → sigue en localStorage (`src/utils/storage.ts`)
- Lógica de generación de specs → sin cambios
- UI del builder → solo se añadió el Header con auth

---

## Pendiente

- [ ] Configurar vars de entorno en producción (Vercel)
- [ ] Configurar dominio de Clerk en dashboard (para producción)
- [ ] Posiblemente añadir logout visual en Header (el UserButton ya lo incluye)