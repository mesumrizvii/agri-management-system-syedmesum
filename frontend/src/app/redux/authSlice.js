import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import http, { getStoredUser } from "./api/axiosSetup";
import { errMsg } from "./resourceSlice";
import { APP_SETTINGS } from "../../config";

// POST /users/login -> { user: { id, fullName, username, email, role, token } }
export const login = createAsyncThunk("auth/login", async (body, { rejectWithValue }) => {
  try {
    const { data } = await http.post("/users/login", body);
    localStorage.setItem(APP_SETTINGS.STORAGE_KEY, JSON.stringify(data.user));
    return data.user;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

// POST /users/register -> creates a manager account
export const signup = createAsyncThunk("auth/signup", async (body, { rejectWithValue }) => {
  try {
    const { data } = await http.post("/users/register", body);
    return data.message;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await http.post("/users/logout");
  } catch {
    /* the token is dropped on the client either way */
  }
  localStorage.removeItem(APP_SETTINGS.STORAGE_KEY);
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: getStoredUser(), loading: false, error: null },
  reducers: { clearError: (s) => void (s.error = null) },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(signup.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(signup.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(signup.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(logout.fulfilled, (s) => {
        s.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
