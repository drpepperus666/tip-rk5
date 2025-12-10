const express = require('express')
const path = require('path')
const requestLogger = require('./middleware/logger')
const songRoutes = require('./routes/songs')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(requestLogger)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// API маршруты
app.use('/api/songs', songRoutes)

// Главная страница
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// API информация
app.get('/api', (req, res) => {
	res.json({
		name: 'Favorite Songs API',
		version: '1.0.0',
		description: 'API для управления списком любимых песен',
		endpoints: {
			GET: [
				'/api/songs - получить все песни',
				'/api/songs?genre=Rock - фильтрация по жанру',
				'/api/songs?artist=Queen - фильтрация по исполнителю',
				'/api/songs?year=1975 - фильтрация по году',
				'/api/songs/:id - получить песню по ID',
				'/api/songs/stats - получить статистику',
			],
			POST: ['/api/songs - добавить новую песню'],
			PUT: ['/api/songs/:id - обновить песню'],
			DELETE: ['/api/songs/:id - удалить песню'],
		},
	})
})

// 404 обработчик
app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: 'Страница не найдена',
	})
})

// Обработка ошибок
app.use((err, req, res, next) => {
	console.error(err)
	res.status(500).json({
		success: false,
		message: 'Внутренняя ошибка сервера',
		error: err.message,
	})
})

app.listen(PORT, () => {
	console.log(`\nСервер запущен на http://localhost:${PORT}`)
	console.log(`API документация доступна на http://localhost:${PORT}/api`)
	console.log(`Веб-приложение доступно на http://localhost:${PORT}\n`)
})

module.exports = app
