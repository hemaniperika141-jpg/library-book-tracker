const express = require("express");
const supabase = require("../supabase");
const router = express.Router();

router.get("/", async (req,res,next) => {
  try {
    const {data,error}=await supabase.from("transactions")
      .select("id,book_id,member_name,member_email,status,borrowed_at,returned_at,books(title)")
      .order("borrowed_at",{ascending:false}).limit(50);
    if(error) throw error;
    res.json(data.map(t=>({...t,book_title:t.books?.title || "Unknown"})));
  } catch(e){ next(e); }
});

router.post("/borrow", async (req,res,next) => {
  try {
    const {book_id,member_name,member_email}=req.body||{};
    if(!book_id || !member_name?.trim() || !member_email?.trim())
      return res.status(400).json({message:"Book, member name and email are required"});

    const {data:book,error:bookError}=await supabase.from("books").select("id,status").eq("id",book_id).single();
    if(bookError) throw bookError;
    if(book.status!=="available") return res.status(409).json({message:"Book is not available"});

    const {data,error}=await supabase.from("transactions").insert({
      book_id, member_name:member_name.trim(), member_email:member_email.trim(),
      status:"borrowed"
    }).select().single();
    if(error) throw error;

    const {error:updateError}=await supabase.from("books").update({status:"borrowed"}).eq("id",book_id);
    if(updateError) throw updateError;
    res.status(201).json(data);
  } catch(e){ next(e); }
});

router.post("/:id/return", async (req,res,next) => {
  try {
    const {data:t,error}=await supabase.from("transactions").select("id,book_id,status").eq("id",req.params.id).single();
    if(error) throw error;
    if(t.status!=="borrowed") return res.status(409).json({message:"Transaction is already returned"});

    const {error:e1}=await supabase.from("transactions").update({status:"returned",returned_at:new Date().toISOString()}).eq("id",t.id);
    if(e1) throw e1;
    const {error:e2}=await supabase.from("books").update({status:"available"}).eq("id",t.book_id);
    if(e2) throw e2;
    res.json({message:"Book returned"});
  } catch(e){ next(e); }
});

module.exports = router;