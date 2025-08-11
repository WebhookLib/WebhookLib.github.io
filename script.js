// Enhanced Mobile-Optimized Documentation Script

// Utility functions for mobile detection and touch handling
const MobileUtils = {
    isMobile: () => window.innerWidth <= 768,
    isTouch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    
    // Debounce function to limit rapid calls
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Improved scroll prevention for mobile
    preventScroll: (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
};

// Enhanced Theme Management with better mobile support
class ThemeManager {
    constructor() {
        this.theme = this.getStoredTheme() || this.getSystemTheme();
        this.transitionEnabled = false;
        this.init();
    }

    init() {
        // Enable transitions after a brief delay to prevent flash
        setTimeout(() => {
            this.transitionEnabled = true;
            document.documentElement.classList.add('theme-transitions');
        }, 100);
        
        this.applyTheme(this.theme);
        this.bindEvents();
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    getStoredTheme() {
        try {
            return localStorage.getItem('webhooklib-theme');
        } catch (e) {
            return null;
        }
    }

    storeTheme(theme) {
        try {
            localStorage.setItem('webhooklib-theme', theme);
        } catch (e) {
            console.warn('Could not save theme preference');
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcons(theme);
        
        // Update meta theme color for mobile browsers
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = theme === 'dark' ? '#1a1a2e' : '#ffffff';
    }

    updateThemeIcons(theme) {
        const icons = document.querySelectorAll('.theme-icon');
        icons.forEach(icon => {
            if (theme === 'dark') {
                // Moon icon for dark theme
                icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
            } else {
                // Sun icon for light theme  
                icon.innerHTML = `<circle cx="12" cy="12" r="5"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>`;
            }
        });
    }

    toggle() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.theme);
        this.storeTheme(this.theme);
        
        // Provide haptic feedback on mobile
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    bindEvents() {
        // Use both click and touch events for better mobile support
        const handleToggle = (e) => {
            if (e.target.closest('.theme-toggle')) {
                e.preventDefault();
                this.toggle();
            }
        };

        document.addEventListener('click', handleToggle);
        document.addEventListener('touchend', handleToggle);

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getStoredTheme()) {
                this.theme = e.matches ? 'dark' : 'light';
                this.applyTheme(this.theme);
            }
        });
    }
}

// Enhanced Mobile Menu Management
class MobileMenuManager {
    constructor() {
        this.isOpen = false;
        this.isAnimating = false;
        this.touchStartY = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAccessibility();
    }

    setupAccessibility() {
        const toggle = document.getElementById('mobileMenuToggle');
        const nav = document.getElementById('mobileNav');
        
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-controls', 'mobileNav');
        }
        
