import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import './App.css';

import CardPage from './pages/CardPage';
import MealPlannerAuthApp from './AuthApp';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/cards" exact>
          <CardPage />
        </Route>
        <Route path="/">
          <MealPlannerAuthApp />
        </Route>
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

export default App;
