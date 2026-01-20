// ============================================
// Grid Web Generator - Main Script
// by meowrhino.studio
// ============================================

// ============================================
// Estado de la aplicación
// ============================================

const state = {
    gridSize: 9,
    grid: [],
    startCell: null,
    currentScreen: null,
    screens: {},
    selectedElement: null,
    previewMode: 'desktop'
};

// ============================================
// Inicialización
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeGrid();
    attachEventListeners();
    console.log('Grid Web Generator iniciado');
});

// ============================================
// Grid Editor
// ============================================

function initializeGrid() {
    const size = state.gridSize;
    state.grid = Array(size).fill(null).map(() => Array(size).fill(false));
    renderGrid();
}

function renderGrid() {
    const gridEditor = document.getElementById('grid-editor');
    const size = state.gridSize;
    
    gridEditor.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gridEditor.innerHTML = '';
    
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.textContent = `${y},${x}`;
            
            if (state.grid[y][x]) {
                cell.classList.add('active');
            }
            
            if (state.startCell && state.startCell.x === x && state.startCell.y === y) {
                cell.classList.add('start');
            }
            
            // Click izquierdo: activar/desactivar
            cell.addEventListener('click', () => toggleCell(x, y));
            
            // Click derecho: marcar como inicio
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                setStartCell(x, y);
            });
            
            gridEditor.appendChild(cell);
        }
    }
    
    updateScreenSelector();
}

function toggleCell(x, y) {
    state.grid[y][x] = !state.grid[y][x];
    
    // Si se desactiva una celda, eliminar su pantalla
    if (!state.grid[y][x]) {
        const screenId = `${y}_${x}`;
        delete state.screens[screenId];
        
        // Si era la celda de inicio, quitarla
        if (state.startCell && state.startCell.x === x && state.startCell.y === y) {
            state.startCell = null;
        }
        
        // Si era la pantalla actual, deseleccionar
        if (state.currentScreen === screenId) {
            state.currentScreen = null;
        }
    } else {
        // Si se activa una celda, crear su pantalla
        const screenId = `${y}_${x}`;
        if (!state.screens[screenId]) {
            state.screens[screenId] = {
                id: screenId,
                x: x,
                y: y,
                bgColor: '#ffffff',
                elements: []
            };
        }
        
        // Si no hay celda de inicio, marcar esta como inicio
        if (!state.startCell) {
            state.startCell = { x, y };
        }
    }
    
    renderGrid();
    renderEditor();
    updatePreview();
}

function setStartCell(x, y) {
    // Solo se puede marcar como inicio si la celda está activa
    if (!state.grid[y][x]) {
        alert('Primero activa la celda con click izquierdo');
        return;
    }
    
    state.startCell = { x, y };
    renderGrid();
    console.log('Celda de inicio:', state.startCell);
}

function updateScreenSelector() {
    const selector = document.getElementById('screen-selector');
    selector.innerHTML = '<option value="">Selecciona una celda activa</option>';
    
    for (let y = 0; y < state.gridSize; y++) {
        for (let x = 0; x < state.gridSize; x++) {
            if (state.grid[y][x]) {
                const screenId = `${y}_${x}`;
                const option = document.createElement('option');
                option.value = screenId;
                option.textContent = `Pantalla ${y},${x}`;
                
                if (state.startCell && state.startCell.x === x && state.startCell.y === y) {
                    option.textContent += ' ⭐ (inicio)';
                }
                
                selector.appendChild(option);
            }
        }
    }
    
    if (state.currentScreen) {
        selector.value = state.currentScreen;
    }
}

// ============================================
// Screen Editor
// ============================================

function renderEditor() {
    const canvas = document.getElementById('editor-canvas');
    const properties = document.getElementById('element-properties');
    
    if (!state.currentScreen) {
        canvas.innerHTML = '<div class="canvas-placeholder">Selecciona una pantalla para empezar a editar</div>';
        properties.style.display = 'none';
        return;
    }
    
    const screen = state.screens[state.currentScreen];
    if (!screen) return;
    
    // Aplicar color de fondo
    canvas.style.backgroundColor = screen.bgColor;
    document.getElementById('screen-bg-color').value = screen.bgColor;
    
    // Limpiar canvas
    canvas.innerHTML = '';
    
    // Renderizar elementos
    screen.elements.forEach((element, index) => {
        const el = createTextElement(element, index);
        canvas.appendChild(el);
    });
}

