function tag(id, contactID, tagLabel) {
    var self = this;

    self.id = id;
    self.contactID = contactID;
    self.tagLabel = tagLabel;
}

function reminder(id, contactID, reminderName, reminderNote, reminderDate) {
    var self = this;

    self.id = id;
    self.contactID = contactID;
    self.reminderName = reminderName;
    self.reminderNote = reminderNote;
    self.reminderDate = reminderDate;
}

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

  var processTags =  ko.utils.arrayMap(data.tags, function(item) {
      return new tag(item.id, item.contactID, item.tagLabel);
  });

  self.tags = ko.observableArray(processTags); 

  var processReminders = ko.utils.arrayMap(data.reminders, function(item) {
      return new reminder(item.id, item.contactId, item.reminderName, item.reminderNote, item.reminderDate);
  });

  self.reminders = ko.observableArray(processReminders); 
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
        url: 'http://localhost:3000/contacts/' + id + '?_embed=tags&_embed=reminders',
        dataType: 'json',
        success: function(data) {
          var contactData = [new singleContact(data)];
          self.contact(contactData);
        }
      });
    }, 100);
  }

  self.getContact(self.contactID());
};