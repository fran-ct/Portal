var CLIENT_ID = "654333069607-t118hpn2v2ui383h9fcfpo0aspiv4tva.apps.googleusercontent.com"

function initializeView() {



    
    google.accounts.id.renderButton(
        document.getElementById("signInButton"),
        { theme: "outline", size: "large", text:"signin",shape:"pill" }  // customization attributes
    );



}
