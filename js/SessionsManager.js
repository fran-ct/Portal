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
            ux_mode: "popup",
            auto_prompt: false
        });

        this.checkSessionStatus()
            .then((isActive) => {
                if (!isActive) {
                    this.promptGoogleSignIn();
                } else {
                    this.updateUIWithUserProfile();
                }
            })
            .catch((error) => {
                console.error("Error during session check: ", error);
                this.promptGoogleSignIn();
            });
    }

    // Verifica el estado de la sesión
    async checkSessionStatus() {
        const googleAccessToken = this.appManager.unencryptedDB.get('google_access_token');
        if (googleAccessToken) {
            const isValid = await this.validateAccessToken(googleAccessToken);
            return isValid;
        }
        return false;
    }

    // Solicita el inicio de sesión si no hay una sesión activa
    promptGoogleSignIn() {
        if (this.authAttempted) return; // Evitar múltiples intentos
        this.authAttempted = true; // Marcar como que ya se intentó la autenticación

        google.accounts.id.prompt();
    }

    // Maneja la respuesta de credenciales de Google
    handleCredentialResponse(response) {
        const idToken = response.credential;
        this.appManager.unencryptedDB.set('google_id_token', idToken);

        // Decodificar el ID Token para obtener la información del usuario
        const profile = this.appManager.unencryptedDB.parseJwt(idToken);
        this.appManager.unencryptedDB.set('user_profile', profile);

        // Validar y guardar el ID Token
        if (this.validateIdToken(idToken)) {
            this.fetchAccessToken(idToken)
                .then(accessToken => {
                    this.appManager.unencryptedDB.set('google_access_token', accessToken);
                    this.updateUIWithUserProfile(profile);
                    this.appManager.loadInitialView();
                })
                .catch(error => {
                    console.error('Error fetching access token:', error);
                    alert('Failed to authenticate. Please try again.');
                    this.logout();
                });
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
        return data.access_token; // Aquí ya tendrás el Access Token
    }

    // Validación del ID Token
    validateIdToken(idToken) {
        const parsedToken = this.appManager.unencryptedDB.parseJwt(idToken);
        const currentTime = Math.floor(Date.now() / 1000);
        return parsedToken.exp > currentTime;
    }

    // Validación del Access Token
    async validateAccessToken(accessToken) {
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
    isSessionActive() {
        const googleAccessToken = this.appManager.unencryptedDB.get('google_access_token');
        return googleAccessToken && this.validateAccessToken(googleAccessToken);
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
        document.getElementById('apps').style.display = "block";
        document.getElementById('help').style.display = "block";
        document.getElementById('settings').style.display = "block";
    }

    // Maneja la desconexión de la sesión
    logout() {
        const confirmation = confirm("Are you sure you want to log out? All stored data will be erased.");

        if (confirmation) {
            this.appManager.clearAllData();

            this.appManager.loadView('signin', 'Sign In');

            this.promptGoogleSignIn();
        }
    }
}
