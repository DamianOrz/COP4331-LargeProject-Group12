import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import './App.css';

import CardPage from './pages/CardPage';
import MealPlannerAuthApp from './AuthApp';
import DashboardPage from './pages/mealplanner/DashboardPage';
import PlannerPage from './pages/mealplanner/PlannerPage';
import RecipeDetailsPage from './pages/mealplanner/RecipeDetailsPage';
import RecipeFormPage from './pages/mealplanner/RecipeFormPage';
import RecipeListPage from './pages/mealplanner/RecipeListPage';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/dashboard" exact>
          <DashboardPage />
        </Route>
        <Route path="/recipes" exact>
          <RecipeListPage />
        </Route>
        <Route path="/recipes/new" exact>
          <RecipeFormPage />
        </Route>
        <Route path="/recipes/:id/edit" exact>
          <RecipeFormPage />
        </Route>
        <Route path="/recipes/:id" exact>
          <RecipeDetailsPage />
        </Route>
        <Route path="/planner" exact>
          <PlannerPage />
        </Route>
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
