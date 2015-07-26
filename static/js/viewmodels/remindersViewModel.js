function reminders_Reminder(data) {
  var self = this;

  self.id = data.id;
  self.reminderName = data.reminderName;
  self.contactId = data.contactId;
  self.reminderNote = data.reminderNote;
  self.createdBy = data.createdBy;
  self.reminderDate = data.reminderDate;

  self.reminderLink = '#/contacts/' + self.contactId;

  self.formattedReminderDate = formatDate(data.reminderDate, true);
}

function remindersViewModel() {
  var self = this;

  self.reminders = ko.observableArray([]);

  // Sort reminders by the one soonest to expire. Courtesy of: http://www.code-sample.com/2013/08/sorting-observable-array-knockout-js.html
  self.arrangeReminders = function() {

    // These sort functions evaluate the various properties and return '0' if the two arguments are the same, '-1' if the first value is smaller, and '1' if it is larger. 
    self.reminders.sort(function (l, r) {
      return (Date.parse(l.reminderDate) == Date.parse(r.reminderDate) ? 0 : (Date.parse(l.reminderDate) > Date.parse(r.reminderDate) ? -1 : 1))
    })
  }

  self.getReminders = function() {
    // Takes the server data and maps it to our contact object.
    // JSON-Server is a little too fast. View can show up blank without delay.
    setTimeout(function() { 
      $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/reminders',
        dataType: 'json',
        success: function(allData) {
          var mappedTasks = $.map(allData, function(item) { 
            if (item.createdBy === currentUser()) {
              return new reminders_Reminder(item);
            }
          });

          self.reminders(mappedTasks);
          self.arrangeReminders();
          
          setTimeout(function(){
            eliminateDuplicateHeaders();
          }, 50);
        }
      });
    }, 100);
  }

  self.getReminders();
}

function eliminateDuplicateHeaders() {
  var headers = $('.contact-list--reminder .contact__subheader');

  if (headers.length) {
    $.each(headers, function (el, index) {
      var previousHeader = $(index).prev('li').prev('.contact__subheader');

      if ($(previousHeader).length && $(index).text() == $(previousHeader).text()) {
        $(index).remove();
      } 
    });
  }
}