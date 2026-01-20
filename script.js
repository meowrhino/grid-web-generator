// ============================================
// Grid Web Generator - Main Script
// by meowrhino.studio
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

const dom = {};

const dragState = {
    active: false,
    index: null,
    offsetX: 0,
    offsetY: 0,
    element: null
};

const NAV_DIRECTIONS = [
    { dy: -1, dx: 0, label: 'arriba', className: 'nav-up' },
    { dy: 1, dx: 0, label: 'abajo', className: 'nav-down' },
    { dy: 0, dx: -1, label: 'izquierda', className: 'nav-left' },
    { dy: 0, dx: 1, label: 'derecha', className: 'nav-right' }
];

// ============================================
// Inicializacion
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    initializeGrid();
    attachEventListeners();
    setPreviewMode(state.previewMode);
    updateStatus();
    console.log('Grid Web Generator iniciado');
});

function cacheDom() {
    dom.gridEditor = document.getElementById('grid-editor');
    dom.gridSize = document.getElementById('grid-size');
    dom.screenSelector = document.getElementById('screen-selector');
    dom.editorCanvas = document.getElementById('editor-canvas');
    dom.elementProperties = document.getElementById('element-properties');
    dom.screenBgColor = document.getElementById('screen-bg-color');

    dom.btnAddText = document.getElementById('btn-add-text');
    dom.btnDeleteElement = document.getElementById('btn-delete-element');
    dom.btnSave = document.getElementById('btn-save');
    dom.btnLoad = document.getElementById('btn-load');
    dom.btnExport = document.getElementById('btn-export');

    dom.propText = document.getElementById('prop-text');
    dom.propSize = document.getElementById('prop-size');
    dom.propSizeValue = document.getElementById('prop-size-value');
    dom.propColor = document.getElementById('prop-color');
    dom.propFont = document.getElementById('prop-font');
    dom.propX = document.getElementById('prop-x');
    dom.propY = document.getElementById('prop-y');

    dom.previewContent = document.getElementById('preview-content');
    dom.previewFrame = document.getElementById('preview-frame');
    dom.previewDimensions = document.getElementById('preview-dimensions');
    dom.previewScreenLabel = document.getElementById('preview-screen-label');

    dom.startCellStatus = document.getElementById('start-cell-status');
    dom.currentScreenStatus = document.getElementById('current-screen-status');
    dom.activeCount = document.getElementById('active-count');
}

// ============================================
// Utilidades
// ============================================

