const express = require('express')
const router = express.Router()
const songController = require('../controllers/songController')

// GET все песни (с возможностью фильтрации по query-параметрам)
router.get('/', songController.getAllSongs)

// GET статистика
router.get('/stats', songController.getStats)

// GET песню по ID (req.params)
router.get('/:id', songController.getSongById)

// POST добавить новую песню (req.body)
router.post('/', songController.createSong)

// PUT обновить песню (req.params + req.body)
router.put('/:id', songController.updateSong)

// DELETE удалить песню (req.params)
router.delete('/:id', songController.deleteSong)

module.exports = router
