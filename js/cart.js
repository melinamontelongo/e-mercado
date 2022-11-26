//Tarifas de envío
const shippingPremiumFee = 0.15;
const shippingExpressFee = 0.07;
const shippingStandardFee = 0.05;

//Subtotal de todos los productos y el costo de envío
let subtotalCost = 0;
let shippingFee = 0;

//Donde irá el carrito del usuario
let userCart = [];

//Donde irán los productos del carrito
let cartProductsContainer = document.getElementById("cartProducts");

//Variable global donde se guardará la información del método de envío elegido
let chosenPaymentMethodInputs = undefined;

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
            <tr id="cartProduct${cartProd.id}" data-id="${cartProd.id}" class="align-middle cart-row text-light ">
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
                  <input type="number" min="1" class="form-control border border border-2 border-indigo bg-lighter-indigo" id="quantity${cartProd.id}" name="itemQuantity${cartProd.id}" form="cartForm"
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
                <span class="fa-solid fa-trash-can text-pink" onclick="removeCartItem(${cartProd.id})"></span>
              </td>
            </tr>
              `
      //Para mostrar el subtotal de cada producto dependiendo de la cantidad sin depender del evento oninput 
      currentValue = parseInt(document.getElementById(`quantity${cartProd.id}`).value);
      document.getElementById(`subtotal${cartProd.id}`).innerHTML = `${cartProd.currency} ${cartProd.unitCost * currentValue}`
    }
  } else {
    createBSAlert(`<span class="fa-solid fa-triangle-exclamation"></span> Parece que no tienes productos en tu carrito. <a class="link-secondary" href="categories.html">Encuentra lo que buscas</a>`, "warning");
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
//Función que actualiza la cantidad en la base de datos
function updateStorageQuantity(productID, quantity) {
  let itemToUpdate = userCart.find(item => item.id == productID);
  if (quantity > 0) {
    itemToUpdate.count = parseInt(quantity)
    let updatedQuantity = {
      "userCart": userCart,
    }
    putInfo(updatedQuantity, currentUserID, USERS_URL).then(() => {return})
  }
}
//Llamada en el ícono de eliminar y al momento de simular la compra
//Elimina el item
function removeCartItem(id) {
  let itemToRemove = userCart.find(item => item.id === id);
  let itemIndex = userCart.indexOf(itemToRemove);
  userCart.splice(itemIndex, 1);
  let newCart = {
    "userCart": userCart
  }
  putInfo(newCart, currentUserID, USERS_URL).then(res => {
    if (res.status === "ok") {
      let elementToRemove = document.getElementById(`cartProduct${id}`);
      if (elementToRemove != null) {
        elementToRemove.innerHTML = "";
      }
      setTotalCost();
    } else {
      createBSAlert("No se ha podido eliminar, intente nuevamente", "danger");
    }
  });
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
          chosenPaymentMethodInputs = creditCardControls;
          creditCardControls.forEach(control => { //Controles de pago con tarjeta
            control.removeAttribute("disabled"); //Los habilita
            control.classList.replace("bg-secondary", "bg-lighter-pink");//Para que se muestre visualmente la habilitación
          });
          bankTransferControls.forEach(control => { //Controles de pago con transferencia
            control.setAttribute("disabled", "");  //Los deshabilita
            control.classList.replace("bg-lighter-pink", "bg-secondary");//Para que se muestre visualmente la deshabilitación
            control.classList.remove("is-invalid") //Para evitar que se siga mostrando el campo con error aunque se haya seleccionado la otra opción
          });
          break;
        case "bankTransfer": //Fue elegida transferencia bancaria
          chosenPaymentMethodInputs = bankTransferControls;
          bankTransferControls.forEach(control => {//Controles de pago con transferencia
            control.removeAttribute("disabled"); //Los habilita
            control.classList.replace("bg-secondary", "bg-lighter-pink");//Para que se muestre visualmente la habilitación
          });
          creditCardControls.forEach(control => { //Controles de pago con tarjeta
            control.setAttribute("disabled", ""); //Los deshabilita
            control.classList.replace("bg-lighter-pink", "bg-secondary");//Para que se muestre visualmente la deshabilitación
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
//Función para obtener la información del método de pago
function getPaymentInfo() {
  let info = [];
  let item;
  chosenPaymentMethodInputs.forEach(input => {
    item = {
      [input.id]: input.value
    }
    info.push(item);
  })
  chosenPaymentMethodInputs = info;
}
//Función que valida el formulario
function validateForm() {
  //Formulario
  let form = document.getElementById("cartForm");
  //Inputs de cantidad de producto
  let quantityInputs = document.querySelectorAll('[id^="quantity"]');
  //Inputs de la dirección
  let addressStreet = document.getElementById("addressStreet");
  let addressNum = document.getElementById("addressNumber");
  let addressCorner = document.getElementById("addressCorner")
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
      input.addEventListener("input", () => {
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
      if (cardNum.checkValidity() && secCode.checkValidity() && expDate.checkValidity()) { //Si todos son válidos
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
      if (bankAccNum.checkValidity()) {
        paymentMethodCheck.checked = true;
      } else {
        paymentMethodCheck.checked = false;
      }
      bankAccNum.addEventListener("input", () => {
        validateInput(bankAccNum)
      })
    }
    //Se sube solo si todos los campos cumplen con lo requerido (atributos: required, pattern, min)
    if (form.checkValidity()) {
      e.preventDefault();
      getPaymentInfo();
      let newPurchase = {
        "userID": currentUserID,
        "userName": getUser(),
        "shippingFee": shippingFee,
        "shippingAddress": [{
          "street": addressStreet.value,
          "number": addressNum.value,
          "corner": addressCorner.value
        }],
        "paymentMethod": chosenPaymentMethodInputs,
        "boughtItems": userCart
      }
      postInfo(newPurchase, SALES_URL).then(res => {
        if (res.status === "ok") {
          createBSAlert(`<span class="fa-solid fa-check"></span> ¡Tu compra se ha realizado con éxito!`, "success");
          let allCartItems = document.querySelectorAll(".cart-row");
          allCartItems.forEach(cartItem => {
            removeCartItem(cartItem.dataset.id);//Se remueven los items del carrito para simular la compra
          });
          let allInputs = document.querySelectorAll(".form-control");
          allInputs.forEach(input => { //Vacía los inputs para simular el envío
            input.value = "";
          });
          form.classList.remove("was-validated");
        }
      })
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  showUser();
  getSpecificInfo(currentUserID, USERS_URL).then((res) => {
    if (res.status === "ok") {
      getCurrencyRate().then(() => {
        userCart = res.data.userCart;
        showCartProducts(userCart)
        validateForm();
      })
    }
  })
})