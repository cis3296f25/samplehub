import admin from "../firebaseAdmin.js";

export async function requireFirebaseAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    const token = header.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    req.firebaseUid = decoded.uid;
    req.email = decoded.email;

    next();
  } catch (err) {
    return res.status(500).json(err);
  }
}
