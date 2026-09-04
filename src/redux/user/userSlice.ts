import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 *  Redux slice for managing user authentication state.
 * @slice userSlice
 * @author Sanjay
 *
 */

interface User {
  token: string;
  userId: string | number;
}

interface UserData {
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  userId: string;
}
interface UserState {
  user: User | null;
  userData: UserData | null;
}

const initialState: UserState = {
  user: null,
  userData: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setUserData: (state, action: PayloadAction<UserData>) => {
      state.userData = action.payload;
    },
    logoutUser: (state: any) => {
      state.user = null;
      state.userData = null;
    },
    // locale: (state: any, action: any) => {
    //   state.locale = action.payload;
    // },
  },
});

// export const { loginUser, logoutUser, locale } = userSlice.actions;
export const { loginUser, logoutUser, setUserData } = userSlice.actions;
export default userSlice.reducer;
