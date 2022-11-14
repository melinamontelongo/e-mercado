//Función que agrega una escucha de evento de tipo click a un elemento con cierto Id y 
//almacena un valor dado en localStorage y redirecciona al html de productos
function getCategory(id, catID){
    document.getElementById(id).addEventListener("click", function(){
        localStorage.setItem("catID", catID);
        window.location = "products.html"
    })
}

document.addEventListener("DOMContentLoaded", function(){

    showUser();   //Muestra al usuario en la barra de navegación
    cookiesAlert(); //Muestra el aviso de cookies si ya no fue mostrado
   let cards = document.querySelectorAll(".card");        //Obtiene todos los elementos que necesitan la escucha de evento
   let catID = 101;                                      //Inicializa catID en 101 (primer categoría)
   cards.forEach(card => getCategory(card.id, catID++)) //Para cada elemento llama la función con el Id del mismo 
                                                        //y el catID se va incrementando (cubriendo todas las categorías)
});