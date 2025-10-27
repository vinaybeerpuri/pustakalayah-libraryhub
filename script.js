window.addEventListener('DOMContentLoaded',()=>{
  // --- INITIAL DATA & STORAGE SETUP ---
  const defaultUser={username:'admin',password:'admin',email:'admin@library.com',name:'Admin User'};
  let activeUser = null;
  
  if(!localStorage.getItem('users')) localStorage.setItem('users',JSON.stringify([defaultUser]));

  const loginForm=document.getElementById('loginForm');
  const signupForm=document.getElementById('signupForm');
  const loginError=document.getElementById('loginError');
  const mainContent=document.getElementById('mainContent');
  const loginSection=document.getElementById('login');
  const signupSection=document.getElementById('signup');
  const logoutBtn=document.getElementById('logoutBtn');
  const cartItems=document.getElementById('cartItems');
  const borrowList=document.getElementById('borrowList');
  const memberListTable=document.getElementById('memberList');

  // Initializing dynamic arrays from local storage or empty
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let borrowed = JSON.parse(localStorage.getItem('borrowed') || '[]');

  // --- Utility Functions ---
  const updateLocalStorage = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('borrowed', JSON.stringify(borrowed));
  };
  
  // --- LOGIN/SIGNUP/LOGOUT LOGIC ---
  loginForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const username=document.getElementById('username').value;
    const password=document.getElementById('password').value;
    const users=JSON.parse(localStorage.getItem('users'));
    const found=users.find(u=>u.username===username && u.password===password);
    
    if(found){
      activeUser = found; // Set active user
      loginSection.classList.add('hidden');
      mainContent.classList.remove('hidden');
      showPage('home');
      loginError.classList.add('hidden');
      
      // Update dynamic content on login
      renderCart();
      renderBorrowList();
      renderMembers();
      updateProfileFields(activeUser);

    }else{
      loginError.classList.remove('hidden');
    }
  });

  signupForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const newUser={
        username:document.getElementById('newUsername').value,
        password:document.getElementById('newPassword').value,
        email:document.getElementById('email').value,
        name:document.getElementById('newUsername').value, // Use username as default name
        memberSince: new Date().toLocaleDateString('en-US')
    };
    let users=JSON.parse(localStorage.getItem('users'));
    if(users.find(u=>u.username===newUser.username)){
      alert('Username already exists');return;
    }
    users.push(newUser);
    localStorage.setItem('users',JSON.stringify(users));
    alert('Signup successful! You can login now');
    document.getElementById('newUsername').value = '';
    document.getElementById('email').value = '';
    document.getElementById('newPassword').value = '';
    signupSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
  });

  logoutBtn.addEventListener('click',()=>{
    activeUser = null;
    mainContent.classList.add('hidden');
    loginSection.classList.remove('hidden');
    // Clear login fields for security/convenience
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
  });

  document.getElementById('showSignup').addEventListener('click',()=>{
    loginSection.classList.add('hidden');
    signupSection.classList.remove('hidden');
  });

  document.getElementById('showLogin').addEventListener('click',()=>{
    signupSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
  });

  // --- NAVIGATION LOGIC ---
  window.showPage=function(id){
    const pages=['home','dashboard','catalog','bookDetails','borrowing','cart','members','profile'];
    pages.forEach(p=>{
      const el=document.getElementById(p);
      if(el) el.classList.add('hidden');
    });
    const current=document.getElementById(id);
    if(current) {
        current.classList.remove('hidden');
        current.classList.add('page-section'); // Add animation class
    }
    window.scrollTo(0,0);
    
    // Rerender lists when navigating to them
    if (id === 'cart') renderCart();
    if (id === 'borrowing') renderBorrowList();
    if (id === 'members') renderMembers();
  };

  // --- CATALOG & BOOK DETAILS LOGIC ---
  window.viewBook=function(title){
    const book = books.find(b => b.title === title);
    if (!book) return;

    document.getElementById('bookImage').src = book.image;
    document.getElementById('bookTitle').textContent = book.title;
    document.getElementById('bookAuthor').textContent = `By ${book.author}`;
    document.getElementById('bookDescription').textContent = book.description;
    document.getElementById('bookCategory').textContent = `Category: ${book.category.charAt(0).toUpperCase() + book.category.slice(1)}`;

    showPage('bookDetails');
  };

  document.getElementById('addToCartBtn').addEventListener('click',()=>{
    const title=document.getElementById('bookTitle').textContent;
    const author=document.getElementById('bookAuthor').textContent.replace('By ','');
    
    // Simple check to prevent duplicates
    if (cart.find(item => item.title === title)) {
        alert(`${title} is already in your cart!`);
        return;
    }
    
    cart.push({title,author});
    updateLocalStorage();
    renderCart();
    alert(`${title} added to cart!`);
  });

  // --- CART & BORROWING LOGIC ---
  function updateCartCountDisplay(){
    const count = cart.length;
    document.getElementById('cartCount').textContent = count;
    document.getElementById('navCartCount').textContent = count;
    document.getElementById('navCartCount').classList.toggle('hidden', count === 0);
    document.getElementById('emptyCartMessage').classList.toggle('hidden', count > 0);
  }

  function renderCart(){
    cartItems.innerHTML='';
    cart.forEach((item,i)=>{
      cartItems.innerHTML+=`
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
  
  window.emptyCart = function() {
    if (confirm('Are you sure you want to empty your cart?')) {
        cart = [];
        updateLocalStorage();
        renderCart();
        alert('Cart emptied!');
    }
  }

  window.borrowBook=function(index){
    const book = cart[index];
    
    // Simple check to prevent duplicates in borrowed list
    if (borrowed.find(item => item.title === book.title)) {
        alert(`${book.title} is already borrowed!`);
        cart.splice(index,1); // Remove from cart if it's somehow there
    } else {
        borrowed.push(book);
        cart.splice(index,1);
    }
    
    updateLocalStorage();
    renderCart(); // Re-render cart
    renderBorrowList(); // Re-render borrowed list
    
    if (!borrowed.find(item => item.title === book.title)) {
        alert(`${book.title} borrowed successfully! Happy reading!`);
    }
  };
  
  function updateBorrowCountDisplay(){
    const count = borrowed.length;
    document.getElementById('borrowCountDisplay').textContent = count;
    document.getElementById('emptyBorrowMessage').classList.toggle('hidden', count > 0);
  }

  function renderBorrowList(){
    borrowList.innerHTML='';
    borrowed.forEach((b,i)=>{
      borrowList.innerHTML+=`
        <tr class='border-b hover:bg-gray-50'>
          <td class='p-4 font-semibold text-gray-800'>${b.title}</td>
          <td class='p-4 text-gray-600'>${b.author}</td>
          <td class='p-4'>
            <button class='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-md' onclick='returnBook(${i})'>
              Return ↩️
            </button>
          </td>
        </tr>
      `;
    });
    updateBorrowCountDisplay();
  }

  window.returnBook=function(i){
    const title = borrowed[i].title;
    borrowed.splice(i,1);
    updateLocalStorage();
    renderBorrowList();
    alert(`${title} returned successfully! Thank you.`);
  };

  // --- MEMBERS LOGIC ---
  function renderMembers() {
    memberListTable.innerHTML = '';
    const users = JSON.parse(localStorage.getItem('users'));
    
    users.forEach(user => {
      // Use the stored 'name' if available, otherwise default to username
      const nameToDisplay = user.name || user.username;
      const memberSince = user.memberSince || 'N/A';
      
      memberListTable.innerHTML += `
        <tr class='border-b hover:bg-gray-50'>
          <td class='p-4 font-semibold text-gray-800'>${nameToDisplay}</td>
          <td class='p-4 text-gray-600'>${user.email}</td>
          <td class='p-4 text-gray-500'>${memberSince}</td>
        </tr>
      `;
    });
  }

  // --- PROFILE LOGIC ---
  const profileNameInput = document.getElementById('profileName');
  const profileEmailInput = document.getElementById('profileEmail');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const cancelProfileBtn = document.getElementById('cancelProfileBtn');
  const changeAvatarBtn = document.getElementById('changeAvatarBtn');
  const profileAvatar = document.getElementById('profileAvatar');
  
  let originalProfile = {};

  function updateProfileFields(user) {
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
  
  editProfileBtn.addEventListener('click', () => {
    originalProfile = { name: profileNameInput.value, email: profileEmailInput.value };
    toggleEditMode(true);
  });

  cancelProfileBtn.addEventListener('click', () => {
    profileNameInput.value = originalProfile.name;
    profileEmailInput.value = originalProfile.email;
    toggleEditMode(false);
  });
  
  saveProfileBtn.addEventListener('click', () => {
    if (!activeUser) return;
    
    const newName = profileNameInput.value.trim();
    const newEmail = profileEmailInput.value.trim();
    
    if (!newName || !newEmail) {
        alert('Name and Email cannot be empty.');
        return;
    }
    
    // Update the active user object
    activeUser.name = newName;
    activeUser.email = newEmail;
    
    // Update local storage for persistence
    let users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === activeUser.username);
    if (userIndex !== -1) {
        users[userIndex] = activeUser;
        localStorage.setItem('users', JSON.stringify(users));
        alert('Profile updated successfully!');
        toggleEditMode(false);
        renderMembers(); // Re-render member list to reflect change
    }
  });
  
  // Simulated avatar change functionality
  changeAvatarBtn.addEventListener('click', () => {
    const randomSeed = Math.floor(Math.random() * 1000);
    // Using a different placeholder service for variety
    profileAvatar.src = `https://picsum.photos/seed/${randomSeed}/120/120`; 
    alert('Avatar updated! (Simulated)');
  });


  // --- BOOK CATALOG DATA & RENDERING ---
  const books = [
    {
      title: "The Lost City",
      author: "Sarah Mitchell",
      category: "fiction",
      image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?fit=crop&w=400&h=600",
      description: "A thrilling tale of discovery and adventure in an ancient civilization."
    },
    {
      title: "Midnight Chase",
      author: "James Anderson",
      category: "action",
      image: "https://images.unsplash.com/photo-1589998059171-988d887df646?fit=crop&w=400&h=600",
      description: "High-stakes pursuit through the dark streets of London."
    },
    {
      title: "Love in Paris",
      author: "Emily Roberts",
      category: "romance",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?fit=crop&w=400&h=600",
      description: "A romantic journey through the city of love."
    },
    {
      title: "Superhero Chronicles",
      author: "Mike Turner",
      category: "comic",
      image: "https://images.unsplash.com/photo-1608889476518-738c9b1dcb40?fit=crop&w=400&h=600",
      description: "Action-packed adventures of modern-day heroes."
    },
    {
      title: "The Silent Witness",
      author: "Patricia Blake",
      category: "mystery",
      image: "https://images.unsplash.com/photo-1587876931567-564ce588bfbd?fit=crop&w=400&h=600",
      description: "A gripping mystery that will keep you guessing until the end."
    },
    {
      title: "Dragon's Rise",
      author: "Robert King",
      category: "fiction",
      image: "https://m.media-amazon.com/images/I/71zr12FF4kL._AC_UF1000,1000_QL80_.jpg",
      description: "Epic fantasy tale of dragons and magic."
    },
    {
      title: "Urban Warriors",
      author: "David Chen",
      category: "action",
      image: "https://m.media-amazon.com/images/I/81qBSSkGfvL._UF1000,1000_QL80_.jpg",
      description: "Modern martial arts action in the concrete jungle."
    },
    {
      title: "Sunset Dreams",
      author: "Sofia Garcia",
      category: "romance",
      image: "https://m.media-amazon.com/images/I/71iLEh7q--L._UF1000,1000_QL80_.jpg",
      description: "A beautiful story of summer love and new beginnings."
    },
    {
      title: "Mystery Manor",
      author: "Thomas Wright",
      category: "mystery",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?fit=crop&w=400&h=600",
      description: "Strange occurrences in an old English manor."
    },
    {
      title: "Hero Academy",
      author: "Lisa Chang",
      category: "comic",
      image: "https://images.unsplash.com/photo-1608889476518-738c9b1dcb40?fit=crop&w=400&h=600",
      description: "Young heroes learning to master their powers."
    }
  ];

  // Function to render books
  function renderBooks(category = 'all') {
    const bookCatalog = document.getElementById('bookCatalog');
    bookCatalog.innerHTML = '';
    
    const filteredBooks = category === 'all' 
      ? books 
      : books.filter(book => book.category === category);

    filteredBooks.forEach(book => {
      const bookCard = `
        <div class="bg-white p-6 rounded-xl shadow-lg transform transition duration-300 hover:scale-105 border-t-4 border-indigo-200">
          <img src="${book.image}" alt="${book.title}" class="w-full h-64 object-cover rounded-lg mb-4 shadow-md">
          <div class="space-y-2">
            <h3 class="font-bold text-xl text-gray-800">${book.title}</h3>
            <p class="text-gray-600">${book.author}</p>
            <p class="text-sm text-indigo-500 italic font-medium">${book.category.charAt(0).toUpperCase() + book.category.slice(1)}</p>
            <p class="text-sm text-gray-700 line-clamp-2">${book.description}</p>
            <button class="mt-3 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md" 
              onclick="viewBook('${book.title}')">View Details</button>
          </div>
        </div>
      `;
      bookCatalog.innerHTML += bookCard;
    });
  }

  // Function to filter books by category
  window.filterBooks = function(category, clickedButton) {
    // Update active category button class
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    clickedButton.classList.add('active');
    
    renderBooks(category);
  };

  // Initial render of all books and cart/borrow lists
  renderBooks();
  renderCart();
  renderBorrowList();
});
