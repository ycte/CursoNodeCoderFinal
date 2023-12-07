import multer from "multer";
import __dirname from "../utils.js";

//* Configuracion de almacenamiento para multer (para el uploader)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "profiles" || file.fieldname === "products") {
      cb(null, `${__dirname}/public/img/${file.fieldname}`);
    } else {
      //* Los archivos van a ser documentos
      cb(null, `${__dirname}/public/img/documents/${file.fieldname}`);
    }
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
    //* Para evitar colisiones se utiliza la fecha
  },
});

//* Uploader de multer
const uploader = multer({
  storage: storage,
});

export default uploader;
