//Variables donde se guardará la información obtenida con getJSONData
let productInfo = [];
let productComments = []; //para los comentarios que vienen del "servidor"
//let userCart = [];
let currentProduct = localStorage.getItem("productID"); //Obtiene el ID de producto
let commentsContainer = document.getElementById("productComments") //Donde se cargarán los comentarios
let carousel; //Será el carousel (todavía no existe).
let userAlreadyCommented = false;

//Función para mostrar la información del producto a partir de lo almacenado en productInfo
function showProductInfo() {
    document.getElementById("product-info-container").innerHTML = `
    <div class="col-12 col-sm-12 col-md-12 col-lg-8 p-4">
            <div id="productsCarousel" class="carousel slide carousel-light mt-4" data-bs-ride="carousel" data-bs-interval="2000">
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
            <h2 class="border-bottom border-light-indigo pb-2 text-lighter-indigo">${productInfo.name}</h2>
            <strong class="text-lighter-indigo">Precio</strong>
            <p id="product-currency-cost">${productInfo.currency} ${productInfo.cost}</p>
            <strong class="text-lighter-indigo">Descripción</strong>
            <p>${productInfo.description}</p>
            <strong class="text-lighter-indigo">Categoría</strong>
            <p>${productInfo.category}</p>
            <strong class="text-lighter-indigo">Cantidad de vendidos</strong>
            <p>${productInfo.soldCount}</p>
            <button class="m-2 btn btn-teal d-block rounded-pill" onclick="addToCart()"><span class="me-2 fa-solid fa-cart-plus"></span>Agregar al carrito</button>
            <a href="products.html" class="m-2 btn btn-outline-teal rounded-pill"><span class="fa-solid fa-left-long me-2"></span>Volver al listado</a>
    </div>
        `
    checkCurrency(productInfo)
    showProductImages();
    responsiveCarousel();
    showRelatedProducts();
}
//Función que chequea la moneda en la que está el producto para mostrar su valor en dólares si está en pesos
function checkCurrency(product) {
    if (product.currency == PESO_SYMBOL) {
        let itemToModify = document.getElementById("product-currency-cost")
        let convertedCost = USDConversion(product.cost);
        itemToModify.innerHTML += ` - <span class="fw-bolder">${DOLLAR_SYMBOL} ${convertedCost}</span>`
    }
}
//Para mostrar las imágenes:
function showProductImages() {
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
function responsiveCarousel() {
    //Validación para mostrar el modal solo en pantallas grandes
    let largeScreen = window.matchMedia("(min-width: 992px)");
    if (largeScreen.matches) {
        //Escucha de eventos para cuando el usuario haga click en la imagen, se muestre en un modal
        carousel.addEventListener("mouseup", function () {
            carousel.setAttribute("data-bs-target", "#prodImgModal")
            carousel.setAttribute("data-bs-toggle", "modal")
            let modalImg = document.getElementById("modal-img");
            modalImg.innerHTML = carousel.innerHTML;
        })
    }
}
//Para mostrar productos relacionados:
function showRelatedProducts() {
    let relProdArray = productInfo.relatedProducts;
    for (let i = 0; i < relProdArray.length; i++) {
        let relatedProduct = relProdArray[i];
        document.getElementById("relatedProducts").innerHTML +=
            `
    <div onclick="setProductID(${relatedProduct.id})" class="relproducts-card col-lg-3 col-md-12 mx-2 border-0">
        <div class="card border border-light-indigo shadow mb-3 bg-dark rounded" style="width: 18rem;">
                <img src="${relatedProduct.image}" class="card-img-top" alt="image">
            <div class="card-body">
                <p class="card-text text-center">${relatedProduct.name}</p>
            </div>
        </div>
    </div>
        `
    }
}
//Función para agregar el producto al carrito
function addToCart() {
    let newItem = {
        "id": productInfo.id,
        "name": productInfo.name,
        "count": 1,
        "unitCost": productInfo.cost,
        "currency": productInfo.currency,
        "image": productInfo.images[0]
    }
    //Petición al usuario para obtener su carrito
    getSpecificInfo(currentUserID, USERS_URL).then((res) => {
        if (res.status === "ok") {
            let userCart = res.data.userCart; //Obtiene le carrito del usuario
            let isRepeated = userCart.find(item => item.id == newItem.id); //Item ya existente o undefined si no existe
            if (isRepeated != undefined) { //Si ya existe el mismo item en el carrito
                isRepeated.count++; //Le agrega 1 en cantidad
            } else { //Si no existe el mismo item
                userCart.push(newItem); //Lo agrega al carrito
            }
            let newCart = { //Define el carrito que se va a enviar (contiene los items ya existentes y el nuevo)
                "userCart": userCart
            }
            putInfo(newCart, currentUserID, USERS_URL).then(res => { //Solicitud para enviar el carrito nuevo
                if (res.status === "ok") {
                    createBSAlert("Producto agregado correctamente", "success")
                    window.location = "cart.html";
                }
            });
        } else {
            createBSAlert("Ha ocurrido un error. Intenta más tarde", "danger");
        }
    })
}
//Función para mostrar los comentarios obtenidos a partir de la solicitud:
//Si no hay comentarios (en la lista o en localStorage), muestra un div alertando al usuario
//Si hay, itera sobre ellos y los muestra
function showComments() {
    if (productComments.length === 0) {
                commentsContainer.innerHTML += `<div id="no-comments-alert"class="list-group list-group-item shadow p-3 mb-2 bg-dark text-light rounded border-0 text-muted">
                <p class="lead text-center"><span class="fa-solid fa-comment-slash"></span>Aún no hay comentarios ¡Sé el primero!</p>
                </div>`
    } else  { 
        for (let i = 0; i < productComments.length; i++) {
            let comment = productComments[i];
            commentsContainer.innerHTML += `
   
        <div class="list-group list-group-item shadow p-3 mb-2 bg-dark text-light rounded border border-light-indigo">
            <div class="row commentsInfo">
            <p class="col"><strong class="text-teal">${comment.user}</strong> - ${comment.dateTime}</p>
            <div class="col-sm-6 text-start text-sm-end mb-3 mb-sm-0">${addStars(comment.score)}</div>
            </div>
            <div class="row">
            <div class="col"><p>${comment.description}</p></div>
            </div>
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
            `<span class="fa fa-star checked text-pink"></span>`
        num--
    }
    if (num > 0) {
        for (let i = 0; i < num; i++) {
            spans += `<span class="fa fa-star text-lighter-pink"></span>`
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
    let noCommentsAlert = document.getElementById("no-comments-alert");
    let commentInput = document.getElementById("userComment");
    let scoreInput = document.getElementById("userScore");
    let dateTime = new Date().toLocaleString().replaceAll("/", "-").replace(",", "")
    let userProductComments = { //Objeto que será guardado en la base de datos, con los comentarios ya existentes y el nuevo (del usuario)
        "product": currentProduct, 
        "comments": []
    }
    let newComment = { //Define el nuevo comentario
        "score": parseInt(scoreInput.value),
        "description": commentInput.value,
        "user": getUser(),
        "dateTime": dateTime
    }
    productComments.forEach(comment => {userProductComments.comments.push(comment)}) //Pushea los comentarios ya existentes al objeto que será guardado en la base de datos
    userProductComments.comments.push(newComment); //Pushea el comentario nuevo
    putInfo(userProductComments, currentProductDB_ID, COMMENTS_URL).then(res => {
        if (res.status === "ok"){ //Si se realiza la solicitud correctamente (se agrega el comentario)
            userAlreadyCommented = true; //Se establece que el usuario ya comentó en este producto
            //Se vacían los campos
            commentInput.value = "";
            scoreInput.value = "";
        } else {
            createBSAlert("No se ha podido agregar tu comentario. Intenta nuevamente", "danger");
        }
    })
    productComments = [] //Vacía el array para que solo muestre el nuevo comentario
    productComments.push(newComment); //Pushea el nuevo comentario al array para que solo muestre ese
    if (noCommentsAlert != null){
        noCommentsAlert.remove()
    }
}

//Función que valida los campos con bootstrap
//Escucha de eventos onsubmit:
//Chequea la validez de los datos enviados por el usuario (que no estén en blanco)
//Agrega/quita las clases de validación
//Llama a addUserComment() y showComments() para añadir y mostrar los comentarios
function validateUserComment() {
    let form = document.getElementById("submitComment");
    form.addEventListener('submit', e => {
        e.preventDefault();
        e.stopPropagation();
        form.classList.add('was-validated')
        if (form.checkValidity()) {
            form.classList.remove('was-validated');
            if (!userAlreadyCommented){ //Si el usuario no ha comentado
                addUserComment(); //Agrega el comentario
                showComments(); //Lo muestra junto a los demás
            } else { //Sino muestra mensaje de error
                createBSAlert("Ya has comentado en este producto", "danger");
            }
        }
    })
}

//Cuando se carga el documento
//Llama a la función que muestra al usuario
//Solicita la información del producto actual y si se resuelve:
//Muestra la info
//Solicita los comentarios del producto actual y si se resuelve:
//Muestra los comentarios
//Valida el comentario del usuario
document.addEventListener("DOMContentLoaded", function () {
    showUser(); //Definida en init.js, muestra al user en el nav
    getInfo(PRODUCT_INFO_URL + currentProduct + EXT_TYPE).then((res)=> {
        if (res.status === "ok") {
            getCurrencyRate().then(() => {
                productInfo = res.data;
                showProductInfo();  //Muestra la info
            })
            getInfo(COMMENTS_URL).then(res => { //Para obtener el ID con el que se almacenan los comentarios de este producto en la base de datos
                let currentProductComments = res.data.find(res => res.product == currentProduct);
                currentProductDB_ID = currentProductComments.id;
                productComments = currentProductComments.comments;
                let currentUserCommented = productComments.find(comment => comment.user === getUser()) //Verifica si el usuario ya comentó
                if (currentUserCommented != undefined){
                    userAlreadyCommented = true;
                }
                showComments(); 
                validateUserComment();
            });

        }
    })
})


