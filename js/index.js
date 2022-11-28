//Función que agrega una escucha de evento de tipo click a un elemento con cierto Id y 
//almacena un valor dado en localStorage y redirecciona al html de productos
function getCategory(id, catID){
    document.getElementById(id).addEventListener("click", ()=>{ 
        setCatID(catID);
    })
}
    

document.addEventListener("DOMContentLoaded", ()=> {
    showUser();   //Muestra al usuario en la barra de navegación
    cookiesAlert(); //Muestra el aviso de cookies si ya no fue mostrado
    let cards = document.querySelectorAll(".card");        //Obtiene todos los elementos que necesitan la escucha de evento
    let catID = 101;                                      //Contador // Inicializa catID en 101 (primer categoría)
    cards.forEach(card => getCategory(card.id, catID++)) //Para cada elemento llama la función con el Id del mismo 
                                                        //y el catID se va incrementando (cubriendo todas las categorías)
});