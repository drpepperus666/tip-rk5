// API базовый URL
const API_URL = '/api/songs'

// DOM элементы
const songsList = document.getElementById('songsList')
const addSongForm = document.getElementById('addSongForm')
const filterBtn = document.getElementById('filterBtn')
const resetBtn = document.getElementById('resetBtn')
const genreFilter = document.getElementById('genreFilter')
const artistFilter = document.getElementById('artistFilter')
const yearFilter = document.getElementById('yearFilter')

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
	loadSongs()
	loadStats()
	setupEventListeners()
})

// Загрузка всех песен
async function loadSongs(genre, artist, year) {
	try {
		let url = API_URL
		const params = new URLSearchParams()

		if (genre) params.append('genre', genre)
		if (artist) params.append('artist', artist)
		if (year) params.append('year', year)

		if (params.toString()) {
			url += '?' + params.toString()
		}

		const response = await fetch(url)
		const data = await response.json()

		if (data.success) {
			displaySongs(data.data)
		} else {
			showNotification('Ошибка при загрузке песен', 'error')
		}
	} catch (error) {
		console.error('Ошибка:', error)
		showNotification('Ошибка при загрузке песен', 'error')
	}
}

// Вывод песен на страницу
function displaySongs(songs) {
	songsList.innerHTML = ''

	if (songs.length === 0) {
		songsList.innerHTML = '<p class="no-results">Песни не найдены</p>'
		return
	}

	songs.forEach(song => {
		const songCard = createSongCard(song)
		songsList.appendChild(songCard)
	})
}

// Создание карточки песни
function createSongCard(song) {
	const card = document.createElement('div')
	card.className = 'song-card'
	card.id = `song-${song.id}`

	card.innerHTML = `
        <h3>${escapeHtml(song.title)}</h3>
        <div class="song-info">
            <strong>Исполнитель:</strong> ${escapeHtml(song.artist)}
        </div>
        <div class="song-info">
            <strong>Альбом:</strong> ${escapeHtml(song.album)}
        </div>
        <span class="song-year">${song.year}</span>
        <span class="song-genre">${escapeHtml(song.genre)}</span>
        <div class="song-actions">
            <button class="btn btn-edit" onclick="editSong(${
							song.id
						})">Редактировать</button>
            <button class="btn btn-delete" onclick="deleteSong(${
							song.id
						})">Удалить</button>
        </div>
    `

	return card
}

// Загрузка и отображение статистики
async function loadStats() {
	try {
		const response = await fetch(`${API_URL}/stats`)
		const data = await response.json()

		if (data.success) {
			updateStats(data.data)
		}
	} catch (error) {
		console.error('Ошибка при загрузке статистики:', error)
	}
}

// Обновление статистики
function updateStats(stats) {
	document.getElementById('totalSongs').textContent = stats.totalSongs
	document.getElementById('genreCount').textContent = stats.genres.length
	document.getElementById('artistCount').textContent = stats.artists.length
	document.getElementById(
		'yearRange'
	).textContent = `${stats.yearRange.min} - ${stats.yearRange.max}`
}

// Добавление новой песни
addSongForm.addEventListener('submit', async e => {
	e.preventDefault()

	const newSong = {
		title: document.getElementById('title').value.trim(),
		artist: document.getElementById('artist').value.trim(),
		album: document.getElementById('album').value.trim(),
		year: parseInt(document.getElementById('year').value),
		genre: document.getElementById('genre').value.trim(),
	}

	// Валидация
	if (
		!newSong.title ||
		!newSong.artist ||
		!newSong.album ||
		!newSong.year ||
		!newSong.genre
	) {
		showNotification('Заполните все поля', 'error')
		return
	}

	try {
		const response = await fetch(API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(newSong),
		})

		const data = await response.json()

		if (data.success) {
			showNotification('Песня успешно добавлена', 'success')
			addSongForm.reset()
			loadSongs()
			loadStats()
		} else {
			showNotification(data.message, 'error')
		}
	} catch (error) {
		console.error('Ошибка:', error)
		showNotification('Ошибка при добавлении песни', 'error')
	}
})

