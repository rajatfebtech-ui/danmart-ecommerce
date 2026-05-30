import './App.css'
import Header from './USER/components/Header'
import Footer from './USER/components/Footer'
import { Outlet } from 'react-router-dom'
import Navbar from './USER/components/NavBar/NavBar'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App
