import { string } from 'joi';
import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
});

export interface User extends mongoose.Document {
  email: string;
  phoneNumber: string;
  name: string;
  password: String;
}
