let cart = JSON.parse(localStorage.getItem('productos')) || [];
let totalPrice = JSON.parse(localStorage.getItem('total')) || 0;
let totalQuantity = JSON.parse(localStorage.getItem('cantidad')) || 0;

function agregarBotonDinamico() {
    const cards = document.querySelectorAll(".card")
    //Tengo acceso a las cards, y puedo hacer que escuchen eventos
    console.log(cards);

    cards.forEach(card => {
        // si usamos document.querySelector, va a apuntar al documento. No va a tomar la información correctamente porque no sigue el bucle
        const button = card.querySelector('button');
        const productTitle = card.querySelector('h4').textContent;
        // Agarro el último p, que tiene span, y le sacamos el primer caracter
        const productPrice = card.querySelector('p:last-child span').textContent.slice(1);

        // si el boton esta dentro del ancla o link, usamos
        // event.preventDefault
        button.addEventListener('click', () => {
            const product = {
                id: card.dataset.id,
                title: productTitle,
                price: productPrice,
                count: 1
            }
            // Se puede poner condicion que verifique si el producto existe. En ese caso, se puede sumar la cantidad y valor
            let productoRepetido = false
            const productoEnCarrito = cart.find(prod => prod.id === card.dataset.id);
            if (productoEnCarrito) {
                productoEnCarrito.count += 1
                productoRepetido = true
            }
            if (productoRepetido == false) {
                cart.push(product);
            }
            totalPrice += parseFloat(product.price)

            localStorage.setItem('productos', JSON.stringify(cart));
            // Guarda hasta dos decimales
            localStorage.setItem('total', totalPrice.toString(2));

            // Se puede sumar directamente 1 a la cantidad. Después, que la cantidad de cada tipo de producto quede en count como atributo
            totalQuantity += 1

            localStorage.setItem("cantidad", totalQuantity);
            document.querySelector('.count').textContent = totalQuantity;
            alert("Producto agregado!")
        })
    });

}

function activarBotonesEliminar() {
    const botones = document.querySelectorAll(".btn-eliminar");

    botones.forEach(btn => {
        btn.addEventListener("click", (e) => {

            const fila = e.target.closest("tr");
            const id = fila.dataset.id;

            // 1. Filtrar el carrito
            cart = cart.filter(p => p.id != id);

            // 2. Recalcular precio total
            totalPrice = cart.reduce((acc, p) => acc + parseFloat(p.price) * p.count, 0);

            // 3. Guardar en localStorage
            localStorage.setItem("productos", JSON.stringify(cart));
            localStorage.setItem("total", totalPrice.toString());

            // 4. Actualizar contador
            totalQuantity -= 1
            localStorage.setItem("cantidad", totalQuantity);
            document.querySelector('.count').textContent = totalQuantity;

            // 5. Eliminar fila
            fila.remove();
        });
    });
}

function handleCart() {
    // Usamos la funcion para traer la info de local storage y usarlo en la otra pagina para generar la tabla dinamica
    const cart = JSON.parse(localStorage.getItem('productos')) || []; // Carga productos de local storage
    const total = JSON.parse(localStorage.getItem('total')) || 0;
    const carritoProduct = document.getElementById('itemProducts');
    if (carritoProduct != null) {
        if (cart.length === 0) {
            carritoProduct.innerHTML = "<p>El carrito está vacío</p>";
            return
        }
        const table = document.createElement('table');
        table.classList.add("tabla-productos");

        let encabezado = `
            <thead>
                <th>Nombre del Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Eliminar</th>
            </thead>
        `;
        let cuerpo = "<tbody>";
        cart.forEach(producto => {
            cuerpo += `
            <tr data-id="${producto.id}">
                <td data-label="Producto">${producto.title}</td>
                <td data-label="Precio">$${producto.price}</td>
                <td data-label="Cantidad">${producto.count}</td>
                <td>
                <img src="../assets/images/eliminar.png" class="btn-eliminar" alt="Eliminar">
            </td>
            </tr>
        `;
        });
        cuerpo += "</tbody>";

        table.innerHTML = encabezado + cuerpo;
        carritoProduct.appendChild(table);
        activarBotonesEliminar();

    }
}

