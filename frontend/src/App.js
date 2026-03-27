import './App.css';
import React,{ createContext,useState } from 'react';
import { BrowserRouter as Router,Route,Routes } from 'react-router-dom';
import Login from './components/login';
import Home from './components/home';
import Alert from './components/alert';

// Export ThemeContext for other components to consume
export const ThemeContext = createContext();

function App() {
  // Add state for ThemeContext
  const [themeKey,setThemeKey] = useState("blue");

  return (
    <ThemeContext.Provider value={{ themeKey,setThemeKey }}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/alert" element={<Alert />} />
          </Routes>
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;