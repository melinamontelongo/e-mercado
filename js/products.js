//Se crea una constante para pasarla por parámetro a la hora de llamar la función encargada de hacer el fetch
const CAT101_URL = "https://japceibal.github.io/emercado-api/cats_products/101.json";

let currentProductsArray = [];      //Se inicializa una variable que define un arreglo vacío, para luego "cargarle" los datos


function showProductsList() {        //Función para mostrar los productos en products.html


    let htmlContentToAppend = "";   //Se inicializa la variable a la que luego se le "cargará" la información

    for (let i = 0; i < currentProductsArray.products.length; i++) {  //Iteración que recorre el arreglo de productos tantas veces como su largo (5)

        let product = currentProductsArray.products[i];  //Se define la forma de acceder a las propiedades del objeto producto

//Se itera recorriendo las propiedades del objeto, agregando los datos que se mostrarán en el html
        htmlContentToAppend += `            

            <div onclick="setProductID(${product.id})" class="list-group-item list-group-item-action cursor-active">
                <div class="row">
                    <div class="col-3">
                        <img src="${product.image}" alt="${product.description}" class="img-thumbnail">
                    </div>
                    <div class="col">
                        <div class="d-flex w-100 justify-content-between">
                            <h4 class="mb-1">${product.name} - ${product.currency} ${product.cost}</h4>
                            <small class="text-muted">${product.soldCount} artículos</small>
                        </div>
                        <p class="mb-1">${product.description}</p>
                    </div>
                </div>
            </div>
            `
    }

    document.getElementById("product-list-container").innerHTML = htmlContentToAppend    //Se agrega el contenido al div creado por modifyDocument()

    document.getElementById("product-list-heading").innerHTML =            //Le agrega el título y subtítulo de la categoría al div con la id que le asignó modifyDocument()

        `<h1>Productos</h1>
        <h4 class="lead">Verás aquí todos los productos de la categoría <strong>${currentProductsArray.catName}</strong></h4>`
}

//Función que modifica el documento .html
function modifyDocument() {
    let newDiv = document.createElement("div");                            //Crea el div al que se le cargará la info
    let parentDiv = document.getElementsByClassName("container");         //Obtiene los elementos contenedores
    parentDiv[2].appendChild(newDiv);                                    //El elemento encontrado en el índice 2 será el padre del nuevo div
    newDiv.id = "product-list-container";                               //Le agrega un id al nuevo div para identificarlo y poder cargarle los datos

    let divHeading = document.getElementsByClassName("text-center");   //Obtiene los elementos con esa clase (1) para luego cargarle título y subtítulo de la categoría
    divHeading[0].id = "product-list-heading";                        //Al elemento en el índice 0 se le asigna un id 
    divHeading[0].classList.add("p-4");                              //Se le agrega esta clase para que el estilo quede similar al del ejemplo.

}


document.addEventListener("DOMContentLoaded", function (e) {     //Cuando se cargue el documento sucede lo siguiente:
    getJSONData(CAT101_URL).then(function (resultObj) {         //-Se llama a la función definida en init.js
        if (resultObj.status === "ok") {                      //Si no hay errores...
            currentProductsArray = resultObj.data  //La variable ya definida pasa a contener la información del objeto obtenido a partir del fetch al .json.
            modifyDocument()                      //Se ubica aquí para que se ejecute una vez la página se cargó correctamente.
            showProductsList()                   //Se ubica aquí ya que necesita que el documento esté cargado y modificado.
        }
    });
});