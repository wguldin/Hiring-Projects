// Binds json db data to each contact.
function detail_singleContact(data) {
  var self = this;
  
  self.contactId = data.id;
  self.firstname = ko.observable(data.firstname);
  self.lastname = ko.observable(data.lastname);

  self.fullName = ko.computed(function() {
      return self.firstname() + " " + self.lastname();    
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
  self.createdBy = data.createdBy,
  self.registered = data.registered

  self.emailLink = 'mailto:' + self.email;
  self.phoneLink = 'tel:' + self.phone;
  self.editLink = '#/edit/' + self.contactId;

  self.addressLink = ko.computed(function() {
    var fullAddress = self.address() + " " + self.city() + " " + self.state();

    return 'https://www.google.com/maps/place/' + fullAddress;
  })

  self.addTagLabel = ko.observable("");

  self.addTag = function() {
    var tagId = uuid.generate();

    self.tags.push(new single_tag(tagId, self.contactId, self.addTagLabel()));
    postTag(tagId, self.contactId, self.addTagLabel);

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

  self.updatedContactInformation = function() {
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
      $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/contacts/' + id + '?_embed=tags&_embed=reminders',
        dataType: 'json',
        success: function(data) {
          var contactData = [new detail_singleContact(data)];
          console.log(contactData)
          self.contact(contactData);
        }
      });
    }, 100);
  }

  // TODO: this is not work, for some reason.
  self.updateData = function() {
    //console.log(self.contact());
    // $.ajax({
    //   type: 'PUT',
    //   url: 'http://localhost:3000/contacts/' + contactId,
    //   data: self.updatedContactInformation(),
    //   dataType: 'json',
    //   success: function(data) {

    //     if ($('.alert-success').length == 0) {
    //         // Dismissible bootstrap alert success box
    //         var successMessage = '<strong>Success! </strong> Your changes were saved!'
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

  self.getContact(contactId);
};