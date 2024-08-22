import mongoose from 'mongoose';

// Esquema del carrito
const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'La cantidad debe ser al menos 1']
      }
    }
  ]
});

// Middleware pre que realiza la población automáticamente para 'findOne'
cartSchema.pre('findOne', function (next) {
  this.populate('products.product', '_id title price');
  next();
});

// Middleware pre que realiza la población automáticamente para 'find'
cartSchema.pre('find', function (next) {
  this.populate('products.product', '_id title price');
  next();
});

// Creacion del modelo del carrito
const CartModel = mongoose.model('Cart', cartSchema);

export default CartModel;

