/* ================ SETTING ================= */
// Define Node.js Framework's library: 'express'
const express = require('express');
const app = express();
// Define library for overrided method delivery: 'method-override'
const methodOverride = require('method-override');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const MongoStore = require('connect-mongo');
// Define .env file for environment variables.
require('dotenv').config({ path: '../.env' });
// Define cors that help connect with react project.
const cors = require('cors');

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
// 아래 모든 라우터 정의는 react project와 연동해서 사용 가능.
app.use(cors());

// Embedding and Initializing passport library
app.use(passport.initialize())
app.use(session({
  secret: process.env.HASH_SALT,
  resave : false,
  saveUninitialized : false,
  cookie : { maxAge : parseInt(process.env.EXPIRE_DATE) },
  store : MongoStore.create({
    mongoUrl : process.env.DB_URL,
    dbName : process.env.DB_NAME,
  })
}))
app.use(passport.session())

// CUSTOM MAGIC NUMBER
const MAX_TITLE_LEN = 50;
const PAGINATION_NUM = 10;
const MAX_UID_LEN = 20;
const MIN_UPWD_LEN = 8;
/* ========================================== */



/* ================== MAIN ================== */
// Define and Link DB: 'MongoDB'
let db;
new MongoClient(process.env.DB_URL).connect().then((client) => {
	console.log('DB연결성공');

	db = client.db('forum');
	collec_post = db.collection('post');
	collec_user = db.collection('user');

	app.listen(process.env.SERV_PORT, () => {
		//** Start Server: 'http://localhost:8080'
		console.log('http://localhost:8080 에서 서버 실행중');
	});

}).catch((err) => {
	console.log(err);
});
/* ========================================== */



/* ========== Login Session Macro =========== */
// 로그인 검증 수행 매크로
passport.use(new LocalStrategy(async (inputUID, inputUPWD, cb) => {
    try
    {
        let result = await collec_user.findOne({ username : inputUID });
        if (!result) {
            return cb(null, false, { message: '존재하지 않는 ID입니다.' });
        }
        if (await bcrypt.compare(inputUPWD, result.password)) {
            return cb(null, result);
        } else {
            return cb(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }
    }
    catch (err) {
		return showErrorAndGoBack(res, 'ServerError 500: 로그인이 제대로 이루어지지 않았습니다.');
    }
}));

passport.serializeUser((user, done) => {
    console.log(user);
    process.nextTick(() => {
      done(null, { id: user._id, username: user.username })
    });
});

passport.deserializeUser(async (user, done) => {
    let result = await collec_user.findOne({ _id : new ObjectId(user.id) });
    delete result.password;
    process.nextTick(() => {
        return done(null, result);
    });
});

// 모든 뷰에서 user 변수에 접근할 수 있음.
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
/* ========================================== */



/* ========= Rendering page express ========= */

// Render Homepage: 'http://localhost:8080/'
app.get('/api/', (req, res) => {
    res.redirect('/api/forum/1');
});

app.get('/api/register', (req, res) => {
    res.render('register.ejs');
});

app.get('/api/login', (req, res) => {
    res.render('login.ejs');
});

app.get('/api/logout', checkLogedInAndHandleError, (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/api/forum/1');
    });
});

app.get('/api/mypage', checkLogedInAndHandleError, (req, res) => {
    res.render('mypage.ejs', { userID : req.user.username });
});

// Render Forum page: 'http://localhost:8080/forum'
app.get('/api/forum', async (req, res) => {
	return res.redirect('/api/forum/1');
});

// Render Forum page: 'http://localhost:8080/forum/"index"'
app.get('/api/forum/:index', async (req, res) => {
    const idx = req.params.index - 1;
	let result = await collec_post
        .find()
        .skip(idx * PAGINATION_NUM)
        .limit(PAGINATION_NUM)
        .toArray();

    res.render('forum.ejs', { posts : result });
});

// Render Detail of Post page: 'http://localhost:8080/"postID"'
app.get('/api/forum/detail/:postID', async (req, res) => {
	try {
        let result = await collec_post.findOne({ _id : new ObjectId(req.params.postID) });
        //** Handling Clientside error
		if (result == null) {
			return showErrorAndGoBack(res, 'Forbidden 404: 찾으려는 게시글이 존재하지 않습니다.');
		}
		//** 해당 ID 포스트 입장
		res.render('detail.ejs', { post : result });
    } catch (err) {
        //** Handling Clientside error
		return showErrorAndGoBack(res, 'Forbidden 404: 찾으려는 게시글이 존재하지 않습니다.');
    }
});

// Render Posting page: 'http://localhost:8080/posting'
app.get('/api/posting', checkLogedInAndHandleError, (req, res) => {
    res.render('posting.ejs');
});

// Render Edit page: 'http://localhost:8080/edit/"postID"'
app.get('/api/forum/edit/:postID', checkLogedInAndHandleError, async (req, res) => {
	try
    {
        let result = await collec_post.findOne({ _id : new ObjectId(req.params.postID) });
        //** Handling Clientside error
		if (result == null) {
			return showErrorAndGoBack(res, 'Forbidden 404: 수정하려는 게시글이 존재하지 않습니다.');
		}
		//** 해당 ID 포스트 입장
		res.render('edit.ejs', { post : result });
    }
    catch (err) {
        //** Handling Clientside error
		return showErrorAndGoBack(res, 'Forbidden 404: 수정하려는 게시글이 존재하지 않습니다.');
    }
});
/* ========================================== */



