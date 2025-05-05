import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Acceuil from './pages/Acceuil';
import SignupForm from './pages/Signup';
import Login from './pages/Login';
import CreateProjectForm from './pages/Project-form';
import ProjectDetails from './pages/ProjectDetails';
import MyTeamProjects from './pages/TeamProjects';
import AllProjects from './pages/AllProjects';

import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import UserProjectsPage from './pages/MyProjects';
import ProfileUpdate from './pages/ProfileUpdate';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { user } = useContext(AuthContext)
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Acceuil />}></Route>
          <Route path='/Sign-up' element={<SignupForm />}></Route>
          <Route path='/login' element={<Login />}></Route>
          {user && (<Route path='/projectfrom' element={<CreateProjectForm />}></Route>)}
          {!user && (<Route path='/projectfrom' element={<Login />}></Route>)}
          {user && (<Route path='/project/:id' element={<ProjectDetails />}></Route>)}
          {!user && (<Route path='/project/:id' element={<Login />}></Route>)}
          {user && (<Route path='/myproject' element={<UserProjectsPage />}></Route>)}
          {!user && (<Route path='/myproject' element={<Login />}></Route>)}
          {user && (<Route path='/info' element={<ProfileUpdate />}></Route>)}
          {!user && (<Route path='/info' element={<Login />}></Route>)}
          {user && (<Route path='/teams' element={<MyTeamProjects />}></Route>)}
          {!user && (<Route path='/teams' element={<Login />}></Route>)}
          {user && (<Route path='/allprojects' element={<AllProjects />}></Route>)}
          {!user && (<Route path='/allprojects' element={<Login />}></Route>)}


        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </>

  );
}

export default App;
