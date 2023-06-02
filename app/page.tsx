"use client"
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const API_URL = 'http://localhost:4040';


const createUserSchema = z.object({
    username: z
      .string()
      .min(3, 'O nome de usuário deve ter pelo menos 3 caracteres')
      .nonempty('O nome de usuário é obrigatório'),
  
    password: z
      .string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres')
      .regex(/^(?=.*[A-Z])(?=.*\W).*$/, 'A senha deve conter pelo menos uma letra maiúscula e um símbolo')
      .nonempty('A senha é obrigatória'),
  });


const loginSchema = z.object({
  username: z.string().nonempty('Username is required'),
  password: z.string().nonempty('Password is required'),
});

const CreateUser = ({ onLoginStage }) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createUserSchema),
  });

  const handleCreateUser = async (data) => {
    try {
      // Perform API request to create user
      console.log('Creating user:', data);
      await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        });
        console.log(data)

      const username = data.username
      const password = data.password
        onLoginStage(username, password)
      // Trigger login stage
    } catch (error) {
      console.error('Create user error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleCreateUser)} className="mb-4">
      <h2 className="text-lg font-semibold mb-2">Create User</h2>
      <div className="flex mb-2">
        <input
          type="text"
          placeholder="Username"
          {...register('username')}
          className="border border-gray-300 rounded-md px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {errors.username && (
          <span className="text-red-500">{errors.username.message.toString()}</span>
        )}
      </div>
      <div className="flex mb-2">
        <input
          type="password"
          placeholder="Password"
          {...register('password')}
          className="border border-gray-300 rounded-md px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {errors.password && (
          <span className="text-red-500">{errors.password.message.toString()}</span>
        )}
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Create User
      </button>
      <button
        type="button"
        onClick={onLoginStage}
        className="text-blue-500 hover:text-blue-700 font-semibold ml-2 focus:outline-none"
      >
        Are you a member already? Log in
      </button>
    </form>
  );
};

const Login = ({ onLogin, onCreateUser, info}) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
        username: info.username,
        password: info.password,
    },
  });

  const handleLogin = async (data) => {
    try {
      // Perform API request to log in user
      console.log('Logging in:', data);

      // Trigger login
      const response = await (await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })).json()
      onLogin(response.token);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="mb-4">
      <h2 className="text-lg font-semibold mb-2">Log In</h2>
      <div className="flex mb-2">
        <input
          type="text"
          placeholder="Username"
          {...register('username')}
          className="border border-gray-300 rounded-md px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {errors.username && (
          <span className="text-red-500">{errors.username.message.toString()}</span>
        )}
      </div>
      <div className="flex mb-2">
        <input
          type="password"
          placeholder="Password"
          {...register('password')}
          className="border border-gray-300 rounded-md px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {errors.password && (
          <span className="text-red-500">{errors.password.message.toString()}</span>
        )}
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Log In
      </button>
      <button
        type="button"
        onClick={onCreateUser}
        className="text-blue-500 hover:text-blue-700 font-semibold ml-2 focus:outline-none"
      >
        Create User
      </button>
    </form>
  );
};

const UsersList = ({ token }) => {
  const [users, setUsers] = useState([]);

  const handleGetAllUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Get all users error:', error);
    }
  };

    const handleDeleteUser = async (id) => {
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('Delete user response:', response);
        handleGetAllUsers();
    } catch (error) {
        console.error('Delete user error:', error);
    }
    };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Users</h2>
      <button
        onClick={handleGetAllUsers}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Get All Users
      </button>
      <ul className="mt-4">
        {users.map((user) => (
          <li
            key={user.id}
            className="bg-gray-100 p-2 rounded-md shadow-md mt-2 flex justify-between"
          >
            <span>{user.id} - {user.username}</span>
            <button
              onClick={() => handleDeleteUser(user.id)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const App = () => {
  const [onLoginStage, setOnLoginStage] = useState(false);
  const [logged, setLogged] = useState(false);
  const [token, setToken] = useState('');
  const [userInfo, setUserInfo] = useState({
    username: '',
    password: '',
  });
  const handleLogin = (login, password) => {
    setUserInfo({
        username: login,
        password: password,
    });
    setOnLoginStage(true);
  };

  const handleCreateUser = () => {
    
    setOnLoginStage(false);
  };

  const handleOnLogin = (token) => {
      setToken(token); // Replace with actual token received from API
    setLogged(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">User Authentication</h1>

      {!logged && !onLoginStage && (
        <CreateUser onLoginStage={handleLogin} />
      )}

      {!logged && onLoginStage && (
        <Login onLogin={handleOnLogin} onCreateUser={handleCreateUser} info={userInfo}/>
      )}

      {logged && (
        <UsersList token={token} />
      )}
    </div>
  );
};

export default App;
