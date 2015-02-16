# nodejs startinfo



- set server onListening and error events

- display app info

- add error on start server


Usage
-------------
After configuring and starting server you can call this function.

Example using Express, file ./bin/wwww


```js

var app = require('../app')
    , debug = require('debug')('flux:server')
    , http = require('http')
    , port = parseInt(process.env.PORT, 10) || 3001
    , server = http.createServer(app)
    , start = require('node-startinfo')
    , server = http.createServer(app);

 server.listen(port);
 start.displayError(server); // display start info
 start.displayInfo(server); // dispaly error

```




This is a screenshot of start info console
-------------

      Application name : myapp
      Project version  : 0.0.1
      Server name      : vagrant-ubuntu-trusty-64
      Ip               : 10.0.2.15,192.168.0.3,192.168.1.99
      Port             : 8080
      NodeJs version   : v0.10.35
      ProcessID        : 9560
