const axios = require('axios');

const instance = axios.create({
  baseURL: 'https://online-academy-hcmus.herokuapp.com/'
});

module.exports = instance;
