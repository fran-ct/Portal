/**  ######################### divisor para jira de chronometer ##################### */



function newIssue(data) {
  var url = jiraURL + '/rest/api/3/issue';
  var payload = JSON.stringify(data);
  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    payload: payload,
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode(getStringAccess()),
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  });
  return response.getContentText();
}


function editIssue(data,issueId) {
  var url = jiraURL + '/rest/api/3/issue/' + issueId;
  var payload = JSON.stringify(data);
  var response = UrlFetchApp.fetch(url, {
    method: 'put',
    payload: payload,
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode(getStringAccess()),
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  });
  return response.getContentText();
}



function getIssue(issueIdOrKey="S1-71") {
  toLog("getIssue",PropertiesService.getUserProperties().getProperty("user"),PropertiesService.getUserProperties().getProperty("token"),getStringAccess(),issueIdOrKey)
  var endpoint = jiraURL + `/rest/api/3/issue/${issueIdOrKey}`
  let params = {
    method: 'GET',
    headers: {
      'Authorization' : 'Basic ' + Utilities.base64Encode(getStringAccess()),
      'Accept': 'application/json'
    }
  }
  const response = JSON.parse(UrlFetchApp.fetch(endpoint, params))
  var aux = processIssue(response)
  return JSON.stringify(aux)
}


function toLog (type, user, pass, both, issueKey, timeSpentSeconds, comment, started,session){
  var sheet = SpreadsheetApp.openById("1CpW6KTfcFeF22WfS4ynsqSaPGLvFO36LidRgXDBtGLI").getSheetByName("LOG")
  sheet.appendRow([new Date(),type, user, pass, both, issueKey, timeSpentSeconds, comment, started,Session.getUser().getEmail()])
}

function processIssue(item){
  if(item.fields.assignee==null){
    var assignee = null
  }else{
    var assignee = item.fields.assignee.displayName
  }
  if(item.fields.priority==null){
    var priority = null
  }else{
    var priority = item.fields.priority.name
  }
  if(item.fields.customfield_10076==null){
    var typeOfTask = null
  }else{
    var typeOfTask =  item.fields.customfield_10076.value
  }
  if (item.fields.parent==null){
    var epic = {
      key: null,
      id: null,
      summary: null,
      status: null,
    }
  }else{
    var epic = {
      key: item.fields.parent.key,
      id: item.fields.parent.id,
      summary: item.fields.parent.fields.summary,
      status: item.fields.parent.fields.status.name,
    }
  }
  return {
    key: item.key,
    id: item.id,
    summary: item.fields.summary,
    assignee: assignee,
    status: item.fields.status.name,
    priority:  priority,
    typeOfTask: typeOfTask,
    issueType: item.fields.issuetype.name,
    project: item.fields.project.name,
    projectId: item.fields.project.id,
    storyPoints: item.fields.customfield_10026,
    timeSpent: item.fields.timespent,
    created: emptyDateHandler(item.fields.created),
    updated: emptyDateHandler(item.fields.updated),
    dueDate: emptyDateHandler(item.fields.duedate),
    statusChangeDate: emptyDateHandler(item.fields.statuscategorychangedate),
    parent: epic,
    description: item.fields.description,
    sprint: sprintManager(item.fields.customfield_10020)
  }
}



function emptyDateHandler(date){
  if(date == null || date == undefined){
    return ""
  }
  return new Date(date)
}



function getIssueWorklogs(issueIdOrKey) {
  toLog("getIssueWorklogs",PropertiesService.getUserProperties().getProperty("user"),PropertiesService.getUserProperties().getProperty("token"),getStringAccess(),issueIdOrKey)

  var endpoint = jiraURL + `/rest/api/3/issue/${issueIdOrKey}/worklog`

  var maxResults = 1000
  var pagination = 0
  var data = []
  var loopData
  let params = {
    method: 'GET',
    headers: {
      'Authorization' : 'Basic ' + Utilities.base64Encode(getStringAccess()),
      'Accept': 'application/json'
    }
  }
  do{
    let response = UrlFetchApp.fetch(endpoint+`?startAt=${pagination}&maxResults=${maxResults}`, params)
    loopData = JSON.parse(response)
    loopData.worklogs.forEach((item)=>{
      data.push(item)
    })
    pagination = pagination + loopData.worklogs.length
  } while (loopData.total>loopData.length) 
  data = processWorklogs(data)
  return JSON.stringify(data)
}


function processWorklogs(worklogs){
  worklogs = worklogs.map((item)=>{
    try{
      if(item.comment){
        if(item.comment.content.length>0){
          var comment = item.comment.content[0].content[0].text
        }else{
          var comment = ""
        }
      }else{
        var comment = ""
      }
    }
    catch(e){
      console.error("ERROR AL PROCESAR COMENTARIO")
    }
    return {
      author: item.author.displayName,
      comment: comment,
      date: new Date (item.started),
      timeSpent: item.timeSpent,
      timeSpentSeconds: item.timeSpentSeconds,
      timeSpentHours: item.timeSpentSeconds/3600,
      id: item.id,
      issueId: item.issueId,
    }
  })
  return worklogs
}



