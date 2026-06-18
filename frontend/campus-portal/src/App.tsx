import Landing from './pages/landing'
import { BrowserRouter, Routes, Route } from "react-router-dom";
export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
        
        {/* Here is the missing route! */}
        <Route path="/" element={<Landing />} />
        
      </Routes>
        </BrowserRouter>
      </>
  )
}