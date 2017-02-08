'use strict';

// Register `pollList` component, along with its associated controller and template
angular.
  module('pollList').
  component('pollList', {
    templateUrl: 'components/poll-list/poll-list.template.html',

    controller: ['$http', function PollListController($http) {
      var self = this;

      // self.orderProp = 'age';

      $http.get('assets/json/polls.json').then(function(response) {
        self.polls = response.data;
      });


/* Class for Student */

        // function Poll(name){
        //   this.id = Date.now();
        //   this.name = name || '';
        //   this.mentors = [];
        //   this.participants = [];
        // }

          self.id = '';
          self.name = '';
          self.mentors = [];
          self.mentees = [];  

         this.addNewPoll = function() {
            self.id = Date.now();

            self.polls.push(
                {
                    "id": self.id, 
                    "name": self.name, 
                    "mentors": self.mentors,
                    "mentees": self.mentees
                }
            );

          self.id = '';
          self.name = '';
          self.mentors = [];
          self.mentees = [];  

        };

    }]
  });
