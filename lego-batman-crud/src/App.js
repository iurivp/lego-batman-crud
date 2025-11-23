import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Logout from './components/Auth/Logout';
import Register from './components/Auth/Register';
import ItemList from './components/Items/ItemList';
import ItemDetail from './components/Items/ItemDetail';
import ItemForm from './components/Items/ItemForm';
import { getToken } from './utils/auth';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      getToken() ? <Component {...props} /> : <Redirect to="/login" />
    }
  />
);

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />

        <Switch>
          <Route path="/login" exact component={Login} />
          <Route path="/register" exact component={Register} />
          <Route path="/logout" exact component={Logout} />

          <PrivateRoute path="/" exact component={ItemList} />
          <PrivateRoute path="/items/new" exact component={ItemForm} />
          <PrivateRoute path="/items/:id/edit" exact component={ItemForm} />
          <PrivateRoute path="/items/:id" exact component={ItemDetail} />

          <Route path="*">
            <h2>Página não encontrada</h2>
            <p>A rota informada não existe.</p>
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
