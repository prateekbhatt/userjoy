// Inspired by the debian cowsay program :P

module.exports = function (text) {

  text = text || 'Hi Me MOO ! Lezz talk !! :P';

  var len = text.length + 3,
    line = ' ' + new Array(len).join('-') + ' ';

  console.log(line);
  console.log('<', text, '>');
  console.log(line);
  console.log('       \\  ^__^    ');
  console.log('        \\ (oo)\\_______    ');
  console.log('          (__)\\       )\\/\\    ');
  console.log('                ||----w |   ');
  console.log('                ||     ||   ');

};