// Редактирование песни
async function editSong(songId) {
	try {
		// Получаем текущие данные песни
		const response = await fetch(`${API_URL}/${songId}`)
		const data = await response.json()

		if (!data.success) {
			showNotification('Песня не найдена', 'error')
			return
		}

		const song = data.data
		const card = document.getElementById(`song-${songId}`)

		// Проверяем, редактируется ли уже
		if (card.querySelector('.edit-form')) {
			return
		}

		// Сохраняем оригинальное содержимое
		const originalHTML = card.innerHTML

		// Создаем форму редактирования
		card.innerHTML = `
            <h3>${escapeHtml(song.title)}</h3>
            <form class="edit-form" onsubmit="saveEdit(event, ${songId})">
                <input type="text" name="title" value="${escapeHtml(
									song.title
								)}" required>
                <input type="text" name="artist" value="${escapeHtml(
									song.artist
								)}" required>
                <input type="text" name="album" value="${escapeHtml(
									song.album
								)}" required>
                <input type="number" name="year" value="${song.year}" required>
                <input type="text" name="genre" value="${escapeHtml(
									song.genre
								)}" required>
                <div class="edit-actions">
                    <button type="submit" class="btn btn-save">Сохранить</button>
                    <button type="button" class="btn btn-cancel" onclick="cancelEdit(${songId})">Отмена</button>
                </div>
            </form>
        `

		// Сохраняем оригинальный HTML для отмены
		card.dataset.originalHTML = originalHTML
	} catch (error) {
		console.error('Ошибка:', error)
		showNotification('Ошибка при редактировании', 'error')
	}
}

// Сохранение изменений
async function saveEdit(event, songId) {
	event.preventDefault()

	const form = event.target
	const updatedSong = {
		title: form.title.value.trim(),
		artist: form.artist.value.trim(),
		album: form.album.value.trim(),
		year: parseInt(form.year.value),
		genre: form.genre.value.trim(),
	}

	try {
		const response = await fetch(`${API_URL}/${songId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(updatedSong),
		})

		const data = await response.json()

		if (data.success) {
			showNotification('Песня успешно обновлена', 'success')
			loadSongs()
			loadStats()
		} else {
			showNotification(data.message, 'error')
		}
	} catch (error) {
		console.error('Ошибка:', error)
		showNotification('Ошибка при сохранении', 'error')
	}
}

// Отмена редактирования
function cancelEdit(songId) {
	const card = document.getElementById(`song-${songId}`)
	if (card.dataset.originalHTML) {
		card.innerHTML = card.dataset.originalHTML
	}
}

// Удаление песни
async function deleteSong(songId) {
	if (!confirm('Вы уверены, что хотите удалить эту песню?')) {
		return
	}

	try {
		const response = await fetch(`${API_URL}/${songId}`, {
			method: 'DELETE',
		})

		const data = await response.json()

		if (data.success) {
			showNotification('Песня успешно удалена', 'success')
			loadSongs()
			loadStats()
		} else {
			showNotification(data.message, 'error')
		}
	} catch (error) {
		console.error('Ошибка:', error)
		showNotification('Ошибка при удалении', 'error')
	}
}

// Применение фильтров
filterBtn.addEventListener('click', () => {
	const genre = genreFilter.value.trim()
	const artist = artistFilter.value.trim()
	const year = yearFilter.value.trim()

	loadSongs(genre, artist, year)
})

// Сброс фильтров
resetBtn.addEventListener('click', () => {
	genreFilter.value = ''
	artistFilter.value = ''
	yearFilter.value = ''
	loadSongs()
})

// Настройка слушателей событий
function setupEventListeners() {
	// Enter для поиска в фильтрах
	;[genreFilter, artistFilter, yearFilter].forEach(input => {
		input.addEventListener('keypress', e => {
			if (e.key === 'Enter') {
				filterBtn.click()
			}
		})
	})
}

// Показ уведомлений
function showNotification(message, type = 'success') {
	const notification = document.createElement('div')
	notification.className = `notification ${type}`
	notification.textContent = message
	document.body.appendChild(notification)

	setTimeout(() => {
		notification.remove()
	}, 3000)
}

// Экранирование HTML
function escapeHtml(text) {
	const div = document.createElement('div')
	div.textContent = text
	return div.innerHTML
}
