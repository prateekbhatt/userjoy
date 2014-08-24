var contactUsApiUrl;
switch (document.domain) {
case 'www.do.localhost':
  contactUsApiUrl = 'http://api.do.localhost/contact';
  break;
case 'do.localhost':
  contactUsApiUrl = 'http://api.do.localhost/contact';
  break;
default:
  contactUsApiUrl = 'https://api.userjoy.co/contact';
}

$('#contact-form-submit')
  .click(function (e) {
    e.preventDefault();
    $('#contact-form-submit')
      .attr("disabled", true);

    $.ajax({
      url: contactUsApiUrl,
      type: 'POST',
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: $('#contact-form')
        .serialize(),
      dataType: 'json',
      success: function (data) {
        $('#contact-form-submit')
          .attr("disabled", false);
        $('#contact-us-error')
          .css("display", "none");
        $('#contact-us-success')
          .css("display", "block");
      },
      error: function (error) {
        var val = JSON.parse(error.responseText)
          .message;
        $('#contact-us-success')
          .css("display", "none");
        $('#contact-us-error')
          .css("display", "block");
        $('#errortext')
          .text(val);
        $('#contact-form-submit')
          .attr("disabled", false);
      }
    })
  })

function closeSuccessMsgContact() {
  $('#contact-us-success')
    .css("display", "none");
}

function closeErrMsgContact() {
  $('#contact-us-error')
    .hide();
}
