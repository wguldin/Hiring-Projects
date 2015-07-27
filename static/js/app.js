function filterContacts(jsonKey, value) {
  ko.postbox.publish("searchQueryType", jsonKey);
  ko.postbox.publish("searchQuery", value);
}

function currentUser() {
  return localStorage.getItem("user");
}

// Not perfect, but pretty good. SO: http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
function validateEmail(email) {
    var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return regex.test(email);
}

function showLetterHeadings() {
  var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  jQuery.each(alphabet, function(index, value) {
    var contactsThatMatchLetter = jQuery('li[data-initial-letter="' + value + '"]');
    contactsThatMatchLetter.first().before('<h2 class="contact-list__header">' + value.toUpperCase() + '</h2>');
  });
}

// =========================================================
// Tag Creation
// =========================================================

// Processes tags from db to display.
function single_tag(id, contactId, tagLabel) {
    var self = this;

    self.id = id;
    self.contactId = contactId;
    self.tagLabel = tagLabel;
}

function postTag(id, contactId, tagLabel) {
  var tagUrl = "http://localhost:3000/tags/";
  var tagJSON = {
    "id": id, 
    "contactId": contactId, 
    "tagLabel": tagLabel
  };

  jQuery.ajax({
    type: 'POST',
    url: tagUrl,
    data: tagJSON
  });
}

function deleteTag(tag) {
  var tagUrl = 'http://localhost:3000/tags/' + tag.id;
  var tagJSON = {
    "id": tag.id ,
    "contactId": tag.contactId,
    "tagLabel": tag.tagLabel
  };

  jQuery.ajax({
    type: 'DELETE',
    url: tagUrl,
    data: tag
  });
}

// =========================================================
// Reminders
// =========================================================

// Processes reminders from db.
function single_reminder(id, contactId, reminderName, reminderNote, reminderDate, createdBy) {
  var self = this;

  self.id = id;
  self.contactId = contactId;
  self.reminderName = reminderName;
  self.reminderNote = reminderNote;
  self.reminderDate = reminderDate;
  self.createdBy = createdBy;
}

function postReminder(id, contactId, reminderName, reminderNote, reminderDate, createdBy) {
  var reminderUrl = "http://localhost:3000/reminders/";
  
  var reminderJSON = {
    "id": id,
    "contactId": contactId,
    "reminderName": reminderName,
    "reminderNote": reminderNote,
    "reminderDate": new Date(reminderDate).toISOString(),
    "createdBy": createdBy
  };

  jQuery.ajax({
    type: 'POST',
    url: reminderUrl,
    data: reminderJSON
  });
}

function deleteReminder(id, contactId, reminderName, reminderNote, reminderDate, createdBy) {
  var reminderUrl = 'http://localhost:3000/reminders/' + id;
  
  var reminderJSON = {
    "id": id,
    "contactId": contactId,
    "reminderName": reminderName,
    "reminderNote": reminderNote,
    "reminderDate": new Date(reminderDate).toISOString(), 
    "createdBy": createdBy
  };

  jQuery.ajax({
    type: 'DELETE',
    url: reminderUrl,
    data: reminderJSON
  });
}

