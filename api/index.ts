import { app } from "../server.js";

export default function (req: any, res: any) {
  try {
    return app(req, res);
  } catch (error: any) {
    console.error("Fatal Server Error:", error);
    res.status(500).json({
      error: "Fatal Server Initialization Error",
      message: error.message,
      stack: error.stack
    });
  }
}
