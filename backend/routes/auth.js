const express = require("express");
const bcrypt = require("bcryptjs");
const supabase = require("../supabase");
const { createSession, getSession, destroySession } = require("../middleware/auth");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message:"Username and password are required" });

    const { data, error } = await supabase.from("users").select("*").eq("username", username).maybeSingle();
    if (error) throw error;
    if (!data || !(await bcrypt.compare(password, data.password_hash))) {
      return res.status(401).json({ message:"Invalid username or password" });
    }

    const token = createSession({ id:data.id, username:data.username, role:data.role });
    res.cookie("session", token, { httpOnly:true, sameSite:"lax", secure:process.env.NODE_ENV==="production", maxAge:8*60*60*1000 });
    res.json({ user:{ username:data.username, role:data.role } });
  } catch (e) { next(e); }
});

router.post("/logout", (req,res) => {
  destroySession(req);
  res.clearCookie("session");
  res.json({ message:"Logged out" });
});

router.get("/me", (req,res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ message:"Not logged in" });
  res.json({ user:session.user });
});

module.exports = router;