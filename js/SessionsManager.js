class SessionManager {
    constructor(appManager) {
        this.appManager = appManager;

        const winLocationOrigin = window.location.origin + "/Portal";

        const oidcSettings = {
            authority: "https://accounts.google.com",
            client_id: CLIENT_ID,
            redirect_uri: winLocationOrigin + "/auth/callback.html",  // Usa la URI que hemos logueado
            response_type: "code",  // Usar Authorization Code Flow para obtener access_token
            scope: "openid profile email",  // Scopes que deseas solicitar
            loadUserInfo: true,
            post_logout_redirect_uri: winLocationOrigin,
            automaticSilentRenew: true,
            silent_redirect_uri: winLocationOrigin + "/auth/silent-renew.html"
        };

        this.userManager = new Oidc.UserManager(oidcSettings);


    }

    // Método para inicializar la autenticación
    async initialize() {
        try {
            const user = await this.userManager.getUser();
            if (user) {
                console.log("User is logged in", user);
                this.storeUser(user);
                this.updateUIWithUserProfile();
            } else {
                console.log("User is not logged in");
            }
        } catch (error) {
            console.error("Error during initialization", error);
        }
    }

    // Iniciar sesión
    login() {
        this.userManager.signinRedirect();
    }

    // Manejar el callback después de la autenticación
    async handleCallback() {
        try {
            const user = await this.userManager.signinRedirectCallback();
            this.storeUser(user);
            window.location.href = "/";
        } catch (error) {
            console.error("Error handling callback", error);
        }
    }

    // Logout
    logout() {
        this.userManager.signoutRedirect();
    }

    // Almacena los datos del usuario
    storeUser(user) {
        this.appManager.encryptedDB.set('google_user', user);
    }

    // Recupera el ID token almacenado
    getIdToken() {
        const user = this.appManager.encryptedDB.get('google_user');
        return user ? user.id_token : null;
    }

    // Recupera el access token almacenado
    getAccessToken() {
        const user = this.appManager.encryptedDB.get('google_user');
        return user ? user.access_token : null;
    }

    // Actualiza la UI con la información del perfil del usuario
    updateUIWithUserProfile() {
        const user = this.appManager.encryptedDB.get('google_user');
        if (user) {
            const profile = user.profile;
            document.getElementById('user-name').textContent = profile.name;
            document.getElementById('user-image').src = profile.picture;
            document.getElementById('user-image').style.display = "block";
            document.getElementById('user-name').style.display = "block";
        }
    }

    // Verifica si la sesión está activa
    async isSessionActive() {
        const user = await this.userManager.getUser();
        return !!user && !user.expired;
    }

    // Maneja la renovación silenciosa del token
    handleSilentRenew() {
        this.userManager.signinSilentCallback().then(() => {
            console.log("Silent renew successful");
        }).catch(error => {
            console.error("Error during silent renew", error);
        });
    }
}
