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
        [    { label: 'View Details', action: (itemId) => viewDetails(itemId) },
        { label: 'Edit', action: (itemId) => editItem(itemId) },
        { label: 'Delete', action: (itemId) => deleteItem(itemId) }], // Opciones del menú contextual
        { columnId: 'summary', order: 'asc' }, // Orden por defecto
        true, // Selección múltiple no permitida
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
    function updateIssues(tableManager) {
        const jiraToken = appManager.encryptedDB.get('jira_token');
        // Aquí haces la llamada a la API de Jira para obtener los issues y actualizar la tabla
        // Ejemplo ficticio:
        const issues = [
            { id: 1, summary: 'Issue 1', timeSpent: '2h', link: 'https://jira.example.com/1', status: 'Open' },
            { id: 2, summary: 'Issue 2', timeSpent: '1h', link: 'https://jira.example.com/2', status: 'In Progress' }
        ];
        tableManager.updateData(issues);
    }

    // Actualiza la lista de eventos desde Google Calendar
    function updateEvents(tableManager) {
        const calendarId = document.getElementById('calendar-select').value;
        const date = document.getElementById('date-input').value;
        const accessToken = appManager.unencryptedDB.get('access_token');

        // Aquí haces la llamada a la API de Google Calendar para obtener los eventos y actualizar la tabla
        // Ejemplo ficticio:
        const events = [
            { id: 1, startTime: '09:00 AM', title: 'Event 1', duration: '1h' },
            { id: 2, startTime: '11:00 AM', title: 'Event 2', duration: '2h' }
        ];
        tableManager.updateData(events);
    }

    // Sincroniza el worklog de Jira con los eventos de Calendar
    function syncWorklog() {
        const selectedIssue = issuesTable.getSelectedItems()[0];
        const selectedEvent = eventsTable.getSelectedItems()[0];
        const comment = document.getElementById('selectedEventComment').value;

        // Aquí haces la llamada para sincronizar el worklog en Jira usando los datos seleccionados
        console.log('Sincronizando:', selectedIssue, selectedEvent, comment);

        // Deshabilitar el botón de sync durante la sincronización
        document.getElementById('syncButton').disabled = true;

        // Simulación de la sincronización y reactivación del botón
        setTimeout(() => {
            document.getElementById('syncButton').disabled = false;
            alert('Worklog sincronizado con éxito');

            // Deseleccionar los ítems después de sincronizar
            issuesTable.clearSelection();
            eventsTable.clearSelection();
            document.getElementById('selectedEventComment').value = '';
        }, 2000);
    }
}
