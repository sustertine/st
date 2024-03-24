const axios = require('axios');
const qs = require('qs');

const client = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 1000,
});

let token;

async function register(username, password) {
    const response = await client.post('/auth/register', {username, password});
    console.log(response.data);
}

async function login(username, password) {
    const authData = {
        grant_type: 'password',
        username,
        password,
        client_id: 'client_id', // replace with your actual client_id
        client_secret: 'client_secret', // replace with your actual client_secret
        scope: 'all',
    };
    const response = await client.post('/auth', qs.stringify(authData), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    token = response.data.access_token;
}

async function getUser(username) {
    const response = await client.get(`/api/users/${username}`, {
        headers: {Authorization: `Bearer ${token}`},
    });
    console.log(response.data);
}

async function getAllUsers() {
    const response = await client.get('/api/users', {
        headers: {Authorization: `Bearer ${token}`},
    });
    console.log(response.data);
}

async function testOAuthFlow() {
    await register('testuser', 'testpassword');
    // await login('testuser', 'testpassword');
    await getUser('testuser');
    await getAllUsers();
}

testOAuthFlow().catch(console.error);