$('#signup_form_submit').click(function (e) {
  e.preventDefault();
  // FIXME: change url for production
  $.ajax({
    url: 'http://api.do.localhost/account',
    type: 'POST',
    data: $('#signup_form').serialize(),
    dataType: 'json',
    success: function (data) {
      console.log('signup success', arguments);
      //redirect to login
    },
    error: function (error) {
      console.log('signup error', arguments, '\n', JSON.parse(error.responseText).error);
      displayError(JSON.parse(error.responseText).error);
      //show error
    }
  })

});

/**
 * Add jquery validation to valdiate form elements: TODO
 */
// $('#signup_form').validate({

// })

function displayError(err) {
  console.log("inside display error");
  $("#signupalert").css("display", "block");
  $('#errortext').text(err);
}