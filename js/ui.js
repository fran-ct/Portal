document.addEventListener('DOMContentLoaded', function() {
    // Asignar eventos a los íconos del menú
    document.getElementById('apps').addEventListener('click', loadAppsView);
    document.getElementById('settings').addEventListener('click', loadSettingsView);
    document.getElementById('help').addEventListener('click', loadHelpView);
});

function loadWelcomeView() {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<h2>Bienvenido a Worklog Manager</h2><p>Selecciona una opción del menú para comenzar.</p>';
}

function loadAppsView() {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<h2>Vista de Aplicaciones</h2><p>Aquí se gestionan las aplicaciones y herramientas integradas.</p>';
}

function loadSettingsView() {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<h2>Vista de Configuración</h2><p>Aquí puedes ajustar las configuraciones de la aplicación.</p>';
}

function loadHelpView() {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<h2>Vista de Ayuda</h2><p>Aquí encontrarás ayuda y documentación sobre cómo usar la aplicación.</p>';
}
