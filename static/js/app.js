$(function(){
  $('#main').on('click', '.app-navigation', function(event) {
      
      // Remove active class from all buttons
      $('a').removeClass('active');

      // Add active class to just triggered button.
      var target = $(event.target);
      target.addClass('active');
  });

  var contactsSearch = new Bloodhound({
    datumTokenizer: function (datum) {
        return Bloodhound.tokenizers.whitespace(datum.value);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        url: 'http://localhost:3000/contacts?q=%QUERY',
        wildcard: '%QUERY',
        filter: function (data) {
            return $.map(data, function (contact) {
                return {
                    value: contact.lastname,
                };
            });
        }
    }
  });

  contactsSearch.initialize();

  $('.typeahead').typeahead(null, {
      displayKey: 'value',
      source: contactsSearch.ttAdapter()
  });

}, jQuery);
