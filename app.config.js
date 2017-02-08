'use strict';

// Declare app level module which depends on views, and components
angular.
  module('myApp').
    config(['$locationProvider', '$routeProvider',
      function($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('!');

        $routeProvider.
          when('/mentors', {
              template: '<mentor-list></mentor-list>'
            }).
          when('/polls', {
            template: '<poll-list></poll-list>'
          }).
          when('/polls/:pollId', {
            template: '<poll-detail></poll-detail>'
          }).
          when('/instant', {
            template: '<instant-assignment></instant-assignment>'
          }).
          otherwise({redirectTo: '/view1'});

      }
    ]);
