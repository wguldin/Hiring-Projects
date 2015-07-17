// Binds json db data to each contact.
function singleContact(data) {
  var self = this;

  self.firstName = data.firstname;
  self.lastName = data.lastname;

  self.fullName = ko.computed(function() {
      return self.firstName + " " + self.lastName;    
  }, self);

  self.image = data.image;
  self.position = data.position;
  self.company = data.company;
  self.phone = data.phone;
  self.email = data.email;
  self.address = data.address;
  self.notes = data.notes;
};

function detailViewModel(contactID) {
  var self = this;
  self.contactID = ko.observable(contactID);
  self.contact = ko.observableArray([]);

  self.getContact = function(id) {
    // JSON-Server is a little too fast. View can show up blank without delay.
    setTimeout(function() { 
      $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/contacts/' + id,
        dataType: 'json',
        success: function(data) {
          var contactData = new singleContact(data);
          self.contact(contactData);
        }
      });
    }, 100);
  }

  self.getContact(self.contactID());
};