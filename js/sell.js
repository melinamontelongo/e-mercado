let productCost = 0;
let productCount = 0;
let comissionPercentage = 0.13;
let MONEY_SYMBOL = "$";
let DOLLAR_CURRENCY = "Dólares (USD)";
let PESO_CURRENCY = "Pesos Uruguayos (UYU)";
let PERCENTAGE_SYMBOL = '%';
let imagesURL = [] //Array donde irán las imágenes del producto convertidas

//Inputs para la información del producto a publicar
let productName = document.getElementById("productName");
let productDesc = document.getElementById("productDescription");
let productCat = document.getElementById("productCategory");
let totalCost = document.getElementById("totalCostText");

//Función que se utiliza para actualizar los costos de publicación
function updateTotalCosts() {
    let unitProductCostHTML = document.getElementById("productCostText");
    let comissionCostHTML = document.getElementById("comissionText");
    let totalCostHTML = document.getElementById("totalCostText");

    let unitCostToShow = MONEY_SYMBOL + productCost;
    let comissionToShow = Math.round((comissionPercentage * 100)) + PERCENTAGE_SYMBOL;
    let totalCostToShow = MONEY_SYMBOL + ((Math.round(productCost * comissionPercentage * 100) / 100) + parseInt(productCost));

    unitProductCostHTML.innerHTML = unitCostToShow;
    comissionCostHTML.innerHTML = comissionToShow;
    totalCostHTML.innerHTML = totalCostToShow;
}

function setTotalCost() {
    let productCountInput = document.getElementById("productCountInput");
    let productCostInput = document.getElementById("productCostInput");
    let comissionRadios = document.querySelectorAll('input[type="radio"]');
    let productCurrency = document.getElementById("productCurrency");

    productCountInput.addEventListener("change", (e) => { //Para la cantidad de productos en stock
        productCount = e.target.value;
        updateTotalCosts();
    })
    productCostInput.addEventListener("change", (e) => { //Para la cantidad de productos en stock
        productCost = e.target.value;
        updateTotalCosts();
    })
    comissionRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            switch (e.target.id) {
                case "goldradio":
                    comissionPercentage = 0.13
                    break;
                case "premiumradio":
                    comissionPercentage = 0.07
                    break;
                case "standardradio":
                    comissionPercentage = 0.03
                    break;
            }
            updateTotalCosts();
        })
    })
    productCurrency.addEventListener("change", (e) => {
        if (e.target.value == DOLLAR_CURRENCY) {
            MONEY_SYMBOL = DOLLAR_SYMBOL;
        }
        else if (e.target.value == PESO_CURRENCY) {
            MONEY_SYMBOL = PESO_SYMBOL;
        }
        updateTotalCosts();
    })
}

function dropzone() {
    let dropzone = document.getElementById("file-upload");
    let dropArea = document.getElementById("drop-area");
    let droppedFiles;
    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.innerHTML = "Suelta para subir tus fotos";
    })
    dropzone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        dropArea.innerHTML = "Arrastra tus fotos aquí";
    })
    dropzone.addEventListener("drop", (e) => {
        e.preventDefault() //Previene que se abra la imagen
        droppedFiles = e.dataTransfer.files; //La lista de archivos (fileList)
        readFiles(droppedFiles);
        dropArea.innerHTML = "Arrastra tus fotos aquí";
    })
}

//Función que verifica que los archivos sean de tipo válido y los lee, agregándolos al documento y al array de imágenes
function readFiles(fileList) {
    let validFileExts = ["image/jpeg", "image/jpg", "image/png"];
    let fileType;
    let imagesContainer = document.getElementById("droppedImages");

    Array.from(fileList).forEach(file => {
        fileType = file.type;
        if (validFileExts.includes(fileType)) {
            let fileReader = new FileReader();
            fileReader.addEventListener("load", () => {
                let fileUrl = fileReader.result;
                let newImage = `<li class="list-group-item d-flex flex-wrap justify-content-between align-items-center text-break bg-dark border border-light-indigo text-light">${file.name}<img class="img-fluid" src="${fileUrl}" alt="${file.name}"></li>`
                imagesURL.push(fileUrl);
                imagesContainer.innerHTML += newImage;
            })
            fileReader.readAsDataURL(file);
        } else {
            msgToShowHTML.innerHTML = `Intente nuevamente con un archivo de extensión jpg, jpeg o png`
        }
    })
}


//Función que se ejecuta una vez que se haya lanzado el evento de
//que el documento se encuentra cargado, es decir, se encuentran todos los
//elementos HTML presentes.
document.addEventListener("DOMContentLoaded", () => {
    showUser();
    setTotalCost();
    dropzone();

    //Se obtiene el formulario de publicación de producto
    let sellForm = document.getElementById("sell-info");

    //Se obtienen los inputs con la información del producto a publicar


    //Se agrega una escucha en el evento 'submit' que será
    //lanzado por el formulario cuando se seleccione 'Vender'.
    sellForm.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopPropagation();
        sellForm.classList.add("was-validated")

        //Aquí ingresa si pasó los controles, irá a enviar
        //la solicitud para crear la publicación.
        if (sellForm.checkValidity()) {
            let itemToPublish = {
                "name": productName.value,
                "description": productDesc.value,
                "category": productCat.value,
                "totalCost": totalCost.innerHTML,
                "images": imagesURL
            }
            localStorage.setItem("userItemsToSell", JSON.stringify(itemToPublish));
            getJSONData(PUBLISH_PRODUCT_URL).then(resultObj => {
                let successMsg = resultObj.data.msg //El mensaje de éxito que viene de la petición
                let errorMsg = "¡Ha ocurrido un error! Intenta nuevamente";
                let msgToShowHTML = document.getElementById("resultSpan");
                let alertResult = document.getElementById("alertResult");
                let msgToShow = "";

                //Si la publicación fue exitosa, devolverá mensaje de éxito,
                //de lo contrario, devolverá mensaje de error.
                if (resultObj.status === 'ok') {
                    msgToShow = successMsg;
                    alertResult.classList.add('alert-success');
                }
                else if (resultObj.status === 'error') {
                    msgToShow = errorMsg;
                    alertResult.classList.add('alert-danger');
                }
                msgToShowHTML.innerHTML = msgToShow;
                alertResult.classList.add("show");
            });
        }
    });
});