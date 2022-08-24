const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";
const PUBLISH_PRODUCT_URL = "https://japceibal.github.io/emercado-api/sell/publish.json";
const PRODUCTS_URL = "https://japceibal.github.io/emercado-api/cats_products/";
const PRODUCT_INFO_URL = "https://japceibal.github.io/emercado-api/products/";
const PRODUCT_INFO_COMMENTS_URL = "https://japceibal.github.io/emercado-api/products_comments/";
const CART_INFO_URL = "https://japceibal.github.io/emercado-api/user_cart/";
const CART_BUY_URL = "https://japceibal.github.io/emercado-api/cart/buy.json";
const EXT_TYPE = ".json";

let showSpinner = function () {
  document.getElementById("spinner-wrapper").style.display = "block";
}

let hideSpinner = function () {
  document.getElementById("spinner-wrapper").style.display = "none";
}

let getJSONData = function (url) {
  let result = {};
  showSpinner();
  return fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(function (response) {
      result.status = 'ok';
      result.data = response;
      hideSpinner();
      return result;
    })
    .catch(function (error) {
      result.status = 'error';
      result.data = error;
      hideSpinner();
      return result;
    });
}

//Función para mostrar el usuario en el nav en todas las páginas:
function showUser() {                                        
  let user = localStorage.getItem("user");                    //Obtiene el item asociado al user
  let userField = document.querySelectorAll(".nav-item")[3];  //selecciona el nav item del índice 3 (el último en todos los html)
  let userElement = document.createElement("a");              //crea un nuevo <a></a>
  userField.appendChild(userElement);                         //le agrega un child al nav item seleccionado
  userElement.href = "#"                                      //agrega atributo href
  userElement.classList.add("nav-link");                      //y la clase para el estilo
  userElement.innerHTML = user;                              //Escribe el nombre de usuario en el nuevo elemento
  userElement.addEventListener("click", function () { //Evento de click en el elemento que contiene el nombre de usuario
    if (confirm("¿Desea cerrar sesión?")) {           //para cerrar sesión si el usuario desea
      localStorage.removeItem("user");                //de ser así, elimina el item de user
      window.location = "login.html";                 //y redirecciona al login
    };
  });
}