# Pustakalayah LibraryHub

A modern, responsive library management system built with HTML, CSS, JavaScript, and Node.js.

## 🚀 Features

- **User Authentication**: Login and signup system
- **Book Catalog**: Browse and search books by category
- **Shopping Cart**: Add books to cart before borrowing
- **Borrowing System**: Borrow and return books
- **Member Management**: View all library members
- **Profile Management**: Edit user profile and avatar
- **Dashboard**: Overview of library statistics
- **Responsive Design**: Works on all devices

## 📁 Project Structure

```
ip___project/
├── pages/                    # Frontend pages
│   ├── login.html           # Login page
│   ├── signup.html          # Signup page
│   ├── homepage.html        # Home page
│   ├── dashboard.html       # Dashboard
│   ├── catalog.html         # Book catalog
│   ├── cart.html            # Shopping cart
│   ├── borrowing.html       # Borrowed books
│   ├── members.html         # Members list
│   └── profile.html         # User profile
├── backend/                 # Backend API
│   ├── api/                 # API routes
│   │   ├── users.js         # User management
│   │   ├── books.js         # Book management
│   │   └── borrowing.js     # Borrowing system
│   ├── data/                # JSON data files
│   ├── server.js            # Main server file
│   ├── package.json         # Dependencies
│   └── README.md            # Backend documentation
├── styles.css               # CSS styles
├── script.js                # JavaScript functionality
├── index.html               # Main HTML file
├── prog.html                # Original combined file
└── README.md                # This file
```

## 🛠️ Technologies Used

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Styling with Tailwind CSS
- **JavaScript**: Interactive functionality
- **Local Storage**: Data persistence

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **JSON**: Data storage
- **CORS**: Cross-origin resource sharing

## 🚀 Getting Started

### Frontend Only (Static)
1. Open `index.html` in a web browser
2. Use the default credentials: `admin` / `admin`

### Full Stack (Frontend + Backend)
1. **Start the backend server:**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Access the application:**
   - Open your browser and go to `http://localhost:3000`
   - The backend will serve the frontend pages

## 📱 Pages Overview

### 1. **Login/Signup** (`login.html`, `signup.html`)
- User authentication
- Form validation
- Beautiful background images

### 2. **Homepage** (`homepage.html`)
- Welcome message
- Library statistics
- Call-to-action buttons

### 3. **Dashboard** (`dashboard.html`)
- Overview of library metrics
- Total books, members, and borrowed books
- Visual statistics cards

### 4. **Catalog** (`catalog.html`)
- Browse all books
- Filter by category (Fiction, Action, Romance, Comics, Mystery)
- Book details modal
- Add to cart functionality

### 5. **Cart** (`cart.html`)
- View selected books
- Remove items
- Borrow books from cart

### 6. **Borrowing** (`borrowing.html`)
- View borrowed books
- Return books
- Track borrowing history

### 7. **Members** (`members.html`)
- List all library members
- Member information display

### 8. **Profile** (`profile.html`)
- Edit user profile
- Change avatar
- Update personal information

## 🎨 Design Features

- **Modern UI**: Clean, professional design
- **Responsive**: Works on desktop, tablet, and mobile
- **Animations**: Smooth transitions and hover effects
- **Color Scheme**: Indigo and blue theme
- **Typography**: Clean, readable fonts
- **Background Images**: Beautiful Unsplash images

## 🔧 API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `POST /api/users/login` - User login

### Books
- `GET /api/books` - Get all books
- `GET /api/books/category/:category` - Get books by category
- `POST /api/books` - Create book

### Borrowing
- `GET /api/borrowing/user/:userId` - Get user's borrowed books
- `POST /api/borrowing/borrow` - Borrow a book
- `PUT /api/borrowing/return/:id` - Return a book

## 📊 Data Storage

- **Frontend**: Uses localStorage for client-side data
- **Backend**: JSON files for server-side data
- **Persistence**: Data survives page refreshes

## 🚀 Deployment

### Frontend Only
- Upload all files to any web hosting service
- Ensure all file paths are correct

### Full Stack
- Deploy backend to services like Heroku, Railway, or Vercel
- Update API endpoints in frontend code
- Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Developed by the Pustakalayah LibraryHub Team

---

**Happy Reading! 📚✨**
