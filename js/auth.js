var CLIENT_ID = "654333069607-t118hpn2v2ui383h9fcfpo0aspiv4tva.apps.googleusercontent.com"



function handleCredentialResponse(response) {
  console.log("[APP] Logged ;)");
  const credential = response.credential;
  const profile = parseJwt(credential);

  // Guardar el token en el almacenamiento local si es necesario
  sessionStorage.setItem('id_token', credential);

  // Enviar el ID token al backend para su validación
  fetch(BACKEND_URL+'/api/authenticate', {
    method: 'POST',
    mode: 'no-cors',
    redirect: "follow",
    headers: {
      'Content-Type': 'text/plain'
    },
    body: JSON.stringify({ token: credential })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Mostrar el contenido de la página si está autenticado
      const elements = document.getElementsByClassName("headerItem");
      Array.prototype.forEach.call(elements, (elem) => elem.style.display = 'block');

      // Cargar la vista principal
      loadView('apps', 'Apps');

      // Actualizar la interfaz con la información del usuario
      document.getElementById('user-name').textContent = profile.name;
      document.getElementById('user-image').src = profile.picture;
      document.getElementById('user-image').style.filter = 'none';
      document.getElementById('user-image').alt = profile.email;
    } else {
      console.error('Error en la autenticación del backend:', data.message);
    }
  })
  .catch(error => console.error('Error al comunicar con el backend:', error));
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = decodeURIComponent(atob(base64Url).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(base64);
}

google.accounts.id.initialize({
  client_id: CLIENT_ID,
  callback: handleCredentialResponse
});
google.accounts.id.prompt();
