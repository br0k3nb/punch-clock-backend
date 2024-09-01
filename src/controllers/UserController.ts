import { Request, Response } from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import "dotenv/config";

const SEVEN_DAYS_IN_MS = 604800000;

export default {
  async add(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const userExists = await User.find({ email });

      if (userExists.length > 0)
        return res
          .status(400)
          .json({ message: "User already exists, please sign in!" });

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        email,
        password: hashedPassword,
        name,
      });

      res.status(200).json({ message: "User created successfully!" });
    } catch (err) {
      res.status(400).json({ message: err });
    }
  },
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      console.log(email, password);

      const getUser = await User.find({ email });

      if (!getUser.length) {
        return res
          .status(400)
          .json({ message: "Wrong email or password combination!" });
      }

      const { _id, name } = getUser[0];

      const passwordDB = getUser[0].password;
      const comparePasswords = await bcrypt.compare(password, passwordDB);

      if (comparePasswords) {
        const payload = {
          iss: "login-form",
          sub: { _id, name },
          exp: Math.floor(Date.now() / 1000 + SEVEN_DAYS_IN_MS),
        };

        const token = jwt.sign(payload, process.env.SECRET as string, {
          algorithm: "HS512",
        });

        return res.status(200).json({
          token,
          _id,
          name,
        });
      }

      return res
        .status(404)
        .json({ message: "Wrong email or password combination!" });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: err });
    }
  },
  async changePassword(req: Request, res: Response) {
    try {
      const { userId, password } = req.body;
      const getUser = await User.find({ _id: userId });

      if (getUser.length === 0)
        return res
          .status(400)
          .json({ message: "User not found, please try again or later!" });

      const hashedPass = await bcrypt.hash(password, 10);
      await User.findOneAndUpdate({ _id: userId }, { password: hashedPass });

      res.status(200).json({ message: "Password changed!" });
    } catch (err) {
      res.status(400).json({ message: err });
    }
  },
  async verifyIfTokenIsValid(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const { sub } = jwt.decode(token) as any;

      const findUser = await User.findById(sub._id);

      const userDataObj = {
        ...sub,
        TFAEnabled: findUser.TFAStatus ? true : false,
        settings: { ...findUser.settings },
      };

      return res.status(200).json(userDataObj);
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: err });
    }
  },
};
