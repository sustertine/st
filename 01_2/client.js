const axios = require('axios');

const client = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 1000,
});

let token;

async function testRegister(username, password) {
    try {
        const response = await client.post('/auth/register', {username, password});
        console.log(response.data);
    } catch (error) {
        console.error(error.response.data);
    }
}

async function testLogin(username, password) {
    try {
        const response = await client.post('/auth/login', {username, password});
        console.log(response.data);
        token = response.data.token;
    } catch (error) {
        console.error(error.response.data);
    }
}

async function testGetAllUsers() {
    try {
        const response = await client.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });
        console.log(response.data);
    } catch (error) {
        console.error(error.response.data);
    }
}

async function testGetUserByUsername(username) {
    try {
        const response = await client.get(`/api/users/${username}`, { headers: { Authorization: `Bearer ${token}` } });
        console.log(response.data);
    } catch (error) {
        console.error(error.response.data);
    }
}

async function testUpdateUserByUsername(username, updateData) {
    try {
        const response = await client.put(`/api/users/${username}`, updateData, { headers: { Authorization: `Bearer ${token}` } });
        console.log(response.data);
    } catch (error) {
        console.error(error.response.data);
    }
}

async function testInvalidToken() {
    try {
        const response = await client.get('/api/users', { headers: { Authorization: `Bearer invalid_token` } });
        console.log(response.data);
    } catch (error) {
        console.error(error.response.data);
    }
}

testRegister('testuser', 'testpassword')
    .then(() => testLogin('testuser', 'testpassword'))
    .then(() => testGetAllUsers())
    .then(() => testGetUserByUsername('testuser'))
    .then(() => testUpdateUserByUsername('testuser', { password: 'newpassword' }))
    .then(() => testLogin('testuser', 'newpassword'))
    .then(() => testGetUserByUsername('testuser'))
    .then(() => testInvalidToken());