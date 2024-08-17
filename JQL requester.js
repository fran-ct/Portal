/**ACTUALMENTE NO ESTA EN USO */

function getDataByJQL(query,maxResults=100){
  var pagination = 0
  var data = []
  var loopData
  do{
    loopData = jqlRequest(query,pagination,maxResults)
    loopData.issues.forEach((item)=>{
      data.push(item)
    })
    pagination = pagination + maxResults;
    Logger.log(pagination + " / " + loopData.total)
    ss.getRange("N1").setValue("Getting data "+pagination + "/" + loopData.total)
  } while (data.length<loopData.total)
  return data
}


function jqlRequest(query,page=0,maxResults=100) {
  var endpint = `https://craftech.atlassian.net/rest/api/3/search/?startAt=${page}&maxResults=${maxResults}&jql=${query}`
  let params = {
    method: 'GET',
    headers: {
      'Authorization' : 'Basic ' + Utilities.base64Encode("franco@craftech.io"+':5wXEVkZ8c0HPSQF5qVSk0440'),
      'Accept': 'application/json'
    }
  }
  const response = UrlFetchApp.fetch(endpint, params)
  return JSON.parse(response)
}



function processData(data){
  ss.getRange("N1").setValue("Prossesing data...")
  data = data.map((item)=>{
    //Logger.log(item.key)
    var sprintsObj = sprintManager(item.fields.customfield_10020)

    if (item.fields.customfield_10076!=null){
      item.fields.customfield_10076.value = emptyVariableHandler(item.fields.customfield_10076.value)
    }else {
      item.fields.customfield_10076 = {value: ""}
    }

    if (item.fields.priority.name!=null){
      item.fields.priority.name = emptyVariableHandler(item.fields.priority.name)
    }else {
      item.fields.priority.name = {value: ""}
    }

    if (item.fields.parent!=null){
      var epicName = item.fields.parent.fields.summary
    }else {
      var epicName = ""
    }

    if (item.fields.assignee!=null){
      var assignee = item.fields.assignee.displayName
    }else {
      var assignee = ""
    }

    item.fields.customfield_10026 = emptyVariableHandler(item.fields.customfield_10026)
    item.fields.timespent = emptyVariableHandler(item.fields.timespent)
    
    
    return {
      key: item.key,
      summary: item.fields.summary,
      assignee: assignee,
      status: item.fields.status.name,
      priority: item.fields.priority.name,
      issuePlan: item.fields.customfield_10076.value, //ISSUE TYPE
      issueType: item.fields.issuetype.name,
      project: item.fields.project.name,
      storyPoints: item.fields.customfield_10026,
      sprint: {
        name : sprintsObj.lastSprint.name, 
        id: sprintsObj.lastSprint.id,
        textList: sprintsObj.sprintsTextList,
        carryOver: sprintsObj.carryOver
      },
      timeSpent: item.fields.timespent,
      epicName: epicName
    }
  })
  return data
}



function sprintManager(sprints){
  if (sprints!=null||sprints!=undefined){
    if (sprints.length>1){ //MANEJO DE CAMPO SPRINT
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
          lastSprint = {name : item.name, id : item.id}
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
      lastSprint = {name : sprints[0].name, id : sprints[0].id}
      carryOverAux = 0
      sprintsTextList = ""
    }
    return {lastSprint : lastSprint, carryOver : carryOverAux, sprintsTextList: sprintsTextList, sprints : sprints}
  }else{
    return {lastSprint : "", carryOver : "", sprintsTextList: "", sprints : ""}
  }
}



function emptyVariableHandler(variable){
  if(variable==null||variable==undefined){
    variable == ""
  }
  return variable
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


