import CartModel from "../models/cart.model.js";

class CartManager {

    // Crea un nuevo carrito vacío
    async crearCarrito() {
        try {
            const nuevoCarrito = new CartModel({ products: [] });
            await nuevoCarrito.save();
            return nuevoCarrito;
        } catch (error) {
            console.log("Error al crear carrito", error);
            throw error;
        }
    }

    // Obtiene un carrito por su ID
    async getCarritoById(cartId) {
        try {
            const carrito = await CartModel.findById(cartId);
            if (!carrito) {
                throw new Error(`No existe un carrito con el id ${cartId}`);
            }
            return carrito;
        } catch (error) {
            console.error("Error al obtener el carrito por ID", error);
            throw error;
        }
    }

    // Agrega un producto al carrito
    async agregarProductoAlCarrito(cartId, productId, quantity = 1) {
        try {
            const carrito = await this.getCarritoById(cartId);
            const existeProducto = carrito.products.find(item => item.product.toString() === productId);

            if (existeProducto) {
                existeProducto.quantity += quantity;
            } else {
                carrito.products.push({ product: productId, quantity });
            }

            carrito.markModified("products");
            await carrito.save();
            return carrito;

        } catch (error) {
            console.error("Error al agregar producto al carrito", error);
            throw error;
        }
    }

    // Elimina un producto del carrito con una cantidad especificada
    async deleteProductToCart(cartId, productId, quantityToRemove) {
        try {
            const carrito = await this.getCarritoById(cartId);
            if (!carrito) {
                throw new Error(`No se encontró el carrito con el id ${cartId}`);
            }

            const item = carrito.products.find(item => item.product.toString() === productId);

            if (item) {
                if (item.quantity <= quantityToRemove) {
                    carrito.products = carrito.products.filter(p => p.product.toString() !== productId);
                } else {
                    item.quantity -= quantityToRemove;
                }

                carrito.markModified('products');
                await carrito.save();
            } else {
                throw new Error(`No se encontró el producto con el id ${productId} en el carrito`);
            }

            return carrito;
        } catch (error) {
            console.error("Error al eliminar producto del carrito", error);
            throw error;
        }
    }

    // Actualiza la cantidad de un producto en el carrito
    async updateQuantityProductInCart(cartId, productId, quantity) {
        try {
            const carrito = await this.getCarritoById(cartId);
            const producto = carrito.products.find(item => item.product.toString() === productId);

            if (producto) {
                producto.quantity = quantity;
                carrito.markModified("products");
                await carrito.save();
            } else {
                throw new Error(`No se encontró el producto con el id ${productId} en el carrito`);
            }

            return carrito;

        } catch (error) {
            console.error("Error al actualizar la cantidad del producto en el carrito", error);
            throw error;
        }
    }

    // Elimina todos los productos del carrito
    async clearProductsToCart(cartId) {
        try {
            const carrito = await this.getCarritoById(cartId);
            carrito.products = [];
            carrito.markModified("products");
            await carrito.save();
            return carrito;

        } catch (error) {
            console.error("Error al eliminar todos los productos del carrito", error);
            throw error;
        }
    }
}

export default CartManager;
