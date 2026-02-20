import "./App.css";
import React from "react";
import Home_page from "./pages/Home_page";
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import Login_page from "./pages/login_page";
import Register_page from "./pages/register_page";


function App(){
  return (
    <main>
      <BrowserRouter>
      <Routes>
        <Route path = "/" element = {<Home_page/>} />
        <Route path = "/login" element = {<Login_page />} />
        <Route path = "/register" element = {<Register_page />} />
        </Routes>
      </BrowserRouter>
      <Toaster/>
    </main>
  )
}

export default App;