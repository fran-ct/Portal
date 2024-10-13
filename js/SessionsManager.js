class SessionManager {
    constructor(appManager) {
        this.appManager = appManager;

        const oidcSettings = {
            authority: "https://accounts.google.com",
            client_id: CLIENT_ID,
            redirect_uri: window.location.origin + "/Portal/auth/callback.html",
            response_type: "code",
            scope: "openid profile email",
            loadUserInfo: true,
            post_logout_redirect_uri: window.location.origin + "/Portal",
            automaticSilentRenew: true,
            silent_redirect_uri: window.location.origin + "/Portal/auth/silent-renew.html",
            userStore: new Oidc.WebStorageStateStore({ store: window.sessionStorage }) 
        };
        
        this.userManager = new Oidc.UserManager(oidcSettings);
    }

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

    // Manejar almacenamiento del token de One Tap
    storeIdToken(idToken) {
        this.appManager.unencryptedDB.set('google_id_token', idToken);
        this.updateUIWithUserProfile();
    }

    // Iniciar sesión con OIDC
    login() {
        this.userManager.signinRedirect();
    }

    // Almacena los datos del usuario
    storeUser(user) {
        this.appManager.encryptedDB.set('google_user', user);
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

    // Logout
    logout() {
        this.userManager.signoutRedirect();
    }
}

window.sessionManager = new SessionManager(appManager);