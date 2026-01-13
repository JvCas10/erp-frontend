import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tenant, setTenant] = useState('');
  const [tenants, setTenants] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  const { loadTheme } = useTheme(); // ⭐ Importar loadTheme

  // ⭐ COLORES FIJOS PARA LOGIN (no dependen del tenant)
  const LOGIN_PRIMARY_COLOR = '#667eea';
  const LOGIN_SECONDARY_COLOR = '#764ba2';

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/admin/tenants`);
        setTenants(data.tenants || []);
        if (data.tenants?.length === 1) {
          setTenant(data.tenants[0].subdomain);
        }
      } catch (error) {
        console.error('Error cargando tenants:', error);
        setTenants([
          { subdomain: 'prueba', empresa_nombre: 'Tienda Prueba' },
          { subdomain: 'negocio2', empresa_nombre: 'Negocio 2' }
        ]);
      }
    };
    fetchTenants();
  }, []);

  const createGradient = () => {
    return `linear-gradient(135deg, ${LOGIN_PRIMARY_COLOR} 0%, ${LOGIN_SECONDARY_COLOR} 100%)`;
  };

  const adjustBrightness = (hex, percent) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      // ⭐ Guardar tenant ANTES de hacer login
      localStorage.setItem('tenant', tenant);

      const response = await fetch(`${API_URL}/auth/login?tenant=${tenant}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el inicio de sesión');
      }

      setMessage('¡Inicio de sesión exitoso!');
      onLoginSuccess(data.token);

      // ⭐ CARGAR TEMA DEL TENANT ANTES DE NAVEGAR
      await loadTheme();

      // Navegar después de cargar el tema
      navigate('/admin/inventario');

    } catch (error) {
      setMessage(error.message);
      console.error('Error de login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: createGradient(),
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    padding: '20px',
  };

  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: '8px',
    letterSpacing: '-0.5px'
  };

  const subtitleStyle = {
    fontSize: '14px',
    color: '#718096',
    textAlign: 'center',
    marginBottom: '32px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: '6px'
  };

  const inputStyle = {
    width: '100%',
    height: '48px',
    padding: '0 16px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    color: '#2d3748',
    outline: 'none',
    transition: 'all 0.2s ease',
    marginBottom: '20px',
    boxSizing: 'border-box'
  };

  const inputFocusStyle = {
    ...inputStyle,
    borderColor: LOGIN_PRIMARY_COLOR,
    boxShadow: `0 0 0 3px ${LOGIN_PRIMARY_COLOR}1a`
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234a5568' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    paddingRight: '40px'
  };

  const selectFocusStyle = {
    ...selectStyle,
    borderColor: LOGIN_PRIMARY_COLOR,
    boxShadow: `0 0 0 3px ${LOGIN_PRIMARY_COLOR}1a`
  };

  const buttonStyle = {
    width: '100%',
    height: '48px',
    backgroundColor: isLoading || !username || !password || !tenant ? '#a0aec0' : LOGIN_PRIMARY_COLOR,
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: isLoading || !username || !password || !tenant ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    transform: 'translateY(0)',
    boxShadow: isLoading || !username || !password || !tenant ? 'none' : `0 4px 12px ${LOGIN_PRIMARY_COLOR}66`
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: adjustBrightness(LOGIN_PRIMARY_COLOR, -15),
    transform: 'translateY(-1px)',
    boxShadow: `0 6px 16px ${LOGIN_PRIMARY_COLOR}66`
  };

  const messageStyle = {
    marginTop: '20px',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center',
    backgroundColor: message.includes('exitoso') ? '#f0fff4' : '#fed7d7',
    color: message.includes('exitoso') ? '#22543d' : '#742a2a',
    border: `1px solid ${message.includes('exitoso') ? '#9ae6b4' : '#feb2b2'}`
  };

  const spinnerStyle = {
    width: '20px',
    height: '20px',
    border: '2px solid transparent',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '8px'
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <div style={cardStyle}>
        <div>
          <h2 style={titleStyle}>Iniciar Sesión</h2>
          <p style={subtitleStyle}>Accede a tu cuenta para continuar</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>Empresa / Negocio</label>
            <select
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              onFocus={() => setFocusedInput('tenant')}
              onBlur={() => setFocusedInput(null)}
              style={focusedInput === 'tenant' ? selectFocusStyle : selectStyle}
              required
              disabled={isLoading}
            >
              <option value="">Selecciona tu empresa...</option>
              {tenants.map((t) => (
                <option key={t.subdomain} value={t.subdomain}>
                  {t.empresa_nombre} ({t.subdomain})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusedInput('username')}
              onBlur={() => setFocusedInput(null)}
              style={focusedInput === 'username' ? inputFocusStyle : inputStyle}
              placeholder="Ingresa tu usuario"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              style={focusedInput === 'password' ? inputFocusStyle : inputStyle}
              placeholder="Ingresa tu contraseña"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={!username || !password || !tenant || isLoading}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={isHovering && !isLoading && username && password && tenant ? buttonHoverStyle : buttonStyle}
          >
            {isLoading ? (
              <>
                <div style={spinnerStyle}></div>
                Cargando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {message && (
          <div style={messageStyle}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;