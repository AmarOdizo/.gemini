const express = require('express');
const router = express.Router();
const { getItems, createItem, updateItem, deleteItem } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getItems).post(protect, createItem);
router.route('/:id').put(protect, updateItem).delete(protect, deleteItem);

module.exports = router;
