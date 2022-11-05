//URL a la "base de datos" de todos los usuarios
const USERS_URL = `https://63645a8f8a3337d9a2f5d652.mockapi.io/users/`

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

//Va a definir el ID que mockapi le da a cada usuario cuando llena su nombre
let currentUserID = 0;

//Función que crea alertas de bootstrap personalizadas
function createBSAlert(message, type) {
    let alertContainer = document.getElementById('profileAlerts');
    let alertWrapper = document.createElement('div');
    let alertID = Math.round(Math.random() * 1000);
    alertWrapper.innerHTML =
        `<div class="alert alert-${type} alert-dismissible text-center" id="alert${alertID}" role="alert">
           <span>${message}</span>
           <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`
    alertContainer.append(alertWrapper);
    document.getElementById(`alert${alertID}`).classList.add("show");
}
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
    getInfo().then(allProfiles => {
        //Encuentra el perfil que corresponde con el email ingresado, para mostrar los datos asociados
        let userProfile = allProfiles.find(profile => profile.email === getUser())
        //Si existe muestra sus propiedades
        if (userProfile != undefined) {
            fName.value = userProfile.firstName;
            sName.value = userProfile.secondName;
            fSurname.value = userProfile.firstSurname;
            sSurname.value = userProfile.secondSurname;
            email.value = userProfile.email;
            phone.value = userProfile.phone;
            //Si tiene imagen, la muestra
            if (userProfile.picture != "") {
                profilePic.src = userProfile.picture;
            }
            /*             isNewUser = false; */
            currentUserID = userProfile.id;
            //Si no existe, muestra solamente el email con el que ingresó, dejando los demás campos vacíos
        } else if (userProfile == undefined) {
            email.value = getUser();
            /*             isNewUser = true; */
        }
        pictureInput.addEventListener("change", () => {
            convertPic(pictureInput.files[0])
        })
    })
}

//Función que guarda la información de perfil
function storeProfileInfo() {
    let pictureFile = pictureInput.files[0];
    let convertedPic = "";
    let user = {
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
        user.picture = convertedPic
    }
    if (currentUserID == 0) { //Si no hay usuario actual
        postInfo(user).then(res => console.log(res)); //Realiza la solicitud de tipo post para agregar al usuario
    } else if (currentUserID > 0) {
        putInfo(user, currentUserID).then(res => console.log(res));
    }

}

//Función que convierte la foto mediante fileReader, la muestra y la guarda
function convertPic(picture) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
        let imageURL = reader.result;
        profilePic.src = imageURL;
        localStorage.setItem("userProfilePic", imageURL)
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
//Función asíncrona que realiza un post request con la info del parámetro
async function postInfo(info) {
    console.log("Making post")
    showSpinner();
    let reqOptions = {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(info)
    };
    try {
        let postReq = await fetch(USERS_URL, reqOptions);
        if (postReq.ok) { //Si la solicitud se realizó correctamente
            hideSpinner();
            createBSAlert("¡Cambios guardados con éxito!", "success")
        }
        let postRes = await postReq.json();
        hideSpinner();
        return postRes;
    }catch (error) {
        console.error(error);
        hideSpinner();
        return error;
    }
}

//Función asíncrona que realiza un put request con la info y el id de los parámetros
async function putInfo(info, id) {
    showSpinner();
    let reqOptions = {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(info)
    };
    try {
        let putReq = await fetch(USERS_URL + id, reqOptions);
        if (putReq.ok) { //Si la solicitud se realizó correctamente
            hideSpinner();
            createBSAlert("¡Cambios guardados con éxito!", "success")
        }
        if (putReq.status === 413) { //Error de payload, en este caso porque la imagen en base64 es muy grande para el servidor
            hideSpinner();
            createBSAlert("Ha ocurrido un error, intenta subiendo otra imagen", "danger")
        }
        let putRes = await putReq.json();
        hideSpinner();
        return putRes;
    } catch (error) {
        console.error(error);
        hideSpinner();
        return error;
    }
}

//Función asíncrona que realiza un get request a todos los usuarios
async function getInfo() {
    showSpinner();
    let reqOptions = {
        method: 'GET',
    };
    try{
        let postReq = await fetch(USERS_URL, reqOptions);
        let postRes = await postReq.json();
        hideSpinner();
        return postRes;
    }
    catch (error) {
        console.error(error);
        hideSpinner();
        return error;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    showUser();
    showProfileInfo();
    validateForm();
})