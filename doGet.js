
function doGet(e) {
  if (!e.parameter.page){
    var page = "calendar" //Deafault page
  }else{
    var page = e.parameter.page
  }
  var template = HtmlService.createTemplateFromFile('Index');
  template.page = page; 
  return template.evaluate().setTitle("Worklog Manager");
}








// Deshabilitadas:


function router(page="calendar"){
  var html = ""
  html = html.concat(HtmlService.createHtmlOutputFromFile(page+"_style").getContent())
  html = html.concat(HtmlService.createHtmlOutputFromFile(page).getContent())
  html = html.concat(HtmlService.createHtmlOutputFromFile(page+"_script").getContent())
  console.log(html)
  return html
}
function doGet_old(e) {
  if (e.parameter.page){
    var page = e.parameter.page; // Obtenemos el valor del parámetro 'page' en la URL
    var output = HtmlService.createTemplateFromFile(page).evaluate(); // Creamos la página web correspondiente al valor del parámetro
  }else{
    var output = HtmlService.createTemplateFromFile("calendar").evaluate(); // Opion default
  }
  return output;
}