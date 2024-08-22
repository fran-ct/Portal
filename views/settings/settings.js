function initializeView() {
        const appManager = new AppManager('my-global-secret-key');
        const tokenInput = document.getElementById('token');
        const saveButton = document.getElementById('token-btn');
    
        function checkStoredToken() {
            const jiraToken = appManager.encryptedDB.get('jira_token');
            if (jiraToken) {
                tokenInput.value = jiraToken;
                tokenInput.disabled = true;
                saveButton.textContent = 'Token Saved';
                saveButton.disabled = true;
                document.getElementById('token-status').textContent = '✔️ Token stored';
            } else {
                document.getElementById('token-status').textContent = '❌ No token found';
            }
        }
    
        saveButton.addEventListener('click', function() {
            const token = tokenInput.value;
            if (token) {
                appManager.encryptedDB.set('jira_token', token);
                checkStoredToken();
            }
        });
    
        checkStoredToken();
}
    