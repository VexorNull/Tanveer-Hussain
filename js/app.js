import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, doc, updateDoc, increment, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let allPosts = [];

// Theme Toggle
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
});

// Calculate Reading Time Function
function calculateReadingTime(text) {
  const wordsPerMinute = 200;
  const noOfWords = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(noOfWords / wordsPerMinute);
  return `${minutes} min read`;
}

// Fetch & Increment Views
async function fetchPosts() {
  const container = document.getElementById("posts-container");
  try {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = `<p style="text-align: center; color: var(--text-muted);">No posts available.</p>`;
      return;
    }

    allPosts = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    renderPosts(allPosts);
  } catch (err) {
    container.innerHTML = `<p style="text-align: center; color: var(--text-muted);">Failed to load posts.</p>`;
  }
}

function renderPosts(posts) {
  const container = document.getElementById("posts-container");
  container.innerHTML = "";

  posts.forEach((post) => {
    const postDate = post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : '';
    const imageHTML = post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" alt="${post.title}">` : '';
    const category = post.category || 'General';
    const likes = post.likes || 0;
    const views = post.views || 0;
    const comments = post.comments || [];
    const readTime = calculateReadingTime(post.content || "");

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="post-header">
        <span class="category-badge">${category}</span>
        <span class="post-date">${postDate} • 📖 ${readTime} • 👁️ ${views} views</span>
      </div>
      <h2 class="post-title">${post.title}</h2>
      ${imageHTML}
      <p class="post-content">${post.content}</p>

      <div class="post-actions">
        <button class="action-btn like-btn" data-id="${post.id}">❤️ <span>${likes}</span> Likes</button>
        <button class="action-btn share-btn" data-title="${post.title}">🔗 Share Article</button>
      </div>

      <div class="comments-section">
        <div class="comments-list" id="comments-${post.id}">
          ${comments.map(c => `<div class="comment-item"><strong>Guest:</strong> ${c}</div>`).join('')}
        </div>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <input type="text" placeholder="Add a comment..." id="input-${post.id}">
          <button class="comment-add-btn" data-id="${post.id}" style="padding:4px 12px; font-size:0.85rem;">Post</button>
        </div>
      </div>
    `;
    container.appendChild(card);

    // Increment View Count in background for every post load
    const postRef = doc(db, "posts", post.id);
    updateDoc(postRef, { views: increment(1) }).catch(() => {});
  });

  attachEventListeners();
}

function attachEventListeners() {
  // Likes
  document.querySelectorAll(".like-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, { likes: increment(1) });
      fetchPosts();
    });
  });

  // Share
  document.querySelectorAll(".share-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const title = e.currentTarget.getAttribute("data-title");
      if (navigator.share) {
        navigator.share({ title: title, url: window.location.href });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    });
  });

  // Comments
  document.querySelectorAll(".comment-add-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      const input = document.getElementById(`input-${id}`);
      if (!input.value.trim()) return;

      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, { comments: arrayUnion(input.value.trim()) });
      fetchPosts();
    });
  });
}

// Search Filter
document.getElementById("search-input").addEventListener("input", (e) => {
  const queryText = e.target.value.toLowerCase();
  const filtered = allPosts.filter(p => 
    p.title.toLowerCase().includes(queryText) || 
    (p.category && p.category.toLowerCase().includes(queryText))
  );
  renderPosts(filtered);
});

fetchPosts();