/* ========== API Handling express ========== */

// API: POST NewPost page: 'http://localhost:8080/login'
app.post('/api/register', async (req, res) => {
    const { username, password, password_check } = req.body;
    console.log(req.body);

    let result = collec_user.findOne({ username : username });

    //** 아이디가 비어있거나 너무 긴 경우
    if (username == '' || username.length > MAX_UID_LEN) {
        return showErrorAndGoBack(res, '올바른 아이디를 입력해주세요. (20자 이내)');
    }
    //** 아이디가 중복되는 경우
    if (result.username != null) {
        return showErrorAndGoBack(res, '이미 사용중인 아이디입니다.');
    }
    //** 비밀번호가 유효하지 않은 경우
	if (password == '' || password.length < MIN_UPWD_LEN) {
		return showErrorAndGoBack(res, '유효한 비밀번호를 입력해주세요. (8자 이상)');
	}
    //** 비밀번호 확인이 일치하지 않은 경우
	if (password != password_check) {
		return showErrorAndGoBack(res, '비밀번호가 정확한지 확인해주세요.');
	}

    let hashedPWD = await bcrypt.hash(password, 10);

    await collec_user.insertOne({
        username : username,
        password : hashedPWD,
    })
    res.redirect('/api/forum/1');
});

app.post('/api/login', (req, res, next) => {

    //** 검증 과정 템플릿에서 받아온 거 => 클라이언트에게 보내주는 작업
    passport.authenticate('local', (error, user, info) => {
        if (error != null) { return res.status(500).json(error); }
        if (!user) { return res.status(401).json(info.message); }

        //** 실제 로그인 작업, 성공하면 =>
        req.logIn(user, (err) => {
            if (err != null) { return next(err); }
            res.redirect('/api/forum/1');
        })

    })(req, res, next);

});

// API: POST NewPost page: 'http://localhost:8080/newpost'
app.post('/api/newpost', checkLogedInAndHandleError, async (req, res) => {
    //**** req.body 쓰려면 app.use(express~) 내용 필수적임
    //** 제목과 내용 추출
    const { title, content } = req.body;
    console.log(req.body);

    //** 제목이 비어있거나 너무 긴 경우
    if (title == '' || title.length > MAX_TITLE_LEN) {
        return showErrorAndGoBack(res, '제목을 입력해주세요. (50자 이내)');
    }
    //** 내용이 비어있는 경우
	if (content == '') {
		return showErrorAndGoBack(res, '내용을 입력해주세요.');
	}

    try
    {
        await collec_post.insertOne({
            title: title,
            content: content
        });

	    return res.redirect('/api/forum/1');
    }
    catch (err) {
        //** Handling Serverside error
        console.error('Error occurred while inserting post:', err);
        return res.status(500).send('게시물을 작성하는 중에 오류가 발생했습니다.');
    }
});

// API: PUT EditPost page: 'http://localhost:8080/editpost'
app.put('/api/editpost', checkLogedInAndHandleError, async (req, res) => {
    //** 제목, 내용, 포스트ID 추출
    const { postID, title, content } = req.body;
    console.log("Edit post: " + postID);

    //** 제목이 비어있는 경우
    if (title == '' || title.length > MAX_TITLE_LEN) {
        return showErrorAndGoBack(res, '제목을 입력해주세요. (50자)');
    }
    //** 내용이 비어있는 경우
	if (content == '') {
		return showErrorAndGoBack(res, '내용을 입력해주세요.');
	}

    try
    {
        await collec_post.updateOne({ _id : new ObjectId(postID) },
			{$set : {
				title: title,
				content: content
			}}
		);

	    return res.redirect('/api/forum/detail/' + postID);
    }
    catch (err) {
        //** Handling Serverside error
        console.error('Error occurred while update post:', err);
        return res.status(500).send('게시물을 수정하는 중에 오류가 발생했습니다.');
    }
});

// API: DELETE and go Forum page: 'http://localhost:8080/delpost'
app.delete('/api/delpost/:postID', checkLogedInAndHandleError, async (req, res) => {
    console.log("Delete post: " + req.params.postID);

    try
    {
        await collec_post.deleteOne({ _id : new ObjectId(req.params.postID) });
        //**** DELETE method 사용 후 redirect가 안먹힘. -> twice res는 syntax 오류
        //**** return res.redirect 는 DELETE method의 성공 status code와 관련없기 때문에, 제대로 처리하지 못함.
        //**** 따라서 redirect는 클라이언트 사이드에서 처리하기로 함.
        //-> res.redirect('/forum');
        return res.sendStatus(204);
    }
    catch (err) {
        //** Handling Serverside error
        console.error('Error occurred while update post:', err);
        return res.status(500).send('게시물을 삭제하는 중에 오류가 발생했습니다.');
    }
});
/* ========================================== */



/* ======== Error Handling Function ========= */

// Show error message and go back to the window has the lastest history.
function showErrorAndGoBack(res, errorMessage) {
    res.send(`
        <script>
            alert('${errorMessage}');
            window.history.back();
        </script>
    `);
}

function checkLogedInAndHandleError(req, res, next) {
    if (req.user == null) {
        res.send(`
            <script>
                alert('로그인 후 이용가능한 페이지입니다.');
                window.location.href = '/api/login';
            </script>
        `);
        return;
    } else {
        next();
    }
}
/* ========================================== */