function filterContacts(jsonKey, value) {
  ko.postbox.publish("searchQueryType", jsonKey);
  ko.postbox.publish("searchQuery", value);
}

function unfilterContacts() {
  filterContacts('', '');
}

// Not perfect, but pretty good. SO: http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
function validateEmail(email) {
    var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return regex.test(email);
}

function showLetterHeadings() {
  var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  jQuery.each(alphabet, function(index, value) {
    var contactsThatMatchLetter = jQuery('li[data-initialLetter="' + value + '"]');
    contactsThatMatchLetter.first().before('<h2 class="contact__header">' + value.toUpperCase() + '</h2>');
  });
}


$(function(){

  function autoPopulateDetails(emailInput) {
    var apiKey = '9d88865dfc3cdee7'; // This isn't something I'd do on a live site ...
    var emailAddress = $(emailInput).val();

    if(validateEmail(emailAddress) === false) {
      return; // Don't try API call if the field isn't an email.
    }

    // emailAddress = 'bart@fullcontact.com' // Tests the api with causing a call.
    
    var personDetailsURL = 'https://api.fullcontact.com/v2/person.json?email=' + emailAddress + '&apiKey=' + apiKey;

    // Inputs to try and autofill;
    var form     = $(emailInput).closest('form');
    var position = form.find('input[name="position"]');
    var company  = form.find('input[name="company"]');
    var address  = form.find('input[name="address"]');
    var city     = form.find('input[name="city"]');
    var state    = form.find('input[name="state"]');
    var zipcode  = form.find('input[name="zipcode"]');

    var requestPersonDetails = $.get(personDetailsURL, function(response) {
        if (response.status == 202) {
          return; // This means no match was immediately found. To prevent bad user experience, end autofilling.
        }

        if(response.organizations == null) {
          return;
        }

        $.each(response.organizations, function(index, element) {
          if (element.isPrimary === true) {
            position.val(element.title).change();
            company.val(element.name).change();
          }
        });
    });

    // When first request is done, initiate second to get company information.
    requestPersonDetails.done(function() {
      var emailChunks = emailAddress.split("@");
      var emailDomain = emailChunks[emailChunks.length -1]; // should return domain of email

      // Some common domain names, courtesy of MailCheck plugin.
      var commonDomains = ["aol.com", "att.net", "comcast.net", "facebook.com", "gmail.com", "gmx.com", "googlemail.com", "google.com", "hotmail.com", "hotmail.co.uk", "mac.com", "me.com", "mail.com", "msn.com", "live.com", "sbcglobal.net", "verizon.net", "yahoo.com", "yahoo.co.uk", "email.com", "games.com", "gmx.net", "hush.com", "hushmail.com", "inbox.com", "lavabit.com", "love.com", "pobox.com", "rocketmail.com", "safe-mail.net", "wow.com", "ygm.com", "ymail.com", "zoho.com", "fastmail.fm", "bellsouth.net", "charter.net", "cox.net", "earthlink.net", "juno.com",];
      
      //We'll make sure our email isn't one of them before assuming it is a work email.
      function isPersonalEmail(emailDomain, commonDomains) {
        for (var i = 0; i < commonDomains.length; i++) {
          if (emailDomain == commonDomains[i]) {
            return true;
          }
        }
      }

      if (isPersonalEmail(emailDomain, commonDomains) == true) {
        return;
      }

      var companyWebsite = emailDomain;
      var companyDetailsURL = 'https://api.fullcontact.com/v2/company/lookup.json?domain=' + companyWebsite + '&apiKey=' + apiKey;

      function requestCompanyDetails() {
        $.get(companyDetailsURL, function(response) {
          if (response.status == 202) {
            return; // This means no match was immediately found. To prevent bad user experience, end autofilling.
          }

          var companyAddress = response.organization.contactInfo.addresses;
          var companyLine1 = companyAddress[0].addressLine1;
          var companyLine2 = companyAddress[0].addressLine2;
          var companyState = companyAddress[0].region.name;
          var companyCity  = companyAddress[0].locality;
          var companyZip   = companyAddress[0].postalCode;

          function scrubValue(variable) {
            if (variable == null) {
              variable = '';
            }

            return variable;
          }

          // Autofill remaining values. change() is needed so knockout registers the updated values.
          address.val(scrubValue(companyLine1) + ' ' + scrubValue(companyLine2)).change();
          state.val(scrubValue(companyState)).change();
          city.val(scrubValue(companyCity)).change();
          zipcode.val(scrubValue(companyZip)).change();
        })
      }

      requestCompanyDetails();
    })
  }

  // =========================================================
  // Event Handlers
  // =========================================================

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

  $('#main').on('blur', '.add input[name="email"]', function(event) {
    autoPopulateDetails(this);
  });

  $('#main').on('click', '.app-navigation', function(event) {

      // Remove active class from all buttons
      $('a').removeClass('active');

      // Add active class to just triggered button.
      var target = $(event.target);
      target.addClass('active');
  });
}, jQuery);