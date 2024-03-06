import axios from 'axios';

const res = await axios.get('https://www.google.com.br');

console.log(res.data);
