angular.module('services.NotesService', [])

.service('NotesService', ['$log',

    function ($log) {

        var notes = [];

        this.setNotes = function (value) {
            notes = value;
        };

        this.getNotes = function () {
            return notes;
        };

        return this;

    }
])