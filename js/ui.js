document.addEventListener('DOMContentLoaded', function() {
    const currentHash = window.location.hash.substring(1); // Elimina el '#' del hash
    if (currentHash) {
        loadView(currentHash, getAppNameById(currentHash));
    } else {
        var homeView = window.apps.filter(element => {
            return element.group == "home"
        })[0];
        loadView(homeView.id ,homeView.name);
    }
});

function getAppNameById(id) {
    const app = window.apps.find(app => app.id === id);
    return app ? app.name : 'Unknown';
}
