import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AsyncSelect, { makeAsyncSelect } from 'react-select/async';

export default class UrlHistoryInput extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      key: new Date().getMilliseconds(),
      inputValue: '',
      selectedValue: null
    };
    browser.history.onVisited.addListener(this.onHistoryItemChanged);
    browser.history.onVisited.removeListener(this.onHistoryItemChanged);
  }

  componentDidMount() {
    
  }

  getBrowserHistory = inputValue => {
    return browser.history.search({
      text: inputValue,
      maxResults: 10
    })
    .then((historyItems) => {
      console.log(historyItems);
      console.log(historyItems.flatMap(item => [{
        id: item.id, 
        url: new URL(item.url).hostname
      }
    ]));
    return historyItems.flatMap(item => [{
        id: item.id, 
        url: item.url,
        host: new URL(item.url).hostname
      }
    ])})
    .catch(err => { console.log("bzzt");});;
  }

  onHistoryItemChanged = _ => {
    console.log("History Changed");
    this.setState({key: new Date().getMilliseconds()});
  };
  
   
  // handle input change event
  handleInputChange = value => {
    this.setState({inputValue: value});
  }
  
  // handle selection
  handleChange = value => {
    this.setState({selectedValue: value})
    this.props.onItemChange(value);
  }

  render() {
    // <div className="form__input" id="site" name="site">
      return <AsyncSelect 
        key={this.state.key}
        autoFocus
        cacheOptions 
        className={"form__input"}
        classNamePrefix={"form"}
        closeMenuOnSelect
        defaultOptions 
        name={"site"}
        id={"site"}
        placeholder={"Add a site to the blocklist..."}
        isClearable
        isSearchable
        value={this.state.selectedValue}
        getOptionLabel={e => e.host}
        getOptionValue={e => e.id}
        onInputChange={this.handleInputChange}
        onChange={this.handleChange}
        loadOptions={this.getBrowserHistory}
      />
    // </div>
  }
}


UrlHistoryInput.propTypes = {
  // selectedItem: PropTypes.,
  onItemChange: PropTypes.func,
};

