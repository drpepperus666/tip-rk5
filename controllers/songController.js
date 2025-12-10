const fs = require('fs')
const path = require('path')

// Путь к файлу с данными
const dataPath = path.join(__dirname, '../data/songs.json')

// Вспомогательная функция для чтения файла
const readSongs = () => {
	const data = fs.readFileSync(dataPath, 'utf8')
	return JSON.parse(data)
}

// Вспомогательная функция для записи в файл
const writeSongs = songs => {
	fs.writeFileSync(dataPath, JSON.stringify(songs, null, 2))
}

// GET все песни
exports.getAllSongs = (req, res) => {
	try {
		const songs = readSongs()

		// Поддержка query-параметров для фильтрации
		const { genre, artist, year } = req.query

		let filtered = songs

		if (genre) {
			filtered = filtered.filter(
				song => song.genre.toLowerCase() === genre.toLowerCase()
			)
		}

		if (artist) {
			filtered = filtered.filter(song =>
				song.artist.toLowerCase().includes(artist.toLowerCase())
			)
		}

		if (year) {
			filtered = filtered.filter(song => song.year == year)
		}

		res.json({
			success: true,
			count: filtered.length,
			data: filtered,
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Ошибка при получении песен',
			error: error.message,
		})
	}
}

// GET песню по ID
exports.getSongById = (req, res) => {
	try {
		const { id } = req.params
		const songs = readSongs()
		const song = songs.find(s => s.id === parseInt(id))

		if (!song) {
			return res.status(404).json({
				success: false,
				message: `Песня с ID ${id} не найдена`,
			})
		}

		res.json({
			success: true,
			data: song,
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Ошибка при получении песни',
			error: error.message,
		})
	}
}

// POST добавить новую песню
exports.createSong = (req, res) => {
	try {
		const { title, artist, album, year, genre } = req.body

		// Валидация
		if (!title || !artist || !album || !year || !genre) {
			return res.status(400).json({
				success: false,
				message: 'Все поля обязательны: title, artist, album, year, genre',
			})
		}

		const songs = readSongs()
		const newId = songs.length > 0 ? Math.max(...songs.map(s => s.id)) + 1 : 1

		const newSong = {
			id: newId,
			title,
			artist,
			album,
			year: parseInt(year),
			genre,
		}

		songs.push(newSong)
		writeSongs(songs)

		res.status(201).json({
			success: true,
			message: 'Песня успешно добавлена',
			data: newSong,
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Ошибка при добавлении песни',
			error: error.message,
		})
	}
}

// PUT обновить песню
exports.updateSong = (req, res) => {
	try {
		const { id } = req.params
		const { title, artist, album, year, genre } = req.body

		const songs = readSongs()
		const songIndex = songs.findIndex(s => s.id === parseInt(id))

		if (songIndex === -1) {
			return res.status(404).json({
				success: false,
				message: `Песня с ID ${id} не найдена`,
			})
		}

		// Обновляем только переданные поля
		if (title !== undefined) songs[songIndex].title = title
		if (artist !== undefined) songs[songIndex].artist = artist
		if (album !== undefined) songs[songIndex].album = album
		if (year !== undefined) songs[songIndex].year = parseInt(year)
		if (genre !== undefined) songs[songIndex].genre = genre

		writeSongs(songs)

		res.json({
			success: true,
			message: 'Песня успешно обновлена',
			data: songs[songIndex],
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Ошибка при обновлении песни',
			error: error.message,
		})
	}
}

// DELETE удалить песню
exports.deleteSong = (req, res) => {
	try {
		const { id } = req.params
		const songs = readSongs()
		const songIndex = songs.findIndex(s => s.id === parseInt(id))

		if (songIndex === -1) {
			return res.status(404).json({
				success: false,
				message: `Песня с ID ${id} не найдена`,
			})
		}

		const deletedSong = songs.splice(songIndex, 1)
		writeSongs(songs)

		res.json({
			success: true,
			message: 'Песня успешно удалена',
			data: deletedSong[0],
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Ошибка при удалении песни',
			error: error.message,
		})
	}
}

// GET статистика
exports.getStats = (req, res) => {
	try {
		const songs = readSongs()

		const stats = {
			totalSongs: songs.length,
			genres: [...new Set(songs.map(s => s.genre))],
			artists: [...new Set(songs.map(s => s.artist))],
			yearRange: {
				min: Math.min(...songs.map(s => s.year)),
				max: Math.max(...songs.map(s => s.year)),
			},
		}

		res.json({
			success: true,
			data: stats,
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Ошибка при получении статистики',
			error: error.message,
		})
	}
}
