# API SoloClick

Backend API para la plataforma SoloClick de gestión de servicios profesionales.

## Descripción

API REST construida con NestJS que permite gestionar profesionales, servicios, citas y pagos. Incluye autenticación JWT y manejo de roles (profesionales y clientes).

## Tecnologías

- NestJS
- MongoDB (Mongoose)
- JWT para autenticación
- TypeScript

## Estructura Principal

```
src/
├── auth/           # Autenticación y JWT
├── professionals/  # Gestión de profesionales
├── services/      # Servicios ofrecidos
├── appointments/  # Gestión de citas
├── payments/      # Procesamiento de pagos
└── users/         # Gestión de usuarios/clientes
```

## Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Login de usuarios
- `POST /professionals/login` - Login específico para profesionales

### Profesionales
- `POST /professionals` - Registro de profesional
- `GET /professionals/profile` - Obtener perfil (auth requerida)
- `PUT /professionals/profile` - Actualizar perfil (auth requerida)

### Servicios
- `POST /services` - Crear servicio (auth requerida)
- `GET /services/my-services` - Listar servicios propios (auth requerida)
- `PUT /services/:id` - Actualizar servicio (auth requerida)
- `DELETE /services/:id` - Eliminar servicio (auth requerida)
- `GET /services/professional/:professionalId` - Ver servicios de un profesional

### Citas
- `POST /appointments` - Crear cita
- `GET /appointments/professional` - Ver citas como profesional
- `GET /appointments/client` - Ver citas como cliente

## Configuración Inicial

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo .env con las variables:
```
MONGO_URI=tu_uri_de_mongodb
JWT_SECRET=tu_secreto_jwt
PORT=3000 # opcional, default 3000
```

3. Ejecutar en desarrollo:
```bash
npm run start:dev
```

## Autenticación

La API usa JWT. Incluir el token en los headers:
```
Authorization: Bearer <token>
```

## Scripts Disponibles

- `npm run start:dev` - Desarrollo con hot-reload
- `npm run build` - Compilar para producción
- `npm run start:prod` - Ejecutar versión producción

## Testing

# Instalar supertest si no está instalado
npm install --save-dev supertest @types/supertest

# Ejecutar todos los tests e2e
npm run test:e2e

# Ejecutar solo los tests de autenticación
npm run test:e2e auth.e2e-spec.ts