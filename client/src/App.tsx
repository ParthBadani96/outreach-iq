import { Route, Switch } from 'wouter';
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import Campaigns from './pages/Campaigns';
import NewCampaign from './pages/NewCampaign';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">OutreachIQ</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </a>
                <a href="/resumes" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Resumes
                </a>
                <a href="/campaigns" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Campaigns
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/resumes" component={Resumes} />
          <Route path="/campaigns" component={Campaigns} />
          <Route path="/campaigns/new" component={NewCampaign} />
          <Route>404 - Not Found</Route>
        </Switch>
      </main>
    </div>
  );
}
