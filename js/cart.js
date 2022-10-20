let fetchedCart = [];
let localCart = [];
let cartProductsContainer = document.getElementById("cartProducts");
let storedLocalCart = JSON.parse(localStorage.getItem("userCart"));

function showCartProducts(cartArray) {
  if (cartArray != "") { //si el carrito no está vacío
    for (let i = 0; i < cartArray.length; i++) {
      let cartProd = cartArray[i];

      cartProductsContainer.innerHTML +=
        `
          <tr id="cartProduct${cartProd.id}" class="align-middle cart-row">
            <td class="col-2 text-center"><img src="${cartProd.image}" class="img-fluid w-75 shadow bg-body rounded cart-prod-img" onclick="setProductID(${cartProd.id})"></td>
            <td class="col-2"><p>${cartProd.name}</p></td>
            <td class="col-2"><p>${cartProd.currency} ${cartProd.unitCost}</p></td>
            <td class="col-2"><input type="number" min="1" class="form-control w-50" id="quantity${cartProd.id}" min="1" value="1" oninput="setSubtotal(${cartProd.id}, '${cartProd.currency}', ${cartProd.unitCost})"></td>
            <td class="col-2"><p class="cart-prod-subtotal fw-bold" id="subtotal${cartProd.id}">${cartProd.currency} ${cartProd.unitCost}</p></td>
            <td class="col-1"><span class="fa-solid fa-trash-can" onclick="removeCartItem(${cartProd.id})"></span></td>
          </tr>
            `
    }
  }
}

//Define el subtotal correspondiente al input
function setSubtotal(id, currency, cost) {
  let input = document.getElementById(`quantity${id}`);
  if (input.value != "") {
    document.getElementById(`subtotal${id}`).innerHTML = `${currency} ${cost * parseInt(input.value)}`
  }
  totalCost();
}

//Chequea si hay items en el carrito local y los muestra
function checkLocalStorage() {
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
  totalCost();
}

function totalCost() {
  let subtotalContainer = document.getElementById("totalCostSubtotal");
  let shippingContainer = document.getElementById("totalCostShipping");
  let totalContainer = document.getElementById("totalCostTotal");

  let itemsSubtotal = document.querySelectorAll('[id^="subtotal"]');//obtiene todos los subtotales
  let subtotalArr = Array.from(itemsSubtotal).map(function (item) { //los convierte a array y mapea para extraer solo los valores
    return parseInt(item.innerHTML.split(" ")[1]); //devuelve el array de valores
  })
  let subtotal = subtotalArr.reduce((prev, curr) => prev + curr) //los suma para obtener el subtotal

  subtotalContainer.innerHTML = `<p>USD ${subtotal}</p>`
  shippingContainer.innerHTML = `<p>USD ${shippingCost(subtotal)}</p>`
  totalContainer.innerHTML = `<p class="fw-bold">USD ${subtotal + shippingCost(subtotal)}</p>`
}

function shippingCost(subtotalCost) {
  let shippingControls = document.getElementsByName("shippingMethod");
  shippingControls.forEach(control => {
    control.addEventListener("change", (e) => {
      e.stopImmediatePropagation()
      totalCost();
    })
  });
  let selectedControl = Array.from(shippingControls).find(control => control.checked)
  return calculateShipping(selectedControl.id, subtotalCost)
}
function calculateShipping(selectedOption, subtotal) {
  let shippingFee;
  switch (selectedOption) {
    case "shippingPremium":
      shippingFee = 0.15;
      break;
    case "shippingExpress":
      shippingFee = 0.07;
      break;
    case "shippingStandard":
      shippingFee = 0.05;
      break;
  }
  return Math.round(subtotal * shippingFee);
}
function paymentMethod() {
  let modal = document.getElementById("paymentMethodModal");
  let modalBtn = document.getElementById("paymentMethodModalBtn");
  let displayMethod = document.getElementById("selectedPaymentMethod");
  let creditCardControls = document.querySelectorAll(".credit-card-form-control");
  let bankTransferControls = document.querySelectorAll(".bank-transfer-form-control");

  modalBtn.addEventListener("click", () => {
    let chosenPaymentMethod = document.getElementsByName("paymentMethod");
    let paymentMethodCheck = document.getElementById("paymentMethodCheck");

    chosenPaymentMethod.forEach(input => {
      input.addEventListener("change", (e) => {
        switch (e.target.id) {
          case "creditCard":
            creditCardControls.forEach(control => { //controles de pago con tarjeta
              control.removeAttribute("disabled"); //remueve el disabled si lo tiene
            });
            bankTransferControls.forEach(control => { //controles de pago con transferencia
              control.setAttribute("disabled", "");  //los desahabilita porque fue seleccionada la otra opción
            });
            break;
          case "bankTransfer":
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
    modal.addEventListener("hidden.bs.modal", ()=> { //cuando el usuario cierra el modal se valida que estén los campos completos
      if (validatePaymentMethod(bankTransferControls) || validatePaymentMethod(creditCardControls)){
        paymentMethodCheck.setAttribute("checked", "")
      };
    })
  })
}

function validatePaymentMethod(chosenControlInputs){
  let validInputs = false;
  let inputsToValidate = Array.from(chosenControlInputs).filter(input => input.value.trim() == "");
  if (inputsToValidate.length == 0){
    validInputs = true;
  }
  return validInputs;
}

 function validateForm() {
  paymentMethod();
  let form = document.getElementById("cartForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (form.checkValidity()) {
      document.getElementById("buy-alert-success").classList.replace("d-none", "d-block");
    }
    form.classList.add('was-validated');
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
      showCartProducts(fetchedCart);
      checkLocalStorage();
      localStorage.setItem("fetchedItems", JSON.stringify(fetchedCart));
      totalCost();
      validateForm(); 
    }
  })
})