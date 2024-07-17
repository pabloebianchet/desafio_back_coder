const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 8080;

app.use(express.json());

const productsFilePath = path.join(__dirname, "data", "products.json");
const cartsFilePath = path.join(__dirname, "data", "carts.json");

const readJSONFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error leyendo el archivo ${filePath}:`, error);
    return null;
  }
};

const writeJSONFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error escribiendo el archivo ${filePath}:`, error);
  }
};

const productsRouter = express.Router();

productsRouter.get("/", (req, res) => {
  const products = readJSONFile(productsFilePath);
  if (products) {
    const limit = parseInt(req.query.limit, 10) || products.length;
    res.json(products.slice(0, limit));
  } else {
    res.status(500).send("Error al leer los productos");
  }
});

productsRouter.get("/:pid", (req, res) => {
  const products = readJSONFile(productsFilePath);
  const product = products
    ? products.find((p) => p.id === parseInt(req.params.pid, 10))
    : null;
  if (product) {
    res.json(product);
  } else {
    res.status(404).send("Producto no encontrado");
  }
});

productsRouter.post("/", (req, res) => {
  const products = readJSONFile(productsFilePath) || [];
  const newProduct = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    ...req.body,
    status: true,
  };
  products.push(newProduct);
  writeJSONFile(productsFilePath, products);
  res.status(201).json(newProduct);
});

productsRouter.put("/:pid", (req, res) => {
  let products = readJSONFile(productsFilePath);
  const index = products
    ? products.findIndex((p) => p.id === parseInt(req.params.pid, 10))
    : -1;
  if (index !== -1) {
    products[index] = { ...products[index], ...req.body };
    writeJSONFile(productsFilePath, products);
    res.json(products[index]);
  } else {
    res.status(404).send("Producto no encontrado");
  }
});

productsRouter.delete("/:pid", (req, res) => {
  let products = readJSONFile(productsFilePath);
  const index = products
    ? products.findIndex((p) => p.id === parseInt(req.params.pid, 10))
    : -1;
  if (index !== -1) {
    products = products.filter((p) => p.id !== parseInt(req.params.pid, 10));
    writeJSONFile(productsFilePath, products);
    res.sendStatus(204);
  } else {
    res.status(404).send("Producto no encontrado");
  }
});

app.use("/api/products", productsRouter);

const cartsRouter = express.Router();

cartsRouter.post("/", (req, res) => {
  const carts = readJSONFile(cartsFilePath) || [];
  const newCart = {
    id: carts.length ? carts[carts.length - 1].id + 1 : 1,
    products: [],
  };
  carts.push(newCart);
  writeJSONFile(cartsFilePath, carts);
  res.status(201).json(newCart);
});

cartsRouter.get("/:cid", (req, res) => {
  const carts = readJSONFile(cartsFilePath);
  const cart = carts
    ? carts.find((c) => c.id === parseInt(req.params.cid, 10))
    : null;
  if (cart) {
    res.json(cart);
  } else {
    res.status(404).send("Carrito no encontrado");
  }
});

cartsRouter.post("/:cid/product/:pid", (req, res) => {
  let carts = readJSONFile(cartsFilePath);
  const cartIndex = carts
    ? carts.findIndex((c) => c.id === parseInt(req.params.cid, 10))
    : -1;
  if (cartIndex !== -1) {
    const cart = carts[cartIndex];
    const productIndex = cart.products.findIndex(
      (p) => p.product === parseInt(req.params.pid, 10)
    );
    if (productIndex !== -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      cart.products.push({
        product: parseInt(req.params.pid, 10),
        quantity: 1,
      });
    }
    writeJSONFile(cartsFilePath, carts);
    res.json(cart);
  } else {
    res.status(404).send("Carrito no encontrado");
  }
});

app.use("/api/carts", cartsRouter);

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
