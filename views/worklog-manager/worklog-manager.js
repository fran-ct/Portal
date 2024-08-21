function initializeView() {


}

document.addEventListener('DOMContentLoaded', function () {
    // Cargar los calendarios disponibles y los eventos del día
    loadAvailableCalendars();
    filterEvents();

    // Configurar los eventos para los selectores de calendario y fecha
    document.getElementById('calendar-select').addEventListener('change', filterEvents);
    document.getElementById('date-input').addEventListener('change', filterEvents);
    document.getElementById('updateEvents-btn').addEventListener('click', filterEvents);

    // Cargar los issues de Jira desde el backend
    loadIssuesFromBackend();

    // Configurar los filtros de issues
    document.getElementById('squadId').addEventListener('change', filterIssues);
    document.getElementById('project').addEventListener('change', filterIssues);
    document.getElementById('assignee').addEventListener('change', filterIssues);
    document.getElementById('searchIssue').addEventListener('input', filterIssues);
});

function loadAvailableCalendars() {
    fetch(BACKEND_URL + '/api/getAvailableCalendars', {
        method: 'POST',
        credentials: "omit",
        redirect: "follow",
        headers: {
            'Content-Type': 'text/plain'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                populateCalendars(data.data.calendars);
                document.getElementById('calendar-select').value = data.data.defaultCalendar.id;
            } else {
                showError('Error loading calendars.');
            }
        })
        .catch(error => {
            showError('Error communicating with the backend while loading calendars.');
        });
}

function populateCalendars(calendars) {
    const calendarSelect = document.getElementById('calendar-select');
    calendarSelect.innerHTML = '';
    calendars.forEach(calendar => {
        const option = document.createElement('option');
        option.value = calendar.id;
        option.textContent = calendar.nombre;
        calendarSelect.appendChild(option);
    });
}

function filterEvents() {
    const date = document.getElementById('date-input').value;
    const calendarId = document.getElementById('calendar-select').value;

    fetch(`${BACKEND_URL}/api/getEvents?${params.toString()}`, {
        method: 'GET', // Cambiado a GET
        redirect: 'follow'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateEventsList(data.events);
            } else {
                showError('Error loading events.');
            }
        })
        .catch(error => {
            showError('Error communicating with the backend while loading events.');
        });
}

function updateEventsList(events) {
    const list = document.querySelector("#eventsTable tbody");
    list.innerHTML = '';
    events.forEach(event => {
        const row = document.createElement('tr');
        row.classList.add('event-row');
        row.id = event.id;

        const startTimeCol = document.createElement('td');
        startTimeCol.textContent = moment(event.startTime).format("HH:mm");

        const titleCol = document.createElement('td');
        titleCol.textContent = event.title;

        const durationCol = document.createElement('td');
        durationCol.textContent = moment.duration(moment(event.endTime).diff(moment(event.startTime))).humanize();

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

function selectEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (event) {
        document.getElementById('selectedEventComment').value = event.title;
        document.querySelectorAll('.event-row').forEach(row => row.classList.remove('selected'));
        document.getElementById(eventId).classList.add('selected');
    }
}

function loadIssuesFromBackend() {
    fetch(BACKEND_URL + '/api/getJiraIssues', {
        method: 'POST',
        credentials: "omit",
        redirect: "follow",
        headers: {
            'Content-Type': 'text/plain'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                issues = data.issues;
                populateIssueFilters(issues);
                updateIssuesTable(issues);
            } else {
                showError('Error loading issues.');
            }
        })
        .catch(error => {
            showError('Error communicating with the backend while loading issues.');
        });
}

function populateIssueFilters(issues) {
    const squads = removeDups(issues.map(issue => issue.squadId));
    populateSelectOptions('squadId', squads);

    const projects = removeDups(issues.map(issue => issue.project));
    populateSelectOptions('project', projects);

    const assignees = removeDups(issues.map(issue => issue.assigneeName));
    populateSelectOptions('assignee', assignees);
}

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
        link.href = `https://craftech.atlassian.net/browse/${issue.key}`;
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

function selectIssue(issueId) {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
        selectedIssue = issue;
        document.querySelectorAll('.issue-row').forEach(row => row.classList.remove('selected'));
        document.getElementById(issueId).classList.add('selected');
        document.getElementById('selectedIssueKey').value = issue.key;
    }
}

function removeDups(list) {
    let unique = {};
    list.forEach(function (i) {
        unique[i] = true;
    });
    return Object.keys(unique);
}

function showError(message) {
    console.error(message);
    // Puedes implementar un sistema de notificación visual aquí si lo deseas.
}

document.getElementById('syncButton').addEventListener('click', function () {
    const comment = document.getElementById('selectedEventComment').value;
    const duration = moment.duration(moment(selectedEvent.endTime).diff(moment(selectedEvent.startTime))).asSeconds();

    fetch(BACKEND_URL + '/api/setIssueWorklog', {
        method: 'POST',
        credentials: "omit",
        redirect: "follow",
        headers: {
            'Content-Type': 'text/plain'
        },
        body: JSON.stringify({
            issueKey: selectedIssue.key,
            timeSpentSeconds: duration,
            comment: comment,
            started: moment(selectedEvent.startTime).toISOString().replace("Z", "-0000")
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.querySelectorAll('.issue-row').forEach(row => row.classList.remove('selected'));
                document.querySelectorAll('.event-row').forEach(row => row.classList.remove('selected'));
                document.getElementById('selectedEventComment').value = '';
                showSuccess('Worklog uploaded successfully.');
            } else {
                showError('Error uploading worklog: ' + data.message);
            }
        })
        .catch(error => {
            showError('Error communicating with the backend while uploading worklog.');
        });
});

function showSuccess(message) {
    console.log(message);
    // Implementar notificación visual de éxito si es necesario
}
