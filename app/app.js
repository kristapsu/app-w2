import 'angular-material/angular-material.css';

//basic libaries
import 'lodash';
import 'angular';

//addition libaries
import angularMaterial from 'angular-material';
import uiRouter from 'ui-router';

import './app.css';

var app = angular.module('firstApp', [
  uiRouter,
  angularMaterial
]);

// specify configuration for app, before it is inalitized
// prepare state for services and controllers to be initialised
app.config(function($stateProvider, STATES){
  $stateProvider
      .state(STATES.MAIN, {
        abstract: true,
        // url: '#/', ==== http://localhost:8090/#/
        // url: '', === http://localhost:8090/webpack-dev-server/
        url: '',
        template: require('./main.html'),
        controller: 'MainController',
        controllerAs: 'mainCtrl'
      })
      .state(STATES.LOGIN, {
        template: require('./login.html'),
        controller: 'LoginController',
        controllerAs: 'loginCtrl'
      })
      .state(STATES.USER, {
        template: require('./user.html'),
        controller: 'UserController',
        controllerAs: 'userCtrl'
      });
});

app.constant('STATES', {
  MAIN: 'main',
  LOGIN: 'main.login',
  USER: 'main.user'
});

//Specify whayt happens when we run our app
app.run(function($state, UserService, STATES) {
  if (UserService.hasUser()){
    //go to status
    $state.go(STATES.USER);
  } else {
    //go to login
    $state.go(STATES.LOGIN);
  }
});


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
      return false;
    } else {
      localStorage.setItem(USERNAME_KEY, username);
      return true;
    }
  }

  function _removeUser() {
    return !_setUser(null);
  }

  function _hasUser (){
    // we set username to Null ourselves
    return !_.isNull(_getUsername())
  }

  function _getUsername() {
    return _user.username;
  }

});

// looks for timeout provider
app.service('StatusService', function($http, $timeout) {
  var service = this;
  // localhost/8080

  var SERVER_URL = 'http://10.0.1.86:8080/statuses';

  var _statuses = [];
  //list of all users using the app
  var _users = {};

  //displaying, functions that can be used outside of this server
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
    var _sortedStatuses = _.sortBy(_statuses, 'date').reverse();

    //after users update,d remove list of current users and copy
    var userNames = _.uniq(_.map(_statuses, 'user'));

    _.each(userNames, function getUserStatus(userName){
      var userStatus = _.find(_sortedStatuses, function(status){
        return status.user === userName;
      });

      if (!!userName) {
        if (!_users[userName]){
         _users[userName] = {};
        }
        _users[userName].date = _.get(userStatus, 'date');
        _users[userName].message = _.get(userStatus, 'message');
      }

    });
  }

});


app.controller('MainController', function($state, UserService, STATES) {
  var vm = this;

  console.log('Application in launched');

  vm.hasUser = UserService.hasUser;
  vm.getUsername = UserService.getUsername;
  vm.logout = function () {
    console.log('Will try to logout.');
    if (UserService.removeUser()) {
        console.log('User removed, moving to login.');
        $state.go(STATES.LOGIN);
    } else {
        console.log('Logout failed.');
    }
  };
});


app.controller('LoginController', function($state, UserService, STATES){

  var vm = this;

  vm.username = '';

  vm.login = _login;

  function _login() {
      if (UserService.setUser(vm.username)){
          $state.go(STATES.USER);
      }
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

app.filter('orderUsers', function(){
  var lastLists = {};

  return function orderUsersFilter(userMap, mapName){
    var userList = _.map(userMap, generateNewUser);
    var newList = _.sortBy(userList, 'date').reverse();

    if (!!mapName) {
      if (JSON.stringify(lastLists[mapName]) !== JSON.stringify(newList)){
        lastLists[mapName] = newList;
      }

      return lastLists[mapName];
    } else {
      //FIXME: difest loop with no name
      return newList;
    }

    function generateNewUser(status, name){
      var newUser = {
        name: name
      };

      _.defaults(newUser, status);

      return newUser;
    }

  }
});
