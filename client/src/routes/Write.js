import React, { useState } from "react";
import { NavLink, useParams } from "react-router-dom";

function Write(props) {
  let [modal, setModal] = useState(false);
  let [글제목, 글제목변경] = useState([]);
  let [따봉, 따봉변경] = useState([]); // 따봉 상태를 글제목과 같은 길이의 배열로 초기화

  let [title, setTitle] = useState(2);
  let [입력값, 입력값변경] = useState('');

  // 글 추가 함수
  const addPost = (title) => {
    let copyTitles = [...글제목];
    let copyLikes = [...따봉]; // 추천수 상태도 같은 길이로 복사
    copyTitles.unshift(title);
    copyLikes.unshift(0); // 새로운 글의 추천수를 0으로 초기화
    글제목변경(copyTitles);
    따봉변경(copyLikes);
  };

  return (
    <>
      <div className='main-bg'></div>
      <div className='container'>
        <div className='row'>
          {글제목.map(function (a, i) {
            return (
              <div className="list" key={i}>
                <h4 onClick={() => { setModal(!modal); setTitle(i) }}>{글제목[i]}
                  <span onClick={(e) => { e.stopPropagation(); let copy = [...따봉]; copy[i] = copy[i] + 1; 따봉변경(copy) }}>👍</span>{따봉[i]}
                </h4>
                <p>2월 18일 발행</p>
                <button onClick={() => {
                  let copy = [...글제목]
                  copy.splice(i, 1);
                  글제목변경(copy);
                }}>삭제</button>
              </div>)
          })}
          <input onChange={(e) => { 입력값변경(e.target.value); console.log(입력값) }} />
          <button onClick={() => {
            addPost(입력값); // 새로운 글 추가 시 추천수 0으로 초기화
          }}>업로드</button>
          {modal && <Modal title={title} 글제목={글제목} />} {/* modal 상태가 true이면 Modal 컴포넌트 렌더링 */}
        </div>
      </div>
    </>
  );
}

function Modal(props) {
  return (
    <>
      <div className='modal'>
        <h4>{props.글제목[props.title]}</h4>
        <p>날짜</p>
        <p>상세내용</p>
        <button>글수정</button>
      </div>
    </>
  );
}

export default Write;