function setIssueWorklog_BKP(issueKey, timeSpentSeconds, comment, started) {
  toLog("setIssueWorklog",PropertiesService.getUserProperties().getProperty("user"),PropertiesService.getUserProperties().getProperty("token"),getStringAccess(),issueKey, timeSpentSeconds, comment, started)
  var url = jiraURL + '/rest/api/2/issue/' + issueKey + '/worklog';
  var payload = JSON.stringify({
    timeSpentSeconds: timeSpentSeconds,
    comment: comment,
    adjustEstimate: "leave",
    started: started
  });
  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    payload: payload,
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode(getStringAccess()),
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  });
  return response.getContentText();
}

function setIssueWorklog(issueKey, timeSpentSeconds, comment, started) {
  var token = PropertiesService.getUserProperties().getProperty("token");

  if (!token || token == "") {
    return JSON.stringify({ success: false, message: 'Debe cargar el token.' });
  }

  toLog("setIssueWorklog", PropertiesService.getUserProperties().getProperty("user"), token, getStringAccess(), issueKey, timeSpentSeconds, comment, started);
  
  var url = jiraURL + '/rest/api/2/issue/' + issueKey + '/worklog';
  var payload = JSON.stringify({
    timeSpentSeconds: timeSpentSeconds,
    comment: comment,
    adjustEstimate: "leave",
    started: started
  });
  
  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      payload: payload,
      headers: {
        Authorization: 'Basic ' + Utilities.base64Encode(getStringAccess()),
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    });

    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();

    if (responseCode >= 200 && responseCode < 300) {
      return JSON.stringify({ success: true, message: responseText });
    } else {
      throw new Error('Error al cargar worklog: ' + responseText);
    }
  } catch (error) {
    return JSON.stringify({ success: false, message: "Error al cargar worklog: " + error.message });
  }
}








/** ######################divisor para jira de calendar##################### */



var boards = [77, 78, 79, 171]
var test = true

function getIssuesFromJira() {
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
  //ssues = processIssuesForSprintIssuesRequest(issues)
  return JSON.stringify(issues)
}


  
function removeDuplicates(data, key = 'id') {
  const seen = new Map();
  return data.filter(item => {
    const val = item[key];
    if (seen.has(val)) {
      return false;
    } else {
      seen.set(val, true);
      return true;
    }
  });
}



function getSprintsbyBoardId(boardId) {
  var endpoint = `https://craftech.atlassian.net/rest/agile/1.0/board/${boardId}/sprint`
  var maxResults = 1000
  var pagination = 0
  var data = []
  var loopData
  let params = {
    method: 'GET',
    headers: {
      'Authorization' : 'Basic ' + Utilities.base64Encode(getStringAccess(test)),
      'Accept': 'application/json'
    }
  }
  console.log("- Request to: " + endpoint)
  do{
    let response = UrlFetchApp.fetch(endpoint + `?startAt=${pagination}&maxResults=${maxResults}` , params)
    loopData = JSON.parse(response)
    loopData.values.forEach((item)=>{
      data.push(item)
    })
    pagination = pagination + loopData.values.length
  } while (loopData.isLast==false)
  Logger.log("- All done. Total recived: " + data.length + " sprints from board: "+boardId)  
  return data
}

function getSprintIssuesById(sprintId) {
  var endpoint = `https://craftech.atlassian.net/rest/agile/1.0/sprint/${sprintId}/issue`
  var maxResults = 1000
  var pagination = 0
  var data = []
  var loopData
  let params = {
    method: 'GET',
    headers: {
      'Authorization' : 'Basic ' + Utilities.base64Encode(getStringAccess(test)),
      'Accept': 'application/json'
    }
  }
  console.log("- Request to: " + endpoint)
  do{
    let response = UrlFetchApp.fetch(endpoint+`?startAt=${pagination}&maxResults=${maxResults}`, params)
    loopData = JSON.parse(response)
    loopData.issues.forEach((item)=>{
      data.push(item)
    })
    pagination = pagination + loopData.issues.length
  } while (loopData.total>loopData.length)
  Logger.log("- All done. Total recived: " + data.length + " issues")  
  //data = processIssuesForSprintIssuesRequest(data)
  return data
}


