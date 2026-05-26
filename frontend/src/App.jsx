import { useState, useEffect } from 'react';

const API = '/api'; // Gracias a Vite proxy, esto apuntará al backend

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  
  // Estado para crear un producto
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (token) {
      // Validar el token y obtener los datos del usuario
      fetch(`${API}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Token inválido');
        return res.json();
      })
      .then(data => {
        setUser(data);
        fetchProducts();
      })
      .catch(() => {
        setToken('');
        localStorage.removeItem('token');
      });
    }
  }, [token]);

  const fetchProducts = async (searchQuery = '') => {
    try {
      const res = await fetch(`${API}/products?search=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error cargando productos", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error en login", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Al usar el state 'search', haremos la petición al backend.
    // Como el backend usa sentencias parametrizadas, será seguro.
    fetchProducts(search);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, price: parseFloat(price) })
      });
      if (res.ok) {
        fetchProducts(search);
        setName('');
        setPrice('');
      }
    } catch (error) {
      console.error("Error al crear producto", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProducts(search);
      }
    } catch (error) {
      console.error("Error al eliminar producto", error);
    }
  };

  if (!token) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#f3f4f6', 
        fontFamily: 'system-ui, -apple-system, sans-serif' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '12px', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
          width: '100%', 
          maxWidth: '400px' 
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#111827', fontSize: '24px' }}>
            🎵 Melody's Inventory
          </h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#4b5563', fontWeight: '500' }}>Usuario</label>
              <input 
                type="text" placeholder="Ej. admin" 
                value={username} onChange={(e) => setUsername(e.target.value)} required 
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#4b5563', fontWeight: '500' }}>Contraseña</label>
              <input 
                type="password" placeholder="••••••••" 
                value={password} onChange={(e) => setPassword(e.target.value)} required 
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }} 
              />
            </div>
            <button type="submit" style={{ marginTop: '10px', padding: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' }}>
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      padding: '40px 20px', 
      fontFamily: 'system-ui, -apple-system, sans-serif' 
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '12px', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
      }}>
        
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px', marginBottom: '30px' }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '24px' }}>🎵 Melody's Inventory</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#4b5563', fontWeight: '500', fontSize: '15px' }}>
              Hola, <strong>{user?.username}</strong> ({user?.role})
            </span>
            <button 
              onClick={() => { setToken(''); localStorage.removeItem('token'); }}
              style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              Cerrar sesión
            </button>
          </div>
        </div>
        
        {/* Sección de Búsqueda */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', color: '#374151', marginBottom: '15px' }}>Buscador</h3>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Buscar producto por nombre o descripción..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '0 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
              Buscar
            </button>
          </form>
        </div>

        {/* Sección de Agregar Producto */}
        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '18px', color: '#374151', margin: '0 0 15px 0' }}>Agregar Producto</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input 
              type="text" placeholder="Nombre del producto" value={name} onChange={e => setName(e.target.value)} required 
              style={{ flex: 2, minWidth: '200px', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', outline: 'none' }} 
            />
            <input 
              type="number" placeholder="Precio ($)" value={price} onChange={e => setPrice(e.target.value)} required 
              style={{ flex: 1, minWidth: '100px', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', outline: 'none' }} 
            />
            <button type="submit" style={{ padding: '12px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
              Guardar
            </button>
          </form>
        </div>

        {/* Lista de Inventario */}
        <div>
          <h3 style={{ fontSize: '18px', color: '#374151', marginBottom: '15px' }}>Inventario Actual</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {products.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px 0' }}>No se encontraron productos.</p>
            ) : null}
            
            {products.map(p => (
              <li key={p.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '15px', 
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: 'white'
              }}>
                <div>
                  <strong style={{ display: 'block', color: '#111827', fontSize: '16px' }}>{p.name}</strong>
                  <span style={{ color: '#059669', fontWeight: '600', fontSize: '15px' }}>${p.price.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => handleDelete(p.id)} 
                  style={{ padding: '8px 12px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default App;