function reminder(data) {
  var self = this;

  self.reminderNote = data.reminderNote;
  self.reminderDate = data.reminderDate;
  self.reminderName = data.reminderName;
  self.id = data.id;
}

function remindersViewModel() {
  var self = this;

  self.reminders = ko.observableArray([]);

  // self.arrangeReminders = function() {
  //   self.reminders.sort(function () {
  //     // sort here ...
  //   })
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
          var mappedTasks = $.map(allData, function(item) { return new reminder(item) });

          self.reminders(mappedTasks);
        }
      });
    }, 100);
  }

  self.getReminders();
}