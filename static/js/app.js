function filterContacts(jsonKey, value) {
  ko.postbox.publish("searchQueryType", jsonKey);
  ko.postbox.publish("searchQuery", value);
}

function unfilterContacts() {
  filterContacts('', '');
}

$(function(){

  $('#main').on('click', '[data-nav="my-contacts"]', function() {
    var currentUser = localStorage.getItem("user");

    filterContacts('createdBy', currentUser);
  });

  $('#main').on('click', '[data-nav="all-contacts"]', function() {
    var currentUser = localStorage.getItem("user");

    unfilterContacts();
  });

  $('#main').on('input', '#search', function(event) {
    ko.postbox.publish("searchQueryType", "q");
  });

  $('#main').on('click', '.app-navigation', function(event) {

      // Remove active class from all buttons
      $('a').removeClass('active');

      // Add active class to just triggered button.
      var target = $(event.target);
      target.addClass('active');
  });
}, jQuery);


