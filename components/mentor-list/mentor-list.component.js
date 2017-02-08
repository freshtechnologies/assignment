'use strict';

// Register `phoneList` component, along with its associated controller and template
angular.
  module('mentorList').
  component('mentorList', {
    templateUrl: 'components/mentor-list/mentor-list.template.html',
    controller: function MentorListController() {

        this.items = ["One", "Two", "Three"];

      this.name = 'John Smith';
      this.contacts = [
        {type:'phone', value:'408 555 1212'},
        {type:'email', value:'john.smith@example.org'}
      ];

        this.greet = function() {
            alert(this.name);
        };

        this.addContact = function() {
            this.contacts.push({type:'email', value:'yourname@example.org'});
        };

        this.removeContact = function(contactToRemove) {
            var index = this.contacts.indexOf(contactToRemove);
            this.contacts.splice(index, 1);
        };

        this.clearContact = function(contact) {
            contact.type = 'phone';
            contact.value = '';
        };
    }
  });
