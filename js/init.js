const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";
const PUBLISH_PRODUCT_URL = "https://japceibal.github.io/emercado-api/sell/publish.json";
const PRODUCTS_URL = "https://japceibal.github.io/emercado-api/cats_products/";
const PRODUCT_INFO_URL = "https://japceibal.github.io/emercado-api/products/";
const CART_BUY_URL = "https://japceibal.github.io/emercado-api/cart/buy.json";
const USERS_URL = `https://63645a8f8a3337d9a2f5d652.mockapi.io/users/` //"base de datos" de todos los usuarios
const COMMENTS_URL = `https://63645a8f8a3337d9a2f5d652.mockapi.io/comments/` //"base de datos" de comentarios agregados por los usuarios
const EXT_TYPE = ".json";
//Símbolos de monedas que utiliza la página
const DOLLAR_SYMBOL = "USD";
const PESO_SYMBOL = "UYU";
//Valor de cambio de UYU a USD
let exchangeRate = undefined;
//ID del usuario actual (para hacer las peticiones necesarias, se almacena en el login)
let currentUserID = localStorage.getItem("userID");
//ID del producto actual (para agregar el comentario del usuario a determinado producto)
let currentProductDB_ID = undefined;

function showSpinner(){
  document.getElementById("spinner-wrapper").style.display = "block";
}
function hideSpinner(){
  document.getElementById("spinner-wrapper").style.display = "none";
}
//Función que guarda el id del producto en localStorage y redirecciona
function setProductID(id) {
  localStorage.setItem("productID", id);
  window.location = "product-info.html"
}
//Función que guarda el id de la categoría en localStorage y redirecciona
function setCatID(id) {
  localStorage.setItem("catID", id);
  window.location = "products.html"
}
//Modularización para obtener el usuario para las funcionalidades que lo requieran
function getUser() {
  let user = "";
  if (localStorage.getItem("user")) {
    user = localStorage.getItem("user");
    return user
  } else if (sessionStorage.getItem("user")) {
    user = sessionStorage.getItem("user");
    return user
  } else {
    window.location = "login.html"
  }
}
//Nueva función para mostrar el usuario en el nav de todas las páginas
//Funcionalidad de cerrar sesión en un dropdown
function showUser() {
  let user = getUser();
  let userField = document.querySelectorAll(".nav-item")[3]; //Obtiene el elemento donde irá el correo del usuario
  userField.classList.add("dropdown");//Lo convierte en un dropdown
  userField.innerHTML = //Le agrega lo siguiente para mostrar al usuario y las opciones correspondientes.
    `<a class="nav-link link-light dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
    <span class="me-2 fa fa-user text-dark"></span> 
    ${user}
    </a>
<ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark bg-light-indigo text-start">
  <li><a class="dropdown-item" href="cart.html"><span class="me-2 fa-solid fa-cart-shopping text-dark"></span>Mi carrito</a></li>
  <li><a class="dropdown-item" href="my-profile.html"><span class="me-2 fa-solid fa-address-card text-dark"></span>Mi perfil</a></li>
  <li><a class="dropdown-item" href="#" id="log-out"><span class="me-2 fa-solid fa-person-walking-arrow-right text-dark"></span>Cerrar sesión</a></li>
</ul>
</li>`
  document.getElementById("log-out").addEventListener("click", function () {
    localStorage.removeItem("user"); //Remueve el correo del usuario almacenado 
    sessionStorage.removeItem("user");//Remueve el correo del usuario almacenado 
    localStorage.removeItem("userID"); //Remueve el valor que identifica al usuario en la base de datos
    localStorage.removeItem("userProfilePic");//Remueve la foto de perfil del usuario
    window.location = "login.html";//Redirecciona
  })
}
//Función que crea y muestra el modal con el aviso de uso de Cookies. 
//Una vez mostrado se guarda el consentimiento en sessionStorage
function cookiesAlert(){
  if (!sessionStorage.getItem("cookieConsent")){
    let newDiv = document.createElement("div");
    newDiv.classList.add("modal");
    newDiv.setAttribute("tabindex", "-1");
    newDiv.innerHTML = `<div class="modal-dialog modal-dialog-centered">
    <div class="modal-content bg-dark text-light">
      <div class="modal-header border-pink">
        <h5 class="modal-title"><i class="me-2 fa-solid fa-cookie-bite text-light-indigo"></i>Aviso de Cookies</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Este sitio utiliza cookies para mejorar tu experiencia. Si continúas, se considera que aceptas el uso de cookies</p>
      </div>
      <div class="modal-footer border-pink">
        <button type="button" class="btn btn-light-indigo" data-bs-dismiss="modal">Entendido</button>
      </div>
    </div>
  </div>`
  document.body.appendChild(newDiv)
  let cookieModal = new bootstrap.Modal(newDiv)
  cookieModal.show()
  newDiv.addEventListener("hide.bs.modal", ()=>{
    sessionStorage.setItem("cookieConsent", true);
  })
  }
}
//Función que crea alertas de bootstrap personalizadas
function createBSAlert(message, type) {
  let newAlertContainer = document.createElement("div"); //Crea el elemento contenedor
  document.body.append(newAlertContainer); //Lo agrega al body
  let newAlert = document.createElement('div');//Crea el que contiene la alerta
  let alertID = Math.round(Math.random() * 1000); //Le agrega un id aleatorio para referenciarlo
  newAlert.innerHTML = //Define su contenido de acuerdo a los parámetros especificados (tipo y mensaje)
    `<div class="alert alert-${type} alert-dismissible text-center" id="alert${alertID}" role="alert">
         <span>${message}</span>
         <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`
  newAlertContainer.append(newAlert); //Agrega la alerta al contenedor
  document.getElementById(`alert${alertID}`).classList.add("show"); //Obtiene la alerta y la muestra
}
//Almacena una cookie 
//Se utiliza para setear el cambio del día
function setCookie(cName, cValue, exDays) {
  let date = new Date();
  date.setTime(date.getTime() + (exDays * 24 * 60 * 60 * 1000))
  let expires = `expires=${date.toUTCString()}`;
  document.cookie = `${cName}=${cValue};${expires};path=/`;
}
//Obtiene una cookie
//Se utiliza para obtener el cambio del día
function getCookie(cName) {
  let cookie = {};
  document.cookie.split(';').forEach((c) => {
    let [key, value] = c.split('=');
    cookie[key.trim()] = value;
  })
  return cookie[cName];
}
//Realiza la conversión de UYU a USD
function USDConversion(cost) {
  let result;
  result = Math.round(cost / exchangeRate)
  return result
}
//Función que obtiene el valor de cambio de UYU a USD 
//Si no existen cookies para el valor, lo obtiene mediante un fetch
async function getCurrencyRate() {
  showSpinner();
  if (getCookie("currencyRate")) {//Chequea si existe la cookie
    exchangeRate = await getCookie("currencyRate");
    hideSpinner();
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
    hideSpinner();
    setCookie("currencyRate", exchangeRate, 1) //Para que el valor se actualice cada día
  }
}
//Función asíncrona que realiza un get request a la base de datos que se requiera
async function getInfo(url) {
  showSpinner();
  let result = {};
  let reqOptions = {
    method: 'GET',
  };
  try {
    let getReq = await fetch(url, reqOptions);
    let getRes = await getReq.json();
    if (getReq.ok){
      result.status = "ok";
      result.data = getRes;
    } 
    hideSpinner();
    return result;
  }
  catch (error) {
    console.error(error);
    hideSpinner();
    return error;
  }
}
async function getSpecificInfo(id, url){
  showSpinner();
  let result = {};
  let reqOptions = {
    method: 'GET',
  };
  try {
    let getReq = await fetch(url+id, reqOptions);
    let getRes = await getReq.json();
    if (getReq.ok){
      result.status = "ok";
      result.data = getRes;
    } 
    hideSpinner();
    return result;
  }
  catch (error) {
    console.error(error);
    hideSpinner();
    return error;
  }
}
//Función asíncrona que realiza un post request con la info del parámetro
async function postInfo(info, url) {
  let result = {};
  showSpinner();
  let reqOptions = {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(info)
  };
  try {
    let postReq = await fetch(url, reqOptions);
    let postRes = await postReq.json();
    if (postReq.ok) { //Si la solicitud se realizó correctamente
      result.status = "ok"
      result.data = postRes;
    } 
    hideSpinner();
    return result;
  } catch (error) {
    console.error(error);
    hideSpinner();
    return error;
  }
}
//Función asíncrona que realiza un put request con la info y el id de los parámetros
async function putInfo(info, id, url) {
  let result = {};
  showSpinner();
  let reqOptions = {
    method: 'PUT',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(info)
  };
  try {
    let putReq = await fetch(url + id, reqOptions);
    let putRes = await putReq.json();
    if (putReq.ok) { //Si la solicitud se realizó correctamente
      result.status = "ok"
      result.data = putRes;
    }
    hideSpinner();
    return result;
  } catch (error) {
    console.error(error);
    hideSpinner();
    return error;
  }
}