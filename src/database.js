import mongoose from "mongoose";

mongoose
  .connect(
    "mongodb+srv://pablodbUser:*Clavelex2026@dbcoder.gnbsr.mongodb.net/?retryWrites=true&w=majority&appName=dbcoder"
  )
  .then(() => console.log("Conexión exitosa a la base de datos"))
  .catch((error) => {
    console.error("Error conectando a la base de datos", error);
    process.exit(1); // Finaliza el proceso si no se puede conectar
  });
