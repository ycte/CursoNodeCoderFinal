import ProductService from "../services/products.service.js";
import config from "../config.js";
import Mail from "../helpers/mail.js";

let productService = new ProductService();

const getProducts = async (req, res, next) => {
  try {
    let limit = req.query.limit;
    let page = req.query.page;
    let sort = req.query.sort; //* Si es "1" es ascendente, si es "-1" es descendente (se ordena por precio)
    let filter = req.query.filter; //* Un ejemplo de filter puede ser "category"
    let filterValue = req.query.filterValue; //* Un ejemplo de filterValue puede ser "Frutas"

    let products = await productService.getProducts(
      limit,
      page,
      sort,
      filter,
      filterValue
    );

    let response = {
      status: "success",
      payload: products.docs,
      totalPages: products.totalPages,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.prevLink,
      nextLink: products.nextLink,
    }; //* Se utiliza el formato pedido por la consigna

    res.send(response);
  } catch (error) {
    return next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    let id = req.params.pid;

    let product = await productService.getProductById(id);

    res.send(product);
  } catch (error) {
    return next(error);
  }
};

const addProduct = async (req, res, next) => {
  try {
    let newProduct = req.body;

    if (req.user.email != config.ADMIN_NAME) {
      newProduct.owner = req.user.email; //* Se liga el mail del usuario como owner del producto
    }

    await productService.addProduct(newProduct);

    const products = await productService.getProducts();
    req.socketServer.sockets.emit("update-products", products); //* Para que se actualicen los productos en tiempo real

    res.send({ status: "success" });
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    let id = req.params.pid;

    let product = await productService.getProductById(id); //* Si el producto no existe, tira error

    //* El usuario debe ser "admin" o el "owner" del producto
    if (!(req.user.role === "admin" || product.owner === req.user.email)) {
      return res.status(403).send({
        status: "failure",
        details: "No tienes acceso. No eres el propietario del producto",
      });
    }

    let newProduct = req.body;

    await productService.updateProduct(id, newProduct);

    res.send({ status: "success" });
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    let id = req.params.pid;

    let product = await productService.getProductById(id); //* Si el producto no existe, tira error

    //* El usuario debe ser "admin" o el "owner" del producto
    if (!(req.user.role === "admin" || product.owner === req.user.email)) {
      return res.status(403).send({
        status: "failure",
        details: "No tienes acceso. No eres el propietario del producto",
      });
    }
    if (product.owner !== "admin") {
      let mail = new Mail();

      await mail.sendByMail(
        product.owner,
        "Producto Eliminado",
        "Un producto que creaste fue eliminado"
      );
    }

    await productService.deleteProduct(id);

    const products = await productService.getProducts();
    req.socketServer.sockets.emit("update-products", products); //* Para que se actualicen los productos en tiempo real

    res.send({ status: "success" });
  } catch (error) {
    return next(error);
  }
};

export default {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
