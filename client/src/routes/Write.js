import React, { useState } from "react";
import { NavLink, useParams } from "react-router-dom";

function Write(props) {
  let [modal, setModal] = useState(false);
  let [글제목, 글제목변경] = useState([]);
  let [글내용, 글내용변경] = useState([]);
  let [따봉, 따봉변경] = useState([]);

  let [titleIndex, setTitleIndex] = useState(null);
  let [입력값, 입력값변경] = useState('');
  let [내용입력값, 내용입력값변경] = useState('');

  const addPost = (title, content) => {
    let copyTitles = [...글제목];
    let copyContent = [...글내용];
    let copyLikes = [...따봉];
    copyTitles.unshift(title);
    copyContent.unshift(content);
    copyLikes.unshift(0);
    글제목변경(copyTitles);
    글내용변경(copyContent);
    따봉변경(copyLikes);
  };

  // 현재 날짜와 시간을 표시하는 함수
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`;
  };

  // 글 수정 함수
  const editPost = (title, content, index) => {
    let copyTitles = [...글제목];
    let copyContent = [...글내용];
    copyTitles[index] = title;
    copyContent[index] = content;
    글제목변경(copyTitles);
    글내용변경(copyContent);
  };

  return (
    <>
      <div className='main-bg'></div>
      <div className='container'>
        <div className='row'>
          {글제목.map(function (a, i) {
            return (
              <div className="list" key={i}>
                <h4 onClick={() => { setModal(true); setTitleIndex(i) }}>{글제목[i]}
                  <span onClick={(e) => { e.stopPropagation(); let copy = [...따봉]; copy[i] = copy[i] + 1; 따봉변경(copy) }}>👍</span>{따봉[i]}
                </h4>
                <p>{글내용[i]}</p>
                <p>{getCurrentDateTime()} 발행</p>
                <button onClick={() => {
                  let copyTitle = [...글제목];
                  let copyContent = [...글내용];
                  copyTitle.splice(i, 1);
                  copyContent.splice(i, 1);
                  글제목변경(copyTitle);
                  글내용변경(copyContent);
                }}>삭제</button>
                <button onClick={() => {
                  // 글 수정 모달 열기
                  setModal(true);
                  setTitleIndex(i);
                }}>수정</button>
              </div>)
          })}
          <input onChange={(e) => { 입력값변경(e.target.value); console.log(입력값) }} />
          <textarea onChange={(e) => { 내용입력값변경(e.target.value); console.log(내용입력값) }} />
          <button onClick={() => {
            addPost(입력값, 내용입력값);
          }}>
            업로드</button>
          {modal && <Modal title={글제목[titleIndex]} content={글내용[titleIndex]} setModal={setModal} editPost={editPost} index={titleIndex} />}
        </div>
      </div>
    </>
  );
}

function Modal(props) {
  const [수정제목, set수정제목] = useState(props.title);
  const [수정내용, set수정내용] = useState(props.content);

  return (
    <>
      <div className='modal'>
        <h4>{props.title}</h4>
        <p>{props.content}</p>
        <p>날짜</p>
        <p>상세내용</p>
        <input value={수정제목} onChange={(e) => set수정제목(e.target.value)} />
        <textarea value={수정내용} onChange={(e) => set수정내용(e.target.value)} />
        <button onClick={() => {
          // 수정된 글 정보 전달
          props.editPost(수정제목, 수정내용, props.index);
          props.setModal(false);
        }}>저장</button>
        <button onClick={() => props.setModal(false)}>취소</button>
      </div>
    </>
  );
}

export default Write;
