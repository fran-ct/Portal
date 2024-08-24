console.log("Ver: 2.2")

class AppManager {
    constructor(encryptionKey) {
        this.encryptionKey = encryptionKey;
        this.encryptedDB = new StorageDB(encryptionKey);
        this.unencryptedDB = new StorageDB();
        this.sessionManager = new SessionManager(this);
        this.isLoading = false;
    }

    async initializeApp() {
        this.sessionManager.initialize();
        this.handleHashChange();

        // Verificar la autenticación
        await this.sessionManager.checkAndPromptAuth();
    }

    loadInitialView() {
        if (!this.sessionManager.isSessionActive()) {
            this.loadView('signin', 'Sign In');
        } else {
            this.loadView('apps', 'Apps');
        }
    }

    async performAuthenticatedOperation(operation) {
        await this.sessionManager.checkAndPromptAuth();
        const accessToken = await this.sessionManager.getAccessToken();
        if (accessToken) {
            return operation(accessToken);
        } else {
            console.error('Failed to get access token');
            return null;
        }
    }

    async fetchCalendarEvents(calendarId, timeMin, timeMax) {
        return this.performAuthenticatedOperation(async (accessToken) => {
            const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch calendar events');
            }
            return response.json();
        });
    }

    async createCalendarEvent(calendarId, event) {
        return this.performAuthenticatedOperation(async (accessToken) => {
            const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });
            if (!response.ok) {
                throw new Error('Failed to create calendar event');
            }
            return response.json();
        });
    }
}
