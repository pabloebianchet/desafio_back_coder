import mongoose from "mongoose";

// Creamos el schema y el model de productos:
const productoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'El precio debe ser un número positivo'] // Validación para asegurar precios positivos
    },
    img: {
        type: String
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    stock: {
        type: Number,
        required: true,
        min: [0, 'El stock debe ser un número no negativo'] // Validación para asegurar stock no negativo
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    thumbnails: {
        type: [String]
    }
});

// Creamos el modelo
const ProductModel = mongoose.model("Product", productoSchema);

export default ProductModel;



