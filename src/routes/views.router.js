import { Router } from "express";
const router = Router();

import ProductManager from "../dao/db/product-manager-db.js";
import CartManager from "../dao/db/cart-manager-db.js";

const productManager = new ProductManager();
const cartManager = new CartManager();

// Ruta para la vista de productos en tiempo real
router.get("/realtimeproducts", async (req, res) => {
  try {
    // Paginación (1 página, 10 productos)
    const productos = await productManager.getProducts({ page: 1, limit: 10 });

    const nuevoArray = productos.docs.map((producto) => {
      const { _id, ...rest } = producto.toObject();
      return rest;
    });

    res.render("realtimeproducts", {
      productos: nuevoArray,
    });
  } catch (error) {
    console.error("Error al obtener productos para realtimeproducts", error);
    res
      .status(500)
      .json({ status: "error", error: "Error interno del servidor" });
  }
});

// Ruta para la vista de productos con paginación y opciones de ordenamiento y filtrado
router.get("/products", async (req, res) => {
  try {
    const { page = 1, limit = 2, sort, query } = req.query;

    const productos = await productManager.getProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      query,
    });

    const nuevoArray = productos.docs.map((producto) => {
      const rest = producto.toObject();
      return rest;
    });

    res.render("products", {
      productos: nuevoArray,
      hasPrevPage: productos.hasPrevPage,
      hasNextPage: productos.hasNextPage,
      prevPage: productos.prevPage,
      nextPage: productos.nextPage,
      currentPage: productos.page,
      totalPages: productos.totalPages,
      prevLink: productos.prevLink,
      nextLink: productos.nextLink,
    });
  } catch (error) {
    console.error("Error al obtener productos", error);
    res.status(500).json({
      status: "error",
      error: "Error interno del servidor",
    });
  }
});

// Ruta para la vista del carrito
router.get("/carts/:cid", async (req, res) => {
  const cartId = req.params.cid;

  try {
    const carrito = await cartManager.getCarritoById(cartId);

    if (!carrito) {
      console.log("No existe ese carrito con el id");
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const productosEnCarrito = carrito.products.map((item) => ({
      product: item.product.toObject(),
      quantity: item.quantity,
    }));

    res.render("carts", { productos: productosEnCarrito });
  } catch (error) {
    console.error("Error al obtener el carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta para la vista principal que muestra todos los productos
router.get("/", async (req, res) => {
  try {
    const productos = await productManager.getProducts({ page: 1, limit: 10 });

    const nuevoArray = productos.docs.map((producto) => {
      const { _id, ...rest } = producto.toObject();
      return rest;
    });

    res.render("home", { productos: nuevoArray });
  } catch (error) {
    console.error("Error al obtener productos para home", error);
    res.status(500).send("Error interno del servidor");
  }
});

export default router;
