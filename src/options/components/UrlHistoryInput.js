import React from 'react';
import AsyncSelect, { makeAsyncSelect } from 'react-select/async';

const foo = (inputValue) => browser.history.search(
  {
    text: inputValue,
    maxResults: 10
  });

export default class  UrlHistoryInput extends React.Component {
  
  

  render() {

    return (
      <AsyncSelect 
        cacheOptions defaultOptions 
        loadOptions={foo}
      />
    );
  }
}

