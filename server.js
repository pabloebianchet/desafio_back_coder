const express = require("express");
const { create } = require("express-handlebars");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");
const fs = require("fs");

const app = express();
const port = 8092;

// Configurar Handlebars
const hbs = create({
  extname: ".hbs",
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views", "layouts"),
  partialsDir: path.join(__dirname, "views", "partials"),
});

// Configurar el motor de plantillas
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));

// Middleware para manejar JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Servir archivos estáticos

// Rutas para los archivos de datos
const productsFilePath = path.join(__dirname, "data", "products.json");
const cartsFilePath = path.join(__dirname, "data", "carts.json");

// Funciones para leer y escribir archivos JSON
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

// Emitir eventos de actualización de productos
const emitProductUpdates = () => {
  const products = readJSONFile(productsFilePath);
  if (products) {
    io.emit("updateProducts", products);
  }
};

// Rutas de productos
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
  const { code } = req.body;

  if (products.some((product) => product.code === code)) {
    return res
      .status(400)
      .json({ message: "Producto con el mismo código ya existe" });
  }

  const newProduct = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    ...req.body,
    status: true,
  };
  products.push(newProduct);
  writeJSONFile(productsFilePath, products);
  emitProductUpdates(); // Emitir evento
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
    emitProductUpdates(); // Emitir evento
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
    emitProductUpdates(); // Emitir evento
    res.status(200).json({ message: "Producto eliminado exitosamente" });
  } else {
    res.status(404).json({ message: "Producto no encontrado" });
  }
});

app.use("/api/products", productsRouter);

// Rutas de carritos
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

// Ruta principal para renderizar la vista de productos
app.get("/", (req, res) => {
  const products = readJSONFile(productsFilePath); // Leer los productos
  if (products) {
    res.render("home", { title: "Lista de Productos", products });
  } else {
    res.status(500).send("Error al leer los productos");
  }
});

// Ruta para la vista en tiempo real
app.get("/realtimeproducts", (req, res) => {
  const products = readJSONFile(productsFilePath);
  res.render("realTimeProducts", {
    title: "Productos en Tiempo Real",
    products,
  });
});

// Crear el servidor HTTP
const server = http.createServer(app);

// Configurar Socket.IO
const io = socketIO(server);

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  socket.on("addProduct", (product) => {
    let products = readJSONFile(productsFilePath) || [];
    const newProduct = {
      id: products.length ? products[products.length - 1].id + 1 : 1,
      ...product,
    };
    products.push(newProduct);
    writeJSONFile(productsFilePath, products);
    io.emit("updateProducts", products); // Emitir a todos los clientes conectados
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

// Emitir eventos de actualización de productos cuando un cliente se conecta
io.on("connection", (socket) => {
  socket.emit("updateProducts", readJSONFile(productsFilePath));
});

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
