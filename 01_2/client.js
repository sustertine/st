const axios = require('axios');

const client = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 1000,
});

async function testRegister(username, password) {
    try {
        const response = await client.post('/register', {username, password});
        console.log(response.data);
    } catch (error) {
        console.error(error.response.data);
    }
}

async function testLogin(username, password) {
    try {
        const response = await client.post('/login', {username, password});
        console.log(response.data);
    } catch (error) {
        console.error(error.response.data);
    }
}

async function testProtected(username, password) {
    try {
        const response = await client.get('/protected', {headers: {username, password}});
        console.log(response.data);
    } catch (error) {
        console.error(error.response.data);
    }
}

testRegister('testuser', 'testpassword')
    .then(() => testLogin('testuser', 'testpassword'))
    .then(() => testProtected('testuser', 'testpassword'));