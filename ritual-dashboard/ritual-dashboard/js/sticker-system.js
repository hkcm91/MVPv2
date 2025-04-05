/**
 * Sticker system for Ritual Interactive System
 * Enhanced with widget GUI and transparent stickers
 */
const StickerSystem = (function() {
    // Sticker data - using transparent PNG icons
    const stickerTypes = [
        {
            id: 'analytics',
            name: 'Analytics',
            icon: 'chart-line',
            image: 'https://cdn-icons-png.flaticon.com/512/4478/4478878.png'  // Transparent analytics icon
        },
        {
            id: 'calendar',
            name: 'Calendar',
            icon: 'calendar',
            image: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png'  // Transparent calendar icon
        },
        {
            id: 'weather',
            name: 'Weather',
            icon: 'cloud-sun',
            image: 'https://cdn-icons-png.flaticon.com/512/4052/4052984.png'  // Transparent weather icon
        },
        {
            id: 'notes',
            name: 'Notes',
            icon: 'sticky-note',
            image: 'https://cdn-icons-png.flaticon.com/512/2541/2541988.png'  // Transparent notes icon
        },
        {
            id: 'tasks',
            name: 'Tasks',
            icon: 'tasks',
            image: 'https://cdn-icons-png.flaticon.com/512/4697/4697260.png'  // Transparent tasks icon
        },
        {
            id: 'chart',
            name: 'Chart',
            icon: 'chart-pie',
            image: 'https://cdn-icons-png.flaticon.com/512/1010/1010535.png'  // Transparent chart icon
        }
    ];
    
    // Variables
    let draggedItem = null;
    let isDragging = false;
    let offsetX, offsetY;
    let activeWidget = null;
    
    // Initialize sticker system
    function init() {
        // Load stickers into sidebar
        loadStickers();
        
        // Set up canvas drop area
        setupCanvas();
        
        // Restore saved stickers if available
        if(typeof StateAdapter !== 'undefined') {
            restoreSavedStickers();
        }
        
        // Set up close widget event on canvas click
        document.getElementById('canvas').addEventListener('click', function(e) {
            // Only close if clicking directly on the canvas, not on a sticker
            if (e.target === this) {
                closeWidgetGUI();
            }
        });
        
        // Setup ESC key to close active widget
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && activeWidget) {
                closeWidgetGUI();
            }
        });
    }
    
    // Load stickers into the sidebar
    function loadStickers() {
        const stickerGrid = document.getElementById('sticker-grid');
        stickerGrid.innerHTML = '';
        
        stickerTypes.forEach(sticker => {
            const stickerEl = document.createElement('div');
            stickerEl.className = 'sticker-item';
            stickerEl.setAttribute('draggable', 'true');
            stickerEl.setAttribute('data-type', sticker.id);
            
            stickerEl.innerHTML = `
                <img src="${sticker.image}" alt="${sticker.name}" width="50" height="50">
                <div class="sticker-icon"><i class="fas fa-${sticker.icon}"></i></div>
            `;
            
            // Set up drag events
            stickerEl.addEventListener('dragstart', function(e) {
                draggedItem = this;
                setTimeout(() => this.style.opacity = '0.5', 0);
                
                const type = this.getAttribute('data-type');
                e.dataTransfer.setData('text/plain', type);
            });
            
            stickerEl.addEventListener('dragend', function() {
                this.style.opacity = '1';
            });
            
            stickerGrid.appendChild(stickerEl);
        });
    }
    
    // Set up canvas drop area
    function setupCanvas() {
        const canvas = document.getElementById('canvas');
        
        canvas.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
        
        canvas.addEventListener('drop', function(e) {
            e.preventDefault();
            
            const type = e.dataTransfer.getData('text/plain');
            if (!type) return;
            
            // Calculate position
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - 25; 
            const y = e.clientY - rect.top - 25;
            
            createSticker(type, x, y);
            
            if(typeof UIComponents !== 'undefined') {
                UIComponents.showNotification(formatStickerName(type) + ' sticker added');
            }
        });
    }
    
    // Restore stickers from saved state
    function restoreSavedStickers() {
        const savedStickers = StateAdapter.get('stickerPositions') || [];
        
        savedStickers.forEach(sticker => {
            createSticker(sticker.type, sticker.x, sticker.y);
        });
    }
    
    // Create a sticker on the canvas
    function createSticker(type, x, y) {
        const canvas = document.getElementById('canvas');
        
        // Find sticker data
        const stickerData = stickerTypes.find(s => s.id === type) || stickerTypes[0];
        
        // Create sticker element
        const sticker = document.createElement('div');
        sticker.className = 'sticker-item draggable';
        sticker.dataset.type = type;
        
        // Set sticker content
        sticker.innerHTML = `
            <img src="${stickerData.image}" alt="${stickerData.name}" width="50" height="50">
            <div class="sticker-icon"><i class="fas fa-${stickerData.icon}"></i></div>
        `;
        
        // Position
        sticker.style.left = x + 'px';
        sticker.style.top = y + 'px';
        
        // Add to canvas
        canvas.appendChild(sticker);
        
        // Make draggable
        makeDraggable(sticker);
        
        // Make clickable to open widget GUI
        sticker.addEventListener('click', function() {
            if (!isDragging) {
                openWidgetGUI(type, this);
            }
        });
        
        // Save position to state
        if(typeof StateAdapter !== 'undefined') {
            const newSticker = { type, x, y };
            StateAdapter.addToArray('stickerPositions', newSticker);
        }
        
        return sticker;
    }
    
    // Open widget GUI
    function openWidgetGUI(type, stickerElement) {
        // Close any existing widget
        closeWidgetGUI();
        
        if(typeof UIComponents !== 'undefined') {
            UIComponents.showNotification(formatStickerName(type) + ' widget opened');
        }
        
        // Find sticker data
        const stickerData = stickerTypes.find(s => s.id === type) || stickerTypes[0];
        
        // Create widget container
        const widget = document.createElement('div');
        widget.className = 'widget-container';
        widget.dataset.type = type;
        
        // Set widget content
        widget.innerHTML = `
            <div class="widget-header">
                <h3>${stickerData.name} Widget</h3>
                <button class="widget-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="widget-content">
                <p>This is the ${stickerData.name} widget. Content will be loaded from actual widgets in the future.</p>
                <div class="widget-placeholder">
                    <i class="fas fa-${stickerData.icon} fa-4x"></i>
                    <p>Widget content loading...</p>
                </div>
            </div>
        `;
        
        // Add close functionality
        widget.querySelector('.widget-close').addEventListener('click', closeWidgetGUI);
        
        // Highlight the active sticker
        stickerElement.classList.add('active-sticker');
        
        // Add to canvas
        document.getElementById('canvas').appendChild(widget);
        
        // Store reference to active widget
        activeWidget = {
            element: widget,
            sticker: stickerElement
        };
        
        // Position the widget near the sticker but not covering it
        const stickerRect = stickerElement.getBoundingClientRect();
        const canvasRect = document.getElementById('canvas').getBoundingClientRect();
        
        // Calculate position (to the right of the sticker by default)
        let widgetX = parseInt(stickerElement.style.left) + 60;
        let widgetY = parseInt(stickerElement.style.top);
        
        // Ensure the widget stays within canvas bounds
        const widgetWidth = 300; // Approximate widget width
        const widgetHeight = 200; // Approximate widget height
        
        if (widgetX + widgetWidth > canvasRect.width - 40) {
            // If too far right, position to the left of the sticker
            widgetX = Math.max(10, parseInt(stickerElement.style.left) - widgetWidth - 10);
        }
        
        if (widgetY + widgetHeight > canvasRect.height - 40) {
            // If too far down, adjust upward
            widgetY = Math.max(10, canvasRect.height - widgetHeight - 40);
        }
        
        widget.style.left = widgetX + 'px';
        widget.style.top = widgetY + 'px';
        
        // Add animation
        setTimeout(() => {
            widget.classList.add('widget-visible');
        }, 10);
    }
    
    // Close widget GUI
    function closeWidgetGUI() {
        if (!activeWidget) return;
        
        // Remove active class from sticker
        activeWidget.sticker.classList.remove('active-sticker');
        
        // Remove widget with animation
        activeWidget.element.classList.remove('widget-visible');
        
        // Wait for animation to complete before removing
        setTimeout(() => {
            if (activeWidget && activeWidget.element && activeWidget.element.parentNode) {
                activeWidget.element.parentNode.removeChild(activeWidget.element);
            }
            activeWidget = null;
        }, 300);
    }
    
    // Make an element draggable on the canvas
    function makeDraggable(element) {
        element.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return; // Only left button
            
            isDragging = false;
            
            // Get initial positions
            const rect = this.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            const canvas = document.getElementById('canvas');
            const draggedElement = this;
            const stickerType = this.getAttribute('data-type');
            
            function onMouseMove(e) {
                isDragging = true;
                
                // Calculate new position
                const canvasRect = canvas.getBoundingClientRect();
                let x = e.clientX - canvasRect.left - offsetX;
                let y = e.clientY - canvasRect.top - offsetY;
                
                // Constrain to canvas
                x = Math.max(0, Math.min(x, canvasRect.width - draggedElement.offsetWidth));
                y = Math.max(0, Math.min(y, canvasRect.height - draggedElement.offsetHeight));
                
                // Set position
                draggedElement.style.left = x + 'px';
                draggedElement.style.top = y + 'px';
                
                // Move associated widget if open
                if (activeWidget && activeWidget.sticker === draggedElement) {
                    // Keep the widget positioned relative to sticker as it moves
                    const widgetElement = activeWidget.element;
                    const widgetX = parseInt(widgetElement.style.left);
                    const widgetY = parseInt(widgetElement.style.top);
                    const stickerX = parseInt(draggedElement.style.left);
                    const stickerY = parseInt(draggedElement.style.top);
                    
                    // Calculate and maintain the relative position
                    const deltaX = e.movementX;
                    const deltaY = e.movementY;
                    
                    widgetElement.style.left = (widgetX + deltaX) + 'px';
                    widgetElement.style.top = (widgetY + deltaY) + 'px';
                }
            }
            
            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                
                if (isDragging) {
                    if(typeof UIComponents !== 'undefined') {
                        UIComponents.showNotification('Sticker moved');
                    }
                    
                    // Update position in state
                    if(typeof StateAdapter !== 'undefined') {
                        const x = parseInt(draggedElement.style.left);
                        const y = parseInt(draggedElement.style.top);
                        
                        // Find the sticker in state and update position
                        const positions = StateAdapter.get('stickerPositions') || [];
                        const index = positions.findIndex(s => 
                            s.type === stickerType && 
                            Math.abs(s.x - x) < 50 && 
                            Math.abs(s.y - y) < 50
                        );
                        
                        if (index !== -1) {
                            StateAdapter.updateInArray(
                                'stickerPositions',
                                (item, idx) => idx === index,
                                { x, y }
                            );
                        }
                    }
                }
                
                // Reset after a delay
                setTimeout(function() {
                    isDragging = false;
                }, 100);
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            
            // Prevent defaults
            e.preventDefault();
        });
    }
    
    // Format sticker name for display
    function formatStickerName(type) {
        const sticker = stickerTypes.find(s => s.id === type);
        return sticker ? sticker.name : type.charAt(0).toUpperCase() + type.slice(1);
    }
    
    // Public API
    return {
        init,
        createSticker,
        openWidgetGUI,
        closeWidgetGUI,
        getStickerTypes: () => stickerTypes
    };
})();