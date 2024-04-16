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
app.use(passport.initialize());
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

// 프론트: 리액트와 연결
app.get("/api", (req, res) => {
    return res.json({ greeting: "Hello World" });
});

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
		console.log('http://localhost:8081 에서 서버 실행중');
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
app.get('/', (req, res) => {
    res.redirect('/forum/1');
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.get('/logout', checkLogedInAndHandleError, (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/forum/1');
    });
});

app.get('/mypage', checkLogedInAndHandleError, (req, res) => {
    res.render('mypage.ejs', { userID : req.user.username });
});

// Render Forum page: 'http://localhost:8080/forum'
app.get('/forum', async (req, res) => {
    try {
        const result = await collec_post.find().toArray();
        res.json(result); // JSON 형식으로 데이터 전달
    } catch (error) {
        console.error('Failed to fetch forum data:', error);
        res.status(500).json({ error: 'Failed to fetch forum data' }); // 에러 처리
    }
});

// Render Forum page: 'http://localhost:8080/forum/"index"'
app.get('/forum/:index', async (req, res) => {
    const idx = req.params.index - 1;
	let result = await collec_post
        .find()
        .skip(idx * PAGINATION_NUM)
        .limit(PAGINATION_NUM)
        .toArray();

    res.render('forum.ejs', { posts : result });
});

// Render Detail of Post page: 'http://localhost:8080/"postID"'
app.get('/forum/detail/:postID', async (req, res) => {
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
app.get('/posting', checkLogedInAndHandleError, (req, res) => {
    res.render('posting.ejs');
});

// Render Edit page: 'http://localhost:8080/edit/"postID"'
app.get('/forum/edit/:postID', checkLogedInAndHandleError, async (req, res) => {
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
app.post('/register', async (req, res) => {
    
    console.log(req.body);
    const { email, password } = req.body;
    console.log(req.body);
    console.log(email);

    let result = collec_user.findOne({ username : email });

    //** 아이디가 비어있거나 너무 긴 경우
    if (email == '' || email.length > MAX_UID_LEN) {
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

    let hashedPWD = await bcrypt.hash(password, 10);

    await collec_user.insertOne({
        username : email,
        password : hashedPWD,
    })
    res.redirect('/forum/1');
});

app.post('/login', (req, res, next) => {
    console.log(req.body.username);

    //** 검증 과정 템플릿에서 받아온 거 => 클라이언트에게 보내주는 작업
    passport.authenticate('local', (error, user, info) => {
        if (error != null) { return res.status(500).json(error); }
        if (!user) { return res.status(401).json(info.message); }

        //** 실제 로그인 작업, 성공하면 =>
        req.logIn(user, (err) => {
            if (err != null) { return next(err); }
            res.redirect('/forum/1');
        })

    })(req, res, next);

});

// API: POST NewPost page: 'http://localhost:8080/newpost'
app.post('/newpost', checkLogedInAndHandleError, async (req, res) => {
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
            writer: req.user.username,
            title: title,
            content: content,
            like: 0
        });

        return;
    }
    catch (err) {
        //** Handling Serverside error
        console.error('Error occurred while inserting post:', err);
        return res.status(500).send('게시물을 작성하는 중에 오류가 발생했습니다.');
    }
});

// API: PUT EditPost page: 'http://localhost:8080/editpost'
app.put('/editpost', checkLogedInAndHandleError, async (req, res) => {
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

	    return res.redirect('/forum/detail/' + postID);
    }
    catch (err) {
        //** Handling Serverside error
        console.error('Error occurred while update post:', err);
        return res.status(500).send('게시물을 수정하는 중에 오류가 발생했습니다.');
    }
});

// API: DELETE and go Forum page: 'http://localhost:8080/delpost'
app.delete('/delpost/:postID', checkLogedInAndHandleError, async (req, res) => {
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

// API: PUT EditPost page: 'http://localhost:8080/editpost'
app.put('/like/:postID', checkLogedInAndHandleError, async (req, res) => {
    try {
        const postID = req.params.postID;
        
        // DB에서 postID에 해당하는 게시물 조회
        const post = await collec_post.findOne({ _id: new ObjectId(postID) });

        if (!post) {
            return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
        }

        // 게시물의 like 수를 1 증가시킴
        await collec_post.updateOne(
            { _id: new ObjectId(postID) },
            { $inc: { like: 1 } }
        );
        console.log("hello, world!");

        res.status(200).json({ message: '게시물에 좋아요를 추가했습니다.' });
    } catch (error) {
        console.error('Failed to like post:', error);
        res.status(500).json({ error: '게시물에 좋아요를 추가하는 도중 오류가 발생했습니다.' });
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
                window.location.href = '/login';
            </script>
        `);
        return;
    } else {
        next();
    }
}
/* ========================================== */