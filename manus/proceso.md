# Proceso de Desarrollo - Grid Web Generator

## 📅 20 de enero de 2026 - 08:30h

### Título: Creación del Grid Web Generator

---

## 🎯 Sinopsis

Se ha creado desde cero el **Grid Web Generator**, una herramienta visual para generar narrativas web interactivas basadas en un sistema de grid navegable. El proyecto implementa todas las funcionalidades "fáciles" identificadas en el análisis previo de Mosi, adaptadas específicamente para crear experiencias web con navegación espacial.

---

## 📋 Contexto

El usuario solicitó crear un generador de páginas web similar a Mosi, pero enfocado en narrativas web. Los requisitos específicos fueron:

1. Editor de grid hasta 9x9 con activación de celdas
2. Selección de celda inicial
3. Navegación automática entre pantallas
4. Editor de texto con posicionamiento libre usando porcentajes
5. Preview dual: Desktop (1280x832) y Móvil (320x580)
6. Exportación como HTML standalone
7. Guardar/cargar proyectos

---

## 🏗️ Arquitectura implementada

### Estructura de archivos

El proyecto se organizó en tres archivos principales siguiendo el principio de separación de responsabilidades:

- **index.html**: Estructura y layout de la interfaz
- **style.css**: Estilos visuales y diseño
- **script.js**: Lógica de la aplicación

### Diseño de la interfaz

La interfaz se organizó en tres columnas con bloques apilados:

#### Columna izquierda: Mapa y estado
Permite configurar el grid y activar/desactivar celdas. Incluye selector de tamaño, mapa de celdas y un bloque de estado con métricas rápidas.

#### Columna central: Pantalla y propiedades
Proporciona herramientas para editar el contenido de cada pantalla seleccionada. Incluye acciones, lienzo editable y panel de propiedades para elementos seleccionados.

#### Columna derecha: Preview y export
Muestra una vista previa en tiempo real con dos modos (Desktop y Móvil) y un bloque auxiliar de exportación. Los botones de navegación se generan automáticamente según las celdas adyacentes activas.

---

## 💻 Implementación técnica

### 1. Sistema de estado

Se implementó un objeto global `state` que mantiene toda la información de la aplicación:

```javascript
const state = {
    gridSize: 9,              // Tamaño del grid
    grid: [],                 // Matriz de celdas activas/inactivas
    startCell: null,          // Celda de inicio
    currentScreen: null,      // Pantalla actualmente editada
    screens: {},              // Datos de todas las pantallas
    selectedElement: null,    // Elemento seleccionado
    previewMode: 'desktop'    // Modo de preview
};
```

### 2. Editor de Grid

El grid se renderiza dinámicamente usando CSS Grid. Cada celda tiene dos eventos:

- **Click izquierdo**: Activa/desactiva la celda
- **Click derecho**: Marca como celda de inicio (⭐)

Cuando se activa una celda, se crea automáticamente un objeto `screen` con su configuración inicial.

### 3. Editor de Pantalla

Los elementos de texto se posicionan usando `position: absolute` con porcentajes (%) relativos al contenedor. Esto garantiza que sean responsive y se adapten a cualquier tamaño de pantalla.

#### Sistema de drag & drop

Se implementó un sistema de arrastre personalizado que:
1. Captura la posición inicial al hacer mousedown
2. Calcula el delta de movimiento en mousemove
3. Convierte píxeles a porcentajes (%)
4. Actualiza la posición del elemento y el estado

#### Panel de propiedades

Permite editar todas las características del elemento seleccionado:
- Texto (textarea)
- Tamaño (12-120px con slider)
- Color (color picker)
- Fuente (select con opciones comunes)
- Posición X e Y (inputs numéricos en %)

### 4. Sistema de Preview

El preview se actualiza en tiempo real cada vez que cambia algo. Se implementaron dos modos con escalado CSS:

- **Desktop**: 1280x832px escalado a 25% (transform: scale(0.25))
- **Móvil**: 320x580px escalado a 65% (transform: scale(0.65))

#### Generación automática de navegación

Los botones de navegación se generan dinámicamente comprobando las celdas adyacentes:

```javascript
const directions = [
    { dy: -1, dx: 0, label: '↑' },  // Arriba
    { dy: 1, dx: 0, label: '↓' },   // Abajo
    { dy: 0, dx: -1, label: '←' },  // Izquierda
    { dy: 0, dx: 1, label: '→' }    // Derecha
];
```

Solo se crea un botón si existe una celda activa en esa dirección.

### 5. Persistencia de datos

#### Guardar proyecto
Serializa el estado completo a JSON y lo descarga como archivo.

#### Cargar proyecto
Lee un archivo JSON y restaura el estado completo de la aplicación.

#### Exportar HTML
Genera un archivo HTML standalone que incluye:
- Todos los estilos inline
- Todas las pantallas con su contenido
- Sistema de navegación funcional
- Script de navegación embebido
- Atribución a meowrhino.studio

El HTML exportado no tiene dependencias externas y funciona directamente al abrirlo.

---

## 🎨 Decisiones de diseño

### Paleta de colores

Se eligió una paleta clara y cálida con contraste suave:
- **Accent**: #1f5b4b (verde profundo) para acciones principales
- **Surface**: #ffffff / #f1ece2 para bloques
- **Background**: #f6f2ea con gradientes suaves
- **Text**: #1e2326 y #6a6a63 para jerarquía de lectura

