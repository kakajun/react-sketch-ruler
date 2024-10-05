import React from 'react';
import {router} from './router';
import { BrowserRouter as Router,RouterProvider, Route, Routes } from 'react-router-dom';

const App: React.FC = () => {
    return <RouterProvider router={router} />;

};

export default App;
