

function addViewModel() {
  var self = this;

  self.firstname = ko.observable();
  self.lastname = ko.observable();
  self.position = ko.observable();
  self.company = ko.observable();
  self.email = ko.observable();
  self.phone = ko.observable();
  self.address = ko.observable();
  self.notes = ko.observable();
  self.createdBy = localStorage.getItem("user");

  self.addContact = function() {
    //console.log(self.contactInformation());

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