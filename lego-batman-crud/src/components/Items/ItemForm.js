import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import api from '../../services/api';

const ItemForm = () => {
  const history = useHistory();
  const { id } = useParams();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ativo');
  const [loadingItem, setLoadingItem] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isEdit = !!id;

  useEffect(() => {
    const loadItem = async () => {
      if (!isEdit) return;

      setLoadingItem(true);
      setError('');
      try {
        const response = await api.get(`/characters/${id}`);
        if (response.status === 200) {
          setName(response.data.name);
          setDescription(response.data.description);
          setStatus(response.data.status);
        } else {
          setError(
            `Falha ao carregar dados do personagem para edição. Status: ${response.status}.`
          );
        }
      } catch (err) {
        if (err.response) {
          const statusCode = err.response.status;
          if (statusCode >= 500) {
            setError(
              `Erro na Bat-rede (${statusCode}) ao carregar personagem.`
            );
          } else if (statusCode === 404) {
            setError('Personagem não encontrado para edição.');
          } else {
            setError(`Erro (${statusCode}) ao carregar personagem.`);
          }
        } else {
          setError('Falha de rede ao carregar o personagem.');
        }
      } finally {
        setLoadingItem(false);
      }
    };

    loadItem();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!name.trim() || !description.trim()) {
      setError('Preencha o nome e a descrição do personagem.');
      return;
    }

    setSubmitting(true);

    const payload = {
      name,
      description,
      status,
    };

    try {
      let response;

      if (isEdit) {
        response = await api.put(`/characters/${id}`, payload);
        if (response.status === 200) {
          setMessage('Personagem atualizado com sucesso (200).');
        } else {
          setMessage(
            `Personagem atualizado com status ${response.status}.`
          );
        }
      } else {
        response = await api.post('/characters', payload);
        if (response.status === 201) {
          setMessage('Personagem registrado no inventário (201).');
        } else {
          setMessage(`Personagem criado com status ${response.status}.`);
        }
      }

      setTimeout(() => {
        history.push({
          pathname: '/',
          state: { reload: true },
        });
      }, 400);
    } catch (err) {
      if (err.response) {
        const statusCode = err.response.status;
        if (statusCode >= 500) {
          setError(
            `Erro na Bat-rede (${statusCode}) ao salvar personagem.`
          );
        } else if (statusCode >= 400) {
          setError(
            `Erro na requisição (${statusCode}) ao salvar personagem.`
          );
        } else {
          setError(
            `Erro inesperado (${statusCode}) ao salvar personagem.`
          );
        }
      } else {
        setError('Falha de rede ao salvar personagem.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingItem) {
    return (
      <div className="card">
        <div className="alert alert-info">
          Carregando dados do personagem para edição...
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>
        {isEdit
          ? 'Editar personagem Lego Batman'
          : 'Registrar novo personagem Lego Batman'}
      </h2>

      <div className="status-bar">
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}
      </div>

      <form onSubmit={handleSubmit}>
        <label>Nome do personagem</label>
        <input
          type="text"
          placeholder="Ex.: Batman, Coringa, Batgirl..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Descrição do personagem</label>
        <textarea
          placeholder="Ex.: Vilão de Gotham com cabelo verde e terno roxo..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label>Status do personagem</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ativo">Em missão</option>
          <option value="inativo">Na Batcaverna</option>
        </select>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Salvando no Batcomputador...' : 'Salvar personagem'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          style={{ marginLeft: 8 }}
          onClick={() =>
            history.push({
              pathname: '/',
              state: { reload: true },
            })
          }
        >
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default ItemForm;
