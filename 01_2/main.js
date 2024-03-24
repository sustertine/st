const express = require('express');
const bodyParser = require('body-parser');
const OAuthServer = require('oauth2-server');
const Request = OAuthServer.Request;
const Response = OAuthServer.Response;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const SECRET_KEY = 'secret';

let users = {};
let tokens = {};
let authorizationCodes = {};

const oauth = new OAuthServer({
  model: {
    getAccessToken: (accessToken) => {
      if (tokens[accessToken]) {
        return Promise.resolve(tokens[accessToken]);
      }
      return Promise.reject();
    },
    getRefreshToken: (refreshToken) => {
      return Promise.resolve(tokens[refreshToken]);
    },
    getClient: (clientId, clientSecret) => {
      const client = { clientId, clientSecret, grants: ['password'] };
      return Promise.resolve(client);
    },
    getAuthorizationCode: (code) => {
      return Promise.resolve(authorizationCodes[code]);
    },
    getUser: (username, password) => {
      const user = users[username];
      if (user && user.password === password) {
        return Promise.resolve(user);
      }
      return Promise.reject();
    },
    saveToken: (token, client, user) => {
      tokens[token.accessToken] = { token, client, user };
      return Promise.resolve({ token, client, user });
    },
    saveAuthorizationCode: (code, client, user) => {
      authorizationCodes[code.authorizationCode] = { code, client, user };
      return Promise.resolve({ code, client, user });
    },
    revokeToken: (token) => {
      if (tokens[token.accessToken]) {
        delete tokens[token.accessToken];
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    },
    revokeAuthorizationCode: (code) => {
      if (authorizationCodes[code.authorizationCode]) {
        delete authorizationCodes[code.authorizationCode];
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    },
  },
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url} ${JSON.stringify(req.body)}`);
  next();
});
app.post('/auth', (req, res) => {
  const request = new Request(req);
  const response = new Response(res);

  oauth.token(request, response)
    .then((token) => {
      res.json(token);
    })
    .catch((err) => {
      res.status(err.code || 500).json(err.message);
    });
});

app.get('/api/users', (req, res) => {
  const request = new Request(req);
  const response = new Response(res);

  oauth.authenticate(request, response)
    .then(() => {
      res.status(200).json(Object.values(users));
    })
    .catch((err) => {
      res.status(err.code || 500).json(err);
    });
});

app.get('/api/users/:username', (req, res) => {
  const request = new Request(req);
  const response = new Response(res);

  oauth.authenticate(request, response)
    .then(() => {
      const user = users[req.params.username];
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    })
    .catch((err) => {
      res.status(err.code || 500).json(err);
    });
});

app.put('/api/users/:username', (req, res) => {
  const request = new Request(req);
  const response = new Response(res);

  oauth.authenticate(request, response)
    .then(() => {
      const user = users[req.params.username];
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      Object.assign(user, req.body);
      res.status(200).json(user);
    })
    .catch((err) => {
      res.status(err.code || 500).json(err);
    });
});

app.post('/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (users[username]) {
    return res.status(400).json({ message: 'User already exists' });
  }
  users[username] = { username, password };
  res.status(201).json({ message: 'User registered successfully' });
});

const parseError = (err) => {
  return {
    message: err.message,
    code: err.code,
  };
};

app.listen(3000, () => console.log('Server running on port 3000'));