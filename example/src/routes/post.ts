import { RequestHandler } from "express";

export const post: RequestHandler = async (req, res) => {
  console.log("example post");
  return res.status(200).json({
    message: "Success",
  });
};
