//Variables donde se guardará la información obtenida con getJSONData
let productInfo = [];
let productComments = [];
let userCart = [];
let currentProduct = localStorage.getItem("productID"); //Obtiene el ID de producto
let commentsContainer = document.getElementById("productComments") //Donde se cargarán los comentarios
let carousel //Será el carousel (todavía no existe).

//Función para mostrar la información del producto a partir de lo almacenado en productInfo
function showProductInfo() {
    document.getElementById("product-info-container").innerHTML = `
    <div class="col-12 col-sm-12 col-md-12 col-lg-8 p-4">
            <div id="productsCarousel" class="carousel slide carousel-dark mt-4" data-bs-ride="carousel" data-bs-interval="2000">
                    <div class="carousel-inner" id="carouselInner">
     
                    </div>

                    <button class="carousel-control-prev" type="button" data-bs-target="#productsCarousel" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>

                    <button class="carousel-control-next" type="button" data-bs-target="#productsCarousel" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>

            </div>
            <div class="modal fade" id="prodImgModal" tabindex="-1" aria-labelledby="prodImgModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl">
            <div class="modal-body" id="modal-img">
 
            </div>
         </div>
        </div>
    </div>
</div>

    <div class="col-12 col-lg-4 p-4">
            <h2 class="border-bottom pb-2">${productInfo.name}</h2>
            <strong>Precio</strong>
            <p>${productInfo.currency} ${productInfo.cost}</p>
            <strong>Descripción</strong>
            <p>${productInfo.description}</p>
            <strong>Categoría</strong>
            <p>${productInfo.category}</p>
            <strong>Cantidad de vendidos</strong>
            <p>${productInfo.soldCount}</p>
            <button class="m-2 btn btn-dark d-block rounded-pill" onclick="addToCart()"><span class="me-2 fa-solid fa-cart-plus"></span>Agregar al carrito</button>
            <a href="products.html" class="m-2 btn btn-outline-dark rounded-pill"><span class="fa-solid fa-left-long me-2"></span>Volver al listado</a>
    </div>
        `
    showProductImages();
    responsiveCarousel();
    showRelatedProducts();
}

 //Para mostrar las imágenes:
function showProductImages(){
    let images = productInfo.images;  //las obtiene
    carousel = document.getElementById("carouselInner");
    for (let i = 0; i < images.length; i++) {   //e itera según su cantidad para mostrarlas
        let img = images[i];
        carousel.innerHTML += `
        <div class="carousel-item shadow mb-3 bg-body rounded">
            <img src="${img}" class="d-block w-100 rounded" alt="image">
        </div>
        `
    }
    carousel.firstElementChild.classList.add("active"); //le agrega la clase active al primer elemento para que funcione el carrusel
}

function responsiveCarousel(){
    //Validación para mostrar el modal solo en pantallas grandes
    let largeScreen = window.matchMedia("(min-width: 992px)");
    if (largeScreen.matches){
    //Escucha de eventos para cuando el usuario haga click en la imagen, se muestre en un modal
    carousel.addEventListener("mouseup", function(){
            carousel.setAttribute("data-bs-target", "#prodImgModal")
            carousel.setAttribute("data-bs-toggle", "modal")
            let modalImg = document.getElementById("modal-img");
            modalImg.innerHTML = carousel.innerHTML;
        })
    }
}

//Para mostrar productos relacionados:
function showRelatedProducts(){
    let relProdArray = productInfo.relatedProducts;
    for (let i = 0; i < relProdArray.length; i++) {
        let relatedProduct = relProdArray[i];
        document.getElementById("relatedProducts").innerHTML +=
            `
    <div onclick="setProductID(${relatedProduct.id})" class="relproducts-card col-lg-3 col-md-12 mx-2 border-0">
        <div class="card shadow mb-3 bg-body rounded border-0" style="width: 18rem;">
                <img src="${relatedProduct.image}" class="card-img-top" alt="image">
            <div class="card-body border-top">
                <p class="card-text text-center">${relatedProduct.name}</p>
            </div>
        </div>
    </div>
        `
    }  
}

//Función para agregar el producto al carrito
function addToCart(){
let canBeAdded = true; //variable bandera
//se define un nuevo objeto con la estructura que viene del servidor
    newItem = {
        "id": productInfo.id,
        "name": productInfo.name,
        "count": 1,
        "unitCost": productInfo.cost,
        "currency": productInfo.currency,
        "image": productInfo.images[0]
    }
    if (localStorage.getItem("userCart")){ //si hay carrito local del usuario
     userCart = JSON.parse(localStorage.getItem("userCart")); //lo obtiene
     userCart.forEach(item => { //lo recorre y verifica si coincide el id del nuevo producto con uno ya existente
        if (item.id == newItem.id){
            canBeAdded = false; //no se puede agregar
        }
     })
    }
    if (localStorage.getItem("fetchedItems")){ //si hay elementos que vienen del servidor
        let fetchedItems = JSON.parse(localStorage.getItem("fetchedItems")) //los obtiene
        fetchedItems.forEach(item => { //los recorre 
            if (item.id == newItem.id){
                canBeAdded = false //no se puede agregar porque ya existe un item igual que viene desde el servidor
            }
        });
    }
    if (canBeAdded){ //si puede ser agregado
    userCart.push(newItem) //lo agrega al array (vacío o conteniendo los items locales)
    localStorage.setItem(`userCart`, JSON.stringify(userCart))  //y lo guarda en localStorage
    }
    window.location.href = "cart.html" //redirecciona al carrito
}


