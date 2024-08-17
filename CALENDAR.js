function getAvailableCalendars() {
  var calendars = CalendarApp.getAllOwnedCalendars();
  var defaultCalendar = CalendarApp.getDefaultCalendar()
  return [calendars.map(function(calendar) {
    return { id: calendar.getId(), nombre: calendar.getName() };
  }),{ id: defaultCalendar.getId(), nombre: defaultCalendar.getName() }];
}


function obtenerEventosDelDia(date,calendar_id) {
  if (calendar_id=="Select"){calendar_id = CalendarApp.getDefaultCalendar().getId()}
  if (date == null) {
    date = new Date()
  } else {
    date = new Date(JSON.parse(date))
  }
  var calendar = CalendarApp.getCalendarById(calendar_id); //aca va calendar_id
  var eventos = calendar.getEventsForDay(date);
  var eventosDelDia = [];
  for (var i = 0; i < eventos.length; i++) {
    var evento = eventos[i];
    if (!evento.isAllDayEvent()) {
      eventosDelDia.push(simplificarEvento(evento));
    }
  }
  console.log(eventosDelDia)
  return JSON.stringify(eventosDelDia);
}

function simplificarEvento(evento) {
  var eventoSimplificado = {};
  eventoSimplificado.title = evento.getTitle();
  eventoSimplificado.description = evento.getDescription();
  eventoSimplificado.startTime = evento.getStartTime();
  eventoSimplificado.endTime = evento.getEndTime();
  eventoSimplificado.id = evento.getId();
  eventoSimplificado.ubication = evento.getLocation();
  eventoSimplificado.guests = evento.getGuestList().map(function (guest) { return guest.getEmail() });
  eventoSimplificado.color = evento.getColor();
  // Agregar formato de color en # del evento
  var color = evento.getColor();
  if (color) {
    var colorEnHex = ('000000' + color.substring(4)).slice(-6);
    eventoSimplificado.colorHex = '#' + colorEnHex;
  }
  return eventoSimplificado;
}


function createCalendarEventByEndTime(endDateTime, duration, issueKey, comment, link) {
  var description = ""
  //var calendarId = CalendarApp.getDefaultCalendar();// 'primary'; // Usa 'primary' para el calendario principal del usuario o especifica el ID de un calendario diferente
  var calendar = CalendarApp.getDefaultCalendar();
  if (issueKey === null) {
    var title = comment;
  } else {
    var title = "[" + issueKey + "] " + comment;
    description = "Issue Key: " + issueKey;
  }
  if (link !== null) {
    description += "\nLink: " + link;
  }

  var endDate = new Date(endDateTime);
  var durationMilliseconds = convertDurationToSeconds(duration) * 1000;
  var startDate = new Date(endDate.getTime() - durationMilliseconds);

  var event = calendar.createEvent(title, startDate, endDate, {
    description: description
  });
  event.setColor("8");

  return event
}
