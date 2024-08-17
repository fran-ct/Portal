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

    const currentHash = window.location.hash;
    if (currentHash === '#apps' || currentHash === '') {
        loadAppsView();
    } else if (currentHash === '#settings') {
        loadSettingsView();
    } else if (currentHash === '#help') {
        loadHelpView();
    } else {
        loadAppsView();
    }
});

function loadSettingsView() {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<h2>Configuración</h2><p>Aquí puedes ajustar las configuraciones de Portal.</p>';
}

function loadHelpView() {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<h2>Ayuda</h2><p>Aquí encontrarás ayuda y documentación sobre cómo usar Portal.</p>';
}
