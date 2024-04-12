import React, { useRef, useEffect } from "react";
import Chart from 'chart.js/auto';
import createCirclePackingChart          from './createCirclePackingChart';


function Main(props) {
  const chartRef = useRef(null); // Canvas 엘리먼트에 대한 참조를 얻기 위한 useRef 훅 사용

  useEffect(() => {
    let myChart = null; // 차트 인스턴스를 저장할 변수

    // const data = [
    //     { id: "flare.analytics.cluster.AgglomerativeCluster", value: 3938 },
    //     { id: "flare.analytics.cluster.CommunityStructure", value: 3812 },
    //     { id: "flare.analytics.cluster.HierarchicalCluster", value: 6714 },
    //     // 추가 데이터
    //   ];

    const initialData = [
        { id: "flare.analytics.cluster.AgglomerativeCluster", value: 2550 },
        { id: "flare.analytics.cluster.CommunityStructure", value: 1450 },
        { id: "flare.analytics.cluster.HierarchicalCluster", value: 1350 },
        { id: "flare.analytics.cluster.test1", value: 1250 },
        { id: "flare.analytics.cluster.test2", value: 1150 },
        { id: "flare.analytics.cluster.test3", value: 550 },
        { id: "flare.analytics.cluster.test4", value: 450 },
        { id: "flare.analytics.cluster.test5", value: 350 },
        { id: "flare.analytics.cluster.test6", value: 250 },
      ];
      
      const maxDataValue = 5000;
      const newData = [];
      
      let currentValue = 50;
      const increment = 50; // 각 반복마다 증가할 값
      
      while (currentValue <= maxDataValue) {
        initialData.forEach((item, index) => {
          // 각 항목의 인덱스를 이용하여 id를 고유하게 생성
          const uniqueId = `${item.id}_${index}`;
          newData.push({ ...item, id: uniqueId, value: currentValue });
        });
        currentValue += increment;
    }

    // // 차트 생성 및 렌더링
    // const ctx = chartRef.current.getContext('2d');

    // // 이전 차트가 존재하는 경우 제거
    // if (myChart) {
    //   myChart.destroy();
    // }

    // // 새로운 차트 생성
    // myChart = new Chart(ctx, {
    //   type: 'bar',
    //   data: {
    //     labels: ['박태훈1', '박태훈2', '박태훈3', '박태훈4', '박태훈5', '박태훈6'],
    //     datasets: [{
    //       label: '후노바스가 이번 선거에 투표한 사람번호',
    //       data: [12, 19, 3, 5, 2, 3],
    //       borderWidth: 0.5
    //     }]
    //   },
    //   options: {
    //     scales: {
    //       y: {
    //         beginAtZero: true
    //       }
    //     }
    //   }
    // });
    // 
    // // 컴포넌트가 언마운트될 때 차트 제거
    // return () => {
    //   if (myChart) {
    //     myChart.destroy();
    //   }
    // };

    // const chartContainer = chartRef.current;
    // if (chartContainer) {
    //   const chart = createCirclePackingChart(chartContainer);
    //   myChart = chart.scales.color;
    // }

    const chartNode = createCirclePackingChart(initialData);

    // 생성된 차트 노드를 화면에 추가합니다.
    document.getElementById("chart-container").appendChild(chartNode);

  }, []); // 컴포넌트가 마운트될 때 한 번만 실행될 useEffect 사용

  return (
    <>
      {/* Canvas 엘리먼트 추가 */}
      <div id="chart-container">
        {/* <canvas ref={chartRef} id="myChart"></canvas> */}
        <div ref={chartRef}></div>
      </div>
    </>
  );
}

export default Main;