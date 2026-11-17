import { NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">URL Safety Checker</NavLink>
      <ul className="navbar-links">
        <li><NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink></li>
        <li><NavLink to="/checker" className={({isActive}) => isActive ? 'active' : ''}>Checker</NavLink></li>
        <li><NavLink to="/dfa" className={({isActive}) => isActive ? 'active' : ''}>DFA</NavLink></li>
        <li><NavLink to="/history" className={({isActive}) => isActive ? 'active' : ''}>History</NavLink></li>
        <li><NavLink to="/about" className={({isActive}) => isActive ? 'active' : ''}>About</NavLink></li>
      </ul>
    </nav>
  )
}

export default Navbar
