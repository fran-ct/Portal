function initializeView() {
    const issuesTable = new TableManager(
        'issuesTable',
        [
            { id: 'summary', name: 'Summary', sortable: true },
            { id: 'timeSpent', name: 'Time Spent', sortable: true },
            { id: 'link', name: 'Link', sortable: false },
            { id: 'status', name: 'Status', sortable: true }
        ],
        [], // Data se actualizará dinámicamente
        {}, // Filtros iniciales
        [], // Ítems seleccionados
        [    
            { label: 'View Details', action: (itemId) => viewDetails(itemId) },
            { label: 'Edit', action: (itemId) => editItem(itemId) },
            { label: 'Delete', action: (itemId) => deleteItem(itemId) }
        ], // Opciones del menú contextual
        { columnId: 'summary', order: 'asc' }, // Orden por defecto
        true, // Selección múltiple permitida
        handleItemClick // Función a ejecutar al hacer clic en un ítem
    );

    const eventsTable = new TableManager(
        'eventsTable',
        [
            { id: 'startTime', name: 'Start Time', sortable: true },
            { id: 'title', name: 'Title', sortable: true },
            { id: 'duration', name: 'Duration', sortable: false }
        ],
        [], // Data se actualizará dinámicamente
        {}, // Filtros iniciales
        [], // Ítems seleccionados
        [], // Opciones del menú contextual
        { columnId: 'startTime', order: 'asc' }, // Orden por defecto
        false, // Selección múltiple no permitida
        handleItemClick // Función a ejecutar al hacer clic en un ítem
    );

    // Eventos para actualizar issues y eventos
    document.getElementById('updateIssues-btn').addEventListener('click', () => updateIssues(issuesTable));
    document.getElementById('updateEvents-btn').addEventListener('click', () => updateEvents(eventsTable));

    // Evento para manejar la sincronización
    document.getElementById('syncButton').addEventListener('click', syncWorklog);

    // Cargar Issues y Eventos al inicio
    updateIssues(issuesTable);
    updateEvents(eventsTable);

    // Función para manejar el clic en un ítem de la tabla
    function handleItemClick(itemId) {
        checkSyncAvailability();
    }

    // Verifica si los botones de sync deben estar habilitados
    function checkSyncAvailability() {
        const syncButton = document.getElementById('syncButton');
        if (issuesTable.getSelectedItems().length > 0 && eventsTable.getSelectedItems().length > 0) {
            syncButton.disabled = false;
        } else {
            syncButton.disabled = true;
        }
    }

    // Actualiza la lista de issues desde Jira
    async function updateIssues(tableManager) {
        await appManager.performAuthenticatedOperation(async (accessToken) => {
            const jiraToken = appManager.encryptedDB.get('jira_token');
            if (!jiraToken) {
                alert('No Jira token found. Please add your Jira token in the Settings.');
                return;
            }

            // Llamada ficticia a la API de Jira para obtener los issues
            const issues = await fetchIssuesFromJira(jiraToken);
            tableManager.updateData(issues);
        });
    }

    // Actualiza la lista de eventos desde Google Calendar
    async function updateEvents(tableManager) {
        await appManager.performAuthenticatedOperation(async (accessToken) => {
            const calendarId = document.getElementById('calendar-select').value;
            const date = document.getElementById('date-input').value;

            // Llamada ficticia a la API de Google Calendar para obtener los eventos
            const events = await fetchEventsFromGoogleCalendar(accessToken, calendarId, date);
            tableManager.updateData(events);
        });
    }

    // Sincroniza el worklog de Jira con los eventos de Calendar
    async function syncWorklog() {
        const selectedIssue = issuesTable.getSelectedItems()[0];
        const selectedEvent = eventsTable.getSelectedItems()[0];
        const comment = document.getElementById('selectedEventComment').value;

        if (!selectedIssue || !selectedEvent) {
            alert('Please select both an issue and an event to sync.');
            return;
        }

        await appManager.performAuthenticatedOperation(async (accessToken) => {
            const jiraToken = appManager.encryptedDB.get('jira_token');
            if (!jiraToken) {
                alert('No Jira token found. Please add your Jira token in the Settings.');
                return;
            }

            // Llamada ficticia para sincronizar el worklog en Jira usando los datos seleccionados
            await syncWorklogToJira(jiraToken, selectedIssue, selectedEvent, comment);

            // Deshabilitar el botón de sync durante la sincronización
            document.getElementById('syncButton').disabled = true;

            setTimeout(() => {
                document.getElementById('syncButton').disabled = false;
                alert('Worklog synchronized successfully.');

                // Deseleccionar los ítems después de sincronizar
                issuesTable.clearSelection();
                eventsTable.clearSelection();
                document.getElementById('selectedEventComment').value = '';
            }, 2000);
        });
    }

    // Función ficticia para obtener issues de Jira
    async function fetchIssuesFromJira(jiraToken) {
        // Aquí harías la llamada real a la API de Jira
        return [
            { id: 1, summary: 'Issue 1', timeSpent: '2h', link: 'https://jira.example.com/1', status: 'Open' },
            { id: 2, summary: 'Issue 2', timeSpent: '1h', link: 'https://jira.example.com/2', status: 'In Progress' }
        ];
    }

    // Función ficticia para obtener eventos de Google Calendar
    async function fetchEventsFromGoogleCalendar(accessToken, calendarId, date) {
        // Aquí harías la llamada real a la API de Google Calendar
        return [
            { id: 1, startTime: '09:00 AM', title: 'Event 1', duration: '1h' },
            { id: 2, startTime: '11:00 AM', title: 'Event 2', duration: '2h' }
        ];
    }

    // Función ficticia para sincronizar el worklog en Jira
    async function syncWorklogToJira(jiraToken, issue, event, comment) {
        // Aquí harías la llamada real a la API de Jira para sincronizar el worklog
        console.log('Syncing worklog:', { jiraToken, issue, event, comment });
    }
}