function createTextElement(data, index) {
    const el = document.createElement('div');
    el.className = 'text-element';
    el.dataset.index = index;
    el.textContent = data.text;
    el.style.fontSize = data.size + 'px';
    el.style.color = data.color;
    el.style.fontFamily = data.font;
    el.style.left = data.x + 'dvw';
    el.style.top = data.y + 'dvh';
    
    if (state.selectedElement === index) {
        el.classList.add('selected');
    }
    
    // Click para seleccionar
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectElement(index);
    });
    
    // Drag para mover
    makeDraggable(el, index);
    
    return el;
}

function makeDraggable(element, index) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    element.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Solo botón izquierdo
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = element.getBoundingClientRect();
        const canvas = document.getElementById('editor-canvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        initialX = ((rect.left - canvasRect.left) / canvasRect.width) * 100;
        initialY = ((rect.top - canvasRect.top) / canvasRect.height) * 100;
        
        element.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const canvas = document.getElementById('editor-canvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        const deltaXPercent = (deltaX / canvasRect.width) * 100;
        const deltaYPercent = (deltaY / canvasRect.height) * 100;
        
        const newX = Math.max(0, Math.min(100, initialX + deltaXPercent));
        const newY = Math.max(0, Math.min(100, initialY + deltaYPercent));
        
        element.style.left = newX + 'dvw';
        element.style.top = newY + 'dvh';
        
        // Actualizar datos
        const screen = state.screens[state.currentScreen];
        screen.elements[index].x = newX;
        screen.elements[index].y = newY;
        
        // Actualizar propiedades si está seleccionado
        if (state.selectedElement === index) {
            document.getElementById('prop-x').value = newX.toFixed(1);
            document.getElementById('prop-y').value = newY.toFixed(1);
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'move';
            updatePreview();
        }
    });
}

function selectElement(index) {
    state.selectedElement = index;
    renderEditor();
    updateElementProperties();
}

function updateElementProperties() {
    const properties = document.getElementById('element-properties');
    
    if (state.selectedElement === null) {
        properties.style.display = 'none';
        return;
    }
    
    properties.style.display = 'block';
    
    const screen = state.screens[state.currentScreen];
    const element = screen.elements[state.selectedElement];
    
    document.getElementById('prop-text').value = element.text;
    document.getElementById('prop-size').value = element.size;
    document.getElementById('prop-size-value').textContent = element.size + 'px';
    document.getElementById('prop-color').value = element.color;
    document.getElementById('prop-font').value = element.font;
    document.getElementById('prop-x').value = element.x.toFixed(1);
    document.getElementById('prop-y').value = element.y.toFixed(1);
}

function addTextElement() {
    if (!state.currentScreen) {
        alert('Selecciona una pantalla primero');
        return;
    }
    
    const screen = state.screens[state.currentScreen];
    const newElement = {
        text: 'Nuevo texto',
        size: 24,
        color: '#000000',
        font: 'Arial, sans-serif',
        x: 10,
        y: 10
    };
    
    screen.elements.push(newElement);
    state.selectedElement = screen.elements.length - 1;
    
    renderEditor();
    updateElementProperties();
    updatePreview();
}

function deleteSelectedElement() {
    if (state.selectedElement === null) {
        alert('Selecciona un elemento primero');
        return;
    }
    
    const screen = state.screens[state.currentScreen];
    screen.elements.splice(state.selectedElement, 1);
    state.selectedElement = null;
    
    renderEditor();
    updateElementProperties();
    updatePreview();
}

// ============================================
// Preview
// ============================================

function updatePreview() {
    const previewContent = document.getElementById('preview-content');
    
    if (!state.currentScreen) {
        previewContent.innerHTML = '<div class="preview-placeholder">El preview se mostrará aquí</div>';
        return;
    }
    
    const screen = state.screens[state.currentScreen];
    if (!screen) return;
    
    // Generar HTML del preview
    previewContent.style.backgroundColor = screen.bgColor;
    previewContent.innerHTML = '';
    
    screen.elements.forEach(element => {
        const el = document.createElement('div');
        el.textContent = element.text;
        el.style.position = 'absolute';
        el.style.fontSize = element.size + 'px';
        el.style.color = element.color;
        el.style.fontFamily = element.font;
        el.style.left = element.x + 'dvw';
        el.style.top = element.y + 'dvh';
        previewContent.appendChild(el);
    });
    
    // Añadir botones de navegación
    addNavigationButtons(previewContent, screen);
}

