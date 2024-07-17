const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const productsFilePath = path.join(__dirname, "../../../products.json");

// Obtener todos los productos
router.get("/", (req, res) => {
  try {
    const productsData = fs.readFileSync(productsFilePath, "utf-8");
    let products = JSON.parse(productsData);

    const limit = req.query.limit ? parseInt(req.query.limit) : products.length;
    products = products.slice(0, limit);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los productos" });
  }
});

// Obtener un producto por id
router.get("/:pid", (req, res) => {
  try {
    const productsData = fs.readFileSync(productsFilePath, "utf-8");
    const products = JSON.parse(productsData);
    const product = products.find((p) => p.id === req.params.pid);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el producto" });
  }
});

// Agregar un nuevo producto
router.post("/", (req, res) => {
  try {
    const {
      title,
      description,
      code,
      price,
      status = true,
      stock,
      category,
      thumbnails = [],
    } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios, excepto thumbnails",
      });
    }

    const productsData = fs.readFileSync(productsFilePath, "utf-8");
    const products = JSON.parse(productsData);

    const newProduct = {
      id: (products.length + 1).toString(),
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    };

    products.push(newProduct);
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Error al agregar el producto" });
  }
});

// Actualizar un producto
router.put("/:pid", (req, res) => {
  try {
    const {
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    } = req.body;

    const productsData = fs.readFileSync(productsFilePath, "utf-8");
    const products = JSON.parse(productsData);

    const productIndex = products.findIndex((p) => p.id === req.params.pid);
    if (productIndex !== -1) {
      const updatedProduct = {
        ...products[productIndex],
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails,
      };

      products[productIndex] = updatedProduct;
      fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el producto" });
  }
});

// Eliminar un producto
router.delete("/:pid", (req, res) => {
  try {
    const productsData = fs.readFileSync(productsFilePath, "utf-8");
    let products = JSON.parse(productsData);

    const productIndex = products.findIndex((p) => p.id === req.params.pid);
    if (productIndex !== -1) {
      products = products.filter((p) => p.id !== req.params.pid);
      fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));

      res.json({ message: "Producto eliminado" });
    } else {
      res.status(404).json({ message: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el producto" });
  }
});

module.exports = router;
