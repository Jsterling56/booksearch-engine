import './App.css';
import { Outlet } from 'react-router-dom';
import { ApolloClient, ApolloProvider } from '@apollo/client';
import client from './apollo';
import Navbar from './components/Navbar';
import { saveBook, searchGoogleBooks } from './utils/API';

const client = new ApolloClient({
  request: (operation) => {
    const token = localStorage.getItem("id_token");

    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : "",
      },
    });
  },
  uri: "/graphql"
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <>
          <Navbar />
          <Switch>
            <Route exact path='/' component={searchGoogleBooks} />
            <Route exact path='/saved' component={saveBook} />
            <Route render={() => <h1 className='display-2'>Wrong page!</h1>} />
      </Switch>
      </>
    </Router>
    </ApolloProvider >
  );
}

export default App;
