// User Management API
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');

// Initialize users data if file doesn't exist
async function initializeUsers() {
  try {
    await fs.access(USERS_FILE);
  } catch (error) {
    const defaultUsers = [
      {
        id: 1,
        username: 'admin',
        password: 'admin',
        email: 'admin@library.com',
        name: 'Admin User',
        memberSince: new Date().toISOString(),
        role: 'admin'
      }
    ];
    await fs.writeFile(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
  }
}

// GET all users
router.get('/', async (req, res) => {
  try {
    await initializeUsers();
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(data);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    await initializeUsers();
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(data);
    const user = users.find(u => u.id === parseInt(req.params.id));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST create new user
router.post('/', async (req, res) => {
  try {
    await initializeUsers();
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(data);
    
    const { username, email, password, name } = req.body;
    
    // Check if user already exists
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      username,
      email,
      password,
      name: name || username,
      memberSince: new Date().toISOString(),
      role: 'member'
    };
    
    users.push(newUser);
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    await initializeUsers();
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(data);
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { name, email } = req.body;
    users[userIndex] = { ...users[userIndex], name, email };
    
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    res.json(users[userIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    await initializeUsers();
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(data);
    const filteredUsers = users.filter(u => u.id !== parseInt(req.params.id));
    
    if (users.length === filteredUsers.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await fs.writeFile(USERS_FILE, JSON.stringify(filteredUsers, null, 2));
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// POST login
router.post('/login', async (req, res) => {
  try {
    await initializeUsers();
    const data = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(data);
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
