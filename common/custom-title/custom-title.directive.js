'use strict';

// Register `phoneList` component, along with its associated controller and template
angular.
  module('myApp').
  directive('customTitle', function(){
      return {
          template: "<h1> Made by a directive!</h1>"
        //   templateUrl: 'mentor-list/mentor-list.template.html'
      };

  });