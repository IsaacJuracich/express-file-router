import { RequestHandler } from "express";

export const post: RequestHandler = async (req, res) => {
  const { example } = req.params;

  console.log("example dynamic param post", example);
  return res.status(200).json({
    message: "Success",
  });
};
