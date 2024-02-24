const { storedBooks } = require("../database");
const Book = require("../model/Book");
const { sendErrorResponse } = require("../utils/common-utils");

module.exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (err) {
    sendErrorResponse(res)(err);
  }
};

function generateRandomFloat() {
  const min = 1;
  const max = 5;
  const step = 0.25;

  // Calculate the number of steps
  const numSteps = (max - min) / step;

  // Generate a random step index
  const randomStepIndex = Math.floor(Math.random() * numSteps);

  // Calculate the random float number
  const randomFloat = min + randomStepIndex * step;

  return randomFloat;
}
function generateRandomInteger() {
  const min = 200;
  const max = 10000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateRandomDateAfter2000() {
  const start = new Date("2000-01-01").getTime();
  const end = new Date().getTime();
  const randomTimestamp = start + Math.random() * (end - start);
  return new Date(randomTimestamp);
}
function getRandomText() {
  const texts = ["Paperback", "Hardcover"];
  const randomIndex = Math.floor(Math.random() * texts.length);
  return texts[randomIndex];
}
const getBook = ({ title, author, publisher }, price) => {
  return new Book({
    price,
    title,
    author,
    publisher,
    genre: getRandomText(["Non Fiction", "Fiction"]),
    subGenre: getRandomText([
      "Horror",
      "Thriller",
      "Sports",
      "Spiritual",
      "Crime",
      "Entertainment",
      "Romance",
    ]),
    type: getRandomText(["Paperback", "Hardcover"]),
    description:
      title +
      "  is a novel written by American author " +
      author +
      " that follows a cast of characters living in the fictional towns of West Egg and East Egg on prosperous Long Island in the summer of 1922.",
    coverImage:
      "https://m.media-amazon.com/images/M/MV5BMTkxNTk1ODcxNl5BMl5BanBnXkFtZTcwMDI1OTMzOQ@@._V1_FMjpg_UX1000_.jpg",
    ratings: generateRandomFloat(),
    reviews: generateRandomInteger(),
    pages: 180,
    publicationDate: generateRandomDateAfter2000(),
    language: "English",
  });
};
function generateRandomTwoDigitInteger() {
  return Math.floor(Math.random() * 46) + 5; // Generate random number between 0 and 45, then add 5
}
function generateRandomDate() {
  const today = new Date();
  const endDate = new Date('2024-03-10');
  const timeDiff = endDate.getTime() - today.getTime();
  const randomTime = Math.random() * timeDiff;
  const randomDate = new Date(today.getTime() + randomTime);
  return randomDate.toISOString().split('T')[0];
}
module.exports.addBooks = async (req, res) => {
  try {
    let createdCount = 0;
    storedBooks.forEach(async (book) => {
      const { price: actualBookPrice, ...restBook } = book;
      let price = { actualPrice: actualBookPrice };
      if (createdCount % 3 === 0) {
        const offer = generateRandomTwoDigitInteger();
        const offerPrice = book.price * (offer / 100);
        price = {
          actualPrice: book.price,
          offerPercentage: offer,
          offerValidityDate: generateRandomDate(),
          offerPrice: book.price - offerPrice,
          savedPrice: offerPrice,
        };
      }
      await getBook(restBook, price)
        .save()
        .then((created) => createdCount++);
    });

    res.status(200).json({ booksCreated: createdCount });
  } catch (err) {
    console.log(err);
    sendErrorResponse(res)(err);
  }
};
