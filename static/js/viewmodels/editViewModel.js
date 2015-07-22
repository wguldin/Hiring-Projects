function edit_singleContact(data) {
  var self = this;
  
  self.contactId = data.id;
  self.fullname = ko.observable(data.firstname + ' ' + data.lastname);

  self.firstname = ko.computed(function() {
    return self.fullname().substr(0, self.fullname().indexOf(' '));
  }, self);

  self.lastname = ko.computed(function() {
    return self.fullname().substr(self.fullname().indexOf(' ') + 1);
  }, self);
  
  self.fullnameFormatted = ko.computed(function() {
    return self.firstname() + " " + self.lastname();
  }, self);

  self.position = ko.observable(data.position);
  self.company = ko.observable(data.company);
  self.phone = ko.observable(data.phone);
  self.email = ko.observable(data.email);
  self.address = ko.observable(data.address);
  self.city = ko.observable(data.city);
  self.state = ko.observable(data.state);
  self.zipcode = ko.observable(data.zipcode)
  self.notes = ko.observable(data.notes);
};

function editViewModel(contactId) {
  var self = this;
  self.contactId = ko.observable(contactId);
  self.contact = ko.observableArray([]);

  self.editContact = function() {
    if (self.errors().length !== 0) {
      self.errors.showAllMessages();

      return;
    } 
  }

  self.getContact = function(id) {
    // JSON-Server is a little too fast. View can show up blank without delay.
    setTimeout(function() {
      $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/contacts/' + id,
        dataType: 'json',
        success: function(data) {
          var contactData = [new edit_singleContact(data)];
          self.contact(contactData);
        }
      });
    }, 100);
  }

  self.getContact(self.contactId());
};