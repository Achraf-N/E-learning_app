import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import './i18n';
import Loader from './Components/Ui/Loading/Loader';
import { GoogleOAuthProvider } from '@react-oauth/google';

const loadingMarkup = (
  <div className="py-4 text-center">
    <Loader />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <Suspense fallback={loadingMarkup}>
    <React.StrictMode>
      <GoogleOAuthProvider clientId="1005375938088-8arq43pm3d5qkr19q9ig04ml07totbv5.apps.googleusercontent.com">
        <Router>
          <App />
        </Router>
      </GoogleOAuthProvider>
    </React.StrictMode>
  </Suspense>
);
