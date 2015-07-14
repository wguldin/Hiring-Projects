var app = $.sammy('#main', function() {
    
    // Load View function courtesy of Stack Overflow. 
    // Way to load partials using Sammy and Knockout.
    // Cleans up bindings when view is no longer used.
    function loadView(url, viewModel) {
        $.get(url, function (response) {
            var $container = $('#main'),
                $view = $container.find('.view'),
                $newView = $('<div>').addClass('view').html(response);
            if ($view.length) {
                ko.removeNode($view[0]); // Clean up previous view
            }
            $container.append($newView);
            ko.applyBindings(viewModel, $newView[0]);
        });
    }

    // Loads authentication view
    this.get('#/', function(context) {
        loadView('views/authenticate/index.html', new authenticateViewModel());
    });

    this.bind('user-authenticated', function (e, data) {
        this.redirect('#/contacts');
    });

    // Make Sammy.js leave forms alone (otherwise values from form submit are added as query strings)!
    // See relevant SO: http://stackoverflow.com/questions/14861461/weird-redirect-using-data-bind-submit-sammy-js-and-knockout-js-together/14861466#14861466
    this._checkFormSubmission = function(form) {
        return false;
    };

    // List of all Contacts
    this.get('#/contacts', function(context) {
        loadView('views/list/index.html', new listViewModel());
    });
});

$(function() {
    app.run('#/');
});