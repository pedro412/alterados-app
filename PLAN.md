# Alterados MC - Plan del Proyecto

## Objetivo
App de control y gestion del motoclub Alterados MC. Miembros se registran, seleccionan capitulo y rol. Admin asigna presidentes. Presidentes gestionan su capitulo y miembros.

## Stack
- **Frontend:** React 19 + TypeScript + Vite 8 + Tailwind CSS v4
- **Backend:** Supabase (Auth + PostgreSQL + RLS)
- **Imagenes:** Cloudinary
- **UI:** Componentes propios (CVA + Tailwind)

## Datos de prueba

| Email | Password | Rol | Capitulo |
|-------|----------|-----|----------|
| pedro.alvarez412@outlook.com | Admin2024! | admin | Monterrey |
| ricky.garza@test.alterados.mx | Test1234! | president | Monterrey |
| miguel.trevino@test.alterados.mx | Test1234! | vice_president | Monterrey |
| carlos.ramirez@test.alterados.mx | Test1234! | road_captain | Monterrey |
| sofia.hernandez@test.alterados.mx | Test1234! | secretary | Monterrey |
| jorge.martinez@test.alterados.mx | Test1234! | member/prospect | Monterrey |
| ana.delgado@test.alterados.mx | Test1234! | president | Guadalajara |
| roberto.sanchez@test.alterados.mx | Test1234! | sergeant_at_arms | Guadalajara |
| fernando.rojas@test.alterados.mx | Test1234! | treasurer | Guadalajara |
| luis.navarro@test.alterados.mx | Test1234! | member | Guadalajara |
| maria.cruz@test.alterados.mx | Test1234! | member/copilot | Guadalajara |

## Mapa de Rutas

| Ruta | Componente | Acceso | Estado |
|------|-----------|--------|--------|
| `/login` | Login | publico | hecho |
| `/register` | Register | publico | hecho |
| `/` | Dashboard | autenticado | hecho |
| `/admin` | AdminPanel | admin | hecho |
| `/chapters` | ChapterList | admin/presidente | hecho |
| `/chapters/:id` | ChapterDetail | autenticado | hecho |
| `/chapters/:id/settings` | ChapterSettings | admin/presidente | hecho |
| `/chapter/settings` | ChapterSettingsRedirect | presidente | hecho |
| `/members` | MembersRedirect | autenticado | hecho |
| `/members/new` | MemberRegistration | admin/presidente | hecho |
| `/profile` | Profile | autenticado | pendiente |
| `/profile/:id` | PublicProfile (QR) | publico | pendiente |
| `/birthdays` | Birthdays | autenticado | pendiente |

## Features

### 1. Autenticacion
- [x] Login con email/password
- [x] Registro con seleccion de capitulo
- [x] Trigger auto-crea profile al registrarse
- [x] RLS por rol (admin, presidente, miembro)

### 2. Gestion de miembros
- [x] Admin puede cambiar rol de cualquier miembro
- [x] Presidente ve lista de miembros de su capitulo
- [x] Presidente puede editar datos de miembros (rol, tipo, etc.)
- [x] Presidente puede registrar miembros manualmente
- [x] Progreso de miembros (registrados vs esperados)

### 3. Gestion de capitulos
- [x] Lista de capitulos con progreso
- [x] Presidente edita info de su capitulo (logo, ciudad, fecha, expected)
- [x] Admin puede editar cualquier capitulo

### 4. Credenciales
- [ ] Vista previa de credencial para imprimir
- [ ] Frente: foto, nombre, rol, capitulo, sangre, emergencia
- [ ] Reverso: codigo QR con link al perfil publico

### 5. Perfil publico (QR)
- [ ] Pagina publica sin datos sensibles
- [ ] Muestra: nombre, sangre, emergencia, capitulo

### 6. Aniversarios
- [ ] Vista mensual de capitulos que cumplen aniversario
- [ ] Vista mensual de miembros que cumplen anios

## Base de datos

### Tablas
- `chapters` - capitulos/sedes del club
- `profiles` - extiende auth.users con datos del miembro

### Funciones helper
- `is_admin()` - verifica si el usuario actual es admin
- `is_president_of(chapter_id)` - verifica si es presidente de un capitulo
- `handle_new_user()` - trigger que crea profile al registrarse
- `update_updated_at()` - trigger que actualiza timestamp
