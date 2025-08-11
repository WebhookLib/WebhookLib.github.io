// Theme Management
class ThemeManager {
    constructor() {
        this.theme = this.getStoredTheme() || this.getSystemTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.theme);
        this.bindEvents();
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    getStoredTheme() {
        return localStorage.getItem('theme');
    }

    storeTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcons(theme);
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
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.theme-toggle')) {
                this.toggle();
            }
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getStoredTheme()) {
                this.theme = e.matches ? 'dark' : 'light';
                this.applyTheme(this.theme);
            }
        });
    }
}

// Mobile Menu Management
class MobileMenuManager {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const mobileNav = document.getElementById('mobileNav');
        const mobileToggle = document.getElementById('mobileMenuToggle');
        
        if (mobileNav) {
            mobileNav.classList.toggle('open', this.isOpen);
        }
        if (mobileToggle) {
            mobileToggle.classList.toggle('active', this.isOpen);
        }
    }

    close() {
        this.isOpen = false;
        const mobileNav = document.getElementById('mobileNav');
        const mobileToggle = document.getElementById('mobileMenuToggle');
        
        if (mobileNav) {
            mobileNav.classList.remove('open');
        }
        if (mobileToggle) {
            mobileToggle.classList.remove('active');
        }
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#mobileMenuToggle')) {
                this.toggle();
            } else if (e.target.closest('.mobile-nav-link')) {
                this.close();
            } else if (e.target.closest('#sidebarOverlay')) {
                this.close();
            }
        });

        // Close on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
            }
        });
    }
}

// Sidebar Management for Docs
class SidebarManager {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) {
            sidebar.classList.toggle('open', this.isOpen);
        }
        if (overlay) {
            overlay.classList.toggle('show', this.isOpen);
        }
    }

    close() {
        this.isOpen = false;
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) {
            sidebar.classList.remove('open');
        }
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#mobileMenuToggle') && document.getElementById('sidebar')) {
                this.toggle();
            } else if (e.target.closest('#sidebarOverlay')) {
                this.close();
            }
        });

        // Close on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
            }
        });
    }
}

// Copy Code Functionality
function copyCode(button) {
    const codeBlock = button.closest('.code-block').querySelector('code');
    const text = codeBlock.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.backgroundColor = 'var(--success)';
        button.style.color = 'white';
        button.style.borderColor = 'var(--success)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
            button.style.color = '';
            button.style.borderColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy code: ', err);
        button.textContent = 'Failed';
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    });
}

// Documentation System
class DocumentationSystem {
    constructor() {
        this.docs = null;
        this.currentSection = 'introduction';
        this.searchIndex = [];
        this.init();
    }

    async init() {
        if (document.getElementById('docsContent')) {
            await this.loadDocs();
            this.buildSearchIndex();
            this.buildNavigation();
            this.bindEvents();
            this.loadSection(this.getCurrentSectionFromURL());
        }
    }

