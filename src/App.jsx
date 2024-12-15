import './App.css'
import Login from './pages/Login'
import Home from './pages/Home'
// import TenderProposalEvaluator from './pages/temp'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CheckEligibility from './pages/CheckEligibility'
// import SelectBest from './pages/SelectBest'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/checkeligibility' element={<CheckEligibility />}/>
        {/* <Route path='/selectbest' element={<SelectBest />}/> */}
        {/* <Route path='/selectbest' element={<TenderProposalEvaluator />}/> */}
      </Routes>
    </Router>
  )
}

export default App
