'use strict';

// Register `pollDetail` component, along with its associated controller and template
angular.
  module('instantAssignment').
  component('instantAssignment', {
    templateUrl: 'components/instant-assignment/instant-assignment.template.html',
    controller: ['$http', '$routeParams',
      function InstantAssignmentController($http, $routeParams) {

        var self = this;

        self.addChoice = addChoice;
        self.removeChoice = removeChoice;
        self.addParticipant = addParticipant;
        self.removeParticipant = removeParticipant;

        self.calculateAssignments = calculateAssignments;

        self.getChoiceTitleById = getChoiceTitleById;

        self.loadExample = loadExample;

        self.getClass = getClass;

        function getClass(input) {

            if(input) {
              return "highlight";
            }

            

        }

        function loadExample() {
            $http.get('assets/json/polls.json').then(function(response) {
                var example = response.data[0];

                var exChoices = [];
                for (var i = 0; i < example.mentors.length; i++) {

                  exChoices.push(
                      {
                        id: parseInt(example.mentors[i].mentorId), 
                        title : example.mentors[i].name,
                        capacity : parseInt(example.mentors[i].maxCap)
                      }
                  );
                }
                // console.log(exChoices);
                self.choices = exChoices;

                var exParticipants = [];
                for (var i = 0; i < example.mentees.length; i++) {

                  var exSelected = [];
                  for (var j = 0; j < example.mentees[i].ranking.length; j++) {

                      // var rank = example.mentees[i].ranking;
                      // console.log("lenght: " + rank.length);

                      // console.log(example.mentees[i].ranking.length);
                      exSelected.push(parseInt(example.mentees[i].ranking[j]));
                  }
                  // console.log(example.mentees[i].name + " " + example.mentees[i].ranking);

                  exParticipants.push(
                      {
                        id: parseInt(example.mentees[i].menteeId), 
                        name : example.mentees[i].name,
                        email : example.mentees[i].email,
                        selected : exSelected,
                        unselected : []
                      }
                  );
                }
                // console.log(exParticipants);
                self.participants = exParticipants;
                });
        }

        


        // Main variables
        self.choices = [
          {id : 1, title : "Max Mustermann",capacity : 2},
          {id : 2, title : "Berta Brecht", capacity : 5}
        ];

        self.participants = [
          {id : 1, name : "Nadège Héraud-Chevé", email : "fred.young@gmx.at", selected : [2, 1], unselected : []},
          {id : 2, name : "Laure Brouard", email : "laure.brouard@gmx.at", selected : [1], unselected : [2]},
          {id : 3,name : "Martin Frech",email : "martin.frech@gmx.at", selected : [1, 2], unselected : []}
        ];

        self.results = [];

        function addChoice() {

            var newChoiceId = Date.now();
            console.log("new id: " + newChoiceId);

            this.choices.push(
                {
                    id: newChoiceId, 
                    title : "New Choice",
                    capacity : 2
                });
            
            // Add choice to participants
            for (var i=0; i < self.participants.length; i++) {
                self.participants[i].unselected.push(newChoiceId);
                console.log("after adding: " + self.participants[i].unselected);
            }

            
        };

        function removeChoice(choiceToRemove) {

            var choiceIdToBeDeleted = choiceToRemove.id;
            console.log("remove: "+choiceIdToBeDeleted);

            var index = this.choices.indexOf(choiceToRemove);
            self.choices.splice(index, 1);

            // Remove choice from participants
            // Add choice to participants
            for (var i=0; i < self.participants.length; i++) {

                var tmpIndex = self.participants[i].selected.indexOf(choiceIdToBeDeleted);
                if(tmpIndex != -1) {
                  self.participants[i].selected.splice(tmpIndex, 1);
                }
                
                tmpIndex = self.participants[i].unselected.indexOf(choiceIdToBeDeleted);
                if(tmpIndex != -1) {
                  self.participants[i].unselected.splice(tmpIndex, 1);
                }
            }
        };

        function addParticipant() {

            var choicesAvailable = this.choices.map(function(a) {return a.id;});

            self.participants.push(
                {
                    id: Date.now(), 
                    name : "New Participant",
                    email : "",
                    selected : [],
                    unselected : choicesAvailable
                });     
        };

        function calculateAssignments() {

            
          // STEP 1: Create lookup table
            var totalCapacity = 0

            var lookupChoices = {};

            for (i = 0; i < self.choices.length; i++) {  //loop through the array
                totalCapacity += parseInt(self.choices[i].capacity);  //Do the math!

                // Increase index by mentors
                var startIdx = totalCapacity - parseInt(self.choices[i].capacity);

                lookupChoices[parseInt(self.choices[i].id)] = 
                    {
                        index : i,
                        title : self.choices[i].title,
                        capacity : parseInt(self.choices[i].capacity),
                        startIdx : startIdx
                    };
            }

            console.log(totalCapacity);

                        
            // STEP 2: Build matrix (for calculation purposes)
            var matrix = [];

            // Fill matrix with default weight values
            var defaultWeight = self.participants.length;
            for (var i = 0; i < self.participants.length; i++) {
                matrix[i] = [];
                for (var j = 0; j < totalCapacity; j++) {
                    matrix[i][j] = defaultWeight;
                }
                console.log("row " + matrix[i]);
            }
                          
            // Fill matrix with real weight values (aka preferences)
            for (var i = 0; i < self.participants.length; i++) {

                var weight = 1; // Start with 1st choice (weight = 1)

                // Loop through preferences and add weight to matrix
                var selectedPreferences = self.participants[i].selected;
                for(var j = 0; j < selectedPreferences.length; j++) {

                    var choice = lookupChoices[parseInt(selectedPreferences[j])];
                    var curStartIdx = parseInt(choice.startIdx);

                    // Insert weigth at calculated start index
                    for (var k = 0; k < choice.capacity; k++) {
                        // Set weight
                        // alert(curStartIdx);
                        matrix[i][curStartIdx] = weight;
                        curStartIdx = curStartIdx + 1;
                    }
                    weight = weight + 1;

                }
                console.log("row " + matrix[i]);
            }


           // STEP 3: Calculate !               
           var m = new Munkres();
           var indices = m.compute(matrix);
           
           console.log(indices);

          // STEP 4: Build matrix (for displaying purposes)

          var resultMatrix = [];
          // Initialize matrix
          for (var i = 0; i <= self.participants.length; i++) {
                resultMatrix[i] = [];
                for (var j = 0; j <= self.choices.length; j++) {
                    resultMatrix[i][j] = "";
                }
            }

          // HEADER
          for (var i = 0; i < self.choices.length; i++) {
              resultMatrix[0][i+1] = self.choices[i].title;
          }

          // CONTENT (Go through indices)

          var totalCost = 0;
          for (var k = 0; k < indices.length; ++k) {
              var i = indices[k][0], j = indices[k][1];
              totalCost += matrix[i][j];

              var value = matrix[i][j];

              resultMatrix[i+1] = [];
              resultMatrix[i+1][0] = self.participants[i].name;

              // get mentor index
              var selectedChoice = self.participants[i].selected[value-1];
              var selectedChoiceIdx = lookupChoices[parseInt(selectedChoice)].index;

              resultMatrix[i+1][selectedChoiceIdx + 1] = value;
              
          }

          // STEP 5: Display results
          self.results = resultMatrix;


        };

        function removeParticipant(participantToRemove) {
            var index = this.participants.indexOf(participantToRemove);
            this.participants.splice(index, 1);
        };

        function getChoiceTitleById(choiceId) {
            var obj = findElement(this.choices, "id", choiceId);
            // alert(obj.title);
            return obj.title;
        };

        // Helper methods
        // Find array object by value of specific property
        function findElement(arr, propName, propValue) {
            for (var i=0; i < arr.length; i++)
                if (arr[i][propName] == propValue)
                return arr[i];

        // will return undefined if not found; you could return a default instead
        }

        self.sortableOptions = {
          placeholder: "sortablePlaceholder",
          connectWith: ".connectedSortable"
        };

        // Called only once when document is "ready"
        $( function() {

            // Set widget options
            $( "#accordion1, #accordion2" ).accordion({
            header: "> div > h3",
            collapsible: true,
            heightStyle: "content"
            });

            // Event handler
            $('#addAccordion1').click( function() {
                var accordionIndex = self.choices.length - 1;
                $('#accordion1').accordion("refresh");
                $("#accordion1").accordion({active : accordionIndex});
            });

            $('#addAccordion2').click( function() {
                var accordionIndex = self.participants.length - 1;
                $('#accordion2').accordion("refresh");
                $("#accordion2").accordion({active : accordionIndex}); 
            });

            $('#loadExample1').click(function() {
                $('#accordion1').accordion("refresh");
                $('#accordion2').accordion("refresh");
            });
            
        } );

      }
    ]
  });