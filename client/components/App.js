import React, { Component } from 'react';
import axios from 'axios';
import Maps from './Maps';
import Form from './Form';
import GoogleAuth from './GoogleAuth';

const YELP_CATEGORIES = ['Cafes', 'Restaurants', 'Bars'];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userCurrentCoords: null,
      radioName: 'p30min',
      radioVal: 30 * 60,
      showForm: true,
      yelpCategory: '',
      yelpCategoryMatch: '',
      yelpCategoryMatches: [],
    };
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onRadioChange = this.onRadioChange.bind(this);
    this.handleYelpCategoryInput = this.handleYelpCategoryInput.bind(this);
    this.displayYelpMatches = this.displayYelpMatches.bind(this);
    this.findMatches = this.findMatches.bind(this);
    this.selectYelpCategoryMatch = this.selectYelpCategoryMatch.bind(this);
    this.getUserCurrentCoords = this.getUserCurrentCoords.bind(this);
    this.onGoogleSuccess = this.onGoogleSuccess.bind(this);
    this.onGoogleFailure = this.onGoogleFailure.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  onGoogleSuccess(googleUser) {
    console.log('Signing into Google!');
    const profile = googleUser.getBasicProfile();
    console.log(`Welcome, ${profile.getName()}`);
    const token = googleUser.getAuthResponse().id_token;
    axios.post('http://localhost:3000/api/auth/google', {
      token,
    });
  }

  onGoogleFailure(error) {
    cconsle.log(error);
  }

  signOut() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function() {
      console.log('User signed out.');
    });
  }

  onChange(e) {
    this.setState({
      [e.target.id]: e.target.value,
    });
  }

  findMatches(categoryToMatch, categories) {
    return categories.filter(category => {
      const regex = new RegExp(categoryToMatch, 'gi');
      return category.match(regex);
    });
  }

  displayYelpMatches(value) {
    const matchArray = this.findMatches(value, YELP_CATEGORIES);
    return matchArray;
  }

  handleYelpCategoryInput(e, value) {
    const matches = this.displayYelpMatches(value);
    this.setState({
      yelpCategory: e.target.value,
      yelpCategoryMatches: matches,
    });
  }

  selectYelpCategoryMatch(e) {
    this.setState({
      yelpCategoryMatch: e.target.innerText,
    });
  }

  getUserCurrentCoords() {
    event.preventDefault();
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };
    const success = pos => {
      this.setState({
        userCurrentCoords: pos.coords,
      });
    };
    const error = err => {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    };
    navigator.geolocation.getCurrentPosition(success, error, options);
  }
  onClick(e) {
    console.log(this.state.locInput0a + ' 📍 ' + this.state.locInput0b);
    console.log('Leaving in +' + this.state.radioVal + ' seconds');
    let departureTime = new Date(Date.now() + this.state.radioVal * 1000);
    departureTime = departureTime.toISOString();
    console.log('(' + departureTime + ')');
    const data = {
      points: [this.state.locInput0a, this.state.locInput0b],
      departureTime: departureTime,
    };
    this.setState({ loading: true });
    fetch('http://localhost:3000/buildroute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        console.log('raw server response', response);
        return response.json();
      })
      .then(data => {
        this.setState({ loading: false });
        console.log('data', data);
        this.setState({
          result: {
            point1: data.points[0],
            point2: data.points[1],
            midpt: data.midpt,
            aToMidptURL: data.directionURLs[0],
            bToMidptURL: data.directionURLs[1],
            address1: data.addresses[0],
            address2: data.addresses[1],
            isochrones: data.isochrones,
            yelps: data.filteredYelpData,
          },
          showForm: false,
        });
      });
  }
  onRadioChange(e) {
    this.setState({
      radioVal: [e.target.value],
      radioName: [e.target.id],
    });
  }
  hasUpdatedMap() {
    this.setState({ shouldUpdateMap: false });
  }
  render() {
    const { showForm, yelpCategory, yelpCategoryMatches } = this.state;
    return (
      <div className="App">
        <h1>midpt</h1>
        {showForm && (
          <Form
            onChange={this.onChange}
            onClick={this.onClick}
            radioVal={this.state.radioName}
            onRadioChange={this.onRadioChange}
            placeholder={this.state.placeholder}
            loading={this.state.loading}
            yelpCategory={yelpCategory}
            handleYelpCategoryInput={this.handleYelpCategoryInput}
            yelpCategoryMatches={yelpCategoryMatches}
            selectYelpCategoryMatch={this.selectYelpCategoryMatch}
            getUserCurrentCoords={this.getUserCurrentCoords}
          />
        )}
        <Maps result={this.state.result} />
        <GoogleAuth
          signOut={this.signOut}
          onGoogleSuccess={this.onGoogleSuccess}
          onGoogleFailure={this.onGoogleFailure}
        />
      </div>
    );
  }
}

export default App;
