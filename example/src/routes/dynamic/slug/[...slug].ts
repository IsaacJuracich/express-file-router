import { RequestHandler } from "express";

export const post: RequestHandler = async (req, res) => {
  const { slug } = req.params;

  console.log("example dynamic slug post", slug);
  return res.status(200).json({
    message: "Success",
  });
};
