class SessionManager {
    constructor(appManager) {
        this.appManager = appManager;
        this.authAttempted = false; // Para rastrear si se intentó la autenticación
    }

    // Inicializa la autenticación con Google y el manejo de sesión
    initialize() {
        google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: this.handleCredentialResponse.bind(this),
            scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets',
            auto_select: true,
            ux_mode: "popup",
            context: "signin",
            cancel_on_tap_outside: true,
            prompt_parent_id: "signInButtonContainer",
            auto_prompt: false
        });
        this.promptGoogleSignIn();
    }

    // Solicita el inicio de sesión si no hay una sesión activa
    promptGoogleSignIn() {
        if (this.authAttempted) return; // Evitar múltiples intentos
        this.authAttempted = true; // Marcar como que ya se intentó la autenticación

        if (!this.isSessionActive()) {
            google.accounts.id.prompt();
        } else {
            this.updateUIWithUserProfile();
        }
    }

    // Maneja la respuesta de credenciales de Google
    async handleCredentialResponse(response) {
        const idToken = response.credential;
        this.appManager.unencryptedDB.set('google_id_token', idToken);

        const profile = this.appManager.unencryptedDB.parseJwt(idToken);
        this.appManager.unencryptedDB.set('user_profile', profile);

        if (this.validateIdToken(idToken)) {
            try {
                const accessToken = await this.fetchAccessToken(idToken);
                if (accessToken) {
                    this.appManager.unencryptedDB.set('google_access_token', accessToken);
                    this.updateUIWithUserProfile(profile);
                    this.appManager.loadInitialView();
                } else {
                    throw new Error("Access token is null or undefined.");
                }
            } catch (error) {
                console.error('Error fetching access token:', error);
                alert('Failed to authenticate. Please try again.');
                this.logout();
            }
        } else {
            alert('ID Token is invalid or expired. Please sign in again.');
            this.logout();
        }
    }


    // Método para obtener el Access Token usando OAuth2
    async fetchAccessToken(idToken) {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (!response.ok) {
            throw new Error('Failed to fetch access token');
        }
        const data = await response.json();
        return data.access_token || null; // Aquí ya tendrás el Access Token
    }

    // Validación del ID Token
    validateIdToken(idToken) {
        const parsedToken = this.appManager.unencryptedDB.parseJwt(idToken);
        const currentTime = Math.floor(Date.now() / 1000);
        return parsedToken && parsedToken.exp > currentTime;
    }

    // Validación del Access Token
    async validateAccessToken(accessToken) {
        if (!accessToken) return false;

        try {
            const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
            const data = await response.json();
            return data && data.expires_in > 0; // Verifica si el token sigue siendo válido
        } catch (error) {
            console.error('Failed to validate access token:', error);
            return false;
        }
    }

    // Verifica si la sesión está activa
    async isSessionActive() {
        const googleAccessToken = this.appManager.unencryptedDB.get('google_access_token');
        return googleAccessToken && await this.validateAccessToken(googleAccessToken);
    }

    // Actualiza la interfaz con la información del perfil del usuario
    updateUIWithUserProfile(profile = null) {
        if (!profile) {
            profile = this.appManager.unencryptedDB.get('user_profile');
        }
        if (profile) {
            document.getElementById('user-name').textContent = profile.name;
            document.getElementById('user-image').src = profile.picture;
            document.getElementById('user-image').style.filter = 'none';
            document.getElementById('user-image').alt = profile.email;
            document.getElementById('user-image').style.display = "block";
            document.getElementById('user-name').style.display = "block";
            document.getElementById('apps').style.display = "block";
            document.getElementById('help').style.display = "block";
            document.getElementById('settings').style.display = "block";
        }

    }

    // Maneja la desconexión de la sesión
    logout() {
        const confirmation = confirm("Are you sure you want to log out? All stored data will be erased.");

        if (confirmation) {
            // this.appManager.clearAllData();
            this.appManager.loadView('signin', 'Sign In');
            this.promptGoogleSignIn();
        }
    }
}