        if (nav) {
            nav.setAttribute('aria-hidden', 'true');
        }
    }

    async toggle() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.isOpen = !this.isOpen;
        
        const mobileNav = document.getElementById('mobileNav');
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const body = document.body;
        
        if (mobileNav && mobileToggle) {
            // Update accessibility attributes
            mobileToggle.setAttribute('aria-expanded', this.isOpen.toString());
            mobileNav.setAttribute('aria-hidden', (!this.isOpen).toString());
            
            if (this.isOpen) {
                // Opening
                body.style.overflow = 'hidden';
                mobileNav.classList.add('opening');
                mobileNav.classList.add('open');
                mobileToggle.classList.add('active');
                
                // Focus management for accessibility
                setTimeout(() => {
                    const firstLink = mobileNav.querySelector('.mobile-nav-link');
                    if (firstLink) firstLink.focus();
                }, 300);
            } else {
                // Closing
                body.style.overflow = '';
                mobileNav.classList.add('closing');
                mobileNav.classList.remove('open');
                mobileToggle.classList.remove('active');
                
                setTimeout(() => {
                    mobileNav.classList.remove('closing', 'opening');
                }, 300);
            }
        }
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 300);
    }

    close() {
        if (!this.isOpen || this.isAnimating) return;
        this.toggle();
    }

    bindEvents() {
        // Enhanced touch and click handling
        const handleToggle = MobileUtils.debounce((e) => {
            if (e.target.closest('#mobileMenuToggle')) {
                e.preventDefault();
                e.stopPropagation();
                this.toggle();
            }
        }, 100);

        document.addEventListener('click', handleToggle);
        document.addEventListener('touchend', handleToggle);

        // Close menu when clicking links or overlay
        document.addEventListener('click', (e) => {
            if (e.target.closest('.mobile-nav-link') || 
                (this.isOpen && !e.target.closest('.mobile-nav-content'))) {
                this.close();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Enhanced resize handling
        window.addEventListener('resize', MobileUtils.debounce(() => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
                document.body.style.overflow = '';
            }
        }, 250));

        // Touch gestures for closing menu
        let touchStartY = 0;
        document.addEventListener('touchstart', (e) => {
            if (this.isOpen && e.target.closest('#mobileNav')) {
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (this.isOpen && e.target.closest('#mobileNav')) {
                const touchEndY = e.touches[0].clientY;
                const deltaY = touchEndY - touchStartY;
                
                // Close menu if swiping up significantly
                if (deltaY < -100) {
                    this.close();
                }
            }
        }, { passive: true });
    }
}

// Enhanced Sidebar Management with improved mobile support
class SidebarManager {
    constructor() {
        this.isOpen = false;
        this.isAnimating = false;
        this.touchStartX = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupSwipeGestures();
    }

    setupSwipeGestures() {
        if (!MobileUtils.isTouch()) return;

        let startX = 0;
        let startY = 0;
        let moveX = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!startX) return;
            
            moveX = e.touches[0].clientX;
            const moveY = e.touches[0].clientY;
            const deltaX = moveX - startX;
            const deltaY = moveY - startY;

            // Only handle horizontal swipes
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Swipe from left edge to open
                if (startX < 50 && deltaX > 100 && !this.isOpen) {
                    this.open();
                }
                // Swipe right to close when open
                else if (this.isOpen && deltaX > 100) {
                    this.close();
                }
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            startX = 0;
            startY = 0;
            moveX = 0;
        }, { passive: true });
    }

    async toggle() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.isOpen = !this.isOpen;
        
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const toggle = document.getElementById('mobileSidebarToggle');
        
        if (sidebar && overlay) {
            if (this.isOpen) {
                document.body.style.overflow = 'hidden';
                sidebar.classList.add('open');
                overlay.classList.add('show');
                if (toggle) toggle.setAttribute('aria-expanded', 'true');
            } else {
                document.body.style.overflow = '';
                sidebar.classList.remove('open');
                overlay.classList.remove('show');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
            }
        }
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 300);
    }

    open() {
        if (!this.isOpen) this.toggle();
    }

    close() {
        if (this.isOpen) this.toggle();
    }

    bindEvents() {
        const handleToggle = MobileUtils.debounce((e) => {
            if (e.target.closest('#mobileSidebarToggle')) {
                e.preventDefault();
                this.toggle();
            }
        }, 100);

        document.addEventListener('click', handleToggle);
        document.addEventListener('touchend', handleToggle);

        // Close sidebar when clicking overlay or nav items
        document.addEventListener('click', (e) => {
            if (e.target.closest('#sidebarOverlay') || 
                (e.target.closest('.nav-item') && MobileUtils.isMobile())) {
                this.close();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Enhanced resize handling
        window.addEventListener('resize', MobileUtils.debounce(() => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
            }
        }, 250));
    }
}

// Enhanced copy functionality with better mobile feedback
function copyCode(button) {
    const codeBlock = button.closest('.code-block').querySelector('code');
    const text = codeBlock.textContent;
    
    // Enhanced feedback for mobile
    const showFeedback = (message, success = true) => {
        const originalText = button.textContent;
        button.textContent = message;
        button.style.backgroundColor = success ? 'var(--success, #10b981)' : 'var(--error, #ef4444)';
        button.style.color = 'white';
        button.style.transform = 'scale(0.95)';
        
        // Haptic feedback on mobile
        if (navigator.vibrate) {
            navigator.vibrate(success ? [50] : [100, 50, 100]);
        }
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
            button.style.color = '';
            button.style.transform = '';
        }, 2000);
    };
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showFeedback('Copied!', true);
        }).catch(() => {
            // Fallback to older method
            fallbackCopyTextToClipboard(text, button);
        });
    } else {
        fallbackCopyTextToClipboard(text, button);
    }
}

