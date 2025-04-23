import {BrowserRouter,Routes,Route} from 'react-router-dom';
import Acceuil from './pages/Acceuil';
import SignupForm from './pages/Signup';

function App() {
  return (
   <BrowserRouter>
      <Routes>
        <Route path='/' element={<Acceuil/>}></Route>
        <Route path='/Sign-up' element={<SignupForm/>}></Route>
      </Routes>
   </BrowserRouter>
);
}

export default App;
