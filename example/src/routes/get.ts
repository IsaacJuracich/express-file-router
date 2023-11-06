import { RequestHandler } from "express";

export const get: RequestHandler = async (req, res) => {
  console.log("example get");
  return res.status(200).json({
    message: "Success",
  });
};
