function initializeView() {
        // Comprobar si ya existe un token almacenado
        checkStoredToken();
    
        // Manejar el envío del formulario
        document.getElementById('token-btn').addEventListener('click', function() {
            const tokenInput = document.getElementById('token');
            const token = tokenInput.value.trim();
    
            if (token === '') {
                alert('Please enter a token.');
                return;
            }
    
            // Bloquear el input y el botón mientras se envía la solicitud
            toggleFormState(true);
    
            // Enviar el token al backend
            fetch(`${BACKEND_URL}/api/saveJiraToken`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify({ token: token })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showTokenStatus('stored');
                } else {
                    showTokenStatus('error');
                    alert('Error saving token: ' + data.message);
                }
                // Desbloquear el input y el botón después de la respuesta
                toggleFormState(false);
            })
            .catch(error => {
                console.error('Error:', error);
                showTokenStatus('error');
                alert('An error occurred. Please try again.');
                toggleFormState(false);
            });
        });
    }
    
    // Verifica si el token está almacenado en el backend
    function checkStoredToken() {
        fetch(`${BACKEND_URL}/api/checkJiraToken`, {
            method: 'GET',
            credentials: "omit",
            headers: {
                'Content-Type': 'text/plain'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.tokenExists) {
                showTokenStatus('stored');
            } else {
                showTokenStatus('missing');
            }
        })
        .catch(error => {
            console.error('Error checking token status:', error);
            showTokenStatus('error');
        });
    }
    
    // Cambia el estado del indicador de token
    function showTokenStatus(status) {
        const indicator = document.getElementById('token-indicator');
        indicator.style.display = 'inline-block';
    
        if (status === 'stored') {
            indicator.textContent = 'Token stored';
            indicator.style.color = 'green';
        } else if (status === 'missing') {
            indicator.textContent = 'No token stored';
            indicator.style.color = 'red';
        } else if (status === 'error') {
            indicator.textContent = 'Error checking token';
            indicator.style.color = 'red';
        }
    }
    
    // Bloquea o desbloquea el input y el botón mientras se procesa la solicitud
    function toggleFormState(isDisabled) {
        const tokenInput = document.getElementById('token');
        const tokenButton = document.getElementById('token-btn');
    
        tokenInput.disabled = isDisabled;
        tokenButton.disabled = isDisabled;
    
        if (isDisabled) {
            tokenButton.textContent = 'Saving...';
        } else {
            tokenButton.textContent = 'Save';
        }
    }
    