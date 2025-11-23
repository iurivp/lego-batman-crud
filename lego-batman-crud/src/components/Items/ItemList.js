import React, { useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import api from '../../services/api';

const getStatusLabel = (status) => {
  if (status === 'ativo') return 'Em missão';
  return 'Na Batcaverna';
};

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const history = useHistory();

  const queryParams = new URLSearchParams(location.search);
  const statusFilter = queryParams.get('status') || 'todos';

  const loadItems = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/characters');
      if (response.status === 200) {
        setItems(response.data);
      } else {
        setError(
          `Falha ao carregar o inventário. Status: ${response.status}.`
        );
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        if (status >= 500) {
          setError(`Erro na Bat-rede (${status}) ao carregar personagens.`);
        } else {
          setError(`Erro (${status}) ao carregar personagens.`);
        }
      } else {
        setError('Falha de rede ao consultar o Batcomputador.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (location.state && location.state.reload) {
      loadItems();
      history.replace({ pathname: location.pathname, search: location.search });
    }
  }, [location, history]);

  const handleFilterChange = (filter) => {
    if (filter === 'todos') {
      history.push('/');
    } else {
      history.push(`/?status=${filter}`);
    }
  };

  const filteredItems = items.filter((item) => {
    if (statusFilter === 'todos') return true;
    return item.status === statusFilter;
  });

  return (
    <div className="card">
      <div className="item-list-header">
        <h2>Inventário de Personagens Lego Batman</h2>
        <Link to="/items/new">+ Registrar novo personagem</Link>
      </div>

      <div className="status-bar">
        {loading && (
          <div className="alert alert-info">
            Consultando o Batcomputador pelos personagens...
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
      </div>

      <div className="filters">
        <span>Filtro por status:</span>
        <button onClick={() => handleFilterChange('todos')}>
          Todos
        </button>
        <button onClick={() => handleFilterChange('ativo')}>
          Em missão
        </button>
        <button onClick={() => handleFilterChange('inativo')}>
          Na Batcaverna
        </button>
        <span style={{ marginLeft: 8 }}>
          (URL: <code>?status={statusFilter}</code>)
        </span>
      </div>

      {!loading && !error && filteredItems.length === 0 && (
        <p>Nenhum personagem encontrado para esse filtro.</p>
      )}

      <ul>
        {filteredItems.map((item) => (
          <li key={item.id}>
            <Link to={`/items/${item.id}`}>{item.name}</Link>
            <span className={`badge badge-${item.status}`}>
              {getStatusLabel(item.status)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ItemList;
