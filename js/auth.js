var CLIENT_ID = "654333069607-8bb0ect8b87n5pdjkp1ptb463r15pb09.apps.googleusercontent.com"

document.addEventListener('DOMContentLoaded', function() {
  gapi.load('auth2', function() {
      gapi.auth2.init({
          client_id: CLIENT_ID // Reemplaza 'TU_CLIENT_ID' con el verdadero client ID
      }).then(function(auth2) {
          if (auth2.isSignedIn.get()) {
              updateUIWithUser(auth2.currentUser.get().getBasicProfile());
          } else {
              showHelpOnly();
          }
      });
  });
});

function updateUIWithUser(profile) {
  // Mostrar los elementos que dependen de la sesión activa
  document.querySelectorAll('.menu-item').forEach(el => el.style.display = 'block');
  document.getElementById('user-info').style.display = 'flex';

  // Actualizar la información del usuario
  document.getElementById('user-name').textContent = profile.getName();
  document.getElementById('user-image').src = profile.getImageUrl();

  // Cargar la vista de bienvenida por defecto
  loadWelcomeView();
}

function showHelpOnly() {
  // Solo el botón de ayuda se mostrará
  document.querySelectorAll('.menu-item').forEach(el => el.style.display = 'none');
  document.getElementById('help').style.display = 'block';
  document.getElementById('user-info').style.display = 'none';
}
