function loadWorklogManagerView() {
    fetch('views/worklogManager/worklogManager.html')
        .then(response => response.text())
        .then(html => {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = html;
        })
        .catch(error => {
            console.error('Error al cargar la vista de Worklog Manager:', error);
        });
}


function loadSettingsView() {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<h2>Configuración</h2><p>Aquí puedes ajustar las configuraciones de Portal.</p>';
    history.pushState(null, '', '#settings');
}

function loadHelpView() {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<h2>Ayuda</h2><p>Aquí encontrarás ayuda y documentación sobre cómo usar Portal.</p>';
    history.pushState(null, '', '#help');
}