// Fallback copy method for older browsers/mobile
function fallbackCopyTextToClipboard(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        const message = successful ? 'Copied!' : 'Failed';
        showCopyFeedback(button, message, successful);
    } catch (err) {
        showCopyFeedback(button, 'Failed', false);
    }
    
    document.body.removeChild(textArea);
}

function showCopyFeedback(button, message, success) {
    const originalText = button.textContent;
    button.textContent = message;
    button.style.backgroundColor = success ? 'var(--success, #10b981)' : 'var(--error, #ef4444)';
    button.style.color = 'white';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
        button.style.color = '';
    }, 2000);
}

// Enhanced Documentation System with better mobile performance
class DocumentationSystem {
    constructor() {
        this.docs = null;
        this.currentSection = 'getting-started';
        this.searchIndex = [];
        this.searchTimeout = null;
        this.isLoading = false;
        this.init();
    }

    async init() {
        if (!document.getElementById('docsContent')) return;
        
        this.isLoading = true;
        this.showLoadingState();
        
        try {
            await this.loadDocs();
            this.buildSearchIndex();
            this.buildNavigation();
            this.bindEvents();
            this.loadSection(this.getCurrentSectionFromURL());
        } catch (error) {
            console.error('Failed to initialize documentation:', error);
            this.showError('Failed to load documentation. Please refresh the page.');
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    showLoadingState() {
        const content = document.getElementById('docsContent');
        if (content) {
            content.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                    </div>
                    <p class="loading-text">Loading documentation...</p>
                </div>
            `;
        }
    }

    hideLoadingState() {
        const loading = document.querySelector('.loading-container');
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => loading.remove(), 300);
        }
    }

    async loadDocs() {
        try {
            // Try to load from docs.json, fallback to sample data
            let docs;
            try {
                const response = await fetch('docs.json');
                if (!response.ok) throw new Error('Network response was not ok');
                docs = await response.json();
            } catch (fetchError) {
                console.warn('Could not load docs.json, using sample data');
                docs = this.getSampleDocs();
            }
            
            this.docs = docs;
        } catch (error) {
            console.error('Failed to load documentation:', error);
            throw error;
        }
    }

    getSampleDocs() {
        return {
            sections: [
                {
                    id: 'getting-started',
                    title: 'Getting Started',
                    content: 'Welcome to WebhookLib documentation. This library provides production-quality Discord webhook functionality for Roblox.',
                    subsections: [
                        {
                            title: 'Installation',
                            content: `To install WebhookLib in your Roblox project:

\`\`\`lua
-- Method 1: Direct require
local WebhookLib = require(game.ServerScriptService.WebhookLib)

-- Method 2: Using a module ID
local WebhookLib = require(1234567890) -- Replace with actual module ID
\`\`\`

**Note:** Make sure HTTP requests are enabled in your game settings.`
                        },
                        {
                            title: 'Quick Start',
                            content: `Here's a simple example to get you started:

\`\`\`lua
local WebhookLib = require(game.ServerScriptService.WebhookLib)

-- Create a new webhook
local webhook = WebhookLib.new("YOUR_WEBHOOK_URL")

-- Send a simple message
webhook:Send("Hello, Discord!")

-- Send a rich embed
webhook:SendEmbed({
    title = "Game Event",
    description = "A player joined the game!",
    color = 0x00ff00,
    fields = {
        {
            name = "Player",
            value = "ExamplePlayer",
            inline = true
        }
    }
})
\`\`\``
                        }
                    ]
                },
                {
                    id: 'api',
                    title: 'API Reference',
                    content: 'Complete API reference for all WebhookLib functions and methods.',
                    subsections: [
                        {
                            title: 'Webhook Class',
                            content: `The main Webhook class provides all functionality for sending Discord webhooks.

## Constructor

\`\`\`lua
local webhook = WebhookLib.new(url, options)
\`\`\`

**Parameters:**
- \`url\` (string): The Discord webhook URL
- \`options\` (table, optional): Configuration options

**Options:**
- \`username\` (string): Override webhook username
- \`avatar_url\` (string): Override webhook avatar
- \`rate_limit\` (number): Rate limit in seconds (default: 1)`
                        },
                        {
                            title: 'Methods',
                            content: `## Send(content, username, avatar_url)

Sends a simple text message.

\`\`\`lua
webhook:Send("Hello World!")
webhook:Send("Custom message", "CustomBot", "https://example.com/avatar.png")
\`\`\`

## SendEmbed(embed, content, username, avatar_url)

Sends a rich embed message.

\`\`\`lua
webhook:SendEmbed({
    title = "Embed Title",
    description = "Embed description",
    color = 0x0099ff,
    timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
    footer = {
        text = "Footer text",
        icon_url = "https://example.com/footer.png"
    },
    fields = {
        {name = "Field 1", value = "Value 1", inline = true},
        {name = "Field 2", value = "Value 2", inline = true}
    }
})
\`\`\``
                        }
                    ]
                },
                {
                    id: 'examples',
                    title: 'Examples',
                    content: 'Practical examples and use cases for WebhookLib.',
                    subsections: [
                        {
                            title: 'Player Events',
                            content: `Track player join/leave events:

\`\`\`lua
local WebhookLib = require(game.ServerScriptService.WebhookLib)
local webhook = WebhookLib.new("YOUR_WEBHOOK_URL")

game.Players.PlayerAdded:Connect(function(player)
    webhook:SendEmbed({
        title = "Player Joined",
        description = player.Name .. " has joined the game!",
        color = 0x00ff00,
        timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
        thumbnail = {
            url = "https://www.roblox.com/headshot-thumbnail/image?userId=" .. player.UserId .. "&width=150&height=150&format=png"
        }
    })
end)

game.Players.PlayerRemoving:Connect(function(player)
    webhook:SendEmbed({
        title = "Player Left",
        description = player.Name .. " has left the game.",
        color = 0xff0000,
        timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
    })
end)
\`\`\``
                        },
                        {
                            title: 'Error Logging',
                            content: `Log errors and important events:

\`\`\`lua
local function logError(errorMessage, scriptName)
    webhook:SendEmbed({
        title = "⚠️ Error Occurred",
        description = "An error occurred in the game.",
        color = 0xff4444,
        fields = {
            {
                name = "Error Message",
                value = "\`\`\`" .. errorMessage .. "\`\`\`",
                inline = false
            },
            {
                name = "Script",
                value = scriptName or "Unknown",
                inline = true
            },
            {
                name = "Time",
                value = os.date("%Y-%m-%d %H:%M:%S"),
                inline = true
            }
        },
        timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
    })
end

-- Usage
pcall(function()
    -- Your code here
    someRiskyFunction()
end) or logError("Failed to execute risky function", script.Name)
\`\`\``
                        }
                    ]
                }
            ]
        };
    }

    buildSearchIndex() {
        if (!this.docs) return;
        
        this.searchIndex = [];
        
        this.docs.sections.forEach(section => {
            // Add section to search index
            this.searchIndex.push({
                type: 'section',
                id: section.id,
                title: section.title,
                content: section.content,
                searchText: `${section.title} ${section.content}`.toLowerCase()
            });
            
            // Add subsections to search index
            if (section.subsections) {
                section.subsections.forEach(subsection => {
                    const subsectionId = this.createSubsectionId(subsection.title);
                    this.searchIndex.push({
                        type: 'subsection',
                        sectionId: section.id,
                        id: subsectionId,
                        title: subsection.title,
                        content: subsection.content,
                        searchText: `${subsection.title} ${subsection.content}`.toLowerCase()
                    });
                });
            }
        });
    }

    buildNavigation() {
        const nav = document.getElementById('sidebarNav');
        if (!nav || !this.docs) return;

        const navHTML = this.docs.sections.map(section => {
            const subsectionHTML = section.subsections ? section.subsections.map(subsection => {
                const subsectionId = this.createSubsectionId(subsection.title);
                return `<div class="nav-item nav-subsection" data-section="${section.id}" data-subsection="${subsectionId}">${subsection.title}</div>`;
            }).join('') : '';

            return `
                <div class="nav-section">
                    <div class="nav-item nav-section-title" data-section="${section.id}">${section.title}</div>
                    <div class="nav-items">
                        ${subsectionHTML}
                    </div>
                </div>
            `;
        }).join('');

        nav.innerHTML = navHTML;
    }

    createSubsectionId(title) {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    bindEvents() {
        // Enhanced navigation with better mobile support
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                const section = navItem.dataset.section;
                const subsection = navItem.dataset.subsection;
                
                if (section) {
                    this.loadSection(section, subsection);
                    
                    // Provide haptic feedback
                    if (navigator.vibrate) {
                        navigator.vibrate(30);
                    }
                    
                    // Close sidebar on mobile after selection
                    if (MobileUtils.isMobile()) {
                        const sidebarManager = window.sidebarManager;
                        if (sidebarManager) {
                            setTimeout(() => sidebarManager.close(), 100);
                        }
                    }
                }
            }
        });

        // Enhanced search with debouncing
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const debouncedSearch = MobileUtils.debounce((query) => {
                this.searchDocumentation(query);
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });

            // Clear search on escape
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    searchInput.value = '';
                    this.searchDocumentation('');
                }
            });
        }

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const section = this.getCurrentSectionFromURL();
            this.loadSection(section, null, false);
        });

        // Handle orientation change on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.adjustForOrientation();
            }, 100);
        });
    }

    adjustForOrientation() {
        // Adjust layout for orientation changes
        const content = document.getElementById('docsContent');
        if (content && MobileUtils.isMobile()) {
            // Force a re-render to fix any layout issues
            content.style.display = 'none';
            content.offsetHeight; // Trigger reflow
            content.style.display = '';
        }
    }

    getCurrentSectionFromURL() {
        const hash = window.location.hash.slice(1);
        return hash || 'getting-started';
    }

    loadSection(sectionId, subsectionId = null, updateURL = true) {
        const section = this.docs.sections.find(s => s.id === sectionId);
        if (!section) {
            this.showError('Section not found.');
            return;
        }

        this.currentSection = sectionId;
        
        if (updateURL) {
            const url = subsectionId ? `#${sectionId}-${subsectionId}` : `#${sectionId}`;
            history.pushState({}, '', url);
        }

        this.renderSection(section, subsectionId);
        this.updateActiveNavItem(sectionId, subsectionId);
    }

    renderSection(section, targetSubsectionId = null) {
        const content = document.getElementById('docsContent');
        if (!content) return;

        let html = `
            <div class="section-header">
                <h1>${section.title}</h1>
                <p class="section-description">${section.content}</p>
            </div>
        `;

        if (section.subsections) {
            section.subsections.forEach((subsection, index) => {
                const subsectionId = this.createSubsectionId(subsection.title);
                html += `
                    <section id="${subsectionId}" class="subsection">
                        <h2>${subsection.title}</h2>
                        <div class="subsection-content">${this.renderMarkdown(subsection.content)}</div>
                        ${index < section.subsections.length - 1 ? '<hr class="subsection-divider">' : ''}
                    </section>
                `;
            });
        }

        // Add navigation buttons for mobile
        if (MobileUtils.isMobile()) {
            html += this.renderMobileNavigation();
        }

        content.innerHTML = html;
        
        // Enhanced smooth scrolling with mobile considerations
        if (targetSubsectionId) {
            requestAnimationFrame(() => {
                const element = document.getElementById(targetSubsectionId);
                if (element) {
                    const offset = MobileUtils.isMobile() ? 80 : 60;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        } else {
            content.scrollTop = 0;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Initialize code copy buttons
        this.initCodeCopyButtons();
    }

    initCodeCopyButtons() {
        const codeBlocks = document.querySelectorAll('.code-block');
        codeBlocks.forEach(block => {
            if (!block.querySelector('.copy-btn')) {
                const button = document.createElement('button');
                button.className = 'copy-btn';
                button.textContent = 'Copy';
                button.setAttribute('onclick', 'copyCode(this)');
                button.setAttribute('aria-label', 'Copy code to clipboard');
                
                const header = block.querySelector('.code-header') || block;
                if (block.querySelector('.code-header')) {
                    header.appendChild(button);
                } else {
                    // Create header if it doesn't exist
                    const newHeader = document.createElement('div');
                    newHeader.className = 'code-header';
                    newHeader.innerHTML = '<span class="code-lang">Code</span>';
                    newHeader.appendChild(button);
                    block.insertBefore(newHeader, block.firstChild);
                }
            }
        });
    }

    renderMobileNavigation() {
        const currentIndex = this.docs.sections.findIndex(s => s.id === this.currentSection);
        const prevSection = currentIndex > 0 ? this.docs.sections[currentIndex - 1] : null;
        const nextSection = currentIndex < this.docs.sections.length - 1 ? this.docs.sections[currentIndex + 1] : null;

        return `
            <div class="mobile-nav-buttons">
                ${prevSection ? `
                    <button class="nav-button prev-button" onclick="window.docsSystem.loadSection('${prevSection.id}')">
                        <span class="nav-button-icon">←</span>
                        <div class="nav-button-text">
                            <small>Previous</small>
                            <span>${prevSection.title}</span>
                        </div>
                    </button>
                ` : ''}
                ${nextSection ? `
                    <button class="nav-button next-button" onclick="window.docsSystem.loadSection('${nextSection.id}')">
                        <div class="nav-button-text">
                            <small>Next</small>
                            <span>${nextSection.title}</span>
                        </div>
                        <span class="nav-button-icon">→</span>
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderMarkdown(content) {
        if (!content) return '';
        
        // Enhanced markdown parser with better mobile formatting
        let html = content
            // Code blocks with language detection
            .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                const language = lang || 'text';
                const highlightedCode = this.highlightCode(code.trim(), language);
                return `
                    <div class="code-block" data-language="${language}">
                        <div class="code-header">
                            <span class="code-lang">${language}</span>
                        </div>
                        <pre><code class="language-${language}">${highlightedCode}</code></pre>
                    </div>
                `;
            })
            // Inline code
            .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
            // Bold text
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            // Italic text
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            // Headers
            .replace(/^### (.+)$/gm, '<h4>$1</h4>')
            .replace(/^## (.+)$/gm, '<h3>$1</h3>')
            .replace(/^# (.+)$/gm, '<h2>$1</h2>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // Lists
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>\s*)+/gs, '<ul>        } else {
            content.scrollTop = 0;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }</ul>')
            .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>\s*)+/gs, (match) => {
                if (match.includes('<ul>')) return match;
                return '<ol>' + match + '</ol>';
            })
            // Blockquotes
            .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
            // Horizontal rules
            .replace(/^---$/gm, '<hr>')
            // Paragraphs
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        // Wrap in paragraph tags if not already wrapped
        if (!html.startsWith('<')) {
            html = '<p>' + html + '</p>';
        }

        return html;
    }

    highlightCode(code, language) {
        // Simple syntax highlighting for common languages
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        const escaped = escapeHtml(code);

        if (language === 'lua') {
            return escaped
                // Keywords
                .replace(/\b(local|function|end|if|then|else|elseif|while|for|do|repeat|until|break|return|and|or|not|true|false|nil)\b/g, '<span class="keyword">$1</span>')
                // Strings
                .replace(/(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
                // Comments
                .replace(/(--.*$)/gm, '<span class="comment">$1</span>')
                // Numbers
                .replace(/\b\d+\.?\d*\b/g, '<span class="number">        } else {
            content.scrollTop = 0;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }</span>');
        } else if (language === 'javascript' || language === 'js') {
            return escaped
                // Keywords
                .replace(/\b(function|const|let|var|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|class|extends|import|export|default|async|await|true|false|null|undefined)\b/g, '<span class="keyword">$1</span>')
                // Strings
                .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
                // Comments
                .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$1</span>')
                // Numbers
                .replace(/\b\d+\.?\d*\b/g, '<span class="number">        } else {
            content.scrollTop = 0;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }</span>');
        }

        return escaped;
    }

    updateActiveNavItem(sectionId, subsectionId = null) {
        // Remove all active classes
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current item
        const selector = subsectionId 
            ? `[data-section="${sectionId}"][data-subsection="${subsectionId}"]`
            : `[data-section="${sectionId}"]:not([data-subsection])`;
        
        const activeItem = document.querySelector(selector);
        if (activeItem) {
            activeItem.classList.add('active');
            
            // Ensure parent section is expanded
            const parentSection = activeItem.closest('.nav-section');
            if (parentSection) {
                parentSection.classList.add('expanded');
            }
            
            // Scroll into view on mobile if needed
            if (MobileUtils.isMobile() && activeItem) {
                activeItem.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest',
                    inline: 'nearest'
                });
            }
        }
    }

    searchDocumentation(query) {
        const navSections = document.querySelectorAll('.nav-section');
        const navItems = document.querySelectorAll('.nav-item');
        const searchQuery = query.toLowerCase().trim();

        if (!searchQuery) {
            // Show all items when search is empty
            navSections.forEach(section => {
                section.style.display = 'block';
                section.classList.remove('search-filtered');
            });
            navItems.forEach(item => {
                item.style.display = 'block';
                item.classList.remove('search-highlight');
            });
            return;
        }

        // Search through the search index
        const searchResults = this.searchIndex.filter(item => 
            item.searchText.includes(searchQuery) ||
            item.title.toLowerCase().includes(searchQuery)
        );

        // Hide all sections and items first
        navSections.forEach(section => {
            section.style.display = 'none';
            section.classList.add('search-filtered');
        });
        navItems.forEach(item => {
            item.style.display = 'none';
            item.classList.remove('search-highlight');
        });

        // Show matching items and their parents
        const visibleSections = new Set();
        
        searchResults.forEach(result => {
            let selector;
            let sectionId;
            
            if (result.type === 'section') {
                selector = `[data-section="${result.id}"]:not([data-subsection])`;
                sectionId = result.id;
            } else {
                selector = `[data-section="${result.sectionId}"][data-subsection="${result.id}"]`;
                sectionId = result.sectionId;
            }
            
            const item = document.querySelector(selector);
            if (item) {
                item.style.display = 'block';
                item.classList.add('search-highlight');
                visibleSections.add(sectionId);
            }
        });

        // Show sections that have visible items
        visibleSections.forEach(sectionId => {
            const section = document.querySelector(`[data-section="${sectionId}"]`).closest('.nav-section');
            if (section) {
                section.style.display = 'block';
                section.classList.remove('search-filtered');
                
                // Also show the section title
                const sectionTitle = section.querySelector('.nav-section-title');
                if (sectionTitle) {
                    sectionTitle.style.display = 'block';
                }
            }
        });

        // Provide feedback for empty results
        if (searchResults.length === 0) {
            this.showSearchEmptyState(searchQuery);
        } else {
            this.hideSearchEmptyState();
        }
    }

    showSearchEmptyState(query) {
        let emptyState = document.querySelector('.search-empty-state');
        if (!emptyState) {
            emptyState = document.createElement('div');
            emptyState.className = 'search-empty-state';
            document.getElementById('sidebarNav').appendChild(emptyState);
        }
        
        emptyState.innerHTML = `
            <div class="empty-state-content">
                <p>No results found for "<strong>${query}</strong>"</p>
                <small>Try a different search term or browse the navigation.</small>
            </div>
        `;
        emptyState.style.display = 'block';
    }

    hideSearchEmptyState() {
        const emptyState = document.querySelector('.search-empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }

    showError(message) {
        const content = document.getElementById('docsContent');
        if (content) {
            content.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">⚠️</div>
                    <h2>Oops! Something went wrong</h2>
                    <p class="error-message">${message}</p>
                    <button class="retry-button" onclick="location.reload()">
                        Retry
                    </button>
                </div>
            `;
        }
    }
}

// Enhanced smooth scrolling with mobile optimization
function initSmoothScrolling() {
    // Intersection Observer for active section tracking
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                if (id && window.docsSystem) {
                    // Update active navigation without changing URL
                    const navItem = document.querySelector(`[data-subsection="${id}"]`);
                    if (navItem) {
                        document.querySelectorAll('.nav-item').forEach(item => {
                            item.classList.remove('active');
                        });
                        navItem.classList.add('active');
                    }
                }
            }
        });
    }, observerOptions);

    // Observe all sections
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            document.querySelectorAll('section[id]').forEach(section => {
                observer.observe(section);
            });
        }, 1000);
    });

    // Enhanced anchor link handling
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (link && link.getAttribute('href') !== '#') {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offset = MobileUtils.isMobile() ? 80 : 60;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Update URL without triggering navigation
                history.replaceState(null, null, link.getAttribute('href'));
            }
        }
    });
}

// Performance optimization for mobile
function optimizeForMobile() {
    if (!MobileUtils.isMobile()) return;

    // Reduce animations on low-end devices
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
        document.documentElement.classList.add('reduce-motion');
    }

    // Optimize scroll performance
    let ticking = false;
    
    function updateScrollPosition() {
        // Add scroll-based classes for styling
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const navbar = document.querySelector('.navbar');
        
        if (navbar) {
            if (scrollTop > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollPosition);
            ticking = true;
        }
    }, { passive: true });

    // Prevent zoom on input focus (iOS Safari)
    document.addEventListener('touchstart', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            document.viewport = document.querySelector('meta[name="viewport"]');
            if (document.viewport) {
                document.viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                
                setTimeout(() => {
                    document.viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                }, 1000);
            }
        }
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    const themeManager = new ThemeManager();
    const mobileMenuManager = new MobileMenuManager();
    const sidebarManager = new SidebarManager();
    const docsSystem = new DocumentationSystem();
    
    // Make globally accessible for mobile navigation buttons
    window.themeManager = themeManager;
    window.mobileMenuManager = mobileMenuManager;
    window.sidebarManager = sidebarManager;
    window.docsSystem = docsSystem;
    
    // Initialize other features
    initSmoothScrolling();
    optimizeForMobile();
    
    // Add visual feedback for all interactive elements on mobile
    if (MobileUtils.isTouch()) {
        document.addEventListener('touchstart', (e) => {
            const interactive = e.target.closest('button, .nav-item, .nav-link, a, [onclick]');
            if (interactive) {
                interactive.style.opacity = '0.7';
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            const interactive = e.target.closest('button, .nav-item, .nav-link, a, [onclick]');
            if (interactive) {
                setTimeout(() => {
                    interactive.style.opacity = '';
                }, 150);
            }
        }, { passive: true });
    }
    
    console.log('📱 WebhookLib Documentation - Mobile Optimized Version Loaded');
});

// Service Worker registration for offline support
if ('serviceWorker' in navigator && 'caches' in window) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Add utility functions for development and debugging
window.WebhookLibDocs = {
    // Copy all code blocks to clipboard
    copyAllCode: () => {
        const codeBlocks = document.querySelectorAll('.code-block code');
        const allCode = Array.from(codeBlocks).map(block => block.textContent).join('\n\n---\n\n');
        navigator.clipboard.writeText(allCode).then(() => {
            console.log('All code blocks copied to clipboard');
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        });
    },
    
    // Export documentation as HTML
    exportDocs: () => {
        const docs = document.getElementById('docsContent').innerHTML;
        const blob = new Blob([docs], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'webhooklib-docs.html';
        a.click();
        URL.revokeObjectURL(url);
    },
    
    // Toggle debug mode
    toggleDebug: () => {
        document.documentElement.classList.toggle('debug-mode');
        console.log('Debug mode:', document.documentElement.classList.contains('debug-mode') ? 'ON' : 'OFF');
    },
    
    // Performance monitoring
    getPerformanceInfo: () => {
        if (performance.memory) {
            return {
                memory: {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
                },
                navigation: performance.getEntriesByType('navigation')[0],
                deviceInfo: {
                    isMobile: MobileUtils.isMobile(),
                    isTouch: MobileUtils.isTouch(),
                    memory: navigator.deviceMemory || 'unknown',
                    cores: navigator.hardwareConcurrency || 'unknown',
                    connection: navigator.connection ? {
                        effectiveType: navigator.connection.effectiveType,
                        downlink: navigator.connection.downlink + ' Mbps',
                        rtt: navigator.connection.rtt + ' ms'
                    } : 'unknown'
                }
            };
        }
        return 'Performance API not supported';
    }
};
