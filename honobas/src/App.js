import { Button, Navbar, Container, Nav } from 'react-bootstrap';
import './App.css';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, Link, useNavigate, Outlet} from 'react-router-dom';
import {Write} from './routes/Write';
import {Graph} from './routes/Grapg';
import Login from './routes/Login.jsx';


function App() {

  let navigate = useNavigate();
  let [글제목, 글제목변경] = useState([]);
  let [따봉, 따봉변경] = useState([])
  let [modal, setModal] = useState(false);
  let [title, setTitle] = useState(2)
  let[입력값, 입력값변경] = useState('');

  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Container>
        <Navbar.Brand href="#home">Influence</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link onClick={()=>navigate('/')}>메인</Nav.Link>
          <Nav.Link onClick={()=>{navigate('/Write')}}>글쓰기</Nav.Link> 
          <Nav.Link onClick={()=>{navigate('/Graph')}}>그래프</Nav.Link> 
        </Nav>
        <Nav>
            <Nav.Link onClick={()=>{navigate('/Login')}}>
              <Button variant="outline-light">로그인</Button>
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    <Routes>

    <Route path='/' element = {
      <>
      <div className='main-bg'></div>
      <div className='container'>
        <div className='row'>
        { 
        글제목.map(function(a, i){
          return (
          <div className="list" key={i}>
            <h4 onClick={() => {setModal(!modal); setTitle(i)}}>{글제목[i]}
              <span onClick={(e)=>{e.stopPropagation();
                let copy = [...따봉];
                copy[i] = copy[i] + 1;
                따봉변경(copy)
              }}>👍</span>{따봉[i]}
            </h4>
            <p>2월 18일 발행</p>
            <button onClick={() => {
              let copy = [...글제목]
              copy.splice(i, 1);
              글제목변경(copy);
            }}>삭제</button>
          </div>)
        }) 
      }
      <input onChange={(e) => {입력값변경(e.target.value); console.log(입력값)}} />
      <button onClick={() => {
        let copy = [...글제목];
        copy.unshift(입력값);
        글제목변경(copy)
      }}>업로드</button>
      {/* 이게 이제 컴포넌트 문법 그리고 여기서는 html부분이기 떄문에 if문 
      사용 못한다. 삼향 연산자를 쓰도록 하자. return 값이 있는 조건문이기 떄문이다.*/}
      {
        // props 전송은 부모로 전송 못하고 옆 집으로도 전송 못한다. 패륜 ntr 불가능
        modal == true ? <Modal title = {title}글제목 = {글제목} /> : null
      } 
        </div>
      </div>
      </>
    } />
    <Route path='/Login' element={<Login />} />
    </Routes>
    </div>
  );
}

function Modal(props){
  return (
    <>
    <div className='modal'>
        <h4>{props.글제목[props.title]}</h4>
        <p>날짜</p>
        <p>상세내용</p>
        <button>글수정</button>
      </div>
      </>
  )
}

export default App;
