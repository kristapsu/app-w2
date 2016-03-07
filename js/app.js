var app = angular.module('firstApp', []);

// global variable, place to store date (bad thing - exposed to user who uses web browser)
var _statuses = [];

app.controller('UserController', function(){
  var vm = this;

  vm.user = '';
  vm.message = '';

  vm.setStatus = function() {
    var _userToSend = {
      user: vm.user,
      message: vm.message
    };

    console.log('Sending user status');
    console.log(JSON.stringify(_userToSend));
    // rootscope is everything inside ng, you use rootscope to communicate between differenct scopes
    // $rootScope.$broadcast('set-status', _userToSend);

    _statuses.push(_userToSend);

  }

});

// RootScope - scope for all app, that can be shared
app.controller('StatusController', function(){

  var vm = this;

  vm.statuses = _statuses;

});
