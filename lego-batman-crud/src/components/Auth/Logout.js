import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { removeToken } from '../../utils/auth';

const Logout = () => {
  const history = useHistory();

  useEffect(() => {
    removeToken();
  }, []);

  const handleBack = () => {
    history.push('/login');
  };

  return (
    <div className="card">
      <h2>Saída da Batcaverna</h2>
      <p>Você desconectou do Batcomputador.</p>
      <button onClick={handleBack}>Voltar para a tela de login</button>
    </div>
  );
};

export default Logout;
