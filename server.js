// Define Node.js Framework's library: 'express'
const express = require('express')
const app = express()

// Include Absolute Link: '/public'
app.use(express.static(__dirname + '/public'))
// Embedding Template Engine: 'ejs'
app.set('view engine', 'ejs')

const { MongoClient } = require('mongodb')

// Define and Link DB: 'MongoDB'
let db;
const url = 'mongodb+srv://admin:roryrlsuadlf28@hunobas.olovavq.mongodb.net/?retryWrites=true&w=majority';
new MongoClient(url).connect().then((client)=>{
	console.log('DB연결성공')
	db = client.db('forum')
	//***** Start Server: 'http://localhost:8080'
	app.listen(8080, () => {
		console.log('http://localhost:8080 에서 서버 실행중')
	})
}).catch((err)=>{
	console.log(err)
})

// Homepage: 'http://localhost:8080/'
app.get('/', (request, response) => {
    response.sendFile(__dirname + '/index.html')
})

// News page (for practice): 'http://localhost:8080/news'
app.get('/news', (request, response) => {
	db.collection('post').insertOne({title: '제목',
									content: '내용'})
})

// Forum page: 'http://localhost:8080/forum'
app.get('/forum', async (request, response) => {
	let result = await db.collection('post').find().toArray()
    console.log(result[0].title)
    response.render('forum.ejs', { posts : result })
})

// Forum page: 'http://localhost:8080/write'
app.get('/write', (request, response) => {
	response.render('write.ejs')
})