import React, { useEffect, useState } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import api from '../../services/api';

const getStatusLabel = (status) => {
  if (status === 'ativo') return 'Em missão';
  return 'Na Batcaverna';
};

const ItemDetail = () => {
  const { id } = useParams();
  const history = useHistory();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/characters/${id}`);

        if (response.status === 200) {
          setItem(response.data);
        } else {
          setError(
            `Falha ao carregar o personagem. Status: ${response.status}.`
          );
        }
      } catch (err) {
        if (err.response) {
          const status = err.response.status;
          if (status >= 500) {
            setError(
              `Erro na Bat-rede (${status}) ao carregar personagem.`
            );
          } else if (status === 404) {
            setError('Personagem não encontrado.');
          } else {
            setError(`Erro (${status}) ao carregar personagem.`);
          }
        } else {
          setError('Falha de rede ao consultar o Batcomputador.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Tem certeza que deseja remover este personagem do inventário?'
    );
    if (!confirmDelete) return;

    setDeleting(true);
    setError('');
    setMessage('');

    try {
      const response = await api.delete(`/characters/${id}`);

      if (response.status === 204) {
        setMessage('Personagem removido do inventário (204).');
        setTimeout(() => {
          history.push({
            pathname: '/',
            state: { reload: true },
          });
        }, 400);
      } else {
        setError(`Não foi possível remover. Status: ${response.status}.`);
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        if (status >= 500) {
          setError(
            `Erro na Bat-rede (${status}) ao remover personagem.`
          );
        } else if (status === 404) {
          setError('Personagem não encontrado ao tentar remover.');
        } else {
          setError(`Erro (${status}) ao remover personagem.`);
        }
      } else {
        setError('Falha de rede ao remover personagem.');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="alert alert-info">
          Carregando detalhes do personagem...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="card">
        <p>Personagem não encontrado no inventário.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Personagem Lego Batman #{item.id}</h2>

      <div className="status-bar">
        {message && <div className="alert alert-success">{message}</div>}
      </div>

      <p>
        <b>Nome do personagem:</b> {item.name}
      </p>
      <p>
        <b>Status:</b>{' '}
        <span className={`badge badge-${item.status}`}>
          {getStatusLabel(item.status)}
        </span>
      </p>
      <p>
        <b>Descrição:</b> {item.description}
      </p>

      <div className="item-actions">
        <Link to={`/items/${id}/edit`}>Editar personagem</Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-danger"
        >
          {deleting ? 'Removendo...' : 'Remover do inventário'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() =>
            history.push({
              pathname: '/',
              state: { reload: true },
            })
          }
        >
          Voltar para o Batcomputador
        </button>
      </div>
    </div>
  );
};

export default ItemDetail;
