import { auth, db, storage } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

onAuthStateChanged(auth, (user) => {
  const loginCard = document.getElementById("login-card");
  const dashboard = document.getElementById("dashboard");
  const logoutBtn = document.getElementById("logout-btn");

  if (user) {
    loginCard.classList.add("hidden");
    dashboard.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    loadAdminPosts();
  } else {
    loginCard.classList.remove("hidden");
    dashboard.classList.add("hidden");
    logoutBtn.classList.add("hidden");
  }
});

document.getElementById("login-btn").addEventListener("click", async () => {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value;
  const email = u.toLowerCase() === "admin" ? "admin@vexornull.com" : `${u}@vexornull.com`;

  try {
    await signInWithEmailAndPassword(auth, email, p);
  } catch (err) {
    alert("Access Denied: Invalid credentials.");
  }
});

document.getElementById("logout-btn").addEventListener("click", (e) => {
  e.preventDefault();
  signOut(auth);
});

document.getElementById("publish-btn").addEventListener("click", async () => {
  const title = document.getElementById("post-title").value;
  const category = document.getElementById("post-category").value;
  const content = document.getElementById("post-content").value;
  const imageFile = document.getElementById("post-image").files[0];

  if (!title || !content) return alert("Please fill required fields.");

  let imageUrl = "";
  try {
    if (imageFile) {
      const storageRef = ref(storage, `posts/${Date.now()}_${imageFile.name}`);
      const uploadSnap = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(uploadSnap.ref);
    }

    await addDoc(collection(db, "posts"), {
      title,
      category,
      content,
      imageUrl,
      likes: 0,
      comments: [],
      createdAt: new Date()
    });

    document.getElementById("post-title").value = "";
    document.getElementById("post-content").value = "";
    document.getElementById("post-image").value = "";
    loadAdminPosts();
    alert("Post Published Successfully!");
  } catch (err) {
    alert("Publish Error: " + err.message);
  }
});

async function loadAdminPosts() {
  const container = document.getElementById("admin-posts");
  try {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    container.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${data.title} (${data.category || 'General'})</h3>
        <p style="margin-top:0.5rem; color:var(--text-muted);">${data.content}</p>
        <button class="btn-danger" data-id="${docSnap.id}" style="margin-top:1rem;">Delete Article</button>
      `;
      container.appendChild(card);
    });

    document.querySelectorAll(".btn-danger").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        if (confirm("Delete this article?")) {
          await deleteDoc(doc(db, "posts", id));
          loadAdminPosts();
        }
      });
    });
  } catch (err) {
    container.innerHTML = `<p>Error loading articles.</p>`;
  }
}
