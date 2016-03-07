var app = angular.module('firstApp', []);

app.controller('UserController', function($rootScope){
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
  }

});

// RootScope - scope for all app, that can be shared
app.controller('StatusController', function($rootScope){

  var vm = this;

  vm.statuses = [];

});
