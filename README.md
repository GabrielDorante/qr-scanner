# QR Scanner PWA

Una aplicación web progresiva moderna para escanear códigos QR con procesamiento local seguro.

## 🚀 Características

- **Escáner QR Avanzado**: Detección rápida y precisa de códigos QR
- **PWA Completa**: Funciona offline y se puede instalar como app nativa
- **Diseño Moderno**: Interfaz futurista con animaciones fluidas y efectos glassmorphism
- **Multiplataforma**: Compatible con Android, iOS y escritorio
- **Cámara Inteligente**: Soporte para múltiples cámaras y detección automática
- **Procesamiento Local**: Todo se procesa en tu dispositivo, sin envío de datos
- **Seguridad Avanzada**: Protección contra XSS y headers de seguridad

## 🛠️ Tecnologías

- **Frontend**: JavaScript Vanilla (ES6+)
- **Estilos**: CSS3 con variables personalizadas y animaciones
- **Detección QR**: jsQR Library
- **PWA**: Service Worker y Web App Manifest
- **Fuentes**: Google Fonts (Inter)

## 📱 Funcionalidades

- Escaneo en tiempo real de códigos QR
- Detección automática de tipos de contenido (URL, texto, email, teléfono, WiFi, vCard)
- Acciones contextuales (copiar, abrir, compartir, buscar)
- Instalación como PWA nativa
- Soporte para cámara frontal y trasera
- Interfaz responsive y accesible
- Notificaciones toast elegantes
- Sonido de confirmación al detectar QR

## 🎨 Diseño

Interfaz moderna con:
- Gradientes dinámicos animados
- Efectos de cristal (glassmorphism)
- Animaciones CSS fluidas
- Tema oscuro futurista
- Tipografía Inter optimizada
- Micro-interacciones elegantes

## 🔧 Desarrollo Local

```bash
# Servir la aplicación localmente
npm run dev

# O usar cualquier servidor HTTP
python -m http.server 3000
# o
npx serve . -p 3000
```

## 🚀 Deploy

La aplicación se despliega automáticamente en GitHub Pages usando GitHub Actions.

### Configuración automática:
1. Push a la rama `main`
2. GitHub Actions construye y despliega automáticamente
3. Disponible en: `https://tu-usuario.github.io/tu-repositorio`

## 📱 Instalación como PWA

1. Abre la aplicación en tu navegador
2. Busca el ícono "Instalar" en la barra de direcciones
3. Haz clic en "Instalar" para agregar a tu pantalla de inicio
4. ¡Úsala como una app nativa!

## 🔒 Seguridad

- **Procesamiento 100% local**: Ningún dato sale de tu dispositivo
- **Headers de seguridad**: CSP, X-Frame-Options, etc.
- **HTTPS obligatorio**: Para acceso a cámara en producción
- **Sin tracking**: No se recopilan datos del usuario

## 🌟 Características Técnicas

- **Responsive Design**: Optimizado para móviles y escritorio
- **Offline Ready**: Funciona sin conexión una vez cargada
- **Performance**: Carga rápida y animaciones a 60fps
- **Accesibilidad**: Cumple estándares WCAG
- **Cross-browser**: Compatible con todos los navegadores modernos

## 📄 Licencia

MIT License - Libre para uso personal y comercial.

---

**Desarrollado por ideasmagna** 🚀

*QR Scanner Seguro - Privacidad y seguridad primero*
