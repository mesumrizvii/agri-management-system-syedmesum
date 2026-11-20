import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { resources } from "./resources";

const reducer = { auth: authReducer };
Object.entries(resources).forEach(([name, r]) => {
  reducer[name] = r.reducer;
});

export const store = configureStore({ reducer });
