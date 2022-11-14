const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = [];

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const id = users.length.toString();

  users.push({
    username: username,
    count: 0,
    _id: id,
    log: []
  });

  res.json({
    username: username,
    _id: id
  });
});

app.get('/api/users', (req, res) => {
  const usernames = users.map(user => (
    {
      username: user.username,
      _id: user._id
    }
  ));

  res.json(usernames);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const id = req.params._id;
  const desc = req.body.description;
  const duration = Number(req.body.duration);
  const date = new Date(req.body.date || Date.now());
  const newUser = users.filter(user => user._id == id)[0];
  
  newUser.count++;
  
  newUser.log.push({
    description: desc,
    duration: duration,
    date: date.toDateString()
  });

  newUser.log.sort((a, b) => {
    const date1 = new Date(a.date);
    const date2 = new Date(b.date);

    if (date1 < date2) {
      return 1;
    } else if (date1 > date2) {
      return -1;
    } else {
      return 0;
    }
  });

  users = users.map(user => {
    if (user.id == id) return newUser;
    return user;
  });

  date.setDate(date.getDate() + 1);
  
  res.json({
    _id: id,
    username: newUser.username,
    date: date.toDateString(),
    duration: duration,
    description: desc
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const id = req.params._id;
  let {from: from, to: to, limit: limit} = req.query;
  const searchUser = users.filter(user => user._id == id)[0];

  const fromDate = new Date(from || 0);
  const toDate = new Date(to || Date.now());
  limit = limit || 999;

  searchUser.log = searchUser.log.filter(log => {
    const date = new Date(log.date);
    if (date >= fromDate && date <= toDate && limit > 0) {
      limit--;
      return true;
    }
    return false;
  });

  res.json(searchUser);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
