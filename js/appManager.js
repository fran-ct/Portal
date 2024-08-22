// Este código se asegura de que la aplicación se inicialice correctamente
document.addEventListener('DOMContentLoaded', () => {
    const appManager = new AppManager('my-global-secret-key');
    appManager.initializeApp();
});



class AppManager {
    constructor(encryptionKey) {
        this.encryptionKey = encryptionKey;
        this.encryptedDB = new StorageDB(encryptionKey); // Base de datos encriptada por defecto
        this.plainDB = new StorageDB(encryptionKey, 'plainDB', false); // Base de datos no encriptada
    }

    initializeApp() {
        if (this.encryptedDB.shouldRefreshData()) {
            this.promptGoogleSignIn();
        } else {
            this.renderUserProfile();
            this.renderAppContent();
        }
    }

    renderUserProfile() {
        const profile = this.encryptedDB.getUserProfile();
        if (profile) {
            document.getElementById('user-name').textContent = profile.name;
            document.getElementById('user-image').src = profile.picture;
            document.getElementById('user-image').style.filter = 'none';
            document.getElementById('user-image').alt = profile.email;
        }
    }

    promptGoogleSignIn() {
        google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: this.handleGoogleSignIn.bind(this)
        });
        google.accounts.id.prompt();
    }

    handleGoogleSignIn(response) {
        const credential = response.credential;
        this.encryptedDB.set('google_id_token', credential);
        this.renderUserProfile();
        this.renderAppContent();
    }

    renderAppContent() {
        loadView('apps', 'Apps');
    }
}

