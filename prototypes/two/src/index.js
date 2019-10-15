import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import './index.css';
import { App, FetchRecordings, ListRecordings } from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
    <BrowserRouter>
        <Route path="/(Beginning-Student-Tables)?/" exact={true} component={App}/>
        <Route path="/(Beginning-Student-Tables)?/list" exact={true} component={ListRecordings}/>
        <Route path="/(Beginning-Student-Tables)?/session:id" component={FetchRecordings}/>
    </BrowserRouter>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
