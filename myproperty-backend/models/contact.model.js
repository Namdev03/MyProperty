import mongoose from "mongoose";

const { Schema, model } = mongoose;

const contactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Contact = model("Contact", contactSchema);
export default Contact;
