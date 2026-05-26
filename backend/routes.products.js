const express = require('express');
const rateLimit = require('express-rate-limit');
const { all, get, run } = require('./db');
const { authMiddleware } = require('./auth.middleware');

const router = express.Router();

const productsWriteLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // Bloqueo por un periodo de 15 minutos
  max: 100, // Máximo 100 modificaciones (crear/editar/borrar) por IP en ese periodo
  message: { error: 'Has realizado demasiadas modificaciones en el inventario. Por favor, intenta de nuevo en 15 minutos.' }
});

// Todas las rutas de productos requieren autenticación
router.use(authMiddleware);

// GET /api/products  — listar con búsqueda y filtros
router.get('/', (req, res) => {
  const { search = '', category = '', page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = 'WHERE 1=1';
  const params = [];

  if (search) {
    where += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    where += ' AND category = ?';
    params.push(category);
  }

  const total = get(`SELECT COUNT(*) as count FROM products ${where}`, params);
  const products = all(
    `SELECT * FROM products ${where} ORDER BY name ASC LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), offset]
  );

  res.json({ products, total: total.count, page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/products/categories  — categorías únicas
router.get('/categories', (req, res) => {
  const cats = all('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category');
  res.json(cats.map(c => c.category));
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = get('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

// POST /api/products
router.post('/', productsWriteLimiter, (req, res) => {
  const { name, description, category, price, stock, unit } = req.body;
  if (!name) return res.status(400).json({ error: 'El nombre es requerido' });
  if (price === undefined || price === null) return res.status(400).json({ error: 'El precio es requerido' });

  run(
    `INSERT INTO products (name, description, category, price, stock, unit)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, description || null, category || null, parseFloat(price), parseInt(stock) || 0, unit || 'pza']
  );

  const created = get('SELECT * FROM products WHERE rowid = last_insert_rowid()');
  res.status(201).json(created);
});

// PUT /api/products/:id
router.put('/:id', productsWriteLimiter, (req, res) => {
  const existing = get('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });

  const { name, description, category, price, stock, unit } = req.body;

  run(
    `UPDATE products
     SET name = ?, description = ?, category = ?, price = ?, stock = ?, unit = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      name ?? existing.name,
      description ?? existing.description,
      category ?? existing.category,
      price !== undefined ? parseFloat(price) : existing.price,
      stock !== undefined ? parseInt(stock) : existing.stock,
      unit ?? existing.unit,
      req.params.id,
    ]
  );

  const updated = get('SELECT * FROM products WHERE id = ?', [req.params.id]);
  res.json(updated);
});

// DELETE /api/products/:id
router.delete('/:id', productsWriteLimiter, (req, res) => {
  const existing = get('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });

  run('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ message: 'Producto eliminado', id: parseInt(req.params.id) });
});

module.exports = router;
