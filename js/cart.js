let userCart = [];
let addedProduct = [];
let cartProductsContainer = document.getElementById("cartProducts");
let cartProdName = document.getElementById("cartName");
let cartProdCost = document.getElementById("cartCost");
let cartProdSubtotal = document.getElementById("cartSubtotal");
let cartProdImg = document.getElementById("cartImg");


function showCartProducts(cartArray){
    if (cartArray != ""){ //si el carrito no está vacío
        for (let i = 0; i < cartArray.length; i++) {
            let cartProd = cartArray[i];

            cartProductsContainer.innerHTML += `
        <div id="cartProduct${cartProd.id}" class="row d-flex align-items-center">
            <div class="col cart-prod-img" onclick="setProductID(${cartProd.id})">
                <img src="${cartProd.image}" class="img-fluid w-75 shadow bg-body rounded">
            </div>
            <div class="col">
              <p>${cartProd.name}</p>
            </div>
           <div class="col">
            <p>${cartProd.currency} ${cartProd.unitCost}</p>
            </div>
            <div class="col">
            <input type="number" class="form-control w-50 ID${cartProd.id}" min="1" value="1" onchange="setSubtotal(${cartProd.id}, '${cartProd.currency}', ${cartProd.unitCost})">
            </div>
          <div class="col">
            <p class="cart-prod-subtotal fw-bold" id="${cartProd.id}">${cartProd.currency} ${cartProd.unitCost}</p>
          </div>
          <div class="col">
          <span class="fa fa-trash" onclick="removeCartItem(${cartProd.id})"></span>
          </div>
          <hr class="mt-3">
      </div>
        `
        }
    } 
}

//Define el subtotal correspondiente al input
function setSubtotal(id, currency, cost){
  let input = document.querySelector(`.ID${id}`);
  document.getElementById(`${id}`).innerHTML = `${currency} ${cost * parseInt(input.value)}`
}

//Chequea si fueron agregados items al carrito y los muestra
function checkLocalStorage(){
  for (let i = 0; i < localStorage.length; i++) {
           if (localStorage.key(i).startsWith("newCart")){
           addedProduct = JSON.parse(localStorage.getItem(localStorage.key(i)));
           showCartProducts(addedProduct)
           }    
         }
 } 
//Llamada en el ícono de eliminar
 //Elimina el item
 function removeCartItem(id){
  document.getElementById(`cartProduct${id}`).innerHTML = "";
  localStorage.removeItem(`newCart${id}`);
 }

document.addEventListener("DOMContentLoaded", () => {
    showUser()
    //por esta vez el usuario es estático
    let user = 25801;
    //se concatena para obtener la información 
    getJSONData(CART_INFO_URL + user + EXT_TYPE).then(result =>{ //petición al carrito del user
        if (result.status === "ok") {
            userCart = result.data.articles; //se almacenan solo los artículos
            showCartProducts(userCart);
            checkLocalStorage();
        }
    })
})
