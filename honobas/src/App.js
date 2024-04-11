import { Button, Navbar, Container, Nav } from 'react-bootstrap';
import './App.css';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, Link, useNavigate, Outlet} from 'react-router-dom';
import {Graph} from './routes/Grapg';
import Main from  './routes/Main.js'
import Write from './routes/Write';
import Login from './routes/Login.jsx';


function App() {

  let navigate = useNavigate();

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
    <Route path='/' element={<Main />} />
    <Route path='/Write' element={<Write />} />
    <Route path='/Login' element={<Login />} />
  </Routes>


    </div>
  );
}



export default App;
