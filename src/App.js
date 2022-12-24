import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import * as echarts from 'echarts';
import '../src/styles.css';

//API key and firebase configuration for authorizing read from db
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

//test connection
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

//get data from db for 1 chart
//chartDataList for testing/outputting to console
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

//get data from db for 2nd chart, slightly different method than getData for first chart
async function getData2(name, setYears, setPoints, setAssists){

  const db = firebase.firestore();
  const snapshot = await db.collection('timeData').where('name', '==', name).get();
  const data = snapshot.docs.map((doc) => doc.data());
  setYears(data.map((item) => item.years));
  setPoints(data.map((item) => item.points));
  setAssists(data.map((item) => item.assists));
  
  //console.log(testYears)
}


//App main function, returns html for front end
function App() {

  // state variable to store the chart data list
  const [chartDataList, setChartDataList] = useState([]);

  //storing currently selected button for chart 2
  const [selectedButton, setSelectedButton] = useState(xvalues[0]);
  
  //chart 2 data
  const [years, setYears] = useState([]);
  const [points, setPoints] = useState([]);
  const [assists, setAssists] = useState([]);

  //get selected button when one of the player buttons are pressed
  const handleButtonClick = (event) => {
    setSelectedButton(event.target.textContent);
    selectedName = event.target.textContent;
    console.log(selectedName);
  };

  //call function for getting chart 2 data when a player button is pressed
  useEffect(() => {
    getData2(selectedName, setYears, setPoints, setAssists);
    console.log(years, points, assists)
  }, [selectedButton]);

  //test in console when new data for chart 2 is obtained
  useEffect(() => {
    console.log("years changed:", years)
    console.log("points:", points)
    console.log("points[0]:", points[0])
  }, [years]);

  // useEffect hook to call getData 
  useEffect(() => {
    getData(chartDataList, setChartDataList);
  }, []);

 
  //create 1st chart
  useEffect(() => {
    //initialize echart
    const chart = echarts.init(document.getElementById('chart1'));
    
    
    //creating chart 1
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
      //xaxis made from all players in db
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
      //two bars for each player, points and assists
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
    chart.setOption(option); //create teh chart with option values 

    //resize font size for x axis names when window is resized so names fit 
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

    //disposing previously created chart so updated chart can render
    return () => {
      chart.dispose();
    };
    
  }, [xvalues]);

  //create 2nd chart
  useEffect(() => {
    //initialize echart
    const chart2 = echarts.init(document.getElementById('chart2'));

    //line graph
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
      //x axis is made of player seasons 
      xAxis: {
        
        boundaryGap: false,
        data: years[0]
      },
      yAxis: {
        type: 'value'
      },
      //2 lines, season points and assists
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

  //return html for app, styles gotten from styles.css file
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