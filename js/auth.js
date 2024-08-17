document.addEventListener('DOMContentLoaded', function() {
  // Verificar si ya existe una sesión activa
  gapi.load('auth2', function() {
      gapi.auth2.init().then(function(auth2) {
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

function updateUIWithUser(profile) {
  // Mostrar los elementos que dependen de la sesión activa
  document.querySelectorAll('.menu-item').forEach(el => el.style.display = 'block');
  document.getElementById('user-info').style.display = 'flex';

  // Actualizar la información del usuario
  document.getElementById('user-name').textContent = profile.getName();
  document.getElementById('user-image').src = profile.getImageUrl();
}

function showHelpOnly() {
  // Solo el botón de ayuda se mostrará
  document.querySelectorAll('.menu-item').forEach(el => el.style.display = 'none');
  document.getElementById('help').style.display = 'block';
  document.getElementById('user-info').style.display = 'none';
}

// Función para iniciar sesión cuando el usuario lo decida
function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  updateUIWithUser(profile);
  // Aquí también puedes cargar la vista de bienvenida
}
