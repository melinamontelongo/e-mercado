//Tarifas de envío
const shippingPremiumFee = 0.15;
const shippingExpressFee = 0.07;
const shippingStandardFee = 0.05;

//Subtotal de todos los productos y el costo de envío
let subtotalCost = 0;
let shippingFee = 0;
//Símbolos de monedas que utiliza la página
let DOLLAR_SYMBOL = "USD";
let PESO_SYMBOL = "UYU";
//Valor de cambio de UYU a USD
let exchangeRate = undefined;

//Arrays para los productos del servidor y locales
let fetchedCart = [];
let localCart = [];

//Carrito local
let storedLocalCart = JSON.parse(localStorage.getItem("userCart"));

//Donde irán los productos del carrito
let cartProductsContainer = document.getElementById("cartProducts");

//Función para mostrar los productos que recibe por parámetro
function showCartProducts(cartArray) {
  if (cartArray.length > 0) { //si el carrito no está vacío
    for (let i = 0; i < cartArray.length; i++) {
      let cartProd = cartArray[i];

      cartProductsContainer.innerHTML +=
        `
          <tr id="cartProduct${cartProd.id}" data-id="${cartProd.id}" class="align-middle cart-row">
            <td class="col-2 text-center"><img src="${cartProd.image}" class="img-fluid w-75 shadow bg-body rounded cart-prod-img" onclick="setProductID(${cartProd.id})"></td>
            <td class="col-2"><p>${cartProd.name}</p></td>
            <td class="col-2"><p>${cartProd.currency} ${cartProd.unitCost}</p></td>
            <td class="col-2"><div class="col-12 col-lg-6"><input type="number" min="1" class="form-control" id="quantity${cartProd.id}" name="itemQuantity" value="1" required oninput="setSubtotal(${cartProd.id}, '${cartProd.currency}', ${cartProd.unitCost})"></div>
            <div class="invalid-feedback">
            La cantidad debe ser mayor a 0
            </div></td>
            <td class="col-2"><p class="cart-prod-subtotal fw-bold" id="subtotal${cartProd.id}">${cartProd.currency} ${cartProd.unitCost}</p></td>
            <td class="col-1"><span class="fa-solid fa-trash-can" onclick="removeCartItem(${cartProd.id})"></span></td>
          </tr>
            `
    }
  }
  setTotalCost();
}
//Define el subtotal correspondiente al input
function setSubtotal(id, currency, cost) {
  let input = document.getElementById(`quantity${id}`);
  if (input.value != "") {
    document.getElementById(`subtotal${id}`).innerHTML = `${currency} ${cost * parseInt(input.value)}`
  }
  setTotalCost();
  /*   let itemToUpdate = storedLocalCart.find(item => item.id == id);
    itemToUpdate.count = input.value;
    localCart = storedLocalCart;
    localCart.forEach(item => {
      if (item.id != itemToUpdate.id){
        localCart.push(itemToUpdate);
        localStorage.setItem("userCart", JSON.stringify(localCart));
  
      }
    }); */
}
//Chequea si hay items en el carrito local y los muestra
function retrieveLocalCart() {
  if (storedLocalCart) {
    localCart = storedLocalCart;
    showCartProducts(localCart)
  }
}
//Llamada en el ícono de eliminar
//Elimina el item
function removeCartItem(id) {
  if (storedLocalCart) {
    for (let i = 0; i < storedLocalCart.length; i++) {
      let item = storedLocalCart[i];
      //si el id del producto almacenado coincide con el que quiere remover el usuario
      if (item.id == id) {
        //lo remueve del array
        storedLocalCart.splice(i, 1)
        //sobre-escribe el array en localStorage pero sin el producto eliminado
        localStorage.setItem("userCart", JSON.stringify(storedLocalCart))
      }
    }
  }
  document.getElementById(`cartProduct${id}`).innerHTML = "";
  setTotalCost();
}
//Función que determina el costo total del carrito(subtotal, tarifa de envío y total)
function setTotalCost() {
  shippingCost();

  const subtotalContainer = document.getElementById("totalCostSubtotal");
  const shippingContainer = document.getElementById("totalCostShipping");
  const totalContainer = document.getElementById("totalCostTotal");

  let itemsSubtotal = document.querySelectorAll('[id^="subtotal"]');//obtiene todos los subtotales
  if (itemsSubtotal.length > 0){
    let subtotalArr = Array.from(itemsSubtotal).map((item) => { //los convierte a array y mapea para extraer solo los valores
      if (item.innerHTML.includes(PESO_SYMBOL)) {
        return parseInt(item.innerHTML.split(" ")[1]) / exchangeRate;
      } else {
        return parseInt(item.innerHTML.split(" ")[1]);
      }
    })
  
  
    subtotalCost = Math.round(subtotalArr.reduce((prev, curr) => prev + curr)) //los suma para obtener el subtotal
    let totalShippingCost = Math.round(subtotalCost * shippingFee);
    subtotalContainer.innerHTML = `<p>USD ${subtotalCost}</p>`
    shippingContainer.innerHTML = `<p>USD ${totalShippingCost}</p>`
    totalContainer.innerHTML = `<p class="fw-bold">USD ${subtotalCost + totalShippingCost}</p>`
  } 
}
//Función que maneja las opciones de envío
//La que ya viene checked por defecto
//Y la que el usuario elija
function shippingCost() {
  let shippingControls = document.getElementsByName("shippingMethod");
  let selectedControlDefault = Array.from(shippingControls).find(control => control.checked)
  setShippingFee(selectedControlDefault.id)
  shippingControls.forEach(control => {
    control.addEventListener("change", (e) => {
      e.stopImmediatePropagation();
      setShippingFee(e.target.id)
      setTotalCost();
    })
  })
}
//Función que determina la tarifa de envío según la opción seleccionada
function setShippingFee(option) {
  switch (option) {
    case "shippingPremium":
      shippingFee = shippingPremiumFee;
      break;
    case "shippingExpress":
      shippingFee = shippingExpressFee;
      break;
    case "shippingStandard":
      shippingFee = shippingStandardFee;
      break;
  }
}
//Función que se encarga de manejar las opciones de pago 
  //deshabilita o habilita los inputs de pago según lo elegido
  //llama a la función que valida que estén todos los campos de la opción elegida
  //muestra la opción y chequea el radio para validar la sección de pago
  function paymentMethod() {
  let modal = document.getElementById("paymentMethodModal");
  let displayMethod = document.getElementById("selectedPaymentMethod");
  let creditCardControls = document.querySelectorAll(".credit-card-form-control");
  let bankTransferControls = document.querySelectorAll(".bank-transfer-form-control");

  modal.addEventListener("shown.bs.modal", () => {
    let chosenPaymentMethod = document.getElementsByName("paymentMethod");
    let paymentMethodCheck = document.getElementById("paymentMethodCheck");
    let isChosen = false; //Variable para controlar que haya sido elegida alguna opción
    let chosenOptionInputs = []; //Array para almacenar los inputs de la opción elegida
    chosenPaymentMethod.forEach(input => {
      input.addEventListener("change", (e) => {
        switch (e.target.id) {
          case "creditCard":
            isChosen = true;
            chosenOptionInputs = creditCardControls;
            creditCardControls.forEach(control => { //controles de pago con tarjeta
              control.removeAttribute("disabled"); //remueve el disabled si lo tiene
            });
            bankTransferControls.forEach(control => { //controles de pago con transferencia
              control.setAttribute("disabled", "");  //los desahabilita porque fue seleccionada la otra opción
            });
            break;
          case "bankTransfer":
            isChosen = true;
            chosenOptionInputs = bankTransferControls;
            bankTransferControls.forEach(control => {
              control.removeAttribute("disabled");
            });
            creditCardControls.forEach(control => { //controles de pago con tarjeta
              control.setAttribute("disabled", ""); //remueve el disabled si lo tiene
            });
            break;
        }
        displayMethod.innerHTML = `${e.target.nextElementSibling.innerHTML}`;
      })
    });
    modal.addEventListener("hidden.bs.modal", () => { //cuando el usuario cierra el modal se valida que estén los campos completos
      if (validateInputs(chosenOptionInputs) && isChosen) { //si están completos cualquiera de los dos y si fue elegida una opción
        paymentMethodCheck.setAttribute("checked", "") //chequea el radio que funciona de control para la sección del modal
        chosenOptionInputs.forEach(input => {
          input.classList.add("is-valid")
        });
      } else {
        chosenOptionInputs.forEach(input => {
          input.classList.add("is-invalid")
        });
      };
    })
  })
}
//Función que realiza la validación correspondiente de acuerdo a los inputs que reciba
 function validateInputs(inputs) {
  let validInputs = false;
  let isInputText = false;
  let isInputNum = false;
  let isInputRadio = false;
  let inputsToValidate;

  //Recorre lo recibido para chequear su tipo
  inputs.forEach(input => {
    input.classList.remove("is-invalid");
    switch (input.type) {
      case "text":
        isInputText = true;
        break;
      case "number":
        isInputNum = true;
        break;
      case "radio":
        isInputRadio = true;
        break;
    }
  }); 
  //Según su tipo corrobora que cumplan con las condiciones para validar
  if (isInputText) {
    inputsToValidate = Array.from(inputs).filter(input => input.value.trim() == "");
    if (inputsToValidate.length == 0) {
      validInputs = true;
    } 
  } if (isInputNum) {
    inputsToValidate = Array.from(inputs).filter(input => input.value.trim() == "" || parseInt(input.value) <= 0)
    if (inputsToValidate.length == 0) {
      validInputs = true;
    }
  }
  else if (isInputRadio) {
    inputsToValidate = Array.from(inputs).find(input => input.checked);
    if (inputsToValidate != undefined) {
      validInputs = true;
    } 
  }
  return validInputs;
}  
//Función que valida el formulario
 function validateForm() {
  paymentMethod();
  let form = document.getElementById("cartForm");
  let shippingAddressInputs = document.querySelectorAll('[name^="address"]');
  let quantityInputs = document.getElementsByName("itemQuantity")
  let shippingRadioInputs = document.getElementsByName("shippingMethod");

  form.addEventListener("submit", (e) => {
    form.classList.add('was-validated');
    e.preventDefault()
    if (validateInputs(shippingAddressInputs) && validateInputs(quantityInputs) && validateInputs(shippingRadioInputs) && form.checkValidity()){
      document.getElementById("buy-alert-success").classList.replace("d-none", "d-block"); //se muestra la alerta de success
      let allCartItems = document.querySelectorAll(".cart-row"); 
      allCartItems.forEach(cartItem => {
       removeCartItem(cartItem.dataset.id);//se remueven los items del carrito para simular la compra
      });
    } else { 
      e.preventDefault();
      e.stopPropagation();
    }
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

document.addEventListener("DOMContentLoaded", () => {
  showUser();
  //por esta vez el usuario es estático
  let user = 25801;
  //se concatena para obtener la información 
  getJSONData(CART_INFO_URL + user + EXT_TYPE).then(result => { //petición al carrito del user
    if (result.status === "ok") {
      fetchedCart = result.data.articles; //se almacenan solo los artículos
      localStorage.setItem("fetchedItems", JSON.stringify(fetchedCart));
      getCurrencyRate().then(() => {
        showCartProducts(fetchedCart);
        retrieveLocalCart();
        validateForm();
      });

    }
  })
})