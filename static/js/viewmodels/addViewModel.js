

function addViewModel() {
  var self = this;

  self.fullname = ko.observable("");

  // Split the full name (http://stackoverflow.com/questions/10272773/split-string-on-the-first-white-space-occurence)
  // Given 'Paul Smith Johnson', firstname: 'Paul', lastname: 'Smith Johnson'
  self.firstname = ko.computed(function() {
    return self.fullname().substr(0, self.fullname().indexOf(' '));
  }, self);

  self.lastname = ko.computed(function() {
    return self.fullname().substr(self.fullname().indexOf(' ') + 1);
  }, self);

  self.position = ko.observable();
  self.company = ko.observable();
  self.email = ko.observable();
  self.phone = ko.observable();
  self.address = ko.observable();
  self.notes = ko.observable();
  self.createdBy = localStorage.getItem("user");

  self.addContact = function() {
    console.log(self.contactInformation());

    setTimeout(function(){
      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/contacts',
        data: self.contactInformation(),
        dataType: 'json',
        success: function(data) {
          console.log(data)
        }
      });
    }, 100);
  }

  self.contactInformation = function() {
    return ko.toJS({
      "firstname": self.firstname(),
      "lastname": self.lastname(),
      "position": self.position(),
      "company": self.company(),
      "email": self.email(),
      "phone": self.phone(),
      "address": self.address(),
      "notes": self.notes(),
      "createdBy": self.createdBy,
      "registered": "",
    })
  }
};