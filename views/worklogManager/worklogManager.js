
var events = null
var issues = null
var selectedEvent = null;
var selectedIssue = null;

function updateJiraData(){
  $("#progressBar").show()
  google.script.run.withSuccessHandler(function(response){
    localStorage.setItem("issues",response)
    issues = JSON.parse(response)
    filterIssues()
    updateSquadOptions()
    updateProjectOptions()
    updateAssigneeOptions()
    $("#progressBar").hide()
    
  }).withFailureHandler(function(error){
    $("#progressBar").hide()
    M.toast({html: 'Error al cargar los issues, revisa tu token o refresca la pagina'})
    console.log("ERROR AL CARGAR LOS ISSUES")
  }).retrieveJiraIssuesString()
}




function updateSquadOptions(){
  var issuesLocal = issues.map((item)=>{
    return item.squadId
  })
  issuesLocal = removeDups(issuesLocal).sort()
  $("#squadId").empty()
  $("#squadId").append($('<option>', {
    value: "Select",
    text: "Select"
  }));
  issuesLocal.forEach((item)=>{
    $("#squadId").append($("<option>", {
      value: item,
      text: item
    }));
  })
}

function updateProjectOptions(){
  var issuesLocal = issues.map((item)=>{
    return item.project
  })
  issuesLocal = removeDups(issuesLocal).sort()
  $("#project").empty()
  $("#project").append($("<option>", {
    value: "Select",
    text: "Select"
  }));
  issuesLocal.forEach((item)=>{
    $("#project").append($("<option>", {
      value: item,
      text: item
    }));
  })
}

function updateAssigneeOptions(){
  var issuesLocal = issues.map((item)=>{
    return item.assigneeName
  })
  issuesLocal = removeDups(issuesLocal).sort()
  $("#assignee").empty()
  $("#assignee").append($("<option>", {
    value: "Select",
    text: "Select"
  }));
  issuesLocal.forEach((item)=>{
    $("#assignee").append($("<option>", {
      value: item,
      text: item
    }));
  })
}


function removeDups(list) {
  let unique = {};
  list.forEach(function(i) {
    if(!unique[i]) {
      unique[i] = true;
    }
  });
  return Object.keys(unique);
}



// Filtrar los issues según los valores de los inputs correspondientes
function filterIssues() {
  var squadId = $("#squadId").val();
  var project = $("#project").val();
  var assignee = $("#assignee").val();
  var searchText = $("#searchIssue").val();
  var filteredIssues = issues;

  if (squadId != "Select") {
    filteredIssues = filteredIssues.filter(function(item) {
      return item.squadId == squadId;
    });
  }
  if (project != "Select") {
    filteredIssues = filteredIssues.filter(function(item) {
      return item.project == project;
    });
  }
  if (assignee != "Select") {
    filteredIssues = filteredIssues.filter(function(item) {
      return item.assigneeName == assignee;
    });
  }

  if (searchText) {
    filteredIssues = filteredIssues.filter(function(item) {
      return item.summary.toLowerCase().includes(searchText.toLowerCase());
    });
  }

  // Actualizar la tabla de issues con los resultados del filtro
  updateIssuesTable(filteredIssues);
}









// Filtrar los eventos según los valores de los inputs correspondientes
function filterEvents() {

  // Obtener la fecha del input
  //const date = moment($("#date-input").val().trim(), "DD-MM-YYYY");
  const date = moment($("#date-input").val().trim()).format('YYYY/MM/DD');
  var calendar_id = $("#calendar-select").val() // valor default? | ...
  google.script.run.withSuccessHandler(function (response){
    var calendarEvents = JSON.parse(response)
    // Obtener los eventos de la fecha seleccionada
    const events = calendarEvents.filter(event => {
      const start = moment(event.startTime);
      const end = moment(event.endTime);
      return start.isSame(date, "day") && !event.isAllDay;
    });
    console.log(events)
    // Actualizar el listado de eventos con los resultados del filtro
    updateEventsList(events);
  

  }).obtenerEventosDelDia(JSON.stringify(date),calendar_id)
}


