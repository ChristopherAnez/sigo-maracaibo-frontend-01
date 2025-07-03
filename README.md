# SIGO Maracaibo Frontend

Sistema de Gestión Operativa para la Alcaldía de Maracaibo.

## Estructura del proyecto refactorizado

El proyecto ha sido reestructurado para ser más escalable y evitar duplicidades. Se ha organizado con el siguiente patrón:

```
public/                   # Archivos estáticos accesibles públicamente
  |- images/              # Imágenes del sitio
  |- index.html           # Página de login
  |- dashboard.html       # Aplicación principal

src/                      # Código fuente de la aplicación
  |- components/          # Componentes reutilizables
  |- core/                # Funcionalidades principales
  |  |- app.js            # Punto de entrada de la aplicación
  |  |- config.js         # Configuración centralizada
  |  |- router.js         # Sistema de enrutamiento
  |  |- store.js          # Gestión de estado global
  |
  |- features/            # Módulos por funcionalidad
  |  |- dashboard/        # Módulo de dashboard
  |  |- login/            # Módulo de login
  |  |- users/            # Módulo de gestión de usuarios
  |
  |- services/            # Servicios de la aplicación
  |  |- api.js            # Cliente API centralizado
  |  |- auth.js           # Servicio de autenticación
  |
  |- utils/               # Utilidades
     |- global.css        # Estilos globales
     |- loader.js         # Gestión de loader
     |- notifications.js  # Sistema de notificaciones
     |- validation.js     # Validación de formularios
```

## Cambios realizados

1. **Eliminación de archivos duplicados**:
   - Se han eliminado los archivos duplicados entre `src/js` y `src/features`, manteniendo una única copia en `src/features`.
   - Se ha consolidado la configuración en un único archivo `src/core/config.js`.

2. **Modularización por características**:
   - Cada funcionalidad principal tiene su propio módulo en `src/features`.
   - Los componentes compartidos se han movido a `src/components` y `src/utils`.

3. **Sistema de gestión de estado**:
   - Se ha implementado un sistema de estado global simple en `src/core/store.js`.

4. **Cliente API centralizado**:
   - Se ha creado un cliente API unificado en `src/services/api.js`.

5. **Sistema de notificaciones**:
   - Se ha implementado un sistema de notificaciones toast en `src/utils/notifications.js`.

6. **Validación de formularios**:
   - Se han extraído las funciones de validación a `src/utils/validation.js`.

7. **Inicialización centralizada**:
   - La aplicación se inicializa desde `src/core/app.js`.

## Cómo ejecutar el proyecto

1. Abre el archivo `public/index.html` en tu navegador para acceder a la página de login.

2. Para desarrollo, puedes usar un servidor local como Live Server de VSCode.

## Próximos pasos recomendados

1. **Migrar a un bundler moderno** como Vite, Webpack o Rollup para una mejor gestión de dependencias y optimización.

2. **Implementar testing** con herramientas como Jest para componentes críticos.

3. **Documentación** adicional de componentes y funciones.

4. **Implementar internacionalización** para soporte multilenguaje.

5. **Mejorar accesibilidad** siguiendo pautas WCAG.
