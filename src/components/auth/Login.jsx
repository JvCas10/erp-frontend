import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const API_URL = 'http://localhost:3000/api/auth/login';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Función para crear gradiente dinámico basado en el color primario
  const createGradient = (primaryColor) => {
    if (!primaryColor || primaryColor === '#3498db') {
      // Gradiente por defecto si no hay color personalizado
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    // Crear un gradiente usando el color primario y una variación más oscura
    const darkerColor = adjustBrightness(primaryColor, -30);
    return `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
  };

  // Función para ajustar el brillo de un color hex
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
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el inicio de sesión');
      }

      setMessage('¡Inicio de sesión exitoso!');
      console.log('Token:', data.token);

      onLoginSuccess(data.token);
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
    background: createGradient(theme?.primaryColor),
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    padding: '20px',
    transition: 'background 0.3s ease'
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
    borderColor: theme?.primaryColor || '#4299e1',
    boxShadow: `0 0 0 3px ${theme?.primaryColor ? theme.primaryColor + '1a' : 'rgba(66, 153, 225, 0.1)'}`
  };

  const buttonStyle = {
    width: '100%',
    height: '48px',
    backgroundColor: isLoading || !username || !password ? '#a0aec0' : (theme?.primaryColor || '#4299e1'),
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: isLoading || !username || !password ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    transform: 'translateY(0)',
    boxShadow: isLoading || !username || !password ? 'none' : `0 4px 12px ${theme?.primaryColor ? theme.primaryColor + '66' : 'rgba(66, 153, 225, 0.4)'}`
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: theme?.primaryColor ? adjustBrightness(theme.primaryColor, -15) : '#3182ce',
    transform: 'translateY(-1px)',
    boxShadow: `0 6px 16px ${theme?.primaryColor ? theme.primaryColor + '66' : 'rgba(66, 153, 225, 0.4)'}`
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
        {/* Header */}
        <div>
          <h2 style={titleStyle}>Iniciar Sesión</h2>
          <p style={subtitleStyle}>Accede a tu cuenta para continuar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username */}
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

          {/* Password */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!username || !password || isLoading}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={isHovering && !isLoading && username && password ? buttonHoverStyle : buttonStyle}
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

        {/* Message */}
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