const express = require('express');
const router = express.Router();

/**
 * Marcas — stub hasta implementar tabla brands en PostgreSQL.
 * Evita 404 en el frontend; retorna lista vacía.
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: [],
    total: 0,
  });
});

module.exports = router;