function processIssuesForSprintIssuesRequest(data){

  data = data.map((item)=>{

    if(item.fields.assignee==null){
      var assignee = null
      var assigneeId = null
      var assigneeIcon = null
    }else{
      var assignee = item.fields.assignee.displayName
      var assigneeId = item.fields.assignee.accountId
      var assigneeIcon = item.fields.assignee.avatarUrls
    }

    if(item.fields.priority==null){
      var priority = null
    }else{
      var priority = item.fields.priority.name
    }

    if(item.fields.customfield_10076==null){
      var typeOfTask = null
    }else{
      var typeOfTask =  item.fields.customfield_10076.value
    }

    if (item.fields.parent==null){
      var epic = {
        key: null,
        id: null,
        summary: null,
        status: null,
      }
    }else{
      var epic = {
        key: item.fields.parent.key,
        id: item.fields.parent.id,
        summary: item.fields.parent.fields.summary,
        status: item.fields.parent.fields.status.name,
      }
    }

    return {
      key: item.key,
      id: item.id,
      summary: item.fields.summary,
      assignee: assignee,
      assigneeId: assigneeId,
      assigneeIcon: assigneeIcon,
      status: item.fields.status.name,
      priority:  priority,
      typeOfTask: typeOfTask,
      issueType: item.fields.issuetype.name,
      project: item.fields.project.name,
      projectId: item.fields.project.id,
      storyPoints: item.fields.customfield_10026,
      timeSpent: item.fields.timespent,
      created: emptyDateHandler(item.fields.created),
      updated: emptyDateHandler(item.fields.updated),
      dueDate: emptyDateHandler(item.fields.duedate),
      statusChangeDate: emptyDateHandler(item.fields.statuscategorychangedate),
      parent: epic,
      description: item.fields.description,
      sprint: sprintManager(item.fields.customfield_10020)
    }
  })
  return data
}



function sprintManager(sprints){//MANEJO DE CAMPO SPRINT
  if (sprints!=null||sprints!=undefined){
    if (sprints.length>1){ 
      var aux = 0
      var carryOverAux = 0;
      var lastSprint = ""
      var sprintsTextList = ""  
      sprints.forEach((item)=>{
        if (item.state=="closed"){
          carryOverAux = sprints.length
        } else {
          carryOverAux = sprints.length-1
        }
        if(aux<item.id){
          aux = item.id
          lastSprint = {name: item.name, id: item.id}
        }
      })
      sortSprintArray(sprints)
      sprints.forEach((item,index)=>{
        if (index==0){
          sprintsTextList = item.name
        }else {
          sprintsTextList = sprintsTextList + ", " + item.name
        }
      })
    }else{
      lastSprint = {name: sprints[0].name, id: sprints[0].id}
      carryOverAux = 0
      sprintsTextList = ""
    }
    return {lastSprint: lastSprint, carryOver: carryOverAux, sprintsTextList: sprintsTextList, sprints: sprints}
  }else{
    return {lastSprint: "", carryOver: "", sprintsTextList: "", sprints : ""}
  }
}

function sortSprintArray(item){
item = item.sort(function (a, b) {
  if (a.id > b.id) {
    return 1;
  }
  if (a.id < b.id) {
    return -1;
  }
  return 0;
});
return item
}


function limpiarIssue(item) {
  console.log(item)
  const assignee = item.fields.assignee ? {
    name: item.fields.assignee.displayName || null,
    id: item.fields.assignee.accountId || null,
    icon: item.fields.assignee.avatarUrls || null
  } : {
    name: null,
    id: null,
    icon: null
  };

  const priority = item.fields.priority ? item.fields.priority.name || null : null;

  const typeOfTask = item.fields.customfield_10076 ? item.fields.customfield_10076.value || null : null;

  const parent = item.fields.parent ? {
    key: item.fields.parent.key || null,
    id: item.fields.parent.id || null,
    summary: item.fields.parent.fields.summary || null,
    status: item.fields.parent.fields.status ? item.fields.parent.fields.status.name || null : null
  } : {
    key: null,
    id: null,
    summary: null,
    status: null
  };

  const sprints = item.fields.customfield_10020 ? sprintManager(item.fields.customfield_10020) : null;

  return {
    key: item.key || null,
    id: item.id || null,
    summary: item.fields.summary || null,
    assignee: assignee.name,
    assigneeId: assignee.id,
    assigneeIcon: assignee.icon,
    status: item.fields.status ? item.fields.status.name || null : null,
    priority: priority,
    typeOfTask: typeOfTask,
    issueType: item.fields.issuetype ? item.fields.issuetype.name || null : null,
    project: item.fields.project ? item.fields.project.name || null : null,
    projectId: item.fields.project ? item.fields.project.id || null : null,
    storyPoints: item.fields.customfield_10026 || null,
    timeSpent: item.fields.timespent || null,
    created: emptyDateHandler(item.fields.created),
    updated: emptyDateHandler(item.fields.updated),
    dueDate: emptyDateHandler(item.fields.duedate),
    statusChangeDate: emptyDateHandler(item.fields.statuscategorychangedate),
    parent: parent,
    description: item.fields.description || null,
    sprint: sprints,
    urgency: item.fields.customfield_10042 ? item.fields.customfield_10042.value || null : null,
    environment: item.fields.customfield_10123 || null,
    service: item.fields.customfield_10121 || null,
    requester: item.fields.customfield_10126 || null,
    typeOfRequest: item.fields.customfield_10127 || null,
    startDate: item.fields.customfield_10015 ? emptyDateHandler(item.fields.customfield_10015) : null,
    epicLink: item.fields.customfield_10014 || null,
    sleekClient: item.fields.customfield_10134 || null,
    resolution: item.fields.resolution || null,
    worklog: item.fields.worklog || null,
    progress: item.fields.progress || null
  }
}

