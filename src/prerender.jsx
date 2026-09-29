import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { routes, routeMeta } from './data';
import { schemaFor } from './components';
export { routes, routeMeta, schemaFor };
export function render(path) { return renderToString(<StaticRouter location={path}><App /></StaticRouter>); }
