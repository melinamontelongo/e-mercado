let email = document.getElementById("form-email");
let password = document.getElementById("form-password");
let form = document.getElementById("login-form");
//Se obtienen los elementos necesarios y se almacenan en variables

form.addEventListener("submit", function (e) {  //Escucha de eventos para cuando se envíe el formulario
  e.preventDefault();                        //Se previene la acción por defecto (subir el formulario)
  if (email.value === "") {                    //Validación de e-mail equivalente al required(no tiene que estar vacío)
    document.getElementById("email-error").style.display = "block";  //Si está vacío, se muestra el mensaje de error...
    email.classList.replace("form-input", "input-error");           //y se remplaza la clase del input por otra que tiene el estilo para marcar el error.
  }
  if (password.value === "") {                                             //Validación de contraseña
    document.getElementById("password-error").style.display = "block"   //mismo proceso que con la validación de e-mail.
    password.classList.replace("form-input", "input-error");
  }
  if (email.value !== "" && password.value === "") {                  //Si uno de los inputs (email) está correcto y el otro no,  
    document.getElementById("email-error").style.display = "none"     //se le quita el estilo de error al correcto
    email.classList.replace("input-error", "form-input");
  }
  if (password.value !== "" && email.value === "") {                   //Lo mismo pero con la contraseña        
    document.getElementById("password-error").style.display = "none"
    password.classList.replace("input-error", "form-input");

  } else if (email.value !== "" && password.value !== "") {         //Se chequea que estén ambos campos
    localStorage.setItem("user", email.value);                     //almacena lo que el usuario ingresó en input email
    window.location.href = "index.html";                          //y se carga la portada del sitio.
  }
})

function handleCredentialResponse(response) {   //Recibe las credenciales de usuario en jwt y
  const data = jwt_decode(response.credential); //las decodifica con la biblioteca
  if (data.email_verified) {                    //accede a la propiedad del objeto, y si es true
    localStorage.setItem("user", data.email)    //almacena data.email en localStorage
    window.location.href = "index.html";       //redirecciona a la portada.
  }
}

window.onload = function () {            //Cuando carga
  google.accounts.id.initialize({       //inicializa el cliente de acceder con Google
    client_id: "381953423886-47c5ne9hmniom37j9qduls0fgt35sa8b.apps.googleusercontent.com", //client id creado con la consola de google developers
    callback: handleCredentialResponse  //llama a la función que maneja las credenciales de usuario
  });
  google.accounts.id.renderButton(       //Configura el botón de Google
    document.getElementById("googleBtn"),
    {
      theme: "filled_blue",
      size: "large",
      type: "standard",
      shape: "pill",
      text: "$ {button.text}",
      logo_alignment: "center"
    }
  );
}