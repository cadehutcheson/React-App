# Code Exam - React App

This repo is for the React.js portion of my code exam.

This app is designed to display two charts(made from Apache Echarts) with data received from a database(Google Firestore).

The first chart is a bar chart that displays the total career point and assist values for NBA players. The react app obtains all the documents, each containing 3 values(name, assists, points), from the ‘chartData’ collection of the database and creates the chart. The chart is updated in real time if documents are added/removed from the database. The app sorts the data so that players are displayed in ascendng order according to their point total. 

The second chart is a line graph that plots a player’s season totals for points and assists. The app creates buttons for all players entered into the database so a graph can be rendered for a selected player. Within the 'timeData' collection of the database, the app finds the document with the "name" field matching the name of the selected player, and then fetches the 3 arrays(seasons, points, assists) within that document. 
