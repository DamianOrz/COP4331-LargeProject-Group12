import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import './App.css';

import CardPage from './pages/CardPage';
import MealPlannerAuthApp from './AuthApp';
import ProtectedRoute from './ProtectedRoute';
import AccountPage from './pages/mealplanner/AccountPage';
import DashboardPage from './pages/mealplanner/DashboardPage';
import PlannerPage from './pages/mealplanner/PlannerPage';
import RecipeDetailsPage from './pages/mealplanner/RecipeDetailsPage';
import RecipeFormPage from './pages/mealplanner/RecipeFormPage';
import GroceryListPage from './pages/mealplanner/GroceryListPage';
import RecipeListPage from './pages/mealplanner/RecipeListPage';

function App() {
  return (
    <Router>
      <Switch>
        <ProtectedRoute path="/app" exact component={DashboardPage} />
        <ProtectedRoute path="/app/recipes" exact component={RecipeListPage} />
        <ProtectedRoute path="/app/recipes/new" exact component={RecipeFormPage} />
        <ProtectedRoute path="/app/recipes/:recipeId/edit" exact component={RecipeFormPage} />
        <ProtectedRoute path="/app/recipes/:recipeId" exact component={RecipeDetailsPage} />
        <ProtectedRoute path="/app/planner" exact component={PlannerPage} />
        <ProtectedRoute path="/app/grocery" exact component={GroceryListPage} />
        <ProtectedRoute path="/app/account" exact component={AccountPage} />

        <Route path="/dashboard" exact>
          <Redirect to="/app" />
        </Route>
        <Route path="/recipes" exact>
          <Redirect to="/app/recipes" />
        </Route>
        <Route path="/recipes/new" exact>
          <Redirect to="/app/recipes/new" />
        </Route>
        <Route path="/recipes/:recipeId/edit" exact render={({ match }) => <Redirect to={`/app/recipes/${match.params.recipeId}/edit`} />} />
        <Route path="/recipes/:recipeId" exact render={({ match }) => <Redirect to={`/app/recipes/${match.params.recipeId}`} />} />
        <Route path="/planner" exact>
          <Redirect to="/app/planner" />
        </Route>
        <Route path="/grocery" exact>
          <Redirect to="/app/grocery" />
        </Route>

        <Route path="/cards" exact>
          <CardPage />
        </Route>
        <Route path="/">
          <MealPlannerAuthApp />
        </Route>
        <Redirect to="/login" />
      </Switch>
    </Router>
  );
}

export default App;
