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
  loginUrl = 'http://app.do.localhost';
  break;
case 'do.localhost':
  signupApiUrl = 'http://api.do.localhost/account';
  loginApiUrl = 'http://api.do.localhost/auth/login';
  cookieDomain = '.do.localhost';
  loginUrl = 'http://app.do.localhost';
  break;
default:
  signupApiUrl = 'https://api.userjoy.co/account';
  loginApiUrl = 'https://api.userjoy.co/auth/login';
  cookieDomain = '.userjoy.co';
  loginUrl = 'https://app.userjoy.co';
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
        window.location.href = loginUrl + "/apps/" + data.app._id +
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

$(function () {


  // USE bootstrap-validator
  $("#signup_form")
    .bootstrapValidator({
      message: 'This value is not valid',
      feedbackIcons: {
        valid: 'glyphicon glyphicon-ok',
        invalid: 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
      },
      fields: {
        name: {
          message: 'Name is not valid',
          validators: {
            notEmpty: {
              message: 'Name is required and cannot be empty'
            },
            stringLength: {
              min: 2,
              max: 30,
              message: 'Name must be more than 2 and less than 30 characters long'
            }
          }
        },
        email: {
          validators: {
            notEmpty: {
              message: 'The email is required and cannot be empty'
            },
            emailAddress: {
              message: 'The input is not a valid email address'
            }
          }
        },
        password: {
          message: 'Password is not valid',
          validators: {
            notEmpty: {
              message: 'Password is required and cannot be empty'
            },
            stringLength: {
              min: 8,
              max: 30,
              message: 'Password must be more than 8 and less than 30 characters long'
            }
          }
        }
      },
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
