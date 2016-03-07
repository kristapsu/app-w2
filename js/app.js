var app = angular.module('firstApp', []);

// global variable, place to store data (bad thing - exposed to user who uses web browser)
// var _statuses = [];

// Singleton - object is itionalised once, and it stays forever, in angular it's called SERVICE

app.service('StatusService', function() {
  var service = this;

  var _statuses = [];
  var _userStatuses = [];

  service.addStatus = function(newStatus){
    // check if user and message exists
    if (!_.isEmpty(newStatus.user) && !_.isEmpty(newStatus.message)){
      _statuses.push(newStatus);

      // old statuses
      _userStatuses.splice(0);
      angular.copy(_statuses, _userStatuses);
    }else{
      alert('User and message must be defined!');
    }

  }

  //displaying
  service.getStatuses = function () {
    return _userStatuses;
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
      message: vm.message,
      date: vm.date
    };

    console.log('Sending user status');
    console.log(JSON.stringify(_newStatus));

    StatusService.addStatus(_newStatus);

    _resetForm();

  };

  function _resetForm(){
    vm.user = '';
    vm.message = '';
    vm.date = new Date();
  }
});

// RootScope - scope for all app, that can be shared
app.controller('StatusController', function(StatusService){
  var vm = this;

  vm.statuses = StatusService.getStatuses();

});
