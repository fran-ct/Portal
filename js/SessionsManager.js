class SessionManager {
    constructor(appManager) {
        this.appManager = appManager;
        this.authAttempted = false;
        this.codeVerifier = null;
    }

    initialize() {
        google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: this.handleCredentialResponse.bind(this),
            auto_select: false,
            ux_mode: "popup",
            context: "signin",
        });
    }

    async checkAndPromptAuth() {
        if (await this.isSessionActive()) {
            console.log("Session is active");
        } else {
            this.promptGoogleSignIn();
        }
    }

    async handleCredentialResponse(response) {
        try {
            const idToken = response.credential;
            this.storeIdToken(idToken);

            // Generar el code verifier para PKCE
            this.codeVerifier = this.generateCodeVerifier();
            const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);

            // Redirigir al usuario para obtener el authorization code
            this.redirectToAuthEndpoint(codeChallenge);

        } catch (error) {
            console.error('Error handling credential response:', error);
            alert('Failed to authenticate. Please try again.');
        }
    }

    storeIdToken(idToken) {
        this.appManager.encryptedDB.set('google_id_token', idToken);
    }

    storeAccessToken(accessToken) {
        this.appManager.encryptedDB.set('google_access_token', accessToken);
        const expirationTime = Date.now() + 3600000; // Current time + 1 hour in milliseconds
        this.appManager.encryptedDB.set('token_expiration', expirationTime.toString());
    }

    async fetchAccessToken(authorizationCode) {
        try {
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: CLIENT_ID,
                    code: authorizationCode,
                    redirect_uri: window.location.origin, // Asegúrate de que esta sea la misma URI registrada en la consola de Google
                    grant_type: 'authorization_code',
                    code_verifier: this.codeVerifier
                })
            });
            const data = await response.json();
            return data.access_token || null;
        } catch (error) {
            console.error('Error fetching access token:', error);
            return null;
        }
    }

    async isSessionActive() {
        const expirationTime = parseInt(this.appManager.encryptedDB.get('token_expiration') || '0', 10);
        if (Date.now() < expirationTime) {
            const accessToken = this.appManager.encryptedDB.get('google_access_token');
            return !!accessToken && await this.validateAccessToken(accessToken);
        }
        return false;
    }

    async validateAccessToken(accessToken) {
        try {
            const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
            const data = await response.json();
            return !!data && data.expires_in > 0;
        } catch (error) {
            console.error('Failed to validate access token:', error);
            return false;
        }
    }

    async getAccessToken() {
        if (await this.isSessionActive()) {
            return this.appManager.encryptedDB.get('google_access_token');
        }
        await this.checkAndPromptAuth();
        return null;
    }

    getIdToken() {
        return this.appManager.encryptedDB.get('google_id_token');
    }

    clearTokens() {
        this.appManager.encryptedDB.remove('google_id_token');
        this.appManager.encryptedDB.remove('google_access_token');
        this.appManager.encryptedDB.remove('token_expiration');
    }

    logout() {
        const confirmation = confirm("Are you sure you want to log out? You will need to re-authenticate.");
        if (confirmation) {
            this.clearTokens();
            this.appManager.loadView('signin', 'Sign In');
        }
    }

    updateUIWithUserProfile() {
        const idToken = this.getIdToken();
        if (idToken) {
            const profile = this.appManager.encryptedDB.parseJwt(idToken);
            if (profile) {
                document.getElementById('user-name').textContent = profile.name;
                document.getElementById('user-image').src = profile.picture;
                document.getElementById('user-image').style.display = "block";
                document.getElementById('user-name').style.display = "block";
            }
        }
    }

    generateCodeVerifier() {
        const array = new Uint32Array(56 / 2);
        window.crypto.getRandomValues(array);
        return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
    }

    async generateCodeChallenge(codeVerifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    redirectToAuthEndpoint(codeChallenge) {
        const authorizationEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
        const redirectUri = window.location.origin; // URI de redirección
        const scope = 'openid profile email'; // Ajusta los scopes según tus necesidades

        const authUrl = `${authorizationEndpoint}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

        window.location.href = authUrl;
    }
}
