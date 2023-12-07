import passport from "passport";
import GithubStrategy from "passport-github2";
import config from "../config.js";

import UserService from "../services/user.service.js";

let userService = new UserService();

const initializePassportGithub = () => {
  //* Strategies

  passport.use(
    "github",
    new GithubStrategy(
      {
        clientID: config.GITHUB_CLIENT_ID,
        clientSecret: config.GITHUB_CLIENT_SECRET,
        callbackURL: config.PASSPORT_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        let user = await userService.findUser(profile._json.email);
        if (!user) {
          let newUser = {
            //* Github no nos da "last_name", "age", y "password" (por ello se hardcodean los datos)
            first_name: profile._json.name,
            last_name: "test-lastname",
            email: profile._json.email,
            age: 0,
            password: "",
          };

          const result = await userService.addUser(newUser);

          done(null, result);
        } else {
          done(null, user); //* Quiza deberia mandar el user (el profe no lo hizo, lo dejo asi)
        }
      }
    )
  );
};

export default initializePassportGithub;
