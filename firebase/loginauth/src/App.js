
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import FirebaseLogin from './login';
import FirebaseSignup from './sigin';

function App() {
  return (
    <div className='app'>
        <BrowserRouter>
      {/* Navigation */}
      <nav>
        {/* <Link to="/">Home</Link> |{" "}
        <Link to="/">About</Link> |{" "}
        <Link to="/">Contact</Link> */}
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<FirebaseLogin />} />
        <Route path="/sigin" element={<FirebaseSignup />} />
        {/* <Route path="/" element={<Contact />} /> */}
      </Routes>
    </BrowserRouter>
    </div>
    
  );
}

export default App;
