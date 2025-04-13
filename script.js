document.addEventListener('DOMContentLoaded', function() {
    let currentPattern = [];
    const defaultPattern = [
        [0,0,1,1,1,1,1,1,0,0],
        [0,1,1,0,0,0,0,1,1,0],
        [1,1,0,0,0,0,0,0,1,1],
        [1,0,0,1,1,1,1,0,0,1],
        [1,0,0,1,0,0,1,0,0,1],
        [1,0,0,1,0,0,1,0,0,1],
        [1,0,0,1,1,1,1,0,0,1],
        [1,1,0,0,0,0,0,0,1,1],
        [0,1,1,0,0,0,0,1,1,0],
        [0,0,1,1,1,1,1,1,0,0]
    ];
    
    function showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    function createPattern(width, height, fillValue = 0) {
        return Array(height).fill().map(() => Array(width).fill(fillValue));
    }
    
    function renderGrid() {
        const grid = document.getElementById('patternGrid');
        const cellSize = parseInt(document.getElementById('cellSize').value);
        const onColor = document.getElementById('onColor').value;
        const offColor = document.getElementById('offColor').value;
        const gridColor = document.getElementById('gridColor').value;
        
        grid.innerHTML = '';
        
        grid.style.gridTemplateColumns = `repeat(${currentPattern[0].length}, ${cellSize}px)`;
        grid.style.gridGap = '1px';
        grid.style.backgroundColor = gridColor;
        
        for (let y = 0; y < currentPattern.length; y++) {
            for (let x = 0; x < currentPattern[y].length; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.style.backgroundColor = currentPattern[y][x] ? onColor : offColor;
                
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                cell.addEventListener('click', function() {
                    toggleCell(x, y);
                });
                
                cell.addEventListener('mouseover', function(e) {
                    if (e.buttons === 1) {
                        toggleCell(x, y);
                    }
                });
                
                grid.appendChild(cell);
            }
        }
        
        updateCodeDisplay();
    }
    
    function toggleCell(x, y) {
        currentPattern[y][x] = currentPattern[y][x] ? 0 : 1;
        renderGrid();
    }
    
    function updateCodeDisplay() {
        const patternCode = document.getElementById('patternCode');
        const formattedPattern = currentPattern.map(row => '  [' + row.join(',') + ']').join(',\n');
        patternCode.value = '[\n' + formattedPattern + '\n]';
    }
    
    function parsePatternCode() {
        try {
            const patternCode = document.getElementById('patternCode').value;
            const parsedPattern = JSON.parse(patternCode);
            
            if (!Array.isArray(parsedPattern) || !parsedPattern.length || !Array.isArray(parsedPattern[0])) {
                throw new Error('Invalid pattern format');
            }
            
            const width = parsedPattern[0].length;
            for (const row of parsedPattern) {
                if (row.length !== width) {
                    throw new Error('All rows must have the same length');
                }
                
                for (const cell of row) {
                    if (cell !== 0 && cell !== 1) {
                        throw new Error('Pattern can only contain 0 or 1 values');
                    }
                }
            }
            
            currentPattern = parsedPattern;
            
            document.getElementById('patternWidth').value = parsedPattern[0].length;
            document.getElementById('patternHeight').value = parsedPattern.length;
            
            renderGrid();
            showNotification('Pattern updated');
        } catch (error) {
            showNotification('Error: ' + error.message);
        }
    }
    
    function resizePattern() {
        const newWidth = parseInt(document.getElementById('patternWidth').value);
        const newHeight = parseInt(document.getElementById('patternHeight').value);
        
        if (newWidth < 1 || newHeight < 1 || newWidth > 50 || newHeight > 50) {
            showNotification('Pattern dimensions must be between 1 and 50');
            return;
        }
        
        const newPattern = createPattern(newWidth, newHeight);
        
        for (let y = 0; y < Math.min(currentPattern.length, newHeight); y++) {
            for (let x = 0; x < Math.min(currentPattern[0].length, newWidth); x++) {
                newPattern[y][x] = currentPattern[y][x];
            }
        }
        
        currentPattern = newPattern;
        renderGrid();
        showNotification('Pattern resized');
    }
    
    function clearPattern() {
        const width = currentPattern[0].length;
        const height = currentPattern.length;
        currentPattern = createPattern(width, height);
        renderGrid();
        showNotification('Pattern cleared');
    }
    
    function invertPattern() {
        currentPattern = currentPattern.map(row => row.map(cell => cell ? 0 : 1));
        renderGrid();
        showNotification('Pattern inverted');
    }
    
    function rotatePattern() {
        const height = currentPattern.length;
        const width = currentPattern[0].length;
        const newPattern = createPattern(height, width);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                newPattern[x][height - 1 - y] = currentPattern[y][x];
            }
        }
        
        currentPattern = newPattern;
        
        document.getElementById('patternWidth').value = currentPattern[0].length;
        document.getElementById('patternHeight').value = currentPattern.length;
        
        renderGrid();
        showNotification('Pattern rotated');
    }
    
    function savePattern() {
        const patternJson = JSON.stringify(currentPattern, null, 2);
        const blob = new Blob([patternJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pattern.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Pattern saved');
    }
    
    function loadPatternFromFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const pattern = JSON.parse(e.target.result);
                
                if (!Array.isArray(pattern) || !pattern.length || !Array.isArray(pattern[0])) {
                    throw new Error('Invalid pattern format');
                }
                
                currentPattern = pattern;
                
                document.getElementById('patternWidth').value = pattern[0].length;
                document.getElementById('patternHeight').value = pattern.length;
                
                renderGrid();
                showNotification('Pattern loaded');
            } catch (error) {
                showNotification('Error loading pattern: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
    
    function exportAsPNG() {
        const cellSize = parseInt(document.getElementById('cellSize').value);
        const onColor = document.getElementById('onColor').value;
        const offColor = document.getElementById('offColor').value;
        
        const width = currentPattern[0].length;
        const height = currentPattern.length;
        
        const canvas = document.createElement('canvas');
        canvas.width = width * cellSize;
        canvas.height = height * cellSize;
        
        const ctx = canvas.getContext('2d');
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                ctx.fillStyle = currentPattern[y][x] ? onColor : offColor;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
        
        const link = document.createElement('a');
        link.download = 'pattern.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        showNotification('PNG exported');
    }
    
    function exportAsSVG() {
        const cellSize = parseInt(document.getElementById('cellSize').value);
        const onColor = document.getElementById('onColor').value;
        const offColor = document.getElementById('offColor').value;
        
        const width = currentPattern[0].length;
        const height = currentPattern.length;
        
        let svgContent = `<svg width="${width * cellSize}" height="${height * cellSize}" xmlns="http://www.w3.org/2000/svg">`;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const color = currentPattern[y][x] ? onColor : offColor;
                svgContent += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${color}" />`;
            }
        }
        
        svgContent += '</svg>';
        
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = 'pattern.svg';
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
        showNotification('SVG exported');
    }
    
    function copyPatternAsJSON() {
        const patternJson = JSON.stringify(currentPattern);
        navigator.clipboard.writeText(patternJson)
            .then(() => showNotification('Pattern copied to clipboard'))
            .catch(err => showNotification('Failed to copy: ' + err));
    }
    
    const presets = {
        smiley: [
            [0,0,1,1,1,1,0,0],
            [0,1,0,0,0,0,1,0],
            [1,0,1,0,0,1,0,1],
            [1,0,0,0,0,0,0,1],
            [1,0,1,0,0,1,0,1],
            [1,0,0,1,1,0,0,1],
            [0,1,0,0,0,0,1,0],
            [0,0,1,1,1,1,0,0]
        ],
        heart: [
            [0,1,1,0,0,1,1,0],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,0,0],
            [0,0,0,1,1,0,0,0],
            [0,0,0,0,0,0,0,0]
        ],
        checkerboard: [
            [1,0,1,0,1,0,1,0],
            [0,1,0,1,0,1,0,1],
            [1,0,1,0,1,0,1,0],
            [0,1,0,1,0,1,0,1],
            [1,0,1,0,1,0,1,0],
            [0,1,0,1,0,1,0,1],
            [1,0,1,0,1,0,1,0],
            [0,1,0,1,0,1,0,1]
        ],
        random: function(width, height) {
            return Array(height).fill().map(() => 
                Array(width).fill().map(() => Math.random() > 0.5 ? 1 : 0)
            );
        }
    };
    
    function loadPreset(presetName) {
        if (presetName === 'random') {
            const width = parseInt(document.getElementById('patternWidth').value);
            const height = parseInt(document.getElementById('patternHeight').value);
            currentPattern = presets.random(width, height);
        } else if (presets[presetName]) {
            currentPattern = JSON.parse(JSON.stringify(presets[presetName]));
            
            document.getElementById('patternWidth').value = currentPattern[0].length;
            document.getElementById('patternHeight').value = currentPattern.length;
        }
        
        renderGrid();
        showNotification(`Loaded ${presetName} pattern`);
    }
    
    function newPattern() {
        const width = parseInt(document.getElementById('patternWidth').value);
        const height = parseInt(document.getElementById('patternHeight').value);
        
        if (width < 1 || height < 1 || width > 50 || height > 50) {
            showNotification('Pattern dimensions must be between 1 and 50');
            return;
        }
        
        currentPattern = createPattern(width, height);
        renderGrid();
        showNotification('New pattern created');
    }
    
    document.getElementById('cellSize').addEventListener('input', function() {
        document.getElementById('cellSizeValue').textContent = this.value + 'px';
        renderGrid();
    });
    
    document.getElementById('onColor').addEventListener('input', renderGrid);
    document.getElementById('offColor').addEventListener('input', renderGrid);
    document.getElementById('gridColor').addEventListener('input', renderGrid);
    
    document.getElementById('updateFromCode').addEventListener('click', parsePatternCode);
    document.getElementById('resizePattern').addEventListener('click', resizePattern);
    document.getElementById('clearPattern').addEventListener('click', clearPattern);
    document.getElementById('invertPattern').addEventListener('click', invertPattern);
    document.getElementById('rotatePattern').addEventListener('click', rotatePattern);
    document.getElementById('newPattern').addEventListener('click', newPattern);
    document.getElementById('savePattern').addEventListener('click', savePattern);
    
    document.getElementById('loadPattern').addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });
    
    document.getElementById('fileInput').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            loadPatternFromFile(e.target.files[0]);
        }
    });
    
    document.getElementById('exportPNG').addEventListener('click', exportAsPNG);
    document.getElementById('exportSVG').addEventListener('click', exportAsSVG);
    document.getElementById('copyPattern').addEventListener('click', copyPatternAsJSON);
    
    const presetButtons = document.querySelectorAll('.preset-buttons button');
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            loadPreset(this.dataset.preset);
        });
    });
    
    currentPattern = JSON.parse(JSON.stringify(defaultPattern));
    document.getElementById('patternWidth').value = defaultPattern[0].length;
    document.getElementById('patternHeight').value = defaultPattern.length;
    renderGrid();
});