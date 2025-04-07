const mongoose = require("mongoose");
require("dotenv").config();

const connect = (app) => {
  try {
    var port = process.env.PORT || 4000;
    mongoose.Promise = global.Promise;
    mongoose.connect(process.env.DB_URL);

    // When successfully connected
    mongoose.connection.on("connected", function () {
      console.log(`Mongo DB connection open for ${process.env.NODE_ENV} DB`);
    });

    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};
module.exports = connect;
