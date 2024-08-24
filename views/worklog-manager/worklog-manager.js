// Check if the variables are already defined
if (typeof issues === 'undefined') {
    var issues = [];
}
if (typeof selectedIssue === 'undefined') {
    var selectedIssue = null;
}
if (typeof selectedEvent === 'undefined') {
    var selectedEvent = null;
}

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
    fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.items) {
            populateCalendars(data.items);
            document.getElementById('calendar-select').value = data.items[0].id; // Seleccionar el primer calendario por defecto
        } else {
            showError('Error loading calendars.');
        }
    })
    .catch(error => {
        showError('Error communicating with Google Calendar API.');
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
    const dateInput = document.getElementById('date-input').value;
    const calendarId = document.getElementById('calendar-select').value;
    const accessToken = appManager.unencryptedDB.get('access_token');

    // Ensure we have a valid date
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
        showError('Invalid date selected');
        return;
    }

    const timeMin = date.toISOString();
    const timeMax = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString();

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
        showError('Error communicating with Google Calendar API.');
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

// Cargar issues desde Google Sheets
function loadIssuesFromSpreadsheet() {
    const spreadsheetId = 'YOUR_SPREADSHEET_ID';
    const range = 'Sheet1!A:G'; // Ajusta el rango según tu hoja de cálculo
    const accessToken = appManager.unencryptedDB.get('access_token');

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.values) {
            issues = data.values.map(row => ({
                id: row[0],
                summary: row[1],
                squadId: row[2],
                project: row[3],
                assigneeName: row[4],
                status: row[5],
                timespent: row[6]
            }));
            populateIssueFilters(issues);
            updateIssuesTable(issues);
        } else {
            showError('Error loading issues from spreadsheet.');
        }
    })
    .catch(error => {
        showError('Error communicating with Google Sheets API.');
    });
}

// Llenar los selectores de filtros de issues
function populateIssueFilters(issues) {
    const squads = removeDups(issues.map(issue => issue.squadId));
    populateSelectOptions('squadId', squads);

    const projects = removeDups(issues.map(issue => issue.project));
    populateSelectOptions('project', projects);

    const assignees = removeDups(issues.map(issue => issue.assigneeName));
    populateSelectOptions('assignee', assignees);
}

// Llenar un select con opciones
function populateSelectOptions(elementId, options) {
    const select = document.getElementById(elementId);
    select.innerHTML = '<option value="Select">Select</option>';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
    });
}

// Filtrar issues en la tabla
function filterIssues() {
    const squadId = document.getElementById('squadId').value;
    const project = document.getElementById('project').value;
    const assignee = document.getElementById('assignee').value;
    const searchText = document.getElementById('searchIssue').value.toLowerCase();

    let filteredIssues = issues;

    if (squadId !== "Select") {
        filteredIssues = filteredIssues.filter(issue => issue.squadId === squadId);
    }
    if (project !== "Select") {
        filteredIssues = filteredIssues.filter(issue => issue.project === project);
    }
    if (assignee !== "Select") {
        filteredIssues = filteredIssues.filter(issue => issue.assigneeName === assignee);
    }
    if (searchText) {
        filteredIssues = filteredIssues.filter(issue => issue.summary.toLowerCase().includes(searchText));
    }

    updateIssuesTable(filteredIssues);
}

// Actualizar la tabla de issues en la UI
function updateIssuesTable(filteredIssues) {
    const tableBody = document.querySelector("#issuesTable tbody");
    tableBody.innerHTML = '';
    filteredIssues.forEach(issue => {
        const row = document.createElement('tr');
        row.classList.add('issue-row');
        row.id = issue.id;

        const summaryCol = document.createElement('td');
        summaryCol.textContent = issue.summary;

        const spentCol = document.createElement('td');
        spentCol.classList.add('center-text');
        spentCol.textContent = issue.timespent ? moment.duration(issue.timespent, 'seconds').humanize() : 'none';

        const linkCol = document.createElement('td');
        const link = document.createElement('a');
        link.href = `https://your-jira-domain.atlassian.net/browse/${issue.key}`;
        link.target = '_blank';
        link.textContent = issue.key;
        linkCol.appendChild(link);

        const statusCol = document.createElement('td');
        statusCol.classList.add('center-text');
        statusCol.textContent = issue.status;

        row.appendChild(summaryCol);
        row.appendChild(spentCol);
        row.appendChild(linkCol);
        row.appendChild(statusCol);
        tableBody.appendChild(row);
    });

    // Configurar el evento de selección de fila
    document.querySelectorAll('.issue-row').forEach(row => {
        row.addEventListener('click', function () {
            selectIssue(row.id);
        });
    });
}

// Seleccionar un issue
function selectIssue(issueId) {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
        selectedIssue = issue;
        document.querySelectorAll('.issue-row').forEach(row => row.classList.remove('selected'));
        document.getElementById(issueId).classList.add('selected');
        document.getElementById('selectedIssueKey').value = issue.key;
    }
}

// Sincronizar worklog a Jira
function syncWorklog() {
    if (!selectedIssue || !selectedEvent) {
        showError('Please select both an issue and an event to sync.');
        return;
    }

    const comment = document.getElementById('selectedEventComment').value;
    const duration = moment.duration(moment(selectedEvent.end.dateTime).diff(moment(selectedEvent.start.dateTime))).asSeconds();
    const jiraToken = appManager.encryptedDB.get('jira_token');

    fetch(`https://your-jira-domain.atlassian.net/rest/api/2/issue/${selectedIssue.key}/worklog`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${btoa('your-email:' + jiraToken)}`, // Asumiendo que usas Basic Auth
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            timeSpentSeconds: duration,
            comment: comment,
            started: moment(selectedEvent.start.dateTime).toISOString()
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            document.querySelectorAll('.issue-row').forEach(row => row.classList.remove('selected'));
            document.querySelectorAll('.event-row').forEach(row => row.classList.remove('selected'));
            document.getElementById('selectedEventComment').value = '';
            showSuccess('Worklog uploaded successfully.');
        } else {
            showError('Error uploading worklog: ' + data.message);
        }
    })
    .catch(error => {
        showError('Error communicating with Jira API.');
    });
}

// Mostrar errores
function showError(message) {
    console.error(message);
    // Puedes implementar un sistema de notificación visual aquí si lo deseas.
}

// Mostrar éxito
function showSuccess(message) {
    console.log(message);
    // Implementar notificación visual de éxito si es necesario
}

// Eliminar duplicados de una lista
function removeDups(list) {
    let unique = {};
    list.forEach(function (i) {
        unique[i] = true;
    });
    return Object.keys(unique);
}
