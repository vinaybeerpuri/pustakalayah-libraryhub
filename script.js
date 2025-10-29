window.addEventListener('DOMContentLoaded', () => {
  // --- CONFIG ---
  const API_BASE = 'http://localhost:8000';

  // --- STATE ---
  let activeUser = null;
  let books = [];
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let borrowRecords = [];

  // --- ELEMENTS ---
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginError = document.getElementById('loginError');
  const mainContent = document.getElementById('mainContent');
  const loginSection = document.getElementById('login');
  const signupSection = document.getElementById('signup');
  const logoutBtn = document.getElementById('logoutBtn');
  const cartItems = document.getElementById('cartItems');
  const borrowList = document.getElementById('borrowList');
  const memberListTable = document.getElementById('memberList');

  // Profile elements
  const profileNameInput = document.getElementById('profileName');
  const profileEmailInput = document.getElementById('profileEmail');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const cancelProfileBtn = document.getElementById('cancelProfileBtn');
  const changeAvatarBtn = document.getElementById('changeAvatarBtn');
  const profileAvatar = document.getElementById('profileAvatar');

  let originalProfile = {};

  // --- HELPERS ---
  const updateLocalStorage = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  async function api(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    if (!res.ok) {
      let detail = 'Request failed';
      try { const data = await res.json(); detail = data.detail || data.error || JSON.stringify(data); } catch {}
      throw new Error(detail);
    }
    try { return await res.json(); } catch { return null; }
  }

  async function loadBooks() {
    books = await api('/api/books');
  }

  async function loadBorrowRecords() {
    if (!activeUser) { borrowRecords = []; return; }
    borrowRecords = await api(`/api/borrowing/user/${activeUser.id}`);
  }

  async function loadMembers() {
    const users = await api('/api/users');
    memberListTable.innerHTML = '';
    users.forEach(user => {
      const memberSince = user.member_since ? new Date(user.member_since).toLocaleDateString('en-US') : 'N/A';
      memberListTable.innerHTML += `
        <tr class='border-b hover:bg-gray-50'>
          <td class='p-4 font-semibold text-gray-800'>${user.name || user.username}</td>
          <td class='p-4 text-gray-600'>${user.email}</td>
          <td class='p-4 text-gray-500'>${memberSince}</td>
        </tr>
      `;
    });
  }

  function updateCartCountDisplay() {
    const count = cart.length;
    const navCount = document.getElementById('navCartCount');
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = count;
    if (navCount) {
      navCount.textContent = count;
      navCount.classList.toggle('hidden', count === 0);
    }
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    if (emptyCartMessage) emptyCartMessage.classList.toggle('hidden', count > 0);
  }

  function renderCart() {
    if (!cartItems) return;
    cartItems.innerHTML = '';
    cart.forEach((item, i) => {
      cartItems.innerHTML += `
        <tr class='border-b hover:bg-gray-50'>
          <td class='p-4 font-semibold text-gray-800'>${item.title}</td>
          <td class='p-4 text-gray-600'>${item.author}</td>
          <td class='p-4'>
            <button class='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-md' onclick='borrowBook(${i})'>
              Borrow ✅
            </button>
          </td>
        </tr>
      `;
    });
    updateCartCountDisplay();
  }

  function updateBorrowCountDisplay() {
    const countEl = document.getElementById('borrowCountDisplay');
    const emptyMsg = document.getElementById('emptyBorrowMessage');
    if (countEl) countEl.textContent = (borrowRecords || []).length;
    if (emptyMsg) emptyMsg.classList.toggle('hidden', (borrowRecords || []).length > 0);
  }

  function renderBorrowList() {
    if (!borrowList) return;
    borrowList.innerHTML = '';
    borrowRecords.forEach((b) => {
      borrowList.innerHTML += `
        <tr class='border-b hover:bg-gray-50'>
          <td class='p-4 font-semibold text-gray-800'>${b.book_title}</td>
          <td class='p-4 text-gray-600'>${b.book_author}</td>
          <td class='p-4'>
            <button class='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-md' onclick='returnBook(${b.id})'>
              Return ↩️
            </button>
          </td>
        </tr>
      `;
    });
    updateBorrowCountDisplay();
  }

  function updateProfileFields(user) {
    if (!user) return;
    profileNameInput.value = user.name || user.username;
    profileEmailInput.value = user.email;
    originalProfile = { name: profileNameInput.value, email: profileEmailInput.value };
  }

  function toggleEditMode(isEditing) {
    profileNameInput.readOnly = !isEditing;
    profileEmailInput.readOnly = !isEditing;
    profileNameInput.classList.toggle('bg-white', isEditing);
    profileEmailInput.classList.toggle('bg-white', isEditing);
    profileNameInput.classList.toggle('bg-gray-50', !isEditing);
    profileEmailInput.classList.toggle('bg-gray-50', !isEditing);

    editProfileBtn.classList.toggle('hidden', isEditing);
    saveProfileBtn.classList.toggle('hidden', !isEditing);
    cancelProfileBtn.classList.toggle('hidden', !isEditing);
    changeAvatarBtn.disabled = !isEditing;
  }

  // --- NAVIGATION LOGIC ---
  window.showPage = function (id) {
    const pages = ['home', 'dashboard', 'catalog', 'bookDetails', 'borrowing', 'cart', 'members', 'profile'];
    pages.forEach(p => {
      const el = document.getElementById(p);
      if (el) el.classList.add('hidden');
    });
    const current = document.getElementById(id);
    if (current) {
      current.classList.remove('hidden');
      current.classList.add('page-section');
    }
    window.scrollTo(0, 0);

    if (id === 'cart') renderCart();
    if (id === 'borrowing') renderBorrowList();
    if (id === 'members') loadMembers();
  };

  // --- AUTH ---
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    try {
      const user = await api('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      activeUser = user;
      loginSection.classList.add('hidden');
      mainContent.classList.remove('hidden');
      showPage('home');
      loginError.classList.add('hidden');

      await loadBooks();
      await loadBorrowRecords();
      renderCart();
      renderBorrowList();
      await loadMembers();
      updateProfileFields(activeUser);
    } catch (err) {
      loginError.classList.remove('hidden');
    }
  });

  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      username: document.getElementById('newUsername').value.trim(),
      password: document.getElementById('newPassword').value.trim(),
      email: document.getElementById('email').value.trim(),
      name: document.getElementById('newUsername').value.trim(),
    };
    try {
      await api('/api/users', { method: 'POST', body: JSON.stringify(payload) });
      alert('Signup successful! You can login now');
      document.getElementById('newUsername').value = '';
      document.getElementById('email').value = '';
      document.getElementById('newPassword').value = '';
      signupSection.classList.add('hidden');
      loginSection.classList.remove('hidden');
    } catch (err) {
      alert((err && err.message) || 'Signup failed');
    }
  });

  logoutBtn?.addEventListener('click', () => {
    activeUser = null;
    mainContent.classList.add('hidden');
    loginSection.classList.remove('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
  });

  document.getElementById('showSignup')?.addEventListener('click', () => {
    loginSection.classList.add('hidden');
    signupSection.classList.remove('hidden');
  });

  document.getElementById('showLogin')?.addEventListener('click', () => {
    signupSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
  });

  // --- CATALOG & BOOK DETAILS ---
  window.viewBook = function (title) {
    const book = books.find(b => b.title === title);
    if (!book) return;

    document.getElementById('bookImage').src = book.image || '';
    document.getElementById('bookTitle').textContent = book.title;
    document.getElementById('bookAuthor').textContent = `By ${book.author}`;
    document.getElementById('bookDescription').textContent = book.description || '';
    document.getElementById('bookCategory').textContent = `Category: ${book.category.charAt(0).toUpperCase() + book.category.slice(1)}`;

    showPage('bookDetails');
  };

  const addToCartBtn = document.getElementById('addToCartBtn');
  addToCartBtn?.addEventListener('click', () => {
    const title = document.getElementById('bookTitle').textContent;
    const author = document.getElementById('bookAuthor').textContent.replace('By ', '');
    const book = books.find(b => b.title === title && b.author === author);
    if (!book) return;

    if (cart.find(item => item.id === book.id)) {
      alert(`${title} is already in your cart!`);
      return;
    }

    cart.push({ id: book.id, title: book.title, author: book.author });
    updateLocalStorage();
    renderCart();
    alert(`${title} added to cart!`);
  });

  // Fetch and render books list
  async function renderBooks(category = 'all') {
    if (!books.length) await loadBooks();
    const bookCatalog = document.getElementById('bookCatalog');
    if (!bookCatalog) return;
    bookCatalog.innerHTML = '';

    const filteredBooks = category === 'all' ? books : books.filter(book => book.category === category);

    filteredBooks.forEach(book => {
      const bookCard = `
        <div class="bg-white p-6 rounded-xl shadow-lg transform transition duration-300 hover:scale-105 border-t-4 border-indigo-200">
          <img src="${book.image || ''}" alt="${book.title}" class="w-full h-64 object-cover rounded-lg mb-4 shadow-md">
          <div class="space-y-2">
            <h3 class="font-bold text-xl text-gray-800">${book.title}</h3>
            <p class="text-gray-600">${book.author}</p>
            <p class="text-sm text-indigo-500 italic font-medium">${book.category.charAt(0).toUpperCase() + book.category.slice(1)}</p>
            <p class="text-sm text-gray-700 line-clamp-2">${book.description || ''}</p>
            <button class="mt-3 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md" 
              onclick="viewBook('${book.title}')">View Details</button>
          </div>
        </div>
      `;
      bookCatalog.innerHTML += bookCard;
    });
  }

  window.filterBooks = function (category, clickedButton) {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    clickedButton.classList.add('active');
    renderBooks(category);
  };

  // --- CART & BORROWING ---
  window.emptyCart = function () {
    if (confirm('Are you sure you want to empty your cart?')) {
      cart = [];
      updateLocalStorage();
      renderCart();
      alert('Cart emptied!');
    }
  }

  window.borrowBook = async function (index) {
    if (!activeUser) { alert('Please login first.'); return; }
    const item = cart[index];
    if (!item) return;

    try {
      await api('/api/borrowing/borrow', {
        method: 'POST',
        body: JSON.stringify({
          user_id: activeUser.id,
          book_id: item.id,
          book_title: item.title,
          book_author: item.author,
        })
      });
      cart.splice(index, 1);
      updateLocalStorage();
      renderCart();
      await loadBorrowRecords();
      renderBorrowList();
      alert(`${item.title} borrowed successfully! Happy reading!`);
    } catch (err) {
      alert((err && err.message) || 'Failed to borrow');
    }
  };

  window.returnBook = async function (borrowId) {
    if (!activeUser) { alert('Please login first.'); return; }
    try {
      await api(`/api/borrowing/return/${borrowId}`, { method: 'PUT' });
      await loadBorrowRecords();
      renderBorrowList();
      alert('Returned successfully!');
    } catch (err) {
      alert((err && err.message) || 'Failed to return');
    }
  };

  // --- PROFILE ---
  editProfileBtn?.addEventListener('click', () => {
    originalProfile = { name: profileNameInput.value, email: profileEmailInput.value };
    toggleEditMode(true);
  });

  cancelProfileBtn?.addEventListener('click', () => {
    profileNameInput.value = originalProfile.name;
    profileEmailInput.value = originalProfile.email;
    toggleEditMode(false);
  });

  saveProfileBtn?.addEventListener('click', async () => {
    if (!activeUser) return;

    const newName = profileNameInput.value.trim();
    const newEmail = profileEmailInput.value.trim();
    if (!newName || !newEmail) { alert('Name and Email cannot be empty.'); return; }

    try {
      const updated = await api(`/api/users/${activeUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: newName, email: newEmail })
      });
      activeUser = updated;
      alert('Profile updated successfully!');
      toggleEditMode(false);
      await loadMembers();
    } catch (err) {
      alert((err && err.message) || 'Failed to update profile');
    }
  });

  changeAvatarBtn?.addEventListener('click', () => {
    const randomSeed = Math.floor(Math.random() * 1000);
    profileAvatar.src = `https://picsum.photos/seed/${randomSeed}/120/120`;
    alert('Avatar updated! (Simulated)');
  });

  // --- INITIAL RENDER (unauthenticated) ---
  renderBooks();
  renderCart();
  renderBorrowList();
});
