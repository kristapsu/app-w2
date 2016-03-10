//styles
import 'angular-material/angular-material.css';
import './app.css';

//basic libraries
import 'lodash';
import 'angular';

//additional libraries
import angularMaterial from 'angular-material';
import uiRouter from 'ui-router';

var app = angular.module('firstApp', [
    uiRouter,
    angularMaterial
]);

app.config(function ($stateProvider, STATES) {
    $stateProvider
        .state(STATES.MAIN, {
            abstract: true,
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

app.constant('TIMEOUTS', {
    COMET: 2000
});

app.run(function ($state, UserService, STATES) {
    if (UserService.hasUser()) {
        //go to status
        $state.go(STATES.USER);
    } else {
        //go to login
        $state.go(STATES.LOGIN);
    }
});

app.service('UserService', function () {
    var service = this;

    var USERNAME_KEY = 'username';

    var _user = {
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

        if (_.isNull(username)) {
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

    function _hasUser() {
        return !_.isNull(_getUsername());
    }

    function _getUsername() {
        return _user.username;
    }
});

app.service('StatusService', function ($http, $timeout, TIMEOUTS) {
    var service = this;

    var SERVER_URL = 'http://10.0.1.86:8080/statuses';

    var _statuses = [];
    var _users = {};

    service.addStatus = _addStatus;
    service.getUsers = _getUsers;
    service.getStatuses = _getStatuses;

    init();

    function init() {
        var _getRequest = {
            method: 'GET',
            url: SERVER_URL
        };

        $http(_getRequest).then(function (res) {
            _statuses = res.data;

            _updateUsers();
        }).finally(function () {
            $timeout(init, TIMEOUTS.COMET);
        });
    }

    function _addStatus(newStatus) {
        if (!_.isEmpty(newStatus.user) && !_.isEmpty(newStatus.message)) {
            var _postRequest = {
                method: 'POST',
                url: SERVER_URL,
                data: newStatus
            };

            $http(_postRequest).then(__updateStatuses);

            //FIXME: undefined in Firefox 44
            function __updateStatuses(res) {
                if (!!res) {
                    _statuses.push(res.data);

                    _updateUsers();
                }
            }
        } else {
            console.log('User and message must be defined.');
        }
    }

    function _getUsers() {
        return _users;
    }

    function _getStatuses(username) {
        if (_.isEmpty(username)) {
            return [];
        } else {
            var filteredStatuses = _.filter(_statuses, function(status) {
                return status.user === username;
            });

            return _.sortBy(filteredStatuses, 'date').reverse();
        }
    }

    function _updateUsers() {
        var _sortedStatuses = _.sortBy(_statuses, 'date').reverse();

        var userNames = _.uniq(_.map(_statuses, 'user'));

        _.each(userNames, function getUserStatus(userName) {
            var userStatus = _.find(_sortedStatuses, function (status) {
                return status.user === userName;
            });

            if (!!userName) {
                if (!_users[userName]) {
                    _users[userName] = {};
                }
                _users[userName].date = _.get(userStatus, 'date');
                _users[userName].message = _.get(userStatus, 'message');
            }
        });
    }
});

app.controller('MainController', function ($state, UserService, STATES) {
    var vm = this;

    console.log('Application initialized.');

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

app.controller('LoginController', function ($state, UserService, STATES) {
    var vm = this;

    vm.username = '';

    vm.login = _login;

    function _login() {
        if (UserService.setUser(vm.username)) {
            $state.go(STATES.USER);
        }
    }
});

app.controller('UserController', function (UserService, StatusService) {
    // idea of what should hapen
    var vm = this;

    _resetForm();

    vm.setStatus = _setStatus;

    //implementation

    function _setStatus() {
        var __newStatus = {
            user: UserService.getUsername(),
            message: vm.message,
            date: new Date()
        };

        console.log('Sending user status:');
        console.log(JSON.stringify(__newStatus));

        StatusService.addStatus(__newStatus);

        _resetForm();
    }

    function _resetForm() {
        vm.message = '';
    }
});

app.controller('StatusController', function (StatusService, $mdDialog, TIMEOUTS) {
    var vm = this;

    vm.users = StatusService.getUsers();

    vm.isRecent = function (user) {
        var now = new Date();
        var userDate = new Date(user.date);

        return (now - userDate) < TIMEOUTS.COMET * 2;
    }

    vm.showHistory = function (user) {
        $mdDialog.show({
            template: require('./history.html'),
            controller: 'HistoryController',
            controllerAs: 'historyCtrl',
            clickOutsideToClose: true,
            locals: {
                'User': user
            }
        });
    }
});

app.controller('HistoryController', function($mdDialog, StatusService, User){
    var vm = this;

    vm.username = User.name;

    vm.refresh = _refresh;

    _refresh();

    function _refresh() {
      vm.statuses = StatusService.getStatuses(User.name);
    }

    vm.close = function () {
        $mdDialog.hide();
    }
});

app.filter('orderUsers', function () {
    var lastLists = {};

    var STATUS_LIMIT = 6;

    return function orderUsersFilter(userMap, mapName) {
        var userList = _.map(userMap, generateNewUser);
        var sortedList = _.sortBy(userList, 'date').reverse();

        var newList = _.slice(sortedList, 0, STATUS_LIMIT);

        if (!!mapName) {
            if (JSON.stringify(lastLists[mapName]) !== JSON.stringify(newList)) {
                lastLists[mapName] = newList;
            }

            return lastLists[mapName];
        } else {
            //FIXME: digest loop with no name
            return newList;
        }

        function generateNewUser(status, name) {
            var newUser = {
                name: name
            };

            _.defaults(newUser, status);

            return newUser;
        }

    }
});
