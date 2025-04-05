/**
 * Background management for Ritual Interactive System
 * Handles background image uploads and selection
 */
const BackgroundManager = (function() {
    // Default background
    const defaultBackground = 'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
    
    // Preset backgrounds
    const presetBackgrounds = [
        {
            name: 'Blue Mountains',
            url: 'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
        },
        {
            name: 'Sunset',
            url: 'https://images.unsplash.com/photo-1502790671504-542ad42d5189?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
        },
        {
            name: 'Night Sky',
            url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
        },
        {
            name: 'Forest',
            url: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
        }
    ];
    
    // Initialize background manager
    function init() {
        // Create background control elements
        createBackgroundControls();
        
        // Restore saved background if available
        restoreBackground();
        
        // Setup event listeners for background menu
        setupEventListeners();
    }
    
    // Create background control elements
    function createBackgroundControls() {
        // Create background button
        const backgroundButton = document.createElement('div');
        backgroundButton.id = 'background-button';
        backgroundButton.innerHTML = '<i class="fas fa-image"></i>';
        document.body.appendChild(backgroundButton);
        
        // Create background menu
        const backgroundMenu = document.createElement('div');
        backgroundMenu.id = 'background-menu';
        backgroundMenu.className = 'background-menu';
        backgroundMenu.innerHTML = `
            <div class="background-menu-header">
                <h3>Background Settings</h3>
                <button class="background-menu-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="background-menu-content">
                <div class="background-section">
                    <h4>Upload Background</h4>
                    <div class="background-upload-container">
                        <label for="background-upload" class="background-upload-label">
                            <i class="fas fa-upload"></i>
                            <span>Choose Image</span>
                        </label>
                        <input type="file" id="background-upload" accept="image/*" class="background-upload-input">
                    </div>
                </div>
                <div class="background-section">
                    <h4>Preset Backgrounds</h4>
                    <div class="background-presets">
                        ${presetBackgrounds.map((bg, index) => `
                            <div class="background-preset" data-url="${bg.url}">
                                <div class="background-preset-image" style="background-image: url(${bg.url})"></div>
                                <span>${bg.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="background-section">
                    <h4>Background Opacity</h4>
                    <input type="range" id="background-opacity" min="0" max="100" value="80" class="background-opacity-slider">
                    <div class="background-opacity-value">80%</div>
                </div>
            </div>
        `;
        document.body.appendChild(backgroundMenu);
    }
    
    // Setup event listeners for background menu
    function setupEventListeners() {
        // Background button click
        document.getElementById('background-button').addEventListener('click', toggleBackgroundMenu);
        
        // Background menu close
        document.querySelector('.background-menu-close').addEventListener('click', toggleBackgroundMenu);
        
        // Background upload
        document.getElementById('background-upload').addEventListener('change', handleBackgroundUpload);
        
        // Background preset selection
        document.querySelectorAll('.background-preset').forEach(preset => {
            preset.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                setBackground(url);
                highlightSelectedPreset(url);
                UIComponents.showNotification('Background updated');
            });
        });
        
        // Background opacity
        const opacitySlider = document.getElementById('background-opacity');
        const opacityValue = document.querySelector('.background-opacity-value');
        
        opacitySlider.addEventListener('input', function() {
            const opacity = this.value;
            opacityValue.textContent = opacity + '%';
            document.querySelector('.canvas-container').style.backgroundColor = `rgba(255, 255, 255, ${opacity / 100 * 0.8})`;
            
            // Save opacity setting
            const settings = StateAdapter.get('settings') || {};
            settings.canvasOpacity = opacity;
            StateAdapter.set('settings', settings);
        });
        
        // ESC key to close menu
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.getElementById('background-menu').classList.contains('menu-visible')) {
                toggleBackgroundMenu();
            }
        });
    }
    
    // Toggle background menu visibility
    function toggleBackgroundMenu() {
        const menu = document.getElementById('background-menu');
        menu.classList.toggle('menu-visible');
    }
    
    // Handle background image upload
    function handleBackgroundUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file is an image
        if (!file.type.match('image.*')) {
            UIComponents.showNotification('Please select an image file');
            return;
        }
        
        // Read the file and set as background
        const reader = new FileReader();
        reader.onload = function(event) {
            const url = event.target.result;
            setBackground(url);
            UIComponents.showNotification('Background uploaded');
            
            // Clear selected preset highlight
            highlightSelectedPreset(null);
        };
        reader.readAsDataURL(file);
    }
    
    // Set background image
    function setBackground(url) {
        document.body.style.backgroundImage = `url(${url})`;
        
        // Save background to state
        const settings = StateAdapter.get('settings') || {};
        settings.backgroundUrl = url;
        StateAdapter.set('settings', settings);
    }
    
    // Highlight selected preset
    function highlightSelectedPreset(url) {
        document.querySelectorAll('.background-preset').forEach(preset => {
            if (preset.getAttribute('data-url') === url) {
                preset.classList.add('selected-preset');
            } else {
                preset.classList.remove('selected-preset');
            }
        });
    }
    
    // Restore background from saved state
    function restoreBackground() {
        const settings = StateAdapter.get('settings') || {};
        
        // Restore background image
        if (settings.backgroundUrl) {
            setBackground(settings.backgroundUrl);
            
            // Highlight matching preset if it exists
            highlightSelectedPreset(settings.backgroundUrl);
        } else {
            // Set default background
            setBackground(defaultBackground);
            highlightSelectedPreset(defaultBackground);
        }
        
        // Restore canvas opacity
        if (settings.canvasOpacity) {
            const opacity = settings.canvasOpacity;
            document.getElementById('background-opacity').value = opacity;
            document.querySelector('.background-opacity-value').textContent = opacity + '%';
            document.querySelector('.canvas-container').style.backgroundColor = `rgba(255, 255, 255, ${opacity / 100 * 0.8})`;
        }
    }
    
    // Public API
    return {
        init,
        setBackground,
        toggleBackgroundMenu
    };
})();