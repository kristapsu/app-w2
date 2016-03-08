var app = angular.module('firstApp', []);

// global variable, place to store data (bad thing - exposed to user who uses web browser)
// var _statuses = [];

// Singleton - object is itionalised once, and it stays forever, in angular it's called SERVICE

app.service('UserService', function(){

  var service = this;

  var USERNAME_KEY = 'username';

  var _user = {
    // localStorage is a browser stuff
    username: localStorage.getItem(USERNAME_KEY),
    //TODO: implement password support in the future
    password: undefined
  };

  service.setUser = _setUser;
  service.removeUser = _removeUser;
  service.getUsername = _getUsername;
  service.hasUser = _hasUser;

  function _setUser(username) {
    _user.username = username;
    // if username is null remove stored usernames or else set it
    if(_.isNull(username)) {
      localStorage.removeItem(USERNAME_KEY);
    } else {
      localStorage.setItem(USERNAME_KEY, username);
    }
  }

  function _removeUser() {
    _setUser(null);
  }

  function _hasUser (){
    // we set username to Null ourselves
    return !_.isNull(_getUsername())
  }

  function _getUsername() {
    return _user.username;
  }

});



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

app.controller('MainController', function(UserService) {
  var vm = this;

  vm.hasUser = UserService.hasUser;
  vm.getUsername = UserService.getUsername;
  vm.removeUser = UserService.removeUser;
});


app.controller('LoginController', function(UserService){

  var vm = this;

  vm.username = '';

  vm.login = _login;

  function _login() {
      UserService.setUser(vm.username);
  }

});

app.controller('UserController', function(UserService, StatusService){
  //idea of what should happen
  var vm = this;

  _resetForm();

  vm.setStatus = _setStatus;

  //implemitaiton

  function _setStatus(){
    var _newStatus = {
      user: UserService.getUsername(),
      message: vm.message,
      date: vm.date
    };

    console.log('Sending user status');
    console.log(JSON.stringify(_newStatus));

    StatusService.addStatus(_newStatus);

    _resetForm();

  };

  function _resetForm(){
    vm.message = '';
    vm.date = new Date();
  }
});

// RootScope - scope for all app, that can be shared
app.controller('StatusController', function(StatusService){
  var vm = this;

  vm.statuses = StatusService.getStatuses();

});
