// Load View function courtesy of Stack Overflow. 
// Way to load partials using Sammy and Knockout.
// Cleans up bindings when view is no longer used.
function loadView(url, viewModel) {
    $.get(url, function (response) {
        
        var container = $('#main');
        var view = container.find('.view');
        var newView = $('<div>').addClass('view').html(response);

        if (view.length) {
            ko.removeNode(view[0]); // Clean up previous view
        }

        container.append(newView);
        ko.applyBindings(viewModel, newView[0]);
    });
}

function loadPartialView(url, viewModel, partialViewContainerId) {
    $.get(url, function (response) {
        var container = $('#main');

        // Prevent adding partials multiple times, such as when back button is used.
        if(document.getElementById(partialViewContainerId)) {
            return;
        }

        // Dynamically create wrapper for partial view, so KO has something to bind to. 
        var partialViewContainer = $('<div>').attr('id', partialViewContainerId).html(response);
        container.prepend(partialViewContainer);

        ko.applyBindings(viewModel, document.getElementById(partialViewContainerId));
    });
}

var app = $.sammy('#main', function() {

    // =======================================================
    // Authentication Routes
    // =======================================================
    
    this.get('#/', function(context) {
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
        loadPartialView('views/navigation/index.html', new navigationViewModel(), 'navigation');
    });

    // =======================================================
    // Reminders
    // =======================================================

    this.get('#/reminders', function(context) {
        loadView('views/reminders/index.html', new remindersViewModel());
        loadPartialView('views/navigation/index.html', new navigationViewModel(), 'navigation');
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