import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const User = {
    email: 'test1234@example.com',
    pw: 'test1234@@@'
}

function Login() {
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    
    const [emailValid, setEmailValid] = useState(false);
    const [pwValid, setPwValid] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(true);

    let navigate = useNavigate();

    useEffect(() => {
        if (emailValid && pwValid && email && pw) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [emailValid, pwValid, email, pw]);

    const handleEmail = (e) => {
        setEmail(e.target.value);
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailValid(regex.test(e.target.value));
    };

    const handlePassword = (e) => {
        setPw(e.target.value);
        const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        setPwValid(regex.test(e.target.value));
    };

    const onClickConfirmButton = () => {
        if (email === User.email && pw === User.pw) {
            alert('로그인에 성공했습니다.');
            // 로그인 성공 시 Main 화면으로 이동
            navigate('/main');
        } else {
            alert('등록되지 않은 회원입니다.');
        }
    }

    const handleCloseButton = () => {
        // 닫기 버튼을 눌렀을 때 Main 화면으로 이동
        navigate('/main');
    }

    return (
        <div className="page">
            <div className="titleWrap">
                이메일과 비밀번호를<br/>입력해주세요
            </div>

            <div className="contentWrap">
                <div className="inputTitle">이메일 주소</div>
                <div className="inputWrap">
                    <input 
                        type="text"
                        className="input" 
                        placeholder="1234@gmail.com"
                        value={email} 
                        onChange={handleEmail}
                    />
                </div>
                <div className="errorMessageWrap">
                    {!emailValid && email.length > 0 && (
                        <div>올바른 이메일을 입력해주세요.</div>
                    )}
                </div>

                <div style={{ marginTop: "26px" }} className="inputTitle">
                    비밀번호
                </div>
                <div className="inputWrap">
                    <input 
                        type="password"
                        className="input"
                        placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                        value={pw}
                        onChange={handlePassword}
                    />
                </div>
                <div className="errorMessageWrap">
                    {!pwValid && pw.length > 0 && (
                        <div>영문, 숫자, 특수문자 포함 8자 이상을 입력해주세요.</div>
                    )}
                </div>
            </div>
            <div>
                <button 
                    disabled={buttonDisabled} 
                    className="bottomButton"
                    onClick={onClickConfirmButton}
                >
                    확인
                </button>
                <button
                    className="bottomButton"
                    onClick={handleCloseButton}
                >
                    닫기
                </button>
            </div>
           
        </div>
    );
}
export default Login;