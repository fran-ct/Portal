console.log("Ver: 2.0")

class AppManager {
    constructor(encryptionKey) {
        this.encryptionKey = encryptionKey;
        this.encryptedDB = new StorageDB(encryptionKey);
        this.unencryptedDB = new StorageDB();
        this.sessionManager = new SessionManager(this);
        this.isLoading = false; // Variable de control para evitar cargas duplicadas

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

    // Cargar una vista específica
    loadView(viewName, viewTitle) {
        if (this.isLoading) return;
        this.isLoading = true;

        console.log(`Loading view: ${viewName}`);

        const contentDiv = document.getElementById('content');
        contentDiv.style.opacity = 0;


        // Eliminar el CSS y JS anteriores
        this.removePreviousAssets();

        setTimeout(() => {
            fetch(`views/${viewName}/${viewName}.html`)
                .then(response => response.text())
                .then(html => {
                    contentDiv.innerHTML = html;

                    // Lazy load CSS
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = `views/${viewName}/${viewName}.css`;
                    link.setAttribute('data-view-style', '');
                    document.head.appendChild(link);

                    // Lazy load JS
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
        }, 100); // Tiempo de la transición
    }




    removePreviousAssets() {
        // Eliminar el CSS anterior
        const oldLink = document.querySelector('link[data-view-style]');
        if (oldLink) {
            oldLink.remove();
        }

        // Eliminar los scripts anteriores
        const oldScripts = document.querySelectorAll('script[data-view-script]');
        oldScripts.forEach(script => script.remove());
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
            if (currentHash && !this.isLoading) { // Verifica si no está cargando
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


