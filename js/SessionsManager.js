class SessionManager {
    constructor(appManager) {
        this.appManager = appManager;
    }

    // Inicializa la autenticación con Google y el manejo de sesión
    initialize() {
        google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: this.handleCredentialResponse.bind(this)
        });
        this.promptGoogleSignIn();
    }

    // Solicita el inicio de sesión si no hay una sesión activa
    promptGoogleSignIn() {
        if (!this.isSessionActive()) {
            google.accounts.id.prompt();
        } else {
            this.updateUIWithUserProfile();
        }
    }

    // Maneja la respuesta de credenciales de Google
    handleCredentialResponse(response) {
        const credential = response.credential;
        this.appManager.unencryptedDB.set('google_id_token', credential);
        const profile = this.appManager.unencryptedDB.parseJwt(credential);

        // Guardar el perfil de usuario en la DB
        this.appManager.unencryptedDB.set('user_profile', profile);
        this.updateUIWithUserProfile(profile);
        this.appManager.loadInitialView();
    }

    // Verifica si la sesión está activa
    isSessionActive() {
        const googleIdToken = this.appManager.unencryptedDB.get('google_id_token');
        return googleIdToken && this.appManager.unencryptedDB.isGtokenValid(googleIdToken);
    }

    // Actualiza la interfaz con la información del perfil del usuario
    updateUIWithUserProfile(profile = null) {
        if (!profile) {
            profile = this.appManager.unencryptedDB.get('user_profile');
        }

        document.getElementById('user-name').textContent = profile.name;
        document.getElementById('user-image').src = profile.picture;
        document.getElementById('user-image').style.filter = 'none';
        document.getElementById('user-image').alt = profile.email;
        document.getElementById('user-image').style.display = "block";
        document.getElementById('user-name').style.display = "block";
        document.getElementById('user-apps').style.display = "block";
        document.getElementById('user-help').style.display = "block";
        document.getElementById('user-settings').style.display = "block";
    }

    // Maneja la desconexión de la sesión
    logout() {
        this.appManager.clearAllData();
        this.promptGoogleSignIn();
    }
}
