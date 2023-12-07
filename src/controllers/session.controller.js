import { createHash, validatePassword } from "../utils.js";
import jwt from "jsonwebtoken";
import config from "../config.js";
import UserService from "../services/user.service.js";
import CurrentUserDTO from "./DTO/user.dto.js";
import Mail from "../helpers/mail.js";

const userService = new UserService();

const register = async (req, res) => {
  res.send({ status: "success", message: "User has been created" });
};

const registerFail = async (req, res) => {
  res.status(400).send({ status: "error", error: "Error de autenticación" });
};

const login = async (req, res) => {
  let user = req.user; //* Es el user que recibimos de passport (ver en passport.config.js)

  if (!user) {
    return res
      .status(400)
      .send({ status: "error", details: "Credenciales inválidas" });
  }

  await userService.updateUserLastConnection(user.id);

  let token = jwt.sign(req.user, config.JWT_SECRET, { expiresIn: "24h" });

  return res
    .cookie("authToken", token, { httpOnly: true })
    .send({ status: "success" });
};

const loginFail = async (req, res) => {
  res
    .status(400)
    .send({ status: "error", details: "error de inicio de sesion" });
};

const logout = async (req, res) => {
  const user = req.user;
  await userService.updateUserLastConnection(user.id);

  res.clearCookie("authToken");
  res.send({ status: "sucess" });
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send({ status: "error", error: "Incomplete values" });
  }

  try {
    const user = await userService.findUser(email);
    if (validatePassword(password, user)) {
      return res.status(400).send({
        status: "failure",
        error: "La contraseña nueva y la antigua son iguales",
      });
    }

    const newHashedPassword = createHash(password);

    await userService.updatePassword(email, newHashedPassword);

    return res.send({ status: "success", message: "Password updated" });
  } catch (error) {
    return res.status(404).send({ status: "error", error: error.message });
  }
};

const requestResetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .send({ status: "error", error: "Valores incompletos" });
  }

  try {
    const user = await userService.findUser(email);

    if (!user) {
      return res
        .status(404)
        .send({ status: "error", message: "There is no user with such email" });
    }

    //* Este token va a durar 1 hora
    let token = jwt.sign({ email }, config.JWT_PASSWORD_REQUEST, {
      expiresIn: "1h",
    });

    let mail = new Mail();

    await mail.send(
      user,
      "Password reset",
      `
      <div style='color: blue'>
        <h1> Restaura tu email haciendo click en el siguiente link </h1>
        https://cursonodecoderfinal-production-0e3c.up.railway.app/resetPassword?token=${token}
      </div>
      `
    );

    return res.send({ status: "success", message: "Email sent" });
  } catch (error) {
    return res.status(404).send({ status: "error", error: error.message });
  }
};

const github = async (req, res) => {
  //* Vacio (es lo que mandamos a llamar desde el front)
  //* Es para que pase por el middleware, y en cuanto se pueda acceder al perfil, passport
  //* envia la info hacia el callback especificado
};

const githubcallback = async (req, res) => {
  const user = {
    name: `${req.user.first_name} ${req.user.last_name}`,
    email: req.user.email,
    age: req.user.age,
    role: req.user.role,
    id: req.user._id,
    cart: req.user.cart,
  };

  let token = jwt.sign(user, config.JWT_SECRET, { expiresIn: "24h" });

  return res.cookie("authToken", token, { httpOnly: true }).redirect("/home");
};

const current = async (req, res) => {
  let userDto = new CurrentUserDTO(req.user);

  res.send(userDto);
};

export default {
  register,
  registerFail,
  login,
  loginFail,
  logout,
  resetPassword,
  requestResetPassword,
  github,
  githubcallback,
  current,
};
