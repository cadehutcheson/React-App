import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import * as echarts from 'echarts';
import '../src/styles.css';


const firebaseConfig = {
  apiKey: "AIzaSyAqIk5Izfobu_VWoxMjKA0DkIyyDQOgv7o",
  authDomain: "codeexamdata.firebaseapp.com",
  databaseURL: "https://codeexamdata-default-rtdb.firebaseio.com",
  projectId: "codeexamdata",
  storageBucket: "codeexamdata.appspot.com",
  messagingSenderId: "390841485595",
  appId: "1:390841485595:web:0ca26dbd011d8f8e2a2bbe",
  measurementId: "G-6X5N3ZVG91"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

if (firebase.app()) {
  console.log('Firebase SDK is initialized');
} else {
  console.log('Firebase SDK is not initialized');
}


//chart 1
var option;
var xvalues = [];
var y1values = [];
var y2values = [];

//chart 2
var option2;
var selectedName = '';


async function getData(chartDataList, setChartDataList){

  const unsubscribe = firebase.firestore()
      .collection('chartData')
      .onSnapshot((snapshot) => {
        // Create an empty array to store the chart data documents
        const data = [];
        // Iterate over the snapshot and add each document to the array
        snapshot.forEach((doc) => {
          data.push({ ...doc.data(), id: doc.id });
        });
        // Update the chartDataList state variable with the array of chart data documents
        setChartDataList(data);
        data.sort((a,b) => a.points - b.points)
        xvalues = data.map(item => item.name)
        y1values = data.map(item => item.points)
        y2values = data.map(item => item.assists)
        console.log(y1values, y2values)
      });
      
      
    // Return an unsubscribe function to clean up the snapshot listener when the component unmounts
    return () => unsubscribe();

}

async function getData2(name, setYears, setPoints, setAssists){

  const db = firebase.firestore();
  const snapshot = await db.collection('timeData').where('name', '==', name).get();
  const data = snapshot.docs.map((doc) => doc.data());
  setYears(data.map((item) => item.years));
  setPoints(data.map((item) => item.points));
  setAssists(data.map((item) => item.assists));
  
  //console.log(testYears)
}



function App() {

  // Declare a state variable to store the chart data list
  const [chartDataList, setChartDataList] = useState([]);

  const [selectedButton, setSelectedButton] = useState(xvalues[0]);
  
  const [years, setYears] = useState([]);
  const [points, setPoints] = useState([]);
  const [assists, setAssists] = useState([]);

  const handleButtonClick = (event) => {
    setSelectedButton(event.target.textContent);
    selectedName = event.target.textContent;
    console.log(selectedName);
  };

  useEffect(() => {
    getData2(selectedName, setYears, setPoints, setAssists);
    console.log(years, points, assists)
  }, [selectedButton]);

  useEffect(() => {
    console.log("years changed:", years)
    console.log("points:", points)
    //years.forEach(value => timeXvalues.push(value))
    //points.forEach(value => timeY1values.push(value))
    console.log("points[0]:", points[0])
  }, [years]);

  // Use the useEffect hook to fetch data from the "chartData" collection in Firestore
  // and store it in the chartDataList state variable
  useEffect(() => {
    getData(chartDataList, setChartDataList);
  }, []);

 
  //create 1st chart
  useEffect(() => {

    const chart = echarts.init(document.getElementById('chart1'));
    
    
    
    option = {
      
      title: {
        
        text: 'NBA Player Total Career \nRegular Season Points & Assists',
        
        top: '3%',
        left: '2%',
        textStyle: {
          fontSize: 20,
          color: 'black',
        }

      },
      grid:{
        top: '20%',
        
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['Points', 'Assists'],
        top: '3%',
        right: '2%'
      },
      xAxis: {
        type: 'category',
        data: xvalues,
        axisLabel: {
          fontSize: 12,
          formatter: function(value){
            const space = value.indexOf(' ')
              return value.slice(0,space) + '\n' + value.slice(space + 1);
          }
           
        },
      },
      yAxis: {
        type: 'value',
       
      },
      series: [
        {
          data: y1values,
          type: 'bar',
          name: 'Points',
        
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
          }
        },
        {
          data: y2values,
          type: 'bar',
          name: 'Assists',
          
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
          }
        },
      ],
      
    };
    chart.setOption(option);

    window.addEventListener('resize', () =>{
      const width = window.innerWidth;
      console.log(width)
      if(width < 800){
        chart.setOption({ xAxis: {axisLabel: {fontSize : 8}}})
      }
      else if(width < 1000){
        chart.setOption({ xAxis: {axisLabel: {fontSize : 10}}})
      }
      else if (width >=1000){chart.setOption({ xAxis: {axisLabel: {fontSize : 12}}})}
      chart.resize();
    });


    return () => {
      chart.dispose();
    };
    
  }, [xvalues]);

  //create 2nd chart
  useEffect(() => {

    const chart2 = echarts.init(document.getElementById('chart2'));
    //const chartElement = chart2.getDom();
    //const boundRectangle = chartElement.getBoundingClientRect();
    
    option2 = {
      title: {
        text: "Season Points & Assist Totals:\n" + selectedName,
        top: '3%',
        left: '2%',
        textStyle: {
          fontSize: 16,
          color: 'black',
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['Points', 'Assists'],
        top: '3%',
        right: '2%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        
        boundaryGap: false,
        data: years[0]
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Assists',
          type: 'line',
          data: points[0]
        },
        {
          name: 'Points',
          type: 'line',
          data: assists[0]
        },
      
      ],

    };
    chart2.setOption(option2);

    window.addEventListener('resize', () =>{
      chart2.resize();
    });


    return () => {
      chart2.dispose();
    };
    
  }, [points]);

/* Render a list of chart data documents by mapping over the chartDataList array*/
  return (
    
    <div className='body'>
      <div style={{  display: 'flex', justifyContent: 'center'}}>
        <div  id='div1'>
          <div className="chart-class" id="chart1" ></div>
        </div>
      </div>

      <div  id="btns1" style={{ }}> 
        <h3>Select Player:&nbsp;</h3> 
        {xvalues.map((xvalues) => (
          <button id='btns2' key={xvalues} onClick={handleButtonClick}>{xvalues}</button>))}
      </div>
      <div id='div2'>
        <div className="chart-class" id="chart2"></div>
      </div>
    </div>
    
  );
 
}

export default App;