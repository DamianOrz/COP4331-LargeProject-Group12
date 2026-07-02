const app_name = 'cop4331-project.xyz';

export function buildPath(route: string): string 
{
  if (!import.meta.env.DEV) 
  {
    return 'http://' + app_name + ':5000/' + route;
  }
  else 
  {
    return 'http://localhost:5000/' + route;
  }
}