function limpiarCarrito() {
    /*
    if (cart.length != 0){
        localStorage.removeItem("productos");
    }
        */
    if (confirm("Estas seguro de querer vaciar el carrito?")) {
        cart = [];
        totalPrice = 0;
        totalQuantity = 0
        localStorage.removeItem("cantidad");
        document.querySelector('.count').textContent = totalQuantity;
        localStorage.removeItem("productos");
        localStorage.removeItem("total");

        location.reload();
    }
}


// Traemos y cargamos los productos de mi API

// async function loadProducts() {


const loadProducts = async () => {
    try {
        const res = await fetch("https://dummyjson.com/products");
        const data = await res.json();
        printProducts(data.products);

    } catch (error) {
        console.log("Error: ", error);

    }
}


// Axios con async/await --> requiere instalacion de dependencias
/*
const loadProducts = async () => {
    try {
        const res = await axios.get("https://dummyjson.com/products"); // axios convierte automáticamente en JSON
        console.log(res);

    } catch (error) {
        console.log("Error: ", error);

    }
}
    */

// function printProducts(products) {
const printProducts = async (products) => {
    const container = document.getElementById("product-list");
    products.forEach(producto => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
        <a href="./descripcion.html?id=${producto.id}" target="_self">
            <h4>${producto.title}</h4>
            <img src="${producto.thumbnail}" alt="${producto.title}" loading="lazy">
            <p>${producto.description}</p>
            <p>Precio: <span>$${producto.price}</span></p>
        </a>
        <button>Comprar</button>
        `;
        card.dataset.id = producto.id;
        container.appendChild(card);
    })

    agregarBotonDinamico(); // Se pone todo lo anterior dentro de una función para tener la funcionalidad una vez que se carguen los productos
}

/*
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
*/
/*
async function mostrarPagDescripcionProducto(params) {
    try {
        const res = await fetch(`https://dummyjson.com/products/${id}`);
        const productInfo = await res.json();
        console.log(productInfo);

    } catch (error) {
        console.log("Error: ", error);

    }
}
*/
// loadProducts();
//window.onload = handleCart; Lo mismo de abajo. Ejecutan la función apenas se carga
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('.count').textContent = totalQuantity;
    loadProducts();
    handleCart();
});



const params = new URLSearchParams(window.location.search); //Obtiene la URL de la página
const id = params.get("id"); // Busca el parámetro de id
console.log(id);
const container = document.getElementById("product-detail");

const mostrarPagDescripcionProducto = async () => {
    try {
        const res = await fetch(`https://dummyjson.com/products/${id}`);
        const productInfo = await res.json();
        console.log(productInfo);
        if (productInfo) {
            container.innerHTML = `
        <h2>${productInfo.title}</h2>
        <img src="${productInfo.thumbnail}" alt="${productInfo.title}">
        <p>${productInfo.description}</p>
        <p>Precio: $${productInfo.price}</p>
        <button id="boton-compra-descripcion">Comprar</button>
    `;
            const botonCompra = document.getElementById("boton-compra-descripcion");
            botonCompra.addEventListener("click", () => {
                const product = {
                    id: productInfo.id,
                    title: productInfo.title,
                    price: productInfo.price,
                    count: 1
                };
                let productoRepetido = false
                const productoEnCarrito = cart.find(prod => prod.id === productInfo.id);
                if (productoEnCarrito) {
                    productoEnCarrito.count += 1
                    productoRepetido = true
                }
                if (productoRepetido == false) {
                    cart.push(product);
                }
                totalPrice += parseFloat(product.price);

                localStorage.setItem("productos", JSON.stringify(cart));
                localStorage.setItem("total", totalPrice.toString());
                totalQuantity += 1
                localStorage.setItem("cantidad", totalQuantity);
                document.querySelector('.count').textContent = totalQuantity;
                alert("Producto agregado!");
            });
        } else {
            container.innerHTML = "<p>Producto no encontrado.</p>";
        }
        // document.write(`El producto seleccionado es ${productInfo.title}`)
    } catch (error) {
        console.log("Error: ", error);

    }
}

document.addEventListener("DOMContentLoaded", mostrarPagDescripcionProducto);

document.getElementById("limpiar-carrito").addEventListener("click", () => {
    limpiarCarrito();
})