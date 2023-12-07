import mongoose from "mongoose";

const collection = "users";

const schema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    //* required: true //* Si la dejo en required, hay un en error con Github (pues password esta vacia)
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "carts",
  },
  role: {
    type: String,
    enum: ["user", "admin", "premium"],
    default: "user",
    required: true,
  },
  documents: {
    type: [
      {
        name: {
          type: String, //* Es el nombre del documento (por ejemplo, 'identification')
        },
        reference: {
          type: String, //* Es el link al archivo
        },
      },
    ],
    default: [],
  },
  last_connection: {
    type: String,
    default: Date.now(), //* Es en milisegundos
  },
});

export const userModel = mongoose.model(collection, schema);
