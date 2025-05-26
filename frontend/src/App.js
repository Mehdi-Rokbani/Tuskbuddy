import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Acceuil from './pages/Acceuil';
import SignupForm from './pages/Signup';
import Login from './pages/Login';
import CreateProjectForm from './pages/Project-form';
import ProjectDetails from './pages/ProjectDetails';

import AllProjects from './pages/AllProjects';

import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import UserProjectsPage from './pages/MyProjects';
import ProfileUpdate from './pages/ProfileUpdate';
import TeamTable from './pages/TeamTable';
import FreelancerTasks from './pages/FreelancerTasks';
import FreelancerRequests from './pages/freelancerreq';
import NotFound from './pages/Notfound';
import TeamDashboard from './pages/TeamDashboard';


import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { user } = useContext(AuthContext)
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/acceuil' element={<Acceuil />}></Route>
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

          {user && (<Route path='/allprojects' element={<AllProjects />}></Route>)}
          {!user && (<Route path='/allprojects' element={<Login />}></Route>)}
          {user && (<Route path='/tt' element={<TeamTable />}></Route>)}
          {!user && (<Route path='/tt' element={<Login />}></Route>)}
          {user && (<Route path='/teamdash' element={<TeamDashboard />}></Route>)}
          {!user && (<Route path='/teamdash' element={<Login />}></Route>)}

          {user && (<Route path='/tasks' element={<FreelancerTasks />}></Route>)}
          {!user && (<Route path='/tasks' element={<Login />}></Route>)}

          {user && (<Route path='/freereq' element={<FreelancerRequests />}></Route>)}
          {!user && (<Route path='/freereq' element={<Login />}></Route>)}

          <Route path="*" element={<NotFound />} />

        </Routes>

      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>

  );
}

export default App;
