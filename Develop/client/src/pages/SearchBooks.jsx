import React, { useState, useEffect } from 'react';
import { Container, Grid, TextField, Button, Card, CardContent } from '@mui/material';

import Auth from '../utils/auth';
import { searchGoogleBooks } from '../utils/API';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';
import { useMutation } from '@apollo/client'; 
import { SAVE_BOOK } from '../utils/mutations';
import { GET_ME } from '../utils/queries';

const googleBookSearch = () => {
    const [searchedBooks, setSearchedBooks] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

    const [saveBook] = useMutation(SAVE_BOOK);

    useEffect(() => {
        return () => saveBookIds(savedBookIds);
    });

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        if (!searchInput) {
            return false;
        }
        try {
            const response = await searchGoogleBooks(searchInput);
            if(!response.ok) {
                throw new Error('Something went wrong!');
            }
            const { items } = await response.json();

            const bookData = items.map((book) => ({
                bookId: book.id,
                authors: book.volumeInfo.authors || ['No author to display'],
                title: book.volumeInfo.description,
                link: book.volumeInfo.infoLink,
                image: book.volumeInfo.imageLinks?.thumbnail || '',
            }));

            setSearchedBooks(bookData);
            setSearchInput('');
        } catch (err) {
            console.error(err);
        }
    };
    const handleSaveBook = async  (bookId) => {
        const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
        const token = Auth.loggedIn() ? Auth.getToken() : null;

        if (!token) {
            return false;
        }

        try {
            await saveBook({
                variables: { book: bookToSave },
                update: (cache) => {
                    const { me } = cache.readQuery({ query: GET_ME });
                    cache.writeQuery({
                        query: GET_ME,
                        data: { me: { ...me, savedBooks: [...me.savedBooks, bookToSave] } },
                    });
                },
            });
            setSavedBookIds([...savedBookIds, bookToSave.bookId]);
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <Container>
            <h1>Search for Books!</h1>
            <form onSubmit={handleFormSubmit}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <TextField
                        name="searchInput"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        fullWidth
                        variant="outlined"
                        placeholder="Search for a book"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button type="submit" varint="contained" color="primary" fullWidth>
                            Submit Search
                        </Button>
                    </Grid>
                </Grid>
            </form>
            <h2>
                {searchedBooks.length
                ? `Viewing ${searchedBooks.length} results:`
                : 'Search for a book to begin'}
            </h2>

            <Grid container spacing={2}>
                {searchedBooks.map((book) => (
                    <Grid item key={book.bookId} xs={12} sm={6} md={4} lg={3}>
                        <Card>
                            {book.image && (
                                <img
                                    src={book.image}
                                    alt={`The cover for ${book.title}`}
                                    style={{ maxWidth: '100%' }}
                                />
                            )}
                        <CardContent>
                            <h3>{book.title}</h3>
                            <p className='small'>Authors: {book.authors.join(',')}</p>
                            <p>{book.description}</p>
                        </CardContent>
                        {/* <CardActions> */}
                            {Auth.loggedIn() && (
                                <Button 
                                    variant="contained"
                                    color={savedBookIds.includes(book.bookId) ? 'secondary' : 'primary'}
                                    fullWidth
                                    onClick={() => handleSaveBook(book.bookId)}
                                    >
                                        {savedBookIds.includes(book.bookId)
                                            ? 'This book has been saved!'
                                        : 'Save this books!'}
                                    </Button>
                            )}
                        {/* </CardActions> */}
                        </Card>
                        </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default googleBookSearch;