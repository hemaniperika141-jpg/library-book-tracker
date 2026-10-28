const express = require("express");
const supabase = require("../supabase");
const router = express.Router();

router.get("/", async (req,res,next) => {
  try {
    const { data,error } = await supabase.from("books").select("*").order("title");
    if (error) throw error;
    res.json(data);
  } catch(e){ next(e); }
});

router.post("/", async (req,res,next) => {
  try {
    const { title,author,isbn,category,publication_year } = req.body || {};
    if (!title?.trim() || !author?.trim()) return res.status(400).json({message:"Title and author are required"});
    const {data,error}=await supabase.from("books").insert({
      title:title.trim(), author:author.trim(), isbn:isbn?.trim()||null,
      category:category?.trim()||null, publication_year:publication_year ?? null
    }).select().single();
    if(error) throw error;
    res.status(201).json(data);
  } catch(e){ next(e); }
});

router.put("/:id", async (req,res,next) => {
  try {
    const { title,author,isbn,category,publication_year } = req.body || {};
    if (!title?.trim() || !author?.trim()) return res.status(400).json({message:"Title and author are required"});
    const {data,error}=await supabase.from("books").update({
      title:title.trim(), author:author.trim(), isbn:isbn?.trim()||null,
      category:category?.trim()||null, publication_year:publication_year ?? null
    }).eq("id",req.params.id).select().single();
    if(error) throw error;
    res.json(data);
  } catch(e){ next(e); }
});

router.delete("/:id", async (req,res,next) => {
  try {
    const {data: active}=await supabase.from("transactions").select("id").eq("book_id",req.params.id).eq("status","borrowed").maybeSingle();
    if(active) return res.status(409).json({message:"Cannot delete a currently borrowed book"});
    const {error}=await supabase.from("books").delete().eq("id",req.params.id);
    if(error) throw error;
    res.json({message:"Book deleted"});
  } catch(e){ next(e); }
});

module.exports = router;