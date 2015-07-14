function contact(data) {
  this.firstName = ko.observable(data.firstname);
  this.lastName = ko.observable(data.lastname);

  this.fullName = ko.computed(function() {
      return this.firstName() + " " + this.lastName();    
  }, this);

  this.image = ko.observable(data.image);
  this.position = ko.observable(data.position);
  this.company = ko.observable(data.company);
}

function listViewModel() {
  var self = this;
  self.contacts = ko.observableArray([]);

  // Takes the server data and maps it to our contact object.
  // Async: false is deprecated, but implementing this behavior
  // with deferreds and promises seems like it would add quite a bit of complexity.
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/contacts",
    dataType: 'json',
    async: false, // prevents listViewModel from executing early, and not having the data available.
    success: function(allData) {
      var mappedTasks = $.map(allData, function(item) { return new contact(item) });
    
      self.contacts(mappedTasks);

      // Seperating sort from view, per this SO: http://stackoverflow.com/questions/12718699/sorting-an-observable-array-in-knockout
      self.arrangeContacts = function() {
        self.contacts.sort(function (l, r) {
          return (l.lastName() == r.lastName()) ? (l.firstName() > r.firstName() ? 1 : -1) : (l.lastName() > r.lastName() ? 1 : -1)
        })
      }
    }
  });
};