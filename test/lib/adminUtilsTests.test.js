import { expect } from 'chai';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';

import * as request from '../../src/lib/airtable/request';
import * as userData from '../../src/lib/redux/userData';
import { store } from '../../src/lib/redux/store';

import {
  toggleValidColor,
  validateField,
  removeOwner,
  getOwnerRecordsForProjectGroup,
  inviteMember,
  triggerEmail
} from '../../src/lib/adminUtils';

describe('adminUtils', () => {
  const sandbox = sinon.createSandbox();

  describe('#toggleValidColor', () => {
    it('should return "b-is-not-valid" for a nonempty input with type 0', () => {
      const result = toggleValidColor('testcolor', 0);

      expect(result).to.be.a('string');
      expect(result).to.equal('b-is-not-valid');
    });
    it('should return "b-is-valid" for a blank input with type 0', () => {
      const result = toggleValidColor('', 0);

      expect(result).to.be.a('string');
      expect(result).to.equal('b-is-valid');
    });
    it('should return "b-is-valid" for an undefined input with type 0', () => {
      const result = toggleValidColor(undefined, 0);

      expect(result).to.be.a('string');
      expect(result).to.equal('b-is-valid');
    });
    it('should return "\u00a0" for a false input with type 1', () => {
      const result = toggleValidColor(false, 1);

      expect(result).to.be.a('string');
      expect(result).to.equal('\u00a0');
    });
    it('should return input for a true input with type 1', () => {
      const result = toggleValidColor('\u00a1', 1);

      expect(result).to.be.a('string');
      expect(result).to.equal('\u00a1');
    });
    it('should return "b-is-not-valid" for a nonempty input with type 2', () => {
      const result = toggleValidColor('testcolor', 2);

      expect(result).to.be.a('string');
      expect(result).to.equal('b-is-not-valid');
    });
    it('should return null for a blank input with type 2', () => {
      const result = toggleValidColor('', 2);

      expect(result).to.be.a('null');
      expect(result).to.equal(null);
    });
    it('should return null for an undefined input with type 2', () => {
      const result = toggleValidColor(undefined, 2);

      expect(result).to.be.a('null');
      expect(result).to.equal(null);
    });
    it('should return null for any input with type 3 or more', () => {
      const result = toggleValidColor('testcolor', 3);

      expect(result).to.be.a('null');
      expect(result).to.equal(null);
    });
  });

  describe('#validateField', () => {
    it('should return an error for no validator name and an empty value', async () => {
      const result = await validateField(null, null);

      expect(result).to.be.a('string');
      expect(result).to.equal('Please enter this required field.');
    });
    it('should return an empty string for no validator name and an non-empty value', async () => {
      const result = await validateField(null, 'something');

      expect(result).to.be.a('string');
      expect(result).to.equal('');
    });

    describe('#inviteEmail', () => {
      beforeEach(() => {
        fetchMock.mock(process.env.REACT_APP_SERVER_URL, { unique: true });
      });

      afterEach(() => {
        fetchMock.restore();
      });

      it('should return an empty string for a valid email', async () => {
        const result = await validateField('inviteEmail', 'test@gmail.com');

        expect(result).to.be.a('string');
        expect(result).to.equal('');
      });
      it('should return an error for an invalid email', async () => {
        const result = await validateField('inviteEmail', 'testgmail.com');

        expect(result).to.be.a('string');
        expect(result).to.equal('Please enter a valid email address.');
      });
      it('should return an error for a non uniqe email', async () => {
        fetchMock.mock(
          process.env.REACT_APP_SERVER_URL,
          { unique: false },
          { overwriteRoutes: true }
        );

        const result = await validateField('inviteEmail', 'test@gmail.com');

        expect(result).to.be.a('string');
        expect(result).to.equal(
          'It looks like an account with this email already exists.'
        );
      });
    });

    describe('#updateEmail', () => {
      beforeEach(() => {
        fetchMock.mock(process.env.REACT_APP_SERVER_URL, { unique: true });
      });

      afterEach(() => {
        fetchMock.restore();
      });

      it('should return an empty string for a valid email', async () => {
        const result = await validateField('updateEmail', 'test@gmail.com');

        expect(result).to.be.a('string');
        expect(result).to.equal('');
      });
      it('should return an error for an invalid email', async () => {
        const result = await validateField('updateEmail', 'testgmail.com');

        expect(result).to.be.a('string');
        expect(result).to.equal('Please enter a valid email address.');
      });
      it('should return an error for a non uniqe email', async () => {
        fetchMock.mock(
          process.env.REACT_APP_SERVER_URL,
          { unique: false },
          { overwriteRoutes: true }
        );

        const result = await validateField('updateEmail', 'test@gmail.com');

        expect(result).to.be.a('string');
        expect(result).to.equal(
          'It looks like an account with this email already exists.'
        );
      });
    });

    describe('#inviteShareAmount', () => {
      it('should return an empty string for a valid share amount', async () => {
        const result = await validateField('inviteShareAmount', '8');

        expect(result).to.be.a('string');
        expect(result).to.equal('');
      });
      it('should return an error for a non-number', async () => {
        const result = await validateField('inviteShareAmount', 'yikes');

        expect(result).to.be.a('string');
        expect(result).to.equal('Must be a number');
      });
      it('should return an error for a share amount over 10', async () => {
        const result = await validateField('inviteShareAmount', '11');

        expect(result).to.be.a('string');
        expect(result).to.equal('Max number of shares is 10');
      });
      it('should return an error for a share amount under 1', async () => {
        const result = await validateField('inviteShareAmount', '0');

        expect(result).to.be.a('string');
        expect(result).to.equal('Min number of shares is 1');
      });
    });

    describe('#updateState', () => {
      it('should return an empty string for California', async () => {
        const result = await validateField('updateState', 'CA');

        expect(result).to.be.a('string');
        expect(result).to.equal('');
      });
      it('should return an error for not a state', async () => {
        const result = await validateField('updateState', 'NT');

        expect(result).to.be.a('string');
        expect(result).to.equal('Invalid state');
      });
    });

    describe('#updateZipcode', () => {
      it('should return an empty string for a valid zip code', async () => {
        const result = await validateField('updateZipcode', '94612');

        expect(result).to.be.a('string');
        expect(result).to.equal('');
      });
      it('should return an error for a number that is not 5 digits', async () => {
        const result = await validateField('updateZipcode', '946123');

        expect(result).to.be.a('string');
        expect(result).to.equal('Must be 5 digits');
      });
    });
  });

  describe('#removeOwner', () => {
    const owner = {
      id: 5,
      projectGroupId: 0
    };
    const loggedInOwner = { id: 365 };
    const projectGroup = {
      id: 0,
      ownerIds: [1, 2, 3, 4, 5]
    };

    beforeEach(() => {
      sandbox.stub(request, 'getProjectGroupById').returns(projectGroup);
      sandbox.stub(request, 'updateProjectGroup');
      sandbox.stub(userData, 'refreshUserData');
      sandbox.stub(store, 'getState').returns({ userData: loggedInOwner });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should succesfully remove an owner from a project group', async () => {
      await removeOwner(owner);

      expect(request.updateProjectGroup.getCall(0).args[0]).to.equal(0);
      expect(
        JSON.stringify(request.updateProjectGroup.getCall(0).args[1].ownerIds)
      ).to.equal(JSON.stringify([1, 2, 3, 4]));
      expect(userData.refreshUserData.getCall(0).args[0]).to.equal(365);
    });
  });

  describe('#getOwnerRecordsForProjectGroup', () => {
    const owners = [
      { id: 0, onboardingStep: 0 },
      { id: 1, onboardingStep: -1 },
      { id: 2, onboardingStep: -1 }
    ];
    const projectGroup = {
      ownerIds: [0, 1, 2]
    };

    beforeEach(() => {
      sandbox.stub(request, 'getOwnersByIds').returns(owners);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should only get owners with onboardingStep of -1', async () => {
      const result = await getOwnerRecordsForProjectGroup(projectGroup);

      expect(JSON.stringify(result)).to.equal(
        JSON.stringify([
          { id: 1, onboardingStep: -1 },
          { id: 2, onboardingStep: -1 }
        ])
      );
    });
  });

  describe('#inviteMember', () => {
    // TODO OP-24: make stock test objects for each object to use in places like this
    const pledgeInvite = { foo: 'bar' };

    beforeEach(() => {
      sandbox.stub(request, 'createPledgeInvite');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should create a pledge invite object', async () => {
      await inviteMember(pledgeInvite);

      expect(request.createPledgeInvite.getCall(0).args[0]).to.equal(
        pledgeInvite
      );
    });
  });

  describe('#triggerEmail', () => {
    // TODO OP-24: create dummy object for this
    const pledgeInvite = { foo: 'bar' };

    beforeEach(() => {
      fetchMock.mock('end:/invite', pledgeInvite);
    });

    afterEach(() => {
      fetchMock.restore();
    });

    it('should successfully trigger emails to the right URL', async () => {
      const response = await triggerEmail(0);

      expect(JSON.stringify(response)).to.equal(JSON.stringify(pledgeInvite));
    });
    it('should return an error if the email fails', async () => {
      fetchMock.mock('end:/invite', 400, { overwriteRoutes: true });

      const response = await triggerEmail(0);

      expect(response).to.equal('error');
    });
  });
});