function addNavigationButtons(container, screen) {
    const directions = [
        { dy: -1, dx: 0, label: '↑', className: 'nav-up' },
        { dy: 1, dx: 0, label: '↓', className: 'nav-down' },
        { dy: 0, dx: -1, label: '←', className: 'nav-left' },
        { dy: 0, dx: 1, label: '→', className: 'nav-right' }
    ];
    
    directions.forEach(dir => {
        const newY = screen.y + dir.dy;
        const newX = screen.x + dir.dx;
        
        if (newY >= 0 && newY < state.gridSize && newX >= 0 && newX < state.gridSize && state.grid[newY][newX]) {
            const btn = document.createElement('button');
            btn.textContent = dir.label;
            btn.className = `nav-button ${dir.className}`;
            btn.style.position = 'absolute';
            btn.style.padding = '0.5rem 1rem';
            btn.style.fontSize = '1.5rem';
            btn.style.background = 'rgba(99, 102, 241, 0.9)';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '0.375rem';
            btn.style.cursor = 'pointer';
            
            // Posicionar botones
            if (dir.className === 'nav-up') {
                btn.style.top = '2dvh';
                btn.style.left = '50%';
                btn.style.transform = 'translateX(-50%)';
            } else if (dir.className === 'nav-down') {
                btn.style.bottom = '2dvh';
                btn.style.left = '50%';
                btn.style.transform = 'translateX(-50%)';
            } else if (dir.className === 'nav-left') {
                btn.style.left = '2dvw';
                btn.style.top = '50%';
                btn.style.transform = 'translateY(-50%)';
            } else if (dir.className === 'nav-right') {
                btn.style.right = '2dvw';
                btn.style.top = '50%';
                btn.style.transform = 'translateY(-50%)';
            }
            
            container.appendChild(btn);
        }
    });
}

// ============================================
// Event Listeners
// ============================================

function attachEventListeners() {
    // Grid size
    document.getElementById('grid-size').addEventListener('change', (e) => {
        state.gridSize = parseInt(e.target.value);
        initializeGrid();
    });
    
    // Screen selector
    document.getElementById('screen-selector').addEventListener('change', (e) => {
        state.currentScreen = e.target.value || null;
        state.selectedElement = null;
        renderEditor();
        updatePreview();
    });
    
    // Toolbar
    document.getElementById('btn-add-text').addEventListener('click', addTextElement);
    document.getElementById('btn-delete-element').addEventListener('click', deleteSelectedElement);
    
    document.getElementById('screen-bg-color').addEventListener('input', (e) => {
        if (state.currentScreen) {
            state.screens[state.currentScreen].bgColor = e.target.value;
            renderEditor();
            updatePreview();
        }
    });
    
    // Properties
    document.getElementById('prop-text').addEventListener('input', updateCurrentElement);
    document.getElementById('prop-size').addEventListener('input', (e) => {
        document.getElementById('prop-size-value').textContent = e.target.value + 'px';
        updateCurrentElement();
    });
    document.getElementById('prop-color').addEventListener('input', updateCurrentElement);
    document.getElementById('prop-font').addEventListener('change', updateCurrentElement);
    document.getElementById('prop-x').addEventListener('input', updateCurrentElement);
    document.getElementById('prop-y').addEventListener('input', updateCurrentElement);
    
    // Preview tabs
    document.querySelectorAll('.preview-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const mode = tab.dataset.mode;
            state.previewMode = mode;
            
            document.querySelectorAll('.preview-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const frame = document.getElementById('preview-frame');
            frame.dataset.mode = mode;
            
            const dimensions = mode === 'desktop' ? '1280 x 832 px' : '320 x 580 px';
            document.getElementById('preview-dimensions').textContent = dimensions;
        });
    });
    
    // Header actions
    document.getElementById('btn-save').addEventListener('click', saveProject);
    document.getElementById('btn-load').addEventListener('click', loadProject);
    document.getElementById('btn-export').addEventListener('click', exportHTML);
    
    // Click en canvas para deseleccionar
    document.getElementById('editor-canvas').addEventListener('click', (e) => {
        if (e.target.id === 'editor-canvas') {
            state.selectedElement = null;
            renderEditor();
            updateElementProperties();
        }
    });
}

function updateCurrentElement() {
    if (state.selectedElement === null || !state.currentScreen) return;
    
    const screen = state.screens[state.currentScreen];
    const element = screen.elements[state.selectedElement];
    
    element.text = document.getElementById('prop-text').value;
    element.size = parseInt(document.getElementById('prop-size').value);
    element.color = document.getElementById('prop-color').value;
    element.font = document.getElementById('prop-font').value;
    element.x = parseFloat(document.getElementById('prop-x').value);
    element.y = parseFloat(document.getElementById('prop-y').value);
    
    renderEditor();
    updatePreview();
}

// ============================================
// Save / Load / Export
// ============================================

