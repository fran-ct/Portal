let issues = [];
let selectedIssue = null;
let selectedEvent = null;

function initializeView() {

    // Verificar si el usuario está autenticado
    if (!appManager.sessionManager.isSessionActive()) {
        alert('You must be logged in to use the Worklog Manager.');
        appManager.loadView('signin', 'Sign In');
        return;
    }

    // Cargar los calendarios disponibles y los eventos del día
    loadAvailableCalendars();
    filterEvents();

    // Configurar los eventos para los selectores de calendario y fecha
    document.getElementById('calendar-select').addEventListener('change', filterEvents);
    document.getElementById('date-input').addEventListener('change', filterEvents);
    document.getElementById('updateEvents-btn').addEventListener('click', filterEvents);

    // Cargar los issues de Jira desde Google Sheets
    loadIssuesFromSpreadsheet();

    // Configurar los filtros de issues
    document.getElementById('squadId').addEventListener('change', filterIssues);
    document.getElementById('project').addEventListener('change', filterIssues);
    document.getElementById('assignee').addEventListener('change', filterIssues);
    document.getElementById('searchIssue').addEventListener('input', filterIssues);

    // Configurar el botón de sincronización
    document.getElementById('syncButton').addEventListener('click', syncWorklog);
}

// Cargar calendarios desde Google Calendar
function loadAvailableCalendars() {
    const accessToken = appManager.unencryptedDB.get('access_token');
    if (!accessToken) {
        showError('No access token found.');
        return;
    }

    fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (response.status === 401) {
            throw new Error('Unauthorized: Token may be expired or invalid.');
        }
        return response.json();
    })
    .then(data => {
        if (data.items) {
            populateCalendars(data.items);
            document.getElementById('calendar-select').value = data.items[0].id; // Seleccionar el primer calendario por defecto
        } else {
            showError('Error loading calendars.');
        }
    })
    .catch(error => {
        showError('Error communicating with Google Calendar API: ' + error.message);
    });
}

// Llenar el select de calendarios
function populateCalendars(calendars) {
    const calendarSelect = document.getElementById('calendar-select');
    calendarSelect.innerHTML = '';
    calendars.forEach(calendar => {
        const option = document.createElement('option');
        option.value = calendar.id;
        option.textContent = calendar.summary;
        calendarSelect.appendChild(option);
    });
}

// Filtrar y mostrar eventos desde Google Calendar
function filterEvents() {
    const date = document.getElementById('date-input').value;
    if (!date) {
        showError('Please select a valid date.');
        return;
    }

    const calendarId = document.getElementById('calendar-select').value;
    const accessToken = appManager.unencryptedDB.get('access_token');

    const timeMin = new Date(date).toISOString();
    const timeMax = new Date(new Date(date).setHours(23, 59, 59, 999)).toISOString();

    fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.items) {
            updateEventsList(data.items);
        } else {
            showError('Error loading events.');
        }
    })
    .catch(error => {
        showError('Error communicating with Google Calendar API: ' + error.message);
    });
}

// Actualizar la lista de eventos en la UI
function updateEventsList(events) {
    const list = document.querySelector("#eventsTable tbody");
    list.innerHTML = '';
    events.forEach(event => {
        const row = document.createElement('tr');
        row.classList.add('event-row');
        row.id = event.id;

        const startTimeCol = document.createElement('td');
        startTimeCol.textContent = moment(event.start.dateTime).format("HH:mm");

        const titleCol = document.createElement('td');
        titleCol.textContent = event.summary;

        const durationCol = document.createElement('td');
        const start = moment(event.start.dateTime);
        const end = moment(event.end.dateTime);
        durationCol.textContent = moment.duration(end.diff(start)).humanize();

        row.appendChild(startTimeCol);
        row.appendChild(titleCol);
        row.appendChild(durationCol);
        list.appendChild(row);
    });

    // Configurar el evento de selección de fila
    document.querySelectorAll('.event-row').forEach(row => {
        row.addEventListener('click', function () {
            selectEvent(row.id);
        });
    });
}

// Seleccionar un evento
function selectEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (event) {
        selectedEvent = event;
        document.getElementById('selectedEventComment').value = event.summary;
        document.querySelectorAll('.event-row').forEach(row => row.classList.remove('selected'));
        document.getElementById(eventId).classList.add('selected');
    }
}

// Resto del código permanece igual...
