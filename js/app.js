var app = angular.module('firstApp', []);

// global variable, place to store date (bad thing - exposed to user who uses web browser)
var _statuses = [];

app.controller('UserController', function(){

  //idea of what should happen
  var vm = this;

  __resetForm();

  vm.setStatus = _setStatus;

  //implemitaiton

  function _setStatus(){
    var _newStatus = {
      user: vm.user,
      message: vm.message
    };

    console.log('Sending user status');
    console.log(JSON.stringify(_newStatus));

    _statuses.push(_newStatus);

    __resetForm();

  }

  function __resetForm(){
    vm.user = '';
    vm.message = '';
  }

});

// RootScope - scope for all app, that can be shared
app.controller('StatusController', function(){

  var vm = this;

  vm.statuses = _statuses;

});
