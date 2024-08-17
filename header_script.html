<script>
  function checkToken(){
    google.script.run.withSuccessHandler(function(response){
      if(response==false){
        $("#token-bar").show();
      }else{
        //updateJiraData()
        $("#token-bar").hide();
      }
    }).checkToken()
  }


function clearJiraData(){
  localStorage.removeItem("issues")
}

//OCULTO EL BOTON CUANDO NO ESTA PRODUCTIVO
$("#dataClearer-btn").hide();



$(document).ready(function() {
  // Agrega funcionalidad a botones
  $("#token-btn").click(storeToken);
  $("#tokenUpdate-btn").click(tokenUpdate);
  $("#dataUpdate-btn").click(updateJiraData);
  $("#dataClearer-btn").click(clearJiraData);
/*  $("#chronometer-header-btn").click( google.script.run.withSuccessHandler(function(response){updateBody(response)}).router("chronometer"));
  $("#calendar-header-btn").click( google.script.run.withSuccessHandler(function(response){updateBody(response)}).router("calendar"));*/

  checkToken()

  //Almacena el token en la sesion del servidor para usarla en las solicitudes a Jira
  function storeToken() {
    var token = $("#token").val()
    google.script.run.withSuccessHandler(function (){
      M.toast({html: 'Token cargado correctamente'})
      updateJiraData()
    }).setToken(token)
    $("#token").val("");
    $("#token-bar").hide();
  }

  //Muestra u oculta la barra de input de token
  function tokenUpdate(){
    if ($('#token-bar').is(':hidden')){
      $("#token-bar").show();
    }else{
      $("#token-bar").hide();
    }
  }


});

</script>
