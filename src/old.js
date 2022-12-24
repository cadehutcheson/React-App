import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
//import 'firebase/compat/auth';
import 'firebase/compat/firestore';
//import 'firebase/firestore';
//import ReactEcharts from "echarts-for-react"11;
import * as echarts from 'echarts';
import { option } from './chart1';



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

function App() {

  
 
  // Declare a state variable to store the chart data list
  const [chartDataList, setChartDataList] = useState([]);

  // Use the useEffect hook to fetch data from the "chartData" collection in Firestore
  // and store it in the chartDataList state variable

  useEffect(() => {
    
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
      });
    // Return an unsubscribe function to clean up the snapshot listener when the component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const chart = echarts.init(document.getElementById('chart1'));
    chart.setOption(option);
  }, []);

/* Render a list of chart data documents by mapping over the chartDataList array*/
  return (
    <div>
      <div>
        <div id="chart1" style={{ width: '600px', height: '400px' }}></div>
      </div>
      <ul>
        {/*listing data - with known field titles*/}
        {chartDataList.map((chartDatum) => (
        <li key={chartDatum.id}>
          <p>Name: {chartDatum.name}</p>
          <p>Points: {chartDatum.points}</p>
        </li>
      ))}
      {/*listing data without knowing fields*/}
      {chartDataList.map((chartDatum) => (
          <li key={chartDatum.id}>
            {/* Use the Object.keys function to get an array of keys in the chart data document,
                and then map over the array to display each key-value pair as a separate paragraph */}
            {Object.keys(chartDatum).map((key) => (
              <p key={key}>{key}: {chartDatum[key]}</p>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
 
}

export default App;