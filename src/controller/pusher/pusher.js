const Pusher = require('pusher');


const pusher = new Pusher({
    appId: "1530894",
    key: "9c3b467c5053c8a92576",
    secret: "2a15d3e4a18416dc9537",
    cluster: "ap1",
    useTLS: true
  });
module.exports = {pusher};