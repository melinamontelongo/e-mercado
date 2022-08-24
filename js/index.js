function checkLogin(){                  //Chequea si ya fue realizado el login
    if (!localStorage.getItem("user")){ //Si no se encuentra un valor asociado al item, redirecciona al login
        window.location = "login.html"
    }
}

document.addEventListener("DOMContentLoaded", function(){
    checkLogin(); //Llama a la función 
    showUser();   //Muestra al usuario en la barra de navegación
    document.getElementById("autos").addEventListener("click", function() {
        localStorage.setItem("catID", 101);
        window.location = "products.html"
    });
    document.getElementById("juguetes").addEventListener("click", function() {
        localStorage.setItem("catID", 102);
        window.location = "products.html"
    });
    document.getElementById("muebles").addEventListener("click", function() {
        localStorage.setItem("catID", 103);
        window.location = "products.html"
    });
});