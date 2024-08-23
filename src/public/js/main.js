const socket = io();

socket.on("productos", (data) => {
  renderProductos(data);
});

// Función para renderizar nuestros productos:
const renderProductos = (data) => {
  const contenedorProductos = document.getElementById("contenedorProductos");
  contenedorProductos.innerHTML = "";
  console.log("data es lo siguiente", data);

  // Accede a la propiedad 'docs' del objeto 'data'
  const productos = data.docs;

  productos.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("product-card"); // Añadir clase para estilo

    card.innerHTML = `  
        <div class="product-info">
          <p class="product-id">ID: ${item._id}</p>
          <h2 class="product-title">${item.title}</h2>
          <p class="product-price">$${item.price}</p>
          <button class="delete-btn">Eliminar</button>
        </div>
    `;
    contenedorProductos.appendChild(card);

    card.querySelector(".delete-btn").addEventListener("click", () => {
      eliminarProducto(item._id);
    });
  });
};

const eliminarProducto = (id) => {
  socket.emit("eliminarProducto", id);
};

// Agregamos productos con el formulario:
document.getElementById("btnEnviar").addEventListener("click", () => {
  agregarProducto();
});

const agregarProducto = () => {
  const producto = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    price: document.getElementById("price").value,
    img: document.getElementById("img").value,
    code: document.getElementById("code").value,
    stock: document.getElementById("stock").value,
    category: document.getElementById("category").value,
    status: document.getElementById("status").value === "true",
  };

  socket.emit("agregarProducto", producto);
};

// Estilos en CSS
const style = document.createElement("style");
style.innerHTML = `
  .product-card {
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin: 10px;
    padding: 15px;
    transition: transform 0.2s;
  }

  .product-card:hover {
    transform: scale(1.05);
  }

  .product-info {
    text-align: center;
  }

  .product-id {
    font-size: 12px;
    color: #aaa;
  }

  .product-title {
    font-size: 20px;
    font-weight: bold;
    color: #333;
  }

  .product-price {
    font-size: 18px;
    color: #666;
    margin: 10px 0;
  }

  .delete-btn {
    background-color: #ff6347;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .delete-btn:hover {
    background-color: #e53e3e;
  }
`;
document.head.appendChild(style);
