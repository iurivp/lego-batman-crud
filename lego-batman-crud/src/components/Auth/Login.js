import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { saveToken } from '../../utils/auth';
import api from '../../services/api';

const Login = () => {
  const history = useHistory();
  const [email, setEmail] = useState('batman@lego.com');
  const [password, setPassword] = useState('batcaverna');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/login', { email, password });

      if (response.status === 200 && response.data.token) {
        saveToken(response.data.token);
        setSuccess('Acesso concedido ao Batcomputador.');
        setTimeout(() => {
          history.push('/');
        }, 400);
      } else {
        setError(`Resposta inesperada da API (${response.status}).`);
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        if (status === 400 || status === 401) {
          setError('Credenciais inválidas.');
        } else if (status >= 500) {
          setError(`Erro na Bat-rede (${status}).`);
        } else {
          setError(`Erro na autenticação (${status}).`);
        }
      } else {
        setError('Falha de conexão com a Bat-rede. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Login da Batcaverna</h2>

      <div className="status-bar">
        {loading && (
          <div className="alert alert-info">
            Validando suas credenciais com o Batcomputador...
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
      </div>

      <form onSubmit={handleSubmit}>
        <label>Email do vigilante</label>
        <input
          type="email"
          placeholder="Digite seu e-mail de acesso"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Senha secreta</label>
        <input
          type="password"
          placeholder="Digite sua senha secreta"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Autenticando...' : 'Entrar na Batcaverna'}
        </button>
      </form>

      <p style={{ marginTop: '8px', fontSize: '0.8rem' }}>
        Usuário padrão disponível: <b>batman@lego.com</b> / <b>batcaverna</b>.
      </p>
      <p style={{ marginTop: '4px', fontSize: '0.8rem' }}>
        Ainda não tem acesso? <Link to="/register">Criar conta</Link>.
      </p>
    </div>
  );
};

export default Login;
