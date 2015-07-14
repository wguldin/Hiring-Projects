function contact(data) {
  this.name = ko.observable(data.name);
  this.image = ko.observable(data.image);
  this.position = ko.observable(data.position);
  this.company = ko.observable(data.company);
}

function listViewModel() {
  var self = this;

  self.contacts = ko.observableArray([]);

  // Takes the server data and maps it to our contact object.
  $.getJSON("http://localhost:3000/contacts", function(allData) {
      var mappedTasks = $.map(allData, function(item) { return new contact(item) });
    
      self.contacts(mappedTasks);
  });
};