function loadView(viewName, viewTitle) {
    const oldLink = document.querySelector('link[data-view-style]');
    if (oldLink) {
        document.head.removeChild(oldLink);
    }

    const oldScripts = document.querySelectorAll('script[data-view-script]');
    oldScripts.forEach(script => script.remove());

    fetch(`views/${viewName}/${viewName}.html`)
        .then(response => response.text())
        .then(html => {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = html;

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `views/${viewName}/${viewName}.css`;
            link.setAttribute('data-view-style', '');
            document.head.appendChild(link);

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

            document.title = viewTitle;
        })
        .catch(error => {
            console.error('Error al cargar la vista:', error);
        });
}