function saveProject() {
    const projectData = {
        gridSize: state.gridSize,
        grid: state.grid,
        startCell: state.startCell,
        screens: state.screens
    };
    
    const json = JSON.stringify(projectData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grid-project.json';
    a.click();
    
    URL.revokeObjectURL(url);
    console.log('Proyecto guardado');
}

function loadProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const projectData = JSON.parse(event.target.result);
                
                state.gridSize = projectData.gridSize;
                state.grid = projectData.grid;
                state.startCell = projectData.startCell;
                state.screens = projectData.screens;
                state.currentScreen = null;
                state.selectedElement = null;
                
                document.getElementById('grid-size').value = state.gridSize;
                renderGrid();
                renderEditor();
                updatePreview();
                
                console.log('Proyecto cargado');
            } catch (error) {
                alert('Error al cargar el proyecto: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    });
    
    input.click();
}

function exportHTML() {
    if (!state.startCell) {
        alert('Define una celda de inicio primero (click derecho en una celda activa)');
        return;
    }
    
    const html = generateStandaloneHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grid-narrative.html';
    a.click();
    
    URL.revokeObjectURL(url);
    console.log('HTML exportado');
}

function generateStandaloneHTML() {
    // Generar HTML standalone con todo el contenido
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grid Narrative - meowrhino.studio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow: hidden; font-family: Arial, sans-serif; }
        .screen { width: 100dvw; height: 100dvh; position: absolute; top: 0; left: 0; opacity: 0; pointer-events: none; transition: opacity 0.5s; }
        .screen.active { opacity: 1; pointer-events: auto; }
        .nav-button { position: absolute; padding: 0.5rem 1rem; font-size: 1.5rem; background: rgba(99, 102, 241, 0.9); color: white; border: none; border-radius: 0.375rem; cursor: pointer; transition: background 0.2s; }
        .nav-button:hover { background: rgba(79, 70, 229, 0.9); }
        .nav-up { top: 2dvh; left: 50%; transform: translateX(-50%); }
        .nav-down { bottom: 2dvh; left: 50%; transform: translateX(-50%); }
        .nav-left { left: 2dvw; top: 50%; transform: translateY(-50%); }
        .nav-right { right: 2dvw; top: 50%; transform: translateY(-50%); }
        .text-element { position: absolute; }
        .footer { position: fixed; bottom: 1rem; right: 1rem; font-size: 0.75rem; color: rgba(0,0,0,0.5); }
    </style>
</head>
<body>
    ${generateScreensHTML()}
    <div class="footer">by meowrhino.studio</div>
    <script>
        const screens = ${JSON.stringify(state.screens)};
        const grid = ${JSON.stringify(state.grid)};
        const startCell = ${JSON.stringify(state.startCell)};
        let currentScreen = startCell.y + '_' + startCell.x;
        
        function showScreen(screenId) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            const screen = document.getElementById('screen-' + screenId);
            if (screen) screen.classList.add('active');
            currentScreen = screenId;
        }
        
        function navigate(dy, dx) {
            const [y, x] = currentScreen.split('_').map(Number);
            const newY = y + dy;
            const newX = x + dx;
            const newScreenId = newY + '_' + newX;
            if (screens[newScreenId]) showScreen(newScreenId);
        }
        
        showScreen(currentScreen);
    </script>
</body>
</html>`;
}

function generateScreensHTML() {
    let html = '';
    
    for (const screenId in state.screens) {
        const screen = state.screens[screenId];
        const isStart = state.startCell && state.startCell.y === screen.y && state.startCell.x === screen.x;
        
        html += `<div class="screen${isStart ? ' active' : ''}" id="screen-${screenId}" style="background-color: ${screen.bgColor};">`;
        
        // Elementos de texto
        screen.elements.forEach(el => {
            html += `<div class="text-element" style="font-size: ${el.size}px; color: ${el.color}; font-family: ${el.font}; left: ${el.x}dvw; top: ${el.y}dvh;">${el.text}</div>`;
        });
        
        // Botones de navegación
        const directions = [
            { dy: -1, dx: 0, label: '↑', className: 'nav-up' },
            { dy: 1, dx: 0, label: '↓', className: 'nav-down' },
            { dy: 0, dx: -1, label: '←', className: 'nav-left' },
            { dy: 0, dx: 1, label: '→', className: 'nav-right' }
        ];
        
        directions.forEach(dir => {
            const newY = screen.y + dir.dy;
            const newX = screen.x + dir.dx;
            
            if (newY >= 0 && newY < state.gridSize && newX >= 0 && newX < state.gridSize && state.grid[newY][newX]) {
                html += `<button class="nav-button ${dir.className}" onclick="navigate(${dir.dy}, ${dir.dx})">${dir.label}</button>`;
            }
        });
        
        html += '</div>';
    }
    
    return html;
}
