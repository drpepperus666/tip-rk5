// Custom middleware для логирования запросов
const requestLogger = (req, res, next) => {
	const timestamp = new Date().toLocaleString('ru-RU')
	console.log(`[${timestamp}] ${req.method} ${req.path}`)

	// Сохраняем время начала запроса
	req.startTime = Date.now()

	// Продолжаем обработку запроса
	next()
}

module.exports = requestLogger
