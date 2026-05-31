# Mi App — Tracker de oficina (PWA)

## Requisitos
- [Node.js](https://nodejs.org/) (versión 18 o superior)

## Instalación local

```bash
# 1. Instalar dependencias
npm install

# 2. Correr en modo desarrollo
npm run dev
```

Abrí `http://localhost:5173` en el navegador.

---

## Íconos (necesario antes de deployar)

Necesitás poner íconos en `public/icons/`:
- `icon-192.png` (192×192 px)
- `icon-512.png` (512×512 px)

Podés generar íconos gratis en [favicon.io](https://favicon.io) o [realfavicongenerator.net](https://realfavicongenerator.net).

---

## Deploy en GitHub Pages (gratis)

### 1. Preparar el repo

```bash
git init
git add .
git commit -m "primer commit"
```

Creá un repo en GitHub y pusheá:

```bash
git remote add origin https://github.com/TU_USUARIO/mi-app.git
git push -u origin main
```

### 2. Configurar Vite para GitHub Pages

En `vite.config.js`, agregá `base` con el nombre de tu repo:

```js
export default defineConfig({
  base: '/mi-app/',   // <-- nombre de tu repo
  plugins: [...]
})
```

### 3. Instalar gh-pages y deployar

```bash
npm install --save-dev gh-pages
```

En `package.json`, agregá en `scripts`:

```json
"deploy": "npm run build && gh-pages -d dist"
```

Luego:

```bash
npm run deploy
```

Tu app queda en: `https://TU_USUARIO.github.io/mi-app/`

---

## Instalar como app en el celu

1. Abrí la URL de tu app en Chrome (Android) o Safari (iOS)
2. **Android**: menú ⋮ → "Agregar a pantalla de inicio"
3. **iOS**: botón compartir → "Agregar a pantalla de inicio"

---

## Agregar módulos nuevos (ej: Gym)

1. Creá la carpeta `src/modules/gym/`
2. Agregá `Gym.jsx`, `useGym.js`, `Gym.css`
3. En `App.jsx`, descomentá el módulo en el array `MODULES`
4. Agregá `{activeModule === 'gym' && <Gym />}` en el render

---

## Estructura del proyecto

```
mi-app/
├── public/
│   └── icons/           ← íconos de la app
├── src/
│   ├── modules/
│   │   └── oficina/     ← módulo de oficina
│   │       ├── Oficina.jsx
│   │       ├── Oficina.css
│   │       └── useOficina.js
│   ├── App.jsx          ← shell principal
│   ├── App.css
│   ├── index.css        ← estilos globales
│   └── main.jsx
├── vite.config.js
└── package.json
```
