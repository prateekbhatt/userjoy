$('#signup_form_submit')
    .click(function (e) {
        e.preventDefault();
        // TODO: change url for production
        $.ajax({
            url: 'http://api.do.localhost/account',
            type: 'POST',
            data: $('#signup_form')
                .serialize(),
            dataType: 'json',
            success: function (data) {
                console.log('signup success', arguments);
                //redirect to login
            },
            error: function (error) {
                console.log('signup error', arguments, '\n', JSON.parse(
                        error.responseText)
                    .error);
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
        $("#signup_form").validate({
            rules: {
                email: {
                    required: true,
                    email: true
                },
                password: {
                    required: true,
                    minlength: 5
                }
            },

            messages: {
                email: {
                    required: "Please enter your email"
                },
                password: {
                    required: "Please provide a password",
                    minlength: "Your password must be atleast 5 characters long"
                }
            },

            submitHandler: function(form) {
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