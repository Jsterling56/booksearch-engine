import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import { useQuery, useMutation } from '@apollo/react-hooks';
import { GET_ME } from '../utils/queries';
import { removeBookId } from '../utils/localStorage';
import { SAVE_BOOK } from '../utils/mutations';
import { REMOVE_BOOK } from '../utils/mutations';
import Auth from '../utils/auth';

const SavedBooks = () => {
  const [userData, setUserData] = useState({});
  const [saveBook] = useMutation(SAVE_BOOK);
  const { loading, data, error } = useQuery(GET_ME);
  const [removeBook] = useMutation(REMOVE_BOOK);

  useEffect(()=> {
    if (!loading && data?.me) {
     setUserData(data.me)
   }
 },[loading,data])

 console.log(userData.savedBooks);


  // if(!userData?.username) {
  //   return (
  //     <h4>
  //       You need to be logged in to see this page. Use the navigation links above to sign up or log in!
  //     </h4>
  //   );
  // }

  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await removeBook({
        variables: { bookId: bookId },
      });
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };
  if (loading) {
    return <h2>LOADING...</h2>
  }

    return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks && userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks && userData.savedBooks.map((book) => {
            return (
              <Col md="4" key={book.bookId}>
                <Card border='dark'>
                  {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  )};

export default SavedBooks;