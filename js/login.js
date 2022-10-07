//Se obtienen los elementos necesarios y se almacenan en variables
let email = document.getElementById("form-email");
let check = document.getElementById("form-check");
let form = document.getElementById("login-form");

//Función para permitirle al usuario decidir si mantener iniciada la sesión (localStorage) o no (sessionStorage)
  //Almacena el dato que se le pase
  //Redirecciona
function loginSession(userData){
  if (check.checked) {
    localStorage.setItem("user", userData);
  } else {
    sessionStorage.setItem("user", userData)
  }
  window.location.href = "index.html";    
}

//Función que gestiona la respuesta que devuelve el acceso con Google
function handleCredentialResponse(response) {   //Recibe las credenciales de usuario en jwt y
  const data = jwt_decode(response.credential); //las decodifica con la biblioteca
  if (data.email_verified) {                    //accede a la propiedad del objeto, y si es true
    loginSession(data.email);                   //guarda el dato en almacenamiento
  }
}
 //Cuando carga
window.onload = function () {       
  //Inicialización del cliente de Google    
  google.accounts.id.initialize({  
    client_id: "381953423886-47c5ne9hmniom37j9qduls0fgt35sa8b.apps.googleusercontent.com", //client id creado con la consola de google developers
    callback: handleCredentialResponse  //llama a la función que maneja las credenciales de usuario
  });
//Configura el botón de Google
  google.accounts.id.renderButton(       
    document.getElementById("googleBtn"),
    {
      theme: "filled_black",
      size: "medium",
      type: "standard",
      shape: "rectangular",
      text: "$ {button.text}",
      logo_alignment: "left",
      width: 10,     
    }
  );
  //Cuando se "envíe" el formulario
  form.addEventListener('submit', event => {  
    event.preventDefault();     
    form.classList.add('was-validated')  //agrega las clases de validación de bootstrap
    if (form.checkValidity()) {         //valida lo ingresado por el usuario (que no sean campos vacíos)
      loginSession(email.value);        //Llama a la función que almacena el usuario en almacenamiento local
    }})  

}
