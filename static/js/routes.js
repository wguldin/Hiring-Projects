// Load View function courtesy of Stack Overflow. Way to load partials using Sammy and Knockout.
// Cleans up bindings when view is no longer used.
// http://stackoverflow.com/questions/23481588/knockoutjs-with-sammy-js-spa-suggestion
function loadView(url, viewModel) {
    var $loader = $('#main').find('.loader');

    $loader.fadeIn(120);

    setTimeout(function() {
        var loadViewRequest = $.ajax({ 
            type: 'GET',
            url: url,
            success: function(response) {
                var container = $('#main');
                var view = container.find('.view');
                var newView = $('<div id="view">').addClass('view').html(response);

                if (view.length) {
                    var vm = ko.dataFor(document.getElementById('view'));

                    // This removes the KO Postbox subscribtion, preventing extra DB calls. 
                    // https://github.com/rniemeyer/knockout-postbox/issues/38
                    if (typeof vm.unsubscribe === "function") {
                        vm.unsubscribe();
                    }
                    ko.removeNode(view[0]); // Clean up previous view after fade begins.
                }

                container.append(newView);

                initUIFeatures(container);
                ko.applyBindings(viewModel, newView[0]);

                $loader.fadeOut(120);
            }
        });
    }, 120);
}

function loadReminders() {    
    setTimeout(function() {
        var loadViewRequest = $.ajax({ 
            type: 'GET',
            url: 'views/reminderAlert/index.html',
            success: function(response) {
                var container = $('body');
                var view = container.find('#reminderAlert');
                var newView = $('<div id="reminderAlert" data-collapse="container">').html(response);

                if (view.length) {
                    var vm = ko.dataFor(document.getElementById('reminderAlert'));
                    ko.removeNode(view[0]); // Clean up previous view after fade begins.
                }
                
                container.prepend(newView);

                ko.applyBindings(new reminderAlertViewModel, newView[0]);
            }
        });
    }, 120);
}


function initUIFeatures(container) {
    // Force new views to go to the top of the page, like a traditional web page.
    $('html, body').animate({ scrollTop: 0 }, 0);

    // Because views are being ajax'd, we can't initialize these plugins on load. 
    if (container.find('[data-toggle="popover"]')) {
        $('[data-toggle="popover"]').popover();
    }

    if(container.find('.edit--toggle')) {
        // Initialize edit functionality
        $('.edit--toggle').removeClass('is-disabled');
    } 

    initPikaday(container);
}

function initPikaday(selector) {
  if (selector.find('#datepicker')) {

    // Date picker doesn't always initailize without short setTimeout.
    setTimeout(function(){
      var presetDate = $('#datepicker').val();

      var picker = new Pikaday({
        field: document.getElementById('datepicker'),
        format: 'MMMM D, YYYY',
        minDate: new Date()
      });

      if (presetDate == null) {
        return;
      }

      if(presetDate.length > 0) {
        picker.setDate(presetDate);
      }
    }, 100);
  }
}

// Routing related funcitons.
function isUserAuthenticated() {

    // Local storage is used as a pseudo logged-in state for the test purposes of the app.
    if(currentUser()) {
        return true
    } else {
        return false
    }
}

// Find the nav link with the matching url to make active.
function toggleNavigation(currentUrl) {
    var nav = $('#navigation');
    var navlink = nav.find('a[href="' + currentUrl + '"]');

    nav.find('a').removeClass('active');
    navlink.addClass('active');
}

function toggleElements(selector, toggleState) {
    if (toggleState == 'show') {
        $(selector).delay(150).fadeIn(120, function() {
            $(selector).show();
        });
    } else if (toggleState == 'hide') {
        $(selector).fadeOut(150, function() {
            $(selector).hide();
        });
    }
}

