import { RequestHandler } from "express";

export const post = [
  async (req, res, next) => {
    req.params = {
      ...req.params,
      userID: "123",
    };

    return next();
  },
  async (req, res) => {
    const { userID } = req.params;

    console.log("req.params", req.params);

    return res.status(200).json({
      message: "Success",
      userID,
    });
  },
] as RequestHandler[];
