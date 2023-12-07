import mongoose from "mongoose";

const connectDB = async (url) => {
  try {
    let connection = await mongoose.connect(
      url //* Deberia ser una variable de entorno en "config.js"
    );

    console.log("Conexión exitosa a la base de datos");

    return connection;
  } catch (error) {
    console.error("Error al conectar a la base de datos", error);
  }
};

export default connectDB;
