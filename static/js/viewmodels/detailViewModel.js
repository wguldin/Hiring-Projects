// Binds json db data to each contact.
function singleContact(data) {
  var self = this;
  
  self.contactId = data.id;
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
  self.city = data.city;
  self.state = data.state;
  self.notes = data.notes;

  self.emailLink = ko.computed(function() {
    return 'mailto:' + self.email;
  });

  self.phoneLink = ko.computed(function() {
    return 'tel:' + self.phone;
  });

  self.addressLink = ko.computed(function() {
    var fullAddress = self.address + " " + self.city + " " + self.state;

    return 'https://www.google.com/maps/place/' + fullAddress;
  })

  self.addTagLabel = ko.observable("");

  self.addTag = function() {
    self.tags.push(new single_tag(self.addTagId, self.contactId, self.addTagLabel()));
    postTag(uuid.generate(), self.contactId, self.addTagLabel);

    self.addTagLabel(""); // Reset Tag Label after tag is added.
  }

  self.removeTag = function(tag) {
    deleteTag(tag);
    self.tags.destroy(tag);
  };

  var processTags =  ko.utils.arrayMap(data.tags, function(item) {
      return new single_tag(item.id, item.contactId, item.tagLabel);
  });

  self.tags = ko.observableArray(processTags);

  var processReminders =  ko.utils.arrayMap(data.reminders, function(item) {
      return new single_reminder(item.id, item.contactId, item.reminderName, item.reminderNote, item.reminderDate);
  });

  self.reminders = ko.observableArray(processReminders);
};

function detailViewModel(contactId) {
  var self = this;
  self.contactId = ko.observable(contactId);
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

  self.getContact(self.contactId());
};