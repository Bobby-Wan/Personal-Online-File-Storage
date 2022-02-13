import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import Header from "./components/header";
import ErrorPage from "./pages/notFound";

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Routes>
          <Route exact path="/" element={<HomePage />} />
          <Route exact path="login" element={<LoginPage />} />
          <Route exact path="signup" element={<RegisterPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
