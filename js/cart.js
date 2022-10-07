let userCart = [];
let addedProducts = [];
let cartProductsContainer = document.getElementById("cartProducts");

function showCartProducts(cartArray){
    if (cartArray != ""){ //si el carrito no está vacío
        for (let i = 0; i < cartArray.length; i++) {
            let cartProd = cartArray[i];

            cartProductsContainer.innerHTML += 
            `
          <tr id="cartProduct${cartProd.id}" class="align-middle cart-row">
            <td class="col-2 text-center"><img src="${cartProd.image}" class="img-fluid w-75 shadow bg-body rounded cart-prod-img" onclick="setProductID(${cartProd.id})"></td>
            <td class="col-2"><p>${cartProd.name}</p></td>
            <td class="col-2"><p>${cartProd.currency} ${cartProd.unitCost}</p></td>
            <td class="col-2"><input type="number" class="form-control w-50" id="quantity${cartProd.id}" min="1" value="1" onchange="setSubtotal(${cartProd.id}, '${cartProd.currency}', ${cartProd.unitCost})"></td>
            <td class="col-2"><p class="cart-prod-subtotal fw-bold" id="subtotal${cartProd.id}">${cartProd.currency} ${cartProd.unitCost}</p></td>
            <td class="col-1"><span class="fa fa-trash" onclick="removeCartItem(${cartProd.id})"></span></td>
          </tr>
            `
        }
    } 
}
//Función (provisional) que elimina si existen items duplicados en el documento
  //sirve para controlar que el item que viene desde el "servidor" no se agregue 
function checkDuplicates(){
  let cartRows = document.querySelectorAll(".cart-row");
  let IDs = [];
  cartRows.forEach(row => {
    IDs.push(row.id);
  });
  let duplicates = IDs.filter((item, index) => {
    return IDs.indexOf(item) != index;
  })
  duplicates.forEach(duplicate => {
    document.querySelector(`#${duplicate}`).remove();
  });
 
}

//Define el subtotal correspondiente al input
function setSubtotal(id, currency, cost){
  let input = document.getElementById(`quantity${id}`);
  document.getElementById(`subtotal${id}`).innerHTML = `${currency} ${cost * parseInt(input.value)}`
}

//Chequea si fueron agregados items al carrito y los muestra
function checkLocalStorage(){
         if(localStorage.getItem("userCart")){
          let addedProducts = JSON.parse(localStorage.getItem("userCart"));
          showCartProducts(addedProducts)
         }
 } 
//Llamada en el ícono de eliminar
 //Elimina el item
 function removeCartItem(id){
  let storedCart = JSON.parse(localStorage.getItem("userCart"));
  for (let i = 0; i < storedCart.length; i++) {
    let item = storedCart[i];
    //si el id del producto almacenado coincide con el que quiere remover el usuario
    if (item.id == id){
      //lo remueve del array
      storedCart.splice(i, 1)
      //sobre-escribe el array en localStorage pero sin el producto eliminado
      localStorage.setItem("userCart", JSON.stringify(storedCart)) 
    }
  }
    document.getElementById(`cartProduct${id}`).innerHTML = "";
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
            checkDuplicates()
        }
    })
})