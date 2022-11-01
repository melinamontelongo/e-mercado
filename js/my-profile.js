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
let picture = document.getElementById("profilePicFile");

function visualValidation(){
    allInputs.forEach(input => {
        if (!input.checkValidity()){
            input.classList.add("is-invalid");
        } else {
            input.classList.remove("is-invalid");
            }
        input.addEventListener("input", visualValidation);
    })
}

function showProfileInfo(){
    let profilePic = document.getElementById("userProfilePic");
    let storedPic = localStorage.getItem("userProfilePic");
    let storedInfo = JSON.parse(localStorage.getItem("userProfile"));
    if (storedPic){
        profilePic.src = storedPic;
    }
     if (storedInfo){
        fName.value = storedInfo.firstName;
        sName.value = storedInfo.secondName;
        fSurname.value = storedInfo.firstSurname;
        sSurname.value = storedInfo.secondSurname;
        email.value = storedInfo.email;
        phone.value = storedInfo.phone; 
    } else if (!storedInfo){
        email.value = getUser();
    }

}

function storeProfileInfo(){
let pictureFile = picture.files[0];
let allValid = false;

allInputs.forEach(input => {
    if (input.checkValidity()){
        allValid = true;
    }
})
if (allValid){
    let user = {
        "firstName": fName.value,
        "secondName": sName.value,
        "firstSurname": fSurname.value,
        "secondSurname": sSurname.value,
        "email": email.value,
        "phone": phone.value
    }
    localStorage.setItem("userProfile", JSON.stringify(user));
}
if (pictureFile != ""){
    convertPic(pictureFile);
}
showProfileInfo();
}

function convertPic(picture){
    let reader = new FileReader();
    reader.addEventListener("load", () => {
        let imageURL = reader.result;
        localStorage.setItem("userProfilePic", imageURL)
    });
    reader.readAsDataURL(picture);
}
function validateForm(){
    form.addEventListener("submit", (e)=> {
       // form.classList.add('was-validated'); No se agrega porque por defecto muestra :valid en los no-required
        visualValidation();
        if (form.checkValidity()){
            storeProfileInfo();
        }
        else {
            e.preventDefault();
            e.stopPropagation();
        }
    })
}

document.addEventListener("DOMContentLoaded", ()=> {
    showUser();
    validateForm();
    showProfileInfo();
})