// Binds json db data to each contact.
function detail_singleContact(data) {
  var self = this;
  
  self.contactId = data.id;
  self.fullname =  ko.observable(data.firstname + ' ' + data.lastname);

  self.firstname = ko.computed(function() {
    return self.fullname().substr(0, self.fullname().indexOf(' '));
  }, self);

  self.lastname = ko.computed(function() {
    return self.fullname().substr(self.fullname().indexOf(' ') + 1);
  }, self);

  self.position = ko.observable(data.position);
  self.company = ko.observable(data.company);
  self.phone = ko.observable(data.phone);
  self.email = ko.observable(data.email);
  self.address = ko.observable(data.address);
  self.city = ko.observable(data.city);
  self.state = ko.observable(data.state);
  self.zipcode = ko.observable(data.zipcode);
  self.notes = ko.observable(data.notes);
  self.customImage = ko.observable(data.customImage);
  self.createdBy = data.createdBy;
  self.registered = data.registered;

  self.emailLink = 'mailto:' + self.email();
  self.phoneLink = 'tel:' + self.phone();

  self.addressLink = ko.computed(function() {
    var fullAddress = self.address() + " " + self.city() + " " + self.state();

    return 'https://www.google.com/maps/place/' + fullAddress;
  })

  self.addTagLabel = ko.observable("");

  // ===================================================
  // Tags
  // ===================================================

  var processTagsFromDB =  ko.utils.arrayMap(data.tags, function(item) {
    return new single_tag(item.id, item.contactId, item.tagLabel);
  });

  self.tags = ko.observableArray(processTagsFromDB);

  self.addTag = function() {
    var tagId = uuid.generate();

    self.tags.push(new single_tag(tagId, self.contactId, self.addTagLabel()));
    postTag(tagId, self.contactId, self.addTagLabel);

    self.addTagLabel(""); // Reset Tag Label after tag is added.
  }

  self.removeTag = function(tag) {
    deleteTag(tag);
    self.tags.destroy(tag);
  }
  
  // ===================================================
  // Reminders
  // ===================================================

  self.reminders = ko.observableArray([]);

  function processRemindersFromDB() {
    ko.utils.arrayMap(data.reminders, function(item) {
      if (item.createdBy == currentUser()) {
        self.reminders.push(new single_reminder(item.id, item.contactId, item.reminderName, item.reminderNote, item.reminderDate, item.createdBy));
      }
    })
  }

  processRemindersFromDB();

  self.reminderId   = ko.observable("");
  self.reminderNote = ko.observable("");
  self.reminderDate = ko.observable("");

  self.setReminderInformation = function () {
    // Only one reminder per person, so our reminder will always be the first item in the array.
    var reminder = self.reminders()[0];

    // If reminder exists, apply it to the view.
    if (reminder != null) {
      self.reminderId(reminder.id);
      self.reminderNote(reminder.reminderNote);
      self.reminderDate(formatDate(reminder.reminderDate, true));
    }
  }

  self.setReminderInformation();

  function setReminderId(reminderId) {
    if (reminderId == null) {
      return uuid.generate(); // For a new reminder.
    } else {
      return reminderId; // For a pre-existing reminder.
    }
  }

  self.updateReminder = function() {
    var id = setReminderId(self.reminderId());
    var contactId = self.contactId;
    var reminderName =  self.fullname();
    var reminderNote = self.reminderNote();
    var reminderDate = self.reminderDate();
    var reminderCreatedBy = currentUser();

    // Empty the array 
    self.reminders([]);

    // Push updated/new reminder to it.
    self.reminders.push(new single_reminder(id, contactId, reminderName, reminderNote, reminderDate, reminderCreatedBy));

    // Post reminder to DB.
    postReminder(id, contactId, reminderName, reminderNote, reminderDate, reminderCreatedBy);
    
    // Set observables in view to reflect updated information.
    self.setReminderInformation();
  }

  // ===================================================
  // Form Update AJAX
  // ===================================================

  self.deleteContact = function() {
    $.ajax({
      type: 'DELETE',
      url: 'http://localhost:3000/contacts/' + self.contactId,
      data: self.updatedContactInformation(),
      dataType: 'json',
      success: function(data) {
        if ($('.alert-success').length == 0) {
            // Dismissible bootstrap alert success box
            var successMessage = '<strong>Success! </strong> A contact was deleted.'
            $('#main').prepend('<div class="alert alert-success alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + successMessage + '</div>');
        }

        setTimeout(function() {
          $('.alert-success').fadeOut('180', function() {
            $(this).remove();
          });
        }, 6000);

        app.trigger('contact-deleted', app);
      }
    });
  }

  self.updateData = function() {    
    $.ajax({
      type: 'PUT',
      url: 'http://localhost:3000/contacts/' + self.contactId,
      data: self.updatedContactInformation(),
      dataType: 'json',
      success: function(data) {

        if ($('.alert-success').length == 0) {
            // Dismissible bootstrap alert success box
            var successMessage = '<strong>Success! </strong> Your changes were saved!'
            $('#main').prepend('<div class="alert alert-success alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + successMessage + '</div>');
        }

        setTimeout(function() {
          $('.alert-success').fadeOut('180', function() {
            $(this).remove();
          });
        }, 6000);
      }
    });
  }

  self.updatedContactInformation = function() {
    return ko.toJS({
      "id": self.contactId,
      "firstname": self.firstname(),
      "lastname": self.lastname(),
      "email": self.email(),
      "phone": self.phone(),
      "position": self.position(),
      "company": self.company(),
      "customImage": self.customImage(),
      "address": self.address(),
      "city": self.city(),
      "state": self.state(),
      "zipcode": self.zipcode(),
      "notes": self.notes(),
      "createdBy": data.createdBy,
      "registered": data.registered,
    })
  }
};

function detailViewModel(contactId) {
  var self = this;
  self.contact = ko.observableArray([]);

  self.getContact = function(id) {
    // JSON-Server is a little too fast. View can show up blank without delay.
    setTimeout(function() {
      var request = $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/contacts/' + id + '?_embed=tags&_embed=reminders',
        dataType: 'json'

      }).done(function(data) {
        var contactData = [new detail_singleContact(data)];
        self.contact(contactData);
      });
    }, 100);
  }

  self.getContact(contactId);
};