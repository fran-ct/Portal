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
            scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets'
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
    handleCredentialResponse(response) {
        const credential = response.credential;
        this.appManager.unencryptedDB.set('google_id_token', credential);
        
        // Decodificar el ID Token para obtener la información del usuario
        const profile = this.appManager.unencryptedDB.parseJwt(credential);

        // Guardar el perfil de usuario en la DB
        this.appManager.unencryptedDB.set('user_profile', profile);

        // Aquí es donde necesitas obtener el Access Token
        this.fetchAccessToken(credential)
            .then(accessToken => {
                this.appManager.unencryptedDB.set('google_access_token', accessToken);
                this.updateUIWithUserProfile(profile);
                this.appManager.loadInitialView();
            })
            .catch(error => {
                console.error('Error fetching access token:', error);
                alert('Failed to authenticate. Please try again.');
                this.logout(); // O manejar el error de otra forma
            });
    }

    // Método para obtener el Access Token usando OAuth2
    async fetchAccessToken(idToken) {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET, // Necesitarás el client secret de tu proyecto en GCP
                'grant_type': 'authorization_code',
                'code': idToken, // Es posible que necesites ajustar esto según tu flujo de autenticación
                'redirect_uri': REDIRECT_URI
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch access token');
        }

        const data = await response.json();
        return data.access_token;
    }

    // Verifica si la sesión está activa
    isSessionActive() {
        const googleAccessToken = this.appManager.unencryptedDB.get('google_access_token');
        return googleAccessToken && this.appManager.unencryptedDB.isGtokenValid(googleAccessToken);
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
