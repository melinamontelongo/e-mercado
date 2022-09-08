//Variables donde se guardará la información obtenida con getJSONData
let productInfo = [];
let productComments = [];

//Función para mostrar la información del producto a partir de lo almacenado en productInfo
function showProductInfo() {
    document.getElementById("product-info-container").innerHTML = `            
            <div class="p-4">
                <div>
                    <h2 class="mb-3">${productInfo.name}</h2>
                    <hr>
                </div>
                <div>
                    <strong>Precio</strong>
                    <p>${productInfo.currency} ${productInfo.cost}</p>
                    <strong>Descripción</strong>
                    <p>${productInfo.description}</p>
                    <strong>Categoría</strong>
                    <p>${productInfo.category}</p>
                    <strong>Cantidad de vendidos</strong>
                    <p>${productInfo.soldCount}</p>
                </div>
                <div>
                    <strong class="mb-4">Imagenes ilustrativas</strong>
                      <div id="productImages" class"">
                      </div>

                    <div id="productComments">
                        <h3>Comentarios</h3>
                    </div>
                </div>
            </div>
        `
    //Para mostrar las imágenes:
    let images = productInfo.images;  //las obtiene
    for (let i = 0; i < images.length; i++) {   //e itera según su cantidad para mostrarlas
        let img = images[i];
        document.getElementById("productImages").innerHTML += `<img src="${img}"  class="img-thumbnail me-2 mb-3 mt-2" width="255px">`
    }
}
//Función para agregar comentarios nuevos (se llama para cargar los comentarios que vienen de la solicitud y para los que agrega el usuario)
function addComment(user, date, score, description) {
    let commentsContainer = document.getElementById("productComments");
    let comment = `   <div class="list-group list-group-item">
    <p class="commentsInfo"><strong>${user}</strong> - ${date} - ${addStars(score)}</p>
    <p>${description}</p>
    </div>`
    commentsContainer.innerHTML += comment;
}
//Función para mostrar los comentarios obtenidos a partir de la solicitud
function showComments() {
    let commentsContainer = document.getElementById("productComments");

    //Si no hay comentarios se agrega un div para mostrarle la situación al usuario
    if (productComments == "") {
        commentsContainer.innerHTML += `<div id="no-comments-alert"class="list-group list-group-item">
        <p class="lead text-center">Aún no hay comentarios ¡Sé el primero!</p>
        </div>`
    //Sino itera agregando los comentarios en base a cuántos haya
    } else {
        for (let i = 0; i < productComments.length; i++) {
            let comment = productComments[i];
            addComment(comment.user, comment.dateTime, comment.score, comment.description);
        }
    }
}

//Función que retorna un string conteniendo el star rating de acuerdo al puntaje del producto (es utilizada por addComments())
function addStars(score) {
    let spans = ``;
    let num = 5;    //variable a modo de contador (5 spans)

    for (let i = 0; i < score; i++) {   //itera agregando spans que representan el puntaje (checked)
        spans +=
            `<span class="fa fa-star checked"></span>`
        num--       //se resta 1 por cada iteración
    }
    if (num > 0) {      //si el num resultante es mayor a 0 (puntaje menor a 5)
        for (let i = 0; i < num; i++) {     //itera agregando el resto como <span> representando estrellas vacías
            spans += `<span class="fa fa-star"></span>` 
        }
    }
    return spans;
}

document.addEventListener("DOMContentLoaded", function () {

    showUser(); //Definida en init.js, muestra al user en el nav

    (() => {    //Para añadir comentarios nuevos y validar los campos con bootstrap
        let form = document.getElementById("submitComment");
        form.addEventListener('submit', event => {
            event.preventDefault()
            form.classList.add('was-validated') //Se agregan las clases de validación (bootstrap)
            if (form.checkValidity()) { //Chequea que los datos sean válidos (que no estén en blanco)
                let newComment = document.getElementById("userComment");
                let newScore = document.getElementById("userScore");
                let dateTime = new Date().toLocaleString().replaceAll("/", "-").replace(",", ""); //Convierte el objeto date a string y con el mismo formato que los demás comentarios
                addComment(getUser(), dateTime, parseInt(newScore.value), newComment.value); //Se agrega el comentario con la info pasada por parámetro (getUser() se define en init.js)

                let noComments = document.getElementById("no-comments-alert")
                if (noComments != null){
                   noComments.remove()      //Elimina el div que avisa que no hay comentarios
                }

                newComment.value = "";
                newScore.value = "";
                form.classList.remove('was-validated') //Se quitan las clases de validación
            }
        })
    })();

    let currentProduct = localStorage.getItem("productID"); //Obtiene el ID de producto
    getJSONData(PRODUCT_INFO_URL + currentProduct + EXT_TYPE).then(function (resultObj) { //Solicitud a la información del producto actual
        if (resultObj.status === "ok") {
            productInfo = resultObj.data;
            showProductInfo();  //Muestra la info
            getJSONData(PRODUCT_INFO_COMMENTS_URL + currentProduct + EXT_TYPE).then(function (resultObj) { //Solicitud a los comentarios del producto actual
                if (resultObj.status === "ok") {
                    productComments = resultObj.data;
                    showComments(); //Muestra los comentarios
                }
            })
        }
    })
})


