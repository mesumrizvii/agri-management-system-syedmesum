// Generic Redux slice for a CRUD resource: fetchAll, create, update, remove.
// After every change the list is re-fetched so related data (crop names etc.) stays correct.
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const errMsg = (e) => e?.response?.data?.message || e?.message || "Something went wrong";

export function makeResource(name, api) {
  const wrap = (type, fn) =>
    createAsyncThunk(`${name}/${type}`, async (arg, { rejectWithValue }) => {
      try {
        return await fn(arg);
      } catch (e) {
        return rejectWithValue(errMsg(e));
      }
    });

  const fetchAll = wrap("fetchAll", () => api.list());
  const create = wrap("create", async (body) => {
    await api.create(body);
    return api.list();
  });
  const update = wrap("update", async ({ id, body }) => {
    await api.update(id, body);
    return api.list();
  });
  const remove = wrap("remove", async (id) => {
    await api.remove(id);
    return api.list();
  });

  const slice = createSlice({
    name,
    initialState: { items: [], loading: false, loaded: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
      [fetchAll, create, update, remove].forEach((thunk) => {
        builder
          .addCase(thunk.pending, (s) => {
            s.loading = true;
            s.error = null;
          })
          .addCase(thunk.fulfilled, (s, a) => {
            s.loading = false;
            s.loaded = true;
            s.items = a.payload;
          })
          .addCase(thunk.rejected, (s, a) => {
            s.loading = false;
            s.error = a.payload || a.error.message;
          });
      });
    },
  });

  return { fetchAll, create, update, remove, reducer: slice.reducer, api };
}
