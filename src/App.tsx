import { Toaster } from 'react-hot-toast';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Summary } from './pages/Summary';
import { Tours } from './pages/Tours';
import { Profile } from './pages/Profile';
import { FAQ } from './pages/complements/FAQ';
import { Careers } from './pages/complements/Careers';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="careers" element={<Careers />} />
          <Route
            path="profile"
            element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            }
          />
          <Route
            path="tours"
            element={
              <AuthGuard>
                <Tours />
              </AuthGuard>
            }
          />
          <Route
            path="summary"
            element={
              <AuthGuard>
                <Summary />
              </AuthGuard>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;