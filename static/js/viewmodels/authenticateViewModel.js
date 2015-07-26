/*
Ideally, the app would use IWS credentials (such as someone's computer login)
for authentication. This would remove the need for password management from the app. It 
would also be more consistent for people using it, and secure for the company.
*/

function authenticateViewModel() {
  var self = this;

  // Are we remembered?
  if (currentUser()) {
    app.trigger('user-authenticated', app);
  }

  self.setUser = function(form) {
    var email = $(form).find('input[type="email"]').val();

    // Only allow IWS accounts to use the website. Obviously this is 'faked' validation. See comment above.
    if (email.endsWith('britecore.com') == false) {

      if ($('.alert-warning').length == 0) {
        // Dismissible bootstrap alert warning box
        $('.view').prepend('<div class="alert alert-warning alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Sorry!</strong> BriteSpark requires you to sign in with your IWS account</div>');
      }

     return;
    }

    // Using the first part of the email address as a user name.
    userName = email.split("@")[0];
  
    localStorage.setItem("user", userName);

    app.trigger('user-authenticated', app);
  }
}; 