import express from "express";
const router = express.Router();
import CartManager from "../dao/db/cart-manager-db.js";
import ProductManager from "../dao/db/product-manager-db.js";

const cartManager = new CartManager();
const productManager = new ProductManager();

//Crear un nuevo carrito//
router.post("/", async (req, res) => {
  try {
    const nuevoCarrito = await cartManager.crearCarrito();
    console.log(nuevoCarrito);
    res.status(201).json(nuevoCarrito);
  } catch (error) {
    console.error("Error al crear un nuevo carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Listar los productos que pertenecen a un carrito//
router.get("/:cid", async (req, res) => {
  const cartId = req.params.cid;
  try {
    const carrito = await cartManager.getCarritoById(cartId);
    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    res.json(carrito.products);
  } catch (error) {
    console.error("Error al obtener el carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Agregar productos a un carrito//
router.post("/:cid/product/:pid", async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = req.body.quantity || 1;

  try {
    const carritoActualizado = await cartManager.agregarProductoAlCarrito(
      cartId,
      productId,
      quantity
    );
    res.status(200).json(carritoActualizado.products);
  } catch (error) {
    console.error("Error al agregar producto al carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Eliminar un producto de un carrito
router.delete("/:cid/product/:pid/:quantity", async (req, res) => {
  const { cid, pid, quantity } = req.params;
  try {
    //Verifica si el producto existe//
    const product = await productManager.getProductById(pid);
    if (!product) {
      return res.status(404).json({
        status: "Error",
        msg: `No se encontró el producto con el id ${pid}`,
      });
    }

    //Verifica si el carrito existe//
    const cart = await cartManager.getCarritoById(cid);
    if (!cart) {
      return res.status(404).json({
        status: "Error",
        msg: `No se encontró el carrito con el id ${cid}`,
      });
    }

    //Llama al método para eliminar el producto del carrito//
    const cartUpdate = await cartManager.deleteProductToCart(
      cid,
      pid,
      parseInt(quantity)
    );

    res.status(200).json({ status: "success", payload: cartUpdate });
  } catch (error) {
    console.error("Error al eliminar producto del carrito", error);
    res
      .status(500)
      .json({ status: "Error", msg: "Error interno del servidor" });
  }
});

//Actualizar la cantidad de un producto en un carrito//
router.put("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({
      status: "Error",
      msg: "La cantidad debe ser un número positivo",
    });
  }

  try {
    const product = await productManager.getProductById(pid);
    if (!product) {
      return res.status(404).json({
        status: "Error",
        msg: `No se encontró el producto con el id ${pid}`,
      });
    }
    const cart = await cartManager.getCarritoById(cid);
    if (!cart) {
      return res.status(404).json({
        status: "Error",
        msg: `No se encontró el carrito con el id ${cid}`,
      });
    }

    const cartUpdate = await cartManager.updateQuantityProductInCart(
      cid,
      pid,
      Number(quantity)
    );

    res.status(200).json({ status: "success", payload: cartUpdate });
  } catch (error) {
    console.error("Error al actualizar la cantidad del producto", error);
    res
      .status(500)
      .json({ status: "Error", msg: "Error interno del servidor" });
  }
});

//Eliminar todos los productos de un carrito//
router.delete("/:cid", async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await cartManager.clearProductsToCart(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ status: "Error", msg: "Carrito no encontrado" });
    }

    res.status(200).json({ status: "success", cart });
  } catch (error) {
    console.error("Error al eliminar todos los productos del carrito", error);
    res
      .status(500)
      .json({ status: "Error", msg: "Error interno del servidor" });
  }
});

//Eliminar un carrito por su id//
router.delete("/:cid", async (req, res) => {
  const { cid } = req.params;
  try {
    const carritoEliminado = await cartManager.deleteCarritoById(cid);
    if (!carritoEliminado) {
      return res
        .status(404)
        .json({ status: "Error", msg: "Carrito no encontrado" });
    }

    res
      .status(200)
      .json({ status: "success", msg: "Carrito eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el carrito", error);
    res
      .status(500)
      .json({ status: "Error", msg: "Error interno del servidor" });
  }
});

export default router;
