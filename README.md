# CharruaBus Frontend

Interfaz web administrativa de CharruaBus, desarrollada con Angular y Angular Material.

## 📋 Prerequisitos

- **Node.js** v18.x o superior  
- **npm** v9.x o superior  
- **Angular CLI** v19.x  
- **Chrome**, **Edge** u otro navegador moderno para desarrollo
- Backend corriendo en `http://localhost:8080` (o ajustar proxy)

## 🔧 Instalación

1. Clona el repositorio:

   ```bash
   git clone <url-del-repo>
   cd <ruta-al-frontend>
   ```

2. Instala dependencias:

   ```bash
   npm install
   ```

## 🔌 Configuración de desarrollo

- El proxy para evitar CORS está en `proxy.conf.json`:

  ```json
  {
    "/api": {
      "target": "http://localhost:8080",
      "secure": false,
      "changeOrigin": true,
      "logLevel": "debug"
    }
  }
  ```

- Asegúrate de que el backend escuche en el puerto `8080`. Para otro puerto, actualiza `proxy.conf.json` y tus servicios.

## 🚀 Comandos principales

- **Desarrollo**  

  ```bash
  npm start
  # o
  ng serve --proxy-config proxy.conf.json
  ```

  Accede en `http://localhost:4200`.

- **Build producción**  

  ```bash
  npm run build
  ```

  Salida en `dist/charruabus-frontend`.

- **Tests unitarios**  

  ```bash
  npm test
  ```

- **Lint**  

  ```bash
  npm run lint
  ```

## 📁 Estructura de carpetas

```
src/
├── app/
│   ├── component/
│   │   ├── navbar/
│   │   ├── users-page/
│   │   ├── buses-page/
│   │   ├── localidades-page/
│   │   ├── viajes-page/
│   │   └── configuracion-del-sistema/
│   │       ├── configuracion-del-sistema.component.ts
│   │       ├── configuracion-del-sistema.component.html
│   │       ├── configuracion-del-sistema.component.scss
│   │       └── dialogs/
│   │           └── edit-configuracion-dialog.component.*
│   ├── services/
│   │   ├── usuarios.service.ts
│   │   ├── buses.service.ts
│   │   └── configuracion-del-sistema.service.ts
│   ├── models/
│   │   ├── usuario.ts
│   │   ├── bus.ts
│   │   └── configuracion.ts
│   └── app.routes.ts
└── assets/
    └── charruabusIcon.png
```

## 🛠️ Troubleshooting

- **CORS / 404 en llamadas `/api`**  
  Verifica que `ng serve` use `--proxy-config proxy.conf.json` y que el backend esté en `localhost:8080`.

- **Errores TS de módulos faltantes**  
  Ejecuta `npm install` y revisa importaciones en `tsconfig.json`.

- **Estilos no aplican**  
  Revisa `styles.css` para importar Bootstrap o Angular Material themes.

---

# FORMER README.md

# Charruabus

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
