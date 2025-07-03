# QR Scanner PWA - ideasmagna

Una aplicación web progresiva (PWA) moderna para escanear códigos QR con tecnología avanzada.

## 🚀 Características

- **PWA Completa**: Funciona offline y se puede instalar como app nativa
- **Diseño Futurista**: Interfaz moderna con animaciones sutiles
- **Multiplataforma**: Compatible con Android, iOS y escritorio
- **Cámara Avanzada**: Soporte para múltiples cámaras y cambio automático
- **Analytics Integrado**: Seguimiento de uso y estadísticas
- **Actualizaciones Automáticas**: Sistema de notificaciones para nuevas versiones

## 📱 Instalación en GitHub Pages

### Paso 1: Crear el Repositorio

1. Ve a [GitHub.com](https://github.com) e inicia sesión
2. Haz clic en el botón verde "New" para crear un nuevo repositorio
3. Nombra tu repositorio (ej: `qr-scanner-app`)
4. Marca la casilla "Add a README file"
5. Haz clic en "Create repository"

### Paso 2: Subir los Archivos

**Opción A: Usando la interfaz web de GitHub**

1. En tu repositorio, haz clic en "uploading an existing file"
2. Arrastra todos los archivos del proyecto a la zona de subida
3. Escribe un mensaje de commit como "Initial commit - QR Scanner PWA"
4. Haz clic en "Commit changes"

**Opción B: Usando Git (si tienes Git instalado)**

```bash
git clone https://github.com/tu-usuario/qr-scanner-app.git
cd qr-scanner-app
# Copia todos los archivos del proyecto aquí
git add .
git commit -m "Initial commit - QR Scanner PWA"
git push origin main
```

### Paso 3: Activar GitHub Pages

1. En tu repositorio, ve a la pestaña "Settings"
2. Desplázate hacia abajo hasta la sección "Pages"
3. En "Source", selecciona "Deploy from a branch"
4. Selecciona "main" como branch y "/ (root)" como folder
5. Haz clic en "Save"

### Paso 4: Acceder a tu App

- Tu app estará disponible en: `https://tu-usuario.github.io/qr-scanner-app`
- GitHub te mostrará la URL exacta en la sección Pages

## 🔧 Configuración de Analytics

### Opción 1: Vercel Analytics (Recomendado - Gratuito)

1. Ve a [vercel.com/analytics](https://vercel.com/analytics)
2. Conecta tu repositorio de GitHub
3. Agrega este código antes del `</head>` en `index.html`:

```html
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

### Opción 2: Google Analytics 4

1. Crea una cuenta en [Google Analytics](https://analytics.google.com)
2. Obtén tu ID de medición (ej: G-XXXXXXXXXX)
3. Agrega este código antes del `</head>` en `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Opción 3: Analytics Personalizado

El código ya incluye un sistema básico que almacena eventos en IndexedDB. Puedes modificar `js/analytics.js` para enviar datos a tu propio servidor.

## 📊 Métricas Disponibles

La app rastrea automáticamente:

- **Usuarios únicos**: Dispositivos que han usado la app
- **Sesiones**: Número de veces que se abre la app
- **Escaneos**: Códigos QR escaneados exitosamente
- **Tipos de QR**: URLs, texto, WiFi, etc.
- **Errores**: Problemas técnicos
- **Rendimiento**: Tiempos de carga
- **Instalaciones**: Apps instaladas como PWA

## 🎨 Personalización

### Cambiar Colores

Edita las variables CSS en `index.html`:

```css
:root {
  --primary-gradient: linear-gradient(135deg, #3b82f6, #8b5cf6);
  --accent-color: #3b82f6;
  --background-dark: #0A0A0A;
}
```

### Cambiar Logo

1. Reemplaza el texto "QR Scanner" en la clase `.header h1`
2. O agrega una imagen: `<img src="logo.png" alt="Logo" class="logo">`

### Generar Iconos Personalizados

1. Instala Node.js y Sharp: `npm install sharp`
2. Modifica `icons/generate-icons.js` con tu diseño
3. Ejecuta: `node icons/generate-icons.js`

## 🔄 Actualizaciones

Para actualizar la app:

1. Modifica los archivos necesarios
2. Cambia la versión en `sw.js`: `const CACHE_NAME = 'qr-scanner-v1.0.1';`
3. Sube los cambios a GitHub
4. Los usuarios verán automáticamente el modal de actualización

## 🛠️ Desarrollo Local

```bash
# Servir localmente (requiere Python)
python -m http.server 8000

# O con Node.js
npx serve .

# Accede a http://localhost:8000
```

## 📱 Instalación en Dispositivos

### Android
1. Abre la app en Chrome
2. Toca el menú (⋮) → "Instalar app"
3. Confirma la instalación

### iOS
1. Abre la app en Safari
2. Toca el botón compartir (□↗)
3. Selecciona "Agregar a pantalla de inicio"

## 🔒 Privacidad y Seguridad

- **Sin servidores**: Todo funciona en el dispositivo del usuario
- **Sin almacenamiento de QR**: Los códigos no se guardan
- **HTTPS obligatorio**: GitHub Pages usa HTTPS automáticamente
- **Permisos mínimos**: Solo acceso a cámara cuando se solicita

## 📞 Soporte

Para problemas o sugerencias:
- Crea un issue en GitHub
- Contacta a ideasmagna

## 📄 Licencia

MIT License - Libre para uso personal y comercial.

---

**Powered by ideasmagna** 🚀