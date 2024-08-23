function initializeView() {
    const googleIdToken = appManager.unencryptedDB.get('google_id_token');
    const googleAccessToken = appManager.unencryptedDB.get('google_access_token');

    if (googleIdToken && appManager.unencryptedDB.isGtokenValid(googleIdToken) &&
        googleAccessToken && appManager.sessionManager.validateAccessToken(googleAccessToken)) {

        const profile = appManager.unencryptedDB.get('user_profile');

        // Mostrar mensaje de que ya está autenticado
        document.getElementById('signInMessage').textContent = `You are already signed in as ${profile.name}.`;

        // Calcular y mostrar la fecha de expiración del token en la consola
        const decodedToken = appManager.unencryptedDB.parseJwt(googleIdToken);
        const expirationDate = new Date(decodedToken.exp * 1000);
        console.log(`Token expires at: ${expirationDate}`);

        // Ocultar el botón de iniciar sesión
        document.getElementById('signInButton').style.display = 'none';
    } else {
        // Renderizar el botón de Google Sign-In si no está autenticado
        google.accounts.id.renderButton(
            document.getElementById("signInButton"),
            { theme: "outline", size: "large", text: "signin", shape: "pill" }
        );

        // Opcional: puedes solicitar el inicio de sesión automático si es necesario
        google.accounts.id.prompt(); // Solo si deseas solicitar automáticamente el inicio de sesión
    }
}
