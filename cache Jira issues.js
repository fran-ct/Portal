function recurrentEvent(){
  var now = new Date();
  var dayOfWeek = now.getDay();
  var hour = now.getHours();
  // Verifica si es día de semana y la hora está entre las 8 AM y las 8 PM
  if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 8 && hour < 21) {
    updateCachedJiraIssues()
  } else {
    Logger.log("# Fuera de horario")
  }
}


function updateCachedJiraIssues() {
  var issues = []
  boards.forEach((item)=>{
    let tempSprints =  getSprintsbyBoardId(item) //obtengo los sprints de Jira segun el boardId
    tempSprints.forEach((item2)=>{
      if (item2.state=="active"){
        //Identifico el squadId desde el nombre de sprint
        var palabras = item2.name.split(" ")
        if( palabras[0].length==2 && !isNaN( [palabras[0][1]] ) && isNaN( [palabras[0][0]] ) ){
          var squadId = palabras[0][1]
        }else if (palabras[0]=="Squad"){
          var squadId = palabras[1]
        }else{
          var squadId = 0
        }
        var issuesInSprint = getSprintIssuesById(sprintId=item2.id) //obtengo los issues de Jira segun el sprint
        issuesInSprint = issuesInSprint.map((item3)=>{
          item3.squadId = "Squad " + squadId
          return item3
        })
        issues = issues.concat(issuesInSprint)
      }
    })
  })
  issues = removeDuplicates(issues)
  Logger.log(JSON.stringify(issues).length)
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('jiraIssues', JSON.stringify(issues));
}


function retrieveJiraIssues() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var issues = JSON.parse(scriptProperties.getProperty('jiraIssues'));
  return issues; // Esto es ahora un array de objetos de issues
}

function retrieveJiraIssuesString() {
  db = startDB()
  db.sprint.filter([{column: "state", value: "active", include: true}])
  var activeSprints = db.sprint.data.map((item)=>{
    return item.id
  })
  console.log(activeSprints)
  var filteredIssues = db.report.data.filter(issue => activeSprints.includes(issue.sprintId));
  filteredIssues = filteredIssues.map(issue => {
    let sprint = db.sprint.getItemById(issue.sprintId)
    issue.sprint = {id: sprint.id ,name: sprint.name}
    return issue
  });
  console.log(filteredIssues)
  return JSON.stringify(filteredIssues)

}



function logChange(value) {
  var ss = SpreadsheetApp.openById("1Zc64-4ZF4VpHrdrl0MIkbbENvaPFKIpyhzjaP5cL9fo");
  var sheet = ss.getSheetByName('activeSprintCached'); 
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1).setValue(value);
}