var app = $.sammy('#main', function() {

    var mainContainer = $('#main');
    var body = $('body');

    // =======================================================
    // Authentication Routes
    // =======================================================
    
    this.get('#/', function(context) {
        var self = this;

        // Redirect if already authenticated.
        if (isUserAuthenticated()) {
            self.redirect('#/contacts');
            return;
        }
        
        toggleElements('#search, #navigation, .add-contact, .sign-out', 'hide');
        loadView('views/authenticate/index.html', new authenticateViewModel());
    });

    // Catch custom events
    this.bind('user-authenticated', function (event, data) {
        var self = this;
        self.redirect('#/contacts');
    });

    this.bind('user-added', function (event, data) {
        var self = this;
        self.redirect('#/contacts');
    });

    // =======================================================
    // Contacts
    // =======================================================
    
    this.get('#/contacts', function(context) {
        var self = this;

        if (isUserAuthenticated() === false) {
            self.redirect('#/')
            return;
        }

        mainContainer.off('input.searchInputRedirect');

        loadView('views/list/index.html', new listViewModel());
        loadReminders();
        ko.postbox.publish("searchQuery", "");

        toggleElements('#search, #navigation, .add-contact, .sign-out', 'show');
        toggleNavigation(self.path);
    });

    this.get('#/contacts/my-contacts', function(context) {
        var self = this;

        if (isUserAuthenticated() === false) {
            self.redirect('#/')
            return;
        }

        loadView('views/list/index.html', new listViewModel());
        loadReminders();
        
        toggleElements('#search, #navigation, .add-contact, .sign-out', 'show');
        toggleNavigation(self.path);

        var currentUser = localStorage.getItem("user");
        filterContacts('createdBy', currentUser);
    });

    this.get('#/contacts/:id', function(context) {
        var self = this;

        if (isUserAuthenticated() === false) {
            self.redirect('#/')
            return;
        }

        toggleElements('#search, #navigation, .add-contact, .sign-out', 'show');
        toggleNavigation(self.path);

        // Pass current id, so we know which contact to display.
        var contactId = self.params['id'];
        loadView('views/detail/index.html', new detailViewModel(contactId));
        loadReminders();

        mainContainer.on('focus.searchInputRedirect', '#searchBox', function(e) {
            e.stopImmediatePropagation(); // Needed to stop listViewModel from being applied repeatedly when this event fires. Unsure of what the root cause is though.
            self.redirect('#/contacts');
        })
    });

    // =======================================================
    // Reminders
    // =======================================================

    this.get('#/reminders', function(context) {
        var self = this;

        if (isUserAuthenticated() === false) {
            self.redirect('#/')
            return;
        }

        mainContainer.find('#searchBox').val();
        
        toggleNavigation(self.path);
        toggleElements('#search, #navigation, .add-contact, .sign-out', 'show');

        loadView('views/reminders/index.html', new remindersViewModel());
        loadReminders();

        mainContainer.on('focus.searchInputRedirect', '#searchBox', function(e) {
            e.stopImmediatePropagation(); // Needed to stop listViewModel from being applied repeatedly when this event fires. Unsure of what the root cause is though.
            self.redirect('#/contacts');
        })
    });

    // =======================================================
    // Add
    // =======================================================

    this.get('#/add', function(context) {
        var self = this;

        if (isUserAuthenticated() === false) {
            self.redirect('#/')
            return;
        }

        toggleElements('#search, #navigation, .add-contact', 'hide');

        loadView('views/add/index.html', new addViewModel());
        loadReminders();
    });

    // =======================================================
    // Signout
    // =======================================================

    this.get('#/signout', function(context) {
        var self = this;        

        localStorage.setItem("user", "")
        self.redirect('#/');
    });

    // =======================================================
    // Sammy Utils
    // =======================================================

    // Make Sammy.js leave forms alone (otherwise values from form submit are added as query strings)!
    // See relevant SO: http://stackoverflow.com/questions/14861461/weird-redirect-using-data-bind-submit-sammy-js-and-knockout-js-together/14861466#14861466
    this._checkFormSubmission = function(form) {
        return false;
    };
});

$(function() {
    app.run('#/');
});