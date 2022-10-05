let userCart = [];
let addedProduct = [];
let cartProductsContainer = document.getElementById("cartProducts");

function showCartProducts(cartArray){
    if (cartArray != ""){ //si el carrito no está vacío
        for (let i = 0; i < cartArray.length; i++) {
            let cartProd = cartArray[i];

            cartProductsContainer.innerHTML += 
            `
          <tr id="cartProduct${cartProd.id}" class="align-middle">
            <td class="col-2 text-center"><img src="${cartProd.image}" class="img-fluid w-75 shadow bg-body rounded cart-prod-img" onclick="setProductID(${cartProd.id})"></td>
            <td class="col-2"><p>${cartProd.name}</p></td>
            <td class="col-2"><p>${cartProd.currency} ${cartProd.unitCost}</p></td>
            <td class="col-2"><input type="number" class="form-control w-50 ID${cartProd.id}" min="1" value="1" onchange="setSubtotal(${cartProd.id}, '${cartProd.currency}', ${cartProd.unitCost})"></td>
            <td class="col-2"><p class="cart-prod-subtotal fw-bold" id="${cartProd.id}">${cartProd.currency} ${cartProd.unitCost}</p></td>
            <td class="col-1"><span class="fa fa-trash" onclick="removeCartItem(${cartProd.id})"></span></td>
          </tr>
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