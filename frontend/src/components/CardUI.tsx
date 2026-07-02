import React, { useState } from 'react';
import { buildPath } from './Path.tsx';
import { retrieveToken, storeToken } from '../tokenStorage';

function CardUI() {
    const [cardList, setCardList] = useState('');
    const [searchName, setSearchName] = useState('');
    const [cardName, setCardName] = useState('');
    const [message, setMessage] = useState('');

    // Retrieve user data to know who is logged in
    const _ud = localStorage.getItem('user_data');
    const ud = JSON.parse(_ud || '{}');
    const userId = ud.id;

    const addCard = async (event: any): Promise<void> => {
        event.preventDefault();

        // 1. Fetch our stored JWT string
        const currentToken = retrieveToken();

        // 2. Put the token into our payload object
        const obj = { 
            userId: userId, 
            card: cardName, 
            jwtToken: currentToken 
        };
        const js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/addcard'), {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            const res = JSON.parse(await response.text());
            console.log("Search response:", res);
            console.log("Returned jwtToken:", res.jwtToken);

            if (res.error && res.error.length > 0) {
                setMessage(res.error);
            } else {
                setMessage('Card has been added');
                setCardName('');
                
                // 3. Keep the token rolling if a refreshed one came back
                if (res.jwtToken) {
                    storeToken({ accessToken: res.jwtToken });
                }
            }
        } catch (error: any) {
            setMessage(error.toString());
        }
    };

    const searchCard = async (event: any): Promise<void> => {
        event.preventDefault();

        const currentToken = retrieveToken();
        const obj = { 
            userId: userId, 
            search: searchName, 
            jwtToken: currentToken 
        };
        const js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/searchcards'), {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            const res = JSON.parse(await response.text());
            console.log("Search response:", res);
            console.log("Returned jwtToken:", res.jwtToken);

            if (res.error && res.error.length > 0) {
                setMessage(res.error);
            } else {
                // Formatting the list for display
                const results = res.results || [];
                let _cardList = '';
                for (let i = 0; i < results.length; i++) {
                    _cardList += results[i];
                    if (i < results.length - 1) _cardList += ', ';
                }
                setCardList(_cardList);
                
                // Keep the token rolling
                if (res.jwtToken) {
                    storeToken({ accessToken: res.jwtToken });
                }
            }
        } catch (error: any) {
            setMessage(error.toString());
        }
    };

    return (
        <div id="cardUIDiv">
            <input type="text" id="searchText" placeholder="Card To Search For" 
                onChange={(e) => setSearchName(e.target.value)} />
            <button type="button" id="searchCardButton" className="buttons" onClick={searchCard}> Search Card </button><br />
            <span id="cardSearchResult">{cardList}</span><br /><br />
            
            <input type="text" id="cardText" placeholder="Card To Add" 
                onChange={(e) => setCardName(e.target.value)} />
            <button type="button" id="addCardButton" className="buttons" onClick={addCard}> Add Card </button><br />
            <span id="cardAddResult">{message}</span>
        </div>
    );
}

export default CardUI;