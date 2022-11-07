//Formulario
let form = document.getElementById("userProfileForm");

//Todos los inputs:
let allInputs = document.querySelectorAll(".form-control");

//Todos los inputs individualmente:
let fName = document.getElementById("firstName");
let sName = document.getElementById("secondName");
let fSurname = document.getElementById("firstSurname");
let sSurname = document.getElementById("secondSurname");
let email = document.getElementById("userEmail");
let phone = document.getElementById("userPhone");
let pictureInput = document.getElementById("profilePicFile");

//Elemento donde se muestra la foto
let profilePic = document.getElementById("userProfilePic");

//Función que muestra el estado de validación de los elementos ya que no se usa la clase was-validated
function visualValidation() {
    allInputs.forEach(input => {
        if (!input.checkValidity()) {
            input.classList.add("is-invalid");
        } else {
            input.classList.remove("is-invalid");
        }
        input.addEventListener("input", visualValidation);
    })
}

//Función que muestra la información de perfil almacenada
function showProfileInfo() {
    //Realiza la petición
    getSpecificInfo(currentUserID, USERS_URL).then(res => {
        if (res.status === "ok"){ //Si la petición fue exitosa
            let user = res.data;
            fName.value = user.firstName;
            sName.value = user.secondName;
            fSurname.value = user.firstSurname;
            sSurname.value = user.secondSurname;
            email.value = user.email;
            phone.value = user.phone;
            //Si tiene imagen, la muestra
            if (user.picture != undefined && user.picture != "") {
                profilePic.src = user.picture;
            }
            pictureInput.addEventListener("change", () => {
                convertPic(pictureInput.files[0]) 
            })
        } else { //Si no lo fue, crea una alerta
            createBSAlert("Ha ocurrido un error. Intenta más tarde", "danger");
        }
    })
}

//Función que guarda la información de perfil
function storeProfileInfo() {
    let pictureFile = pictureInput.files[0];
    let convertedPic = ""
    let modifiedUser = { //Define la estructura del usuario a modificar tomando los nuevos valores
        "firstName": fName.value,
        "secondName": sName.value,
        "firstSurname": fSurname.value,
        "secondSurname": sSurname.value,
        "email": email.value,
        "phone": phone.value,
        "picture": ""
    }
    if (pictureFile != null) {
        convertPic(pictureFile);
        convertedPic = localStorage.getItem("userProfilePic");
        modifiedUser.picture = convertedPic;
    }
    putInfo(modifiedUser, currentUserID, USERS_URL).then((res)=>{
        if (res.status === "ok"){
           createBSAlert("¡Cambios guardados correctamente!", "success");
        } else { //Si el status es debido a los límites de almacenamiento del "servidor"
            createBSAlert("Ha sucedido un error. Intenta con una imagen más pequeña", "danger")
        }
    })
}

//Función que convierte la foto mediante fileReader, la muestra y la guarda
function convertPic(picture) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
        let imageURL = reader.result;
        profilePic.src = imageURL; //Muestra la imagen
        localStorage.setItem("userProfilePic", imageURL) //La almacena para obtenerla luego
    });
    reader.readAsDataURL(picture); 
}

//Función que realiza la validación del formulario y almacena el perfil si todo está correcto
function validateForm() {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopPropagation();
        // form.classList.add('was-validated'); No se agrega porque por defecto muestra :valid en los no-required
        visualValidation();
        if (form.checkValidity()) {
            storeProfileInfo();
        }
    })
}

document.addEventListener("DOMContentLoaded", () => {
    showUser();
    showProfileInfo();
    validateForm();
})