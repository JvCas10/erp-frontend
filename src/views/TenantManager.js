// src/views/Admin/TenantManager.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function TenantManager() {
  const [tenants, setTenants] = useState([]);
  const [formData, setFormData] = useState({
    subdomain: '',
    db_name: '',
    empresa_nombre: '',
    email: ''
  });

  const fetchTenants = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/admin/tenants`);
      setTenants(data.tenants);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API_URL}/admin/tenants`, formData);
      alert(data.message);
      fetchTenants();
      setFormData({ subdomain: '', db_name: '', empresa_nombre: '', email: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Error al crear tenant');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar tenant? Esto borrará TODA la base de datos')) return;
    try {
      await axios.delete(`${API_URL}/admin/tenants/${id}`);
      alert('Tenant eliminado');
      fetchTenants();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  return (
    <div className="content">
      <h2>Gestión de Tenants</h2>
      
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Subdomain (ej: negocio1)"
          value={formData.subdomain}
          onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
          required
        />
        <input
          placeholder="DB Name (ej: tenant_negocio1)"
          value={formData.db_name}
          onChange={(e) => setFormData({...formData, db_name: e.target.value})}
          required
        />
        <input
          placeholder="Nombre Empresa"
          value={formData.empresa_nombre}
          onChange={(e) => setFormData({...formData, empresa_nombre: e.target.value})}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <button type="submit">Crear Tenant</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Subdomain</th>
            <th>DB</th>
            <th>Empresa</th>
            <th>Email</th>
            <th>Creado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map(t => (
            <tr key={t.id}>
              <td><a href={`https://${t.subdomain}.railway.app`} target="_blank">{t.subdomain}</a></td>
              <td>{t.db_name}</td>
              <td>{t.empresa_nombre}</td>
              <td>{t.email}</td>
              <td>{new Date(t.created_at).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleDelete(t.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TenantManager;