let userCart = [];
let cartProductsContainer = document.getElementById("cartProducts");
let cartProdName = document.getElementById("cartName");
let cartProdCost = document.getElementById("cartCost");
let cartProdSubtotal = document.getElementById("cartSubtotal");
let cartProdImg = document.getElementById("cartImg");

function showCartProducts(){
    if (userCart != ""){ //si el carrito no está vacío
        for (let i = 0; i < userCart.length; i++) {
            let cartProd = userCart[i];

            cartProductsContainer.innerHTML += `
            <div class="col">
                <img src="${cartProd.image}" class="img-fluid w-75">
            </div>
            <div class="col">
              <p>${cartProd.name}</p>
            </div>
           <div class="col">
            <p>${cartProd.currency} ${cartProd.unitCost}</p>
            </div>
            <div class="col">
            <input type="number" class="form-control w-50" min="1" value="1" onchange="getProdCount('${cartProd.currency}', ${cartProd.unitCost})">
            </div>
          <div class="col">
            <p class="cart-prod-subtotal">${cartProd.currency} ${cartProd.unitCost}</p>
          </div>
          <hr class="mt-3">
        `
        }
    }
}
//Función que se le pasa onchange a cada uno de los input que define la cantidad del producto a comprar
  //recibe la moneda y el costo
  //obtiene los inputs e itera 
  //llama a getProdSubtotal y le pasa el índice del input seleccionado, el valor del mismo, la moneda y el costo
function getProdCount(currency, cost){
  let inputCount = document.querySelectorAll(".form-control");
  for (let i = 0; i < inputCount.length; i++) {
    let input = inputCount[i];
    getProdSubtotal(i, parseInt(input.value), currency, cost);
}};

//Función que muestra el valor * cantidad en la sección subtotal correspondiente 
  //selecciona todos los elementos con el subtotal
  //selecciona el que le es pasado por parámetro (se corresponde con el input) y le agrega el nuevo valor
function getProdSubtotal(index, value, currency, cost){
  let cartProdSubtotal = document.querySelectorAll(".cart-prod-subtotal");  
  cartProdSubtotal[index].innerHTML = `${currency} ${cost * value}`
}

document.addEventListener("DOMContentLoaded", () => {
    showUser()
    //por esta vez el usuario es estático
    let user = 25801;
    //se concatena para obtener la información 
    getJSONData(CART_INFO_URL + user + EXT_TYPE).then(result =>{ //petición al carrito del user
        if (result.status === "ok") {
            userCart = result.data.articles; //se almacenan solo los artículos
            showCartProducts();
        }

    })
})