function createGrid(size) {
    return Array.from({ length: size }, () => Array(size).fill(false));
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function getScreenId(x, y) {
    return `${y}_${x}`;
}

function formatScreenId(screenId) {
    if (!screenId) return '-';
    return screenId.replace('_', ',');
}

function getPreferredScreenId() {
    if (state.startCell && state.grid[state.startCell.y]?.[state.startCell.x]) {
        return getScreenId(state.startCell.x, state.startCell.y);
    }

    for (let y = 0; y < state.gridSize; y++) {
        for (let x = 0; x < state.gridSize; x++) {
            if (state.grid[y][x]) {
                return getScreenId(x, y);
            }
        }
    }

    return null;
}

function normalizeScreens() {
    Object.entries(state.screens).forEach(([screenId, screen]) => {
        const id = screen.id || screenId;
        const [y, x] = id.split('_').map(Number);
        screen.id = id;
        screen.x = Number.isFinite(screen.x) ? screen.x : x;
        screen.y = Number.isFinite(screen.y) ? screen.y : y;
        screen.bgColor = screen.bgColor || '#ffffff';
        screen.elements = Array.isArray(screen.elements) ? screen.elements : [];

        screen.elements.forEach((element) => {
            element.text = element.text ?? 'Texto';
            element.size = clamp(Number(element.size) || 24, 12, 120);
            element.color = element.color || '#000000';
            element.font = element.font || "'Space Grotesk', sans-serif";
            element.x = clamp(Number(element.x) || 0, 0, 100);
            element.y = clamp(Number(element.y) || 0, 0, 100);
        });
    });
}

function rebuildGridFromScreens(size) {
    const grid = createGrid(size);

    Object.values(state.screens).forEach((screen) => {
        if (
            Number.isFinite(screen.x) &&
            Number.isFinite(screen.y) &&
            screen.y >= 0 &&
            screen.y < size &&
            screen.x >= 0 &&
            screen.x < size
        ) {
            grid[screen.y][screen.x] = true;
        }
    });

    return grid;
}

function getNavigationTargets(screen) {
    return NAV_DIRECTIONS.map((direction) => {
        const newY = screen.y + direction.dy;
        const newX = screen.x + direction.dx;
        const isValid =
            newY >= 0 &&
            newY < state.gridSize &&
            newX >= 0 &&
            newX < state.gridSize &&
            state.grid[newY][newX];

        if (!isValid) return null;

        return {
            ...direction,
            screenId: getScreenId(newX, newY)
        };
    }).filter(Boolean);
}

function updateStatus() {
    if (!dom.activeCount) return;

    const activeCount = state.grid.flat().filter(Boolean).length;
    dom.activeCount.textContent = activeCount;
    dom.startCellStatus.textContent = state.startCell ? `${state.startCell.y},${state.startCell.x}` : '-';
    dom.currentScreenStatus.textContent = formatScreenId(state.currentScreen);
    updatePreviewInfo();
}

// ============================================
// Grid Editor
// ============================================

function initializeGrid() {
    state.grid = createGrid(state.gridSize);
    state.screens = {};
    state.startCell = null;
    state.currentScreen = null;
    state.selectedElement = null;
    renderGrid();
    renderEditor();
    updatePreview();
}

function resizeGrid(newSize) {
    const oldSize = state.gridSize;
    const newGrid = createGrid(newSize);
    const newScreens = {};
    const max = Math.min(oldSize, newSize);

    for (let y = 0; y < max; y++) {
        for (let x = 0; x < max; x++) {
            if (state.grid[y]?.[x]) {
                newGrid[y][x] = true;
                const screenId = getScreenId(x, y);
                newScreens[screenId] = state.screens[screenId] || {
                    id: screenId,
                    x,
                    y,
                    bgColor: '#ffffff',
                    elements: []
                };
            }
        }
    }

    state.gridSize = newSize;
    state.grid = newGrid;
    state.screens = newScreens;

    if (!state.startCell || !newGrid[state.startCell.y]?.[state.startCell.x]) {
        state.startCell = null;
    }

    if (!state.currentScreen || !newScreens[state.currentScreen]) {
        state.currentScreen = getPreferredScreenId();
    }

    state.selectedElement = null;
    renderGrid();
    renderEditor();
    updatePreview();
}

function renderGrid() {
    const size = state.gridSize;

    dom.gridEditor.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    dom.gridEditor.innerHTML = '';

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'grid-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.dataset.label = `${y},${x}`;
            cell.setAttribute('aria-label', `Celda ${y},${x}`);

            if (state.grid[y][x]) {
                cell.classList.add('active');
            }

            if (state.startCell && state.startCell.x === x && state.startCell.y === y) {
                cell.classList.add('start');
            }

            cell.addEventListener('click', () => toggleCell(x, y));
            cell.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                setStartCell(x, y);
            });

            dom.gridEditor.appendChild(cell);
        }
    }

    updateScreenSelector();
    updateStatus();
}

