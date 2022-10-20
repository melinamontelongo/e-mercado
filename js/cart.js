//Tarifas de envío
const shippingPremiumFee = 0.15;
const shippingExpressFee= 0.07;
const shippingStandardFee = 0.05;

//Subtotal de todos los productos y el costo de envío
let subtotalCost = 0;
let shippingFee = 0;

//Arrays para los productos del servidor y locales
let fetchedCart = [];
let localCart = [];

//Carrito local
let storedLocalCart = JSON.parse(localStorage.getItem("userCart"));

//Donde irán los productos del carrito
let cartProductsContainer = document.getElementById("cartProducts");

//Función para mostrar los productos que recibe por parámetro
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
            <td class="col-2"><input type="number" min="1" class="form-control w-50" id="quantity${cartProd.id}" min="1" name="itemQuantity" value="1" oninput="setSubtotal(${cartProd.id}, '${cartProd.currency}', ${cartProd.unitCost})"></td>
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
  let subtotalArr = Array.from(itemsSubtotal).map((item)=> { //los convierte a array y mapea para extraer solo los valores
    return parseInt(item.innerHTML.split(" ")[1]); //devuelve el array de valores
  })
  subtotalCost = subtotalArr.reduce((prev, curr) => prev + curr) //los suma para obtener el subtotal
  let totalShippingCost = Math.round(subtotalCost * shippingFee);
  subtotalContainer.innerHTML = `<p>USD ${subtotalCost}</p>`
  shippingContainer.innerHTML = `<p>USD ${totalShippingCost}</p>`
  totalContainer.innerHTML = `<p class="fw-bold">USD ${subtotalCost + totalShippingCost}</p>`
}
//Función que maneja las opciones de envío
  //La que ya viene checked por defecto
  //Y la que el usuario elija
function shippingCost(){
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
function setShippingFee(option){
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
      if (validateInputs(bankTransferControls) || validateInputs(creditCardControls)){ //si están completos cualquiera de los dos
        paymentMethodCheck.setAttribute("checked", "") //chequea el radio que funciona de control para la sección del modal
      };
    })
  })
}
//Función que realiza la validación correspondiente de acuerdo a los inputs que reciba
function validateInputs(inputs){
  let validInputs = false;
  let isInputText = false;
  let isInputNum = false;
  let isInputRadio = false;
  let inputsToValidate = undefined;

  //Recorre lo recibido para chequear su tipo
   inputs.forEach(input => {
    if (input.type === "text"){
      isInputText = true;
    }
    if (input.type === "number"){
      isInputNum = true;
    }
    if (input.type === "radio"){
      isInputRadio = true;

    }
  }); 
  //Según su tipo corrobora que cumplan con las condiciones para validar
  if (isInputText){
    inputsToValidate = Array.from(inputs).filter(input => input.value.trim() == "");
    if (inputsToValidate.length == 0){
      validInputs = true;
    }
  } if (isInputNum){
    inputsToValidate = Array.from(inputs).filter(input => input.value.trim() == "" || parseInt(input.value) <= 0)
    if (inputsToValidate.length == 0){
      validInputs = true;
    }
  }
  else if (isInputRadio){
    inputsToValidate = Array.from(inputs).find(input => input.checked);
     if (inputsToValidate != undefined){
       validInputs = true;
     }
   }
  return validInputs;
}
//Función que valida el formulario
function validateForm(){
  paymentMethod();
  let form = document.getElementById("cartForm");
  let shippingAddressInputs = document.getElementsByName("address");
  let quantityInputs = document.getElementsByName("itemQuantity")
  let shippingRadioInputs = document.getElementsByName("shippingMethod");

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    e.stopPropagation();
    form.classList.add('was-validated');
    if (validateInputs(shippingAddressInputs) && validateInputs(quantityInputs) && validateInputs(shippingRadioInputs)){
      document.getElementById("buy-alert-success").classList.replace("d-none", "d-block");
    }
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
      localStorage.setItem("fetchedItems", JSON.stringify(fetchedCart));
      showCartProducts(fetchedCart);
      retrieveLocalCart();
      validateForm();
    }
  })
})