// Load View function courtesy of Stack Overflow. Way to load partials using Sammy and Knockout.
// Cleans up bindings when view is no longer used.
// http://stackoverflow.com/questions/23481588/knockoutjs-with-sammy-js-spa-suggestion

function loadView(url, viewModel) {

    var loadViewRequest = $.ajax({ 
        type: 'GET',
        url: url
    });

    loadViewRequest.done(function(response) {
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

            ko.removeNode(view[0]); // Clean up previous view
        }

        container.append(newView);
        ko.applyBindings(viewModel, newView[0]);
    })
}

// Routing related funcitons.
function isUserAuthenticated() {

    // Local storage is used as a pseudo logged-in state for the test purposes of the app.
    if(localStorage.getItem("user")) {
        return true
    } else {
        return false
    }
}

// Find the nav link with the matching url to make active.
function toggleNavigation(currentUrl) {
    var nav = $('#main').find('.app-navigation');
    var navlink = nav.find('a[href="' + currentUrl + '"]');

    nav.find('a').removeClass('active');
    navlink.addClass('active');
}

var app = $.sammy('#main', function() {

    var mainContainer = $('#main')

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

        mainContainer.removeClass('search navigation');
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
        ko.postbox.publish("searchQuery", "");

        mainContainer.addClass('search navigation');
        toggleNavigation(self.path);
    });

    this.get('#/contacts/my-contacts', function(context) {
        var self = this;

        if (isUserAuthenticated() === false) {
            self.redirect('#/')
            return;
        }

        loadView('views/list/index.html', new listViewModel());

        mainContainer.addClass('search navigation');
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

        mainContainer.addClass('search navigation');
        toggleNavigation(self.path);

        // Pass current id, so we know which contact to display.
        var contactId = self.params['id'];
        loadView('views/detail/index.html', new detailViewModel(contactId));

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

        mainContainer.addClass('search navigation');
        mainContainer.find('#searchBox').val();
        toggleNavigation(self.path);

        loadView('views/reminders/index.html', new remindersViewModel());

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

        mainContainer.removeClass('search navigation');
        loadView('views/add/index.html', new addViewModel());
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