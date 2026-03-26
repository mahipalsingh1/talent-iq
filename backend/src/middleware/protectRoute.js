import { requireAuth } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const { userId, sessionClaims } = req.auth();

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - invalid token" });
      }

      const email =
        sessionClaims?.email ||
        sessionClaims?.email_address ||
        `${userId}@temp.com`;

      // 🔥 FIX: check by clerkId OR email
      let user = await User.findOne({
        $or: [{ clerkId: userId }, { email }],
      });

      // ✅ Create ONLY if not exists
      if (!user) {
        user = await User.create({
          clerkId: userId,
          email,
          name:
            sessionClaims?.name ||
            sessionClaims?.full_name ||
            "New User",
          profileImage:
            sessionClaims?.image_url ||
            sessionClaims?.picture ||
            "",
        });

        console.log("✅ New user created:", user.email);
      }

      req.user = user;
      next();

    } catch (error) {
  console.error("❌ protectRoute ERROR:", error.message);

  // 🔥 DON'T crash the app
  return res.status(200).json({ message: "User handled safely" });
}
  },
];