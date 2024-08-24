class SessionManager {
    constructor(appManager) {
        this.appManager = appManager;
        this.authAttempted = false;
    }

    initialize() {
        google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: this.handleCredentialResponse.bind(this),
            scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets',
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

    promptGoogleSignIn() {
        if (this.authAttempted) return;
        this.authAttempted = true;
        google.accounts.id.prompt();
    }

    async handleCredentialResponse(response) {
        try {
            const idToken = response.credential;
            await this.validateAndStoreTokens(idToken);
            this.updateUIWithUserProfile();
            this.appManager.loadInitialView();
        } catch (error) {
            console.error('Error handling credential response:', error);
            alert('Failed to authenticate. Please try again.');
        }
    }

    async validateAndStoreTokens(idToken) {
        if (this.validateIdToken(idToken)) {
            const accessToken = await this.fetchAccessToken(idToken);
            if (accessToken) {
                this.storeTokens(idToken, accessToken);
            } else {
                throw new Error("Failed to fetch access token");
            }
        } else {
            throw new Error("Invalid ID token");
        }
    }

    storeTokens(idToken, accessToken) {
        this.appManager.encryptedDB.set('google_id_token', idToken);
        this.appManager.encryptedDB.set('google_access_token', accessToken);
        const expirationTime = Date.now() + 3600000; // Current time + 1 hour in milliseconds
        this.appManager.encryptedDB.set('token_expiration', expirationTime.toString());
    }

    async fetchAccessToken(idToken) {
        try {
            const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
            if (!response.ok) {
                throw new Error('Failed to fetch access token');
            }
            const data = await response.json();
            return data.access_token || null;
        } catch (error) {
            console.error('Error fetching access token:', error);
            return null;
        }
    }

    validateIdToken(idToken) {
        const parsedToken = this.appManager.encryptedDB.parseJwt(idToken);
        const currentTime = Math.floor(Date.now() / 1000);
        return parsedToken && parsedToken.exp > currentTime;
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

    logout() {
        const confirmation = confirm("Are you sure you want to log out? You will need to re-authenticate.");
        if (confirmation) {
            this.clearTokens();
            this.appManager.loadView('signin', 'Sign In');
        }
    }

    clearTokens() {
        this.appManager.encryptedDB.remove('google_id_token');
        this.appManager.encryptedDB.remove('google_access_token');
        this.appManager.encryptedDB.remove('token_expiration');
    }

    updateUIWithUserProfile() {
        const idToken = this.appManager.encryptedDB.get('google_id_token');
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
}