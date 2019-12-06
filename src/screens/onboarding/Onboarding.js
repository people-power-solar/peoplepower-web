import React from 'react';
import BasicInfo from './BasicInfo';
import ContactInfo from './ContactInfo';
import Bylaws from './Bylaws';
import ProjectGroups from './ProjectGroups';
import Payment from './Payment';
import Complete from './Complete';
import formValidation from '../../lib/formValidation';
import { getLoggedInUserId } from '../../lib/auth';
import { createPersonOwnerUserLoginRecord } from '../../lib/onboardingUtils';
import Template from './Template';
import { getRecord } from '../../lib/request';

class Onboarding extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      userLoginId: '',
      personId: '',
      fname: '',
      lname: '',
      email: '',
      altEmail: '',
      password: '',
      street: '',
      city: '',
      apt: '',
      state: '',
      zipcode: '',
      phoneNumber: '',
      mailingAddressSame: false,
      mailingStreet: '',
      mailingCity: '',
      mailingApt: '',
      mailingState: '',
      mailingZipcode: '',
      mailingPhoneNumber: '',
      bylaw1: false,
      bylaw2: false,
      projectGroup: {},
      noProjectGroup: false,
      numShares: '',
      dividends: '',
      beneficiaries: [],
      billingAddressSame: false,
      ccnumber: '',
      expmonth: '',
      expyear: '',
      cvv: '',
      ccstreet: '',
      ccapt: '',
      ccstate: '',
      cczipcode: '',
      errors: {
        // object that holds all the error messages
        fname: '',
        lname: '',
        email: '',
        password: '',
        street: '',
        apt: '',
        city: '',
        state: '',
        zipcode: '',
        phoneNumber: '',
        mailingStreet: '',
        mailingCity: '',
        mailingApt: '',
        mailingState: '',
        mailingZipcode: '',
        mailingPhoneNumber: '',
        bylaw1: '',
        bylaw2: '',
        projectGroup: '',
        numShares: '',
        dividends: false,
        beneficiaries: [],
        ccnumber: '',
        expmonth: '',
        expyear: '',
        cvv: '',
        ccstreet: '',
        ccapt: '',
        ccstate: '',
        cczipcode: ''
      },
      step: 1
    };
    this.handleChange = this.handleChange.bind(this);
    this.callBackBylawValidation = this.callBackBylawValidation.bind(this);
  }

  componentDidMount() {
    const id = getLoggedInUserId();
    const { step, projectGroup, numShares } = this.state;
    // Person does not have a User Id
    if (!id) {
      return;
    }

    this.setState({ userId: id });
    getRecord('Person', id).then(payload => {
      this.setState({
        step: payload.record['Onboarding Step'],
        userLoginId: payload.record['User Login'][0],
        personId: payload.record.Owner[0],
        fname: payload.record.Name.split(' ')[0],
        lname: payload.record.Name.split(' ')[1],
        email: payload.record.Email,
        altEmail: payload.record['Alternative Email'],
        street: payload.record.Street,
        apt: payload.record.Apt,
        city: payload.record.City,
        state: payload.record.State,
        zipcode: payload.record.Zipcode,
        phoneNumber: payload.record['Phone Number'],
        mailingStreet: payload.record['Mailing Street'],
        mailingApt: payload.record['Mailing Apt'],
        mailingCity: payload.record['Mailing City'],
        mailingState: payload.record['Mailing State'],
        mailingZipcode: payload.record['Mailing Zipcode'],
        mailingPhoneNumber: payload.record['Mailing Phone Number'],
        numShares: payload.record['Number of Shares'],
        dividends: payload.record.Dividends,
        password: '*****'
      });
      if (!numShares) {
        this.setState({
          numShares: 0
        });
      }
    });
    getRecord('Owner', id).then(payload => {
      console.log(payload);
      // this.setState({
      //     projectGroup: [payload.record["Project Group"].id]
      // });
    });
    if (step > 3 && projectGroup === {}) {
      this.setState({
        noProjectGroup: true
      });
    }
    if (step > 4) {
      this.setState({
        bylaw1: true,
        bylaw2: true
      });
    }
  }

  // next function increments page up one and switches to that numbered page
  nextStep = () => {
    const { step } = this.state;
    this.setState({ step: step + 1 });
  };

  // prev function decrements page down one and switches to that numbered page
  prevStep = () => {
    const { step } = this.state;
    this.setState({ step: step - 1 });
  };

  // updates the state whenever there is a change made
  handleChange = event => {
    const {
      bylaw1,
      bylaw2,
      noProjectGroup,
      street,
      apt,
      city,
      state,
      zipcode,
      phoneNumber,
      billingAddressSame,
      mailingAddressSame
    } = this.state;
    switch (event.target.name) {
      case 'bylaw1':
        this.setState({
          bylaw1: !bylaw1
        });
        break;
      case 'bylaw2':
        this.setState({
          bylaw2: !bylaw2
        });
        break;
      case 'noProjectGroup':
        this.setState({
          noProjectGroup: !noProjectGroup
        });
        break;
      case 'billingAddressSame':
        if (!billingAddressSame) {
          this.setState({
            ccstreet: street,
            ccapt: apt,
            cccity: city,
            ccstate: state,
            cczipcode: zipcode
          });
        }
        this.setState({
          billingAddressSame: !billingAddressSame
        });
        break;
      case 'mailingAddressSame':
        if (!mailingAddressSame) {
          this.setState({
            mailingStreet: street,
            mailingApt: apt,
            mailingCity: city,
            mailingState: state,
            mailingZipcode: zipcode,
            mailingPhoneNumber: phoneNumber
          });
        }
        this.setState({
          mailingAddressSame: !mailingAddressSame
        });
        break;
      case 'dividends':
        this.setState({
          dividends: event.target.value
        });
        break;
      case 'projectGroup':
        this.setState({
          projectGroup: event.target.value
        });
        break;
      default:
        this.setState({
          [event.target.name]: event.target.value
        });
    }
  };

  // validates the input divs
  handleFormValidation = event => {
    const { value, name } = event.target;
    const errorMessage = formValidation(name, value);
    const { errors } = this.state;

    this.setState({
      errors: { ...errors, [name]: errorMessage }
    });
  };

  // function for validation of bylaws
  callBackBylawValidation() {
    const { errors } = this.state;
    this.setState({
      errors: { ...errors, bylaw1: 'Required' }
    });
  }

  render() {
    const { step } = this.state;
    const {
      userId,
      personId,
      userLoginId,
      fname,
      lname,
      email,
      altEmail,
      password,
      street,
      apt,
      city,
      state,
      zipcode,
      phoneNumber,
      mailingAddressSame,
      mailingStreet,
      mailingApt,
      mailingCity,
      mailingState,
      mailingZipcode,
      mailingPhoneNumber,
      bylaw1,
      bylaw2,
      projectGroup,
      noProjectGroup,
      numShares,
      dividends,
      beneficiaries,
      billingAddressSame,
      ccnumber,
      expmonth,
      expyear,
      cvv,
      ccstreet,
      ccapt,
      cccity,
      ccstate,
      cczipcode,
      errors,
      touched
    } = this.state;
    const values = {
      userId,
      personId,
      userLoginId,
      fname,
      lname,
      email,
      altEmail,
      password,
      street,
      apt,
      city,
      state,
      zipcode,
      phoneNumber,
      mailingAddressSame,
      mailingStreet,
      mailingApt,
      mailingCity,
      mailingState,
      mailingZipcode,
      mailingPhoneNumber,
      bylaw1,
      bylaw2,
      projectGroup,
      noProjectGroup,
      numShares,
      dividends,
      beneficiaries,
      billingAddressSame,
      ccnumber,
      expmonth,
      expyear,
      cvv,
      ccstreet,
      ccapt,
      cccity,
      ccstate,
      cczipcode,
      errors,
      touched
    };

    switch (step) {
      case 1:
        return (
          <BasicInfo
            nextStep={this.nextStep}
            values={values}
            handleChange={this.handleChange}
            handleFormValidation={this.handleFormValidation}
          />
        );
      case 2:
        return Template(
          <ContactInfo
            nextStep={this.nextStep}
            values={values}
            prevStep={this.prevStep}
            handleChange={this.handleChange}
            handleFormValidation={this.handleFormValidation}
            createPersonOwnerUserLoginRecord={createPersonOwnerUserLoginRecord}
          />,
          2
        );
      case 3:
        return Template(
          <ProjectGroups
            nextStep={this.nextStep}
            values={values}
            prevStep={this.prevStep}
            handleChange={this.handleChange}
            handleFormValidation={this.handleFormValidation}
          />,
          3
        );
      case 4:
        return Template(
          <Bylaws
            nextStep={this.nextStep}
            values={values}
            prevStep={this.prevStep}
            handleChange={this.handleChange}
            callBackBylawValidation={this.callBackBylawValidation}
            handleClick={this.handleClick}
          />,
          4
        );
      case 5:
        return Template(
          <Payment
            values={values}
            prevStep={this.prevStep}
            nextStep={this.nextStep}
            handleChange={this.handleChange}
            handleFormValidation={this.handleFormValidation}
            handleDividends={this.handleDividends}
          />,
          5
        );
      case 6:
        return Template(
          <Complete
            values={values}
            prevStep={this.prevStep}
            onSubmit={this.onSubmit}
            handleChange={this.handleChange}
            handleFormValidation={this.handleFormValidation}
            handleDividends={this.handleDividends}
          />,
          6
        );
      default:
        return <div>Page not Found</div>;
    }
  }
}

export default Onboarding;
