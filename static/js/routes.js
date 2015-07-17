// Load View function courtesy of Stack Overflow. 
// Way to load partials using Sammy and Knockout.
// Cleans up bindings when view is no longer used.

function loadView(url, viewModel) {

    var loadViewRequest = $.ajax({
        type: 'GET',
        url: url
    });

    loadViewRequest.done(function(response) {
        var container = $('#main');
        var view = container.find('.view');
        var newView = $('<div>').addClass('view').html(response);

        if (view.length) {
            ko.removeNode(view[0]); // Clean up previous view
        }

        container.append(newView);
        ko.applyBindings(viewModel, newView[0]);
    })
}

function loadPartialView(url, viewModel, partialViewContainerId) {
    $.get(url, function (response) {
        var container = $('#main');

        var view = container.find('#' + partialViewContainerId);

        // Dynamically create wrapper for partial view, so KO has something to bind to. 
        var newView = $('<div>').attr('id', partialViewContainerId).html(response);
        
        if (view.length) {
            ko.removeNode(view[0]); // Clean up previous view
        }

        container.prepend(newView);
        ko.applyBindings(viewModel, document.getElementById(partialViewContainerId));
    });
}

var app = $.sammy('#main', function() {

    // =======================================================
    // Authentication Routes
    // =======================================================
    
    this.get('#/', function(context) {
        // Redirect if already authenticated.
        if (localStorage.getItem("user")) {
            this.redirect('#/contacts');
            return;
        }

        loadView('views/authenticate/index.html', new authenticateViewModel());
    });

    this.bind('user-authenticated', function (e, data) {
        this.redirect('#/contacts');
    });

    // =======================================================
    // Contacts
    // =======================================================
    
    this.get('#/contacts', function(context) {
        loadView('views/list/index.html', new listViewModel());
        loadPartialView('views/navigation/index.html', new navigationViewModel(), 'navigationContainer');
        loadPartialView('views/search/index.html', new searchViewModel(), 'searchContainer');
    });

    this.get('#/contacts/:id', function(context) {
        // Pass current id, so we know which contact to display.
        var contactId = this.params['id'];

        loadView('views/detail/index.html', new detailViewModel(contactId));
        loadPartialView('views/search/index.html', new searchViewModel(), 'searchContainer');
    });

    // =======================================================
    // Reminders
    // =======================================================

    this.get('#/reminders', function(context) {
        loadView('views/reminders/index.html', new remindersViewModel());
        loadPartialView('views/navigation/index.html', new navigationViewModel(), 'navigationContainer');
        loadPartialView('views/search/index.html', new searchViewModel(), 'searchContainer');
    });

    // =======================================================
    // Add
    // =======================================================

    this.get('#/add', function(context) {
        loadView('views/add/index.html', new addViewModel());
    });

    // =======================================================
    // Signout
    // =======================================================

    this.get('#/signout', function(context) {
        localStorage.setItem("user", "")
        this.redirect('#/');
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