function updateEventsList(eventsGiven) {
  events = eventsGiven
  const list = $("#eventsTable tbody");
  list.empty();
  events.forEach(event => {
    event.duration = moment.duration(moment(event.endTime).diff(moment(event.startTime))).humanize()
    const row = $(`<tr class="event-row" id="${event.id}"></tr>`);
    const startTimeCol = $("<td></td>").text(moment(event.startTime).format("HH:mm"));
    const titleCol = $("<td></td>").text(event.title);
    const durationCol = $(`<td></td>`).text(event.duration);
    row.append(startTimeCol, titleCol, durationCol);
    list.append(row);
  });
}



function loadAvailableCalendars() {
  google.script.run.withSuccessHandler(function(response) {
    const calendarSelect = document.getElementById('calendar-select');

    var calendars = response[0]
    var defaultdalendar = response[1]
    calendarSelect.innerHTML = '';
    calendars.sort((a, b) => a.nombre.localeCompare(b.nombre));
    calendars.filter((item) => item.id==defaultdalendar.id);
    calendars.forEach(calendar => {
      const option = document.createElement('option');
      option.value = calendar.id;
      option.text = calendar.nombre;
      if(calendar.id==defaultdalendar.id){
        option.selected;
      }
      calendarSelect.appendChild(option);
    });
  }).withFailureHandler(function(error) {
    toastr.error('Error al cargar los calendarios: ' + error.message);
  }).getAvailableCalendars();
}



function updateIssuesTable(filteredIssues) {
  const tableBody = $("#issuesTable tbody");
  tableBody.empty();
  if (filteredIssues.length==0||filteredIssues.length==null){
    //aviso que no se cargo bien
    console.log("ERROR AL OBTENER LOS ISSUES DE JIRA")
    $("#progressBar").hide()
  }
  filteredIssues.forEach(issue => {
    const row = $(`<tr class="issue-row" id="${issue.id}"></tr>`);
    const summaryCol = $("<td></td>").text(issue.summary);
    if (issue.timespent==null||issue.timespent==0){
      var totalHoursCol = $(`<td class="noWrapping center-text"></td>`).text("none");
    }else{
      var totalHoursCol = $(`<td class="noWrapping center-text"></td>`).text(moment.duration(issue.timespent, 'seconds').humanize());
    }
    var baseLink = 'https://craftech.atlassian.net/browse/'+ issue.key
    const link = `https://i2.wp.com/avatar-management--avatars.us-west-2.prod.public.atl-paas.net/initials/?ssl=1`
    const goToIcon = `https://www.svgrepo.com/show/507685/external-link.svg`
    if (issue.assigneeName==null){
      var assigneeCol = `<td class="centerJiraColumn"><a href="${baseLink}" target="_blank"><img class="color-filter" src="${goToIcon}" title="Ver en Jira" alt="Ver en Jira"></a></td>`; //title="${issue.assigneeName}" alt="Unassigned"
    }else{
      var assigneeCol = `<td class="centerJiraColumn"><a href="${baseLink}" target="_blank"><img class="color-filter" src="${goToIcon}" title="Ver en Jira" alt="Ver en Jira"></a></td>`; //title="${issue.assigneeName}" alt="${issue.assigneeName}"
    }
    const statusCol = `<td class="noWrapping center-text"><span>${issue.status}</span></td>`;
    row.append(summaryCol, totalHoursCol, assigneeCol, statusCol);
    tableBody.append(row);
  });
}






/** ######## AL CARGAR LA PAGINA ########*/