function toggleCell(x, y) {
    state.grid[y][x] = !state.grid[y][x];
    const screenId = getScreenId(x, y);

    if (!state.grid[y][x]) {
        delete state.screens[screenId];

        if (state.startCell && state.startCell.x === x && state.startCell.y === y) {
            state.startCell = null;
        }

        if (state.currentScreen === screenId) {
            state.currentScreen = getPreferredScreenId();
        }
    } else {
        if (!state.screens[screenId]) {
            state.screens[screenId] = {
                id: screenId,
                x,
                y,
                bgColor: '#ffffff',
                elements: []
            };
        }

        if (!state.startCell) {
            state.startCell = { x, y };
        }

        if (!state.currentScreen) {
            state.currentScreen = screenId;
        }
    }

    renderGrid();
    renderEditor();
    updatePreview();
}

function setStartCell(x, y) {
    if (!state.grid[y][x]) {
        alert('Primero activa la celda con click izquierdo');
        return;
    }

    state.startCell = { x, y };
    renderGrid();
}

function updateScreenSelector() {
    dom.screenSelector.innerHTML = '<option value="">Selecciona una celda activa</option>';

    for (let y = 0; y < state.gridSize; y++) {
        for (let x = 0; x < state.gridSize; x++) {
            if (state.grid[y][x]) {
                const screenId = getScreenId(x, y);
                const option = document.createElement('option');
                option.value = screenId;
                option.textContent = `Pantalla ${y},${x}`;

                if (state.startCell && state.startCell.x === x && state.startCell.y === y) {
                    option.textContent += ' (inicio)';
                }

                dom.screenSelector.appendChild(option);
            }
        }
    }

    if (state.currentScreen && dom.screenSelector.querySelector(`option[value="${state.currentScreen}"]`)) {
        dom.screenSelector.value = state.currentScreen;
    } else {
        dom.screenSelector.value = '';
    }
}

function setCurrentScreen(screenId) {
    if (!screenId || !state.screens[screenId]) {
        state.currentScreen = null;
    } else {
        state.currentScreen = screenId;
    }

    state.selectedElement = null;
    if (dom.screenSelector) {
        dom.screenSelector.value = state.currentScreen || '';
    }

    renderEditor();
    updatePreview();
    updateStatus();
}

// ============================================
// Screen Editor
// ============================================

function renderEditor() {
    const canvas = dom.editorCanvas;

    if (!state.currentScreen) {
        canvas.innerHTML = '<div class="canvas-placeholder">Selecciona una pantalla para empezar.</div>';
        canvas.style.background = '';
        dom.elementProperties.hidden = true;
        dom.btnAddText.disabled = true;
        dom.btnDeleteElement.disabled = true;
        dom.screenBgColor.disabled = true;
        return;
    }

    const screen = state.screens[state.currentScreen];
    if (!screen) return;

    canvas.style.background = screen.bgColor;
    dom.screenBgColor.value = screen.bgColor;
    dom.screenBgColor.disabled = false;
    dom.btnAddText.disabled = false;
    canvas.innerHTML = '';

    screen.elements.forEach((element, index) => {
        const el = createTextElement(element, index);
        canvas.appendChild(el);
    });

    addNavigationButtons(canvas, screen, { interactive: true });
    updateElementProperties();
}

function createTextElement(data, index) {
    const el = document.createElement('div');
    el.className = 'text-element';
    el.dataset.index = index;
    el.textContent = data.text;
    el.style.fontSize = `${data.size}px`;
    el.style.color = data.color;
    el.style.fontFamily = data.font;
    el.style.left = `${data.x}%`;
    el.style.top = `${data.y}%`;

    if (state.selectedElement === index) {
        el.classList.add('selected');
    }

    el.addEventListener('mousedown', (event) => {
        event.stopPropagation();
        selectElement(index, { render: false });
        startDrag(event, index, el);
    });

    return el;
}

function startDrag(event, index, element) {
    if (event.button !== 0) return;

    event.preventDefault();
    dragState.active = true;
    dragState.index = index;
    dragState.element = element;

    const rect = element.getBoundingClientRect();
    const canvasRect = dom.editorCanvas.getBoundingClientRect();
    dragState.offsetX = event.clientX - rect.left;
    dragState.offsetY = event.clientY - rect.top;

    dom.editorCanvas.classList.add('is-dragging');
}

