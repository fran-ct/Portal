var CLIENT_ID = "654333069607-t118hpn2v2ui383h9fcfpo0aspiv4tva.apps.googleusercontent.com"

function initializeView() {



    
    google.accounts.id.renderButton(
        document.getElementById("signInButton"),
        { theme: "outline", size: "large", text:"signin",shape:"pill" }  // customization attributes
    );



}

function handleCredentialResponse(response) {
    console.log("[APP] Logged ;)")
    const credential = response.credential;
    const profile = parseJwt(credential);

    // Guardar el token en el almacenamiento local si es necesario
    sessionStorage.setItem('id_token', credential);

    // Mostrar el contenido de la página si está autenticado
    // Obtener todos los elementos con la clase 'headerItem'

    const elements = document.getElementsByClassName("headerItem");
    Array.prototype.forEach.call(elements, (elem) => elem.style.display = 'block');
    
    // Cargar la vista principal
    loadView('apps', 'Apps');

    // Actualizar la interfaz con la información del usuario
    document.getElementById('user-name').textContent = profile.name;
    document.getElementById('user-image').src = profile.picture;
    document.getElementById('user-image').alt = profile.email;
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = decodeURIComponent(atob(base64Url).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(base64);
}