### Tipografía

Se combinan dos familias con personalidad:
- **Space Grotesk** para interfaz y texto
- **Fraunces** para titulares
- Se cargan desde Google Fonts en la UI del editor

### Responsive

El layout usa columnas con bloques que se apilan en pantallas pequeñas, y las posiciones usan porcentajes para mantener consistencia.

---

## ✨ Funcionalidades implementadas

### ✅ Completadas

1. **Editor de Grid 9x9** ⭐
   - Tamaños configurables (3x3, 5x5, 7x7, 9x9)
   - Activación/desactivación con click
   - Selección de celda inicial con click derecho
   - Visualización clara del estado

2. **Navegación automática** ⭐
   - Detección de celdas adyacentes
   - Generación automática de botones
   - Solo muestra direcciones válidas

3. **Editor de texto con posicionamiento libre** ⭐⭐
   - Añadir elementos de texto
   - Drag & drop para mover
   - Posicionamiento con %
   - Selección visual

4. **Propiedades de texto** ⭐
   - Editar contenido
   - Tamaño (12-120px)
   - Color personalizable
   - 5 fuentes disponibles
   - Posición exacta en %

5. **Paleta de colores** ⭐
   - Color de fondo por pantalla
   - Color de texto por elemento
   - Color pickers nativos

6. **Preview dual** ⭐⭐
   - Modo Desktop (1280x832)
   - Modo Móvil (320x580)
   - Actualización en tiempo real
   - Navegación funcional

7. **Exportar HTML standalone** ⭐⭐
   - Sin dependencias
   - Todo embebido
   - Navegación funcional
   - Listo para subir

8. **Guardar/Cargar proyecto** ⭐
   - Formato JSON
   - Preserva todo el estado
   - Fácil de compartir

---

## 🔧 Detalles técnicos

### Uso de porcentajes

Las posiciones se guardan como valores de 0 a 100 (% del ancho/alto de cada pantalla):
- Facilita el ajuste visual en el editor
- Mantiene coherencia entre editor, preview y export
- Evita dependencias con el viewport del navegador

### Generación de HTML standalone

El HTML exportado es completamente autónomo. Se generó un template que:
1. Incluye todos los estilos necesarios inline
2. Embebe los datos de las pantallas como JSON
3. Incluye el script de navegación
4. No requiere archivos externos

### Modularidad del código

El código JavaScript está organizado en secciones claras:
- Estado de la aplicación
- Inicialización
- Grid Editor
- Screen Editor
- Preview
- Event Listeners
- Save/Load/Export

Cada función tiene una responsabilidad única y está bien comentada.

---

## 📊 Métricas del proyecto

- **Líneas de código**: ~650 (JavaScript) + ~350 (CSS) + ~150 (HTML)
- **Archivos**: 3 principales + 2 documentación
- **Tiempo de desarrollo**: ~4 horas
- **Dependencias externas**: Google Fonts (UI del editor)
- **Tamaño total**: ~50KB

---

## 🎯 Objetivos cumplidos

1. ✅ Editor de grid funcional con múltiples tamaños
2. ✅ Sistema de navegación automática
3. ✅ Editor de texto con posicionamiento libre
4. ✅ Preview dual (desktop y móvil)
5. ✅ Exportación HTML standalone
6. ✅ Guardar/cargar proyectos
7. ✅ Interfaz intuitiva y profesional
8. ✅ Código limpio y modular
9. ✅ Documentación completa
10. ✅ Branding meowrhino.studio

---

## 🚀 Posibles mejoras futuras

### Fáciles de implementar
- Deshacer/Rehacer (Ctrl+Z)
- Copiar/Pegar elementos
- Duplicar pantallas
- Atajos de teclado
- Zoom en el canvas

### Medias
- Añadir imágenes
- Estilos de texto (negrita, cursiva)
- Alineación de texto
- Capas (z-index)
- Animaciones simples

### Avanzadas
- Editor de sprites
- Sistema de scripts
- Audio
- Transiciones personalizadas
- Modo colaborativo

---

## 💡 Aprendizajes

### Técnicos
1. El uso de porcentajes mantiene coherencia entre editor, preview y export
2. CSS Grid es perfecto para layouts de herramientas de edición
3. El sistema de drag & drop con cálculos de porcentaje es más robusto que usar píxeles
4. Generar HTML standalone es más simple de lo que parece

### De diseño
1. Una paleta clara con bloques suaves mejora la lectura y la jerarquía
2. El preview en tiempo real mejora mucho la experiencia
3. Los modos Desktop/Móvil son esenciales para contenido responsive
4. Las instrucciones visuales reducen la curva de aprendizaje

### De proceso
1. Empezar con la estructura de datos (estado) facilita el desarrollo
2. Separar claramente las responsabilidades hace el código más mantenible
3. Implementar el preview temprano ayuda a detectar problemas
4. La documentación concurrente ahorra tiempo después

---

## 🎓 Conclusión

El Grid Web Generator cumple todos los objetivos planteados y proporciona una base sólida para crear narrativas web interactivas. El código es limpio, modular y fácil de extender. La herramienta es intuitiva y permite crear experiencias web únicas sin necesidad de programar.

El proyecto demuestra que es posible crear herramientas de autor web potentes usando solo HTML, CSS y JavaScript vanilla, con dependencias mínimas y sin frameworks complejos.

---

**Fin del proceso** - 20 de enero de 2026
