function initializeView() {
    const jiraTokenInput = document.getElementById('jira-token-input');
    const saveJiraTokenBtn = document.getElementById('save-jira-token-btn');
    const deleteJiraTokenBtn = document.getElementById('delete-jira-token-btn');
    const toggleJiraTokenVisibility = document.getElementById('toggle-jira-token-visibility');
    const jiraTokenStatus = document.getElementById('jira-token-status');
    const logoutBtn = document.getElementById('logout-btn');
    const clearDataBtn = document.getElementById('clear-data-btn');

    const encryptionKey = 'my-global-secret-key';
    const appManager = new AppManager(encryptionKey);

    // Verificar si el usuario está autenticado
    const idToken = appManager.unencryptedDB.get('google_id_token');
    if (!idToken) {
        alert('You must be logged in to manage tokens.');
        appManager.loadView('signin', 'Sign In');
        return;
    }

    // Mostrar el estado del token de Jira
    if (appManager.encryptedDB.get('jira_token')) {
        jiraTokenStatus.textContent = 'Token stored';
        jiraTokenStatus.style.color = 'green';
    } else {
        jiraTokenStatus.textContent = 'No token stored';
        jiraTokenStatus.style.color = 'red';
    }

    // Guardar el token de Jira
    saveJiraTokenBtn.addEventListener('click', () => {
        const token = jiraTokenInput.value;
        appManager.encryptedDB.set('jira_token', token);
        jiraTokenStatus.textContent = 'Token stored';
        jiraTokenStatus.style.color = 'green';
        alert('Jira token saved successfully.');
    });

    // Eliminar el token de Jira
    deleteJiraTokenBtn.addEventListener('click', () => {
        appManager.encryptedDB.remove('jira_token');
        jiraTokenStatus.textContent = 'No token stored';
        jiraTokenStatus.style.color = 'red';
        alert('Jira token deleted successfully.');
    });

    // Cerrar sesión
    logoutBtn.addEventListener('click', () => {
       appManager.sessionManager.logout();
    });

    // Limpiar todos los datos locales
    clearDataBtn.addEventListener('click', () => {
        appManager.clearAllData();
        alert('All data cleared.');
    });

    // Alternar la visibilidad del token de Jira
    toggleJiraTokenVisibility.addEventListener('click', () => {
        if (jiraTokenInput.type === 'password') {
            jiraTokenInput.type = 'text';
            toggleJiraTokenVisibility.textContent = 'Hide';
        } else {
            jiraTokenInput.type = 'password';
            toggleJiraTokenVisibility.textContent = 'Show';
        }
    });
}
