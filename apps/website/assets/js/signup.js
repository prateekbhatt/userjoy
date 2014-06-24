$('#signup_form_submit')
  .click(function (e) {
    e.preventDefault();
    $('#signup_form_submit')
      .attr("disabled", true);
    // TODO: change url for production
    $.ajax({
      url: 'http://api.do.localhost/account',
      type: 'POST',
      data: $('#signup_form')
        .serialize(),
      dataType: 'json',
      success: function (data) {
        console.log('signup success', arguments);
        $('#signup_form_submit')
          .attr("disabled", false);
        $("#signupsuccess")
          .css("display", "block");
        $('#successtext')
          .text(
            "Signup successful! A verfication email has been sent to your email id."
        );
        //redirect to login
      },
      error: function (error) {
        console.log('signup error', arguments, '\n', JSON.parse(
            error.responseText)
          .error);
        $('#signup_form_submit')
          .attr("disabled", false);
        displayError(JSON.parse(error.responseText)
          .error);
        //show error
      }
    })

  });

/**
 * Add jquery validation to valdiate form elements: TODO
 */
// $('#signup_form').validate({

// })

$(function () {
  console.log("inside validate jquery");
  $("#signup_form")
    .validate({
      rules: {
        name: {
          required: true,
          minlength: 2
        },
        email: {
          required: true,
          email: true
        },
        password: {
          required: true,
          minlength: 8
        }
      },

      messages: {
        name: {
          required: "Please provide your name",
          minlength: "Your name must be atleast 2 characters long"
        },
        email: {
          required: "Please enter your email"
        },
        password: {
          required: "Please provide a password",
          minlength: "Your password must be atleast 8 characters long"
        }
      },

      submitHandler: function (form) {
        form.submit();
      }
    });
});

function displayError(err) {
  $("#signupalert")
    .css("display", "block");
  $('#errortext')
    .text(err);
}

function closeSuccessMsg() {
  $('#signupsuccess')
    .css("display", "none");
}

function closeErrMsg() {
  $('#signupalert')
    .css("display", "none");
}