function handleDragMove(event) {
    if (!dragState.active || !state.currentScreen) return;

    const canvasRect = dom.editorCanvas.getBoundingClientRect();
    if (!canvasRect.width || !canvasRect.height) return;

    const newX = ((event.clientX - canvasRect.left - dragState.offsetX) / canvasRect.width) * 100;
    const newY = ((event.clientY - canvasRect.top - dragState.offsetY) / canvasRect.height) * 100;
    const clampedX = clamp(newX, 0, 100);
    const clampedY = clamp(newY, 0, 100);

    const screen = state.screens[state.currentScreen];
    if (!screen || !screen.elements[dragState.index]) return;

    const element = screen.elements[dragState.index];
    element.x = clampedX;
    element.y = clampedY;

    if (dragState.element) {
        dragState.element.style.left = `${clampedX}%`;
        dragState.element.style.top = `${clampedY}%`;
    }

    if (state.selectedElement === dragState.index) {
        dom.propX.value = clampedX.toFixed(1);
        dom.propY.value = clampedY.toFixed(1);
    }
}

function handleDragEnd() {
    if (!dragState.active) return;

    dragState.active = false;
    dragState.index = null;
    dragState.element = null;
    dragState.offsetX = 0;
    dragState.offsetY = 0;
    dom.editorCanvas.classList.remove('is-dragging');
    updatePreview();
}

function updateSelectedElementClass() {
    dom.editorCanvas.querySelectorAll('.text-element').forEach((element) => {
        const elementIndex = Number(element.dataset.index);
        element.classList.toggle('selected', elementIndex === state.selectedElement);
    });
}

function selectElement(index, options = {}) {
    state.selectedElement = index;

    if (options.render === false) {
        updateSelectedElementClass();
        updateElementProperties();
        return;
    }

    renderEditor();
}

function updateElementProperties() {
    if (state.selectedElement === null || !state.currentScreen) {
        dom.elementProperties.hidden = true;
        dom.btnDeleteElement.disabled = true;
        return;
    }

    const screen = state.screens[state.currentScreen];
    const element = screen?.elements[state.selectedElement];
    if (!element) {
        dom.elementProperties.hidden = true;
        dom.btnDeleteElement.disabled = true;
        return;
    }

    dom.elementProperties.hidden = false;
    dom.propText.value = element.text;
    dom.propSize.value = element.size;
    dom.propSizeValue.textContent = `${element.size}px`;
    dom.propColor.value = element.color;
    dom.propFont.value = element.font;
    dom.propX.value = element.x.toFixed(1);
    dom.propY.value = element.y.toFixed(1);
    dom.btnDeleteElement.disabled = false;
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
        font: "'Space Grotesk', sans-serif",
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
    if (!screen) return;

    screen.elements.splice(state.selectedElement, 1);
    state.selectedElement = null;
    dom.btnDeleteElement.disabled = true;

    renderEditor();
    updateElementProperties();
    updatePreview();
}

// ============================================
// Preview
// ============================================

function updatePreview() {
    if (!state.currentScreen) {
        dom.previewContent.innerHTML = '<div class="preview-placeholder">El preview se mostrará aquí.</div>';
        dom.previewContent.style.backgroundColor = '';
        updatePreviewInfo();
        return;
    }

    const screen = state.screens[state.currentScreen];
    if (!screen) return;

    dom.previewContent.style.backgroundColor = screen.bgColor;
    dom.previewContent.innerHTML = '';

    screen.elements.forEach((element) => {
        const el = document.createElement('div');
        el.textContent = element.text;
        el.style.position = 'absolute';
        el.style.fontSize = `${element.size}px`;
        el.style.color = element.color;
        el.style.fontFamily = element.font;
        el.style.left = `${element.x}%`;
        el.style.top = `${element.y}%`;
        dom.previewContent.appendChild(el);
    });

    addNavigationButtons(dom.previewContent, screen);
    updatePreviewInfo();
}

