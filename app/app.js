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







app.service('StatusService', function($http, $timeout) {
  var service = this;
  // localhost/8080

  var SERVER_URL = 'http://10.0.1.86:8080/statuses';

  var _statuses = [];
  var _userStatuses = [];
  //list of all users using the app
  var _users = [];

  //displaying, functions that can be used outside of this server
  service.getStatuses = _getStatuses;
  service.addStatus = _addStatus;
  service.getUsers = _getUsers;

  init();

  function init(){
    // These are "PROMISES", http is going to do call, and it happens only when we get data and promise is forfilled
    var _getRequest = {
      method: 'GET',
      url: SERVER_URL
    };

    $http(_getRequest).then(function(res){
      _statuses = res.data;

      // ??? what did this part do?
      _updateUsers();

      $timeout(init, 1500);
    });
  }

  function _getStatuses() {
    return _userStatuses;
  }

  function _addStatus(newStatus){
    // check if user and message exists
    if (!_.isEmpty(newStatus.user) && !_.isEmpty(newStatus.message)){

      var _postRequest = {
        method: 'POST',
        url: SERVER_URL,
        data: newStatus
      };

      $http(_postRequest).then(_updateStatuses);

      function _updateStatuses(res) {
        if(!!res){
          _statuses.push(res.data);

          // old statuses update
          _updateUsers();
        }
      }

    }else{
      console.log('User and message must be defined!');
    }

  }

  function _getUsers(){
    return _users;
  }

  function _updateUsers() {
    _userStatuses.splice(0);
    var _sortedStatuses = _.sortBy(_statuses, 'date');
    angular.copy(_sortedStatuses.reverse(), _userStatuses);

    //after users update,d remove list of current users and copy
    _users.splice(0);
    var userNames = _.uniq(_.map(_statuses, 'user'));

    _.each(userNames, function getUserStatus(userName){
      var newUser = {
        name: userName
      };

      var userStatus = _.find(_userStatuses, function(status){
        return status.user === userName;
      });

      if (!!userName && !!userStatus) {
        newUser.date = userStatus.date;
        newUser.message = userStatus.message;

        _users.push(newUser);
      }

    });
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
      //date: vm.date (To set date)
      date: new Date()
    };

    console.log('Sending user status');
    console.log(JSON.stringify(_newStatus));

    StatusService.addStatus(_newStatus);

    _resetForm();

  };

  function _resetForm(){
    vm.message = '';
    //vm.date = new Date(); (To set date)
  }
});

// RootScope - scope for all app, that can be shared
app.controller('StatusController', function(StatusService){
  var vm = this;

  vm.users = StatusService.getUsers();

});
