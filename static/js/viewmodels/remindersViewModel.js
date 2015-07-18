function reminders_Reminder(data) {
  var self = this;

  self.id = data.id;
  self.reminderName = data.reminderName;
  self.reminderNote = data.reminderNote;
  self.reminderDate = data.reminderDate;
}

function remindersViewModel() {
  var self = this;

  self.reminders = ko.observableArray([]);

  // self.arrangeReminders = function() {
  //   self.remindersfunction (l, r) {
  //       return (Date.parse(l.date) == Date.parse(r.date) ? 0 : (Date.parse(l.date) > Date.parse(r.date) ? -1 : 1))
  //   });
  // }

  self.getReminders = function() {
    // Takes the server data and maps it to our contact object.
    // JSON-Server is a little too fast. View can show up blank without delay.
    setTimeout(function() { 
      $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/reminders',
        dataType: 'json',
        success: function(allData) {
          var mappedTasks = $.map(allData, function(item) { return new reminders_Reminder(item) });

          self.reminders(mappedTasks);
        }
      });
    }, 100);
  }

  self.getReminders();
}