import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "@/features/counter/counterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Understand this code:
//  - configureStore() creates the Redux store.
//  - reducer will contain the state logic for features such as quizzes, courses, and authentication UI.
//  - RootState represents the complete Redux state type.
//  - AppDispatch provides the correct TypeScript type for dispatching actions.