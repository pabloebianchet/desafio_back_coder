document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  const form = document.getElementById("productForm");
  const productList = document.getElementById("productsList");

  // Manejar envío del formulario
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const newProduct = {
      title: form.title.value,
      description: form.description.value,
      code: form.code.value,
      price: parseFloat(form.price.value),
      status: form.status.value === "true",
      stock: parseInt(form.stock.value, 10),
      category: form.category.value,
      thumbnails: form.thumbnails.value.split(","),
    };

    socket.emit("addProduct", newProduct);
  });

  // Actualizar la lista de productos
  socket.on("updateProducts", (products) => {
    productList.innerHTML = "";
    products.forEach((product) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${product.title} - ${product.description} - ${product.price}`;
      productList.appendChild(listItem);
    });
  });
});
