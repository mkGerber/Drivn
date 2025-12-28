import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Dashboard from './components/Dashboard';
import Home from './components/Home';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
};

export default App;
