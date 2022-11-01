const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";
const PUBLISH_PRODUCT_URL = "https://japceibal.github.io/emercado-api/sell/publish.json";
const PRODUCTS_URL = "https://japceibal.github.io/emercado-api/cats_products/";
const PRODUCT_INFO_URL = "https://japceibal.github.io/emercado-api/products/";
const PRODUCT_INFO_COMMENTS_URL = "https://japceibal.github.io/emercado-api/products_comments/";
const CART_INFO_URL = "https://japceibal.github.io/emercado-api/user_cart/";
const CART_BUY_URL = "https://japceibal.github.io/emercado-api/cart/buy.json";
const EXT_TYPE = ".json";
//Símbolos de monedas que utiliza la página
const DOLLAR_SYMBOL = "USD";
const PESO_SYMBOL = "UYU";
//Valor de cambio de UYU a USD
let exchangeRate = undefined;

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

//Función que guarda el id del producto en localStorage y redirecciona
function setProductID(id) {
  localStorage.setItem("productID", id);
  window.location = "product-info.html"
}

//Modularización para obtener el usuario para las funcionalidades que lo requieran
function getUser(){   
  let user = "";
  if (localStorage.getItem("user")){
    user = localStorage.getItem("user");
    return user
  } else if (sessionStorage.getItem("user")){
    user = sessionStorage.getItem("user");
    return user
  } else {
    window.location = "login.html" 
  }
}

//Nueva función para mostrar el usuario en el nav de todas las páginas
//Funcionalidad de cerrar sesión esta vez en un dropdown
function showUser() {
  let user = getUser();
  let userField = document.querySelectorAll(".nav-item")[3];
  userField.classList.add("dropdown");
  userField.innerHTML =
    `<a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
    <span class="me-2 fa fa-user"></span> 
    ${user}
    </a>
<ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark text-start">
  <li><a class="dropdown-item" href="cart.html"><span class="me-2 fa-solid fa-cart-shopping"></span>Mi carrito</a></li>
  <li><a class="dropdown-item" href="my-profile.html"><span class="me-2 fa-solid fa-address-card"></span>Mi perfil</a></li>
  <li><a class="dropdown-item" href="#" id="log-out"><span class="me-2 fa-solid fa-person-walking-arrow-right"></span>Cerrar sesión</a></li>
</ul>
</li>`
  document.getElementById("log-out").addEventListener("click", function () {
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userProfilePic");
    localStorage.removeItem("userCart");
    sessionStorage.removeItem("user");
    window.location = "login.html";
  })
}

//Almacena una cookie 
  //Se utiliza para setear el cambio del día
  function setCookie(cName, cValue, exDays){
    let date = new Date();
    date.setTime(date.getTime() + (exDays*24*60*60*1000))
    let expires = `expires=${date.toUTCString()}`;
    document.cookie = `${cName}=${cValue};${expires};path=/`;
  }
  //Obtiene una cookie
    //Se utiliza para obtener el cambio del día
  function getCookie(cName) {
    let cookie = {};
    document.cookie.split(';').forEach( (c)=> {
    let [key,value] = c.split('=');
    cookie[key.trim()] = value;
  })
    return cookie[cName]; 
  }
//Realiza la conversión de UYU a USD
function USDConversion(cost){
  let result;
  result = Math.round(cost / exchangeRate)
  return result
}
  //Función que obtiene el valor de cambio de UYU a USD 
      //Si no existen cookies para el valor, lo obtiene mediante un fetch
  async function getCurrencyRate() {
    if (getCookie("currencyRate")) {//Chequea si existe la cookie
      exchangeRate = await getCookie("currencyRate"); 
    } else {
      let reqURL = `https://api.apilayer.com/exchangerates_data/latest?symbols=${PESO_SYMBOL}&base=${DOLLAR_SYMBOL}`
      let reqHeader = new Headers();
      reqHeader.append("apikey", "6K8EIKfAxplcDrl3Ee39iZXAFUnmW1KZ");
      let reqOptions = {
        method: 'GET',
        redirect: 'follow',
        headers: reqHeader
      };
      let dataRequest = await fetch(reqURL, reqOptions)
      let data = await dataRequest.json()
      exchangeRate = data.rates.UYU;
      setCookie("currencyRate", exchangeRate, 1) //Para que el valor se actualice cada día
    }
  }
