var CLIENT_ID = "654333069607-8bb0ect8b87n5pdjkp1ptb463r15pb09.apps.googleusercontent.com"


function handleCredentialResponse(response) {
  const credential = response.credential;
  const profile = parseJwt(credential);

  // Guardar el token en el almacenamiento local si es necesario
  sessionStorage.setItem('id_token', credential);

  // Mostrar el contenido de la página si está autenticado
  document.getElementById('auth-controls').style.display = 'none';
  document.getElementById('content').style.display = 'block';

  // Cargar la vista principal
  loadView('apps', 'Apps');

  // Actualizar la interfaz con la información del usuario
  document.getElementById('user-name').textContent = profile.name;
  document.getElementById('user-image').src = profile.picture;
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = decodeURIComponent(atob(base64Url).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(base64);
}
