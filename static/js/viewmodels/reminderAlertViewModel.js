function reminderAlertViewModel() {
  var self = this;

  self.reminders = ko.observableArray([]);
  self.activeReminders = ko.observableArray([]);
  
  var today = new Date();
  self.snoozeDate = formatDate(new Date(today.setDate(today.getDate() + numberOfSnoozeDays())), false);
  self.snoozeDateSuffix = ordinal(self.snoozeDate);

  function numberOfSnoozeDays() {
    var today = new Date().getDay();
    var daysToSnooze;

    // Wednesday
    if (today === 3) {
      daysToSnooze = 5

    // Thursday
    } else if (today === 4) {
      daysToSnooze = 4
    
    } else {
      daysToSnooze = 3
    }

    return daysToSnooze;
  }

  self.snoozeReminders = function() {
    var updatedReminderDate = self.snoozeDate + ' ' + new Date().getFullYear();
    var fomattedUpdatedReminderDate = new Date(updatedReminderDate).toISOString();

    ko.utils.arrayForEach(self.activeReminders(), function(reminder) {
      postReminder(reminder.id, reminder.contactId, reminder.reminderName, reminder.reminderNote, fomattedUpdatedReminderDate, reminder.createdBy);
    });
  } 

  self.dismissReminders = function () {
    console.log('in');

    ko.utils.arrayForEach(self.activeReminders(), function(reminder) {
      deleteReminder(reminder.id, reminder.contactId, reminder.reminderName, reminder.reminderNote, fomattedUpdatedReminderDate, reminder.createdBy);
    });
  }

  self.findActiveReminders = function() {
    var today = new Date();
    var todayConverted = today.setHours(0,0,0,0); // Strip out time of day.

    ko.utils.arrayForEach(self.reminders(), function(reminder) {
      var reminderDateConverted = new Date(reminder.reminderDate).setHours(0,0,0,0);

      // If numerical representations of dates are equal & currentUser matches reminder user.
      if (todayConverted === reminderDateConverted && currentUser() == reminder.createdBy) {
        self.activeReminders.push(new single_reminder(reminder.id, reminder.contactId, reminder.reminderName, reminder.reminderNote, reminder.reminderDate, reminder.createdBy));
      }
    })
  }

  self.getActiveReminders = function() {
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
          self.findActiveReminders();
        }
      });
    }, 100);
  }

  self.getActiveReminders();
}