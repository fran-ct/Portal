var CLIENT_ID = "654333069607-8bb0ect8b87n5pdjkp1ptb463r15pb09.apps.googleusercontent.com"

document.addEventListener_temp('DOMContentLoaded', function() {
  gapi.load('auth2', function() {
      // Inicializa la librería de autenticación con tu client_id
      gapi.auth2.init({
          client_id: CLIENT_ID // Reemplaza 'TU_CLIENT_ID' con el verdadero client ID
      }).then(function(auth2) {
          if (auth2.isSignedIn.get()) {
              // Usuario ya está autenticado
              updateUIWithUser(auth2.currentUser.get().getBasicProfile());
          } else {
              // Usuario no está autenticado, mostrar solo el botón de ayuda
              showHelpOnly();
          }
      });
  });
});

function updateUIWithUser_temp(profile) {
  // Mostrar los elementos que dependen de la sesión activa
  document.querySelectorAll('.menu-item').forEach(el => el.style.display = 'block');
  document.getElementById('user-info').style.display = 'flex';

  // Actualizar la información del usuario
  document.getElementById('user-name').textContent = profile.getName();
  document.getElementById('user-image').src = profile.getImageUrl();

  // Aquí puedes también cargar la vista de bienvenida
  loadWelcomeView();
}

function showHelpOnly() {
  // Solo el botón de ayuda se mostrará
  document.querySelectorAll('.menu-item').forEach(el => el.style.display = 'none');
  document.getElementById('help').style.display = 'block';
  document.getElementById('user-info').style.display = 'none';
}

// Función para cargar la vista de bienvenida
function loadWelcomeView() {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = '<h2>Bienvenido a Worklog Manager</h2><p>Selecciona una opción del menú para comenzar.</p>';
}



document.addEventListener('DOMContentLoaded', function() {
  // Simula que el usuario está autenticado
  const simulatedProfile = {
      getName: () => 'John Doe',
      getImageUrl: () => 'images/default-avatar.png'
  };
  updateUIWithUser(simulatedProfile);
});

function updateUIWithUser(profile) {
  // Mostrar los elementos que dependen de la sesión activa
  document.querySelectorAll('.menu-item').forEach(el => el.style.display = 'block');
  document.getElementById('user-info').style.display = 'flex';

  // Actualizar la información del usuario
  document.getElementById('user-name').textContent = profile.getName();
  document.getElementById('user-image').src = profile.getImageUrl();

  // Aquí también puedes cargar la vista de bienvenida
  loadWelcomeView();
}
