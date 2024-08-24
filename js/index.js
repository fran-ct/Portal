document.addEventListener('DOMContentLoaded', async () => {
    const encryptionKey = 'my-global-secret-key';
    window.appManager = new AppManager(encryptionKey);

    await appManager.initializeApp();

    
    // Precargar vistas más utilizadas
    appManager.preLoadViews(['apps']);

    
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