$(function(){

  // =========================================================
  // Navigation
  // =========================================================

  $('#searchBox').on('input', function(event) {
    if($(this).val() != '') {
      ko.postbox.publish("searchQueryType", "q");
    }
  }); 

  $('body').on('focus', '#searchBox', function() {
      if(window.location.hash != '#/contacts') {
          app.trigger('search-focused')
      };
  })

  $('#search').on('submit', function(event) {
    event.preventDefault();

    if($(this).val() != '') {
      ko.postbox.publish("searchQueryType", "q");
    }
  }); 

  $('#navigation').on('click', function() {
    // If user navigates away from search results, clear the search field.
    if($('#searchBox').val() != '') {
      $('#searchBox').val('');
    }
  });

  // Update year in copyright
  var year = new Date().getFullYear();
  $('footer').find('.date').text(year);

  // =========================================================
  // Edit Contact Forms
  // =========================================================

  function triggerCollapsableElements(eventTarget) {
    var target = eventTarget;
    var container = target.closest('[data-collapse="container"]');
    var collapsableElement = container.find('.collapse');

    collapsableElement.collapse('toggle');
  };

  $('body').on('click', '[data-toggle="collapse"]',function(event) {
    var target = $(event.target);

    triggerCollapsableElements(target);

    if ($('.edit--toggle').length > 0) {
      $('.edit--toggle').addClass('is-disabled');
    } 

    if ($('[data-toggle="popover"]').length > 0) {
      $('[data-toggle="popover"]').popover();
    }
  });

  $('#main').on('submit', '.contact__form', function(event) {
    triggerCollapsableElements($(event.target));
    $('.edit--toggle').removeClass('is-disabled');
  });

  $('body').on('submit', '.reminder-alert__form', function(event) {
    triggerCollapsableElements($(event.target));
  });

  $('#main').on('click', '.contact__form__cancel', function(event) {
    $('.edit--toggle').removeClass('is-disabled');
    
    triggerCollapsableElements($(event.target));
  });

  // =========================================================
  // Add form 
  // =========================================================

  // Once we have the email address, try to find more information out via fullcontact api.
  $('#main').on('blur', '.form--add input[name="email"]', function(event) {
    autoPopulateDetails(this);
  });

  $('#main').on('input', '.form--add input[name="zipcode"]', function(event) {
    var zipcode = $(this).val();
    var stateInput = $('input[name="state"]');
    var cityInput = $('input[name="city"]');

    if (zipcode.length == 5 && stateInput.val().length == 0 && cityInput.val().length == 0) {
      $.get('http://zip.getziptastic.com/v2/US/' + zipcode, function(response) {
        cityInput.val(response.city);
        stateInput.val(response.state);
      });
    }
  });

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
      var commonDomains = ["aol.com", "att.net", "comcast.net", "example.com", "facebook.com", "gmail.com", "gmx.com", "googlemail.com", "google.com", "hotmail.com", "hotmail.co.uk", "mac.com", "me.com", "mail.com", "msn.com", "live.com", "sbcglobal.net", "verizon.net", "yahoo.com", "yahoo.co.uk", "email.com", "games.com", "gmx.net", "hush.com", "hushmail.com", "inbox.com", "lavabit.com", "love.com", "pobox.com", "rocketmail.com", "safe-mail.net", "wow.com", "ygm.com", "ymail.com", "zoho.com", "fastmail.fm", "bellsouth.net", "charter.net", "cox.net", "earthlink.net", "juno.com",];
      
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

          function scrubValue(variable) {
            if (variable == null) {
              variable = '';
            }

            return variable;
          }

          var companyAddress = scrubValue(response.organization.contactInfo.addresses);
          var companyLine1   = scrubValue(companyAddress[0].addressLine1);
          var companyLine2   = scrubValue(companyAddress[0].addressLine2);
          var companyState   = scrubValue(companyAddress[0].region.name);
          var companyCity    = scrubValue(companyAddress[0].locality);
          var companyZip     = scrubValue(companyAddress[0].postalCode);


          // Autofill remaining values. change() is needed so knockout registers the updated values.
          address.val(companyLine1 + ' ' + companyLine2).change();
          state.val(companyState).change();
          city.val(companyCity).change();
          setTimeout(function() {
            // Gives the app time to fill in city and state before zipcode,
            // so that zipcode js doesn't do an api call to find the already filled in city and state.
            zipcode.val(companyZip).change();
          }, 10);
        })
      }

      requestCompanyDetails();
    })
  }

  // =========================================================
  // Phone Number Mask
  // Adapted from my credit card mask: http://blog.willguldin.com/a-better-credit-card-mask/ 
  // =========================================================

  var delimiter = '-';
  var longestInputLength = 0; 
        
  $('#main').on('input', '#phoneMask', function() {
    var $this = $('#phoneMask');
    var phoneNumber = $this.val();
    
    delimiter = determineDelimiter(phoneNumber);
    phoneNumberFormat(phoneNumber, $this);
  });

  function phoneNumberFormat(phoneNumber, selector) {
    
    var phoneNumberStripped = phoneNumber.replace(/\D+/g, '');
    var currentInputLength = phoneNumber.length;

    // If this is true, the phone number is being edited, so we don't want the mask active.
    if (currentInputLength > 0 && currentInputLength < longestInputLength) {
      return;
    }
    
    // Standard Phone Number Format
    // 0 1 2 | 4 5 6 | 8 9 0 1
    // 5 5 5 - 5 5 5 - 5 5 5 5
    var phonePattern = [[0, 3], [3, 6], [6, 10]];

    // For people leading with a '1'
    if(phoneNumberStripped.charAt(0) == '1') {

      // Leading 1 Phone Number Format
      // 0 | 2 3 4 | 5 6 7 | 8 9 0 1
      // 1 - 5 5 5 - 5 5 5 - 5 5 5 5

      phonePattern = [[0, 1], [1, 4], [4, 7], [7, 11]];
      selector.attr('maxlength', '14');
    }

    selector.val(applyMask(phonePattern, phoneNumberStripped)).change();
  };

  function determineDelimiter(phoneNumber) {
    var firstDelimiter = phoneNumber.charAt(3);
    var isDelimiter = /\D+/g;

    if (isDelimiter.test(firstDelimiter) && firstDelimiter != '-') {
      return firstDelimiter; // Custom Spacer Entered
    
    } else {
      return delimiter;

    }
  };

  function applyMask(phonePattern, phoneNumberStripped) {

    var phoneNumberFormatted = '';

    for (i = 0; i < phonePattern.length; i++) {
      
      // For each number range, capture a substring of the phone number.
      var subStart = phonePattern[i].slice(0, 1);
      var subEnd   = phonePattern[i].slice(1);

      var numberPiece    = phoneNumberStripped.substring(subStart, subEnd);
      var maxPieceLength = subEnd - subStart;

      var currentDelimiter = delimiter;

      // These checks prevent extra delimiters from being added.
      if (numberPiece.length == 0 || numberPiece.length != maxPieceLength || i + 1 == phonePattern.length) {
        currentDelimiter = '';
      }

      phoneNumberFormatted += numberPiece + currentDelimiter;
    } 

    longestInputLength = phoneNumberFormatted.length;

    return phoneNumberFormatted.trim(); // Trim makes sure our default delimiter is inserted later.
  }

}, jQuery);