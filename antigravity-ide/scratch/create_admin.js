fetch('https://odizopetcare.onrender.com/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password',
    role: 'admin',
    userType: 'admin'
  })
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
