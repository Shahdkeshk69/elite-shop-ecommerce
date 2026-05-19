const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db.js');

const app = express();
const PORT = 7000;

// ✅ FIX: Use environment variable for secret key, fallback for dev
const SECRET_KEY = process.env.JWT_SECRET || 'elite_market_secret_key_2026';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Verify Token
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Helper: Verify Admin
function verifyAdmin(req, res, next) {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    next();
}

// ============ PUBLIC API ============
app.get('/api/products', (req, res) => {
    let sql = `SELECT * FROM products`;
    let params = [];
    if (req.query.category && req.query.category !== 'all') {
        sql += ` WHERE category = ?`;
        params.push(req.query.category);
    }
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/categories', (req, res) => {
    db.all(`SELECT DISTINCT category FROM products`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(r => r.category));
    });
});

// ============ AUTH API ============
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            SECRET_KEY,
            { expiresIn: '7d' }
        );
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    });
});

app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
        `INSERT INTO users (username, password, role) VALUES (?, ?, 'user')`,
        [username, hashedPassword],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Username already exists' });
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID, username, role: 'user' });
        }
    );
});

// ============ CART API ============
app.get('/api/cart', verifyToken, (req, res) => {
    db.all(
        `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.image
         FROM cart_items ci LEFT JOIN products p ON ci.product_id = p.id
         WHERE ci.user_id = ?`,
        [req.user.id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// ✅ FIX: Upsert cart — increase quantity if product already in cart
app.post('/api/cart', verifyToken, (req, res) => {
    const { product_id, quantity = 1 } = req.body;
    db.get(
        `SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?`,
        [req.user.id, product_id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) {
                db.run(
                    `UPDATE cart_items SET quantity = quantity + ? WHERE id = ?`,
                    [quantity, row.id],
                    (err) => {
                        if (err) return res.status(500).json({ error: err.message });
                        res.json({ success: true });
                    }
                );
            } else {
                db.run(
                    `INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)`,
                    [req.user.id, product_id, quantity],
                    (err) => {
                        if (err) return res.status(500).json({ error: err.message });
                        res.json({ success: true });
                    }
                );
            }
        }
    );
});

app.delete('/api/cart/:id', verifyToken, (req, res) => {
    db.run(
        `DELETE FROM cart_items WHERE id = ? AND user_id = ?`,
        [req.params.id, req.user.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// ============ ADMIN API ============
app.get('/api/admin/data', verifyToken, verifyAdmin, (req, res) => {
    db.all(`SELECT * FROM products`, [], (err, products) => {
        if (err) return res.status(500).json({ error: err.message });
        db.all(`SELECT id, username, role FROM users`, [], (err, users) => {
            if (err) return res.status(500).json({ error: err.message });
            db.all(
                `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price
                 FROM cart_items ci LEFT JOIN products p ON ci.product_id = p.id`,
                [],
                (err, cart) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ products, users, cart });
                }
            );
        });
    });
});

// ============ SERVE FRONTEND ============
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
