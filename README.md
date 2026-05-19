# TechShop - Full Stack E-Commerce Project

## 📋 Project Overview

This is a **Full-Stack E-Commerce Shop** project designed for Computer Science students (Year 2). It demonstrates a complete web application with:

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js with Express.js
- **Database**: SQLite3
- **API**: RESTful API for product management and shopping cart

## 🏗️ Project Structure

```
fullstack-shop/
├── server.js              # Main backend server file
├── db.js                  # Database initialization and seeding
├── package.json           # Node.js dependencies
├── public/                # Frontend files (served by Express)
│   ├── index.html         # Main HTML file
│   ├── app.js             # Frontend JavaScript (connects to API)
│   └── style.css          # Styling
├── shop.db                # SQLite database (created automatically)
└── README.md              # This file
```

## 🚀 Quick Start Guide

### Prerequisites

Make sure you have **Node.js** installed on your system. You can check by running:

```bash
node --version
npm --version
```

If not installed, download from: https://nodejs.org/

### Installation Steps

1. **Navigate to the project directory**:
   ```bash
   cd fullstack-shop
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

   Or directly:
   ```bash
   node server.js
   ```

4. **Open your browser** and go to:
   ```
   http://localhost:7000
   ```

That's it! The application should now be running.

## 📱 Features

### Frontend Features
- ✅ Browse products with images and prices
- ✅ Search for products by name
- ✅ Filter products by category
- ✅ Filter products by price range
- ✅ Sort products (by price: low to high, high to low)
- ✅ Add products to shopping cart
- ✅ View cart items
- ✅ Remove items from cart
- ✅ View total price
- ✅ Responsive design (works on mobile, tablet, desktop)

### Backend Features
- ✅ RESTful API for products
- ✅ Shopping cart management
- ✅ Category filtering
- ✅ Search functionality
- ✅ SQLite database with proper schema

## 🔌 API Endpoints

### Products
- **GET** `/api/products` - Get all products (with optional filters)
  - Query parameters: `category`, `search`, `sortBy`
  - Example: `/api/products?category=Electronics&search=headphones&sortBy=low`

- **GET** `/api/products/:id` - Get a specific product

- **GET** `/api/categories` - Get all available categories

### Shopping Cart
- **GET** `/api/cart` - Get all cart items

- **POST** `/api/cart` - Add item to cart
  - Body: `{ "product_id": 1, "quantity": 1 }`

- **PUT** `/api/cart/:id` - Update cart item quantity
  - Body: `{ "quantity": 2 }`

- **DELETE** `/api/cart/:id` - Remove item from cart

- **DELETE** `/api/cart` - Clear entire cart

## 📊 Database Schema

### Products Table
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Cart Items Table
```sql
CREATE TABLE cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
)
```

## 🎓 Learning Outcomes

By studying this project, students will learn:

1. **Frontend Development**
   - HTML structure and semantic markup
   - CSS styling and responsive design
   - Vanilla JavaScript (no frameworks)
   - Fetch API for HTTP requests
   - DOM manipulation

2. **Backend Development**
   - Node.js and Express.js basics
   - RESTful API design
   - Request/Response handling
   - Middleware usage (CORS, body-parser)

3. **Database**
   - SQLite3 basics
   - SQL queries (SELECT, INSERT, UPDATE, DELETE)
   - Database schema design
   - Foreign key relationships

4. **Full-Stack Integration**
   - Client-Server communication
   - API consumption from frontend
   - Error handling
   - Data flow between layers

## 🔧 Troubleshooting

### Port 5000 is already in use
If you get an error that port 5000 is already in use, you can:

1. Kill the process using port 5000:
   ```bash
   # On Linux/Mac
   lsof -ti:5000 | xargs kill -9
   
   # On Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. Or modify the PORT in `server.js`:
   ```javascript
   const PORT = 3001; // Change to any available port
   ```

### Database issues
If you have database issues, delete `shop.db` and restart the server:
```bash
rm shop.db
npm start
```

### CORS errors
If you get CORS errors, make sure the frontend is accessing the correct API URL. Check `public/app.js`:
```javascript
const API_URL = '/api';
```

## 📝 Sample Data

The database is automatically seeded with 6 sample products:
1. Premium Wireless Headphones - $299.99
2. Minimalist Leather Watch - $149.50
3. Smart Fitness Tracker - $89.99
4. Organic Cotton T-Shirt - $35.00
5. Modern Desk Lamp - $45.00
6. Leather Backpack - $120.00

## 🎨 Customization

### Add More Products
Edit `db.js` and add more items to the `products` array in the `seedDatabase()` function.

### Change Port
Edit `server.js`:
```javascript
const PORT = 5000; // Change this number
```

### Modify Styling
Edit `public/style.css` to customize colors, fonts, and layout.

### Add New Features
- Add user authentication
- Add order history
- Add product reviews
- Add payment integration
- Add admin panel

## 📚 Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## 📄 License

MIT License - Feel free to use this project for educational purposes.

## 👨‍💼 Author

Faculty of Computers and Information

---

**Happy Coding! 🚀**
