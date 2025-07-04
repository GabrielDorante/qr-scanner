# 🗑️ Cómo Eliminar Archivos en GitHub

## 📋 **Archivos que DEBES ELIMINAR**

Estos archivos ya no son necesarios con la nueva versión React:

- ✅ `sw.js` (Service Worker antiguo)
- ✅ `js/app.js` (JavaScript antiguo)  
- ✅ `js/analytics.js` (Analytics antiguo)
- ✅ `icons/generate-icons.js` (Generador de iconos)
- ✅ `create-icons.html` (Herramienta de iconos)

## 🖱️ **Método 1: Interfaz Web de GitHub (Más Fácil)**

### **Paso a Paso:**

1. **Ve a tu repositorio** en GitHub.com
2. **Haz clic en el archivo** que quieres eliminar (ej: `sw.js`)
3. **Haz clic en el ícono de papelera** 🗑️ (arriba a la derecha del archivo)
4. **Escribe un mensaje** como: "Eliminar archivo obsoleto"
5. **Haz clic en "Commit changes"**
6. **Repite para cada archivo**

### **Ubicación de cada archivo:**

```
📁 tu-repositorio/
├── sw.js ← ELIMINAR (está en la raíz)
├── js/
│   ├── app.js ← ELIMINAR
│   └── analytics.js ← ELIMINAR
├── icons/
│   └── generate-icons.js ← ELIMINAR
└── create-icons.html ← ELIMINAR (está en la raíz)
```

## 💻 **Método 2: Git Command Line (Si tienes Git)**

```bash
# Eliminar archivos
git rm sw.js
git rm js/app.js
git rm js/analytics.js
git rm icons/generate-icons.js
git rm create-icons.html

# Confirmar cambios
git commit -m "Eliminar archivos obsoletos - migración a React"

# Subir cambios
git push origin main
```

## 📁 **Método 3: Eliminar Carpetas Completas**

Si quieres eliminar toda la carpeta `js/`:

1. **Ve a la carpeta** `js/` en GitHub
2. **Haz clic en cada archivo** dentro de la carpeta
3. **Elimina uno por uno** con el ícono de papelera
4. **La carpeta se eliminará automáticamente** cuando esté vacía

## ✅ **Verificación Final**

Después de eliminar, tu estructura debería verse así:

```
📁 tu-repositorio/
├── 📄 index.html ← ACTUALIZADO
├── 📄 manifest.json ← MANTENER
├── 📄 package.json ← MANTENER
├── 📄 tailwind.config.js ← ACTUALIZADO
├── 📄 README.md ← MANTENER
├── 📁 src/
│   ├── App.tsx ← NUEVO
│   ├── index.css ← ACTUALIZADO
│   └── main.tsx ← MANTENER
├── 📁 icons/ ← MANTENER (solo los .png)
│   ├── icon-72.png
│   ├── icon-96.png
│   └── ... (otros iconos)
└── 📁 .github/
    └── workflows/
        └── deploy.yml ← CREAR NUEVO
```

## 🚀 **Siguiente Paso: GitHub Actions**

Una vez eliminados los archivos, crea el archivo de deploy:

1. **Crea la carpeta** `.github/workflows/` en tu repositorio
2. **Crea el archivo** `deploy.yml` dentro
3. **Copia el contenido** del workflow que te proporcioné

## ⚠️ **Importante**

- **NO elimines** la carpeta `icons/` (solo el archivo `generate-icons.js`)
- **NO elimines** `manifest.json`
- **NO elimines** `README.md`
- **SÍ actualiza** `index.html`, `tailwind.config.js`, y los archivos de `src/`

## 🆘 **Si tienes problemas**

1. **Refresca la página** de GitHub
2. **Verifica que estés en la rama correcta** (main)
3. **Si no ves el ícono de papelera**, verifica que tengas permisos de escritura
4. **Si el archivo no se elimina**, puede estar siendo usado por GitHub Pages (espera unos minutos)

---

**¡Una vez eliminados los archivos obsoletos, tu app React estará lista para deploy! 🎉**