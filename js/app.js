var app = angular.module('firstApp', []);

// global variable, place to store data (bad thing - exposed to user who uses web browser)
// var _statuses = [];

// Singleton - object is itionalised once, and it stays forever, in angular it's called SERVICE

app.service('StatusService', function() {
  var service = this;

  var _statuses = [];

  service.addStatus = function(newStatus){
    if(!!newStatus.user){
      _statuses.push(newStatus);
    }else{
      alert('User must be defined!');
    }

  }

  //displaying
  service.getStatuses = function () {
    return _statuses;
  }

});

app.controller('UserController', function(StatusService){
  //idea of what should happen
  var vm = this;

  _resetForm();

  vm.setStatus = _setStatus;

  //implemitaiton

  function _setStatus(){
    var _newStatus = {
      user: vm.user,
      message: vm.message
    };

    console.log('Sending user status');
    console.log(JSON.stringify(_newStatus));

    StatusService.addStatus(_newStatus);

    _resetForm();

  };

  function _resetForm(){
    vm.user = '';
    vm.message = '';
  }
});

// RootScope - scope for all app, that can be shared
app.controller('StatusController', function(StatusService){
  var vm = this;

  vm.statuses = StatusService.getStatuses();

});
