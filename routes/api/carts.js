const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const cartsFilePath = path.join(__dirname, "../../carts.json");

// Crear un nuevo carrito
router.post("/", (req, res) => {
  try {
    const cartsData = fs.readFileSync(cartsFilePath, "utf-8");
    const carts = JSON.parse(cartsData);

    const newCart = {
      id: (carts.length + 1).toString(),
      products: [],
    };

    carts.push(newCart);
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));

    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el carrito" });
  }
});

// Obtener los productos de un carrito por id
router.get("/:cid", (req, res) => {
  try {
    const cartsData = fs.readFileSync(cartsFilePath, "utf-8");
    const carts = JSON.parse(cartsData);
    const cart = carts.find((c) => c.id === req.params.cid);

    if (cart) {
      res.json(cart.products);
    } else {
      res.status(404).json({ message: "Carrito no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el carrito" });
  }
});

// Agregar un producto a un carrito
router.post("/:cid/product/:pid", (req, res) => {
  try {
    const { pid } = req.params;
    const quantity = req.body.quantity || 1;

    const cartsData = fs.readFileSync(cartsFilePath, "utf-8");
    const carts = JSON.parse(cartsData);

    const cartIndex = carts.findIndex((c) => c.id === req.params.cid);
    if (cartIndex !== -1) {
      const cart = carts[cartIndex];
      const productIndex = cart.products.findIndex((p) => p.product === pid);

      if (productIndex !== -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ product: pid, quantity });
      }

      carts[cartIndex] = cart;
      fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));

      res.json(cart);
    } else {
      res.status(404).json({ message: "Carrito no encontrado" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al agregar el producto al carrito" });
  }
});

module.exports = router;
