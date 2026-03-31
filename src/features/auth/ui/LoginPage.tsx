import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const navigate = useNavigate()

  const handleExpertLogin = () => {
    navigate('/editor')
  }

  const handleSpecialistLogin = () => {
    navigate('/')
  }

  return (
    <div className="appFrame">
      <div className="topBar">
        <div className="topBarTitle">Выбор роли пользователя</div>
      </div>

      <div className="contentBox">
        <div style={{ maxWidth: 600, margin: '0 auto', paddingTop: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, color: '#2a2a2a' }}>
              Добро пожаловать!
            </h1>
            <p style={{ fontSize: 16, color: '#666', marginBottom: 0 }}>
              Выберите вашу роль для продолжения работы
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <button
              type="button"
              onClick={handleExpertLogin}
              style={{
                padding: '32px 24px',
                background: 'linear-gradient(135deg, rgba(226, 169, 99, 0.1) 0%, rgba(242, 197, 140, 0.15) 100%)',
                border: '2px solid rgba(226, 169, 99, 0.3)',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(226, 169, 99, 0.2) 0%, rgba(242, 197, 140, 0.25) 100%)'
                e.currentTarget.style.borderColor = 'rgba(226, 169, 99, 0.6)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(226, 169, 99, 0.1) 0%, rgba(242, 197, 140, 0.15) 100%)'
                e.currentTarget.style.borderColor = 'rgba(226, 169, 99, 0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, color: '#2a2a2a', marginBottom: 8 }}>
                Эксперт
              </div>
            </button>

            <button
              type="button"
              onClick={handleSpecialistLogin}
              style={{
                padding: '32px 24px',
                background: 'linear-gradient(135deg, rgba(100, 150, 200, 0.1) 0%, rgba(130, 170, 220, 0.15) 100%)',
                border: '2px solid rgba(100, 150, 200, 0.3)',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 150, 200, 0.2) 0%, rgba(130, 170, 220, 0.25) 100%)'
                e.currentTarget.style.borderColor = 'rgba(100, 150, 200, 0.6)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 150, 200, 0.1) 0%, rgba(130, 170, 220, 0.15) 100%)'
                e.currentTarget.style.borderColor = 'rgba(100, 150, 200, 0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, color: '#2a2a2a', marginBottom: 8 }}>
                Специалист
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}