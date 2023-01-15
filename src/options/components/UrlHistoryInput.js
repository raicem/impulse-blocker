import React from 'react';
import PropTypes from 'prop-types';
import { components } from 'react-select'
import AsyncSelect from 'react-select/async';


const SelectContainer = ({
  children,
  ...props
}) => {
  return (
      <components.SelectContainer {...props}>
        {children}
      </components.SelectContainer>
  );
};

export default class UrlHistoryInput extends React.Component {

  constructor(props) {
    super(props);
    browser.permissions.request({permissions: ["history"]})
    .then((response) => {
      if (response) {
        console.log("Permission was granted");
      } else {
        console.log("Permission was refused");
      }
      return browser.permissions.getAll();
    })
    .then((currentPermissions) => {
      console.log("Current: ", currentPermissions);
    });
    this.browserHistory = browser.history;
    this.state = {
      // allows to rerender the dropdown list
      key: new Date().getMilliseconds(),
      inputValue: '',
      selectedValue: null
    };
  }

  componentDidMount() {
    this.browserHistory.onTitleChanged.addListener(this.onHistoryItemChanged);
    // this.browser.permissions.onAdded.addListener(listener)
  }

  componentWillUnmount() {
    this.browserHistory.onTitleChanged.removeListener(this.onHistoryItemChanged);
  }

  getBrowserHistory = inputValue => {
    var searchPromise = this.browserHistory.search({
      text: inputValue,
      maxResults: 10
    });
    
    if (!inputValue) {
      return searchPromise;
    }

    return searchPromise.then((historyItems) => 
    // returning only history items with a title
      historyItems.filter((item, index, arr) => item.title))
    .catch(err => console.log("Error fetching browser history: " + err));   
  }  

  onHistoryItemChanged = _ => this.setState({key: new Date().getMilliseconds()});

  // handle input change event
  handleInputChange = value => this.setState({inputValue: value});
  
  // handle selection
  handleChange = value => {
    this.setState({selectedValue: value})
    this.props.onItemChange(value);
  }

  getLabel = item => {
    if (!item.title) {
      return item.url
    }
    return item.title.concat(" - ", item.url);
  }

  render() {
      return <AsyncSelect 
        key={this.state.key}
        autoFocus
        cacheOptions 
        classNamePrefix={"form"}
        closeMenuOnSelect
        defaultOptions
        name={"site"}
        id={"site"}
        placeholder={"Add a site to the blocklist..."}
        isClearable
        isSearchable
        value={this.state.selectedValue}
        getOptionLabel={this.getLabel}
        getOptionValue={e => e.id}
        onInputChange={this.handleInputChange}
        onChange={this.handleChange}
        loadOptions={this.getBrowserHistory}
        components={{ SelectContainer }}
        styles={{
          container: (base) => ({
            ...base,
            backgroundColor: "#f7f7f9",
            fontSize: "1.2rem",
            fontWeight: 400,
            lineHeight: "1.5rem",
            color: "#55595c",
            border: "0 solid #ced4da;",
            minWidth: 200,
            width: 250
          }),
        }}
      />
  }
}


UrlHistoryInput.propTypes = {
  // selectedItem: PropTypes.,
  onItemChange: PropTypes.func,
};

