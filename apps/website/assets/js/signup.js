$("#spin")
  .css({
    display: "block"
  });

var opts = {
  top: '50%', // Top position relative to parent
  radius: 8,
  left: '33%' // Left position relative to parent
};

var signupApiUrl;
var loginApiUrl;
var cookieDomain;
switch (document.domain) {
case 'www.do.localhost':
  signupApiUrl = 'http://api.do.localhost/account';
  loginApiUrl = 'http://api.do.localhost/auth/login';
  cookieDomain = '.do.localhost';
  break;
case 'do.localhost':
  signupApiUrl = 'http://api.do.localhost/account';
  loginApiUrl = 'http://api.do.localhost/auth/login';
  cookieDomain = '.do.localhost';
  break;
default:
  signupApiUrl = 'https://api.userjoy.co/account';
  loginApiUrl = 'https://api.userjoy.co/auth/login';
  cookieDomain = '.userjoy.co';
}

$('#signup_form_submit')
  .click(function (e) {
    e.preventDefault();
    $("#spin")
      .css({
        display: "block"
      })
    var div = document.getElementById('spin');
    var spinner = new Spinner(opts)
      .spin(div);
    var emailId = $('#email')
      .val();
    $('#signup_form_submit')
      .attr("disabled", true);
    // TODO: change url for production
    $.ajax({
      url: signupApiUrl,
      type: 'POST',
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: $('#signup_form')
        .serialize(),
      dataType: 'json',
      success: function (data) {
        spinner.stop();
        $("#spin")
          .css({
            display: "none"
          })
        console.log('signup success', arguments, data);
        $('#signup_form_submit')
          .attr("disabled", false);
        // $("#signupsuccess")
        //   .css("display", "block");
        $("#signupalert")
          .css("display", "none");

        // set "loggedin" cookie on root domain
        $.cookie("loggedin", true, {

          path: '/',

          domain: cookieDomain
        });


        // set
        window.location.href = "http://app.do.localhost/apps/" + data.app._id +
          "/addcode";

      },
      error: function (error) {
        spinner.stop();
        $("#spin")
          .css({
            display: "none"
          })
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
  console.log("inside display error");
  $("#signupalert")
    .css("display", "block");
  $("#signupsuccess")
    .css("display", "none");
  $('#errortext')
    .text(err);
}

function closeSuccessMsg() {
  $('#signupsuccess')
    .css("display", "none");
}

function closeErrMsg() {
  console.log("closing error msg");
  $('#signupalert')
    .css("display", "none");
}

function redirectToLogin() {
  if (window.location.href.split("/")[2] == 'do.localhost') {
    window.location.href = "http://app.do.localhost/login";
  } else {
    window.location.href = "https://app.userjoy.co/login"
  }
}