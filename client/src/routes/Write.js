import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from 'react-bootstrap';

function Write (props) {
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

  const addPost = (title, content) => {
    axios.post("/newpost", {
      title,
      content,
    })
      .then(response => {
        fetchPost();
      })
      .catch(error => {
        console.error("게시물 작성 중 오류가 발생했습니다:", error);
      });
      fetchPost();
  };

  const editPost = (title, content, postId) => {
    axios.put('/editpost', {
      postID: postId,
      title: title,
      content: content
    })
      .then(response => {
        fetchPost();
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
    fetchPost();
  };

  const deletePost = async (postId) => {
    try {
      const response = await axios.delete(`/delpost/${postId}`);
      console.log(response.status);
      if (response.status === 204) {
        fetchPost();
      } else {
        console.error('Failed to delete post: not 204');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const fetchPost = async() =>{
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
  }

  useEffect(() => {
    fetchPost();
  }, []);

  return (
    <>
      <div className='main-bg'></div>
      <div className='container'>
        <div className='row'>
        {글제목.map(function (a, i) {
    return (
      <div className="list" key={i} style={{ paddingBottom: '10px' }}>
        <h4 onClick={() => { setModal(true); setTitleIndex(i) }}>{글제목[i]}
          <span onClick={(e) => { e.stopPropagation(); likePost(postIdList[i]) }}>👍</span>{따봉[i]}
        </h4>
        <p>{글내용[i]}</p>
        <p>글쓴이: {작성자[i]}</p>
        <Button style={{ marginRight: '10px' }} onClick={() => { deletePost(postIdList[i]) }}>삭제</Button>
        <Button onClick={() => { setModal(true); setTitleIndex(i); set수정제목(글제목[i]); set수정내용(글내용[i]); }}>수정</Button>
      </div>
)
          })}
          <input 
  onChange={(e) => { 입력값변경(e.target.value); console.log(입력값) }} 
  style={{
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginBottom: '10px'
  }}
/>

<textarea 
  onChange={(e) => { 내용입력값변경(e.target.value); console.log(내용입력값) }} 
  style={{
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginBottom: '10px'
  }}
/>

        </div>
          <Button className="" onClick={() => { addPost(입력값, 내용입력값); }}>
            업로드
          </Button>
          {modal && 
            <Modal 
              title={글제목}
              content={글내용}
              writer={작성자}
              setModal={setModal}
              editPost={editPost}
              index={titleIndex}
              postId={postIdList[titleIndex]}
            />
          }
      </div>
    </>
  );
}

function Modal(props) {
  // axios.get("/timeme").then(props.postId)
  return (
    <>
      <div className='custom_modal'>
        <h4>{props.title[props.index]}</h4>
        <p>{props.content[props.index]}</p>
        <p>글쓴이: {props.writer[props.index]}</p>
      </div>
    </>
  );
}

export default Write;
