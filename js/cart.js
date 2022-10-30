//Tarifas de envío
const shippingPremiumFee = 0.15;
const shippingExpressFee = 0.07;
const shippingStandardFee = 0.05;

//Subtotal de todos los productos y el costo de envío
let subtotalCost = 0;
let shippingFee = 0;

//Arrays para los productos del servidor y locales
let fetchedCart = [];
let localCart = [];

//Carrito local
let storedLocalCart = JSON.parse(localStorage.getItem("userCart"));
let storedFetchedCart = JSON.parse(localStorage.getItem("fetchedItems"))

//Donde irán los productos del carrito
let cartProductsContainer = document.getElementById("cartProducts");

//Función para mostrar los productos que recibe por parámetro
function showCartProducts(cartArray) {
  if (cartArray.length > 0) { //si el carrito no está vacío
    for (let i = 0; i < cartArray.length; i++) {
      let cartProd = cartArray[i];
      let currentValue = undefined; //Cantidad del producto en cada iteración
      //Si la moneda es en pesos, lo convierte y muestra en dólares
      if (cartProd.currency == PESO_SYMBOL) {
        cartProd.unitCost = USDConversion(cartProd.unitCost);
        cartProd.currency = DOLLAR_SYMBOL;
      }
      cartProductsContainer.innerHTML +=
        `
            <tr id="cartProduct${cartProd.id}" data-id="${cartProd.id}" class="align-middle cart-row">
              <td class="col-2 text-center">
                <img src="${cartProd.image}" class="img-fluid w-75 shadow bg-body rounded cart-prod-img" onclick="setProductID(${cartProd.id})"></td>
              <td class="col-2">
                <p>${cartProd.name}</p>
              </td>
              <td class="col-2 cart-prod-cost">
                <p>${cartProd.currency} ${cartProd.unitCost}</p>
              </td>
              <td class="col-2">
                <div class="col-12 col-lg-6">
                  <input type="number" min="1" class="form-control" id="quantity${cartProd.id}" name="itemQuantity${cartProd.id}" form="cartForm"
                  value="${cartProd.count}" pattern=".*\S+" oninput="setSubtotalByQuantity('${cartProd.id}', '${cartProd.currency}', '${cartProd.unitCost}')" required>
                <div class="invalid-feedback">
                  La cantidad debe ser mayor a 0
                </div>
                </div>
              </td>
              <td class="col-2 cart-prod-subtotal">
                <p class="fw-bold" id="subtotal${cartProd.id}">${cartProd.currency} ${cartProd.unitCost}</p>
              </td>
              <td class="col-1">
                <span class="fa-solid fa-trash-can" onclick="removeCartItem(${cartProd.id})"></span>
              </td>
            </tr>
              `
      //Para mostrar el subtotal de cada producto dependiendo de la cantidad sin depender del evento oninput 
      currentValue = parseInt(document.getElementById(`quantity${cartProd.id}`).value);
      document.getElementById(`subtotal${cartProd.id}`).innerHTML = `${cartProd.currency} ${cartProd.unitCost * currentValue}`
    }
  }
  setTotalCost();
}
//Define el subtotal correspondiente al input
function setSubtotalByQuantity(id, currency, cost) {
  let input = document.getElementById(`quantity${id}`);
  let subtotalContainer = document.getElementById(`subtotal${id}`);
  if (input.value != "") {
    subtotalContainer.innerHTML = `${currency} ${cost * parseInt(input.value)}`
    updateStorageQuantity(id, input.value)
  }
  setTotalCost();
}
//Función que actualiza la cantidad en localStorage
function updateStorageQuantity(productID, quantity) {
  let itemToUpdate = undefined;
  if (fetchedCart.find(item => item.id == productID) != undefined) {//Si el producto está en el array de los traídos con la petición
    itemToUpdate = storedFetchedCart.find(item => item.id == productID);
    itemToUpdate.count = parseInt(quantity);
    localStorage.setItem("fetchedItems", JSON.stringify(storedFetchedCart));
  }
  else if (localCart.find(item => item.id == productID) != undefined) { //O si es uno agregado de forma local
    itemToUpdate = storedLocalCart.find(item => item.id == productID); //Lo encuentra
    itemToUpdate.count = parseInt(quantity); //Le actualiza la cantidad
    localStorage.setItem("userCart", JSON.stringify(storedLocalCart)); //Lo almacena con el cambio
  }
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
  if (itemsSubtotal.length > 0) {
    let subtotalArr = Array.from(itemsSubtotal).map((item) => { //los convierte a array y mapea para extraer solo los valores
      return parseInt(item.innerHTML.split(" ")[1]);
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
function paymentMethod() {
  let displayMethod = document.getElementById("selectedPaymentMethod");
  let creditCardControls = document.querySelectorAll(".credit-card-form-control");
  let bankTransferControls = document.querySelectorAll(".bank-transfer-form-control");
  let methodsToChoose = document.querySelectorAll(".paymentMethodsToChoose");

  methodsToChoose.forEach(input => {
    input.addEventListener("change", (e) => {
      switch (e.target.id) {
        case "creditCard": //Fue elegida tarjeta de crédito
          creditCardControls.forEach(control => { //Controles de pago con tarjeta
            control.removeAttribute("disabled"); //Los habilita
          });
          bankTransferControls.forEach(control => { //Controles de pago con transferencia
            control.setAttribute("disabled", "");  //Los deshabilita
            control.classList.remove("is-invalid") //Para evitar que se siga mostrando el campo con error aunque se haya seleccionado la otra opción
          });
          break;
        case "bankTransfer": //Fue elegida transferencia bancaria
          chosenPaymentMethodInputs = bankTransferControls
          bankTransferControls.forEach(control => {//Controles de pago con transferencia
            control.removeAttribute("disabled"); //Los habilita
          });
          creditCardControls.forEach(control => { //Controles de pago con tarjeta
            control.setAttribute("disabled", ""); //Los deshabilita
            control.classList.remove("is-invalid") //Para evitar que se siga mostrando el campo con error aunque se haya seleccionado la otra opción
          });
          break;
      }
      displayMethod.innerHTML = `${e.target.nextElementSibling.innerHTML}`; //Se muestra la opción elegida
    })
  })
};
//Función que mejora visualmente la experiencia de usuario al ser llamada en eventos 
  //Muestra la validación del elemento en tiempo real
function validateInput(input) {
  if (!input.checkValidity()) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid")
  } else {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid")
  }
}
//Función que valida el formulario
function validateForm() {
  //Formulario
  let form = document.getElementById("cartForm");
  //Inputs de cantidad de producto
  let quantityInputs = document.querySelectorAll('[id^="quantity"]');
  //Radios del modal
  let creditCard = document.getElementById("creditCard");
  let bankTransfer = document.getElementById("bankTransfer");
  //Check
  let paymentMethodCheck = document.getElementById("paymentMethodCheck");
 
  paymentMethod(); //Para que se deshabiliten los campos de la opción no elegida
  
  form.addEventListener("submit", (e) => {
    e.preventDefault(); //Se previene el submit porque en este caso no es necesario, solo se va a simular la compra
    e.stopPropagation();
    form.classList.add("was-validated");

    //Para los input de cantidad, muestra su estado de validación onsubmit y luego en tiempo real, no es necesario chequear su validez por el atributo form
    quantityInputs.forEach(input => {
      validateInput(input)
      input.addEventListener("input", ()=> {
        validateInput(input)
      })
    })
    //Se chequean los métodos de pago del modal
      //Si fue elegido el método de tarjeta de crédito
    if (creditCard.checked) {
      //Se obtiene cada input
      let cardNum = document.getElementById("cardNumber");
      let secCode = document.getElementById("securityCode");
      let expDate = document.getElementById("expDate");
      //Y todos los anteriores
      let creditCardControls = document.querySelectorAll(".credit-card-form-control"); 
      if (cardNum.checkValidity() && secCode.checkValidity() && expDate.checkValidity()){ //Si todos son válidos
        paymentMethodCheck.checked = true; //Se chequea el checkbox
      } else {
        paymentMethodCheck.checked = false;
      }
      creditCardControls.forEach(control => { //Se muestra el estado de validación para cada control luego del submit
        validateInput(control)
        control.addEventListener("input", () => { //Y luego en tiempo real
          validateInput(control);
        })
      })
      //Si fue elegido el método de transferencia bancaria, realiza lo mismo que para el método anterior
    } else if (bankTransfer.checked) {
      let bankAccNum = document.getElementById("bankAccNum");
      validateInput(bankAccNum)
      if (bankAccNum.checkValidity()){
        paymentMethodCheck.checked = true;
      } else {
        paymentMethodCheck.checked = false;
      }
      bankAccNum.addEventListener("input", ()=> {
        validateInput(bankAccNum)
      })
    }
//Se sube solo si todos los campos cumplen con lo requerido (atributos: required, pattern, min)
    if (form.checkValidity()) {
      document.getElementById("buy-alert-success").classList.replace("d-none", "d-block"); //Se muestra el mensaje de éxito
      let allCartItems = document.querySelectorAll(".cart-row");
      allCartItems.forEach(cartItem => {
        removeCartItem(cartItem.dataset.id);//Se remueven los items del carrito para simular la compra
      });
      document.getElementById("cart-content").innerHTML = `
      <h4 class="text-center fs-5 text-secondary">
      <span class="fa-solid fa-triangle-exclamation"></span> Ya no tienes productos en tu carrito 
      <span class="fa-solid fa-triangle-exclamation"></span>
      </h4>` //Se avisa al usuario que no hay más productos
    
    } //else {e.preventDefault()} -> no se utiliza porque la idea fue simular la compra, no subirlo
  })
}

document.addEventListener("DOMContentLoaded", () => {
  showUser();
  //por esta vez el usuario es estático
  let user = 25801;
  //se concatena para obtener la información 
  getJSONData(CART_INFO_URL + user + EXT_TYPE).then(result => { //petición al carrito del user
    if (result.status === "ok") {
      fetchedCart = result.data.articles; //se almacenan solo los artículos
      localStorage.setItem("fetchedItems", JSON.stringify(fetchedCart)); //Se guarda en local el carrito traído del servidor
      getCurrencyRate().then(() => { //Función asíncrona (definida en init.js) que obtiene el valor de exchangeRate de la petición o de la cookie si está disponible
        showCartProducts(fetchedCart); //Luego se muestran los productos del carrito obtenido con la petición
        retrieveLocalCart(); //Se chequea el almacenamiento local para mostrar productos si los hay
        validateForm(); //Se valida el formulario
      });
    }
  })
})