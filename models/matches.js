const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  keyWords: {
    type: [String],
    required: true
  },
  leagueType: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  vidSrc: {
    type: String,
    required: true
  }
}, { timestamps: true });

const previousSchema = new mongoose.Schema({
    matches: {
      type: [matchSchema], // An array of match objects
      required: true
    }
  }, { timestamps: true });

const PreviousMatch = mongoose.model('PreviousMatch', previousSchema);

module.exports = PreviousMatch;
