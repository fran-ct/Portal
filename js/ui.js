document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('apps').addEventListener('click', function() {
        loadAppsView();
        history.pushState(null, '', '#apps');
    });
    document.getElementById('settings').addEventListener('click', function() {
        loadSettingsView();
        history.pushState(null, '', '#settings');
    });
    document.getElementById('help').addEventListener('click', function() {
        loadHelpView();
        history.pushState(null, '', '#help');
    });

    // Cargar la vista correcta al cargar la página
    const currentHash = window.location.hash;
    if (currentHash === '#apps' || currentHash === '') {
        loadAppsView(); // Cargar la pantalla de aplicaciones por defecto
    } else if (currentHash === '#settings') {
        loadSettingsView();
    } else if (currentHash === '#help') {
        loadHelpView();
    } else if (currentHash === '#worklog-manager') {
        loadWorklogManagerView();
    } else {
        loadAppsView();
    }
});

