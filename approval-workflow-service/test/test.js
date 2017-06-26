var http = require('http');
var fs = require('fs');
var path = require('path');
var Workflow = require('@accionlabs/approval-workflow');
var _ = require('underscore');
var url = require('url');
var workflowModel = require(`${__dirname}/test-hot.json`);

function parseCookies(cookie) {
  if (!cookie) return {};
  return cookie.split(';').reduce(
    function(prev, curr) {
      var m = / *([^=]+)=(.*)/.exec(curr);
      var key = m[1];
      var value = decodeURIComponent(m[2]);
      prev[key] = value;
      return prev;
    },
    { }
  );
}

function stringifyCookies(cookies) {
  var list = [ ];
  for (var key in cookies) {
    list.push(key + '=' + encodeURIComponent(cookies[key]));
  }
  return list.join('; ');
}

function createWorkflowTest() {
  var test = {
    users:[
      {
        'id':'user1',
        'role':'AccountManager'
      },
      {
        'id':'user2',
        'role':'TechnicalScreener'
      },
      {
        'id':'user3',
        'role':'Admin'
      },
      {
        'id':'user4',
        'role':'AccountManager'
      },
      {
        'id':'user5',
        'role':'TechnicalScreener'
      },
      {
        'id':'user6',
        'role':'Admin'
      }
    ],
    'document':{
      'history':[]
    }
  };
  test.workflow = new Workflow(workflowModel,test.document);
  return test;
}

var testWorkflows={};
var lastSession=0;

http.createServer(function (request, response) {
  // check if new session
  var cookies = parseCookies(request.headers.cookie);
  var test;
  if (cookies.session && testWorkflows[cookies.session]) {
    test=testWorkflows[cookies.session];
  } else {
    cookies.session=++lastSession;
    test = createWorkflowTest();
    testWorkflows[cookies.session]=test;
  }
  test.lastUpdated = Date.now();

  var getUser = function(query) {
    var user = false;
    // which user?
    if (query.query.user) {
      var userIndex = _.findIndex(test.users,function(user) {
        return (user.id==query.query.user);
      })
      if (userIndex>=0) {
        user=test.users[userIndex];
      }
    }
    return user;
  }
  if (request.url.match(/\/api/i)) {
    var query = url.parse(request.url,true);
    var data={};
    switch(query.pathname) {
      case '/api/getWorkflowModel':
        data = test.workflow.workflow;
        break;
      case '/api/clearHistory':
        test.document.history=[];
        data=test.document.history;
        break;
      case '/api/getLastMilestone':
        data = test.workflow.getLastMilestone();
        break;
      case '/api/getHistory':
        data = test.workflow.getHistory();
        break;
      case '/api/getPermissions':
        var user = getUser(query);
        if (user) {
          data[user.id]={
            "view":test.workflow.isUserAllowedMilestone(user),
            "actions":test.workflow.getAllowedActions(user)
          };
        } else {
          test.users.map(function(user) {
            data[user.id]={
              "view":test.workflow.isUserAllowedMilestone(user),
              "actions":test.workflow.getAllowedActions(user)
            };
          });
        }
        break;
      case '/api/doAction':
        var user = false;
        var action = false;
        // which user?
        if (query.query.user) {
          var userIndex = _.findIndex(test.users,function(user) {
            return (user.id==query.query.user);
          })
          if (userIndex>=0) {
            user=test.users[userIndex];
          }
        }
        // which action?
        if (query.query.action) {
          action=query.query.action;
        }
        if (!user || !action) {
          data = {'error':'user or action not specified'};
        } else {
          data = {'result':test.workflow.doAction(user,action)};
        }
        break;
    }
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.writeHead(200, {
      'Set-Cookie': stringifyCookies(cookies),
      'Content-Type': 'text/plain'
    });
    response.write(JSON.stringify(data,null,' '));
    response.end();
  }
  var filePath = '.' + request.url;
  if (filePath == './')
    filePath = __dirname+'/test.html';
  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
  }

  fs.readFile(filePath, function(error, content) {
    if (error) {
      if(error.code == 'ENOENT'){
        response.writeHead(200, { 'Content-Type': contentType });
        response.end("Opps... file not found", 'utf-8');
      } else {
        response.writeHead(500);
        response.end('Oops... error: '+error.code+' ..\n');
        response.end();
      }
    }
    else {
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(content, 'utf-8');
    }
  });

}).listen(8125);
console.log('Test Server running at http://127.0.0.1:8125/');