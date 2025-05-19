'use client';

import { Provider } from 'react-redux';
import { store } from './index'; // Your Redux store

export function StoreProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
