function initializeView() {
  const appListContainer = document.getElementById('apps-list');
  const apps = window.apps.filter(app => app.group !== 'system');

  apps.forEach(app => {
      const appItem = document.createElement('div');
      appItem.className = 'app-item';
      appItem.onclick = () => {
          appManager.loadView(app.id, app.name);
      };

      const appTitle = document.createElement('h3');
      appTitle.textContent = app.name;

      const appDescription = document.createElement('p');
      appDescription.textContent = app.comment;

      appItem.appendChild(appTitle);
      appItem.appendChild(appDescription);
      appListContainer.appendChild(appItem);
  });
}
