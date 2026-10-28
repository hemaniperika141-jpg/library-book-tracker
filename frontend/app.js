const $ = (id) => document.getElementById(id);
const state = { books: [], transactions: [] };

async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function showToast(text) {
  const el = $("toast"); el.textContent = text; el.style.display = "block";
  setTimeout(() => el.style.display = "none", 2500);
}

function setLoggedIn(loggedIn) {
  $("loginSection").classList.toggle("hidden", loggedIn);
  $("appSection").classList.toggle("hidden", !loggedIn);
  $("logoutBtn").classList.toggle("hidden", !loggedIn);
}

async function loadAll() {
  const [books, transactions, stats] = await Promise.all([
    api("/books"), api("/transactions"), api("/stats")
  ]);
  state.books = books;
  state.transactions = transactions;
  renderBooks(); renderTransactions(); renderStats(); renderTransactionBooks();
}

function renderStats() {
  $("totalBooks").textContent = state.books.length;
  $("availableBooks").textContent = state.books.filter(b => b.status === "available").length;
  $("borrowedBooks").textContent = state.books.filter(b => b.status === "borrowed").length;
  $("memberCount").textContent = new Set(state.transactions.map(t => t.member_email)).size;
}

function renderBooks() {
  const q = $("searchInput").value.toLowerCase();
  const status = $("statusFilter").value;
  const filtered = state.books.filter(b =>
    (!status || b.status === status) &&
    [b.title,b.author,b.isbn,b.category].join(" ").toLowerCase().includes(q)
  );
  $("bookList").innerHTML = filtered.length ? filtered.map(b => `
    <article class="book">
      <h3>${escapeHtml(b.title)}</h3>
      <div class="meta">${escapeHtml(b.author)} · ${escapeHtml(b.category || "Uncategorized")} · ISBN ${escapeHtml(b.isbn || "N/A")}</div>
      <p><span class="badge ${b.status}">${b.status}</span></p>
      <div class="actions">
        <button onclick="editBook(${b.id})">Edit</button>
        <button class="danger" onclick="deleteBook(${b.id})">Delete</button>
      </div>
    </article>`).join("") : "<p class='muted'>No books found.</p>";
}

function renderTransactions() {
  $("transactionList").innerHTML = state.transactions.length ? state.transactions.slice(0,10).map(t => `
    <article class="transaction">
      <h4>${escapeHtml(t.book_title)}</h4>
      <div>${escapeHtml(t.member_name)} · ${escapeHtml(t.member_email)}</div>
      <div class="meta">${t.status} · ${new Date(t.borrowed_at).toLocaleString()}</div>
      ${t.status === "borrowed" ? `<div class="actions"><button onclick="returnBook(${t.id})">Return</button></div>` : ""}
    </article>`).join("") : "<p class='muted'>No transactions yet.</p>";
}

function renderTransactionBooks() {
  $("transactionBook").innerHTML = state.books.filter(b => b.status === "available")
    .map(b => `<option value="${b.id}">${escapeHtml(b.title)} — ${escapeHtml(b.author)}</option>`).join("");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}

$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    await api("/auth/login", { method:"POST", body:JSON.stringify({
      username:$("username").value, password:$("password").value
    })});
    setLoggedIn(true); await loadAll();
  } catch (err) { $("loginMessage").textContent = err.message; }
});

$("logoutBtn").addEventListener("click", async () => {
  await api("/auth/logout", {method:"POST"});
  setLoggedIn(false);
});

$("searchInput").addEventListener("input", renderBooks);
$("statusFilter").addEventListener("change", renderBooks);

$("addBookBtn").addEventListener("click", () => {
  $("bookForm").reset(); $("bookId").value = ""; $("dialogTitle").textContent = "Add Book";
  $("bookDialog").showModal();
});
$("cancelBookBtn").addEventListener("click", () => $("bookDialog").close());

$("bookForm").addEventListener("submit", async e => {
  e.preventDefault();
  const id = $("bookId").value;
  const payload = {
    title:$("bookTitle").value, author:$("bookAuthor").value,
    isbn:$("bookIsbn").value, category:$("bookCategory").value,
    publication_year:$("bookYear").value ? Number($("bookYear").value) : null
  };
  try {
    await api(id ? `/books/${id}` : "/books", { method:id ? "PUT":"POST", body:JSON.stringify(payload) });
    $("bookDialog").close(); await loadAll(); showToast("Book saved");
  } catch (err) { $("bookMessage").textContent = err.message; }
});

window.editBook = id => {
  const b = state.books.find(x => x.id === id);
  if (!b) return;
  $("bookId").value=b.id; $("bookTitle").value=b.title; $("bookAuthor").value=b.author;
  $("bookIsbn").value=b.isbn || ""; $("bookCategory").value=b.category || "";
  $("bookYear").value=b.publication_year || ""; $("dialogTitle").textContent="Edit Book";
  $("bookDialog").showModal();
};

window.deleteBook = async id => {
  if (!confirm("Delete this book?")) return;
  try { await api(`/books/${id}`, {method:"DELETE"}); await loadAll(); showToast("Book deleted"); }
  catch (err) { showToast(err.message); }
};

$("transactionForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    await api("/transactions/borrow", {method:"POST", body:JSON.stringify({
      book_id:Number($("transactionBook").value),
      member_name:$("memberName").value,
      member_email:$("memberEmail").value
    })});
    e.target.reset(); await loadAll(); showToast("Book borrowed");
  } catch (err) { showToast(err.message); }
});

window.returnBook = async id => {
  try { await api(`/transactions/${id}/return`, {method:"POST"}); await loadAll(); showToast("Book returned"); }
  catch (err) { showToast(err.message); }
};

(async () => {
  try {
    await api("/auth/me"); setLoggedIn(true); await loadAll();
  } catch { setLoggedIn(false); }
})();