import jwt from "jsonwebtoken";

const requireAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization required" });
    }

    const token = authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
      });

      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ err, message: "Invalid or expired token" });
    }
  } catch (err) {
    return res.status(500).json(err);
  }
};

export { requireAuth };
