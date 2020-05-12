import { expect } from 'chai';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';

import * as request from '../../src/lib/airtable/request';
import * as userData from '../../src/lib/redux/userData';
import { store } from '../../src/lib/redux/store';

import {
  toggleValidColor,
  validateField,
  removeOwner
} from '../../src/lib/adminUtils';

describe('adminUtils', function() {
  const sandbox = sinon.createSandbox();

  describe('#toggleValidColor', function() {
    it('should return "b-is-not-valid" for a nonempty input with type 0', function() {
      const result = toggleValidColor('testcolor', 0);

      expect(result).to.be.a('string');
      expect(result).to.equal('b-is-not-valid');
    });
    it('should return "b-is-valid" for a blank input with type 0', function() {
      const result = toggleValidColor('', 0);

      expect(result).to.be.a('string');
      expect(result).to.equal('b-is-valid');
    });
    it('should return "b-is-valid" for an undefined input with type 0', function() {
      const result = toggleValidColor(undefined, 0);

      expect(result).to.be.a('string');
      expect(result).to.equal('b-is-valid');
    });
    it('should return "\u00a0" for a false input with type 1', function() {
      const result = toggleValidColor(false, 1);

      expect(result).to.be.a('string');
      expect(result).to.equal('\u00a0');
    });
    it('should return input for a true input with type 1', function() {
      const result = toggleValidColor('\u00a1', 1);

      expect(result).to.be.a('string');
      expect(result).to.equal('\u00a1');
    });
    it('should return "b-is-not-valid" for a nonempty input with type 2', function() {
      const result = toggleValidColor('testcolor', 2);

      expect(result).to.be.a('string');
      expect(result).to.equal('b-is-not-valid');
    });
    it('should return null for a blank input with type 2', function() {
      const result = toggleValidColor('', 2);

      expect(result).to.be.a('null');
      expect(result).to.equal(null);
    });
    it('should return null for an undefined input with type 2', function() {
      const result = toggleValidColor(undefined, 2);

      expect(result).to.be.a('null');
      expect(result).to.equal(null);
    });
    it('should return null for any input with type 3 or more', function() {
      const result = toggleValidColor('testcolor', 3);

      expect(result).to.be.a('null');
      expect(result).to.equal(null);
    });
  });

  describe('#validateField', function() {
    it('should return an error for no validator name and an empty value', function() {
      return validateField(null, null).then(result => {
        expect(result).to.be.a('string');
        expect(result).to.equal('Please enter this required field.');
      });
    });
    it('should return an empty string for no validator name and an non-empty value', function() {
      return validateField(null, 'something').then(result => {
        expect(result).to.be.a('string');
        expect(result).to.equal('');
      });
    });

    describe('#inviteEmail', function() {
      beforeEach(function() {
        fetchMock.mock(process.env.REACT_APP_SERVER_URL, { unique: true });
      });

      afterEach(function() {
        fetchMock.restore();
      });

      it('should return an empty string for a valid email', function() {
        return validateField('inviteEmail', 'test@gmail.com').then(result => {
          expect(result).to.be.a('string');
          expect(result).to.equal('');
        });
      });
      it('should return an error for an invalid email', function() {
        return validateField('inviteEmail', 'testgmail.com').then(result => {
          expect(result).to.be.a('string');
          expect(result).to.equal('Please enter a valid email address.');
        });
      });
      it('should return an error for a non uniqe email', function() {
        fetchMock.mock(
          process.env.REACT_APP_SERVER_URL,
          { unique: false },
          { overwriteRoutes: true }
        );

        return validateField('inviteEmail', 'test@gmail.com').then(result => {
          expect(result).to.be.a('string');
          expect(result).to.equal(
            'It looks like an account with this email already exists.'
          );
        });
      });
    });

    describe('#updateEmail', function() {
      beforeEach(function() {
        fetchMock.mock(process.env.REACT_APP_SERVER_URL, { unique: true });
      });

      afterEach(function() {
        fetchMock.restore();
      });

      it('should return an empty string for a valid email', function() {
        return validateField('updateEmail', 'test@gmail.com').then(result => {
          expect(result).to.be.a('string');
          expect(result).to.equal('');
        });
      });
      it('should return an error for an invalid email', function() {
        return validateField('updateEmail', 'testgmail.com').then(result => {
          expect(result).to.be.a('string');
          expect(result).to.equal('Please enter a valid email address.');
        });
      });
      it('should return an error for a non uniqe email', function() {
        fetchMock.mock(
          process.env.REACT_APP_SERVER_URL,
          { unique: false },
          { overwriteRoutes: true }
        );

        return validateField('updateEmail', 'test@gmail.com').then(result => {
          expect(result).to.be.a('string');
          expect(result).to.equal(
            'It looks like an account with this email already exists.'
          );
        });
      });
    });

    describe('#inviteShareAmount', function() {
      it('should return an empty string for a valid share amount', function() {
        return validateField('inviteShareAmount', '8').then(result => {
          expect(result).to.be.a('string');
          expect(result).to.equal('');
        });
      });
      it('should return an error for a non-number', function() {
        return validateField('inviteShareAmount', 'yikes').then(result => {
          expect(result).to.be.a('string');
          expect(result).to.equal('Must be a number');
        });
      });
      it('should return an error for a share amount over 10', function() {
        return validateField('inviteShareAmount', '11').then(result => {
          expect(result).to.be.a('string');
          expect(result).to.equal('Max number of shares is 10');
        });
      });
      it('should return an error for a share amount under 1', function() {
        return validateField('inviteShareAmount', '0').then(result => {
          expect(result).to.be.a('string');
          expect(result).to.equal('Min number of shares is 1');
        });
      });
    });

    describe('#updateState', function() {
      it('should return an empty string for California', function() {
        return validateField('updateState', 'CA').then(result => {
          expect(result).to.be.a('string');
          expect(result).to.equal('');
        });
      });
      it('should return an error for not a state', function() {
        return validateField('updateState', 'NT').then(result => {
          expect(result).to.be.a('string');
          expect(result).to.equal('Invalid state');
        });
      });
    });

    describe('#updateZipcode', function() {
      it('should return an empty string for a valid zip code', function() {
        return validateField('updateZipcode', '94612').then(result => {
          expect(result).to.be.a('string');
          expect(result).to.equal('');
        });
      });
      it('should return an error for a number that is not 5 digits', function() {
        return validateField('updateZipcode', '946123').then(result => {
          expect(result).to.be.a('string');
          expect(result).to.equal('Must be 5 digits');
        });
      });
    });
  });

  describe('#removeOwner', function() {
    const owner = {
      id: 5,
      projectGroupId: 0
    };
    const loggedInOwner = { id: 365 };
    const projectGroup = {
      id: 0,
      ownerIds: [1, 2, 3, 4, 5]
    };

    beforeEach(function() {
      sandbox.stub(request, 'getProjectGroupById').returns(projectGroup);
      sandbox.stub(request, 'updateProjectGroup');
      sandbox.stub(userData, 'refreshUserData');
      sandbox.stub(store, 'getState').returns({ userData: loggedInOwner });
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should succesfully remove an owner from a project group', function() {
      return removeOwner(owner).then(() => {
        expect(request.updateProjectGroup.getCall(0).args[0]).to.equal(0);
        expect(
          JSON.stringify(request.updateProjectGroup.getCall(0).args[1].ownerIds)
        ).to.equal(JSON.stringify([1, 2, 3, 4]));
        expect(userData.refreshUserData.getCall(0).args[0]).to.equal(365);
      });
    });
  });
});
