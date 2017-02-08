'use strict';

angular.
  module('core.poll').
  factory('Poll', ['$resource',
    function($resource) {
      return $resource('polls/:pollId.json', {}, {
        query: {
          method: 'GET',
          params: {phoneId: 'phones'},
          isArray: true
        }
      });
    }
  ]);
