import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import api from '../../services/api';
import { saveToken } from '../../utils/auth';

const Register = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim() || !passwordConfirm.trim()) {
      setError('Preencha email e senha nos dois campos.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('As senhas não conferem.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/register', { email, password });

      if ((response.status === 201 || response.status === 200) && response.data.token) {
        saveToken(response.data.token);
        setSuccess('Conta criada e acesso liberado ao Batcomputador.');
        setTimeout(() => {
          history.push('/');
        }, 400);
      } else {
        setError(`Resposta inesperada da API (${response.status}).`);
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        if (status === 400) {
          setError('Dados inválidos para cadastro.');
        } else if (status === 409) {
          setError('Já existe uma conta com este email.');
        } else if (status >= 500) {
          setError(`Erro na Bat-rede (${status}) ao criar conta.`);
        } else {
          setError(`Erro (${status}) ao criar conta.`);
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
      <h2>Criar acesso ao Batcomputador</h2>

      <div className="status-bar">
        {loading && (
          <div className="alert alert-info">
            Registrando novo acesso na Bat-rede...
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
      </div>

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Senha</label>
        <input
          type="password"
          placeholder="Crie uma senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label>Confirmação de senha</label>
        <input
          type="password"
          placeholder="Repita a senha"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Criando conta...' : 'Criar conta e entrar'}
        </button>
      </form>

      <p style={{ marginTop: '8px', fontSize: '0.8rem' }}>
        Já tem acesso? <Link to="/login">Ir para login</Link>.
      </p>
    </div>
  );
};

export default Register;