function updatePreviewInfo() {
    if (!dom.previewScreenLabel) return;
    dom.previewScreenLabel.textContent = state.currentScreen
        ? `Pantalla ${formatScreenId(state.currentScreen)}`
        : 'Pantalla -';
}

function addNavigationButtons(container, screen, options = {}) {
    const { interactive = false } = options;
    const targets = getNavigationTargets(screen);

    targets.forEach((target) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = target.label;
        button.className = `nav-button ${target.className}`;
        button.setAttribute('aria-label', `Mover ${target.label}`);

        if (interactive) {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                setCurrentScreen(target.screenId);
            });
        }

        container.appendChild(button);
    });
}

// ============================================
// Event Listeners
// ============================================

function attachEventListeners() {
    dom.gridSize.addEventListener('change', (event) => {
        const newSize = parseInt(event.target.value, 10);
        if (!Number.isNaN(newSize)) {
            resizeGrid(newSize);
        }
    });

    dom.screenSelector.addEventListener('change', (event) => {
        setCurrentScreen(event.target.value || null);
    });

    dom.btnAddText.addEventListener('click', addTextElement);
    dom.btnDeleteElement.addEventListener('click', deleteSelectedElement);

    dom.screenBgColor.addEventListener('input', (event) => {
        if (state.currentScreen) {
            state.screens[state.currentScreen].bgColor = event.target.value;
            renderEditor();
            updatePreview();
        }
    });

    dom.propText.addEventListener('input', updateCurrentElement);
    dom.propSize.addEventListener('input', () => {
        dom.propSizeValue.textContent = `${dom.propSize.value}px`;
        updateCurrentElement();
    });
    dom.propColor.addEventListener('input', updateCurrentElement);
    dom.propFont.addEventListener('change', updateCurrentElement);
    dom.propX.addEventListener('input', updateCurrentElement);
    dom.propY.addEventListener('input', updateCurrentElement);

    document.querySelectorAll('.preview-tab').forEach((tab) => {
        tab.addEventListener('click', () => setPreviewMode(tab.dataset.mode));
    });

    dom.btnSave.addEventListener('click', saveProject);
    dom.btnLoad.addEventListener('click', loadProject);
    dom.btnExport.addEventListener('click', exportHTML);

    dom.editorCanvas.addEventListener('click', (event) => {
        if (event.target.id === 'editor-canvas') {
            state.selectedElement = null;
            renderEditor();
            updateElementProperties();
        }
    });

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
}

function updateCurrentElement() {
    if (state.selectedElement === null || !state.currentScreen) return;

    const screen = state.screens[state.currentScreen];
    const element = screen?.elements[state.selectedElement];
    if (!element) return;

    element.text = dom.propText.value;

    const size = parseInt(dom.propSize.value, 10);
    element.size = Number.isFinite(size) ? clamp(size, 12, 120) : element.size;

    element.color = dom.propColor.value;
    element.font = dom.propFont.value;

    const posX = parseFloat(dom.propX.value);
    const posY = parseFloat(dom.propY.value);
    element.x = Number.isFinite(posX) ? clamp(posX, 0, 100) : element.x;
    element.y = Number.isFinite(posY) ? clamp(posY, 0, 100) : element.y;

    dom.propX.value = element.x.toFixed(1);
    dom.propY.value = element.y.toFixed(1);
    dom.propSizeValue.textContent = `${element.size}px`;

    renderEditor();
    updatePreview();
}

function setPreviewMode(mode) {
    state.previewMode = mode;

    document.querySelectorAll('.preview-tab').forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    dom.previewFrame.dataset.mode = mode;
    dom.previewDimensions.textContent = mode === 'desktop' ? '1280 x 832 px' : '320 x 580 px';
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

    const link = document.createElement('a');
    link.href = url;
    link.download = 'grid-project.json';
    link.click();

    URL.revokeObjectURL(url);
    console.log('Proyecto guardado');
}

function loadProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            try {
                const projectData = JSON.parse(loadEvent.target.result);

                const sizeFromFile = Number(projectData.gridSize);
                const sizeFromGrid = Array.isArray(projectData.grid) ? projectData.grid.length : 0;
                const resolvedSize = sizeFromFile || sizeFromGrid || state.gridSize;

                state.gridSize = resolvedSize;
                state.screens = projectData.screens || {};
                normalizeScreens();
                state.grid = rebuildGridFromScreens(state.gridSize);

                if (projectData.startCell &&
                    Number.isFinite(projectData.startCell.x) &&
                    Number.isFinite(projectData.startCell.y) &&
                    projectData.startCell.x >= 0 &&
                    projectData.startCell.x < state.gridSize &&
                    projectData.startCell.y >= 0 &&
                    projectData.startCell.y < state.gridSize
                ) {
                    state.startCell = projectData.startCell;
                } else {
                    state.startCell = null;
                }

                state.currentScreen = getPreferredScreenId();
                state.selectedElement = null;

                dom.gridSize.value = state.gridSize;
                renderGrid();
                renderEditor();
                updatePreview();

                console.log('Proyecto cargado');
            } catch (error) {
                alert(`Error al cargar el proyecto: ${error.message}`);
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

    const link = document.createElement('a');
    link.href = url;
    link.download = 'grid-narrative.html';
    link.click();

    URL.revokeObjectURL(url);
    console.log('HTML exportado');
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function generateStandaloneHTML() {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grid Narrative - meowrhino.studio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow: hidden; font-family: 'Space Grotesk', sans-serif; background: #ffffff; }
        .screen { width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; opacity: 0; pointer-events: none; transition: opacity 0.4s ease; }
        .screen.active { opacity: 1; pointer-events: auto; }
        .text-element { position: absolute; }
        .nav-button { position: absolute; border: 0; background: rgba(20, 24, 26, 0.62); color: #ffffff; border-radius: 999px; padding: 0.3rem 0.7rem; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.02em; cursor: pointer; transition: background 0.2s, transform 0.2s; }
        .nav-button:hover { background: rgba(20, 24, 26, 0.78); box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18); }
        .nav-up { top: 2%; left: 50%; transform: translateX(-50%); }
        .nav-down { bottom: 2%; left: 50%; transform: translateX(-50%); }
        .nav-left { left: 2%; top: 50%; transform: translateY(-50%); }
        .nav-right { right: 2%; top: 50%; transform: translateY(-50%); }
        .footer { position: fixed; bottom: 1rem; right: 1rem; font-size: 0.75rem; color: rgba(0, 0, 0, 0.45); }
    </style>
</head>
<body>
    ${generateScreensHTML()}
    <div class="footer">by meowrhino.studio</div>
    <script>
        const screens = ${JSON.stringify(state.screens)};
        const startCell = ${JSON.stringify(state.startCell)};
        let currentScreen = startCell.y + '_' + startCell.x;

        function showScreen(screenId) {
            document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
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

        screen.elements.forEach((element) => {
            html += `<div class="text-element" style="font-size: ${element.size}px; color: ${element.color}; font-family: ${element.font}; left: ${element.x}%; top: ${element.y}%;">${escapeHtml(element.text)}</div>`;
        });

        NAV_DIRECTIONS.forEach((direction) => {
            const newY = screen.y + direction.dy;
            const newX = screen.x + direction.dx;

            if (
                newY >= 0 &&
                newY < state.gridSize &&
                newX >= 0 &&
                newX < state.gridSize &&
                state.grid[newY][newX]
            ) {
                html += `<button class="nav-button ${direction.className}" onclick="navigate(${direction.dy}, ${direction.dx})">${direction.label}</button>`;
            }
        });

        html += '</div>';
    }

    return html;
}
