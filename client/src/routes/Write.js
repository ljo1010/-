// 클라이언트 측 코드
import React, { useState, useEffect } from "react";
import axios from "axios";

function Write(props) {
  let [modal, setModal] = useState(false);
  let [글제목, 글제목변경] = useState([]);
  let [글내용, 글내용변경] = useState([]);
  let [따봉, 따봉변경] = useState([]);

  let [titleIndex, setTitleIndex] = useState(null);
  let [입력값, 입력값변경] = useState('');
  let [내용입력값, 내용입력값변경] = useState('');
  let [수정제목, set수정제목] = useState('');
  let [수정내용, set수정내용] = useState('');

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

  // 좋아요 클릭 시 서버에 요청을 보내는 함수
  const likePost = async (postId) => {
    try {
      // 게시글 ID를 이용하여 서버에 PUT 요청을 보냄
      const response = await axios.put(`/like/${postId}`);
      console.log(response.data); // 서버 응답 확인
    } catch (error) {
      console.error('Failed to like post:', error);
      // 에러 처리
    }
  };

  // 삭제 버튼 클릭 시 서버에 요청을 보내는 함수
  const deletePost = async (postId) => {
    try {
      // 게시글 ID를 이용하여 서버에 DELETE 요청을 보냄
      const response = await axios.delete(`/delpost/${postId}`);
      console.log(response.status); // 서버 응답 확인
      if (response.status === 204) {
        // 성공적으로 삭제되었을 때
        const copyTitles = [...글제목];
        const copyContent = [...글내용];
        copyTitles.splice(postId, 1);
        copyContent.splice(postId, 1);
        글제목변경(copyTitles);
        글내용변경(copyContent);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      // 에러 처리
    }
  };

  useEffect(() => {
    axios.get('/forum')
      .then(response => {
        const { data } = response;
        const titles = data.map(item => item.title);
        const contents = data.map(item => item.content);
        const likes = data.map(item => item.like);
        글제목변경(titles);
        글내용변경(contents);
        따봉변경(likes);
      })
      .catch(error => {
        console.error('Failed to fetch forum data:', error);
        // 에러 처리
      });
  }, []); // 빈 배열을 전달하여 컴포넌트가 마운트될 때 한 번만 실행

  return (
    <>
      <div className='main-bg'></div>
      <div className='container'>
        <div className='row'>
          {글제목.map(function (a, i) {
            return (
              <div className="list" key={i}>
                <h4 onClick={() => { setModal(true); setTitleIndex(i) }}>{글제목[i]}
                  <span onClick={(e) => { e.stopPropagation(); likePost(i) }}>👍</span>{따봉[i]}
                </h4>
                <p>{글내용[i]}</p>
                <p>{getCurrentDateTime()} 발행</p>
                <button onClick={() => {
                  deletePost(i);
                }}>삭제</button>
                <button onClick={() => {
                  // 글 수정 모달 열기
                  setModal(true);
                  setTitleIndex(i);
                  set수정제목(글제목[i]);
                  set수정내용(글내용[i]);
                }}>수정</button>

              </div>)
          })}
          <input onChange={(e) => { 입력값변경(e.target.value); console.log(입력값) }} />
          <textarea onChange={(e) => { 내용입력값변경(e.target.value); console.log(내용입력값) }} />
          <button onClick={() => {
            addPost(입력값, 내용입력값);
          }}>
            업로드</button>
          {modal && 
            <Modal 
              title={수정제목} 
              content={수정내용} 
              setModal={setModal} 
              editPost={editPost} 
              index={titleIndex} 
              set수정제목={set수정제목} 
              set수정내용={set수정내용} 
            />
          }
        </div>
      </div>
    </>
  );
}

function Modal(props) {
  return (
    <>
      <div className='modal'>
        <h4>{props.title}</h4>
        <p>{props.content}</p>
        <p>날짜</p>
        <p>상세내용</p>
        <input value={props.title} onChange={(e) => props.set수정제목(e.target.value)} />
        <textarea value={props.content} onChange={(e) => props.set수정내용(e.target.value)} />
        <button onClick={() => {
          // 수정된 글 정보 전달
          props.editPost(props.title, props.content, props.index);
          props.setModal(false);
        }}>저장</button>
        <button onClick={() => props.setModal(false)}>취소</button>
      </div>
    </>
  );
}

export default Write;
