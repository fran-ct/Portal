document.addEventListener('DOMContentLoaded', async () => {
    const encryptionKey = 'my-global-secret-key';
    window.appManager = new AppManager(encryptionKey);
    window.sessionManager = new SessionManager(appManager);

    await sessionManager.initialize();

    if (!await sessionManager.isSessionActive()) {
        sessionManager.login();
    } else {
        appManager.loadInitialView();
    }

    // Precargar vistas más utilizadas
    appManager.preLoadViews(['apps', 'signin', 'settings']);

    const currentHash = window.location.hash.substring(1);
    if (currentHash) {
        const viewTitle = appManager.getAppNameById(currentHash);
        appManager.loadView(currentHash, viewTitle);
    } else {
        appManager.loadInitialView();
    }

    // Manejar clicks en botones del menú principal
    document.getElementById('apps').addEventListener('click', () => {
        appManager.loadView('apps', 'Apps');
    });

    document.getElementById('settings').addEventListener('click', () => {
        appManager.loadView('settings', 'Settings');
    });

    document.getElementById('help').addEventListener('click', () => {
        appManager.loadView('help', 'Help');
    });
});
