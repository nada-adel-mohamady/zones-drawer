import './App.css';
import React from 'react';
import Map from './components/map.js'
import Login from './components/login.js'
import { BrowserRouter, Route, Routes } from 'react-router-dom';


function App() {
  return (

    <BrowserRouter>
      <Routes>

       <Route path='/map' element={<Map/>} />
       <Route path='/' element={<Login/>} />
  
      </Routes>
    </BrowserRouter>
      
  );
}

export default App;