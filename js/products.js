const ORDER_ASC_BY_COST = "Up$";
const ORDER_DESC_BY_COST = "Down$";
const ORDER_BY_SOLD_COUNT = "Rel.";

let currentCategoryName = "";
let currentProductsArray = [];            //Se inicializa una variable que define un arreglo vacío, para luego "cargarle" los datos
let currentSortCriteria = undefined;     //Inicializa el criterio en undefined para luego definir y llamarlo
let minCost = undefined;                //Inicializa el precio mínimo del rango como undefined para definir si el usuario hace click en filtrar
let maxCost = undefined;               //lo mismo pero con el precio máximo

let searchBar = document.getElementById("searchBar"); //Barra de búsqueda
let search = undefined;

//Función para ordenar los productos
function sortProducts(criteria, array) {
    let result = [];
    if (criteria === ORDER_ASC_BY_COST) {
        result = array.sort(function (a, b) {
            return a.cost - b.cost          //optimización del código anterior, misma funcionalidad
        });
    } if (criteria === ORDER_DESC_BY_COST) {
        result = array.sort(function (a, b) {
            return b.cost - a.cost
        });
    } if (criteria === ORDER_BY_SOLD_COUNT) {
        result = array.sort(function (a, b) {
            return b.soldCount - a.soldCount
        });
    }

    return result;
}

//Función que guarda el id del producto en localStorage y redirecciona
function setProductID(id) {
    localStorage.setItem("productID", id);
    window.location = "product-info.html"
}

//Función para mostrar los productos en products.html
function showProductsList() {


    let htmlContentToAppend = "";   //Se inicializa la variable a la que luego se le "cargará" la información

    for (let i = 0; i < currentProductsArray.length; i++) {  //Iteración que recorre el arreglo de productos tantas veces como su largo (5)

        let product = currentProductsArray[i];  //Se define la forma de acceder a las propiedades del objeto producto

        if (!(product.cost < minCost) && !(product.cost > maxCost) &&  //Filtros para mostrar los productos según el precio ingresado *Condiciones optimizadas
            ((search == undefined) ||
                (product.name.toLowerCase().includes(search) ||
                    product.description.toLowerCase().includes(search)))) { //Filtros para mostrar los productos según lo que ingrese el usuario en el buscador

            htmlContentToAppend += `            

                    <div onclick="setProductID(${product.id})" class="list-group-item list-group-item-action cursor-active">
                        <div class="row">
                            <div class="col-3">
                                <img src="${product.image}" alt="${product.description}" class="img-thumbnail">
                            </div>
                            <div class="col">
                                <div class="d-flex w-100 justify-content-between">
                                    <h4 class="mb-1">${product.name} - ${product.currency} ${product.cost}</h4>
                                    <small class="text-muted">${product.soldCount} vendidos</small>
                                </div>
                                <p class="mb-1">${product.description}</p>
                            </div>
                        </div>
                    </div>
                    `
        }
        document.getElementById("product-list-container").innerHTML = htmlContentToAppend

      
    }
    if (document.getElementById("product-list-container").innerHTML == "") {
        document.getElementById("product-list-container").innerHTML = `<h3 class="lead text-center p-5">No se han encontrado productos que coincidan</h3>`
    }
    document.getElementById("product-list-heading").innerHTML =

        `<h1>Productos</h1>
        <h4 class="lead">Verás aquí todos los productos de la categoría <strong>${currentCategoryName}</strong></h4>`
}

function sortAndShowProducts(sortCriteria, productsArray) {     //Función para ordenar y mostrar productos
    currentSortCriteria = sortCriteria;

    if (productsArray != undefined) {
        currentProductsArray = productsArray;
    }

    currentProductsArray = sortProducts(currentSortCriteria, currentProductsArray); //Ordena los productos según el criterio

    showProductsList();
}

document.addEventListener("DOMContentLoaded", function (e) {    //Cuando se cargue el documento sucede lo siguiente:
    showUser();                                                 //Llama la función definida en init.js para mostrar al usuario
    let currentCategory = localStorage.getItem("catID");        //Accede a categoría seleccionada por el usuario
    getJSONData(PRODUCTS_URL + currentCategory + EXT_TYPE).then(function (resultObj) {       //Como parámetro la url del .json concatenada
        if (resultObj.status === "ok") {
            currentCategoryName = resultObj.data.catName;       //Se obtiene y almacena el nombre de la categoría para mostrarlo
            currentProductsArray = resultObj.data.products;     //Se obtiene y almacena el array de productos
            showProductsList();
        }
    });

    //Eventos de click para cada botón que ordena por precio y relevancia
    document.getElementById("sortDesc").addEventListener("click", function () {
        sortAndShowProducts(ORDER_DESC_BY_COST);
    })
    document.getElementById("sortAsc").addEventListener("click", function () {
        sortAndShowProducts(ORDER_ASC_BY_COST);
    })
    document.getElementById("sortByRel").addEventListener("click", function () {
        sortAndShowProducts(ORDER_BY_SOLD_COUNT);
    })
    //Evento de click para filtro por rangos de precio
    document.getElementById("rangeFilterCost").addEventListener("click", function () {
        minCost = parseInt(document.getElementById("rangeFilterCostMin").value);
        maxCost = parseInt(document.getElementById("rangeFilterCostMax").value);

        if ((minCost != undefined) && (minCost != "") && minCost >= 0) {
            minCost = minCost;
        }
        else {
            minCost = undefined;
        }

        if ((maxCost != undefined) && (maxCost != "") && maxCost >= 0) {
            maxCost = maxCost;
        }
        else {
            maxCost = undefined;
        }
        showProductsList();
    })
    //Evento de click para limpiar filtro de precio (vuelve a mostrar lista)
    document.getElementById("clearRangeFilter").addEventListener("click", function () {
        document.getElementById("rangeFilterCostMin").value = "";
        document.getElementById("rangeFilterCostMax").value = "";

        minCost = undefined;
        maxCost = undefined;
        showProductsList();
    }
    )
    //Evento input para filtrar listado de acuerdo a lo que ingrese el usuario en la barra de búsqueda
    searchBar.addEventListener("input", function () {
        search = searchBar.value.toLowerCase();     //Convierte a minúsculas lo ingresado por usuario para no distinguir entre mayús. y minús.
        showProductsList();
    });
});