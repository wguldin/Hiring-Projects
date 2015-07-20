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
  self.city = ko.observable();
  self.state = ko.observable();
  self.zipcode = ko.observable();
  self.notes = ko.observable();
  self.createdBy = localStorage.getItem("user");

  self.addContact = function() {
    setTimeout(function(){
      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/contacts',
        data: self.contactInformation(),
        dataType: 'json',
        success: function(data) {
          console.log(data);

          app.trigger('user-added', app);

          if ($('.alert-success').length == 0) {
              // Dismissible bootstrap alert success box
              var successMessage = '<strong>Success! </strong>' + data.firstname + ' ' + data.lastname +' was added as a new contact!'
              $('#main').prepend('<div class="alert alert-success alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + successMessage + '</div>');
          }

          setTimeout(function() {
            $('.alert-success').fadeOut('180', function() {
              $(this).remove();
            });
          }, 6000);
        }
      });
    }, 100);
  }

  self.contactInformation = function() {
    return ko.toJS({
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
      "registered": "",
    })
  }
};