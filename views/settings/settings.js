function initializeView() {
    const jiraTokenInput = document.getElementById('jira-token-input');
    const saveJiraTokenBtn = document.getElementById('save-jira-token-btn');
    const deleteJiraTokenBtn = document.getElementById('delete-jira-token-btn');
    const toggleJiraTokenVisibility = document.getElementById('toggle-jira-token-visibility');
    const jiraTokenStatus = document.getElementById('jira-token-status');

    const encryptionKey = 'my-global-secret-key';
    const appManager = new AppManager(encryptionKey);

    // Function to update the UI based on token status
    function updateTokenStatus() {
        const jiraToken = appManager.encryptedDB.get('jira_token');

        if (jiraToken) {
            jiraTokenStatus.textContent = 'Token stored.';
            jiraTokenStatus.style.color = 'green';
            jiraTokenInput.value = jiraToken;
        } else {
            jiraTokenStatus.textContent = 'No token stored.';
            jiraTokenStatus.style.color = 'red';
            jiraTokenInput.value = '';
        }
    }

    // Toggle visibility of the Jira token input
    toggleJiraTokenVisibility.addEventListener('click', () => {
        const type = jiraTokenInput.getAttribute('type') === 'password' ? 'text' : 'password';
        jiraTokenInput.setAttribute('type', type);
        toggleJiraTokenVisibility.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });

    // Save Jira token
    saveJiraTokenBtn.addEventListener('click', () => {
        const token = jiraTokenInput.value.trim();
        if (token) {
            appManager.encryptedDB.set('jira_token', token);
            updateTokenStatus();
            alert('Token saved successfully!');
        } else {
            alert('Please enter a valid token.');
        }
    });

    // Delete Jira token
    deleteJiraTokenBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete the Jira token?')) {
            appManager.encryptedDB.remove('jira_token');
            updateTokenStatus();
            alert('Token deleted successfully!');
        }
    });

    // Initialize the UI
    updateTokenStatus();
}

