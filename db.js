const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const db = new sqlite3.Database(path.join(__dirname, 'shop.db'), sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            image TEXT,
            rating REAL DEFAULT 4.5,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )`);

        // ✅ FIX: seed with bcrypt-hashed passwords so login works
        db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
            if (row && row.count === 0) {
                const adminHash = await bcrypt.hash('admin123', 10);
                const userHash  = await bcrypt.hash('user123',  10);
                db.run("INSERT INTO users (username, password, role) VALUES ('admin', ?, 'admin')", [adminHash]);
                db.run("INSERT INTO users (username, password, role) VALUES ('user',  ?, 'user')",  [userHash]);
                console.log('Default users created with hashed passwords');
            }
        });

        db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
            if (row && row.count === 0) {
                const products = [
                    { name: 'Elite Wireless Headphones', price: 349.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', rating: 4.8 },
                    { name: 'Luxury Leather Watch',      price: 199.50, category: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', rating: 4.9 },
                    { name: 'Pro Fitness Tracker',       price: 129.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80', rating: 4.7 },
                    { name: 'Premium Cotton Hoodie',     price: 55.00,  category: 'Clothing',    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', rating: 4.5 },
                    { name: 'Designer Desk Lamp',        price: 79.00,  category: 'Home',        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80', rating: 4.6 },
                    { name: 'Executive Backpack',        price: 145.00, category: 'Accessories', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80', rating: 4.8 }
                ];
                const stmt = db.prepare('INSERT INTO products (name, price, category, image, rating) VALUES (?, ?, ?, ?, ?)');
                products.forEach(p => stmt.run(p.name, p.price, p.category, p.image, p.rating));
                stmt.finalize();
            }
        });
    });
}

module.exports = db;
