require("dotenv").config();
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const authRoutes = require("./routes/auth");
const booksRoutes = require("./routes/books");
const transactionRoutes = require("./routes/transactions");
const statsRoutes = require("./routes/stats");
const { requireAuth } = require("./middleware/auth");

const app=express();
const PORT=process.env.PORT||3000;

app.use(helmet({contentSecurityPolicy:false}));
app.use(express.json({limit:"100kb"}));
app.use(cookieParser());

app.get("/api/health",(req,res)=>res.json({status:"ok"}));
app.use("/api/auth",authRoutes);
app.use("/api/books",requireAuth,booksRoutes);
app.use("/api/transactions",requireAuth,transactionRoutes);
app.use("/api/stats",requireAuth,statsRoutes);

app.use(express.static(path.join(__dirname,"..","frontend")));
app.use((req, res) => {
  if(req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname,"..","frontend","index.html"));
});

app.use((err,req,res,next)=>{
  console.error(err);
  res.status(500).json({message:"An unexpected server error occurred"});
});

app.listen(PORT,()=>console.log(`Library Book Tracker running at http://localhost:${PORT}`));