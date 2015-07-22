function addViewModel() {
  var self = this;

  self.fullname = ko.observable("").extend({ required: true });

  // Split the full name (http://stackoverflow.com/questions/10272773/split-string-on-the-first-white-space-occurence)
  // Given 'Paul Smith Johnson', firstname: 'Paul', lastname: 'Smith Johnson'
  self.firstname = ko.computed(function() {
    return self.fullname().substr(0, self.fullname().indexOf(' '));
  }, self);

  self.lastname = ko.computed(function() {
    return self.fullname().substr(self.fullname().indexOf(' ') + 1);
  }, self);

  self.fullnameFormatted = ko.computed(function() {
    return self.firstname() + " " + self.lastname();
  }, self);

  self.contactId = uuid.generate();
  self.position = ko.observable("").extend({ required: true});
  self.company = ko.observable("").extend({ required: true});
  self.email = ko.observable("").extend({ required: true});
  self.phone = ko.observable("").extend({ required: true});
  self.address = ko.observable("");
  self.city = ko.observable("");
  self.state = ko.observable("");
  self.zipcode = ko.observable("");
  self.notes = ko.observable("");
  self.createdBy = localStorage.getItem("user");
  self.registered = new Date().toISOString();

  // ===============================================
  // Tags
  // ===============================================

  self.tagString = ko.observable("");
  self.tags = ko.observableArray([]);  

  var tagsArray = [];

  function createTagArray() {
    var array = self.tagString().split(',');
    var regex = new RegExp('.*^\s*$'); // Strip whitespace

    // We iterate in reverse to avoid issues when removing array elements
    // SO: http://stackoverflow.com/questions/9882284/looping-through-array-and-removing-items-without-breaking-for-loop
    for (var i = array.length; i--;) {
      array[i] = array[i].trim();

      // If a trailing comma was entered, an empty index is created.
      if (regex.test(array[i]) == true) {
        array.splice(i, 1);
      }
    }

    return array;
  }

    function createTags() {
      var array = createTagArray();

      for (var i = 0; i < array.length; i++) {
        self.tags().push(new single_tag(uuid.generate(), self.contactId, array[i]));
      }
    }

  // var processTags =  ko.utils.arrayMap(tagsArray, function(item) {
  //     return new single_tag(item.id, item.contactId, item.tagLabel);
  // }); 

  // self.tags = ko.observableArray(processTags);

  // var processReminders =  ko.utils.arrayMap(data.reminders, function(item) {
  //     return new single_reminder(item.id, item.contactId, item.reminderName, item.reminderNote, item.reminderDate);
  // });

  // self.reminders = ko.observableArray(processReminders);

  // ===============================================
  // Reminders
  // ===============================================

  // self.reminders = ko.observableArray([]);
  self.reminderNote = ko.observable("");
  self.reminderDate = ko.observable("");

  // function formattedReminderDate() {
  //   return new Date(self.reminderDate()).toISOString();
  // }

  // function createReminder() {
  //   self.reminders().push(new single_reminder(uuid.generate(), self.contactId, self.fullnameFormatted(), self.reminderNote(), self.reminderDate()));
  // }

  // ===============================================
  // Validation
  // ===============================================

  self.errors = ko.validation.group(self);

  // If reminder checkbox is selected, make the reminder fields required.
  self.requireReminder = function() {
  
    // TODO: Do I need to unset these? Think so ....
    self.reminderNote.extend({required: true});
    self.reminderDate.extend({required: true});
  };

  // ===============================================
  // Reminders
  // ===============================================

  self.addContact = function() {
    if (self.errors().length !== 0) {
      self.errors.showAllMessages();

      return;
    }

    createTags();
    console.log(self.contactInformation());

    //createReminder();

    // $.ajax({
    //   type: 'POST',
    //   url: 'http://localhost:3000/contacts',
    //   data: self.contactInformation(),
    //   dataType: 'json',
    //   success: function(data) {
    //     console.log(data);

    //     app.trigger('user-added', app);

    //     if ($('.alert-success').length == 0) {
    //         // Dismissible bootstrap alert success box
    //         var successMessage = '<strong>Success! </strong>' + data.firstname + ' ' + data.lastname +' was added as a new contact!'
    //         $('#main').prepend('<div class="alert alert-success alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + successMessage + '</div>');
    //     }

    //     setTimeout(function() {
    //       $('.alert-success').fadeOut('180', function() {
    //         $(this).remove();
    //       });
    //     }, 6000);
    //   }
    // });
  }

    self.contactInformation = function() {
      return ko.toJS({
        "id": self.contactId,
        "firstname": self.firstname(),
        "lastname": self.lastname(),
        "email": self.email(),
        "phone": self.phone(),
        "position": self.position(),
        "company": self.company(),
        "address": self.address(),
        "city": self.city(),
        "state": self.state(),
        "zipcode": self.zipcode(),
        "notes": self.notes(),
        "createdBy": self.createdBy,
        "registered": self.registered,
        "tags": ko.toJS(self.tags()),
        //"reminders": self.reminders(),
      })
    }
};


