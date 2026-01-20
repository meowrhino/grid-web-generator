# Grid Web Generator

**Generador de narrativas web con sistema de grid navegable**

by [meowrhino.studio](https://meowrhino.studio)

---

## 🎯 ¿Qué es?

Grid Web Generator es una herramienta visual para crear narrativas web interactivas basadas en un sistema de grid navegable. Perfecto para crear historias, portfolios, galerías o cualquier experiencia web que se beneficie de una navegación espacial.

## ✨ Características

### ✅ Editor de Grid 9x9
- Activa/desactiva celdas con un click
- Define la celda de inicio con click derecho
- Visualización clara del grid activo

### ✏️ Editor de Pantalla
- Añade elementos de texto libremente
- Posiciona con porcentajes (%) dentro de cada pantalla
- Personaliza tamaño, color y fuente
- Drag & drop para mover elementos
- Color de fondo por pantalla

### 👁️ Preview Dual
- **Desktop**: 1280 x 832 px
- **Móvil**: 320 x 580 px
- Preview en tiempo real
- Navegación automática generada

### 💾 Gestión de Proyectos
- Guardar proyecto como JSON
- Cargar proyectos guardados
- Exportar como HTML standalone

### 🚀 Exportación
- HTML standalone listo para subir
- Export HTML sin dependencias externas
- Funciona en cualquier hosting
- Navegación automática incluida

---

## 🎮 Cómo usar

### 1. Configura el Grid

1. Selecciona el tamaño del grid (3x3, 5x5, 7x7 o 9x9)
2. **Click izquierdo** en las celdas para activarlas
3. **Click derecho** en una celda activa para marcarla como inicio (⭐)

### 2. Edita las Pantallas

1. Selecciona una pantalla del dropdown
2. Click en "➕ Añadir texto" para crear elementos
3. Arrastra los elementos para posicionarlos
4. Usa el panel de propiedades para personalizar:
   - Texto
   - Tamaño (12-120px)
   - Color
   - Fuente
   - Posición exacta (%)
5. Cambia el color de fondo de la pantalla

### 3. Preview

1. Alterna entre vista Desktop 🖥️ y Móvil 📱
2. Los botones de navegación se generan automáticamente
3. Solo aparecen botones para celdas adyacentes activas

### 4. Exporta

1. **💾 Guardar**: Descarga tu proyecto como JSON
2. **📂 Cargar**: Carga un proyecto guardado
3. **⬇️ Exportar HTML**: Genera un archivo HTML standalone

---

## 📐 Sistema de Coordenadas

El generador usa porcentajes (%) para posicionar elementos dentro de cada pantalla:

- `10%` = 10% del ancho de la pantalla
- `50%` = 50% del alto de la pantalla
- Los valores van de 0 a 100

Esto hace que tu narrativa sea **totalmente responsive** y se adapte a cualquier tamaño de pantalla.

---

## 🎨 Casos de uso

### Narrativas interactivas
Crea historias donde el usuario navega espacialmente por diferentes escenas.

### Portfolios creativos
Organiza tu trabajo en un grid navegable único.

### Galerías
Presenta imágenes o proyectos con navegación espacial.

### Experiencias experimentales
Explora nuevas formas de navegación web.

---

## 🛠️ Tecnologías

- HTML5
- CSS3 (con variables CSS y porcentajes)
- JavaScript vanilla (ES6+)
- Google Fonts (solo para la UI del editor)
- Sin dependencias externas

---

## 📱 Compatibilidad

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Móviles (iOS/Android)

---

## 🚀 Instalación

### Opción 1: Usar online
Abre `index.html` directamente en tu navegador.

### Opción 2: Servidor local
```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx http-server
```

Luego abre `http://localhost:8000` en tu navegador.

---

## 📦 Estructura del proyecto

```
grid-web-generator/
├── index.html          # Interfaz del generador
├── style.css           # Estilos del generador
├── script.js           # Lógica del generador
├── README.md           # Este archivo
└── manus/
    └── proceso.md      # Documentación del desarrollo
```

---

## 💡 Tips

### Navegación
- Los botones de navegación solo aparecen si hay una celda activa en esa dirección
- Puedes crear laberintos o caminos específicos activando solo ciertas celdas

### Posicionamiento
- Usa valores pequeños (0-20) para elementos cerca de los bordes
- Usa valores centrales (40-60) para elementos en el medio
- Los valores en % se adaptan automáticamente al tamaño de pantalla

### Diseño responsive
- Prueba tu narrativa en ambos modos (Desktop y Móvil)
- Los textos grandes pueden verse diferentes en móvil
- Ajusta posiciones si es necesario

### Exportación
- El HTML exportado es completamente standalone
- Puedes subirlo a GitHub Pages, Netlify, o cualquier hosting
- No necesita servidor, funciona con archivos estáticos

---

## 🎓 Ejemplos de uso

### Historia lineal
```
Grid 3x3:
  [X]
  [X]
  [X]
```
Activa solo una columna para una narrativa lineal vertical.

### Laberinto
```
Grid 5x5:
[X][ ][X][ ][X]
[X][X][X][ ][X]
[ ][ ][X][X][X]
[X][X][X][ ][ ]
[X][ ][ ][ ][X]
```
Crea caminos complejos con múltiples rutas.

### Cruz
```
Grid 5x5:
[ ][ ][X][ ][ ]
[ ][ ][X][ ][ ]
[X][X][X][X][X]
[ ][ ][X][ ][ ]
[ ][ ][X][ ][ ]
```
Organiza contenido en forma de cruz.

---

## 🐛 Solución de problemas

### Los elementos no se mueven
- Asegúrate de que el elemento esté seleccionado (borde morado)
- Arrastra desde el centro del elemento

### El preview no se actualiza
- Selecciona una pantalla del dropdown
- Verifica que la celda esté activa en el grid

### La exportación no funciona
- Define una celda de inicio (click derecho)
- Asegúrate de tener al menos una celda activa

---

## 📄 Licencia

Este proyecto es de código abierto. Úsalo libremente.

---

## 👤 Autor

**meowrhino.studio**

Diseñador y artista web especializado en creative coding y pedagogía digital.

---

## 🙏 Créditos

Inspirado por herramientas como [Bitsy](https://ledoux.itch.io/bitsy) y [Mosi](https://zenzoa.itch.io/mosi).

---

¿Tienes preguntas o sugerencias? ¡Abre un issue en GitHub!
