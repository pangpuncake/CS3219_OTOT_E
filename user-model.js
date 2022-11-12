import mongoose from "mongoose";
var Schema = mongoose.Schema;
let UserModelSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  ip_address: {
    type: String,
    required: true,
  },
});

export default mongoose.model("UserModel", UserModelSchema);
