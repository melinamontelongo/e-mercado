//Se obtienen los elementos necesarios y se almacenan en variables
let email = document.getElementById("form-email");
let password = document.getElementById("form-password");
let check = document.getElementById("form-check");
let form = document.getElementById("login-form");

//Función para permitirle al usuario decidir si mantener iniciada la sesión (localStorage) o no (sessionStorage)
  //Almacena el dato que se le pase
  //Redirecciona
function loginSession(userEmail, userPass){
  if (check.checked) {
    localStorage.setItem("user", userEmail);
  } else {
    sessionStorage.setItem("user", userEmail)
  }
  getInfo(USERS_URL).then(users => { //Petición get a la base de datos de usuarios
    let userProfile = users.find(user => user.email === userEmail) //Busca el usuario en la base de datos
    if (userProfile != undefined){ //Si el usuario existe
      localStorage.setItem("userID", userProfile.id) //Almacena el id
      if (userProfile.password === userPass){ //Verifica que la contraseña sea igual
        window.location = "index.html"; //Si lo es, redirige
      } else {
        createBSAlert("La contraseña no coincide. Intenta nuevamente", "danger"); //Sino, muestra la alerta
      }
    } else if (userProfile == undefined){ //Si el usuario no existe
      let newUser = { //Lo define como objeto
        "email": userEmail,
        "password": userPass,
        "firstName": "",
        "secondName": "",
        "firstSurname": "",
        "secondSurname": "",
        "phone": "",
        "picture": "",
        "userCart": []
      }
      postInfo(newUser, USERS_URL).then((res)=>{ //Lo almacena en la base de datos
        if (res.status === "ok"){
          localStorage.setItem("userID", res.data.id)
          window.location = "index.html"; //Y redirecciona
        } else{
          createBSAlert("Ha ocurrido un error. Intenta nuevamente", "danger");
        }
      })
    }
  })
}
//Función que gestiona la respuesta que devuelve el acceso con Google
function handleCredentialResponse(response) {   //Recibe las credenciales de usuario en jwt y
  console.log(response.credential)
  const data = jwt_decode(response.credential); //las decodifica con la biblioteca
  console.log(data)
  if (data.email_verified) {                    //accede a la propiedad del objeto, y si es true
    loginSession(data.email, password.value);                   //guarda el dato en almacenamiento
  }
}
 //Cuando carga el documento
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
  form.addEventListener('submit', e => {  
    e.preventDefault();     
    e.stopPropagation();
    form.classList.add('was-validated')  //agrega las clases de validación de bootstrap
    if (form.checkValidity()) {//valida lo ingresado por el usuario (que no sean campos vacíos)
      loginSession(email.value, password.value);        //Llama a la función que almacena el usuario en almacenamiento local
    }})  

}
