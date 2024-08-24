console.log("Ver: 3.1")

class AppManager {
    constructor(encryptionKey) {
        this.encryptionKey = encryptionKey;
        this.encryptedDB = new StorageDB(encryptionKey);
        this.unencryptedDB = new StorageDB();
        this.sessionManager = new SessionManager(this);
        this.isLoading = false;
    }

    async initializeApp() {
        this.sessionManager.initialize();
        this.handleHashChange(); // Llamada correcta a la función
    }

    loadInitialView() {
        if (!this.sessionManager.isSessionActive()) {
            this.loadView('signin', 'Sign In');
        } else {
            this.loadView('apps', 'Apps');
        }
    }

    preLoadViews(viewNames) {
        for (let viewName of viewNames) {
            try {
                fetch(`views/${viewName}/${viewName}.html`);
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = `views/${viewName}/${viewName}.css`;
                document.head.appendChild(link);

                const script = document.createElement('script');
                script.src = `views/${viewName}/${viewName}.js`;
                script.defer = true;
                script.setAttribute('data-view-script', '');
                document.body.appendChild(script);
            } catch (error) {
                console.error(`Error preloading view ${viewName}:`, error);
            }
        }
    }

    loadView(viewName, viewTitle) {
        if (this.isLoading) return;
        this.isLoading = true;

        console.log(`Loading view: ${viewName}`);

        const contentDiv = document.getElementById('content');
        contentDiv.style.opacity = 0;

        this.removePreviousAssets();

        setTimeout(() => {
            fetch(`views/${viewName}/${viewName}.html`)
                .then(response => response.text())
                .then(html => {
                    contentDiv.innerHTML = html;

                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = `views/${viewName}/${viewName}.css`;
                    link.setAttribute('data-view-style', '');
                    document.head.appendChild(link);

                    const script = document.createElement('script');
                    script.src = `views/${viewName}/${viewName}.js`;
                    script.defer = true;
                    script.setAttribute('data-view-script', '');
                    script.onload = () => {
                        if (typeof initializeView === 'function') {
                            initializeView();
                        }
                        this.isLoading = false;
                    };
                    contentDiv.style.opacity = 1;
                    document.body.appendChild(script);

                    document.title = viewTitle;
                })
                .catch(error => {
                    console.error('Error al cargar la vista:', error);
                    this.isLoading = false;
                });
        }, 100);
    }

    removePreviousAssets() {
        const oldLink = document.querySelector('link[data-view-style]');
        if (oldLink) {
            oldLink.remove();
        }

        const oldScripts = document.querySelectorAll('script[data-view-script]');
        oldScripts.forEach(script => script.remove());
    }

    clearAllData() {
        this.encryptedDB.clear();
        this.unencryptedDB.clear();
    }

    handleHashChange() {
        window.addEventListener('hashchange', () => {
            const currentHash = window.location.hash.substring(1);
            if (currentHash && !this.isLoading) {
                const viewTitle = this.getAppNameById(currentHash);
                this.loadView(currentHash, viewTitle);
            }
        });
    }

    getAppNameById(id) {
        const app = window.apps.find(app => app.id === id);
        return app ? app.name : 'Unknown';
    }

    async performAuthenticatedOperation(operation) {
        await this.sessionManager.checkAndPromptAuth();
        const accessToken = await this.sessionManager.getAccessToken();
        if (accessToken) {
            return operation(accessToken);
        } else {
            console.error('Failed to get access token');
            return null;
        }
    }

    async fetchCalendarEvents(calendarId, timeMin, timeMax) {
        return this.performAuthenticatedOperation(async (accessToken) => {
            const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch calendar events');
            }
            return response.json();
        });
    }

    async createCalendarEvent(calendarId, event) {
        return this.performAuthenticatedOperation(async (accessToken) => {
            const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });
            if (!response.ok) {
                throw new Error('Failed to create calendar event');
            }
            return response.json();
        });
    }
}
