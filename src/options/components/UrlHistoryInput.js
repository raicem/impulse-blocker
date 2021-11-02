import React from 'react';
import PropTypes from 'prop-types';
import { components, ContainerProps} from 'react-select'
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
    this.browserHistory = browser.history;
    this.state = {
      key: new Date().getMilliseconds(),
      inputValue: '',
      selectedValue: null
    };
  }

  componentDidMount() {
    this.browserHistory.onTitleChanged.addListener(this.onHistoryItemChanged);
  }

  componentWillUnmount() {
    this.browserHistory.onTitleChanged.removeListener(this.onHistoryItemChanged);
  }

  getBrowserHistory = inputValue => {
    var searchPromise = this.browserHistory.search({
      text: inputValue,
      maxResults: 10
    });
    if (!!inputValue) {
      // return the recently visited websites
      return searchPromise;
    }

    return searchPromise
      .then((historyItems) => historyItems.flatMap(item => [{
        id: item.id, 
        title: item.title,
        url: item.url,
        host: new URL(item.url).hostname
      }]))
    .then((historyItems) => 
    // only showing history items with a title
      historyItems.filter((item, index, arr) => item.title))
    .catch(err => console.log("bzzt"));   
  }  

  onHistoryItemChanged = _ => this.setState({key: new Date().getMilliseconds()});
  

  // handle input change event
  handleInputChange = value => this.setState({inputValue: value});
  
  
  // handle selection
  handleChange = value => {
    this.setState({selectedValue: value})
    this.props.onItemChange(value);
  }

  render() {
      return <AsyncSelect 
        key={this.state.key}
        autoFocus
        cacheOptions 
        // className={"form__input"}
        classNamePrefix={"form"}
        closeMenuOnSelect
        defaultOptions 
        name={"site"}
        id={"site"}
        placeholder={"Add a site to the blocklist..."}
        isClearable
        isSearchable
        value={this.state.selectedValue}
        getOptionLabel={e => e.title + " - " + e.url}
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
            minWidth: 200
          }),
        }}
      />
  }
}


UrlHistoryInput.propTypes = {
  // selectedItem: PropTypes.,
  onItemChange: PropTypes.func,
};

