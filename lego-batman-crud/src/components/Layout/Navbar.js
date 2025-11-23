import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getToken, subscribeAuth } from '../../utils/auth';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());

  useEffect(() => {
    const unsubscribe = subscribeAuth(setIsAuthenticated);
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span role="img" aria-label="bat">
          🦇
        </span>
        <span className="navbar-logo">Batcomputador Lego</span>
      </div>
      <div className="navbar-right">
        {isAuthenticated && <Link to="/">Inventário</Link>}
        {isAuthenticated && <Link to="/items/new">Novo Personagem</Link>}
        {isAuthenticated ? (
          <Link to="/logout">Sair da Batcaverna</Link>
        ) : (
          <>
            <Link to="/login">Entrar</Link>
            <Link to="/register">Criar conta</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
