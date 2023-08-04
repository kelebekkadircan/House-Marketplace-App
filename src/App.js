import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/PrivateRoute';
import Explore from './pages/Explore';
import Offers from './pages/Offers';
import ForgatPassword from './pages/ForgatPassword';
import Profile from './pages/Profile';
import SingIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Navbar from './components/Navbar';



function App() {



  return (
    <>
      <Router>

        <Routes>
          <Route path='/' element={<Explore />} />
          <Route path='/offers' element={<Offers />} />
          <Route path='/profile' element={<PrivateRoute />} >
            <Route path='/profile' element={<Profile />} />

          </Route>
          <Route path='/sign-in' element={<SingIn />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/forgot-password' element={<ForgatPassword />} />
        </Routes>
        <Navbar />
      </Router>

      <ToastContainer />

    </>
  );
}

export default App;
