# Solución Error 401 Unauthorized

## Problema
El frontend está recibiendo error 401 en las peticiones a `/users` porque no está enviando el token JWT de autenticación.

## Causa
Las peticiones no incluyen el header `Authorization: Bearer <token>` que el backend requiere para autenticar al usuario.

## Solución Frontend

### 1. Guardar el token después del login

Cuando el usuario hace login exitosamente, el backend devuelve un objeto con el `access_token`:

```javascript
// Respuesta del login
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    ...
  }
}
```

Guardar este token en localStorage o sessionStorage:

```javascript
// authService.js o similar
async login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  
  // IMPORTANTE: Guardar el token
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
}
```

### 2. Enviar el token en todas las peticiones protegidas

Crear una función helper para hacer peticiones con autenticación:

```javascript
// api.js o httpClient.js
const API_URL = 'https://inspecciones-muni-santa-cruz-production.up.railway.app';

export async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`, // ← ESTO ES LO MÁS IMPORTANTE
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    // Token inválido o expirado, redirigir al login
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return response;
}
```

### 3. Usar el helper en todas las peticiones

```javascript
// userService.js
import { fetchWithAuth } from './api';

export async function getUsers() {
  const response = await fetchWithAuth('/users', {
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  return response.json();
}

export async function getUserProfile() {
  const response = await fetchWithAuth('/users/me', {
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  
  return response.json();
}
```

### 4. Ejemplo con Axios (si usan Axios en lugar de fetch)

```javascript
// api.js con Axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://inspecciones-muni-santa-cruz-production.up.railway.app',
  withCredentials: true,
});

// Interceptor para agregar el token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Uso:
// import api from './api';
// const users = await api.get('/users');
```

### 5. Verificar que el token se envíe correctamente

En las DevTools del navegador:

1. Abrir **Network** tab
2. Hacer una petición a `/users`
3. Click en la petición
4. En **Request Headers** debe aparecer:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Endpoints que requieren autenticación

```
✅ Requiere token:
- GET    /users
- GET    /users/me
- POST   /inspections
- GET    /inspections
- PUT    /inspections/:id
- DELETE /inspections/:id
- GET    /dashboard/stats
- etc.

❌ NO requiere token:
- POST   /auth/login
- POST   /auth/register
- POST   /users/forgot-password
- POST   /users/reset-password
```

## Troubleshooting

### Error: "Token inválido"
- Verificar que el token se copió completo (sin espacios)
- El token expira después de 1 día, volver a hacer login

### Error: "CORS"
- Verificar que `credentials: true` esté en la configuración de fetch
- Backend ya está configurado correctamente

### Error: "Token no se guarda"
- Verificar que localStorage no esté bloqueado
- Probar con sessionStorage si hay problemas

## Código completo ejemplo

```javascript
// authContext.js (React)
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar token al iniciar
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch('https://inspecciones-muni-santa-cruz-production.up.railway.app/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    setToken(data.access_token);
    setUser(data.user);
    
    return data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const fetchWithAuth = async (endpoint, options = {}) => {
    if (!token) {
      throw new Error('No token');
    }

    const response = await fetch(`https://inspecciones-muni-santa-cruz-production.up.railway.app${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      credentials: 'include',
    });

    if (response.status === 401) {
      logout();
      throw new Error('Unauthorized');
    }

    return response;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, fetchWithAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

## Resumen

**LO MÁS IMPORTANTE:**

1. Después del login, guardar: `localStorage.setItem('access_token', token)`
2. En cada petición, enviar header: `Authorization: Bearer ${token}`
3. Si hay 401, eliminar token y redirigir a login

---

**Para cualquier duda, contactar al equipo de backend.**
