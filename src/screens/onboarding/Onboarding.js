import React from 'react';
import { connect } from 'react-redux';
import BasicInfo from './BasicInfo';
import ContactInfo from './ContactInfo';
import Bylaws from './Bylaws';
import ProjectGroups from './ProjectGroups';
import Payment from './Payment';
import Complete from './Complete';
import formValidation from '../../lib/onboarding/formValidation';
import { createPersonOwnerUserLoginRecord } from '../../lib/onboarding/onboardingUtils';
import Template from './components/Template';

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
      dividends: false,
      projectGroup: '',
      noProjectGroup: false,
      numShares: 1, // TODO(dfangshuo): 0 causes a bug
      beneficiaries: [],
      billingAddressSame: false,
      ccnumber: '',
      expmonth: '',
      expyear: '',
      cvv: '',
      billingStreet: '',
      billingApt: '',
      billingState: '',
      billingZipcode: '',
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
        numShares: 0,
        dividends: '',
        beneficiaries: [],
        ccNumber: '',
        expmonth: '',
        expyear: '',
        cvv: '',
        billingStreet: '',
        billingApt: '',
        billingCity: '',
        billingState: '',
        billingZipcode: ''
      },
      step: 1
    };
  }

  async componentDidMount() {
    const { person, owner } = this.props;

    // TODO: Not sure what the state of redux will be as onboarding goes on.
    // This is a whole nother PR to figure out...eek

    if (!person) {
      return;
    }

    this.setState({ userId: person.recordIdforDev });
    const step = person['Onboarding Step'];

    // Todo: Clean up state code
    this.setState({
      step: person.onboardingStep,
      userLoginId: person.userLogin[0],
      personId: person.owner[0], // This is kinda messed up naming wise LOL
      fname: person.name.split(' ')[0],
      lname: person.name.split(' ')[1],
      email: person.email,
      altEmail: person.alternativeEmail,
      street: person.street,
      apt: person.apt,
      city: person.city,
      state: person.state,
      zipcode: person.zipcode,
      phoneNumber: person.phoneNumber,
      mailingStreet: person.mailingStreet,
      mailingApt: person.mailingApt,
      mailingCity: person.mailingCity,
      mailingState: person.mailingState,
      mailingZipcode: person.mailingZipcode,
      mailingPhoneNumber: person.mailingPhoneNumber,
      billingStreet: person.billingStreet,
      billingApt: person.billingApt,
      billingCity: person.billingCity,
      billingState: person.billingState,
      billingZipcode: person.billingZipcode,
      projectGroup: person.projectGroup[0]
    });

    if (step > 3) {
      const numShares = owner.numberOfShares;

      this.setState({
        projectGroup: owner.projectGroup[0],
        numShares: numShares || 1,
        dividends: owner.receivingDividends
      });

      if (step > 4) {
        this.setState({
          bylaw1: true,
          bylaw2: true
        });
      }
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

  handleRecordCreation = ({
    createdOwnerId,
    createdPersonId,
    createdUserLoginId
  }) => {
    this.setState({
      userId: createdPersonId,
      personId: createdOwnerId,
      userLoginId: createdUserLoginId
    });
  };

  // updates the state whenever there is a change made
  handleChange = event => {
    const {
      bylaw1,
      bylaw2,
      street,
      apt,
      city,
      state,
      zipcode,
      phoneNumber,
      billingAddressSame,
      mailingAddressSame
    } = this.state;
    const key = event.target.name;
    const newValue = event.target.value;
    switch (key) {
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
      case 'dividends':
        this.setState({
          dividends: newValue === 'yes'
        });
        break;
      case 'street':
      case 'apt':
      case 'city':
      case 'state':
      case 'zipcode':
        if (billingAddressSame) {
          const billingKey = `billing${key
            .charAt(0)
            .toUpperCase()}${key.substring(1)}`;
          this.setState({
            [billingKey]: newValue
          });
        }
        if (mailingAddressSame) {
          const mailingKey = `mailing${key
            .charAt(0)
            .toUpperCase()}${key.substring(1)}`;
          this.setState({
            [mailingKey]: newValue
          });
        }
        this.setState({ [key]: newValue });
        break;
      case 'billingAddressSame':
        if (!billingAddressSame) {
          this.setState({
            billingStreet: street,
            billingApt: apt,
            billingCity: city,
            billingState: state,
            billingZipcode: zipcode
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
      case 'projectGroup':
        this.setState({
          projectGroup: newValue
        });
        break;
      case 'numShares':
        this.setState({
          numShares: newValue
        });
        break;
      default:
        this.setState({
          [key]: newValue
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
  callBackBylawValidation = () => {
    const { errors } = this.state;
    this.setState({
      errors: { ...errors, bylaw1: 'Required' }
    });
  };

  render() {
    const { step, noProjectGroup } = this.state;
    const { history } = this.props;
    switch (step) {
      case 1:
        return (
          <BasicInfo
            nextStep={this.nextStep}
            values={this.state}
            handleChange={this.handleChange}
            handleFormValidation={this.handleFormValidation}
          />
        );
      case 2:
        return Template(
          <ContactInfo
            nextStep={this.nextStep}
            values={this.state}
            prevStep={this.prevStep}
            handleChange={this.handleChange}
            handleFormValidation={this.handleFormValidation}
            handleRecordCreation={this.handleRecordCreation}
            createPersonOwnerUserLoginRecord={createPersonOwnerUserLoginRecord}
          />,
          2
        );
      case 3:
        return Template(
          <ProjectGroups
            nextStep={this.nextStep}
            values={this.state}
            prevStep={this.prevStep}
            handleChange={this.handleChange}
            handleFormValidation={this.handleFormValidation}
            noProjectGroup={noProjectGroup}
          />,
          3
        );
      case 4:
        return Template(
          <Bylaws
            nextStep={this.nextStep}
            values={this.state}
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
            values={this.state}
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
            values={this.state}
            prevStep={this.prevStep}
            onSubmit={this.onSubmit}
            handleChange={this.handleChange}
            handleFormValidation={this.handleFormValidation}
            handleDividends={this.handleDividends}
            history={history}
          />,
          6
        );
      default:
        return <div>Page not Found</div>;
    }
  }
}

const mapStateToProps = state => ({
  person: state.userData.person,
  owner: state.userData.owner
});
export default connect(mapStateToProps)(Onboarding);
