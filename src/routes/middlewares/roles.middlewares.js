export const adminRoleAuth = (req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    res.status(400).send({
      status: "failure",
      details: "No tienes acceso. Debe ser administrador",
    });
  }
};

export const userRoleAuth = (req, res, next) => {
  if (req.user.role === "user") {
    next();
  } else {
    res.status(400).send({
      status: "failure",
      details: "No tienes acceso. Debe ser un usuario",
    });
  }
};

export const premiumRoleAuth = (req, res, next) => {
  if (req.user.role === "premium") {
    next();
  } else {
    res.status(400).send({
      status: "failure",
      details: "No tienes acceso. debe ser premium",
    });
  }
};

//* Permite (a partir de un array con roles), otorgar acceso a dichos roles
export const multipleRolesAuth = (roles) => {
  return async (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      let msg = roles.join(" / ");
      res.status(400).send({
        status: "failure",
        details: "No tienes acceso. Debe ser: " + msg,
      });
    }
  };
};
