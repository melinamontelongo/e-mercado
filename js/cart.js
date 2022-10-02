let userCart = [];
let addedProduct = [];
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
            <div class="col   cart-prod-img" onclick="setProductID(${cartProd.id})">
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
          <hr class="mt-3">
        `
        }
    } 
}

function showAddedProduct(){
  cartProductsContainer.innerHTML += `
<div class="col  cart-prod-img" onclick="setProductID(${addedProduct.id})">
<img src="${addedProduct.images[0]}" class="img-fluid w-75 shadow bg-body rounded">
</div>
<div class="col">
<p>${addedProduct.name}</p>
</div>
<div class="col">
<p>${addedProduct.currency} ${addedProduct.cost}</p>
</div>
<div class="col">
<input type="number" class="form-control w-50 ID${addedProduct.id}" min="1" value="1" onchange="setSubtotal(${addedProduct.id}, '${addedProduct.currency}', ${addedProduct.cost})">
</div>
<div class="col">
<p class="cart-prod-subtotal fw-bold" id="${addedProduct.id}">${addedProduct.currency} ${addedProduct.cost}</p>
</div>
<hr class="mt-3">
  `
}

//Define el subtotal correspondiente al input
function setSubtotal(id, currency, cost){
  let input = document.querySelector(`.ID${id}`);
  document.getElementById(`${id}`).innerHTML = `${currency} ${cost * parseInt(input.value)}`
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
        if (localStorage.getItem("newCart") !== undefined){
          let clickedProductID = localStorage.getItem("productID");
          console.log(clickedProductID)
          addedProduct = JSON.parse(localStorage.getItem(`newCart`));
          console.log(addedProduct)
          showAddedProduct();
        }

    })
})