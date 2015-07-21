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

  self.contactId = uuid.generate();
  self.position = ko.observable("");
  self.company = ko.observable("");
  self.email = ko.observable("");
  self.phone = ko.observable("");
  self.address = ko.observable("");
  self.city = ko.observable("");
  self.state = ko.observable("");
  self.zipcode = ko.observable("");
  self.notes = ko.observable("");
  self.createdBy = localStorage.getItem("user");
  self.registered = new Date().toISOString();

  self.tagString = ko.observable("");

  function createTagArray() {
    var array = self.tagString().split(',');
    var regex = new RegExp('.*^\s*$');

    // We iterate in reverse to avoid issues when removing array elements;
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

  function createTags(array) {
    for (var i = 0; i < array.length; i++) {
      console.log(new single_tag(uuid.generate(), self.contactId, array[i]));
    }
  }

  self.tags = ko.observableArray([]);  
  self.reminders = ko.observableArray([]);

  self.addContact = function() {

    console.log(self.contactInformation());
    console.log(createTags(createTagArray()));
    // setTimeout(function(){
    //   $.ajax({
    //     type: 'POST',
    //     url: 'http://localhost:3000/contacts',
    //     data: self.contactInformation(),
    //     dataType: 'json',
    //     success: function(data) {
    //       console.log(data);

    //       app.trigger('user-added', app);

    //       if ($('.alert-success').length == 0) {
    //           // Dismissible bootstrap alert success box
    //           var successMessage = '<strong>Success! </strong>' + data.firstname + ' ' + data.lastname +' was added as a new contact!'
    //           $('#main').prepend('<div class="alert alert-success alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + successMessage + '</div>');
    //       }

    //       setTimeout(function() {
    //         $('.alert-success').fadeOut('180', function() {
    //           $(this).remove();
    //         });
    //       }, 6000);
    //     }
    //   });
    // }, 100);
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
      "notes": self.notes(),
      "createdBy": self.createdBy,
      "registered": self.registered,
    })
  }
};