PropertiesService.getUserProperties().setProperty("user",Session.getActiveUser().getEmail())
var jiraURL = "https://craftech.atlassian.net"


function getStringAccess(){
  return PropertiesService.getUserProperties().getProperty("user").concat(":"+PropertiesService.getUserProperties().getProperty("token"))
}

function setToken(token){
  PropertiesService.getUserProperties().setProperty("token",token)
  toLog("setToken",PropertiesService.getUserProperties().getProperty("user"),token,getStringAccess())
}

function checkToken(){
  //PropertiesService.getUserProperties().deleteProperty("token") //Para eliminar el token de userProperty 
  if(PropertiesService.getUserProperties().getProperty("token")){
    return true
  }
  return false
}

function toClearMyToken(){
  PropertiesService.getUserProperties().deleteProperty("token") //Para eliminar el token de userProperty 
}



/** NUEVEAS */

function getScriptProperty(propertyName="CLIENT_ID") {
  // Accede al servicio de propiedades del script
  var scriptProperties = PropertiesService.getScriptProperties();
  
  // Obtiene el valor de la propiedad solicitada
  var value = scriptProperties.getProperty(propertyName);
  return value;
}

function setScriptProperty(propertyName="CLIENT_SECRET", value="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") {
  // Accede al servicio de propiedades del script
  var scriptProperties = PropertiesService.getScriptProperties();
  
  // Establece el valor de la propiedad
  scriptProperties.setProperty(propertyName, value);
}
