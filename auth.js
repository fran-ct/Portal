function getAuthUrl() {
  var service = getOAuthService();
  if (!service.hasAccess()) {
    return service.getAuthorizationUrl();
  }
  return "Ya estás autenticado.";
}


function getOAuthService() {
  return OAuth2.createService('google')
    .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setClientId(getScriptProperty("CLIENT_ID"))
    .setClientSecret(getScriptProperty("CLIENT_SECRET"))
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope(
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/script.storage",
      "https://www.googleapis.com/auth/script.external_request",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    );
}

// Esta función maneja el callback de OAuth2
function authCallback(request) {
  var oauthService = getOAuthService();
  var isAuthorized = oauthService.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}



function revokeAccess() {
  
  // Obtén el servicio OAuth configurado
  var service = getOAuthService();
  
  // Revoca el token actual
  if (service.hasAccess()) {
    var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' +
                    encodeURIComponent(service.getAccessToken());
    
    // Opciones para la petición HTTP
    var options = {
      'method' : 'post',
      'muteHttpExceptions': true
    };

    // Realiza la petición de revocación
    var response = UrlFetchApp.fetch(revokeUrl, options);
    var result = JSON.parse(response.getContentText());

    if (response.getResponseCode() == 200) {
      // La revocación fue exitosa, resetea el servicio OAuth
      service.reset();
      return {"status":"ok","string": 'Token revocado correctamente.'};
    } else {
      // La revocación falló, loguea el error
      return {"status":"ok","string": 'Error revocando el token: ' + result.error};
    }
  } else {
    return {"status":"ok","string": 'No hay permisos para revocar.'};
  }
}