$(document).ready(function() {

$("#squadId").append($("<option>", {
  value: "Select",
  text: "Select"
}));
$("#project").append($("<option>", {
  value: "Select",
  text: "Select"
}));
$("#assignee").append($("<option>", {
  value: "Select",
  text: "Select"
}));


$("#calendar-select").append($("<option>", {
  value: "Select",
  text: "Cargando calendarios..."
}));

//console.log(moment().toISOString().substr(0, 10))
//console.log(moment().format("YYYY-MM-DD"))
$("#date-input").val(moment().format("YYYY-MM-DD"))

filterEvents();
loadAvailableCalendars()

//Inicializo el valor de los issues de jira
let auxStored = localStorage.getItem("issues")
if(auxStored!=null || auxStored!=undefined){
  try{
    issues = JSON.parse(localStorage.getItem("issues"))
    filterIssues()
    updateSquadOptions()
    updateProjectOptions()
    updateAssigneeOptions()
  }catch(e){
    console.log(e)
  }
}else{
  updateJiraData()
}






/**ISSUES*/


// Manejo de filtros
$("#squadId").on("change", function() {
  var squadId = $(this).val();
  filterIssues();
});

$("#project").on("change", function() {
  var project = $(this).val();
  filterIssues();
});

$("#assignee").on("change", function() {
  var assignee = $(this).val();
  filterIssues();
});

$("#searchIssue").on("input", function() {
  filterIssues();
});



$(document).on("click", ".issue-row", function() {
  // Obtener el id del evento seleccionado
  const issueId = $(this).attr("id");
  // Obtener el objeto del evento completo
  console.log("issueId", issueId);
  const issue = issues.find(issue => issue.id == issueId);
  // Guardar una referencia al evento seleccionado en una variable global
  selectedIssue = issue;
  console.log(selectedIssue)
  // Actualizar los valores de los campos de entrada

  $("#selectedIssueKey").val(selectedIssue.key);
  
  // Cambiar el estilo de la fila seleccionada
  $(".issue-row").removeClass("selected");
  $(this).addClass("selected");
});







/**EVENTOS*/


$("#updateEvents-btn").on("click", function() {
  $("#progressBar").show()
  filterEvents();
  $("#progressBar").hide()
});


// Manejo de selección de día
$("#date-input").on("change", function() {
  filterEvents();
});

$("#calendar-select").on("change", function() {
  filterEvents();
});






$(document).on("click", ".event-row", function() {
  // Obtener el id del evento seleccionado
  const eventId = $(this).attr("id");
  // Obtener el objeto del evento completo
  const event = events.find(event => event.id === eventId);
  
  // Guardar una referencia al evento seleccionado en una variable global
  selectedEvent = event;
  console.log(selectedEvent)

  // Actualizar los valores de los campos de entrada
  $("#selectedEventComment").val(event.title);
  
  // Cambiar el estilo de la fila seleccionada
  $(".event-row").removeClass("selected");
  $(this).addClass("selected");
});


/**ENVIO DE WL*/
// Envío de worklog


$("#syncButton").on("click", function() {
selectedEvent.title = $("#selectedEventComment").val();
let duration = moment.duration(moment(selectedEvent.endTime).diff(moment(selectedEvent.startTime))).asSeconds();
$(this).prop("disabled", true);

google.script.run.withSuccessHandler(function(response) {
  response = JSON.parse(response)
  if (response.success) {
    $(".issue-row").removeClass("selected");
    $(".event-row").removeClass("selected");
    $("#selectedEventComment").val("");
    M.toast({ html: 'Worklog cargado correctamente' });
  } else {
    M.toast({ html: 'Error: ' + response.message });
  }
  $("#syncButton").prop("disabled", false);
}).withFailureHandler(function(error) {
  M.toast({ html: 'Error al intentar cargar el worklog' });
  $("#syncButton").prop("disabled", false);
}).setIssueWorklog(selectedIssue.key, duration, selectedEvent.title, moment(selectedEvent.startTime).toISOString().replace("Z", "-0000"));
});



});
