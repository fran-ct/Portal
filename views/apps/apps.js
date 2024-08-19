function initializeView() {
  console.log('Apps view loaded');
  loadApps();  // Cargar las aplicaciones disponibles
}

function loadApps() {
  const appsList = document.getElementById('apps-list');
  
  if (!appsList) {
      console.error('Elemento apps-list no encontrado');
      return;
  }

  appsList.innerHTML = ''; // Limpia la lista de apps

  window.apps.forEach(app => {
    if(app.group!='home'){

      const appItem = document.createElement('div');
      appItem.className = 'app-item';
      appItem.innerHTML = `<h3>${app.name}</h3><p>${app.comment}</p>`;
      
      appItem.addEventListener('click', () => {
        loadView(app.id, app.name);
        history.pushState(null, '', `#${app.id}`);
      });
      
      appsList.appendChild(appItem);
    }
  });
}
