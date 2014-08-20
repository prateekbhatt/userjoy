describe('Model UserNote', function () {

  /**
   * npm dependencies
   */

  var mongoose = require('mongoose');


  /**
   * Models
   */

  var UserNote = require('../../../api/models/UserNote');


  /**
   * Test variables
   */

  var randomId = mongoose.Types.ObjectId;
  var savedUserNote;


  describe('#create', function () {

    it('should return error if aid/creator/note/uid is not provided',
      function (done) {

        var newNote = {};

        UserNote.create(newNote, function (err, note) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(4);

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.creator.message)
            .to.eql('Invalid creator account id');

          expect(err.errors.note.message)
            .to.eql('Invalid note');

          expect(err.errors.uid.message)
            .to.eql('Invalid user id');

          expect(note)
            .to.not.exist;

          done();
        })

      });


    it('should create usernote', function (done) {

      var newUserNote = {
        aid: randomId(),
        creator: randomId(),
        note: 'This is note about a random user :)',
        uid: randomId()
      };

      UserNote.create(newUserNote, function (err, note) {

        expect(err)
          .to.not.exist;

        expect(note)
          .to.be.an('object');

        savedUserNote = note;

        expect(note)
          .to.have.property('aid', newUserNote.aid);

        expect(note)
          .to.have.property('creator', newUserNote.creator);

        expect(note)
          .to.have.property('note', newUserNote.note);

        expect(note)
          .to.have.property('uid', newUserNote.uid);

        done();
      });

    });

    it('should add ct (created) timestamp', function () {

      expect(savedUserNote)
        .to.have.property('ct');

    });


    it('should add ut (updated) timestamp', function () {

      expect(savedUserNote)
        .to.have.property('ut');

    });

  });


});
