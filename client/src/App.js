
import { Button, Navbar, Container, Nav } from 'react-bootstrap';
import './App.css';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, Link, useNavigate, Outlet} from 'react-router-dom';
import Main from  './routes/Main.js'
import Write from './routes/Write.js';
import Login from './routes/Login.jsx';
import axios from 'axios';

function App() {

  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  
  const handleLogout = async () => {
    try {
      const response = await axios.get('/logout');
      console.log('Logout successful:', response);
      alert("로그아웃 성공✅")
      // 로그아웃 성공 처리
    } catch (error) {
      console.error('Logout failed:', error);
      alert("로그아웃 실패❌")
      // 로그아웃 실패 처리
    }
  };
  
  
  console.log(isLogin);
  function handleLogin(){
    setIsLogin(isLogin => !isLogin);
  }

  let buttonToggle = ' 로그인';
  if(isLogin === true){
    buttonToggle ='로그아웃';
  }
  return (
    <div>

      <Navbar bg="dark" variant="dark">
        <Navbar.Brand href="#home">CroClo🌚</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link onClick={()=>{navigate('/')}}>메인🏠</Nav.Link>
          <Nav.Link onClick={()=>{navigate('/Write')}}>글쓰기📝</Nav.Link>  
        </Nav>

        <Nav>
        {isLogin ? (
  <Nav.Link>
    <Button onClick={handleLogout} className="text-3xl font-bold underline">로그인</Button>
  </Nav.Link>
) : (
  <Nav.Link className="login-link" onClick={()=>{navigate('/Login')}}>
    <Button variant="outline-light" onClick={handleLogin}>{buttonToggle}</Button>
  </Nav.Link>
)}
        </Nav>
      </Navbar>    


      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/Write' element={<Write />} />
        <Route path='/Login' element={<Login />} />
      </Routes>
    </div>
  );
}



export default App;