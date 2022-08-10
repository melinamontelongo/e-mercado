let email = document.getElementById("form-email");
let password = document.getElementById("form-password");
let form = document.getElementById("login-form");
//Se obtienen los elementos necesarios y se almacenan en variables

form.addEventListener("submit", function(e){  //Escucha de eventos para cuando se envíe el formulario
    e.preventDefault();                        //Se previene la acción por defecto (subir el formulario)
   if (email.value === ""){                    //Validación de e-mail equivalente al required(no tiene que estar vacío)
    document.getElementById("email-error").style.display ="block";  //Si está vacío, se muestra el mensaje de error...
    email.classList.replace("form-input", "input-error");           //y se remplaza la clase del input por otra que tiene el estilo para marcar el error.
}
 if (password.value === ""){                                             //Validación de contraseña
    document.getElementById("password-error").style.display = "block"   //mismo proceso que con la validación de e-mail.
    password.classList.replace("form-input", "input-error");           
} else if (email.value !== "" && password.value !== ""){            //Se chequea que estén ambos campos
    sessionStorage.setItem("logged_in", true);                     //Asigna un par de valores de session storage, válidos hasta que se cierre la pestaña
    window.location.href = "index.html";                          //Si están los dos, se carga la portada del sitio.
}
})
