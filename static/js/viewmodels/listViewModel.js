// Binds json db data to each contact.
function list_contact(data) {
  var self = this;

  self.firstName = data.firstname;
  self.lastName = data.lastname;

  self.fullName = ko.computed(function() {
      return self.firstName + " " + self.lastName;    
  }, self);

  self.id = data.id;

  self.link = ko.computed(function() {
    return "/#/contacts/" + self.id;
  }, self);

  self.image = data.image;
  self.position = data.position;
  self.company = data.company;
  self.email = data.email;

  // Display properties 
  self.initial_letter = data.lastname.substring(0, 1).toLowerCase();
};

function listViewModel() {
  var self = this;

  self.contacts = ko.observableArray([]);
  self.searchType = ko.observable("").subscribeTo("searchQueryType");

  // Seperating sort from view, per this SO: http://stackoverflow.com/questions/12718699/sorting-an-observable-array-in-knockout
  self.arrangeContacts = function() {

    // These sort functions evaluate the various properties and return '0' if the two arguments are the same, '-1' if the first value is smaller, and '1' if it is larger. 
    self.contacts.sort(function (l, r) {
      return (l.lastName == r.lastName ? (l.firstName > r.firstName ? 1 : -1) : (l.lastName > r.lastName ? 1 : -1))
    })
  }
  
  self.getContacts = function(searchText) {
    // Takes the server data and maps it to our contact object.
    // JSON-Server is a little too fast. View can show up blank without delay.
    setTimeout(function() { 
      $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/contacts' + searchText,
        dataType: 'json',
        success: function(allData) {
          var mappedTasks = $.map(allData, function(item) { return new list_contact(item) });

          self.contacts(mappedTasks);
          self.arrangeContacts();

          setTimeout(function(){
            if ($('.contact__header').length == 0) {
              showLetterHeadings(); // Prevents headers from being created twice 
            }
          }, 100);
        }
      });
    }, 100);
  }

  self.subscriptions = [];
  
  // Whenever the search result changes to a new value, update the contacts.
  self.subscriptions.push(ko.postbox.subscribe("searchQuery", function(newValue) {
      // The initial state of the app, and clearing out a search term counts as a 'new value'
      // So, we check if we need the query string or not. 
      if(newValue !== '') {
        self.getContacts('?' + self.searchType() + '=' + newValue);
      } else {
        self.getContacts("");
      }
  }, self));
    
  self.unsubscribe = function() {
      _.each(self.subscriptions, function(subscription) { subscription.dispose(); });
  };
};