    async loadDocs() {
        try {
            const response = await fetch('docs.json');
            this.docs = await response.json();
        } catch (error) {
            console.error('Failed to load documentation:', error);
            this.showError('Failed to load documentation. Please refresh the page.');
        }
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
            const subsectionHTML = section.subsections ? section.subsections.map(subsection => 
                `<div class="nav-item nav-subsection" data-section="${section.id}" data-subsection="${this.createSubsectionId(subsection.title)}">${subsection.title}</div>`
            ).join('') : '';

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
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                const section = navItem.dataset.section;
                const subsection = navItem.dataset.subsection;
                
                if (section) {
                    this.loadSection(section, subsection);
                    if (window.innerWidth <= 768) {
                        new SidebarManager().close();
                    }
                }
            }
        });

        // Enhanced search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchDocumentation(e.target.value);
                }, 300);
            });
        }

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const section = this.getCurrentSectionFromURL();
            this.loadSection(section, null, false);
        });
    }

    getCurrentSectionFromURL() {
        const hash = window.location.hash.slice(1);
        return hash || 'introduction';
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
            <h1>${section.title}</h1>
            <p>${section.content}</p>
        `;

        if (section.subsections) {
            section.subsections.forEach(subsection => {
                const subsectionId = this.createSubsectionId(subsection.title);
                html += `
                    <section id="${subsectionId}">
                        <h2>${subsection.title}</h2>
                        <div class="subsection-content">${this.renderMarkdown(subsection.content)}</div>
                    </section>
                `;
            });
        }

        content.innerHTML = html;
        
        // Scroll to specific subsection if specified
        if (targetSubsectionId) {
            setTimeout(() => {
                const element = document.getElementById(targetSubsectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } else {
            content.scrollTop = 0;
        }
    }

    renderMarkdown(content) {
        // Simple markdown parser for basic formatting
        return content
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                return `
                    <div class="code-block">
                        <div class="code-header">
                            <span class="code-lang">${lang || 'Code'}</span>
                            <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                        </div>
                        <pre><code>${this.escapeHtml(code.trim())}</code></pre>
                    </div>
                `;
            })
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Bold text
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            // Lists
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateActiveNavItem(sectionId, subsectionId = null) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const selector = subsectionId 
            ? `[data-section="${sectionId}"][data-subsection="${subsectionId}"]`
            : `[data-section="${sectionId}"]:not([data-subsection])`;
        
        const activeItem = document.querySelector(selector);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    searchDocumentation(query) {
        const navItems = document.querySelectorAll('.nav-item');
        const searchQuery = query.toLowerCase().trim();

        if (!searchQuery) {
            // Show all items when search is empty
            navItems.forEach(item => {
                item.style.display = 'block';
            });
            document.querySelectorAll('.nav-section').forEach(section => {
                section.style.display = 'block';
            });
            return;
        }

        // Search through the search index
        const searchResults = this.searchIndex.filter(item => 
            item.searchText.includes(searchQuery)
        );

        // Hide all items first
        navItems.forEach(item => {
            item.style.display = 'none';
        });

        // Show matching items
        searchResults.forEach(result => {
            let selector;
            if (result.type === 'section') {
                selector = `[data-section="${result.id}"]:not([data-subsection])`;
            } else {
                selector = `[data-section="${result.sectionId}"][data-subsection="${result.id}"]`;
            }
            
            const item = document.querySelector(selector);
            if (item) {
                item.style.display = 'block';
                // Also show the parent section
                const parentSection = item.closest('.nav-section');
                if (parentSection) {
                    parentSection.style.display = 'block';
                    const sectionTitle = parentSection.querySelector('.nav-section-title');
                    if (sectionTitle) {
                        sectionTitle.style.display = 'block';
                    }
                }
            }
        });

        // Show/hide sections based on whether they have visible items
        document.querySelectorAll('.nav-section').forEach(section => {
            const visibleItems = section.querySelectorAll('.nav-item:not([style*="display: none"])');
            section.style.display = visibleItems.length > 0 ? 'block' : 'none';
        });
    }

    showError(message) {
        const content = document.getElementById('docsContent');
        if (content) {
            content.innerHTML = `
                <div class="error-message">
                    <h2>Error</h2>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Smooth Scrolling for Anchor Links
function initSmoothScrolling() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (link) {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new MobileMenuManager();
    new SidebarManager();
    new DocumentationSystem();
    initSmoothScrolling();
});

// Add some useful utilities for development
window.WebhookLibDocs = {
    copyAllCode: () => {
        const codeBlocks = document.querySelectorAll('.code-block code');
        const allCode = Array.from(codeBlocks).map(block => block.textContent).join('\n\n---\n\n');
        navigator.clipboard.writeText(allCode);
        console.log('All code blocks copied to clipboard');
    },
    
    exportDocs: () => {
        const docs = document.getElementById('docsContent').innerHTML;
        const blob = new Blob([docs], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'webhooklib-docs.html';
        a.click();
        URL.revokeObjectURL(url);
    }
};