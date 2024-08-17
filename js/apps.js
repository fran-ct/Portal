// Definimos las aplicaciones disponibles en Portal
const apps = [
    {
        id: 'worklog-manager',
        name: 'Worklog Manager',
        description: 'Gestiona tus worklogs',
        loadView: loadWorklogManagerView
    },
    {
        id: 'settings',
        name: 'Configuración',
        description: 'Ajusta las configuraciones de Portal',
        loadView: loadSettingsView
    },
    {
        id: 'help',
        name: 'Ayuda',
        description: 'Encuentra ayuda y documentación',
        loadView: loadHelpView
    }
];

// Función para renderizar la vista de aplicaciones
function loadAppsView() {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<h2>Aplicaciones Disponibles</h2><div id="app-list"></div>';

    const appListDiv = document.getElementById('app-list');
    apps.forEach(app => {
        const appDiv = document.createElement('div');
        appDiv.className = 'app-item';
        appDiv.innerHTML = `<h3>${app.name}</h3><p>${app.description}</p>`;
        appDiv.addEventListener('click', app.loadView);
        appListDiv.appendChild(appDiv);
    });
}
