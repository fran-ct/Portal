document.addEventListener('DOMContentLoaded', function() {
    const currentHash = window.location.hash.substring(1); // Elimina el '#' del hash
    if (currentHash) {
        loadView(currentHash, getAppNameById(currentHash));
    } else {
        loadView('apps', 'Apps');
    }
    const id_token = sessionStorage.getItem('id_token');
    if (!id_token) {
        document.getElementById('content').style.display = 'none';
    }
});

function getAppNameById(id) {
    const app = window.apps.find(app => app.id === id);
    return app ? app.name : 'Unknown';
}
