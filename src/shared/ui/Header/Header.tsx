import { useNavigate } from 'react-router-dom'
import './Header.css'

type HeaderProps = {
  title: string
}

export function Header({ title }: HeaderProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__title">{title}</div>

        <button
          className="header__logout"
          onClick={handleLogout}
        >
          Выход
        </button>
      </div>
    </header>
  )
}