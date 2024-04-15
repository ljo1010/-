import React from 'react';
import { Button } from 'react-bootstrap';
import { Routes, Route, Link, useNavigate, Outlet} from 'react-router-dom';
import WriteEdit from './WriteEdit';

function Write() {
  const navigate = useNavigate();

  return (
    <>
      <div className='main-bg'></div>
      <div className='container'>
        <div className='row d-flex justify-content-center'>
          {/* 여기에 내용을 입력하세요 */}
          <div>
            <Button onClick={()=>{navigate('/WriteEdit')}} className='btn-primary'>글쓰기 버튼</Button>
          </div>
        </div>
      </div>
    </>
  );
}

function WriteRoutes() {
  return (
    <div>
      <Routes>
        <Route path='/WriteEdit' element={<WriteEdit />} />
      </Routes>
    </div>
  );
}

export default Write;
