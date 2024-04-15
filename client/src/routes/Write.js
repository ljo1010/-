// 클라이언트 측 코드
import React, { useState, useEffect } from "react";
import axios from "axios";

function Write(props) {
  let [modal, setModal] = useState(false);
  let [글제목, 글제목변경] = useState([]);
  let [글내용, 글내용변경] = useState([]);
  let [따봉, 따봉변경] = useState([]);
  let [작성자, 작성자변경] = useState([]);
  let [postIdList, setPostIdList] = useState([]);

  let [titleIndex, setTitleIndex] = useState(null);
  let [입력값, 입력값변경] = useState('');
  let [내용입력값, 내용입력값변경] = useState('');
  let [수정제목, set수정제목] = useState('');
  let [수정내용, set수정내용] = useState('');

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

  const addPost = (title, content) => {
    axios.post("/newpost", {
      title,
      content,
    })
      .then(response => {
        window.location.reload();
      })
      .catch(error => {
        console.error("게시물 작성 중 오류가 발생했습니다:", error);
      });
    window.location.reload();
  };

  const editPost = (title, content, postId) => {
    axios.put('/editpost', {
      postID: postId,
      title: title,
      content: content
    })
      .then(response => {
        window.location.reload();
      })
      .catch(error => {
        console.error("게시물 수정 중 오류가 발생했습니다:", error);
      });
  };

  const likePost = async (postId) => {
    try {
      const response = await axios.put(`/like/${postId}`);
      console.log(response.data);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
    window.location.reload();
  };

  const deletePost = async (postId) => {
    try {
      const response = await axios.delete(`/delpost/${postId}`);
      console.log(response.status);
      if (response.status === 204) {
        window.location.reload();
      } else {
        console.error('Failed to delete post: not 204');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  useEffect(() => {
    axios.get('/forum')
      .then(response => {
        const { data } = response;
        const postId = data.map(item => item._id);
        setPostIdList(postId);
        const titles = data.map(item => item.title);
        const contents = data.map(item => item.content);
        const likes = data.map(item => item.like);
        const writers = data.map(item => item.writer);
        글제목변경(titles);
        글내용변경(contents);
        따봉변경(likes);
        작성자변경(writers);
      })
      .catch(error => {
        console.error('Failed to fetch forum data:', error);
      });
  }, []);

  return (
    <>
      <div className='main-bg'></div>
      <div className='container'>
        <div className='row'>
          {글제목.map(function (a, i) {
            return (
              <div className="list" key={i}>
                <h4 onClick={() => { setModal(true); setTitleIndex(i) }}>{글제목[i]}
                  <span onClick={(e) => { e.stopPropagation(); likePost(postIdList[i]) }}>👍</span>{따봉[i]}
                </h4>
                <p>{글내용[i]}</p>
                <p>글쓴이: {작성자[i]}</p>
                <button onClick={() => { deletePost(postIdList[i]) }}>삭제</button>
                <button onClick={() => { setModal(true); setTitleIndex(i); set수정제목(글제목[i]); set수정내용(글내용[i]); }}>수정</button>
              </div>)
          })}
          <input onChange={(e) => { 입력값변경(e.target.value); console.log(입력값) }} />
          <textarea onChange={(e) => { 내용입력값변경(e.target.value); console.log(내용입력값) }} />
          <button onClick={() => { addPost(입력값, 내용입력값); }}>
            업로드
          </button>
          {modal && 
            <Modal 
              title={수정제목}
              content={수정내용}
              setModal={setModal}
              editPost={editPost}
              index={titleIndex}
              postId={postIdList[titleIndex]}
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
        <button onClick={() => { props.editPost(props.title, props.content, props.postId); props.setModal(false); }}>저장</button>
        <button onClick={() => props.setModal(false)}>취소</button>
      </div>
    </>
  );
}

export default Write;