'use strict';

// Register `pollDetail` component, along with its associated controller and template
angular.
  module('pollDetail').
  component('pollDetail', {
    templateUrl: 'components/poll-detail/poll-detail.template.html',
    controller: ['$http', '$routeParams',
      function PollDetailController($http, $routeParams) {
        var self = this;

        self.addNewMentor = addNewMentor;
        self.addNewMentee = addNewMentee;
        self.calculate = calculate;

        self.results = [];/* [[4, 5, 6], [2, 3, 4], [3, 4, 5]];*/

        // Load one time the json file, and set the 
        $http.get('assets/json/polls.json').then(function(response) {
          function findId(data, idToLookFor) {
                var categoryArray = data;
                for (var i = 0; i < categoryArray.length; i++) {
                    if (categoryArray[i].id == idToLookFor) {
                        return(categoryArray[i]);
                    }
                }
            }

            var item = findId(response.data, $routeParams.pollId);

            self.poll = item;
        });

        // Basic Data of New Mentor
        self.mentorName = '';
        self.mentorCap = '';

        // this.addNewMentor = function() {
        function addNewMentor() {
            this.poll.mentors.push(
                {
                    "mentorId": Date.now(), 
                    "name": self.mentorName,
                    "maxCap": self.mentorCap,
                    "description": ''
                });

            self.mentorName = '';
            self.mentorCap = '';

        };

        // Basic Data of New Participant
        self.menteeName = '';
        self.menteeEmail = '';
        self.ranking = [];



        // this.addNewMentee = function() {
        function addNewMentee() {
            this.poll.mentees.push(
                {
                    "menteeId": Date.now(), 
                    "name": self.menteeName,
                    "email":self.menteeEmail,
                    "ranking": self.ranking
                });

            self.menteeName = '';
            self.menteeEmail = '';
            self.ranking = [];
        };

    

        function calculate() {



            var matrix = [[5, 9, 1],
                          [10, 3, 2],
                          [8, 7, 4]];

            var totalCapacity = 0

            var mentorLookup = {};


            for (i = 0; i < self.poll.mentors.length; i++) {  //loop through the array
                totalCapacity += parseInt(self.poll.mentors[i].maxCap);  //Do the math!

                // Increase index by mentors
                var startIdx = totalCapacity - parseInt(self.poll.mentors[i].maxCap);

                mentorLookup[self.poll.mentors[i].mentorId] = 
                    {
                        "index" : i,
                        "name" : self.poll.mentors[i].name,
                        "maxCap" : self.poll.mentors[i].maxCap,
                        "startIdx" : startIdx
                    };
            }

           

            // Build matrix
            var matrix2 = [];

            // Fill matrix with default values
            for (var i = 0; i < self.poll.mentees.length; i++) {
                matrix2[i] = [];
                for (var j = 0; j < totalCapacity; j++) {
                    matrix2[i][j] = self.poll.mentors.length;
                }
            }

            
            // Fill matrix with real values
            for (var i = 0; i < self.poll.mentees.length; i++) {

                var weight = 1;
                var ranks = self.poll.mentees[i].ranking;
                for(var j = 0; j < ranks.length; j++) {
                    // alert("Student: " + self.poll.mentees[i].name + " choice " + ranks[j]);
                    // alert("mentor " + mentorLookup[ranks[j]].startIdx);

                    var mentorL = mentorLookup[ranks[j].toString()];
                    var curStartIdx = parseInt(mentorL.startIdx);
                    // alert("startidx " + mentorL.name + " " + curStartIdx);

                    // Insert weigth
                    for (var k = 0; k < mentorLookup[ranks[j]].maxCap; k++) {
                        // Set weight
                        // alert(curStartIdx);
                        matrix2[i][curStartIdx] = weight;
                        curStartIdx = curStartIdx + 1;
                    }
                    weight = weight + 1;

                }

                // alert(matrix2[i]);

            }

            // alert(matrix[0]);
            
            var m = new Munkres();
			var indices = m.compute(matrix2);
            // alert(indices);


            // Build matrix
            var tmpResults = [];
            tmpResults[0] = [];
            tmpResults[0][0] = "";
            for (var i = 0; i < self.poll.mentors.length; i++) {
                tmpResults[0][i+1] = self.poll.mentors[i].name;
            }

            tmpResults[1] = [];
            tmpResults[1][5] = "sdf";

            

            // Fill matrix with default values
            // for (var i = 0; i < self.poll.mentors.length; i++) {
            //     matrix2[i] = [];
            //     for (var j = 0; j < self.poll.mentees.length; j++) {
            //         matrix2[i][j] = self.poll.mentors.length;
            //     }
            // }



            var totalCost = 0;
            for (var k = 0; k < indices.length; ++k) {
                var i = indices[k][0], j = indices[k][1];
                totalCost += matrix2[i][j];

                var value = matrix2[i][j];
   
                tmpResults[i+1] = [];
                tmpResults[i+1][0] = self.poll.mentees[i].name;

                // get mentor index
                var assgnMentor = self.poll.mentees[i].ranking[value-1];
                var assgnMentorIdx = mentorLookup[assgnMentor].index;

                tmpResults[i+1][assgnMentorIdx + 1] = "Choice " + value;
                
            }

            self.results = tmpResults;


        document.getElementById('total-cost').value = totalCost;

            document.getElementById('indices').value = indices.map(function (ind) {
                return [ '[', ind.join(','), ']' ].join('');
            }).join(', ');

        }

        // Helper methods
        function findElement(arr, propName, propValue) {
            for (var i=0; i < arr.length; i++)
                if (arr[i][propName] == propValue)
                return arr[i];

        // will return undefined if not found; you could return a default instead
        }


        // For loading the page. when it is ready
      $( function() {
        // Version 1
        // $( "#sortable" ).sortable();

        // Version 2
        $( "#sortable" ).sortable({
        placeholder: "ui-state-highlight",
        cursor: 'crosshair',
        update: function(event, ui) {
            var order = $("#sortable").sortable("toArray");
            self.ranking = order;
            // $('#mentor_order').val(order.join(","));
            // alert($('#mentor_order').val());
        }
        });
        $( "#sortable" ).disableSelection();

        // Version 3
        $( "#sortable1, #sortable2" ).sortable({

            connectWith: ".connectedSortable",
            update: function(event, ui) {
                var order = $("#sortable1").sortable("toArray");
                self.ranking = order;
                console.log('receiving id :');
            }   
        }).disableSelection();

      } );

        
      }
    ]
  });