//Función para mostrar los comentarios obtenidos a partir de la solicitud:
//Si no hay comentarios (en la lista o en localStorage), muestra un div alertando al usuario
//Si hay, itera sobre ellos y los muestra
function showComments() {

    if (productComments == "" && !localStorage.getItem(`${currentProduct}`)) {
        commentsContainer.innerHTML += `<div id="no-comments-alert"class="list-group list-group-item shadow p-3 mb-2 bg-body rounded border-0 text-muted">
        <p class="lead text-center"><span class="fa-solid fa-comment-slash"></span>Aún no hay comentarios ¡Sé el primero!</p>
        </div>`

    } else {
        for (let i = 0; i < productComments.length; i++) {
            let comment = productComments[i];
            commentsContainer.innerHTML += `<div class="list-group list-group-item shadow p-3 mb-2 bg-body rounded border-0">
            <p class="commentsInfo"><strong>${comment.user}</strong> - ${comment.dateTime} - ${addStars(comment.score)}</p>
            <p>${comment.description}</p>
            </div>`
        }
    }
}

//Función que retorna un string conteniendo el star rating de acuerdo al puntaje del producto
//Toma el puntaje y en base a éste agrega estrellas rellenas
//Lo que reste, teniendo en cuenta los 5 <span> necesarios, se agrega como estrellas vacías
function addStars(score) {
    let spans = ``;
    let num = 5;    //variable a modo de contador (5 <span>)

    for (let i = 0; i < score; i++) {
        spans +=
            `<span class="fa fa-star checked"></span>`
        num--
    }
    if (num > 0) {
        for (let i = 0; i < num; i++) {
            spans += `<span class="fa fa-star"></span>`
        }
    }
    return spans;
}

//Función para añadir el comentario nuevo del usuario
//Obtiene los valores que ingresa
//Define un objeto comentario, lo almacena en localStorage y en array de comentarios
//Elimina la alerta de que no hay comentarios
//Limpia los campos e inhabilita el botón
function addUserComment() {
    productComments = []; //Vacía el array para no duplicar elementos
    let newComment = document.getElementById("userComment");
    let newScore = document.getElementById("userScore");
    let dateTime = new Date().toLocaleString().replaceAll("/", "-").replace(",", ""); //Conversión a string y al formato de los demás comentarios

    let userComment = { product: parseInt(currentProduct), score: parseInt(newScore.value), description: newComment.value, dateTime: dateTime, user: getUser() }
    localStorage.setItem(`${currentProduct}`, JSON.stringify(userComment));
    productComments.push(userComment);

    let noComments = document.getElementById("no-comments-alert")
    if (noComments != null) {
        noComments.remove()
    }

    newComment.value = "";
    newScore.value = "";
    document.getElementById("sendInfo").setAttribute("disabled", "")
}

//Función que valida los campos con bootstrap
//Escucha de eventos onsubmit:
//Chequea la validez de los datos enviados por el usuario (que no estén en blanco)
//Agrega/quita las clases de validación
//Llama a addUserComment() y showComments() para añadir y mostrar los comentarios
function validateUserComment() {
    let form = document.getElementById("submitComment");
    form.addEventListener('submit', event => {
        event.preventDefault()
        form.classList.add('was-validated')
        if (form.checkValidity()) {
            form.classList.remove('was-validated');
            addUserComment();
            showComments();
        }
    })
}

//Función que obtiene el comentario del usuario almacenado (si existe)
//Lo agrega al array de comentarios
//Deshabilita el botón
//Llama a showComments() para mostrarlo junto a los demás
function retrieveUserComment() {
    let userComment = JSON.parse(localStorage.getItem(`${currentProduct}`))
    if (userComment) {
        productComments.push(userComment)
        document.getElementById("sendInfo").setAttribute("disabled", "") //Una vez enviado el comentario, no se le permite añadir más
        showComments();
    }
}

//Cuando se carga el documento
//Solicita la información del producto actual y si se resuelve:
    //Muestra la info
//Solicita los comentarios del producto actual y si se resuelve:
    //Muestra los comentarios
//Llama a la función que muestra al usuario
//y a las que gestionan los comentarios realizados por el usuario
document.addEventListener("DOMContentLoaded", function () {
    getJSONData(PRODUCT_INFO_URL + currentProduct + EXT_TYPE).then(function (resultObj) {
        if (resultObj.status === "ok") {
            productInfo = resultObj.data;
            showProductInfo();  //Muestra la info

            getJSONData(PRODUCT_INFO_COMMENTS_URL + currentProduct + EXT_TYPE).then(function (resultObj) {
                if (resultObj.status === "ok") {
                    productComments = resultObj.data;
                    showComments(); //Muestra los comentarios
                }
            })
        }
    })
    showUser(); //Definida en init.js, muestra al user en el nav
    validateUserComment();
    retrieveUserComment();
})


