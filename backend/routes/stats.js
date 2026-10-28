const express = require("express");
const supabase = require("../supabase");
const router = express.Router();

router.get("/", async (req,res,next) => {
  try {
    const [{count:books},{count:members}]=await Promise.all([
      supabase.from("books").select("*",{count:"exact",head:true}),
      supabase.from("transactions").select("member_email",{count:"exact",head:true})
    ]);
    res.json({books:books||0,members:members||0});
  } catch(e){ next(e); }
});
module.exports=router;