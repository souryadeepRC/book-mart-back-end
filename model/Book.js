const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: String,
  genre: String,
  subGenre: String,
  price: {
    actualPrice: {
      type: Number,
      required: true,
    },
    offerPercentage: Number,
    offerValidityDate: Date,
    offerPrice: Number,
    savedPrice: Number,
  },
  description: String,
  coverImage: String,
  ratings: {
    type: Number,
    min: 0,
    max: 5,
  },
  reviews: Number,
  pages: Number,
  publisher: String,
  publicationDate: Date,
  language: String,
  type: String,
});

module.exports = mongoose.model("Book", BookSchema);
