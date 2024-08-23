console.log("Ver: 1.1")

class AppManager {
    constructor(encryptionKey) {
        this.encryptionKey = encryptionKey;
        this.encryptedDB = new StorageDB(encryptionKey);
        this.unencryptedDB = new StorageDB();
        this.sessionManager = new SessionManager(this);
    }

    // Inicializar la aplicación
    initializeApp() {
        this.sessionManager.initialize();
        this.handleHashChange();
    }

    // Cargar la vista inicial
    loadInitialView() {
        if (!this.sessionManager.isSessionActive()) {
            this.loadView('signin', 'Sign In');
        } else {
            this.loadView('apps', 'Apps');
        }
    }

    // Cargar una vista específica
    loadView(viewName, viewTitle) {
        const contentDiv = document.getElementById('content');
        contentDiv.style.opacity = 0; // Inicia la transición

        setTimeout(() => {
            fetch(`views/${viewName}/${viewName}.html`)
                .then(response => response.text())
                .then(html => {
                    contentDiv.innerHTML = html;
                    contentDiv.style.opacity = 1; // Termina la transición

                    const script = document.createElement('script');
                    script.src = `views/${viewName}/${viewName}.js`;
                    script.defer = true;
                    script.onload = () => {
                        if (typeof initializeView === 'function') {
                            initializeView();
                        }
                    };
                    document.body.appendChild(script);

                    document.title = viewTitle;
                })
                .catch(error => console.error('Error al cargar la vista:', error));
        }, 300); // Tiempo de la transición
    }

    // Limpiar todos los datos
    clearAllData() {
        this.encryptedDB.clear();
        this.unencryptedDB.clear();
    }

    // Método para manejar el cambio de hash
    handleHashChange() {
        window.addEventListener('hashchange', () => {
            const currentHash = window.location.hash.substring(1);
            if (currentHash) {
                const viewTitle = this.getAppNameById(currentHash);
                this.loadView(currentHash, viewTitle);
            }
        });
    }

    // Obtener el nombre de la aplicación por su ID
    getAppNameById(id) {
        const app = window.apps.find(app => app.id === id);
        return app ? app.name : 'Unknown';
    }
}
