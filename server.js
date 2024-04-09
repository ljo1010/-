/* ================ CONSTANT ================ */
// Define Node.js Framework's library: 'express'
const express = require('express');
const app = express();
// Define library for overrided method delivery: 'method-override'
const methodOverride = require('method-override');
const { MongoClient, ObjectId } = require('mongodb');

// Define passport library for session: 'express-session & passport'
//**** maybe we define passport library for JWT(Token) later. . .
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

// Include Absolute Link: '/public'
app.use(express.static(__dirname + '/public'));
// Embedding Template Engine: 'ejs'
app.set('view engine', 'ejs');
// Encode data sent by user
//**** Same Role in pyMongo: jsonify ()
app.use(express.json());
app.use(express.urlencoded({extended:true}));
//**** 클라이언트 사이드에서 action="/URL~~?_method=PUT" 같은 코드 작성 가능
app.use(methodOverride('_method'));

// Embedding and Initializing passport library
app.use(passport.initialize())
app.use(session({
  secret: 'roryrlsuadlf28',
  resave : false,
  saveUninitialized : false
}))
app.use(passport.session())

// CUSTOM MAGIC NUMBER
const MAX_TITLE_LEN = 50;
const PAGINATION_NUM = 10;
/* ========================================== */


/* ================== MAIN ================== */
// Define and Link DB: 'MongoDB'
let db;
const url = 'mongodb+srv://admin:roryrlsuadlf28@hunobas.olovavq.mongodb.net/?retryWrites=true&w=majority';
new MongoClient(url).connect().then((client) => {
	console.log('DB연결성공');

	db = client.db('forum');
	collec_post = db.collection('post'); 

	app.listen(8080, () => {
		//** Start Server: 'http://localhost:8080'
		console.log('http://localhost:8080 에서 서버 실행중');
	});

}).catch((err) => {
	console.log(err);
});
/* ========================================== */


/* ========= Rendering page express ========= */

// Render Homepage: 'http://localhost:8080/'
app.get('/', (request, response) => {
    response.sendFile(__dirname + '/index.html');
});

// Render Forum page: 'http://localhost:8080/forum'
app.get('/forum', async (request, response) => {
	return response.redirect('/forum/1');
});

// Render Forum page: 'http://localhost:8080/forum/"index"'
app.get('/forum/:index', async (request, response) => {
    const idx = request.params.index - 1;
	let result = await collec_post
        .find()
        .skip(idx * PAGINATION_NUM)
        .limit(PAGINATION_NUM)
        .toArray();

    response.render('forum.ejs', { posts : result });
});

// Render Detail of Post page: 'http://localhost:8080/"postID"'
app.get('/forum/detail/:postID', async (request, response) => {
	try {
        let result = await collec_post.findOne({ _id : new ObjectId(request.params.postID) });
        //** Handling Clientside error
		if (result == null) {
			return showErrorAndGoBack(response, 'Forbidden 404: 찾으려는 게시글이 존재하지 않습니다.');
		}
		//** 해당 ID 포스트 입장
		response.render('detail.ejs', { post : result });
    } catch (err) {
        //** Handling Clientside error
		return showErrorAndGoBack(response, 'Forbidden 404: 찾으려는 게시글이 존재하지 않습니다.');
    }
});

// Render Posting page: 'http://localhost:8080/posting'
app.get('/posting', (request, response) => {
	response.render('posting.ejs');
});

// Render Edit page: 'http://localhost:8080/edit/"postID"'
app.get('/edit/:postID', async (request, response) => {
	try
    {
        let result = await collec_post.findOne({ _id : new ObjectId(request.params.postID) });
        //** Handling Clientside error
		if (result == null) {
			return showErrorAndGoBack(response, 'Forbidden 404: 수정하려는 게시글이 존재하지 않습니다.');
		}
		//** 해당 ID 포스트 입장
		response.render('edit.ejs', { post : result });
    }
    catch (err) {
        //** Handling Clientside error
		return showErrorAndGoBack(response, 'Forbidden 404: 수정하려는 게시글이 존재하지 않습니다.');
    }
});
/* ========================================== */


/* ========== API Handling express ========== */

// API: POST NewPost page: 'http://localhost:8080/newpost'
app.post('/newpost', async (request, response) => {
    //**** request.body 쓰려면 app.use(express~) 내용 필수적임
    //** 제목과 내용 추출
    const { title, content } = request.body;
    console.log(request.body);

    //** 제목이 비어있는 경우
    if (title == '' || title.length > MAX_TITLE_LEN) {
        return showErrorAndGoBack(response, '제목을 입력해주세요. (50자)');
    }
    //** 내용이 비어있는 경우
	if (content == '') {
		return showErrorAndGoBack(response, '내용을 입력해주세요.');
	}

    try
    {
        await collec_post.insertOne({
            title: title,
            content: content
        });

	    return response.redirect('/forum/1');
    }
    catch (err) {
        //** Handling Serverside error
        console.error('Error occurred while inserting post:', err);
        return response.status(500).send('게시물을 작성하는 중에 오류가 발생했습니다.');
    }
});

// API: PUT EditPost page: 'http://localhost:8080/editpost'
app.put('/editpost', async (request, response) => {
    //** 제목, 내용, 포스트ID 추출
    const { postID, title, content } = request.body;
    console.log("Edit post: " + postID);

    //** 제목이 비어있는 경우
    if (title == '' || title.length > MAX_TITLE_LEN) {
        return showErrorAndGoBack(response, '제목을 입력해주세요. (50자)');
    }
    //** 내용이 비어있는 경우
	if (content == '') {
		return showErrorAndGoBack(response, '내용을 입력해주세요.');
	}

    try
    {
        await collec_post.updateOne({ _id : new ObjectId(postID) },
			{$set : {
				title: title,
				content: content
			}}
		);

	    return response.redirect('/forum/detail/' + postID);
    }
    catch (err) {
        //** Handling Serverside error
        console.error('Error occurred while update post:', err);
        return response.status(500).send('게시물을 수정하는 중에 오류가 발생했습니다.');
    }
});

// API: DELETE and go Forum page: 'http://localhost:8080/delpost'
app.delete('/delpost/:postID', async (request, response) => {
    console.log("Delete post: " + request.params.postID);

    try
    {
        await collec_post.deleteOne({ _id : new ObjectId(request.params.postID) });
        //**** DELETE method 사용 후 redirect가 안먹힘. -> twice response는 syntax 오류
        //**** return response.redirect 는 DELETE method의 성공 status code와 관련없기 때문에, 제대로 처리하지 못함.
        //**** 따라서 redirect는 클라이언트 사이드에서 처리하기로 함.
        //-> response.redirect('/forum');
        return response.sendStatus(204);
    }
    catch (err) {
        //** Handling Serverside error
        console.error('Error occurred while update post:', err);
        return response.status(500).send('게시물을 삭제하는 중에 오류가 발생했습니다.');
    }
});
/* ========================================== */


/* ======== Error Handling Function ========= */

// Show error message and go back to the window has the lastest history.
function showErrorAndGoBack(response, errorMessage) {
    response.send(`
        <script>
            alert('${errorMessage}');
            window.history.back();
        </script>
    `);
}
/* ========================================== */