import React, { useRef, useEffect } from "react";
import Chart from 'chart.js/auto';

function Main(props) {
  const chartRef = useRef(null); // Canvas 엘리먼트에 대한 참조를 얻기 위한 useRef 훅 사용

  useEffect(() => {
    let myChart = null; // 차트 인스턴스를 저장할 변수

    // 차트 생성 및 렌더링
    const ctx = chartRef.current.getContext('2d');

    // 이전 차트가 존재하는 경우 제거
    if (myChart) {
      myChart.destroy();
    }

    // 새로운 차트 생성
    myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    // 컴포넌트가 언마운트될 때 차트 제거
    return () => {
      if (myChart) {
        myChart.destroy();
      }
    };
  }, []); // 컴포넌트가 마운트될 때 한 번만 실행될 useEffect 사용

  return (
    <>
      {/* Canvas 엘리먼트 추가 */}
      <div>
        <canvas ref={chartRef} id="myChart"></canvas>
      </div>
    </>
  );
}

export default Main;
