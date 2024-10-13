// signin.js
function initializeView() {
    google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID",
        callback: handleCredentialResponse
    });

    // Mostrar el One Tap Sign-In automáticamente
    google.accounts.id.prompt();

    // Lógica para manejar el ID token recibido de Google One Tap
    function handleCredentialResponse(response) {
        if (response.credential) {
            sessionManager.storeIdToken(response.credential);
            appManager.loadView('apps', 'Apps');
        } else {
            // Si el usuario cancela One Tap, mostramos un botón para el inicio de sesión tradicional
            document.getElementById('signInButton').style.display = 'block';
        }
    }

    // Botón de inicio de sesión tradicional si el One Tap no fue exitoso
    document.getElementById('signInButton').addEventListener('click', () => {
        sessionManager.login();
    });
}