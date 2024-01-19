const mongoose = require('mongoose');

const connect = app => {
  try {
    var port = process.env.PORT || 4000

    mongoose.Promise = global.Promise;
    mongoose.connect(process.env.dbURL)

    // When successfully connected
    mongoose.connection.on("connected", function () {
      console.log("Mongo DB connection open for DB");
    });

    app.listen(port, () => console.log(`Server running on port ${port}`));

  } catch (error) {
    console.log(error)
  }
}
module.exports = connect;