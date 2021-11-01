import React, {useState } from 'react';
import PropTypes from 'prop-types';
import AsyncSelect, { makeAsyncSelect } from 'react-select/async';



export default function UrlHistoryInput({onItemChange}) {
    

  const getBroserHistory = (inputValue) => {
    return browser.history.search({
      text: inputValue,
      maxResults: 10
    });
  }
  
  const [items, setItems] = useState([]);
  const [inputValue, setValue] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);
   
  // handle input change event
  const handleInputChange = value => {
    setValue(value);
  };
  
  // handle selection
  const handleChange = value => {
    setSelectedValue(value);
    onItemChange(value);
  }

  return (
    <div className="form__input" id="site" name="site">
      <AsyncSelect 
        cacheOptions 
        defaultOptions 
        value={selectedValue}
        getOptionLabel={e => e.url}
        getOptionValue={e => e.id}
        onInputChange={handleInputChange}
        onChange={handleChange}
        loadOptions={getBroserHistory}
      />
    </div>
    );
  }


UrlHistoryInput.propTypes = {
  // selectedItem: PropTypes.,
  onItemChange: PropTypes.func,
};

