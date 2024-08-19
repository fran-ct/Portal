function loadView(viewName, viewTitle) {
    // Remover el CSS y JS anteriores
    const oldLink = document.querySelector('link[data-view-style]');
    if (oldLink) {
        document.head.removeChild(oldLink);
    }

    const oldScripts = document.querySelectorAll('script[data-view-script]');
    oldScripts.forEach(script => script.remove());

    // Cargar el nuevo HTML
    fetch(`views/${viewName}/${viewName}.html`)
        .then(response => response.text())
        .then(html => {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = html;

            // Cargar el CSS específico de la vista
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `views/${viewName}/${viewName}.css`;
            link.setAttribute('data-view-style', '');
            document.head.appendChild(link);

            // Cargar el JS específico de la vista
            const script = document.createElement('script');
            script.src = `views/${viewName}/${viewName}.js`;
            script.defer = true;
            script.setAttribute('data-view-script', '');
            script.onload = function() {
                if (typeof initializeView === 'function') {
                    initializeView();
                }
            };
            document.body.appendChild(script);

            // Si estamos en la vista de Apps, cargamos appList.js
            if (viewName === 'apps') {
                const appListScript = document.createElement('script');
                appListScript.src = 'js/appList.js';
                appListScript.defer = true;
                appListScript.setAttribute('data-view-script', '');
                document.body.appendChild(appListScript);
            }

            // Actualizar el título de la página
            document.title = viewTitle;
        })
        .catch(error => {
            console.error('Error al cargar la vista:', error);
        });
}
